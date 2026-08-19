"use client";

import { useCallback, useEffect, useState } from "react";
import { Coupon } from "./types";
import { api } from "./api";

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<Coupon[]>("/api/coupons");
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const addCoupon = async (coupon: Omit<Coupon, "id" | "usedCount" | "product">) => {
    await api.post("/api/coupons", coupon);
    await refresh();
  };
  const updateCoupon = async (id: string, updates: Omit<Coupon, "id" | "usedCount" | "product">) => {
    await api.put(`/api/coupons/${id}`, updates);
    await refresh();
  };
  const deleteCoupon = async (id: string) => {
    await api.delete(`/api/coupons/${id}`);
    await refresh();
  };

  return { coupons, loading, error, refresh, addCoupon, updateCoupon, deleteCoupon };
}

export type CouponValidation = {
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  productId: string | null;
};

// Shared validate call used by both the product page preview and checkout.
export async function validateCoupon(code: string, productId?: string) {
  return api.post<CouponValidation>("/api/coupons/validate", { code, productId });
}
