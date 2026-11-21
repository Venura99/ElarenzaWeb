"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { testimonialSrc, type Testimonial } from "@/lib/testimonials";

/**
 * Screenshot gallery with a lightbox.
 *
 * The thumbnails are tall phone captures, so they are cropped to a consistent
 * portrait card and only opened at full height in the lightbox — otherwise a
 * row of them is unreadable and the grid never settles. Images below the first
 * row load lazily.
 */
export default function TestimonialGallery({
  items,
  initialCount,
  columns = 4,
}: {
  items: Testimonial[];
  /** Show this many, with a button to reveal the rest. Omit to show all. */
  initialCount?: number;
  columns?: 3 | 4;
}) {
  const [shown, setShown] = useState(initialCount ?? items.length);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const visible = items.slice(0, shown);
  const hasMore = shown < items.length;

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocused.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length]
  );

  useEffect(() => {
    if (openIndex === null) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }

    document.addEventListener("keydown", onKey);
    // Stops the page behind the lightbox from scrolling on touch devices.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step]);

  const open = items.length > 0 && openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <ul
        className={`grid grid-cols-2 gap-4 sm:gap-5 ${
          columns === 3 ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {visible.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={(event) => {
                lastFocused.current = event.currentTarget;
                setOpenIndex(index);
              }}
              aria-label={`Open larger view. ${item.alt}`}
              className="group block w-full overflow-hidden rounded-xl border border-ink/10 bg-ink/95 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              <span className="relative block aspect-[3/4] overflow-hidden">
                <Image
                  src={testimonialSrc(item.id)}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  loading={index < 4 ? "eager" : "lazy"}
                  className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setShown(items.length)}
            className="rounded-full border border-gold px-7 py-2.5 text-sm font-medium tracking-wide text-gold-dark transition hover:bg-gold hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Load {items.length - shown} more
          </button>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer message"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative max-h-full w-full max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={testimonialSrc(open.id)}
              alt={open.alt}
              width={620}
              height={1052}
              sizes="(min-width: 640px) 384px, 90vw"
              className="h-auto max-h-[85vh] w-full rounded-xl object-contain"
              priority
            />

            <p className="mt-3 text-center text-xs text-cream/70">
              {openIndex !== null ? openIndex + 1 : 0} of {items.length} · sent by a
              customer on WhatsApp
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream/15 text-2xl leading-none text-cream transition hover:bg-cream/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            ×
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous message"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/15 text-xl text-cream transition hover:bg-cream/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                aria-label="Next message"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/15 text-xl text-cream transition hover:bg-cream/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:right-6"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
