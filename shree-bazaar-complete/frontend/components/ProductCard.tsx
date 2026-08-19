"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/types";
import { useStore } from "@/lib/store-context";
import { isProductOutOfStock } from "@/lib/stock";
import Badge from "./Badge";

export default function ProductCard({ product }: { product: Product }) {
  const discount = Math.round((1 - product.price / product.oldPrice) * 100);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const router = useRouter();
  const hasVariants = product.variantType !== "none" && (product.variants?.length ?? 0) > 0;
  const outOfStock = isProductOutOfStock(product);

  const handleAdd = () => {
    if (outOfStock) return;
    if (hasVariants) {
      // Size/color or weight needs picking — send them to the detail page rather than guessing.
      router.push(`/products/${product.slug}`);
      return;
    }
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className={`group overflow-hidden rounded-2xl border border-[#EFEDF8] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_28px_-14px_rgba(17,24,39,0.18)] ${outOfStock ? "opacity-70" : ""}`}>
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-purple-50">
        {outOfStock ? (
          <Badge className="absolute top-2.5 left-2.5 z-10 !bg-gray-700">Out of Stock</Badge>
        ) : (
          <Badge className="absolute top-2.5 left-2.5 z-10">{discount}% OFF</Badge>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={wishlisted ? "fill-purple-700 text-purple-700" : "text-gray-900"} />
        </button>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
        />
      </Link>
      <div className="p-3.5 pb-4">
        <div className="mb-0.5 text-[11px] tracking-wide text-gray-500 uppercase">{product.brand}</div>
        <Link href={`/products/${product.slug}`} className="mb-1.5 block text-sm leading-tight font-semibold text-gray-900 hover:text-purple-700">
          {product.name}
        </Link>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-[16.5px] font-bold text-gray-900">₹{product.price}</span>
          <span className="text-[12.5px] text-gray-500 line-through">₹{product.oldPrice}</span>
          {hasVariants && <span className="text-[10.5px] text-gray-400">onwards</span>}
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-[13px] font-semibold transition-colors ${
            outOfStock
              ? "cursor-not-allowed border-gray-200 text-gray-400"
              : justAdded
              ? "border-green-600 bg-green-600 text-white"
              : "border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white"
          }`}
        >
          {outOfStock ? null : justAdded ? <Check size={14} /> : hasVariants ? <ChevronRight size={14} /> : <ShoppingCart size={14} />}
          {outOfStock ? "Out of Stock" : justAdded ? "Added" : hasVariants ? "Select Options" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
