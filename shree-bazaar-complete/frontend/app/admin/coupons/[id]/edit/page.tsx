"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useCoupons } from "@/lib/use-coupons";
import CouponForm from "@/components/admin/CouponForm";

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { coupons, loading } = useCoupons();
  const coupon = coupons.find((c) => c.id === id);

  if (loading) return <p className="text-[13.5px] text-gray-400">Loading…</p>;
  if (!coupon) return notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Edit Coupon</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Editing &quot;{coupon.code}&quot;</p>
      <div className="max-w-[700px]">
        <CouponForm existing={coupon} />
      </div>
    </div>
  );
}
