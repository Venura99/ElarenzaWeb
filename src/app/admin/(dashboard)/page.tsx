import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatLKR } from "@/lib/format";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productRows, pendingOrderRows, pendingFeedbackRows, orders] = await Promise.all([
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
  ]);

  const productCount = productRows[0]?.value ?? 0;
  const pendingOrders = pendingOrderRows[0]?.value ?? 0;
  const pendingFeedback = pendingFeedbackRows[0]?.value ?? 0;

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders" },
    { label: "Feedback to Review", value: pendingFeedback, href: "/admin/feedback" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-gold-light/50 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm uppercase tracking-wide text-ink-soft">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-4xl text-gold-dark">{stat.value}</p>
          </Link>
        ))}
      </div>

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
