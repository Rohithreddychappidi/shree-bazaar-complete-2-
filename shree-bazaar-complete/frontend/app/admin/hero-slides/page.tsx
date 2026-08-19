"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useHeroSlides } from "@/lib/use-hero-slides";

export default function AdminHeroSlidesPage() {
  const { slides, loading, deleteSlide } = useHeroSlides();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete slide "${title}"?`)) return;
    try {
      await deleteSlide(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete slide");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">Slides shown in the homepage banner, in order.</p>
        </div>
        <Link href="/admin/hero-slides/new" className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800">
          <Plus size={16} /> Add Slide
        </Link>
      </div>

      {loading && <p className="text-[13.5px] text-gray-400">Loading…</p>}

      <div className="flex flex-col gap-4">
        {slides.map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-[#EFEDF8] bg-white p-4">
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-purple-50">
              <Image src={s.image} alt={s.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold tracking-wide text-purple-700 uppercase">{s.eyebrow}</div>
              <div className="text-sm font-semibold text-gray-900">{s.title}</div>
              <div className="text-[12px] text-gray-500">{s.ctaLabel} → {s.ctaHref}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/hero-slides/${s.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-purple-700">
                <Pencil size={14} />
              </Link>
              <button onClick={() => handleDelete(s.id, s.title)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!loading && slides.length === 0 && (
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-10 text-center text-[13.5px] text-gray-400">
            No hero slides yet — the homepage banner will be empty until you add one.
          </div>
        )}
      </div>
    </div>
  );
}
