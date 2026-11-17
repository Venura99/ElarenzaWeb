import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { BUSINESS } from "@/lib/constants";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Elarenza offers premium perfume decants and full bottles, carefully decanted and made for you. Islandwide delivery across Sri Lanka.";

export const metadata: Metadata = {
  // Required for the file-convention opengraph-image to resolve to an absolute
  // URL. Without it the share card silently falls back to no image.
  metadataBase: new URL(BUSINESS.siteUrl),
  title: {
    default: "Elarenza | Your Signature Scent",
    // Product and policy pages supply their own name; everything reads
    // "<page> | Elarenza" so no two pages share a title.
    template: "%s | Elarenza",
  },
  description: DESCRIPTION,
  applicationName: BUSINESS.name,
  keywords: [
    "perfume decants Sri Lanka",
    "perfume Sri Lanka",
    "designer fragrance Colombo",
    "niche perfume Sri Lanka",
    "full bottle perfume",
    "Elarenza",
  ],
  // No canonical here on purpose: metadata is inherited, so a canonical set on
  // the root layout would make every page that does not override it declare
  // itself a duplicate of the home page. Each page sets its own.
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    title: "Elarenza | Your Signature Scent",
    description: DESCRIPTION,
    url: BUSINESS.siteUrl,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elarenza | Your Signature Scent",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
