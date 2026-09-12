import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { logoutAction } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream-soft">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gold-light/40 bg-ink text-cream sm:flex">
        <div className="px-6 py-6">
          <p className="font-serif text-xl text-gold-light">{BUSINESS.name}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cream/50">
            Admin Panel
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-cream/80 transition hover:bg-white/10 hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="px-3 pb-6">
          <button
            type="submit"
            className="w-full rounded-lg border border-cream/20 px-3 py-2 text-sm text-cream/70 transition hover:bg-white/10 hover:text-cream"
          >
            Log Out
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gold-light/40 bg-white px-4 py-3 sm:hidden">
          <p className="font-serif text-lg text-ink">{BUSINESS.name} Admin</p>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gold-dark">
              Log Out
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
