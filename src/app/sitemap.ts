import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { BUSINESS } from "@/lib/constants";

// Product rows are read per request: on Workers there is no database
// connection at build time, so this cannot be generated statically.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BUSINESS.siteUrl.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/feedback`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await db.query.products.findMany({
      where: eq(schema.products.isActive, true),
      columns: { slug: true, updatedAt: true },
    });
  } catch {
    // A sitemap listing only the static pages is far better than a 500 that
    // makes search engines drop the file altogether.
    return staticRoutes;
  }

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${base}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
