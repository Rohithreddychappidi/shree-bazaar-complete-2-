"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coupon } from "@/lib/types";
import { useCoupons } from "@/lib/use-coupons";
import { useAdminData } from "@/lib/admin-data-context";
import Button from "@/components/Button";

const toLocalInput = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export default function CouponForm({ existing }: { existing?: Coupon }) {
  const router = useRouter();
  const { addCoupon, updateCoupon } = useCoupons();
  const { products } = useAdminData();

  const [code, setCode] = useState(existing?.code ?? "");
  const [discountType, setDiscountType] = useState<Coupon["discountType"]>(existing?.discountType ?? "PERCENT");
  const [discountValue, setDiscountValue] = useState(existing?.discountValue?.toString() ?? "");
  const [productId, setProductId] = useState(existing?.productId ?? "");
  const [startsAt, setStartsAt] = useState(toLocalInput(existing?.startsAt) || toLocalInput(new Date().toISOString()));
  const [endsAt, setEndsAt] = useState(toLocalInput(existing?.endsAt));
  const [maxUses, setMaxUses] = useState(existing?.maxUses?.toString() ?? "");
  const [active, setActive] = useState(existing?.active ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      productId: productId || null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      maxUses: maxUses ? Number(maxUses) : null,
      active,
    };
    try {
      if (existing) {
        await updateCoupon(existing.id, payload);
      } else {
        await addCoupon(payload);
      }
      router.push("/admin/coupons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Coupon Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm font-mono outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Applies To</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400">
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Discount Type</label>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as Coupon["discountType"])} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400">
            <option value="PERCENT">Percent off</option>
            <option value="FLAT">Flat amount off (₹)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
            Discount Value {discountType === "PERCENT" ? "(%)" : "(₹)"}
          </label>
          <input required type="number" min="1" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Sale Starts</label>
          <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Sale Ends</label>
          <input required type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Max Uses (optional)</label>
          <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2.5 text-[13px] font-medium text-gray-700">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-purple-700" />
            Active
          </label>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button className={`w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
          {saving ? "Saving..." : existing ? "Save Changes" : "Create Coupon"}
        </Button>
        <button type="button" onClick={() => router.push("/admin/coupons")} className="rounded-xl border border-[#E7E4F4] px-6 py-3 text-sm font-semibold text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
