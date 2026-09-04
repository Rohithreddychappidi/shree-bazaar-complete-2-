"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { BlogPost } from "@/lib/use-blog";

export default function BlogForm({ existing }: { existing?: BlogPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? "");
  const [metaTitle, setMetaTitle] = useState(existing?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(existing?.metaDescription ?? "");
  const [published, setPublished] = useState(existing?.published ?? false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);
      const { urls } = await api.post<{ urls: string[] }>("/api/uploads", formData);
      setCoverImage(urls[0]);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { title, excerpt, content, coverImage: coverImage || null, metaTitle: metaTitle || null, metaDescription: metaDescription || null, published };
    try {
      if (existing) {
        await api.put(`/api/blog/${existing.id}`, payload);
      } else {
        await api.post("/api/blog", payload);
      }
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <div className="rounded-xl bg-red-50 p-3 text-[13px] text-red-600">{error}</div>}

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="5 Reasons Homemade Pickles Beat Store-Bought"
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Excerpt</label>
        <textarea
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary shown on the blog listing page and when shared on social media."
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Cover Image</label>
        {coverImage ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview thumbnail, no LCP concern */}
            <img src={coverImage} alt="Cover" className="h-32 w-56 rounded-xl object-cover" />
            <button type="button" onClick={() => setCoverImage("")} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
              <X size={13} />
            </button>
          </div>
        ) : (
          <label className="flex h-32 w-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E7E4F4] bg-[#F8F8FC] text-gray-400 hover:border-purple-400">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            <span className="text-[12px]">{uploading ? "Uploading…" : "Click to upload"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
          </label>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
          Content <span className="font-normal text-gray-400">(Markdown supported — ## for headings, **bold**, [link](url), etc.)</span>
        </label>
        <textarea
          required
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="## Why Homemade Wins&#10;&#10;Write your post here in Markdown..."
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 font-mono text-[13px] outline-none focus:border-purple-400"
        />
      </div>

      <div className="rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] p-4">
        <h3 className="mb-3 text-[13px] font-semibold text-gray-700">SEO (optional — falls back to Title/Excerpt if left blank)</h3>
        <div className="mb-3">
          <label className="mb-1.5 block text-[12.5px] font-medium text-gray-600">Meta Title</label>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-[13px] outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-gray-600">Meta Description</label>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-[13px] outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-3">
        <div>
          <label htmlFor="published-toggle" className="block text-[13px] font-medium text-gray-700">Published</label>
          <p className="mt-0.5 text-[11.5px] text-gray-400">Off saves this as a draft — only visible in the admin panel.</p>
        </div>
        <button
          id="published-toggle"
          type="button"
          role="switch"
          aria-checked={published}
          onClick={() => setPublished((v) => !v)}
          className={`flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${published ? "bg-purple-700" : "bg-gray-300"}`}
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${published ? "translate-x-5.5" : "translate-x-0.5"}`} />
        </button>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="self-start rounded-xl bg-purple-700 px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : existing ? "Save Changes" : "Create Post"}
      </button>
    </form>
  );
}
