import type { ProductCardData } from "@/components/site/ProductCard";

/**
 * Landing pages for the ways people actually search.
 *
 * /shop's gender tabs and search box are query strings, and /shop canonicalises
 * them away, so none of those views can rank. These are real URLs with their
 * own copy and their own title, aimed at searches like "perfume for him Sri
 * Lanka" that the catalogue page itself will never win.
 *
 * This module deliberately holds no database imports so that layout chrome
 * (the footer links to every collection) can read it without pulling the
 * data layer into its module graph. Queries live in src/lib/catalog.ts.
 */
export type Collection = {
  slug: string;
  name: string;
  heading: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  kind: "gender" | "variantType";
  value: string;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "for-him",
    name: "For Him",
    heading: "Perfumes For Him",
    metaTitle: "Men's Perfumes & Decants in Sri Lanka",
    metaDescription:
      "Men's designer and niche fragrances in Sri Lanka, available as affordable decants or full bottles. Try before you commit, with islandwide delivery.",
    intro:
      "Bold, fresh and woody fragrances chosen for men. Every scent here is available as a small decant, so you can wear it for a week before deciding on a full bottle.",
    kind: "gender",
    value: "MALE",
  },
  {
    slug: "for-her",
    name: "For Her",
    heading: "Perfumes For Her",
    metaTitle: "Women's Perfumes & Decants in Sri Lanka",
    metaDescription:
      "Women's designer and niche fragrances in Sri Lanka, available as affordable decants or full bottles. Find your signature scent with islandwide delivery.",
    intro:
      "Floral, sweet and oriental fragrances chosen for women. Start with a decant to find the one that suits you, then come back for the full bottle.",
    kind: "gender",
    value: "FEMALE",
  },
  {
    slug: "unisex",
    name: "Unisex",
    heading: "Unisex Perfumes",
    metaTitle: "Unisex Perfumes & Decants in Sri Lanka",
    metaDescription:
      "Unisex fragrances in Sri Lanka, available as decants or full bottles. Shared scents that work on anyone, delivered islandwide.",
    intro:
      "Fragrances that were never meant for one person in particular. Share them, or keep them to yourself.",
    kind: "gender",
    value: "UNISEX",
  },
  {
    slug: "decants",
    name: "Decants",
    heading: "Perfume Decants",
    metaTitle: "Perfume Decants in Sri Lanka | Try Before You Buy",
    metaDescription:
      "Authentic perfume decants in Sri Lanka from 3ml. Transferred by hand from genuine full bottles so you can try luxury fragrances without buying a whole bottle.",
    intro:
      "A decant is a smaller amount of an authentic fragrance, transferred by us from a genuine full bottle into a clean travel atomiser. It is the cheapest honest way to find out whether a scent suits you before spending on a full bottle.",
    kind: "variantType",
    value: "DECANT",
  },
  {
    slug: "full-bottles",
    name: "Full Bottles",
    heading: "Full Bottles",
    metaTitle: "Original Full Bottle Perfumes in Sri Lanka",
    metaDescription:
      "Original sealed full bottle perfumes in Sri Lanka — designer and niche fragrances delivered islandwide, with cash on delivery available.",
    intro:
      "Found the one? These are complete bottles in their original packaging, for the scents you already know you want to live with.",
    kind: "variantType",
    value: "FULL_BOTTLE",
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function brandSlug(brand: string): string {
  return brand
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toProductCards(
  products: {
    slug: string;
    name: string;
    brand: string;
    gender: string;
    images: { url: string }[];
    variants: { price: number }[];
  }[]
): ProductCardData[] {
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    gender: product.gender as ProductCardData["gender"],
    imageUrl: product.images[0]?.url ?? null,
    minPrice: product.variants.length
      ? Math.min(...product.variants.map((v) => v.price))
      : null,
  }));
}
