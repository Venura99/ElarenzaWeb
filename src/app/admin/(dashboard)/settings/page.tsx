import { getDeliveryFee, getPayzyFeePercent } from "@/lib/settings";
import { isPayzyTestMode, payzyConfigured } from "@/lib/payzy";
import DeliveryFeeForm from "@/components/admin/DeliveryFeeForm";
import PayzyFeeForm from "@/components/admin/PayzyFeeForm";
import PayzyStatus from "@/components/admin/PayzyStatus";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [deliveryFee, payzyFeePercent] = await Promise.all([
    getDeliveryFee(),
    getPayzyFeePercent(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Settings</h1>
      <div className="mt-6 max-w-xl space-y-6">
        <PayzyStatus
          configured={payzyConfigured()}
          testMode={isPayzyTestMode()}
          shopId={process.env.PAYZY_SHOP_ID ?? null}
        />
        <DeliveryFeeForm currentFee={deliveryFee} />
        <PayzyFeeForm currentPercent={payzyFeePercent} />
      </div>
    </div>
  );
}
