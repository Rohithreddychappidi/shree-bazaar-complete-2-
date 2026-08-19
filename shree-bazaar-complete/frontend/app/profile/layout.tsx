"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, MapPin, CreditCard, Settings } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAuth } from "@/lib/auth-context";
import { useAddresses } from "@/lib/use-addresses";

const sidebarItems = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/profile/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/payments", label: "Saved Payments", icon: CreditCard },
  { href: "/profile/settings", label: "Settings", icon: Settings },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { wishlist } = useStore();
  const { user } = useAuth();
  const { addresses } = useAddresses();
  const primaryAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-[#EFEDF8] bg-white p-3 lg:sticky lg:top-[100px]">
          {sidebarItems.map((item) => {
            const active = item.href === "/profile" ? pathname === "/profile" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13.5px] font-medium transition-colors ${
                  active ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-purple-50"
                }`}
              >
                <item.icon size={17} />
                {item.label}
                {item.href === "/wishlist" && wishlist.length > 0 && (
                  <span className="ml-auto rounded-full bg-purple-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        <div className="flex flex-col gap-6">
          {/* Profile header card shown across every /profile/* route */}
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-50">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="Profile avatar" fill className="object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-purple-700">{initial}</span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-gray-900">{user?.name || "Complete your profile"}</h2>
                <p className="text-[13px] text-gray-500">
                  {user?.email}
                  {user?.phone && <>&nbsp;•&nbsp; {user.phone}</>}
                </p>
                {primaryAddress && <p className="mt-1 text-[13px] text-gray-500">{primaryAddress.city}</p>}
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}