"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdminData } from "@/lib/admin-data-context";

export default function AdminCategoriesPage() {
  const { categories, products, deleteCategory } = useAdminData();

  const handleDelete = async (slug: string, name: string) => {
    const inUse = products.some((p) => p.categorySlug === slug);
    if (inUse) {
      alert(`Can't delete "${name}" — products are still assigned to it. Reassign or delete those products first.`);
      return;
    }
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(slug);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">{categories.length} categories</p>
        </div>
        <Link href="/admin/categories/new" className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800">
          <Plus size={16} /> Add Category
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon] ?? Icons.Circle;
          const productCount = products.filter((p) => p.categorySlug === c.slug).length;
          return (
            <div key={c.slug} className="rounded-2xl border border-[#EFEDF8] bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                  <Icon size={20} className="text-purple-700" />
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/categories/${c.slug}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-purple-700">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => handleDelete(c.slug, c.name)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
              <p className="mt-1 text-[12.5px] text-gray-500">{c.subcategories.join(", ")}</p>
              <p className="mt-2 text-[12px] font-medium text-purple-700">{productCount} product{productCount !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
