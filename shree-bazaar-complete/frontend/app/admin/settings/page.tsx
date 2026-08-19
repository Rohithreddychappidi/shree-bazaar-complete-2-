"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/components/Button";
import { useSettings } from "@/lib/use-settings";

export default function AdminSettingsPage() {
  const { settings, loading, saveSettings } = useSettings();
  const [storeName, setStoreName] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("999");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [cancellationWindowHours, setCancellationWindowHours] = useState("8");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [defaultPickupLocation, setDefaultPickupLocation] = useState("");
  const [defaultPickupPincode, setDefaultPickupPincode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- populating form fields from a freshly-loaded record, not a derived-state anti-pattern
    setStoreName(settings.storeName);
    setFreeShippingThreshold(String(settings.freeShippingThreshold));
    setCancellationPolicy(settings.cancellationPolicy);
    setCancellationWindowHours(String(settings.cancellationWindowHours));
    setContactPhone(settings.contactPhone ?? "");
    setContactEmail(settings.contactEmail ?? "");
    setContactAddress(settings.contactAddress ?? "");
    setSocialInstagram(settings.socialInstagram ?? "");
    setSocialFacebook(settings.socialFacebook ?? "");
    setSocialLinkedin(settings.socialLinkedin ?? "");
    setAnnouncementText(settings.announcementText);
    setAnnouncementEnabled(settings.announcementEnabled);
    setDefaultPickupLocation(settings.defaultPickupLocation);
    setDefaultPickupPincode(settings.defaultPickupPincode ?? "");
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await saveSettings({
        storeName,
        freeShippingThreshold: Number(freeShippingThreshold) || 0,
        cancellationPolicy,
        cancellationWindowHours: Number(cancellationWindowHours) || 8,
        contactPhone,
        contactEmail,
        contactAddress,
        socialInstagram,
        socialFacebook,
        socialLinkedin,
        announcementText,
        announcementEnabled,
        defaultPickupLocation,
        defaultPickupPincode: defaultPickupPincode || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
        <Loader2 size={20} className="animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="max-w-[700px]">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Store, cancellation, payment and shipping configuration.</p>

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Announcement Bar</h2>
          <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
            <input type="checkbox" checked={announcementEnabled} onChange={(e) => setAnnouncementEnabled(e.target.checked)} className="accent-purple-700" />
            Show on site
          </label>
        </div>
        <p className="mb-3 text-[12.5px] text-gray-500">The scrolling strip at the very top of the homepage.</p>
        <input
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          placeholder="Free delivery on orders above ₹999 • Use code WELCOME10 for 10% off your first order"
          className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Store</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Store Name</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Free Shipping Above (₹)</label>
            <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Contact &amp; Social</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">Shown in the site footer.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Phone</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 81436 60814" className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Email</label>
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@shreebazaar.com" className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Address</label>
            <input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Instagram URL</label>
            <input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/..." className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Facebook URL</label>
            <input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/..." className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">LinkedIn URL</label>
            <input value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} placeholder="https://linkedin.com/..." className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-gray-400">Leave a field blank to hide it from the footer entirely.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Order Cancellation</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">
          Customers can cancel their own order from the order detail page, but only within this window.
        </p>
        <div className="mb-4 max-w-[220px]">
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Cancellation Window (hours)</label>
          <input
            type="number"
            min="1"
            value={cancellationWindowHours}
            onChange={(e) => setCancellationWindowHours(e.target.value)}
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Policy Text (shown to customers)</label>
          <textarea
            rows={3}
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Razorpay</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">Key ID is set via environment variables on both frontend and backend, not here.</p>
        <div className="flex gap-2.5 rounded-xl bg-amber-50 p-3.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[12px] leading-relaxed text-amber-800">
            The Key <strong>Secret</strong> must never be entered in any UI — it belongs only in the backend&apos;s
            <code> .env</code> file (<code>RAZORPAY_KEY_SECRET</code>). The Key ID lives in{" "}
            <code>NEXT_PUBLIC_RAZORPAY_KEY_ID</code> on the frontend and <code>RAZORPAY_KEY_ID</code> on the
            backend — both are set at deploy time, not through this settings page, so they can&apos;t
            accidentally end up stored in the database.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Shipping</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">
          Login credentials (<code>SHIPROCKET_EMAIL</code>, <code>SHIPROCKET_PASSWORD</code>) are set via the
          backend&apos;s <code>.env</code> — Shiprocket has no frontend widget for those. The pickup location
          below is different: it&apos;s used at checkout time for every product that doesn&apos;t have its own
          pickup location set.
        </p>
        <div className="max-w-[320px]">
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Default Pickup Location</label>
          <input
            value={defaultPickupLocation}
            onChange={(e) => setDefaultPickupLocation(e.target.value)}
            placeholder="Primary"
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
          <p className="mt-1.5 text-[11.5px] text-gray-400">
            Must exactly match a pickup address name already registered in your Shiprocket account. Individual
            products can override this in the product form, for orders shipping from a different warehouse.
          </p>
        </div>
        <div className="mt-4 max-w-[320px]">
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Default Pickup Pincode</label>
          <input
            value={defaultPickupPincode}
            onChange={(e) => setDefaultPickupPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="e.g. 533001"
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
          <p className="mt-1.5 text-[11.5px] text-gray-400">
            The pincode of the pickup location above. Required for showing customers a live, accurate delivery fee
            at checkout — without this, checkout falls back to a flat ₹79 shipping charge for every order instead of
            a real rate based on distance and weight.
          </p>
        </div>
      </div>

      {saveError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{saveError}</div>}

      <Button onClick={handleSave} className={saving ? "pointer-events-none opacity-60" : ""}>
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
      </Button>
    </div>
  );
}