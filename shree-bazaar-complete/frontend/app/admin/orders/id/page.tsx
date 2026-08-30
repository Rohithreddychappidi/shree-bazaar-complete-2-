"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Loader2, Truck } from "lucide-react";
import { useAdminOrder } from "@/lib/use-admin-orders";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <div className="text-[11.5px] font-medium text-gray-500">{label}</div>
      <button
        onClick={copy}
        className="mt-0.5 flex items-center gap-1.5 rounded-lg border border-[#EFEDF8] bg-[#F8F8FC] px-2.5 py-1.5 font-mono text-[12.5px] text-gray-800 hover:bg-purple-50"
      >
        {value}
        {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} className="text-gray-400" />}
      </button>
    </div>
  );
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, loading, error } = useAdminOrder(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
        <Loader2 size={20} className="animate-spin" /> Loading order…
      </div>
    );
  }
  if (error || !order) {
    return <div className="rounded-2xl bg-red-50 p-6 text-[13.5px] text-red-600">{error || "Order not found"}</div>;
  }

  return (
    <div className="max-w-[820px]">
      <Link href="/admin/orders" className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-purple-700">
        <ArrowLeft size={15} /> Back to Orders
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-[13.5px] text-gray-500">
            Placed {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <span
          className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-700"
              : order.status === "Cancelled"
                ? "bg-red-100 text-red-600"
                : "bg-purple-100 text-purple-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      {order.status === "Cancelled" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="mb-3 text-[15px] font-semibold text-red-700">Refund needed — cancelled order</h2>
          <p className="mb-3 text-[13px] text-red-600">
            Cancelling an order does NOT automatically refund the payment. Copy the payment ID below, search for it in
            the Razorpay dashboard (Payments tab), and issue a refund for ₹{order.total} manually.
          </p>
          <div className="flex flex-wrap gap-3">
            {order.razorpayPaymentId && <CopyField label="Razorpay Payment ID" value={order.razorpayPaymentId} />}
            {order.razorpayOrderId && <CopyField label="Razorpay Order ID" value={order.razorpayOrderId} />}
          </div>
          {order.cancellationReason && (
            <p className="mt-3 text-[12.5px] text-red-500">Reason given: {order.cancellationReason}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-5">
          <h2 className="mb-3 text-[14px] font-semibold text-gray-900">Customer</h2>
          <div className="space-y-1 text-[13.5px] text-gray-700">
            <div>{order.user.name ?? "—"}</div>
            <div className="text-gray-500">{order.user.email}</div>
            {order.user.phone && <div className="text-gray-500">{order.user.phone}</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-5">
          <h2 className="mb-3 text-[14px] font-semibold text-gray-900">Delivery Address</h2>
          <div className="space-y-1 text-[13.5px] text-gray-700">
            <div className="font-medium">{order.addressSnapshot.name}</div>
            <div className="text-gray-500">{order.addressSnapshot.line}</div>
            <div className="text-gray-500">{order.addressSnapshot.city}</div>
            <div className="text-gray-500">{order.addressSnapshot.phone}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-5 md:col-span-2">
          <h2 className="mb-3 text-[14px] font-semibold text-gray-900">Payment</h2>
          <div className="mb-3 text-[13.5px] text-gray-700">
            Method: <span className="font-medium">{order.paymentMethod}</span>
          </div>
          {(order.razorpayPaymentId || order.razorpayOrderId) && (
            <div className="flex flex-wrap gap-3">
              {order.razorpayPaymentId && <CopyField label="Razorpay Payment ID" value={order.razorpayPaymentId} />}
              {order.razorpayOrderId && <CopyField label="Razorpay Order ID" value={order.razorpayOrderId} />}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-5 md:col-span-2">
          <h2 className="mb-3 text-[14px] font-semibold text-gray-900">Items</h2>
          <div className="divide-y divide-[#EFEDF8]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 text-[13.5px]">
                <div>
                  <div className="text-gray-800">{item.name}</div>
                  {item.variantLabel && <div className="text-[12px] text-gray-500">{item.variantLabel}</div>}
                </div>
                <div className="text-gray-600">
                  {item.quantity} × ₹{item.price}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-[#EFEDF8] pt-3 text-[14px] font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {order.shipments.length > 0 && (
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-5 md:col-span-2">
            <h2 className="mb-3 text-[14px] font-semibold text-gray-900">Shipments</h2>
            <div className="flex flex-col gap-2">
              {order.shipments.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-[13.5px] text-gray-700">
                  <Truck size={14} className="text-purple-700" />
                  {s.pickupLocation}: {s.trackingId || "not yet shipped"} — {s.status}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
