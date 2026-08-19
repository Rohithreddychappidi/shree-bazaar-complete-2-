"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type StoreSettings = {
  storeName: string;
  freeShippingThreshold: number;
  cancellationPolicy: string;
  cancellationWindowHours: number;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialLinkedin: string | null;
  announcementText: string;
  announcementEnabled: boolean;
  defaultPickupLocation: string;
  defaultPickupPincode: string | null;
};

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<StoreSettings>("/api/settings");
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const saveSettings = async (updates: StoreSettings) => {
    const data = await api.put<StoreSettings>("/api/settings", updates);
    setSettings(data);
  };

  return { settings, loading, error, refresh, saveSettings };
}