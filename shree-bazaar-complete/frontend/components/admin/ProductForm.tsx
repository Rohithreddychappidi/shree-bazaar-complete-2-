"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { Product, ProductVariant } from "@/lib/types";
import { useAdminData } from "@/lib/admin-data-context";
import { api } from "@/lib/api";
import Button from "@/components/Button";

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const defaultColorPalette = [
  { name: "Maroon", hex: "#7C2D3A" },
  { name: "Purple", hex: "#6D28D9" },
  { name: "Mustard", hex: "#D4A017" },
  { name: "Emerald", hex: "#0F7A5A" },
  { name: "Black", hex: "#111827" },
  { name: "Beige", hex: "#D8CAB8" },
];

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function ProductForm({ existing }: { existing?: Product }) {
  const router = useRouter();
  const { categories, addProduct, updateProduct } = useAdminData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(existing?.name ?? "");
  const [brand, setBrand] = useState(existing?.brand ?? "");
  const [categorySlug, setCategorySlug] = useState(existing?.categorySlug ?? categories[0]?.slug ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [oldPrice, setOldPrice] = useState(existing?.oldPrice?.toString() ?? "");
  const [tag, setTag] = useState<Product["tag"] | "">(existing?.tag ?? "");
  const [stock, setStock] = useState(existing?.stock != null ? String(existing.stock) : "");
  const [weightKg, setWeightKg] = useState(existing?.weightKg != null ? String(existing.weightKg) : "0.3");
  const [pickupLocation, setPickupLocation] = useState(existing?.pickupLocation ?? "");
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [variantType, setVariantType] = useState<Product["variantType"]>(existing?.variantType ?? "none");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    existing?.variantType === "size-color" ? [...new Set(existing.variants?.map((v) => v.size).filter(Boolean))] as string[] : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    existing?.variantType === "size-color" ? [...new Set(existing.variants?.map((v) => v.color?.name).filter(Boolean))] as string[] : []
  );
  // Per-size measurements (e.g. Shoulder, Chest, Length) — kept as arrays of rows while
  // editing for a nicer add/remove UI, converted to a plain object on submit.
  const [sizeChart, setSizeChart] = useState<Record<string, { label: string; value: string }[]>>(() => {
    const chart = existing?.sizeChart ?? {};
    const rows: Record<string, { label: string; value: string }[]> = {};
    Object.entries(chart).forEach(([size, measurements]) => {
      rows[size] = Object.entries(measurements).map(([label, value]) => ({ label, value }));
    });
    return rows;
  });
  // Starts with the default palette, plus any custom colors already used by this
  // product's existing variants (in case it was set up before this palette existed).
  const [colorPalette, setColorPalette] = useState(() => {
    const existingColors = (existing?.variants ?? [])
      .map((v) => v.color)
      .filter((c): c is { name: string; hex: string } => !!c);
    const merged = [...defaultColorPalette];
    existingColors.forEach((c) => {
      if (!merged.some((m) => m.name === c.name)) merged.push(c);
    });
    return merged;
  });
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#6D28D9");
  // Stock per size+color combo, keyed by "Size-ColorName". Seeded from existing variants
  // when editing; new combos default to empty (treated as 0 until filled in).
  const [variantStock, setVariantStock] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (existing?.variants ?? []).forEach((v) => {
      if (v.size && v.color) map[`${v.size}-${v.color.name}`] = String(v.stock);
    });
    return map;
  });
  const [weightRows, setWeightRows] = useState<{ label: string; price: string; oldPrice: string; stock: string }[]>(
    existing?.variantType === "weight"
      ? (existing.variants ?? []).map((v) => ({ label: v.weightLabel ?? "", price: v.price.toString(), oldPrice: v.oldPrice.toString(), stock: String(v.stock) }))
      : [{ label: "250g", price: "", oldPrice: "", stock: "" }]
  );

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => formData.append("images", file));
      const { urls } = await api.post<{ urls: string[] }>("/api/uploads", formData);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const addWeightRow = () => setWeightRows((prev) => [...prev, { label: "", price: "", oldPrice: "", stock: "" }]);
  const removeWeightRow = (idx: number) => setWeightRows((prev) => prev.filter((_, i) => i !== idx));
  const updateWeightRow = (idx: number, field: "label" | "price" | "oldPrice" | "stock", value: string) =>
    setWeightRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  const toggleColor = (colorName: string) =>
    setSelectedColors((prev) => (prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]));

  const addSizeChartRow = (size: string) =>
    setSizeChart((prev) => ({ ...prev, [size]: [...(prev[size] ?? []), { label: "", value: "" }] }));
  const removeSizeChartRow = (size: string, idx: number) =>
    setSizeChart((prev) => ({ ...prev, [size]: (prev[size] ?? []).filter((_, i) => i !== idx) }));
  const updateSizeChartRow = (size: string, idx: number, field: "label" | "value", val: string) =>
    setSizeChart((prev) => ({
      ...prev,
      [size]: (prev[size] ?? []).map((row, i) => (i === idx ? { ...row, [field]: val } : row)),
    }));

  const addCustomColor = () => {
    const name = newColorName.trim();
    if (!name) return;
    if (colorPalette.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      // already exists — just select it instead of adding a duplicate
      setSelectedColors((prev) => (prev.includes(name) ? prev : [...prev, name]));
    } else {
      setColorPalette((prev) => [...prev, { name, hex: newColorHex }]);
      setSelectedColors((prev) => [...prev, name]);
    }
    setNewColorName("");
    setNewColorHex("#6D28D9");
  };

  const updateVariantStock = (size: string, colorName: string, value: string) =>
    setVariantStock((prev) => ({ ...prev, [`${size}-${colorName}`]: value }));

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const basePrice = Number(price) || 0;
    const baseOldPrice = Number(oldPrice) || basePrice;

    let variants: ProductVariant[] | undefined;
    if (variantType === "size-color") {
      variants = selectedSizes.flatMap((size) =>
        selectedColors.map((colorName) => {
          const color = colorPalette.find((c) => c.name === colorName)!;
          const stockValue = Number(variantStock[`${size}-${colorName}`]) || 0;
          return { id: `${size}-${colorName}`, size, color, price: basePrice, oldPrice: baseOldPrice, stock: stockValue };
        })
      );
    } else if (variantType === "weight") {
      variants = weightRows
        .filter((r) => r.label)
        .map((r) => ({
          id: r.label,
          weightLabel: r.label,
          price: Number(r.price) || basePrice,
          oldPrice: Number(r.oldPrice) || baseOldPrice,
          stock: Number(r.stock) || 0,
        }));
    }

    // Convert the row-based editing state into the plain { size: { label: value } }
    // shape the backend stores — only for sizes still selected, and only rows with
    // both a label and a value filled in.
    const sizeChartPayload: Record<string, Record<string, string>> = {};
    if (variantType === "size-color") {
      selectedSizes.forEach((size) => {
        const rows = (sizeChart[size] ?? []).filter((r) => r.label.trim() && r.value.trim());
        if (rows.length > 0) {
          sizeChartPayload[size] = Object.fromEntries(rows.map((r) => [r.label.trim(), r.value.trim()]));
        }
      });
    }

    const product: Product = {
      id: existing?.id ?? `p-${Date.now()}`,
      slug: existing?.slug ?? slugify(name),
      name,
      brand,
      categorySlug,
      price: basePrice,
      oldPrice: baseOldPrice,
      rating: existing?.rating ?? 4.5,
      ratingCount: existing?.ratingCount ?? 0,
      image: images[0] ?? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=700&auto=format&fit=crop",
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=700&auto=format&fit=crop"],
      description,
      tag: tag || undefined,
      variantType,
      variants,
      sizeChart: Object.keys(sizeChartPayload).length > 0 ? sizeChartPayload : null,
      stock: variantType === "none" ? (stock === "" ? null : Number(stock)) : undefined,
      pickupLocation: pickupLocation || null,
      weightKg: weightKg === "" ? 0.3 : Math.max(0.05, Number(weightKg) || 0.3),
    };

    setSaving(true);
    setSubmitError(null);
    try {
      if (existing) {
        await updateProduct(existing.id, product);
      } else {
        await addProduct(product);
      }
      router.push("/admin/products");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save product");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Basic info */}
      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Product Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Brand</label>
            <input required value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Category</label>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Tag</label>
            <select value={tag} onChange={(e) => setTag(e.target.value as Product["tag"])} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400">
              <option value="">None</option>
              <option value="new">New</option>
              <option value="trending">Trending</option>
              <option value="featured">Featured</option>
              <option value="special">Special</option>
              <option value="clearance">Clearance</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Price (₹)</label>
            <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Compare-at Price (₹)</label>
            <input type="number" min="0" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Pickup Location</label>
            <input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Leave blank for the store default"
              className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
          </div>
        </div>
        <p className="mt-1.5 text-[11.5px] text-gray-400">
          Pickup location must exactly match a pickup address name already registered in your Shiprocket
          account — only set this if this product ships from a different warehouse than the store default
          (set at Admin → Settings → Shipping).
        </p>
        <div className="mt-4">
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Product Images</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">First image becomes the cover photo. You can add multiple.</p>
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((src, idx) => (
            <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#EFEDF8]">
              <Image src={src} alt="" fill className="object-cover" unoptimized={src.startsWith("data:")} />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X size={11} />
              </button>
              {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-purple-700/90 py-0.5 text-center text-[9px] font-semibold text-white">COVER</span>}
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E7E4F4] text-gray-400 hover:border-purple-400 hover:text-purple-700 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-[10px]">{uploading ? "Uploading…" : "Upload"}</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploadError ? (
          <p className="text-[11.5px] text-red-500">{uploadError}</p>
        ) : (
          <p className="text-[11.5px] text-gray-400">
            Uploaded straight to the backend&apos;s VPS disk storage (<code>/uploads</code>) — real files, not a
            local preview. Requires the backend to be running and reachable at <code>NEXT_PUBLIC_API_URL</code>.
          </p>
        )}
      </div>

      {/* Variants */}
      <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Product Type &amp; Variants</h2>
        <p className="mb-4 text-[12.5px] text-gray-500">
          Choose how this product is sold — plain, or with size/color (fashion) or weight-based pricing (grocery/food).
        </p>
        <div className="mb-5 flex gap-3">
          {(["none", "size-color", "weight"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setVariantType(t)}
              className={`rounded-xl border-2 px-4 py-2 text-[13px] font-semibold transition-colors ${
                variantType === t ? "border-purple-700 bg-purple-50 text-purple-700" : "border-[#E7E4F4] text-gray-600"
              }`}
            >
              {t === "none" ? "No Variants" : t === "size-color" ? "Size / Color (Fashion)" : "Weight (Grocery)"}
            </button>
          ))}
        </div>

        {variantType === "none" && (
          <div className="max-w-[220px]">
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Leave blank to not track stock"
              className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
            />
            <p className="mt-1.5 text-[11.5px] text-gray-400">
              Decremented automatically on each order. Shows an &quot;Out of Stock&quot; label once it hits 0, and
              the product is hidden from the storefront if it stays at 0 for more than 24 hours.
            </p>
          </div>
        )}

        <div className="mt-4 max-w-[220px]">
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Package Weight (kg)</label>
          <input
            type="number"
            min="0.05"
            step="0.05"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="0.3"
            className="w-full rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-4 py-2.5 text-sm outline-none focus:border-purple-400"
          />
          <p className="mt-1.5 text-[11.5px] text-gray-400">
            Used to calculate the live delivery fee shown to customers at checkout, and the actual weight sent to
            Shiprocket when the shipment is created. Include reasonable packaging weight, not just the product
            itself.
          </p>
        </div>

        {variantType === "size-color" && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 text-[13px] font-medium text-gray-700">Available Sizes</div>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`h-9 w-11 rounded-lg border-2 text-[13px] font-semibold ${
                      selectedSizes.includes(size) ? "border-purple-700 bg-purple-50 text-purple-700" : "border-[#E7E4F4] text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-gray-700">Available Colors</div>
              <div className="flex flex-wrap gap-3">
                {colorPalette.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleColor(c.name)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-[12.5px] font-medium ${
                      selectedColors.includes(c.name) ? "border-purple-700 bg-purple-50 text-purple-700" : "border-[#E7E4F4] text-gray-600"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-[#E7E4F4] p-0.5"
                  aria-label="New color swatch"
                />
                <input
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomColor();
                    }
                  }}
                  placeholder="Add a color (e.g. Teal)"
                  className="flex-1 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2 text-[13px] outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-purple-700 px-3 py-2 text-[12.5px] font-semibold text-purple-700 hover:bg-purple-50"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
            {selectedSizes.length > 0 && selectedColors.length > 0 && (
              <div>
                <div className="mb-1 text-[13px] font-medium text-gray-700">Stock per Size / Color</div>
                <p className="mb-3 text-[12px] text-gray-500">
                  Set how many of each combination you actually have — this is what gets decremented on each order.
                </p>
                <div className="overflow-x-auto rounded-xl border border-[#E7E4F4]">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-[#F8F8FC] text-[11px] tracking-wide text-gray-500 uppercase">
                      <tr>
                        <th className="px-3 py-2 font-medium">Size</th>
                        {selectedColors.map((c) => (
                          <th key={c} className="px-3 py-2 font-medium">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSizes.map((size) => (
                        <tr key={size} className="border-t border-[#EFEDF8]">
                          <td className="px-3 py-2 font-semibold text-gray-900">{size}</td>
                          {selectedColors.map((c) => (
                            <td key={c} className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={variantStock[`${size}-${c}`] ?? ""}
                                onChange={(e) => updateVariantStock(size, c, e.target.value)}
                                placeholder="0"
                                className="w-16 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-2 py-1 text-[12.5px] outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedSizes.length > 0 && (
              <div>
                <div className="mb-1 text-[13px] font-medium text-gray-700">Size Guide (optional)</div>
                <p className="mb-3 text-[12px] text-gray-500">
                  Measurements per size — e.g. Shoulder, Chest, Length. Shown to customers as a size chart.
                </p>
                <div className="flex flex-col gap-4">
                  {selectedSizes.map((size) => (
                    <div key={size} className="rounded-xl border border-[#E7E4F4] p-3">
                      <div className="mb-2 text-[12.5px] font-semibold text-gray-900">Size {size}</div>
                      <div className="flex flex-col gap-2">
                        {(sizeChart[size] ?? []).map((row, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              value={row.label}
                              onChange={(e) => updateSizeChartRow(size, idx, "label", e.target.value)}
                              placeholder="Shoulder"
                              className="w-32 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-1.5 text-[13px] outline-none"
                            />
                            <input
                              value={row.value}
                              onChange={(e) => updateSizeChartRow(size, idx, "value", e.target.value)}
                              placeholder="18 in"
                              className="w-24 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-1.5 text-[13px] outline-none"
                            />
                            <button type="button" onClick={() => removeSizeChartRow(size, idx)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addSizeChartRow(size)} className="flex w-fit items-center gap-1.5 text-[12px] font-semibold text-purple-700">
                          <Plus size={13} /> Add measurement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {variantType === "weight" && (
          <div className="flex flex-col gap-3">
            {weightRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  value={row.label}
                  onChange={(e) => updateWeightRow(idx, "label", e.target.value)}
                  placeholder="e.g. 250g"
                  className="w-28 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2 text-sm outline-none"
                />
                <input
                  type="number"
                  value={row.price}
                  onChange={(e) => updateWeightRow(idx, "price", e.target.value)}
                  placeholder="Price ₹"
                  className="w-28 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2 text-sm outline-none"
                />
                <input
                  type="number"
                  value={row.oldPrice}
                  onChange={(e) => updateWeightRow(idx, "oldPrice", e.target.value)}
                  placeholder="Compare-at ₹"
                  className="w-32 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2 text-sm outline-none"
                />
                <input
                  type="number"
                  min="0"
                  value={row.stock}
                  onChange={(e) => updateWeightRow(idx, "stock", e.target.value)}
                  placeholder="Stock"
                  className="w-24 rounded-lg border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2 text-sm outline-none"
                />
                <button type="button" onClick={() => removeWeightRow(idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addWeightRow} className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-purple-700">
              <Plus size={15} /> Add pack size
            </button>
          </div>
        )}
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{submitError}</div>
      )}

      <div className="flex gap-3">
        <Button className={`w-fit ${saving ? "pointer-events-none opacity-60" : ""}`} onClick={() => {}}>
          {saving ? "Saving..." : existing ? "Save Changes" : "Create Product"}
        </Button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-xl border border-[#E7E4F4] px-6 py-3 text-sm font-semibold text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}