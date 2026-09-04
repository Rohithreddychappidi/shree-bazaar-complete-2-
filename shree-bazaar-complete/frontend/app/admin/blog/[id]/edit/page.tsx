"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminBlogPost } from "@/lib/use-blog";
import BlogForm from "@/components/admin/BlogForm";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { post, loading } = useAdminBlogPost(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
        <Loader2 size={20} className="animate-spin" /> Loading post…
      </div>
    );
  }
  if (!post) return notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Edit Post</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Editing &quot;{post.title}&quot;</p>
      <div className="max-w-[720px]">
        <BlogForm existing={post} />
      </div>
    </div>
  );
}
