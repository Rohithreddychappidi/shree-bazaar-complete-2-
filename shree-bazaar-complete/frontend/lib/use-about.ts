"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type AboutContent = {
  heroImage: string | null;
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyContent: string;
};

export function useAboutContent() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await api.get<AboutContent>("/api/about");
    setContent(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh is stable, only needs to run on mount
  }, []);

  const save = async (updates: AboutContent) => {
    await api.put("/api/about", updates);
    await refresh();
  };

  return { content, loading, refresh, save };
}