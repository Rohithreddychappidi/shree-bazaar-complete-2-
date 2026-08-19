"use client";

import Link from "next/link";
import { Loader2, Package, ChevronRight } from "lucide-react";
import { useOrders } from "@/lib/use-orders";

export default function OrdersPage() {
  const { orders, loading, error } = useOrders();

  return (
    <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-gray-900">All Orders</h3>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading orders…
        </div>
      )}

      {!loading && error && <div className="rounded-xl bg-red-50 p-4 text-[13px] text-red-600">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <Package size={22} />
          <p className="text-[13px]">No orders yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((o) => {
          const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <Link href={`/profile/orders/${o.id}`} key={o.id} className="block rounded-xl bg-[#F8F8FC] px-4 py-3 text-[13px] transition-colors hover:bg-purple-50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-gray-900">#{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    &nbsp;•&nbsp; {itemCount} item{itemCount > 1 ? "s" : ""}
                  </div>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold ${
                    o.status === "Delivered" ? "bg-green-100 text-green-700" : o.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {o.status}
                </span>
                <div className="font-semibold text-gray-900">₹{o.total}</div>
                <ChevronRight size={15} className="text-gray-400" />
              </div>
              {o.shipments.some((s) => s.trackingId) && (
                <p className="mt-2 text-[11.5px] text-gray-500">
                  Tracking (Shiprocket): {o.shipments.filter((s) => s.trackingId).map((s) => s.trackingId).join(", ")}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
