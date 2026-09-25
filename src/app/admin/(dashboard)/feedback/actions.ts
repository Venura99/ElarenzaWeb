"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
  await prisma.feedback.delete({ where: { id: feedbackId } });
  await revalidateFeedback();
}
