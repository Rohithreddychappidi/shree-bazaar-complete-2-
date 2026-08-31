"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, LayoutGrid, Package, UserCircle2, LogOut, User } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useStore();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const items = [
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { href: "/products", label: "Products", icon: LayoutGrid },
    { href: "/profile/orders", label: "Orders", icon: Package },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 md:hidden">
      <div className="flex items-center gap-1 rounded-full border border-white/40 bg-surface/75 px-2 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10.5px] font-medium transition-colors ${
                active ? "bg-purple-700 text-white" : "text-surface-fg/70"
              }`}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Profile — tapping opens a small menu above the bar with My Profile + Log out,
            rather than navigating straight there, since logout needs to live somewhere on mobile
            now that the hamburger menu is gone. */}
        <div className="relative" ref={menuRef}>
          {user ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10.5px] font-medium transition-colors ${
                menuOpen || pathname.startsWith("/profile") ? "bg-purple-700 text-white" : "text-surface-fg/70"
              }`}
            >
              <UserCircle2 size={20} strokeWidth={menuOpen ? 2.2 : 1.8} />
              Profile
            </button>
          ) : (
            <Link href="/login" className="flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10.5px] font-medium text-surface-fg/70">
              <User size={20} strokeWidth={1.8} />
              Login
            </Link>
          )}

          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-3 w-40 overflow-hidden rounded-2xl border border-white/40 bg-white shadow-xl">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-purple-50"
              >
                <UserCircle2 size={16} /> My Profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
