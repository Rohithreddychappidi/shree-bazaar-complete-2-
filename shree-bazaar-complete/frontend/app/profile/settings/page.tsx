"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/Button";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- populating form fields from the logged-in user record, not a derived-state anti-pattern
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateProfile({ name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <h3 className="mb-5 text-base font-semibold text-gray-900">Account Settings</h3>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Email</label>
          <input value={user?.email ?? ""} disabled className="w-full cursor-not-allowed rounded-xl border border-[#E7E4F4] bg-gray-100 px-4 py-2.5 text-sm text-gray-500 outline-none" />
          <p className="mt-1 text-[11.5px] text-gray-400">Tied to your Google account — can&apos;t be changed here.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        {error && <p className="text-[12.5px] text-red-500">{error}</p>}
        <Button className={`mt-2 w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
