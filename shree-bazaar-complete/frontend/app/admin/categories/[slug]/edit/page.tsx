"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useAdminData } from "@/lib/admin-data-context";
import CategoryForm from "@/components/admin/CategoryForm";

export default function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { categories } = useAdminData();
  const category = categories.find((c) => c.slug === slug);

  if (!category) return notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Edit Category</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Editing &quot;{category.name}&quot;</p>
      <div className="max-w-[600px]">
        <CategoryForm existing={category} />
      </div>
    </div>
  );
}
