import type { Metadata } from "next";

// cart/page.tsx is a client component and cannot export metadata itself.
export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
