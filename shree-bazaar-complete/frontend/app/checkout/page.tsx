"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ShieldCheck, Loader2, Tag, X } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAddresses } from "@/lib/use-addresses";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/use-settings";
import { validateCoupon, CouponValidation } from "@/lib/use-coupons";
import { api } from "@/lib/api";
import Button from "@/components/Button";

const paymentOptions = [
  { key: "razorpay", label: "Pay Online (Cards / UPI / Netbanking)", sub: "Secured by Razorpay" },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type RazorpayOrderResponse = { orderId: string; amount: number; currency: string };
type OrderResponse = { id: string };

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { cart, cartTotal } = useStore();
  const { addresses, loading: addressesLoading } = useAddresses();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [shipping, setShipping] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const discountAmount = appliedCoupon
    ? (() => {
        const base = appliedCoupon.productId
          ? cart
              .filter((l) => l.product.id === appliedCoupon.productId)
              .reduce((sum, l) => sum + (l.variant?.price ?? l.product.price) * l.quantity, 0)
          : cartTotal;
        return appliedCoupon.discountType === "PERCENT"
          ? Math.round((base * appliedCoupon.discountValue) / 100)
          : Math.min(appliedCoupon.discountValue, base);
      })()
    : 0;

  const addressId = selectedAddress ?? addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
  const total = shipping === null ? null : Math.max(0, cartTotal - discountAmount) + shipping;

  // Live delivery fee, recalculated whenever the selected address or cart contents
  // change — mirrors the same computeShipping logic the backend uses authoritatively
  // at order-creation time, so what's shown here matches what actually gets charged.
  useEffect(() => {
    if (!addressId || cart.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting shipping when the address/cart becomes empty, not a derived-state anti-pattern
      setShipping(null);
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the start of an async fetch triggered by this effect, not a derived-state anti-pattern
    setShippingLoading(true);
    api
      .post<{ shipping: number }>("/api/orders/shipping-rate", { items: buildOrderItems(), addressId })
      .then((res) => {
        if (!cancelled) setShipping(res.shipping);
      })
      .catch(() => {
        if (!cancelled) setShipping(79); // matches the backend's own flat fallback
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- buildOrderItems is derived from cart, already a dependency
  }, [addressId, cart]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponInput.trim());
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  const buildOrderItems = () =>
    cart.map((line) => ({
      productId: line.product.id,
      variantId: line.variant?.id,
      name: line.product.name,
      variantLabel: line.variant
        ? line.variant.weightLabel ?? [line.variant.size, line.variant.color?.name].filter(Boolean).join(" / ")
        : undefined,
      price: line.variant?.price ?? line.product.price,
      quantity: line.quantity,
    }));

  const finalizeOrder = async (razorpayFields?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (!addressId) return;
    await api.post<OrderResponse>("/api/orders", {
      items: buildOrderItems(),
      addressId,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      ...razorpayFields,
    });
    setPlacing(false);
    setPlaced(true);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!addressId) {
      setOrderError("Add a delivery address before placing your order.");
      return;
    }
    if (total === null) {
      setOrderError("Still calculating delivery charges — try again in a moment.");
      return;
    }
    setOrderError(null);

    // --- Razorpay flow (the only payment method — no Cash on Delivery) ---
    // Step 1: ask the backend to create the actual Razorpay order (this is the
    // server-side step a secure integration requires — see shree-bazaar-server's
    // routes/orders.routes.js for the signature verification that happens after).
    if (!scriptReady || !window.Razorpay) return;
    setPlacing(true);
    try {
      const rp = await api.post<RazorpayOrderResponse>("/api/orders/razorpay/create", { amount: total });
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: rp.amount,
        currency: rp.currency,
        order_id: rp.orderId,
        name: "Shree Bazaar",
        description: `Order for ${cart.length} item${cart.length > 1 ? "s" : ""}`,
        theme: { color: "#6D28D9" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await finalizeOrder(response);
          } catch (err) {
            setPlacing(false);
            setOrderError(err instanceof Error ? err.message : "Payment succeeded but saving the order failed — contact support.");
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.open();
    } catch (err) {
      setPlacing(false);
      setOrderError(err instanceof Error ? err.message : "Failed to start payment");
    }
  };

  if (placed) {
    return (
      <main className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <ShieldCheck size={28} className="text-green-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Order placed</h1>
        <p className="mb-6 text-[13.5px] text-gray-500">
          Your order was saved. Shiprocket fulfillment (creating the shipment and tracking ID) is the one piece
          still left as backend work — see the note in shree-bazaar-server&apos;s README.
        </p>
        <Button href="/profile/orders">View My Orders</Button>
      </main>
    );
  }

  if (!authLoading && !user) {
    return (
      <main className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-24 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">Log in to check out</h1>
        <p className="mb-6 text-[13.5px] text-gray-500">Orders and addresses are tied to your account.</p>
        <Button href="/login">Log In</Button>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex max-w-[1280px] flex-col items-center px-6 py-24 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mb-6 text-[13.5px] text-gray-500">Add something to your cart before checking out.</p>
        <Button href="/products">Browse Products</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={() => setScriptReady(true)} onLoad={() => setScriptReady(true)} />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {/* Delivery address */}
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <MapPin size={17} className="text-purple-700" /> Delivery Address
              </h2>
              <Link href="/profile/addresses" className="text-[12.5px] font-semibold text-purple-700">Manage</Link>
            </div>

            {addressesLoading && (
              <div className="flex items-center gap-2 py-6 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Loading addresses…
              </div>
            )}

            {!addressesLoading && addresses.length === 0 && (
              <div className="rounded-xl bg-[#F8F8FC] p-4 text-center text-[13px] text-gray-500">
                No saved addresses yet.{" "}
                <Link href="/profile/addresses" className="font-semibold text-purple-700">Add one</Link> before checking out.
              </div>
            )}

            <div className="flex flex-col gap-3">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    addressId === a.id ? "border-purple-700 bg-purple-50" : "border-[#EFEDF8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === a.id}
                    onChange={() => setSelectedAddress(a.id)}
                    className="mt-1 accent-purple-700"
                  />
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-purple-700">{a.label}</span>
                      {a.isDefault && <span className="text-[11px] text-gray-400">Default</span>}
                    </div>
                    <p className="text-[13.5px] font-semibold text-gray-900">{a.name}</p>
                    <p className="text-[13px] text-gray-600">{a.line}, {a.city}</p>
                    <p className="text-[13px] text-gray-500">{a.phone}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-gray-400">Shipped via Shiprocket once dispatched.</p>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <ShieldCheck size={17} className="text-purple-700" /> Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              {paymentOptions.map((p) => (
                <label
                  key={p.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    paymentMethod === p.key ? "border-purple-700 bg-purple-50" : "border-[#EFEDF8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === p.key}
                    onChange={() => setPaymentMethod(p.key)}
                    className="accent-purple-700"
                  />
                  <div>
                    <div className="text-[13.5px] font-semibold text-gray-900">{p.label}</div>
                    <div className="text-[12px] text-gray-500">{p.sub}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] text-gray-400">
              This creates a real Razorpay order via the backend, then opens the actual checkout modal. The
              payment signature is verified server-side before the order is saved. Cash on Delivery is not
              available.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-[#EFEDF8] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Order Summary</h2>
          <div className="mb-4 flex flex-col gap-3 border-b border-[#EFEDF8] pb-4">
            {cart.map((line) => {
              const price = line.variant?.price ?? line.product.price;
              const variantLabel = line.variant
                ? line.variant.weightLabel ?? [line.variant.size, line.variant.color?.name].filter(Boolean).join(" / ")
                : null;
              return (
                <div key={`${line.product.id}-${line.variant?.id ?? "base"}`} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-purple-50">
                    <Image src={line.product.image} alt={line.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-gray-900 line-clamp-1">{line.product.name}</div>
                    <div className="text-[11.5px] text-gray-500">
                      {variantLabel && `${variantLabel} · `}Qty {line.quantity}
                    </div>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900">₹{price * line.quantity}</div>
                </div>
              );
            })}
          </div>
          <div className="mb-4 flex flex-col gap-2">
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-3 py-2">
                  <Tag size={15} className="shrink-0 text-gray-400" />
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                    placeholder="Coupon code"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  className="rounded-xl border-2 border-purple-700 px-4 text-[13px] font-semibold text-purple-700 disabled:opacity-50"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-green-700">
                  <Tag size={14} /> {appliedCoupon.code} applied
                </span>
                <button onClick={removeCoupon} aria-label="Remove coupon">
                  <X size={15} className="text-green-700" />
                </button>
              </div>
            )}
            {couponError && <p className="text-[12px] text-red-500">{couponError}</p>}
          </div>
          <div className="flex flex-col gap-2.5 border-b border-[#EFEDF8] pb-4 text-[13.5px]">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>
                {shippingLoading || shipping === null ? (
                  <span className="inline-flex items-center gap-1 text-gray-400">
                    <Loader2 size={12} className="animate-spin" /> Calculating…
                  </span>
                ) : shipping === 0 ? (
                  "Free"
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>
          </div>
          <div className="flex justify-between py-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{total === null ? "—" : `₹${total}`}</span>
          </div>
          {orderError && <p className="mb-3 text-[12.5px] text-red-500">{orderError}</p>}
          <Button onClick={handlePlaceOrder} className={`w-full justify-center ${placing ? "pointer-events-none opacity-60" : ""}`}>
            {placing ? <Loader2 size={16} className="animate-spin" /> : null}
            {placing ? "Processing..." : "Place Order"}
          </Button>
          {settings && (
            <p className="mt-3 text-center text-[11.5px] text-gray-400">
              You can cancel within {settings.cancellationWindowHours} hours of placing this order.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}