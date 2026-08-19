"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useAddresses } from "@/lib/use-addresses";
import { Address } from "@/lib/types";
import Button from "@/components/Button";

const emptyForm = { label: "Home", name: "", line: "", city: "", pincode: "", phone: "", isDefault: false };

export default function AddressesPage() {
  const { addresses, loading, error, addAddress, updateAddress, removeAddress } = useAddresses();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (a: Address) => {
    setForm({ label: a.label, name: a.name, line: a.line, city: a.city, pincode: a.pincode ?? "", phone: a.phone, isDefault: a.isDefault });
    setEditingId(a.id);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await addAddress(form);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    try {
      await removeAddress(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove address");
    }
  };

  return (
    <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Saved Addresses</h3>
        {!formOpen && (
          <button onClick={openNew} className="flex items-center gap-1.5 text-[13px] font-semibold text-purple-700">
            <Plus size={15} /> Add New
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
          <Loader2 size={18} className="animate-spin" /> Loading addresses…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-50 p-4 text-[13px] text-red-600">{error}</div>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-xl border border-purple-200 bg-purple-50/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[13.5px] font-semibold text-gray-900">{editingId ? "Edit Address" : "New Address"}</h4>
            <button type="button" onClick={() => setFormOpen(false)} className="text-gray-400">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input required placeholder="Label (Home, Work...)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-sm outline-none" />
            <input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-sm outline-none" />
            <input required placeholder="Address Line" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} className="rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-sm outline-none sm:col-span-2" />
            <input required placeholder="City, State" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-sm outline-none" />
            <input
              required
              placeholder="Pincode"
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              className="rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-sm outline-none"
            />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-[#E7E4F4] bg-white px-3 py-2 text-sm outline-none" />
          </div>
          <label className="mt-3 flex items-center gap-2 text-[12.5px] text-gray-600">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-purple-700" />
            Set as default address
          </label>
          {formError && <p className="mt-2 text-[12.5px] text-red-500">{formError}</p>}
          <div className="mt-4">
            <Button className={`w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
              {saving ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-xl border border-[#EFEDF8] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">{a.label}</span>
                {a.isDefault && <span className="text-[11px] font-medium text-gray-400">Default</span>}
              </div>
              <p className="text-[13.5px] font-semibold text-gray-900">{a.name}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{a.line}<br />{a.city}{a.pincode ? ` - ${a.pincode}` : ""}</p>
              <p className="mt-1 text-[13px] text-gray-500">{a.phone}</p>
              <div className="mt-3 flex gap-4">
                <button onClick={() => openEdit(a)} className="flex items-center gap-1 text-[12.5px] font-medium text-purple-700">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleRemove(a.id)} className="flex items-center gap-1 text-[12.5px] font-medium text-red-500">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && !formOpen && (
            <p className="text-[13px] text-gray-400">No saved addresses yet.</p>
          )}
        </div>
      )}
    </div>
  );
}