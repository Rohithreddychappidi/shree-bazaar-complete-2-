"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useOrders } from "@/lib/use-orders";

export default function ProfileOverviewPage() {
  const { wishlist } = useStore();
  const { orders, loading } = useOrders();
  const lifetimeSpend = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <div className="grid grid-cols-3 divide-x divide-[#EFEDF8] text-center">
          <div>
            <div className="text-xl font-bold text-purple-700">{orders.length}</div>
            <div className="text-[12px] text-gray-500">Orders</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">{wishlist.length}</div>
            <div className="text-[12px] text-gray-500">Wishlist</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">₹{lifetimeSpend}</div>
            <div className="text-[12px] text-gray-500">Lifetime Spend</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
          <Link href="/profile/orders" className="text-[13px] font-semibold text-purple-700">View all</Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
            <Loader2 size={18} className="animate-spin" /> Loading…
          </div>
        )}

        {!loading && orders.length === 0 && <p className="text-[13px] text-gray-400">No orders yet.</p>}

        <div className="flex flex-col gap-3">
          {orders.slice(0, 3).map((o) => {
            const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8F8FC] px-4 py-3 text-[13px]">
                <div>
                  <div className="font-semibold text-gray-900">#{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    &nbsp;•&nbsp; {itemCount} item{itemCount > 1 ? "s" : ""}
                  </div>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold ${
                    o.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {o.status}
                </span>
                <div className="font-semibold text-gray-900">₹{o.total}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
