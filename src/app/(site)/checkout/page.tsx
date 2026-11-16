import { getDeliveryFee, getPayzyFeePercent } from "@/lib/settings";
import { payzyConfigured } from "@/lib/payzy";
import CheckoutClient from "./CheckoutClient";

// The delivery charge is read per request so a change in the admin panel
// applies to the next checkout immediately.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [deliveryFee, payzyFeePercent] = await Promise.all([
    getDeliveryFee(),
    getPayzyFeePercent(),
  ]);

  return (
    <CheckoutClient
      deliveryFee={deliveryFee}
      onlinePaymentAvailable={payzyConfigured()}
      payzyFeePercent={payzyFeePercent}
    />
  );
}
