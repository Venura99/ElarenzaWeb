require("dotenv").config();
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");

// Mirrors src/lib/prisma.ts so this script seeds whichever database the app
// is actually configured to use (Turso when set, otherwise the local file).
const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, "dev.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});
const prisma = new PrismaClient({ adapter });

function slugify(input) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

const PRODUCTS = [
  {
    name: "Velvet Oud",
    brand: "Elarenza Reserve",
    description:
      "A rich, smoky oud fragrance layered with amber and warm spice — bold and unforgettable.",
    gender: "UNISEX",
    concentration: "Eau de Parfum",
    topNotes: "Saffron, Cardamom",
    middleNotes: "Oud, Rose",
    baseNotes: "Amber, Musk",
    featured: true,
    variants: [
      { type: "DECANT", sizeMl: 5, price: 2500, stock: 25 },
      { type: "DECANT", sizeMl: 10, price: 4500, stock: 20 },
      { type: "FULL_BOTTLE", sizeMl: 100, price: 32000, stock: 5 },
    ],
  },
  {
    name: "Bloom Whisper",
    brand: "Elarenza Garden",
    description:
      "A soft floral bouquet of peony and jasmine with a delicate musk finish, perfect for everyday elegance.",
    gender: "FEMALE",
    concentration: "Eau de Parfum",
    topNotes: "Peony, Bergamot",
    middleNotes: "Jasmine, Lily",
    baseNotes: "White Musk",
    featured: true,
    variants: [
      { type: "DECANT", sizeMl: 5, price: 2000, stock: 30 },
      { type: "DECANT", sizeMl: 10, price: 3600, stock: 25 },
      { type: "FULL_BOTTLE", sizeMl: 50, price: 18500, stock: 8 },
    ],
  },
  {
    name: "Midnight Voyage",
    brand: "Elarenza Homme",
    description:
      "A confident, woody-aromatic scent with citrus top notes and a deep vetiver base — built for the modern man.",
    gender: "MALE",
    concentration: "Eau de Toilette",
    topNotes: "Bergamot, Pepper",
    middleNotes: "Lavender, Geranium",
    baseNotes: "Vetiver, Cedarwood",
    featured: true,
    variants: [
      { type: "DECANT", sizeMl: 5, price: 1800, stock: 30 },
      { type: "DECANT", sizeMl: 10, price: 3200, stock: 25 },
      { type: "FULL_BOTTLE", sizeMl: 100, price: 22000, stock: 6 },
    ],
  },
  {
    name: "Golden Amber",
    brand: "Elarenza Reserve",
    description:
      "Warm and inviting, with honeyed amber wrapped in soft vanilla and a hint of citrus zest.",
    gender: "UNISEX",
    concentration: "Eau de Parfum",
    topNotes: "Orange Zest",
    middleNotes: "Amber, Cinnamon",
    baseNotes: "Vanilla, Sandalwood",
    featured: false,
    variants: [
      { type: "DECANT", sizeMl: 5, price: 2200, stock: 20 },
      { type: "DECANT", sizeMl: 10, price: 4000, stock: 15 },
    ],
  },
  {
    name: "Citrus Veil",
    brand: "Elarenza Fresh",
    description:
      "A crisp, energizing blend of citrus and green tea, designed for effortless all-day freshness.",
    gender: "UNISEX",
    concentration: "Eau de Toilette",
    topNotes: "Lemon, Grapefruit",
    middleNotes: "Green Tea",
    baseNotes: "Light Musk",
    featured: false,
    variants: [
      { type: "DECANT", sizeMl: 5, price: 1500, stock: 40 },
      { type: "DECANT", sizeMl: 10, price: 2700, stock: 30 },
      { type: "FULL_BOTTLE", sizeMl: 100, price: 16000, stock: 10 },
    ],
  },
  {
    name: "Rose Noir",
    brand: "Elarenza Garden",
    description:
      "A dark, seductive rose fragrance deepened with patchouli and dark chocolate accents.",
    gender: "FEMALE",
    concentration: "Eau de Parfum",
    topNotes: "Black Currant",
    middleNotes: "Rose, Patchouli",
    baseNotes: "Dark Chocolate, Musk",
    featured: true,
    variants: [
      { type: "DECANT", sizeMl: 5, price: 2400, stock: 22 },
      { type: "DECANT", sizeMl: 10, price: 4300, stock: 18 },
      { type: "FULL_BOTTLE", sizeMl: 50, price: 19500, stock: 7 },
    ],
  },
];

async function main() {
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) {
      console.log(`Skipping existing product: ${p.name}`);
      continue;
    }
    await prisma.product.create({
      data: {
        slug,
        name: p.name,
        brand: p.brand,
        description: p.description,
        gender: p.gender,
        concentration: p.concentration,
        topNotes: p.topNotes,
        middleNotes: p.middleNotes,
        baseNotes: p.baseNotes,
        featured: p.featured,
        isActive: true,
        variants: { create: p.variants },
      },
    });
    console.log(`Created: ${p.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
