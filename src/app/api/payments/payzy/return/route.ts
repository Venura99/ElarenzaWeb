import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { now } from "@/db/helpers";
import {
  verifyPayzyReturn,
  PAYZY_SUCCESS_CODE,
  type PayzyFields,
} from "@/lib/payzy";
import { BUSINESS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Where Payzy sends the customer after payment.
 *
 * Nothing in this request is trusted on its own: the signature is recomputed
 * from the values stored when the checkout was created, so a hand-crafted URL
 * cannot mark an order paid.
 */
async function handleReturn(params: URLSearchParams) {
  const orderNumber = params.get("x_order_id") ?? "";
  const responseCode = params.get("response_code") ?? "";
  const signature = params.get("signature") ?? "";

  const failed = (reason: string) =>
    NextResponse.redirect(
      `${BUSINESS.siteUrl}/order-confirmation/${encodeURIComponent(orderNumber)}?payment=${reason}`,
      { status: 303 }
    );

  if (!orderNumber || !signature) return failed("invalid");

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.orderNumber, orderNumber),
  });

  if (!order || !order.paymentPayload) return failed("invalid");

  // Already settled — don't reprocess, just show the result.
  if (order.paymentStatus === "PAID") return failed("success");

  let fields: PayzyFields;
  try {
    fields = JSON.parse(order.paymentPayload) as PayzyFields;
  } catch {
    return failed("invalid");
  }

  if (!verifyPayzyReturn(fields, responseCode, signature)) {
    // A bad signature means the callback didn't come from Payzy. Leave the
    // order pending rather than marking it failed, so a forged request can't
    // cancel a real customer's order.
    return failed("invalid");
  }

  if (responseCode !== PAYZY_SUCCESS_CODE) {
    await db
      .update(schema.orders)
      .set({ paymentStatus: "FAILED", updatedAt: now() })
      .where(eq(schema.orders.id, order.id));
    return failed("failed");
  }

  await db
    .update(schema.orders)
    .set({
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paymentReference: params.get("transaction_id") ?? orderNumber,
      paidAt: now(),
      updatedAt: now(),
    })
    .where(eq(schema.orders.id, order.id));

  return failed("success");
}

export async function GET(request: NextRequest) {
  return handleReturn(request.nextUrl.searchParams);
}

// Gateways vary between redirecting with a GET and POSTing the result back.
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    return handleReturn(new URLSearchParams(body));
  }
  const form = await request.formData();
  const params = new URLSearchParams();
  for (const [key, value] of form.entries()) params.set(key, String(value));
  return handleReturn(params);
}
