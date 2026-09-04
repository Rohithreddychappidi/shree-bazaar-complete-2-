import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Post = {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  author: { name: string | null } | null;
};

async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | Shop Hemu" };

  const title = post.metaTitle || `${post.title} | Shop Hemu Blog`;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  const rawHtml = await marked.parse(post.content);
  const html = DOMPurify.sanitize(rawHtml);

  return (
    <main className="mx-auto max-w-[760px] px-6 py-10">
      <Link href="/blog" className="mb-6 inline-block text-[13px] font-medium text-purple-700 hover:underline">
        ← Back to Blog
      </Link>

      <p className="mb-2 text-[12px] font-semibold tracking-[1px] text-gray-400 uppercase">
        {post.publishedAt &&
          new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {post.author?.name && ` · ${post.author.name}`}
      </p>
      <h1 className="mb-6 font-display text-3xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>

      {post.coverImage && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-purple-50">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <article
        className="prose prose-gray max-w-none prose-headings:font-display prose-a:text-purple-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-10 rounded-2xl border border-[#EFEDF8] bg-purple-50 p-6 text-center">
        <p className="mb-3 font-display text-lg font-bold text-gray-900">Ready to shop?</p>
        <Link href="/products" className="inline-block rounded-xl bg-purple-700 px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-purple-800">
          Browse Products
        </Link>
      </div>
    </main>
  );
}
