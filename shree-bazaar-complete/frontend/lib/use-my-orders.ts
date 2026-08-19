"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { AdminOrder } from "./use-admin-orders";

// Sub-admin (or admin) scoped view: orders containing at least one product the logged-in
// staff member personally added. Unlike use-admin-orders.ts's GET /api/admin/orders
// (master-admin-only, every order in the store), this hits GET /api/my/orders which any
// staff member can call, filtered server-side to just their own products' orders.
export function useMyOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<AdminOrder[]>("/api/my/orders");
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

  return { orders, loading, error, refresh };
}
