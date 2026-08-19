"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { Order } from "./use-orders";

export type AdminOrder = Order & {
  user: { id: string; name: string | null; email: string; phone: string | null };
};

// Admin-only: every order from every customer (GET /api/admin/orders), unlike
// use-orders.ts's GET /api/orders which is scoped to the logged-in user.
export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<AdminOrder[]>("/api/admin/orders");
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const retryShiprocket = async (orderId: string) => {
    try {
      await api.post(`/api/admin/orders/${orderId}/shiprocket/retry`);
    } finally {
      // Refresh even on a partial failure (e.g. 2 of 3 shipments succeeded) — the
      // ones that worked should show up immediately rather than waiting on a reload.
      await refresh();
    }
  };

  return { orders, loading, error, refresh, retryShiprocket };
}