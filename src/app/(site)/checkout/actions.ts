"use server";

import { count, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId, now } from "@/db/helpers";
import {
  getDeliveryFee,
  getPayzyFeePercent,
  calculatePayzyFee,
} from "@/lib/settings";
import {
  buildPayzyFields,
  createPayzyCheckout,
  isPayzyTestMode,
  payzyConfigured,
} from "@/lib/payzy";
import { BUSINESS } from "@/lib/constants";

type CartItemInput = {
  variantId: string;
  quantity: number;
};

export type PlaceOrderResult =
  | { success: true; orderNumber: string; redirectUrl?: string }
  | { success: false; error: string };

async function generateOrderNumber() {
  const [{ value: orderCount }] = await db
    .select({ value: count() })
    .from(schema.orders);
  const candidate = `ELZ-${String(orderCount + 1).padStart(5, "0")}`;
  const exists = await db.query.orders.findFirst({
    where: eq(schema.orders.orderNumber, candidate),
  });
  return exists ? `ELZ-${Date.now()}` : candidate;
}

export async function placeOrderAction(formData: FormData): Promise<PlaceOrderResult> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const itemsRaw = String(formData.get("itemsJson") ?? "[]");
  const paymentMethod = String(formData.get("paymentMethod") ?? "COD") === "CARD" ? "CARD" : "COD";

  if (!customerName || !phone || !address || !city || !district) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (paymentMethod === "CARD") {
    if (!payzyConfigured()) {
      return { success: false, error: "Online payment is unavailable right now. Please choose cash on delivery." };
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address for the payment receipt." };
    }
  }

  let cartItems: CartItemInput[];
  try {
    cartItems = JSON.parse(itemsRaw);
  } catch {
    return { success: false, error: "Invalid cart data." };
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const variantIds = cartItems.map((i) => i.variantId);
  const variants = await db.query.productVariants.findMany({
    where: inArray(schema.productVariants.id, variantIds),
    with: { product: true },
  });

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cartItems) {
    const variant = variants.find((v) => v.id === cartItem.variantId);
    if (!variant || !variant.product.isActive) {
      return { success: false, error: "One of the items in your cart is no longer available." };
    }
    const quantity = Math.max(1, Math.floor(Number(cartItem.quantity) || 1));
    if (variant.stock < quantity) {
      return {
        success: false,
        error: `Not enough stock for ${variant.product.name}. Only ${variant.stock} left.`,
      };
    }
    const lineTotal = variant.price * quantity;
    totalAmount += lineTotal;
    orderItems.push({
      productName: variant.product.name,
      variantLabel: `${variant.sizeMl}ml ${variant.type === "DECANT" ? "Decant" : "Full Bottle"}`,
      unitPrice: variant.price,
      quantity,
      lineTotal,
      variantId: variant.id,
    });
  }

  // Read server-side rather than trusting anything the browser submitted.
  const deliveryFee = await getDeliveryFee();
  const payableBeforeFee = totalAmount + deliveryFee;

  // The gateway takes its cut of the whole transaction, so the fee is charged
  // on the delivery too — and only on card orders.
  const paymentFee =
    paymentMethod === "CARD"
      ? calculatePayzyFee(payableBeforeFee, await getPayzyFeePercent())
      : 0;

  const grandTotal = payableBeforeFee + paymentFee;

  const orderNumber = await generateOrderNumber();

  const orderId = newId();
  const timestamp = now();

  // batch() is applied atomically by libSQL, so the order, its line items and
  // the stock decrements cannot land partially.
  await db.batch([
    db.insert(schema.orders).values({
      id: orderId,
      orderNumber,
      customerName,
      phone,
      address,
      city,
      district,
      notes,
      status: "PENDING",
      deliveryFee,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: "PENDING",
      paymentFee,
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    db.insert(schema.orderItems).values(
      orderItems.map((item) => ({
        id: newId(),
        orderId,
        productName: item.productName,
        variantLabel: item.variantLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      }))
    ),
    ...orderItems.map((item) =>
      db
        .update(schema.productVariants)
        .set({ stock: sql`${schema.productVariants.stock} - ${item.quantity}` })
        .where(eq(schema.productVariants.id, item.variantId))
    ),
  ] as const);

  if (paymentMethod !== "CARD") {
    return { success: true, orderNumber };
  }

  const [firstName, ...restName] = customerName.split(" ");

  // The amount is taken from grandTotal, which was computed here from database
  // prices — never from anything the browser submitted.
  const fields = buildPayzyFields({
    orderId: orderNumber,
    amount: grandTotal,
    responseUrl: `${BUSINESS.siteUrl}/api/payments/payzy/return`,
    firstName: firstName || customerName,
    lastName: restName.join(" ") || "-",
    address,
    city,
    district,
    phone,
    email,
  });

  try {
    const redirectUrl = await createPayzyCheckout(fields);

    // Stored so the returned signature can be recomputed over the exact values
    // that were signed.
    await db
      .update(schema.orders)
      .set({ paymentPayload: JSON.stringify(fields), updatedAt: now() })
      .where(eq(schema.orders.id, orderId));

    return { success: true, orderNumber, redirectUrl };
  } catch (error) {
    // Previously swallowed entirely, which left a gateway failure with no
    // trace anywhere — not in the logs, not on the order. The customer still
    // only sees the generic message below; this is for Cloudflare's
    // Observability tail, and names the mode so a credentials/host mismatch
    // is obvious at a glance.
    console.error("[payzy] checkout session failed", {
      orderNumber,
      shopId: process.env.PAYZY_SHOP_ID ?? "(unset)",
      mode: isPayzyTestMode() ? "sandbox" : "live",
      amount: grandTotal,
      reason: error instanceof Error ? error.message : String(error),
    });

    await db
      .update(schema.orders)
      .set({ paymentStatus: "FAILED", updatedAt: now() })
      .where(eq(schema.orders.id, orderId));

    return {
      success: false,
      error:
        "We couldn't start the card payment, so nothing has been charged. Please try again, or choose cash on delivery.",
    };
  }
}
