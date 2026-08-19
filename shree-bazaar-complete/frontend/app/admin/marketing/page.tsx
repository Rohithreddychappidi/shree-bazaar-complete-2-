"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Send, Users } from "lucide-react";
import { useMarketingCustomers, sendBroadcast, BroadcastResult } from "@/lib/use-marketing";
import Button from "@/components/Button";

export default function AdminMarketingPage() {
  const { customers, whatsappConfigured, loading } = useMarketingCustomers();
  const [templateName, setTemplateName] = useState("");
  const [param1, setParam1] = useState("");
  const [param2, setParam2] = useState("");
  const [testOnly, setTestOnly] = useState(true);
  const [testCustomerId, setTestCustomerId] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const params = [param1, param2].filter(Boolean);
      const ids = testOnly && testCustomerId ? [testCustomerId] : undefined;
      const res = await sendBroadcast(templateName, params, ids);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Marketing</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">WhatsApp broadcasts to customers who opted in.</p>

      {!whatsappConfigured && (
        <div className="mb-6 flex gap-2.5 rounded-2xl bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="text-[12.5px] leading-relaxed text-amber-800">
            <p className="mb-1 font-semibold">WhatsApp isn&apos;t configured yet.</p>
            <p>
              This needs a Meta Business Account, a verified WhatsApp Business number, a permanent access
              token, and approved message templates before anything can send — set{" "}
              <code>WHATSAPP_ACCESS_TOKEN</code> and <code>WHATSAPP_PHONE_NUMBER_ID</code> in the backend&apos;s{" "}
              <code>.env</code> once you&apos;ve completed that setup. See <code>backend/README.md</code> for
              the full explanation.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users size={17} className="text-purple-700" />
          <h2 className="text-base font-semibold text-gray-900">Opted-in Customers</h2>
          <span className="ml-auto text-[13px] text-gray-500">{customers.length}</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : customers.length === 0 ? (
          <p className="text-[13px] text-gray-400">
            No one&apos;s opted in yet — customers see the WhatsApp opt-in prompt after their first login.
          </p>
        ) : (
          <div className="max-h-[220px] overflow-y-auto">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-t border-[#EFEDF8] py-2.5 text-[13px] first:border-t-0">
                <span className="font-medium text-gray-900">{c.name ?? c.email}</span>
                <span className="text-gray-500">{c.whatsappNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Send a Broadcast</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">
          Sends an already-approved WhatsApp template — you can&apos;t send arbitrary free text here, that&apos;s a
          Meta restriction on business-initiated messages.
        </p>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Template Name</label>
            <input
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Exactly as approved in Meta"
              className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Param 1 (optional)</label>
            <input value={param1} onChange={(e) => setParam1(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Param 2 (optional)</label>
            <input value={param2} onChange={(e) => setParam2(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
        </div>

        <label className="mb-3 flex items-center gap-2 text-[13px] font-medium text-gray-700">
          <input type="checkbox" checked={testOnly} onChange={(e) => setTestOnly(e.target.checked)} className="accent-purple-700" />
          Send to one customer only (test before a real blast)
        </label>
        {testOnly && (
          <select
            value={testCustomerId}
            onChange={(e) => setTestCustomerId(e.target.value)}
            className="mb-4 w-full max-w-[320px] rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name ?? c.email} — {c.whatsappNumber}</option>
            ))}
          </select>
        )}

        {error && <p className="mb-3 text-[12.5px] text-red-500">{error}</p>}
        {result && (
          <p className="mb-3 text-[12.5px] text-green-600">
            Sent to {result.sent}, failed for {result.failed}.
          </p>
        )}

        <Button className={`w-fit ${sending || !whatsappConfigured ? "pointer-events-none opacity-50" : ""}`} onClick={() => {}}>
          <Send size={15} />
          {sending ? "Sending..." : testOnly ? "Send Test" : `Send to All ${customers.length}`}
        </Button>
      </form>
    </div>
  );
}
