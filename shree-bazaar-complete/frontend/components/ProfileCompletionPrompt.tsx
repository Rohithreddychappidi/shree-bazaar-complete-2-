"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Shown once, right after a customer's first Google login, if they haven't been through
// this yet (profileCompletedAt is null). Asks for a WhatsApp number + marketing consent
// so order/offer messages can actually reach them later. Skippable — never blocks
// browsing or checkout, and never shown again once dismissed either way.
export default function ProfileCompletionPrompt() {
  const { user, updateProfile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "CUSTOMER" || user.profileCompletedAt || dismissed) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ whatsappNumber, marketingConsent, markProfileComplete: true });
    } catch {
      // best-effort — don't block them over this
    } finally {
      setSaving(false);
      setDismissed(true);
    }
  };

  const handleSkip = async () => {
    setDismissed(true);
    try {
      await updateProfile({ markProfileComplete: true });
    } catch {
      // fine if this fails silently — worst case we ask again next visit
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#EFEDF8] bg-white p-4 shadow-[0_-8px_24px_rgba(17,24,39,0.08)] sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-[420px] sm:-translate-x-1/2 sm:rounded-2xl sm:border">
      <button onClick={handleSkip} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Dismiss">
        <X size={16} />
      </button>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
          <MessageCircle size={17} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-[13.5px] font-semibold text-gray-900">Get order updates on WhatsApp</h3>
          <p className="text-[11.5px] text-gray-500">Optional — skip anytime</p>
        </div>
      </div>
      <form onSubmit={handleSave} className="flex flex-col gap-2.5">
        <input
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="WhatsApp number (with country code)"
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-3.5 py-2.5 text-[13px] outline-none focus:border-purple-400"
        />
        <label className="flex items-center gap-2 text-[12px] text-gray-600">
          <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="accent-purple-700" />
          Also send me offers and sale updates
        </label>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving || !whatsappNumber.trim()}
            className="flex-1 rounded-xl bg-purple-700 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={handleSkip} className="rounded-xl border border-[#E7E4F4] px-4 text-[13px] font-semibold text-gray-600">
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
