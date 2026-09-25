"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveUploadedImages } from "@/lib/image-storage";

export type FeedbackState = { error: string | null; success: boolean };

// A "use server" module may only export async functions, so these stay local.
const MAX_MESSAGE_LENGTH = 1000;
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function submitFeedbackAction(
  _prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const rating = Number(formData.get("rating"));

  if (!customerName || !message) {
    return { error: "Please enter your name and your feedback.", success: false };
  }

  if (customerName.length > 60) {
    return { error: "Please use a shorter name.", success: false };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      error: `Please keep your feedback under ${MAX_MESSAGE_LENGTH} characters.`,
      success: false,
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please select a rating between 1 and 5 stars.", success: false };
  }

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (imageFiles.length > MAX_IMAGES) {
    return { error: `Please attach at most ${MAX_IMAGES} photos.`, success: false };
  }

  for (const file of imageFiles) {
    if (!file.type.startsWith("image/")) {
      return { error: "Only image files can be attached.", success: false };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: "Each photo must be under 5MB.", success: false };
    }
  }

  let uploaded: { url: string; publicId: string | null }[] = [];
  if (imageFiles.length > 0) {
    try {
      uploaded = await saveUploadedImages(imageFiles, { folder: "elarenza/feedback" });
    } catch {
      return {
        error: "We couldn't upload your photos. Please try again, or submit without them.",
        success: false,
      };
    }
  }

  await prisma.feedback.create({
    data: {
      customerName,
      message,
      rating,
      images: {
        create: uploaded.map((img) => ({ url: img.url, publicId: img.publicId })),
      },
    },
  });

  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");

  return { error: null, success: true };
}
