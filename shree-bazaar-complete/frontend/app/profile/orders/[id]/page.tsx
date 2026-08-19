"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, XCircle, Truck, CheckCircle2 } from "lucide-react";
import { useOrder } from "@/lib/use-orders";
import { useSettings } from "@/lib/use-settings";

const statusStyles: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Placed: "bg-purple-100 text-purple-700",
  Shipped: "bg-purple-100 text-purple-700",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, loading, error, cancelOrder } = useOrder(id);
  const { settings } = useSettings();
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the current time is an external-system read, not derivable during render
    setNow(Date.now());
  }, []);

  const windowHours = settings?.cancellationWindowHours ?? 8;
  const hoursSinceOrder = order && now ? (now - new Date(order.createdAt).getTime()) / (1000 * 60 * 60) : 0;
  const withinWindow = now !== null && hoursSinceOrder <= windowHours;
  const canCancel = order && now !== null && order.status !== "Delivered" && order.status !== "Cancelled" && withinWindow;

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(reason);
      setShowCancelForm(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
        <Loader2 size={20} className="animate-spin" /> Loading order…
      </div>
    );
  }

  if (error || !order) {
    return <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6 text-[13.5px] text-red-600">{error ?? "Order not found"}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/profile/orders" className="flex w-fit items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-purple-700">
        <ChevronLeft size={15} /> Back to orders
      </Link>

      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-[13px] text-gray-500">
              Placed {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold ${statusStyles[order.status] ?? "bg-gray-100 text-gray-700"}`}>
            {order.status === "Delivered" && <CheckCircle2 size={14} />}
            {order.status === "Cancelled" && <XCircle size={14} />}
            {(order.status === "Placed" || order.status === "Shipped") && <Truck size={14} />}
            {order.status}
          </span>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#EFEDF8] pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-[13.5px]">
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-[12px] text-gray-500">
                  {item.variantLabel && `${item.variantLabel} · `}Qty {item.quantity}
                </div>
              </div>
              <div className="font-semibold text-gray-900">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-[#EFEDF8] pt-4 text-[13.5px]">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {order.shipments.filter((s) => s.trackingId).length > 0 && (
          <div className="mt-4 flex flex-col gap-1.5">
            {order.shipments
              .filter((s) => s.trackingId)
              .map((s) => (
                <p key={s.id} className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                  <Truck size={14} className="text-purple-700" />
                  {order.shipments.length > 1 ? `${s.pickupLocation}: ` : ""}Shiprocket tracking: {s.trackingId}
                </p>
              ))}
          </div>
        )}

        {order.status === "Cancelled" && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-[12.5px] text-red-600">
            Cancelled {order.cancelledAt && new Date(order.cancelledAt).toLocaleString("en-IN")}
            {order.cancellationReason && ` — "${order.cancellationReason}"`}
          </div>
        )}
      </div>

      {/* Cancellation */}
      {order.status !== "Cancelled" && order.status !== "Delivered" && (
        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
          {canCancel ? (
            <>
              {!showCancelForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-gray-900">Need to cancel?</h3>
                    <p className="text-[12.5px] text-gray-500">
                      You can cancel within {windowHours} hours of placing an order — {Math.max(0, Math.round(windowHours - hoursSinceOrder))}h left on this one.
                    </p>
                  </div>
                  <button onClick={() => setShowCancelForm(true)} className="rounded-xl border-2 border-red-500 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50">
                    Cancel Order
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="mb-2 text-[13.5px] font-semibold text-gray-900">Cancel this order?</h3>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional)"
                    rows={2}
                    className="mb-3 w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2 text-sm outline-none"
                  />
                  {cancelError && <p className="mb-2 text-[12.5px] text-red-500">{cancelError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="rounded-xl bg-red-500 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
                    >
                      {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                    </button>
                    <button onClick={() => setShowCancelForm(false)} className="rounded-xl border border-[#E7E4F4] px-4 py-2 text-[13px] font-semibold text-gray-700">
                      Never mind
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[12.5px] text-gray-400">
              The {windowHours}-hour cancellation window for this order has passed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
