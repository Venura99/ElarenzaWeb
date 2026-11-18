/**
 * Shows at a glance whether card payments are live or still pointed at the
 * sandbox.
 *
 * The switch lives in Cloudflare's runtime variables, not in the code, so
 * without this there is nothing in the app that says which mode is in force —
 * and a shop sitting in sandbox mode still shows customers a "pay online"
 * button that cannot take their money.
 */
export default function PayzyStatus({
  configured,
  testMode,
  shopId,
}: {
  configured: boolean;
  testMode: boolean;
  shopId: string | null;
}) {
  if (!configured) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-serif text-xl text-ink">Card Payments</h2>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-800">
          Not configured
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          PAYZY_SHOP_ID and PAYZY_SHOP_KEY are not set, so the online payment
          option is hidden at checkout and customers can only pay cash on
          delivery.
        </p>
      </div>
    );
  }

  if (testMode) {
    return (
      <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6">
        <h2 className="font-serif text-xl text-ink">Card Payments</h2>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-900">
          Sandbox — not taking real money
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Checkout is pointed at Payzy&apos;s test gateway
          (api.payzypay.xyz){shopId ? ` using shop ${shopId}` : ""}. Customers
          who choose &ldquo;pay online&rdquo; are sent to a sandbox page and
          cannot complete a real payment.
        </p>
        <p className="mt-3 text-sm font-medium text-ink">
          To go live, set <code className="rounded bg-white px-1">PAYZY_TEST_MODE</code>{" "}
          to <code className="rounded bg-white px-1">off</code> in the Cloudflare
          runtime variables, along with your production shop id and key, then
          redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-300 bg-green-50 p-6">
      <h2 className="font-serif text-xl text-ink">Card Payments</h2>
      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-900">
        Live
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        Checkout is pointed at Payzy&apos;s production gateway (api.payzy.lk)
        {shopId ? ` using shop ${shopId}` : ""}. Card payments take real money.
      </p>
    </div>
  );
}
