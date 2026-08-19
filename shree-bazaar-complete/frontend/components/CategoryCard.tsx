import Link from "next/link";
import * as Icons from "lucide-react";
import { Category } from "@/lib/types";

export default function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Circle;

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group rounded-2xl border border-[#EFEDF8] bg-white p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-[0_12px_24px_-12px_rgba(109,40,217,0.25)]"
    >
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
        <Icon size={26} className="text-purple-700" strokeWidth={1.8} />
      </div>
      <h4 className="mb-1 text-[13.5px] font-semibold text-gray-900">{category.name}</h4>
      <p className="text-[11px] leading-tight text-gray-500">{category.subcategories[0]}</p>
    </Link>
  );
}
