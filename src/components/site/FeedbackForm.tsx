"use client";

import { useActionState, useState } from "react";
import { submitFeedbackAction, type FeedbackState } from "@/app/(site)/feedback/actions";
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/spam-guard";
import Spinner from "@/components/site/Spinner";

const initialState: FeedbackState = { error: null, success: false };

export default function FeedbackForm({ formToken }: { formToken: string }) {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initialState);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);

  if (state.success) {
    return (
      <div className="rounded-lg border border-line bg-paper p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <h3 className="mt-4 font-serif text-xl text-ink">Thank you for your feedback</h3>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ve received it, and it will appear here once we&apos;ve had a
          chance to read it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-line bg-paper p-6 sm:p-8">
      <h3 className="font-serif text-2xl text-ink">Share your experience</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        We&apos;d love to hear how you found your Elarenza fragrance.
      </p>

      {/* Issued when the page rendered and signed server-side: a real person
          takes longer than a few seconds to write a review, and the signature
          stops the value being forged or replayed. */}
      <input type="hidden" name={TIMESTAMP_FIELD} value={formToken} />

      {/* Honeypot. Hidden from people and from screen readers; bots that fill
          every field in the form give themselves away here. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="customerName" className="label">
            Your name *
          </label>
          <input
            id="customerName"
            name="customerName"
            required
            maxLength={60}
            autoComplete="name"
            className="input"
          />
        </div>

        <div>
          <span className="label">Your rating *</span>
          <input type="hidden" name="rating" value={rating} />
          <div
            className="flex gap-1"
            role="radiogroup"
            aria-label="Your rating"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={star === rating}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                className={`text-2xl leading-none transition ${
                  star <= (hovered || rating) ? "text-gold" : "text-gold-light/50"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="label">
            Your feedback *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            maxLength={1000}
            placeholder="Tell us what you thought about the fragrance, packaging or delivery..."
            className="input"
          />
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          >
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
          {pending ? <Spinner label="Submitting..." /> : "Submit Feedback"}
        </button>

        <p className="text-xs text-ink-muted">
          Reviews are read before they appear on the site.
        </p>
      </div>
    </form>
  );
}
