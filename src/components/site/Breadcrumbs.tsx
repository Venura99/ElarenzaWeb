import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export type Crumb = {
  name: string;
  /** Omitted on the current page, which is not a link. */
  href?: string;
};

/**
 * Visible breadcrumbs plus BreadcrumbList structured data.
 *
 * Google uses the markup to replace the raw URL in a result with a readable
 * trail (elarenza.lk › Shop › Afnan 9PM Night Out), and the links themselves
 * give deeper pages a route back up the site.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ name: "Home", href: "/" }, ...items];
  const base = BUSINESS.siteUrl.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${base}${crumb.href === "/" ? "" : crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={`${crumb.name}-${index}`} className="flex items-center gap-2">
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="transition hover:text-gold-dark">
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-ink" aria-current={last ? "page" : undefined}>
                    {crumb.name}
                  </span>
                )}
                {!last && (
                  <span aria-hidden="true" className="text-gold-light">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
