"use client";

import { Heart } from "lucide-react";
import { useStore } from "@/lib/store-context";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";

export default function WishlistPage() {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <main className="mx-auto flex max-w-[1280px] flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
          <Heart size={28} className="text-purple-700" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Your wishlist is empty</h1>
        <p className="mb-6 text-[13.5px] text-gray-500">Tap the heart icon on any product to save it here.</p>
        <Button href="/products">Browse Products</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">My Wishlist</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">{wishlist.length} item{wishlist.length > 1 ? "s" : ""} saved</p>
      <ProductGrid products={wishlist} />
    </main>
  );
}
