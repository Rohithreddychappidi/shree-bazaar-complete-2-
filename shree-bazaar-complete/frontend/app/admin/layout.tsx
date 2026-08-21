"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LayoutGrid, Package, ShoppingBag, Settings, ExternalLink, Loader2, Image as ImageIcon, Tag, Users, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Master admin sees everything. Sub-admins only get Products, Categories and Coupons —
// the rest (orders, settings, hero banners, staff management) stays admin-only.
const masterOnlyItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero-slides", label: "Hero Banners", icon: ImageIcon },
];
const sharedItems = [
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];
const subAdminOnlyItems = [{ href: "/admin/my-orders", label: "My Orders", icon: ShoppingBag }];
const masterOnlyItemsAfter = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/marketing", label: "Marketing", icon: MessageCircle },
  { href: "/admin/staff", label: "Sub-Admins", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isStaff = user?.role === "ADMIN" || user?.role === "SUB_ADMIN";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!isStaff) {
      router.replace("/");
    } else if (user.role === "SUB_ADMIN") {
      // Sub-admins get bounced out of anything outside their allowed sections,
      // even if they navigate there directly by URL.
      const allowed = [...sharedItems, ...subAdminOnlyItems].some((item) => pathname.startsWith(item.href));
      if (!allowed) router.replace("/admin/products");
    }
  }, [loading, user, isStaff, pathname, router]);

  if (loading || !user || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8FC]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-[13px]">Checking access…</span>
        </div>
      </div>
    );
  }

  const navItems = user.role === "ADMIN" ? [...masterOnlyItems, ...sharedItems, ...masterOnlyItemsAfter] : [...sharedItems, ...subAdminOnlyItems];

  return (
    <div className="flex min-h-screen bg-[#F8F8FC]">
      <aside className="fixed inset-y-0 left-0 z-40 w-[240px] border-r border-[#ECEAF5] bg-[#1B1030] text-white">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="font-display text-xl font-extrabold text-white">
            Shop<span className="text-purple-400">Hemu</span>
          </div>
          <div className="mt-0.5 text-[11px] tracking-widest text-white/50 uppercase">
            {user.role === "SUB_ADMIN" ? "Sub-Admin" : "Admin Panel"}
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-purple-700 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
            <ExternalLink size={17} />
            View Storefront
          </Link>
        </div>
      </aside>
      <main className="ml-[240px] flex-1 p-8">{children}</main>
    </div>
  );
}
