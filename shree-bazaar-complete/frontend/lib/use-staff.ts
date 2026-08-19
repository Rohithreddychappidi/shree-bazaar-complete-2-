"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
};

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<StaffMember[]>("/api/staff");
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sub-admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const addStaff = async (member: { name: string; email: string; password: string }) => {
    await api.post("/api/staff", member);
    await refresh();
  };
  const removeStaff = async (id: string) => {
    await api.delete(`/api/staff/${id}`);
    await refresh();
  };

  return { staff, loading, error, refresh, addStaff, removeStaff };
}
