"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useHeroSlides } from "@/lib/use-hero-slides";
import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { slides, loading } = useHeroSlides();
  const slide = slides.find((s) => s.id === id);

  if (loading) return <p className="text-[13.5px] text-gray-400">Loading…</p>;
  if (!slide) return notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Edit Hero Slide</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Editing &quot;{slide.title}&quot;</p>
      <div className="max-w-[640px]">
        <HeroSlideForm existing={slide} />
      </div>
    </div>
  );
}
