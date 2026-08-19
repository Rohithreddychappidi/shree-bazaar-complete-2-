"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
};

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<HeroSlide[]>("/api/hero-slides");
      setSlides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const addSlide = async (slide: Omit<HeroSlide, "id">) => {
    await api.post("/api/hero-slides", slide);
    await refresh();
  };
  const updateSlide = async (id: string, updates: Omit<HeroSlide, "id">) => {
    await api.put(`/api/hero-slides/${id}`, updates);
    await refresh();
  };
  const deleteSlide = async (id: string) => {
    await api.delete(`/api/hero-slides/${id}`);
    await refresh();
  };

  return { slides, loading, error, refresh, addSlide, updateSlide, deleteSlide };
}
