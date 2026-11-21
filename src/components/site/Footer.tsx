import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { COLLECTIONS } from "@/lib/collections";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-serif text-2xl tracking-wide text-gold-light">
            {BUSINESS.name.toUpperCase()}
          </span>
          <p className="eyebrow-light mt-2">{BUSINESS.tagline}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
            Premium perfume decants and full bottles, carefully decanted and
            made for you. Islandwide delivery across Sri Lanka.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            Shop
          </h3>
          {/* Also the crawl path to the collection pages, which nothing else
              on the site links to from every page. */}
          <ul className="mt-5 space-y-2.5 text-sm text-cream/70">
            <li>
              <Link href="/shop" className="hover:text-gold-light">
                All Perfumes
              </Link>
            </li>
            {COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="hover:text-gold-light"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/brands" className="hover:text-gold-light">
                Brands
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            Help
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm text-cream/70">
            <li>
              <Link href="/faq" className="hover:text-gold-light">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-gold-light">
                Customer Reviews
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
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
            Contact
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm text-cream/70">
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

      <div className="border-t border-white/10 py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-xs text-cream/50 sm:flex-row sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gold-light">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-cream/25">
              |
            </span>
            <Link href="/terms" className="hover:text-gold-light">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
