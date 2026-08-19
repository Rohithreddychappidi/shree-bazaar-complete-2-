"use client";

import { useState } from "react";
import { Truck, Loader2, RefreshCw } from "lucide-react";
import { useAdminOrders } from "@/lib/use-admin-orders";

export default function AdminOrdersPage() {
  const { orders, loading, error, retryShiprocket } = useAdminOrders();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryShiprocket(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Shiprocket retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Every order across all customers, live from Postgres.</p>

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
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Shipments</th>
                <th className="px-5 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const shipped = o.shipments.filter((s) => s.shiprocketOrderId);
                const pending = o.shipments.filter((s) => !s.shiprocketOrderId);
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
                        {shipped.map((s) => (
                          <span key={s.id} className="flex items-center gap-1.5 text-gray-600">
                            <Truck size={13} className="text-purple-700" />
                            <span className="text-[11.5px]">{s.pickupLocation}: {s.trackingId}</span>
                          </span>
                        ))}
                        {pending.length > 0 && (
                          <button
                            onClick={() => handleRetry(o.id)}
                            disabled={retryingId === o.id}
                            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-purple-700 disabled:opacity-50"
                          >
                            {retryingId === o.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                            {retryingId === o.id ? "Retrying…" : `Create Shipment${pending.length > 1 ? "s" : ""} (${pending.length})`}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">₹{o.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && <div className="p-10 text-center text-[13.5px] text-gray-400">No orders yet.</div>}
        </div>
      )}

      <p className="mt-4 text-[11.5px] text-gray-400">
        An order can have more than one shipment if its items ship from different pickup locations (set per
        product). Shipments without a tracking ID either failed at checkout time or Shiprocket wasn&apos;t
        configured yet — use &quot;Create Shipment(s)&quot; to retry just the missing ones.
      </p>
    </div>
  );
}
