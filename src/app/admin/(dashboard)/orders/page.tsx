import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatLKR } from "@/lib/format";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gold-light/40 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-soft text-ink-soft">
            <tr>
              <th className="px-4 py-3">Order No.</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
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
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3">{formatLKR(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[order.status]}`}>
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
    </div>
  );
}
