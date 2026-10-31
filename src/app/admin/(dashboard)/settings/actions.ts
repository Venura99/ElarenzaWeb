"use server";

import { revalidatePath } from "next/cache";
import { setDeliveryFee } from "@/lib/settings";

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
