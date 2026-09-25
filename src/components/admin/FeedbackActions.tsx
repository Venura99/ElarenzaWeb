"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setFeedbackApprovalAction,
  deleteFeedbackAction,
} from "@/app/admin/(dashboard)/feedback/actions";
import Spinner from "@/components/site/Spinner";

export default function FeedbackActions({
  feedbackId,
  isApproved,
  customerName,
}: {
  feedbackId: string;
  isApproved: boolean;
  customerName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleApproval() {
    startTransition(async () => {
      await setFeedbackApprovalAction(feedbackId, !isApproved);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete the feedback from "${customerName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteFeedbackAction(feedbackId);
      router.refresh();
    });
  }

  if (isPending) {
    return <Spinner className="h-4 w-4" label="Saving..." />;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={toggleApproval}
        className={
          isApproved
            ? "text-ink-soft hover:underline"
            : "font-medium text-green-700 hover:underline"
        }
      >
        {isApproved ? "Unpublish" : "Publish"}
      </button>
      <button type="button" onClick={handleDelete} className="text-red-600 hover:underline">
        Delete
      </button>
    </div>
  );
}
