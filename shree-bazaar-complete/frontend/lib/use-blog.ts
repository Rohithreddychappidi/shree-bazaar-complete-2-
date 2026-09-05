"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string;
  author: { name: string | null } | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null } | null;
};

// Public: published posts only, for the storefront blog listing.
export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<BlogPostSummary[]>("/api/blog")
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return { posts, loading };
}

// Public: a single published post by slug, for the storefront detail page.
export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<BlogPost>(`/api/blog/${slug}`)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Post not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading, error };
}

// Staff: every post they can manage (their own if sub-admin, all of them if admin).
export function useAdminBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<BlogPost[]>("/api/blog/admin");
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const deletePost = async (id: string) => {
    await api.delete(`/api/blog/${id}`);
    await refresh();
  };

  return { posts, loading, error, refresh, deletePost };
}

// Staff: a single post (including drafts) by ID, for the edit form.
export function useAdminBlogPost(id: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no id means nothing to fetch, not a derived-state anti-pattern
      setLoading(false);
      return;
    }
    api
      .get<BlogPost>(`/api/blog/admin/${id}`)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [id]);

  return { post, loading };
}