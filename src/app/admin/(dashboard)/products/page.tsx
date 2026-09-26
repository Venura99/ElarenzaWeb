import Link from "next/link";
import Image from "next/image";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatLKR } from "@/lib/format";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.query.products.findMany({
    orderBy: [desc(schema.products.createdAt)],
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
      variants: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold uppercase tracking-wide text-cream hover:bg-gold-dark"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gold-light/40 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-soft text-ink-soft">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  No products yet. Add your first one.
                </td>
              </tr>
            )}
            {products.map((product) => {
              const minPrice = product.variants.length
                ? Math.min(...product.variants.map((v) => v.price))
                : null;
              return (
                <tr key={product.id} className="border-t border-gold-light/30">
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-cream-soft">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                  <td className="px-4 py-3">{product.brand}</td>
                  <td className="px-4 py-3">{minPrice !== null ? formatLKR(minPrice) : "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.isActive ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-gold-dark hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
