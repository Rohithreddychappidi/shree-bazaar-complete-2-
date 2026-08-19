"use client";

import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCoupons } from "@/lib/use-coupons";

export default function AdminCouponsPage() {
  const { coupons, loading, deleteCoupon } = useCoupons();

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  };

  const statusOf = (c: (typeof coupons)[number]) => {
    const now = new Date();
    if (!c.active) return { label: "Disabled", cls: "bg-gray-100 text-gray-600" };
    if (now < new Date(c.startsAt)) return { label: "Upcoming", cls: "bg-purple-100 text-purple-700" };
    if (now > new Date(c.endsAt)) return { label: "Expired", cls: "bg-red-100 text-red-600" };
    if (c.maxUses !== null && c.usedCount >= c.maxUses) return { label: "Used up", cls: "bg-red-100 text-red-600" };
    return { label: "Active", cls: "bg-green-100 text-green-700" };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">{coupons.length} coupons</p>
        </div>
        <Link href="/admin/coupons/new" className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800">
          <Plus size={16} /> Add Coupon
        </Link>
      </div>

      {loading && <p className="text-[13.5px] text-gray-400">Loading…</p>}

      <div className="overflow-hidden rounded-2xl border border-[#EFEDF8] bg-white">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-[#F8F8FC] text-[12px] tracking-wide text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Applies To</th>
              <th className="px-5 py-3 font-medium">Valid</th>
              <th className="px-5 py-3 font-medium">Uses</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const status = statusOf(c);
              return (
                <tr key={c.id} className="border-t border-[#EFEDF8]">
                  <td className="px-5 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.product ? c.product.name : "All products"}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {new Date(c.startsAt).toLocaleDateString()} – {new Date(c.endsAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/coupons/${c.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-purple-700">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(c.id, c.code)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7E4F4] text-gray-500 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && coupons.length === 0 && <div className="p-10 text-center text-[13.5px] text-gray-400">No coupons yet.</div>}
      </div>
    </div>
  );
}
