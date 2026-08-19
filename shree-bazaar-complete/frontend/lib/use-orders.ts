"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth-context";

export type OrderItem = {
  id: string;
  name: string;
  variantLabel: string | null;
  price: number;
  quantity: number;
};

export type Shipment = {
  id: string;
  pickupLocation: string;
  shiprocketOrderId: string | null;
  trackingId: string | null;
  status: string;
};

export type Order = {
  id: string;
  status: string;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  couponCode: string | null;
  total: number;
  paymentMethod: string;
  trackingId: string | null; // legacy — prefer `shipments` below, which supports multi-warehouse orders
  shipments: Shipment[];
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  items: OrderItem[];
};

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await api.get<Order[]>("/api/orders");
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount/user change, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}

// Single-order fetch + cancel action, used by the order detail page.
export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<Order>(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount/id change, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const cancelOrder = async (reason: string) => {
    const updated = await api.post<Order>(`/api/orders/${id}/cancel`, { reason });
    setOrder((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  return { order, loading, error, refresh, cancelOrder };
}
