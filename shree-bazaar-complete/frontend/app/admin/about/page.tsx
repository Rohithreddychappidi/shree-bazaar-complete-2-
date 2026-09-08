"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, X, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAboutContent } from "@/lib/use-about";

export default function AdminAboutPage() {
  const { content, loading, save } = useAboutContent();
  const [heroImage, setHeroImage] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!content) return;
    /* eslint-disable react-hooks/set-state-in-effect -- populating form fields once when content first loads, not a derived-state anti-pattern */
    setHeroImage(content.heroImage ?? "");
    setHeroTitle(content.heroTitle);
    setHeroSubtitle(content.heroSubtitle);
    setStoryTitle(content.storyTitle);
    setStoryContent(content.storyContent);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [content]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);
      const { urls } = await api.post<{ urls: string[] }>("/api/uploads", formData);
      setHeroImage(urls[0]);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await save({ heroImage: heroImage || null, heroTitle, heroSubtitle, storyTitle, storyContent });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
        <Loader2 size={20} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">About Page</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Edit the content shown on the public /about page.</p>

      <form onSubmit={handleSubmit} className="flex max-w-[720px] flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Hero Image</label>
          {heroImage ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview thumbnail */}
              <img src={heroImage} alt="Hero" className="h-32 w-56 rounded-xl object-cover" />
              <button type="button" onClick={() => setHeroImage("")} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
                <X size={13} />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E7E4F4] bg-[#F8F8FC] text-gray-400 hover:border-purple-400">
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              <span className="text-[12px]">{uploading ? "Uploading…" : "Click to upload"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Hero Subtitle (small label above the title)</label>
            <input
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Hero Title</label>
            <input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Story Section Heading</label>
          <input
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
            Story Content <span className="font-normal text-gray-400">(Markdown supported)</span>
          </label>
          <textarea
            rows={10}
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 font-mono text-[13px] outline-none focus:border-purple-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="flex w-fit items-center gap-2 rounded-xl bg-purple-700 px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
        >
          {saved ? <Check size={16} /> : null}
          {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
        </button>
      </form>

      <p className="mt-6 max-w-[720px] text-[11.5px] text-gray-400">
        The Values, Timeline, and Team sections further down the About page aren&apos;t editable here yet — they're
        still built directly into the page code. Let us know if those should become editable too.
      </p>
    </div>
  );
}