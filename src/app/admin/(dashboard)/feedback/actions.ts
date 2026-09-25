"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteStoredImage } from "@/lib/image-storage";

async function revalidateFeedback() {
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  revalidatePath("/feedback");
}

export async function setFeedbackApprovalAction(feedbackId: string, isApproved: boolean) {
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { isApproved },
  });
  await revalidateFeedback();
}

export async function deleteFeedbackAction(feedbackId: string) {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: { images: true },
  });
  if (!feedback) return;

  await prisma.feedback.delete({ where: { id: feedbackId } });

  // The DB rows cascade, but the files themselves would otherwise linger in
  // Cloudinary and keep counting against the free-tier quota.
  for (const image of feedback.images) {
    await deleteStoredImage(image);
  }

  await revalidateFeedback();
}
