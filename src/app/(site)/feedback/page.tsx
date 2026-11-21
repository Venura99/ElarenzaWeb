import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { TESTIMONIALS } from "@/lib/testimonials";
import { issueFormToken } from "@/lib/spam-guard";
import FeedbackForm from "@/components/site/FeedbackForm";
import StarRating from "@/components/site/StarRating";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import TestimonialGallery from "@/components/site/TestimonialGallery";

// Reads live data from the database on every request, so it must not be
// prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Feedback",
  description:
    "Read what our customers say about Elarenza perfume decants and full bottles, and share your own experience.",
  alternates: { canonical: "/feedback" },
};

export default async function FeedbackPage() {
  const feedback = await db.query.feedback.findMany({
    where: eq(schema.feedback.isApproved, true),
    orderBy: [desc(schema.feedback.createdAt)],
    limit: 50,
    with: { images: true },
  });

  const averageRating =
    feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : null;

  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <Breadcrumbs items={[{ name: "Customer Experiences" }]} />
        <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">
          Customer Experiences
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          What Our Customers Say
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Every message and review below came from a real Elarenza customer
          after their order arrived. We publish them as they were written — we
          only remove the personal details.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-gold-light/40 py-5">
          {averageRating !== null && (
            <div>
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(averageRating)} />
                <span className="font-serif text-xl text-ink">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">
                Average of {feedback.length}{" "}
                {feedback.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          )}
          <div>
            <p className="font-serif text-xl text-ink">{TESTIMONIALS.length}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">
              WhatsApp messages shared
            </p>
          </div>
          <div>
            <p className="font-serif text-xl text-ink">Islandwide</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">
              Delivered across Sri Lanka
            </p>
          </div>
        </div>
      </div>

      {TESTIMONIALS.length > 0 && (
        <section className="mt-14 border-y border-gold-light/40 bg-ink">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-gold">
                Straight from WhatsApp
              </p>
              <h2 className="mt-3 font-serif text-3xl text-cream">
                Messages from real orders
              </h2>
              <p className="mt-3 leading-relaxed text-cream/70">
                Unedited screenshots of what customers told us after their
                parcels arrived. Names, numbers and profile photos have been
                removed; the words are theirs. Tap any message to read it in
                full.
              </p>
            </div>
            <div className="mt-10">
              <TestimonialGallery items={TESTIMONIALS} initialCount={12} />
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
        <div className="mt-14">
          <h2 className="font-serif text-3xl text-ink">Written reviews</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Reviews submitted through this page, published once we&apos;ve
            checked them.
          </p>
        </div>

        <div className="mt-8">
          <FeedbackForm formToken={issueFormToken()} />
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

                {item.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.images.map((image) => (
                      <a
                        key={image.id}
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg"
                      >
                        <Image
                          src={image.url}
                          alt={`Photo from ${item.customerName}`}
                          width={160}
                          height={160}
                          className="h-24 w-24 object-cover transition hover:scale-105 sm:h-28 sm:w-28"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
