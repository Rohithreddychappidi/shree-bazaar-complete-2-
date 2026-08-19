"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type MarketingCustomer = {
  id: string;
  name: string | null;
  email: string;
  whatsappNumber: string;
  createdAt: string;
};

export function useMarketingCustomers() {
  const [customers, setCustomers] = useState<MarketingCustomer[]>([]);
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<{ customers: MarketingCustomer[]; whatsappConfigured: boolean }>("/api/marketing/customers");
      setCustomers(data.customers);
      setWhatsappConfigured(data.whatsappConfigured);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  return { customers, whatsappConfigured, loading, error, refresh };
}

export type BroadcastResult = {
  sent: number;
  failed: number;
  results: { userId: string; name: string | null; sent: boolean; reason?: string }[];
};

export async function sendBroadcast(templateName: string, bodyParams: string[], customerIds?: string[]) {
  return api.post<BroadcastResult>("/api/marketing/broadcast", { templateName, bodyParams, customerIds });
}
