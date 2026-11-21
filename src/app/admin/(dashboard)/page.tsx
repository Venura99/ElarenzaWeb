import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatLKR, variantLabel } from "@/lib/format";
import { getLowStock, getRevenueSummary, getTopProducts } from "@/lib/revenue";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    productRows,
    pendingOrderRows,
    pendingFeedbackRows,
    orders,
    revenue,
    topProducts,
    lowStock,
  ] = await Promise.all([
    db.select({ value: count() }).from(schema.products),
    db
      .select({ value: count() })
      .from(schema.orders)
      .where(eq(schema.orders.status, "PENDING")),
    db
      .select({ value: count() })
      .from(schema.feedback)
      .where(eq(schema.feedback.isApproved, false)),
    db.query.orders.findMany({
      orderBy: [desc(schema.orders.createdAt)],
      limit: 5,
    }),
    getRevenueSummary(),
    getTopProducts(5),
    getLowStock(3, 6),
  ]);

  const productCount = productRows[0]?.value ?? 0;
  const pendingOrders = pendingOrderRows[0]?.value ?? 0;
  const pendingFeedback = pendingFeedbackRows[0]?.value ?? 0;

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders?status=PENDING" },
    { label: "Feedback to Review", value: pendingFeedback, href: "/admin/feedback" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>

      <section className="mt-6">
        <h2 className="eyebrow">Sales</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Today</p>
            <p className="mt-2 font-serif text-3xl text-ink">
              {formatLKR(revenue.today)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {revenue.todayOrders} {revenue.todayOrders === 1 ? "order" : "orders"}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
              This month
            </p>
            <p className="mt-2 font-serif text-3xl text-ink">
              {formatLKR(revenue.month)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {revenue.monthOrders} {revenue.monthOrders === 1 ? "order" : "orders"}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">All time</p>
            <p className="mt-2 font-serif text-3xl text-ink">
              {formatLKR(revenue.allTime)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {formatLKR(revenue.averageOrder)} average order
            </p>
          </div>
          <div className="rounded-lg border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
              Cash to collect
            </p>
            <p className="mt-2 font-serif text-3xl text-ink">
              {formatLKR(revenue.awaitingCash)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {formatLKR(revenue.paidOnline)} already paid by card
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Cancelled orders and failed card payments are excluded. Cash on
          delivery counts from when the order is placed.
        </p>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-line bg-paper p-6 transition hover:border-ink"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-4xl text-ink">{stat.value}</p>
          </Link>
        ))}
      </div>

      {(topProducts.length > 0 || lowStock.length > 0) && (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {topProducts.length > 0 && (
            <section className="rounded-lg border border-line bg-paper p-6">
              <h2 className="font-serif text-xl text-ink">Best sellers</h2>
              <ul className="mt-4 space-y-3">
                {topProducts.map((product) => (
                  <li
                    key={product.productName}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 truncate text-ink">{product.productName}</span>
                    <span className="shrink-0 text-ink-soft">
                      {product.quantity} sold ·{" "}
                      <span className="font-medium text-ink">
                        {formatLKR(product.revenue)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-lg border border-line bg-paper p-6">
            <h2 className="font-serif text-xl text-ink">Running low</h2>
            {lowStock.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">
                Nothing is down to its last few units.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {lowStock.map((item) => (
                  <li
                    key={`${item.productId}-${item.sizeMl}-${item.type}`}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <Link
                      href={`/admin/products/${item.productId}/edit`}
                      className="min-w-0 truncate text-ink hover:text-gold-dark hover:underline"
                    >
                      {item.productName}{" "}
                      <span className="text-ink-muted">
                        ({variantLabel(item.type as "DECANT" | "FULL_BOTTLE", item.sizeMl)})
                      </span>
                    </Link>
                    <span
                      className={`shrink-0 font-medium ${
                        item.stock === 0 ? "text-red-700" : "text-gold-dark"
                      }`}
                    >
                      {item.stock === 0 ? "Sold out" : `${item.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-gold-dark hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gold-light/40 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-soft text-ink-soft">
              <tr>
                <th className="px-4 py-3">Order No.</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gold-light/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-gold-dark hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{formatLKR(order.totalAmount)}</td>
                  <td className="px-4 py-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
