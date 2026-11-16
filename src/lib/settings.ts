import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export const DELIVERY_FEE_KEY = "delivery_fee";
export const PAYZY_FEE_PERCENT_KEY = "payzy_fee_percent";

const DEFAULT_DELIVERY_FEE = 450;
const DEFAULT_PAYZY_FEE_PERCENT = 9;

async function readNumber(key: string, fallback: number, max: number) {
  const row = await db.query.settings.findFirst({
    where: eq(schema.settings.key, key),
  });
  if (!row) return fallback;

  const parsed = Number(row.value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : fallback;
}

async function writeValue(key: string, value: string) {
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

export async function getDeliveryFee(): Promise<number> {
  return readNumber(DELIVERY_FEE_KEY, DEFAULT_DELIVERY_FEE, 100000);
}

export async function setDeliveryFee(amount: number) {
  await writeValue(DELIVERY_FEE_KEY, String(amount));
}

/** Percentage Payzy charges, added to card orders. Configurable so a change
 *  in their rate doesn't need a code deploy. */
export async function getPayzyFeePercent(): Promise<number> {
  return readNumber(PAYZY_FEE_PERCENT_KEY, DEFAULT_PAYZY_FEE_PERCENT, 100);
}

export async function setPayzyFeePercent(percent: number) {
  await writeValue(PAYZY_FEE_PERCENT_KEY, String(percent));
}

/** Rounded to whole rupees because that is the unit Payzy is charged in. */
export function calculatePayzyFee(amount: number, percent: number): number {
  return Math.round((amount * percent) / 100);
}
