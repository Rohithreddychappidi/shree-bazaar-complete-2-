"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, ShoppingCart, Minus, Plus, ChevronRight, Truck, ShieldCheck, Tag, Ruler } from "lucide-react";
import { useAdminData } from "@/lib/admin-data-context";
import { useStore } from "@/lib/store-context";
import { useSettings } from "@/lib/use-settings";
import { validateCoupon, CouponValidation } from "@/lib/use-coupons";
import { isProductOutOfStock, isVariantOutOfStock } from "@/lib/stock";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { products } = useAdminData();
  const product = products.find((p) => p.slug === slug);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { settings } = useSettings();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);

  const sizes = useMemo(
    () => (product?.variantType === "size-color" ? [...new Set(product.variants?.map((v) => v.size).filter(Boolean))] : []),
    [product]
  ) as string[];
  const colors = useMemo(() => {
    if (product?.variantType !== "size-color") return [];
    const entries = (product.variants ?? [])
      .filter((v) => v.color)
      .map((v) => [v.color!.name, v.color!] as [string, { name: string; hex: string }]);
    return [...new Map(entries).values()];
  }, [product]);
  const weights = useMemo(
    () => (product?.variantType === "weight" ? product.variants ?? [] : []),
    [product]
  );
  // For the size buttons: a size is disabled only if every color for it is out of stock.
  const sizeAvailability = useMemo(() => {
    const map: Record<string, boolean> = {};
    sizes.forEach((size) => {
      const variantsForSize = (product?.variants ?? []).filter((v) => v.size === size);
      map[size] = variantsForSize.some((v) => v.stock > 0);
    });
    return map;
  }, [sizes, product]);

  if (!product) return notFound();

  const hasVariants = product.variantType !== "none" && (product.variants?.length ?? 0) > 0;

  const selectedVariant =
    product.variantType === "size-color"
      ? product.variants?.find((v) => v.size === selectedSize && v.color?.name === selectedColor)
      : product.variantType === "weight"
      ? product.variants?.find((v) => v.weightLabel === selectedWeight)
      : undefined;

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOldPrice = selectedVariant?.oldPrice ?? product.oldPrice;
  const discount = Math.round((1 - displayPrice / displayOldPrice) * 100);
  const wishlisted = isWishlisted(product.id);
  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  const productOutOfStock = isProductOutOfStock(product);
  const selectedVariantOutOfStock = selectedVariant ? isVariantOutOfStock(selectedVariant) : false;
  const canAdd = !productOutOfStock && (!hasVariants || (!!selectedVariant && !selectedVariantOutOfStock));

  const handleAdd = () => {
    if (!canAdd) return;
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleCheckCoupon = async () => {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponInput.trim(), product.id);
      setCouponPreview(result);
    } catch (err) {
      setCouponPreview(null);
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const previewDiscountedPrice = couponPreview
    ? couponPreview.discountType === "PERCENT"
      ? Math.round(displayPrice * (1 - couponPreview.discountValue / 100))
      : Math.max(0, displayPrice - couponPreview.discountValue)
    : null;

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="mb-6 flex items-center gap-1.5 text-[13px] text-gray-500">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <Link href={`/products?category=${product.categorySlug}`}>Products</Link>
        <ChevronRight size={13} />
        <span className="font-medium text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-purple-50">
            <Image src={product.images[activeImage] ?? product.image} alt={product.name} fill className="object-cover" priority />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-purple-700" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-1.5 text-[12px] font-semibold tracking-wide text-purple-700 uppercase">{product.brand}</div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-[28px]">{product.name}</h1>

          <div className="mb-5 flex items-center gap-3 border-b border-[#EFEDF8] pb-5">
            <span className="text-3xl font-bold text-gray-900">₹{displayPrice}</span>
            <span className="text-base text-gray-500 line-through">₹{displayOldPrice}</span>
            <span className="text-base font-semibold text-green-600">{discount}% off</span>
            {hasVariants && !selectedVariant && <span className="text-[12.5px] text-gray-400">(select options below)</span>}
            {productOutOfStock && (
              <span className="rounded-md bg-gray-700 px-2 py-1 text-[11px] font-bold text-white">Out of Stock</span>
            )}
          </div>

          <div className="mb-5">
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2">
                <Tag size={15} className="shrink-0 text-gray-400" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCheckCoupon())}
                  placeholder="Have a coupon? Check it here"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <button
                onClick={handleCheckCoupon}
                disabled={checkingCoupon}
                className="rounded-xl border-2 border-purple-700 px-4 text-[13px] font-semibold text-purple-700 disabled:opacity-50"
              >
                {checkingCoupon ? "..." : "Check"}
              </button>
            </div>
            {couponError && <p className="mt-1.5 text-[12px] text-red-500">{couponError}</p>}
            {previewDiscountedPrice !== null && (
              <p className="mt-1.5 text-[12.5px] text-green-600">
                With <span className="font-semibold">{couponPreview?.code}</span>: ₹{previewDiscountedPrice} — apply it at checkout to redeem.
              </p>
            )}
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-1.5">
            <Truck size={15} className="text-purple-700" />
            <span className="text-[12.5px] font-semibold text-purple-700">Delivery by Shiprocket</span>
          </div>

          {/* Size selector (fashion) */}
          {product.variantType === "size-color" && (
            <div className="mb-5">
              <div className="mb-2 text-sm font-medium text-gray-900">
                Size {selectedSize && <span className="font-normal text-gray-500">— {selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = sizeAvailability[size];
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      title={available ? undefined : "Out of stock"}
                      className={`flex h-10 w-12 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors ${
                        !available
                          ? "cursor-not-allowed border-[#E7E4F4] text-gray-300 line-through"
                          : selectedSize === size
                          ? "border-purple-700 bg-purple-50 text-purple-700"
                          : "border-[#E7E4F4] text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {product.sizeChart && Object.keys(product.sizeChart).length > 0 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-[#E7E4F4]">
                  <div className="flex items-center gap-1.5 bg-[#F8F8FC] px-3 py-2 text-[12px] font-semibold text-gray-700">
                    <Ruler size={13} /> Size Guide
                  </div>
                  <table className="w-full text-left text-[12.5px]">
                    <tbody>
                      {Object.entries(product.sizeChart).map(([size, measurements]) => (
                        <tr key={size} className="border-t border-[#EFEDF8]">
                          <td className="px-3 py-2 font-semibold text-gray-900">{size}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {Object.entries(measurements).map(([label, value]) => `${label}: ${value}`).join(" · ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Color selector (fashion) */}
          {product.variantType === "size-color" && (
            <div className="mb-6">
              <div className="mb-2 text-sm font-medium text-gray-900">
                Color {selectedColor && <span className="font-normal text-gray-500">— {selectedColor}</span>}
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  if (!color) return null;
                  const matchingVariant = product.variants?.find((v) => v.size === selectedSize && v.color?.name === color.name);
                  // If no size is picked yet, don't disable anything — we can't know yet.
                  const available = !selectedSize || (matchingVariant ? matchingVariant.stock > 0 : false);
                  return (
                    <button
                      key={color.name}
                      onClick={() => available && setSelectedColor(color.name)}
                      disabled={!available}
                      title={available ? color.name : `${color.name} — out of stock in size ${selectedSize}`}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        !available ? "cursor-not-allowed opacity-30" : selectedColor === color.name ? "border-purple-700 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Weight selector (grocery) */}
          {product.variantType === "weight" && (
            <div className="mb-6">
              <div className="mb-2 text-sm font-medium text-gray-900">Pack Size</div>
              <div className="flex flex-wrap gap-2">
                {weights.map((w) => {
                  const available = w.stock > 0;
                  return (
                    <button
                      key={w.id}
                      onClick={() => available && setSelectedWeight(w.weightLabel ?? null)}
                      disabled={!available}
                      className={`rounded-lg border-2 px-4 py-2 text-left text-sm font-semibold transition-colors ${
                        !available
                          ? "cursor-not-allowed border-[#E7E4F4] text-gray-300"
                          : selectedWeight === w.weightLabel
                          ? "border-purple-700 bg-purple-50 text-purple-700"
                          : "border-[#E7E4F4] text-gray-700"
                      }`}
                    >
                      {w.weightLabel}
                      <span className="ml-2 text-[11.5px] font-normal text-gray-500">
                        {available ? `₹${w.price}` : "Out of stock"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <h2 className="mb-2 text-sm font-semibold text-gray-900">Description</h2>
          <p className="mb-6 text-[14.5px] leading-relaxed text-gray-600">
            {product.description ??
              "Sourced with care and made in small batches to keep the quality consistent. Real descriptions, specifications and material details are added by the admin per product."}
          </p>

          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-900">Quantity</span>
            <div className="flex items-center gap-3 rounded-lg border border-[#E7E4F4] px-3 py-1.5">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={15} />
              </button>
              <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="mb-8 flex gap-3">
            <Button onClick={handleAdd} className={`flex-1 ${!canAdd ? "pointer-events-none opacity-50" : ""}`}>
              <ShoppingCart size={16} />
              {productOutOfStock
                ? "Out of Stock"
                : added
                ? "Added to Cart"
                : hasVariants && !selectedVariant
                ? "Select options first"
                : hasVariants && selectedVariantOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
                wishlisted ? "border-purple-700 bg-purple-50" : "border-[#E7E4F4]"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} className={wishlisted ? "fill-purple-700 text-purple-700" : "text-gray-700"} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-[#F8F8FC] p-5 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-[12.5px] text-gray-600">
              <Truck size={17} className="shrink-0 text-purple-700" /> Free delivery over ₹999
            </div>
            <div className="flex items-center gap-2.5 text-[12.5px] text-gray-600">
              <ShieldCheck size={17} className="shrink-0 text-purple-700" /> Cancel within {settings?.cancellationWindowHours ?? 8}h of ordering
            </div>
            <div className="flex items-center gap-2.5 text-[12.5px] text-gray-600">
              <ShieldCheck size={17} className="shrink-0 text-purple-700" /> Secure Razorpay checkout
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </main>
  );
}
