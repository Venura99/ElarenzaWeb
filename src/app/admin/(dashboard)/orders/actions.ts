"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { now } from "@/db/helpers";

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new Error("Invalid status.");
  }

  await db
    .update(schema.orders)
    .set({ status, updatedAt: now() })
    .where(eq(schema.orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
