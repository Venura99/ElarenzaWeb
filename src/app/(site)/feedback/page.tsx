import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/site/FeedbackForm";
import StarRating from "@/components/site/StarRating";

export const metadata = {
  title: "Customer Feedback | Elarenza",
  description:
    "Read what our customers say about Elarenza perfume decants and full bottles, and share your own experience.",
};

export default async function FeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const averageRating =
    feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">Customer Feedback</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">What Our Customers Say</h1>

      {averageRating !== null && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StarRating value={Math.round(averageRating)} />
          <p className="text-sm text-ink-soft">
            {averageRating.toFixed(1)} out of 5 · {feedback.length}{" "}
            {feedback.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      )}

      <div className="mt-8">
        <FeedbackForm />
      </div>

      <div className="mt-12">
        {feedback.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold-light/60 p-10 text-center text-ink-soft">
            No feedback published yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gold-light/40 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{item.customerName}</p>
                  <p className="text-xs text-ink-soft">
                    {item.createdAt.toLocaleDateString("en-LK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-1">
                  <StarRating value={item.rating} />
                </div>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
