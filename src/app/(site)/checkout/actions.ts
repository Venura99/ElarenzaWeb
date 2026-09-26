"use server";

import { count, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId, now } from "@/db/helpers";

type CartItemInput = {
  variantId: string;
  quantity: number;
};

export type PlaceOrderResult =
  | { success: true; orderNumber: string }
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
  const itemsRaw = String(formData.get("itemsJson") ?? "[]");

  if (!customerName || !phone || !address || !city || !district) {
    return { success: false, error: "Please fill in all required fields." };
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
      totalAmount,
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

  return { success: true, orderNumber };
}
