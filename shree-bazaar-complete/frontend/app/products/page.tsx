"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import ProductGrid from "@/components/ProductGrid";
import { useAdminData } from "@/lib/admin-data-context";
import { ChevronRight } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search")?.toLowerCase().trim() ?? "";
  const tag = searchParams.get("tag");
  const { categories, products } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sort, setSort] = useState("popularity");

  const filtered = useMemo(() => {
    let list = selectedCategory ? products.filter((p) => p.categorySlug === selectedCategory) : products;
    if (tag) list = list.filter((p) => p.tag === tag);
    if (searchQuery) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(searchQuery) || p.brand.toLowerCase().includes(searchQuery)
      );
    }
    list = [...list];
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, selectedCategory, sort, searchQuery, tag]);

  const activeCategoryName = searchQuery
    ? `Results for "${searchParams.get("search")}"`
    : tag === "clearance"
    ? "Clearance Day Sale"
    : (categories.find((c) => c.slug === selectedCategory)?.name ?? "All Products");

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-4 flex items-center gap-1.5 text-[13px] text-gray-500">
        <span>Home</span>
        <ChevronRight size={13} />
        <span className="font-medium text-gray-900">{activeCategoryName}</span>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{activeCategoryName}</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">{filtered.length} products</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-[#E7E4F4] bg-white px-3.5 py-2.5 text-[13.5px] text-gray-900 outline-none"
        >
          <option value="popularity">Sort: Popularity</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <Sidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        {filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-12 text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
