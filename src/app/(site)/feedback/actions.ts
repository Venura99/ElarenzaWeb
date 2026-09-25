"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type FeedbackState = { error: string | null; success: boolean };

const MAX_MESSAGE_LENGTH = 1000;

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

  await prisma.feedback.create({
    data: { customerName, message, rating },
  });

  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");

  return { error: null, success: true };
}
