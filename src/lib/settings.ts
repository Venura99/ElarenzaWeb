import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export const DELIVERY_FEE_KEY = "delivery_fee";
const DEFAULT_DELIVERY_FEE = 450;

export async function getDeliveryFee(): Promise<number> {
  const row = await db.query.settings.findFirst({
    where: eq(schema.settings.key, DELIVERY_FEE_KEY),
  });

  if (!row) return DEFAULT_DELIVERY_FEE;

  const parsed = Number(row.value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DELIVERY_FEE;
}

export async function setDeliveryFee(amount: number) {
  const value = String(amount);
  await db
    .insert(schema.settings)
    .values({ key: DELIVERY_FEE_KEY, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}
