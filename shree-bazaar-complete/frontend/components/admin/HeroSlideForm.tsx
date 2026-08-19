"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { HeroSlide, useHeroSlides } from "@/lib/use-hero-slides";
import { api } from "@/lib/api";
import Button from "@/components/Button";

export default function HeroSlideForm({ existing }: { existing?: HeroSlide }) {
  const router = useRouter();
  const { addSlide, updateSlide } = useHeroSlides();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eyebrow, setEyebrow] = useState(existing?.eyebrow ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [text, setText] = useState(existing?.text ?? "");
  const [image, setImage] = useState(existing?.image ?? "");
  const [ctaLabel, setCtaLabel] = useState(existing?.ctaLabel ?? "Shop Now");
  const [ctaHref, setCtaHref] = useState(existing?.ctaHref ?? "/products");
  const [sortOrder, setSortOrder] = useState(String(existing?.sortOrder ?? 0));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("images", fileList[0]);
      const { urls } = await api.post<{ urls: string[] }>("/api/uploads", formData);
      setImage(urls[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("Upload a banner image first.");
      return;
    }
    const slide = { eyebrow, title, text, image, ctaLabel, ctaHref, sortOrder: Number(sortOrder) || 0 };
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        await updateSlide(existing.id, slide);
      } else {
        await addSlide(slide);
      }
      router.push("/admin/hero-slides");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save slide");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Banner Image</label>
        {image && (
          <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-purple-50">
            <Image src={image} alt="" fill className="object-cover" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl border-2 border-dashed border-[#E7E4F4] px-4 py-2.5 text-[13px] font-medium text-gray-500 hover:border-purple-400 hover:text-purple-700 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? "Uploading…" : image ? "Replace image" : "Upload image"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Eyebrow (small label above title)</label>
        <input required value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="e.g. New Season" className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Description</label>
        <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Button Text</label>
          <input required value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Button Link</label>
          <input required value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="/products?category=women" className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button className={`w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
          {saving ? "Saving..." : existing ? "Save Changes" : "Create Slide"}
        </Button>
        <button type="button" onClick={() => router.push("/admin/hero-slides")} className="rounded-xl border border-[#E7E4F4] px-6 py-3 text-sm font-semibold text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
