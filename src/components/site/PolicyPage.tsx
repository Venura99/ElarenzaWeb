import type { ReactNode } from "react";

// Both policy pages are reviewed and republished together, so they share one
// date rather than each carrying its own that can drift out of step.
export const POLICY_LAST_UPDATED = "17 November 2026";

export function PolicyShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{title}</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Last updated: {POLICY_LAST_UPDATED}
      </p>

      <div className="mt-6 rounded-2xl border border-gold-light/40 bg-white p-6 leading-relaxed text-ink-soft">
        {intro}
      </div>

      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-ink">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export function PolicyList({ children }: { children: ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-2 leading-relaxed text-ink-soft">
      {children}
    </ul>
  );
}
