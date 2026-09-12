"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
    await prisma.product.findFirst({
      where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
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

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      brand,
      description,
      gender: gender as "MALE" | "FEMALE" | "UNISEX",
      concentration,
      topNotes,
      middleNotes,
      baseNotes,
      featured,
      isActive,
      images: {
        create: uploadedImages.map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          position: i,
        })),
      },
      variants: { create: variants },
    },
  });

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

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });
  if (!existing) throw new Error("Product not found.");

  const slug = existing.name === name ? existing.slug : await uniqueSlug(name, productId);
  const uploadedImages = await saveUploadedImages(imageFiles);

  if (removedImageIds.length > 0) {
    const toRemove = existing.images.filter((img) => removedImageIds.includes(img.id));
    await prisma.productImage.deleteMany({ where: { id: { in: removedImageIds } } });
    for (const img of toRemove) {
      await deleteStoredImage(img);
    }
  }

  const maxPosition = existing.images.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      slug,
      name,
      brand,
      description,
      gender: gender as "MALE" | "FEMALE" | "UNISEX",
      concentration,
      topNotes,
      middleNotes,
      baseNotes,
      featured,
      isActive,
      images: {
        create: uploadedImages.map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          position: maxPosition + i,
        })),
      },
      variants: {
        deleteMany: {},
        create: variants,
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/");
}

export async function deleteProductAction(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });
  if (!product) return;

  await prisma.product.delete({ where: { id: productId } });

  for (const img of product.images) {
    await deleteStoredImage(img);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}
