"use client";

import { Plus } from "lucide-react";
import { savedCards } from "@/lib/profile-data";

export default function PaymentsPage() {
  return (
    <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Saved Payment Methods</h3>
        <button className="flex items-center gap-1.5 text-[13px] font-semibold text-purple-700">
          <Plus size={15} /> Add Card
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {savedCards.map((c) => (
          <div key={c.last4} className="flex items-center justify-between rounded-xl bg-[#F8F8FC] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-12 items-center justify-center rounded-md bg-purple-700 text-[10px] font-bold text-white">
                {c.brand.slice(0, 4).toUpperCase()}
              </div>
              <div>
                <div className="text-[13.5px] font-semibold text-gray-900">•••• •••• •••• {c.last4}</div>
                <div className="text-[12px] text-gray-500">Expires {c.expiry}</div>
              </div>
            </div>
            <button className="text-[12.5px] font-medium text-red-500">Remove</button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11.5px] text-gray-400">
        Card payments will be processed securely via Razorpay once checkout is connected — no card data is
        stored on our own servers.
      </p>
    </div>
  );
}
