"use server";

import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { newId, now } from "@/db/helpers";
import { checkSubmission } from "@/lib/spam-guard";

export type FeedbackState = { error: string | null; success: boolean };

// A "use server" module may only export async functions, so this stays local.
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

  const guard = checkSubmission(formData, message);
  if (!guard.ok) {
    // Logged so a wave of blocked attempts is visible, but the reason is never
    // shown: telling a bot which check it failed is telling it what to change.
    console.warn("[feedback] submission blocked", { reason: guard.reason });

    if (guard.reason === "contains a link") {
      return {
        error: "Please remove any web links from your review and try again.",
        success: false,
      };
    }

    return {
      error: "We couldn't accept that submission. Please try again in a moment.",
      success: false,
    };
  }

  await db.insert(schema.feedback).values({
    id: newId(),
    customerName,
    message,
    rating,
    isApproved: false,
    createdAt: now(),
  });

  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");

  return { error: null, success: true };
}
