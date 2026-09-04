"use client";

import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">New Post</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Write a new blog post.</p>
      <div className="max-w-[720px]">
        <BlogForm />
      </div>
    </div>
  );
}
