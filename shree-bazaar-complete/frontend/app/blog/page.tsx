"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useBlogPosts } from "@/lib/use-blog";

export default function BlogPage() {
  const { posts, loading } = useBlogPosts();

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-8 text-center">
        <p className="mb-1 text-[12px] font-semibold tracking-[2px] text-purple-700 uppercase">Our Journal</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">From the Shop Hemu Blog</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" /> Loading posts…
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="py-16 text-center text-[13.5px] text-gray-400">No posts published yet — check back soon.</p>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-2xl border border-[#EFEDF8] bg-white">
            {post.coverImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-50">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-5">
              <p className="mb-1.5 text-[11.5px] text-gray-400">
                {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {post.author?.name && ` · ${post.author.name}`}
              </p>
              <h2 className="mb-1.5 font-display text-lg font-bold text-gray-900 group-hover:text-purple-700">{post.title}</h2>
              <p className="line-clamp-2 text-[13.5px] text-gray-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
