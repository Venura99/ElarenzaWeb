import { BUSINESS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-dark">About Us</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">The {BUSINESS.name} Story</h1>

      <p className="mt-6 leading-relaxed text-ink-soft">
        {BUSINESS.name} was founded with a simple belief — everyone deserves to
        experience luxury fragrances without committing to a full bottle
        before finding their perfect match. We carefully decant authentic,
        premium perfumes into travel-friendly sizes, so you can explore more
        scents for less, or find your signature and treat yourself to a full
        bottle.
      </p>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Every decant is handled with care and hygiene in mind, and every order
        is prepared just for you. We proudly deliver islandwide across Sri
        Lanka.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold-light/40 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Visit / Write to Us</h2>
          <p className="mt-3 text-sm text-ink-soft">
            {BUSINESS.addressLines.join(", ")}
          </p>
        </div>
        <div className="rounded-2xl border border-gold-light/40 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Get in Touch</h2>
          <p className="mt-3 text-sm text-ink-soft">
            <a href={`tel:${BUSINESS.phoneWhatsApp}`} className="hover:text-gold-dark">
              {BUSINESS.phoneDisplay}
            </a>
          </p>
          <a
            href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
