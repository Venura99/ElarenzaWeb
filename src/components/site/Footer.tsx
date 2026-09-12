import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gold-light/40 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <span className="font-serif text-2xl tracking-wide text-gold-light">
            {BUSINESS.name.toUpperCase()}
          </span>
          <p className="mt-2 text-xs uppercase tracking-[0.25em] text-gold">
            {BUSINESS.tagline}
          </p>
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            Premium perfume decants and full bottles, carefully decanted and
            made for you. Islandwide delivery across Sri Lanka.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-light">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>
              <Link href="/shop" className="hover:text-gold-light">
                Shop All Perfumes
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gold-light">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-gold-light">
                Your Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-light">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            {BUSINESS.addressLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>
              <a
                href={`tel:${BUSINESS.phoneWhatsApp}`}
                className="hover:text-gold-light"
              >
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-light"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
