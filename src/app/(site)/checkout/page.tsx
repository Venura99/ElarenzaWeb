import { getDeliveryFee } from "@/lib/settings";
import CheckoutClient from "./CheckoutClient";

// The delivery charge is read per request so a change in the admin panel
// applies to the next checkout immediately.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const deliveryFee = await getDeliveryFee();
  return <CheckoutClient deliveryFee={deliveryFee} />;
}
