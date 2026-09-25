"use client";

import { useActionState, useRef, useState } from "react";
import { submitFeedbackAction, type FeedbackState } from "@/app/(site)/feedback/actions";
import { compressImage } from "@/lib/compress-image";
import Spinner from "@/components/site/Spinner";

const initialState: FeedbackState = { error: null, success: false };
const MAX_IMAGES = 3;

type Attachment = { id: string; file: File; previewUrl: string };

export default function FeedbackForm() {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initialState);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [processing, setProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    setImageError(null);

    const room = MAX_IMAGES - attachments.length;
    if (room <= 0) {
      setImageError(`You can attach up to ${MAX_IMAGES} photos.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const accepted = picked.slice(0, room);
    if (picked.length > room) {
      setImageError(`Only the first ${room} photo${room > 1 ? "s" : ""} were added (max ${MAX_IMAGES}).`);
    }

    setProcessing(true);
    const next: Attachment[] = [];
    for (const file of accepted) {
      if (!file.type.startsWith("image/")) continue;
      const compressed = await compressImage(file);
      next.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file: compressed,
        previewUrl: URL.createObjectURL(compressed),
      });
    }
    setAttachments((prev) => [...prev, ...next]);
    setProcessing(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
    setImageError(null);
  }

  function handleSubmit(formData: FormData) {
    formData.delete("images");
    for (const attachment of attachments) {
      formData.append("images", attachment.file);
    }
    formAction(formData);
  }

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
      action={handleSubmit}
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

        <div>
          <span className="mb-1 block text-sm font-medium text-ink-soft">
            Add Photos (optional)
          </span>

          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.previewUrl}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachments.length < MAX_IMAGES && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              disabled={processing}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-cream-soft file:px-4 file:py-2 file:text-sm file:text-ink-soft hover:file:bg-gold-light/40"
            />
          )}

          <p className="mt-1 text-xs text-ink-soft">
            {processing ? (
              <Spinner className="h-3 w-3" label="Preparing photos..." />
            ) : (
              `Up to ${MAX_IMAGES} photos. Large photos are resized automatically.`
            )}
          </p>

          {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
        </div>

        {state.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || processing}
          className="flex w-full items-center justify-center rounded-full bg-ink py-3 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {pending ? <Spinner label="Submitting..." /> : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}
