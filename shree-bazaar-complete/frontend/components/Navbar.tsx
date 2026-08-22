"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, Heart, ShoppingCart, Menu, X, LogOut } from "lucide-react";
import SearchBar from "./SearchBar";
import { useAdminData } from "@/lib/admin-data-context";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/use-settings";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { cartCount, wishlist } = useStore();
  const { categories } = useAdminData();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/admin")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface">
      {settings?.announcementEnabled && settings.announcementText && (
        <div className="overflow-hidden bg-purple-700 py-1.5 text-[12.5px] text-white">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-8">{settings.announcementText}</span>
            <span className="mx-8">{settings.announcementText}</span>
            <span className="mx-8">{settings.announcementText}</span>
            <span className="mx-8">{settings.announcementText}</span>
          </div>
        </div>
      )}

      <div className="border-b border-[#ECEAF5]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-6 py-3.5">
          <Link href="/" className="shrink-0 font-display text-3xl font-extrabold text-purple-700">
            Shop
            <span className="block -mt-1 text-sm font-semibold tracking-[2px] text-surface-fg uppercase">Hemu</span>
          </Link>

          <SearchBar className="hidden max-w-[560px] flex-1 md:flex" value={query} onChange={setQuery} onSubmit={handleSearch} />

          <div className="ml-auto flex shrink-0 items-center gap-5">
            {user ? (
              <div className="group relative hidden sm:block">
                <button className="flex flex-col items-center gap-0.5 text-[11.5px] text-gray-500 hover:text-purple-700">
                  {user.avatarUrl ? (
                    <span className="relative block h-[22px] w-[22px] overflow-hidden rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element -- small avatar, external Google URL, no LCP concern */}
                      <img src={user.avatarUrl} alt={user.name ?? "Account"} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <User size={22} />
                  )}
                  {user.name?.split(" ")[0] ?? "Account"}
                </button>
                {/* invisible padding bridge (not margin) keeps this hoverable area contiguous
                    with the trigger button — no dead zone for the cursor to cross */}
                <div className="invisible absolute right-0 top-full z-10 w-44 pt-1 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                  <div className="rounded-xl border border-[#EFEDF8] bg-white p-2 shadow-lg">
                    <Link href="/profile" className="block rounded-lg px-3 py-2 text-[13px] text-gray-700 hover:bg-purple-50">
                      My Profile
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className="block rounded-lg px-3 py-2 text-[13px] text-gray-700 hover:bg-purple-50">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={() => logout()} className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-[13px] text-red-500 hover:bg-red-50">
                      <LogOut size={13} /> Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden flex-col items-center gap-0.5 text-[11.5px] text-gray-500 hover:text-purple-700 sm:flex">
                <User size={22} />
                Account
              </Link>
            )}
            <Link href="/wishlist" className="relative hidden flex-col items-center gap-0.5 text-[11.5px] text-gray-500 hover:text-purple-700 sm:flex">
              <Heart size={22} />
              Wishlist
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-700 text-[10px] font-semibold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-[11.5px] text-gray-500 hover:text-purple-700">
              <ShoppingCart size={22} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-700 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-only search row — always visible, not buried behind the hamburger menu */}
      <div className="border-b border-[#ECEAF5] px-6 py-3 md:hidden">
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
      </div>

      <nav className="hidden border-b border-[#ECEAF5] md:block">
        <div className="mx-auto flex max-w-[1280px] gap-7 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="border-b-2 border-transparent pb-0.5 text-[13.5px] font-medium whitespace-nowrap text-gray-900 transition-colors hover:border-purple-400 hover:text-purple-700">
              {l.label}
            </Link>
          ))}
          {categories.slice(0, 8).map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="border-b-2 border-transparent pb-0.5 text-[13.5px] font-medium whitespace-nowrap text-gray-900 transition-colors hover:border-purple-400 hover:text-purple-700">
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-[#ECEAF5] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-900">
                {l.label}
              </Link>
            ))}
            <Link href={user ? "/profile" : "/login"} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-900">
              {user ? "My Profile" : "Account"}
            </Link>
            {user && (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-sm font-medium text-red-500">
                Log out
              </button>
            )}
            {categories.map((c) => (
              <Link key={c.slug} href={`/products?category=${c.slug}`} onClick={() => setMobileOpen(false)} className="text-sm text-gray-600">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}