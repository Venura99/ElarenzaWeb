import { and, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { brandSlug, toProductCards, type Collection } from "@/lib/collections";

/** Catalogue queries backing the collection and brand landing pages. */

export async function getCollectionProducts(collection: Collection) {
  const filters = [eq(schema.products.isActive, true)];

  if (collection.kind === "gender") {
    filters.push(eq(schema.products.gender, collection.value));
  } else {
    // "Has at least one variant of this type" — resolved as a subquery rather
    // than by loading the whole catalogue and filtering it in memory.
    const rows = await db
      .selectDistinct({ productId: schema.productVariants.productId })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.type, collection.value));

    const ids = rows.map((row) => row.productId);
    if (ids.length === 0) return [];
    filters.push(inArray(schema.products.id, ids));
  }

  const products = await db.query.products.findMany({
    where: and(...filters),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
      variants: true,
    },
    orderBy: [desc(schema.products.createdAt)],
  });

  return toProductCards(products);
}

/** Distinct brands that currently have at least one active product. */
export async function getBrands(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ brand: schema.products.brand })
    .from(schema.products)
    .where(eq(schema.products.isActive, true));

  return rows
    .map((row) => row.brand)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getBrandBySlug(slug: string): Promise<string | undefined> {
  const brands = await getBrands();
  return brands.find((brand) => brandSlug(brand) === slug);
}

export async function getBrandProducts(brand: string) {
  const products = await db.query.products.findMany({
    where: and(eq(schema.products.isActive, true), eq(schema.products.brand, brand)),
    with: {
      images: { orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
      variants: true,
    },
    orderBy: [desc(schema.products.createdAt)],
  });

  return toProductCards(products);
}
