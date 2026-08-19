"use client";

import { useState } from "react";
import { Plus, Trash2, X, Eye, EyeOff } from "lucide-react";
import { useStaff } from "@/lib/use-staff";
import Button from "@/components/Button";

export default function AdminStaffPage() {
  const { staff, loading, addStaff, removeStaff } = useStaff();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addStaff({ name, email, password });
      setName("");
      setEmail("");
      setPassword("");
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sub-admin");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string, label: string) => {
    if (!confirm(`Revoke sub-admin access for ${label}? They'll become a regular customer account.`)) return;
    try {
      await removeStaff(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove sub-admin");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sub-Admins</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">
            They can manage Categories, Products and Coupons only — nothing else.
          </p>
        </div>
        {!formOpen && (
          <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800">
            <Plus size={16} /> Add Sub-Admin
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-purple-200 bg-purple-50/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-gray-900">New Sub-Admin</h2>
            <button type="button" onClick={() => setFormOpen(false)} className="text-gray-400">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-[#E7E4F4] bg-white px-4 py-2.5">
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ characters"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={15} className="text-gray-400" /> : <Eye size={15} className="text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-gray-500">
            Share this email and password with them directly (WhatsApp, in person, however you normally would) —
            there&apos;s no invite email sent automatically. They log in at{" "}
            <span className="font-medium text-gray-700">/login → Staff login</span>.
          </p>
          {error && <p className="mt-2 text-[12.5px] text-red-500">{error}</p>}
          <div className="mt-4">
            <Button className={`w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
              {saving ? "Creating..." : "Create Sub-Admin"}
            </Button>
          </div>
        </form>
      )}

      {loading && <p className="text-[13.5px] text-gray-400">Loading…</p>}

      <div className="flex flex-col gap-3">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-2xl border border-[#EFEDF8] bg-white p-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">{s.name}</div>
              <div className="text-[12.5px] text-gray-500">{s.email}</div>
            </div>
            <button onClick={() => handleRemove(s.id, s.name ?? s.email)} className="flex items-center gap-1.5 text-[12.5px] font-medium text-red-500">
              <Trash2 size={14} /> Revoke Access
            </button>
          </div>
        ))}
        {!loading && staff.length === 0 && (
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-10 text-center text-[13.5px] text-gray-400">
            No sub-admins yet.
          </div>
        )}
      </div>
    </div>
  );
}
