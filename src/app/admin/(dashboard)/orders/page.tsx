import Link from "next/link";
import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatLKR } from "@/lib/format";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

const PAYMENT_STYLES: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PER_PAGE = 25;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }>;
}) {
  const { q, status, payment, page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const term = (q ?? "").trim();

  const filters: SQL[] = [];

  if (term) {
    // What you actually have to hand when a customer messages: the order
    // number they were given, their name, or the number they messaged from.
    // Spaces are stripped from the phone side so "077 123 4567" still matches.
    const like_ = `%${term}%`;
    const digits = term.replace(/\D/g, "");
    const match = or(
      like(schema.orders.orderNumber, like_),
      like(schema.orders.customerName, like_),
      like(schema.orders.phone, like_),
      ...(digits.length >= 3 ? [like(schema.orders.phone, `%${digits}%`)] : [])
    );
    if (match) filters.push(match);
  }

  if (status) filters.push(eq(schema.orders.status, status));
  if (payment === "PAID") filters.push(eq(schema.orders.paymentStatus, "PAID"));
  if (payment === "UNPAID") filters.push(eq(schema.orders.paymentStatus, "PENDING"));
  if (payment === "COD") filters.push(eq(schema.orders.paymentMethod, "COD"));

  const where = filters.length ? and(...filters) : undefined;

  // Counted separately so the page can say how many matched without loading
  // every row to find out.
  const [totalRows, orders] = await Promise.all([
    db.select({ value: count() }).from(schema.orders).where(where),
    db.query.orders.findMany({
      where,
      orderBy: [desc(schema.orders.createdAt)],
      with: { items: true },
      limit: PER_PAGE,
      offset: (currentPage - 1) * PER_PAGE,
    }),
  ]);

  const total = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = { q: term, status, payment, page: String(currentPage), ...overrides };
    for (const [key, value] of Object.entries(next)) {
      if (value && !(key === "page" && value === "1")) params.set(key, value);
    }
    const query = params.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl text-ink">Orders</h1>
        <p className="text-sm text-ink-soft">
          {total} {total === 1 ? "order" : "orders"}
          {term || status || payment ? " matching" : ""}
        </p>
      </div>

      <form action="/admin/orders" className="mt-6 flex flex-wrap gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        {payment && <input type="hidden" name="payment" value={payment} />}
        <input
          type="search"
          name="q"
          defaultValue={term}
          placeholder="Order number, name or phone"
          aria-label="Search orders"
          className="input max-w-xs"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {(term || status || payment) && (
          <Link href="/admin/orders" className="btn btn-outline">
            Clear
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const active = (status ?? "") === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={buildHref({ status: tab.value || undefined, page: "1" })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
        <span className="mx-1 w-px bg-line" aria-hidden="true" />
        {[
          { value: "PAID", label: "Paid" },
          { value: "UNPAID", label: "Awaiting payment" },
          { value: "COD", label: "Cash on delivery" },
        ].map((tab) => {
          const active = payment === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref({
                payment: active ? undefined : tab.value,
                page: "1",
              })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-gold-dark bg-gold-dark text-white"
                  : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-soft text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Order No.</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-soft">
                  {term || status || payment
                    ? "No orders match that search."
                    : "No orders yet."}
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line hover:bg-cream-soft/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-gold-dark hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 tabular-nums">{order.phone}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 tabular-nums">{formatLKR(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      PAYMENT_STYLES[order.paymentStatus] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.paymentMethod === "COD" ? "COD" : order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {order.createdAt.toLocaleDateString("en-LK", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-soft">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildHref({ page: String(currentPage - 1) })}
                className="btn btn-outline"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildHref({ page: String(currentPage + 1) })}
                className="btn btn-outline"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
