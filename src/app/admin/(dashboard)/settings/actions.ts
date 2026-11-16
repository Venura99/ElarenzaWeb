"use server";

import { revalidatePath } from "next/cache";
import { setDeliveryFee, setPayzyFeePercent } from "@/lib/settings";

export type SettingsState = { error: string | null; saved: boolean };

export async function updateDeliveryFeeAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const raw = String(formData.get("deliveryFee") ?? "").trim();
  const amount = Number(raw);

  if (raw === "" || !Number.isFinite(amount)) {
    return { error: "Enter the delivery charge as a number.", saved: false };
  }

  if (amount < 0) {
    return { error: "Delivery charge cannot be negative.", saved: false };
  }

  if (amount > 100000) {
    return { error: "That delivery charge looks too high — please check it.", saved: false };
  }

  await setDeliveryFee(amount);

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/cart");

  return { error: null, saved: true };
}

export async function updatePayzyFeeAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const raw = String(formData.get("payzyFeePercent") ?? "").trim();
  const percent = Number(raw);

  if (raw === "" || !Number.isFinite(percent)) {
    return { error: "Enter the fee as a percentage.", saved: false };
  }

  if (percent < 0 || percent > 100) {
    return { error: "The fee must be between 0 and 100 percent.", saved: false };
  }

  await setPayzyFeePercent(percent);

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return { error: null, saved: true };
}
