"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Heart, ShoppingCart, LogOut } from "lucide-react";
import SearchBar from "./SearchBar";
import LogoMark from "./LogoMark";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/use-settings";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const { cartCount, wishlist } = useStore();
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
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-3.5">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-purple-700 sm:gap-3">
            <LogoMark className="h-8 w-8 shrink-0 sm:h-11 sm:w-11" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-extrabold tracking-normal text-surface-fg uppercase sm:text-2xl sm:tracking-wide">
                Shophemu
              </span>
              <span className="mt-1 text-[8px] font-semibold tracking-[1px] text-purple-700 uppercase sm:mt-1.5 sm:text-[10px] sm:tracking-[2px]">
                Shop Everything, Live Better
              </span>
            </span>
          </Link>

          <SearchBar className="hidden max-w-[560px] flex-1 md:flex" value={query} onChange={setQuery} onSubmit={handleSearch} />

          {/* Account/Wishlist/Cart now live only in the top bar on desktop — mobile uses
              the floating bottom nav instead, so nothing extra shows on the right on mobile. */}
          <div className="ml-auto hidden shrink-0 items-center gap-5 md:flex">
            {user ? (
              <div className="group relative">
                <button className="flex flex-col items-center gap-0.5 text-[11.5px] text-surface-fg/80 hover:text-purple-700">
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
              <Link href="/login" className="flex flex-col items-center gap-0.5 text-[11.5px] text-surface-fg/80 hover:text-purple-700">
                <User size={22} />
                Account
              </Link>
            )}
            <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 text-[11.5px] text-surface-fg/80 hover:text-purple-700">
              <Heart size={22} />
              Wishlist
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-700 text-[10px] font-semibold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-[11.5px] text-surface-fg/80 hover:text-purple-700">
              <ShoppingCart size={22} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-700 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-only search row — always visible, no menu/dropdown needed to reach it */}
      <div className="border-b border-[#ECEAF5] px-4 py-3 md:hidden">
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
      </div>
    </header>
  );
}
