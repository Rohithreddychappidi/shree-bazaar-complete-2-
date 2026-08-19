"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useAdminData } from "@/lib/admin-data-context";

type SidebarProps = {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
};

export default function Sidebar({ selectedCategory, onSelectCategory }: SidebarProps) {
  const [open, setOpen] = useState(true);
  const { categories } = useAdminData();

  return (
    <aside className="h-fit rounded-2xl border border-[#EFEDF8] bg-white p-5 lg:sticky lg:top-[130px]">
      <button
        className="mb-4 flex w-full items-center justify-between text-sm font-semibold text-gray-900 lg:cursor-default"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-purple-700" />
          Categories
        </span>
        <ChevronDown size={16} className={`transition-transform lg:hidden ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`${open ? "block" : "hidden"} flex flex-col gap-1 lg:block`}>
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors ${
            selectedCategory === null ? "bg-purple-50 font-semibold text-purple-700" : "text-gray-700 hover:bg-purple-50"
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => onSelectCategory(c.slug)}
            className={`w-full rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors ${
              selectedCategory === c.slug ? "bg-purple-50 font-semibold text-purple-700" : "text-gray-700 hover:bg-purple-50"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
