"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteStoredImage } from "@/lib/image-storage";

async function revalidateFeedback() {
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  revalidatePath("/feedback");
}

export async function setFeedbackApprovalAction(feedbackId: string, isApproved: boolean) {
  await db
    .update(schema.feedback)
    .set({ isApproved })
    .where(eq(schema.feedback.id, feedbackId));
  await revalidateFeedback();
}

export async function deleteFeedbackAction(feedbackId: string) {
  const feedback = await db.query.feedback.findFirst({
    where: eq(schema.feedback.id, feedbackId),
    with: { images: true },
  });
  if (!feedback) return;

  await db.batch([
    db.delete(schema.feedbackImages).where(eq(schema.feedbackImages.feedbackId, feedbackId)),
    db.delete(schema.feedback).where(eq(schema.feedback.id, feedbackId)),
  ]);

  // The DB rows cascade, but the files themselves would otherwise linger in
  // Cloudinary and keep counting against the free-tier quota.
  for (const image of feedback.images) {
    await deleteStoredImage(image);
  }

  await revalidateFeedback();
}
