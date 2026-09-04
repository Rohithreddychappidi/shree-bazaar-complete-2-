"use client";

import Link from "next/link";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { useAdminBlogPosts } from "@/lib/use-blog";

export default function AdminBlogPage() {
  const { posts, loading, error, deletePost } = useAdminBlogPosts();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    await deletePost(id);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-[13.5px] text-gray-500">Write posts for SEO and customer engagement.</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-purple-800">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" /> Loading…
        </div>
      )}
      {error && <div className="rounded-2xl bg-red-50 p-6 text-[13.5px] text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-[#EFEDF8] bg-white">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[#F8F8FC] text-[12px] tracking-wide text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-[#EFEDF8]">
                  <td className="px-5 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{post.author?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(post.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blog/${post.id}/edit`} className="rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(post.id, post.title)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="p-10 text-center text-[13.5px] text-gray-400">No posts yet — create your first one.</div>}
        </div>
      )}
    </div>
  );
}
