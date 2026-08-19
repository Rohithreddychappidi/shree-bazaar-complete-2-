"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import SectionTitle from "@/components/SectionTitle";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";
import { useAdminData } from "@/lib/admin-data-context";

export default function HomePage() {
  const { categories, products } = useAdminData();
  const newArrivals = Array.from(
    new Map(products.filter((p) => p.tag === "new").concat(products.slice(0, 4)).map((p) => [p.id, p])).values()
  );
  const trending = products.filter((p) => p.tag === "trending");
  const featured = products.filter((p) => p.tag === "featured");
  const clearance = products.filter((p) => p.tag === "clearance");

  return (
    <main>
      <HeroBanner />

      <section className="mx-auto max-w-[1280px] px-6 pt-[52px]">
        <SectionTitle eyebrow="Explore" title="Shop by Category" viewAllHref="/products" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-[18px]">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {clearance.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 pt-[52px]">
          <div className="mb-6 flex items-end justify-between rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-6 py-5 text-white">
            <div>
              <div className="mb-1 text-xs font-semibold tracking-widest uppercase opacity-90">Limited Time</div>
              <h2 className="text-2xl font-bold">Clearance Day Sale</h2>
            </div>
            <Link href="/products?tag=clearance" className="flex items-center gap-1 text-sm font-semibold hover:underline">
              Shop All <ChevronRight size={16} />
            </Link>
          </div>
          <ProductGrid products={clearance.slice(0, 8)} />
        </section>
      )}

      <section className="mx-auto max-w-[1280px] px-6 pt-[52px]">
        <SectionTitle eyebrow="Just In" title="New Arrivals" viewAllHref="/products" />
        <ProductGrid products={newArrivals.slice(0, 8)} />
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pt-[52px]">
        <SectionTitle eyebrow="Popular Right Now" title="Trending Products" viewAllHref="/products" />
        <ProductGrid products={trending} />

        <div className="mt-14 flex flex-col items-center justify-between gap-[18px] rounded-[18px] bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-center text-white sm:flex-row sm:px-12 sm:text-left">
          <div>
            <h3 className="mb-2 text-2xl font-bold">Combos & Festive Specials</h3>
            <p className="max-w-[420px] text-sm opacity-90">
              Curated bundles on sweets, pooja essentials and gifting sets — handpicked for the season.
            </p>
          </div>
          <Button href="/products?category=combos" variant="white">
            Shop Combos
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pt-[52px] pb-[60px]">
        <SectionTitle eyebrow="Handpicked" title="Featured Products" viewAllHref="/products" />
        <ProductGrid products={featured} />
      </section>
    </main>
  );
}