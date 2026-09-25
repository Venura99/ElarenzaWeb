"use client";

import { useActionState, useState } from "react";
import { submitFeedbackAction, type FeedbackState } from "@/app/(site)/feedback/actions";
import Spinner from "@/components/site/Spinner";

const initialState: FeedbackState = { error: null, success: false };

export default function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initialState);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-gold-light/40 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          ✓
        </div>
        <h3 className="mt-4 font-serif text-xl text-ink">Thank you for your feedback!</h3>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ve received it and it will appear here once we&apos;ve had a chance to
          review it.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-gold-light/40 bg-white p-6 sm:p-8"
    >
      <h2 className="font-serif text-2xl text-ink">Share Your Experience</h2>
      <p className="mt-1 text-sm text-ink-soft">
        We&apos;d love to hear how you found your Elarenza fragrance.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-ink-soft">
            Your Name *
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            maxLength={60}
            className="w-full rounded-lg border border-gold-light/60 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-ink-soft">Your Rating *</span>
          <input type="hidden" name="rating" value={rating} />
          <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                className={`text-2xl leading-none transition ${
                  star <= (hovered || rating) ? "text-gold" : "text-gold-light/40"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink-soft">
            Your Feedback *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            maxLength={1000}
            placeholder="Tell us what you thought about the fragrance, packaging or delivery..."
            className="w-full rounded-lg border border-gold-light/60 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>

        {state.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center rounded-full bg-ink py-3 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {pending ? <Spinner label="Submitting..." /> : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}
