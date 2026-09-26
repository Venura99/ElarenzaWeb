"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId, now } from "@/db/helpers";
import { saveUploadedImages, deleteStoredImage } from "@/lib/image-storage";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = slugify(base) || "product";
  let suffix = 1;
  while (
    await db.query.products.findFirst({
      where: ignoreId
        ? and(eq(schema.products.slug, slug), ne(schema.products.id, ignoreId))
        : eq(schema.products.slug, slug),
    })
  ) {
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }
  return slug;
}

type VariantInput = { type: "DECANT" | "FULL_BOTTLE"; sizeMl: number; price: number; stock: number };

function parseVariants(json: string): VariantInput[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => ({
        type: (v.type === "FULL_BOTTLE" ? "FULL_BOTTLE" : "DECANT") as "DECANT" | "FULL_BOTTLE",
        sizeMl: Number(v.sizeMl),
        price: Number(v.price),
        stock: Number(v.stock),
      }))
      .filter((v) => v.sizeMl > 0 && v.price >= 0 && Number.isFinite(v.stock));
  } catch {
    return [];
  }
}

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const gender = String(formData.get("gender") ?? "UNISEX");
  const concentration = String(formData.get("concentration") ?? "Eau de Parfum");
  const topNotes = String(formData.get("topNotes") ?? "");
  const middleNotes = String(formData.get("middleNotes") ?? "");
  const baseNotes = String(formData.get("baseNotes") ?? "");
  const featured = formData.get("featured") === "on";
  const isActive = formData.get("isActive") === "on";
  const variants = parseVariants(String(formData.get("variantsJson") ?? "[]"));
  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File);

  if (!name || !brand || !description || variants.length === 0) {
    throw new Error("Name, brand, description and at least one variant are required.");
  }

  const slug = await uniqueSlug(name);
  const uploadedImages = await saveUploadedImages(imageFiles);

  const productId = newId();
  const timestamp = now();

  await db.insert(schema.products).values({
    id: productId,
    slug,
    name,
    brand,
    description,
    gender,
    concentration,
    topNotes,
    middleNotes,
    baseNotes,
    featured,
    isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  if (uploadedImages.length > 0) {
    await db.insert(schema.productImages).values(
      uploadedImages.map((img, i) => ({
        id: newId(),
        url: img.url,
        publicId: img.publicId,
        position: i,
        productId,
      }))
    );
  }

  await db.insert(schema.productVariants).values(
    variants.map((v) => ({ id: newId(), ...v, productId }))
  );

  const product = { id: productId };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProductAction(productId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const gender = String(formData.get("gender") ?? "UNISEX");
  const concentration = String(formData.get("concentration") ?? "Eau de Parfum");
  const topNotes = String(formData.get("topNotes") ?? "");
  const middleNotes = String(formData.get("middleNotes") ?? "");
  const baseNotes = String(formData.get("baseNotes") ?? "");
  const featured = formData.get("featured") === "on";
  const isActive = formData.get("isActive") === "on";
  const variants = parseVariants(String(formData.get("variantsJson") ?? "[]"));
  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File);
  const removedImageIds = String(formData.get("removedImageIds") ?? "")
    .split(",")
    .filter(Boolean);

  if (!name || !brand || !description || variants.length === 0) {
    throw new Error("Name, brand, description and at least one variant are required.");
  }

  const existing = await db.query.products.findFirst({
    where: eq(schema.products.id, productId),
    with: { images: true },
  });
  if (!existing) throw new Error("Product not found.");

  const slug = existing.name === name ? existing.slug : await uniqueSlug(name, productId);
  const uploadedImages = await saveUploadedImages(imageFiles);

  if (removedImageIds.length > 0) {
    const toRemove = existing.images.filter((img) => removedImageIds.includes(img.id));
    await db
      .delete(schema.productImages)
      .where(inArray(schema.productImages.id, removedImageIds));
    for (const img of toRemove) {
      await deleteStoredImage(img);
    }
  }

  const maxPosition = existing.images.length;

  await db
    .update(schema.products)
    .set({
      slug,
      name,
      brand,
      description,
      gender,
      concentration,
      topNotes,
      middleNotes,
      baseNotes,
      featured,
      isActive,
      updatedAt: now(),
    })
    .where(eq(schema.products.id, productId));

  if (uploadedImages.length > 0) {
    await db.insert(schema.productImages).values(
      uploadedImages.map((img, i) => ({
        id: newId(),
        url: img.url,
        publicId: img.publicId,
        position: maxPosition + i,
        productId,
      }))
    );
  }

  // Variants are replaced wholesale, matching the form's edit semantics.
  await db.batch([
    db.delete(schema.productVariants).where(eq(schema.productVariants.productId, productId)),
    db.insert(schema.productVariants).values(
      variants.map((v) => ({ id: newId(), ...v, productId }))
    ),
  ]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/");
}

export async function deleteProductAction(productId: string) {
  const product = await db.query.products.findFirst({
    where: eq(schema.products.id, productId),
    with: { images: true },
  });
  if (!product) return;

  await db.batch([
    db.delete(schema.productImages).where(eq(schema.productImages.productId, productId)),
    db.delete(schema.productVariants).where(eq(schema.productVariants.productId, productId)),
    db.delete(schema.products).where(eq(schema.products.id, productId)),
  ]);

  for (const img of product.images) {
    await deleteStoredImage(img);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}
