"use client";

import { useCallback, useEffect, useState } from "react";
import { Address } from "./types";
import { api } from "./api";
import { useAuth } from "./auth-context";

// Small shared hook (not a Context — addresses only matter on the addresses tab and
// checkout, both of which can fetch independently without needing a global provider).
export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await api.get<Address[]>("/api/addresses");
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount/user change, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const addAddress = async (address: Omit<Address, "id">) => {
    await api.post("/api/addresses", address);
    await refresh();
  };
  const updateAddress = async (id: string, updates: Omit<Address, "id">) => {
    await api.put(`/api/addresses/${id}`, updates);
    await refresh();
  };
  const removeAddress = async (id: string) => {
    await api.delete(`/api/addresses/${id}`);
    await refresh();
  };

  return { addresses, loading, error, refresh, addAddress, updateAddress, removeAddress };
}
