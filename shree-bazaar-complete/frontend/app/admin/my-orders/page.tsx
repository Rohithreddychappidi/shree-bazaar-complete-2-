"use client";

import { Truck, Loader2 } from "lucide-react";
import { useMyOrders } from "@/lib/use-my-orders";

export default function MyOrdersPage() {
  const { orders, loading, error } = useMyOrders();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">My Orders</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">
        Orders that include at least one product you added.
      </p>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" /> Loading orders…
        </div>
      )}

      {!loading && error && <div className="rounded-2xl bg-red-50 p-6 text-[13.5px] text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-[#EFEDF8] bg-white">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[#F8F8FC] text-[12px] tracking-wide text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Delivery Address</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Shipments</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const shipped = o.shipments.filter((s) => s.shiprocketOrderId);
                return (
                  <tr key={o.id} className="border-t border-[#EFEDF8]">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-900">#{o.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[11.5px] text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <div>{o.user.name ?? "—"}</div>
                      <div className="text-[11.5px] text-gray-400">{o.user.email}</div>
                      {o.user.phone && <div className="text-[11.5px] text-gray-400">{o.user.phone}</div>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <div className="max-w-[220px]">
                        <div className="font-medium text-gray-800">{o.addressSnapshot.name}</div>
                        <div className="text-[11.5px] text-gray-500">{o.addressSnapshot.line}, {o.addressSnapshot.city}</div>
                        <div className="text-[11.5px] text-gray-400">{o.addressSnapshot.phone}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                          o.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1.5">
                        {shipped.length === 0 && <span className="text-[11.5px] text-gray-400">Not yet shipped</span>}
                        {shipped.map((s) => (
                          <span key={s.id} className="flex items-center gap-1.5 text-gray-600">
                            <Truck size={13} className="text-purple-700" />
                            <span className="text-[11.5px]">{s.pickupLocation}: {s.trackingId}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">₹{o.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-10 text-center text-[13.5px] text-gray-400">
              No orders yet for the products you&apos;ve added.
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-[11.5px] text-gray-400">
        This view only shows orders containing at least one product you personally added. If an order also
        includes products added by someone else, you&apos;ll still see the full order here — line items aren&apos;t
        split by who added each product. Shipment creation and retries are handled by the store admin.
      </p>
    </div>
  );
}
