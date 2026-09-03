import Link from "next/link";
import * as Icons from "lucide-react";
import { Category } from "@/lib/types";

export default function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.Circle;

  return (
    <Link href={`/products?category=${category.slug}`} className="group flex flex-col items-center gap-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#EFEDF8] bg-purple-50 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-purple-400 group-hover:shadow-[0_10px_20px_-10px_rgba(109,40,217,0.3)]">
        <Icon size={24} className="text-purple-700" strokeWidth={1.8} />
      </div>
      <div>
        <h4 className="text-[12.5px] font-semibold text-gray-900">{category.name}</h4>
        <p className="text-[10px] leading-tight text-gray-500">{category.subcategories[0]}</p>
      </div>
    </Link>
  );
}