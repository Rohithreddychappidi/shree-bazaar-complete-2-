"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Category } from "@/lib/types";
import { useAdminData } from "@/lib/admin-data-context";
import Button from "@/components/Button";

const availableIcons = [
  "UtensilsCrossed", "Shirt", "Flame", "Home", "Gift", "Package",
  "Star", "Baby", "Sparkles", "Lamp", "Watch", "ShoppingBag",
];

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CategoryForm({ existing }: { existing?: Category }) {
  const router = useRouter();
  const { addCategory, updateCategory } = useAdminData();
  const [name, setName] = useState(existing?.name ?? "");
  const [subcategoriesText, setSubcategoriesText] = useState(existing?.subcategories.join(", ") ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? availableIcons[0]);
  const [image, setImage] = useState(existing?.image ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = existing?.slug ?? slugify(name);
    const category: Category = {
      slug,
      name,
      subcategories: subcategoriesText.split(",").map((s) => s.trim()).filter(Boolean),
      icon,
      image: image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
    };
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        await updateCategory(existing.slug, category);
      } else {
        await addCategory(category);
      }
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Category Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Footwear"
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Subcategories (comma separated)</label>
        <input
          value={subcategoriesText}
          onChange={(e) => setSubcategoriesText(e.target.value)}
          placeholder="e.g. Sandals, Sneakers, Formal Shoes"
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Icon</label>
        <div className="flex flex-wrap gap-2">
          {availableIcons.map((iconName) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[iconName] ?? Icons.Circle;
            return (
              <button
                type="button"
                key={iconName}
                onClick={() => setIcon(iconName)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors ${
                  icon === iconName ? "border-purple-700 bg-purple-50" : "border-[#E7E4F4]"
                }`}
                title={iconName}
              >
                <Icon size={18} className={icon === iconName ? "text-purple-700" : "text-gray-500"} />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Cover Image URL</label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button className={`w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
          {saving ? "Saving..." : existing ? "Save Changes" : "Create Category"}
        </Button>
        <button type="button" onClick={() => router.push("/admin/categories")} className="rounded-xl border border-[#E7E4F4] px-6 py-3 text-sm font-semibold text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
