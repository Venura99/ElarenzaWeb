import { getDeliveryFee } from "@/lib/settings";
import DeliveryFeeForm from "@/components/admin/DeliveryFeeForm";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const deliveryFee = await getDeliveryFee();

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Settings</h1>
      <div className="mt-6 max-w-xl">
        <DeliveryFeeForm currentFee={deliveryFee} />
      </div>
    </div>
  );
}
