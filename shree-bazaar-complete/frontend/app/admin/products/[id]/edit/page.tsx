"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useAdminData } from "@/lib/admin-data-context";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products } = useAdminData();
  const product = products.find((p) => p.id === id);

  if (!product) return notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Edit Product</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Editing &quot;{product.name}&quot;</p>
      <div className="max-w-[760px]">
        <ProductForm existing={product} />
      </div>
    </div>
  );
}
