import { prisma } from "@/lib/prisma";
import StarRating from "@/components/site/StarRating";
import FeedbackActions from "@/components/admin/FeedbackActions";

export default async function AdminFeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
  });

  const pendingCount = feedback.filter((f) => !f.isApproved).length;

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Customer Feedback</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Feedback is hidden from the website until you publish it.
        {pendingCount > 0 && (
          <span className="ml-1 font-medium text-gold-dark">
            {pendingCount} awaiting review.
          </span>
        )}
      </p>

      <div className="mt-6 space-y-4">
        {feedback.length === 0 && (
          <p className="rounded-xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
            No feedback submitted yet.
          </p>
        )}

        {feedback.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-gold-light/50 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{item.customerName}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      item.isApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.isApproved ? "Published" : "Pending"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={item.rating} />
                  <span className="text-xs text-ink-soft">
                    {item.createdAt.toLocaleDateString("en-LK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <FeedbackActions
                feedbackId={item.id}
                isApproved={item.isApproved}
                customerName={item.customerName}
              />
            </div>

            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
