"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAdminData } from "@/lib/admin-data-context";

export default function AdminProductsPage() {
  const { products, categories, deleteProduct } = useAdminData();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.categorySlug === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, categoryFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">{products.length} products</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-[#E7E4F4] bg-white px-3.5 py-2.5">
          <Search size={16} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or brand..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-[#E7E4F4] bg-white px-3.5 py-2.5 text-sm outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EFEDF8] bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-[#F8F8FC] text-[12px] tracking-wide text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Variants</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Tag</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-[#EFEDF8]">
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-purple-50">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-[11.5px] text-gray-500">{p.brand}</div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{categories.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug}</td>
                <td className="px-5 py-3 text-gray-600">
                  {p.variantType === "none" ? "—" : `${p.variants?.length ?? 0} (${p.variantType})`}
                </td>
                <td className="px-5 py-3 font-medium text-gray-900">₹{p.price}</td>
                <td className="px-5 py-3">
                  {p.tag && (
                    <span className="rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">{p.tag}</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-purple-700">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => handleDelete(p.id, p.name)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-[13.5px] text-gray-400">No products match.</div>}
      </div>
    </div>
  );
}
