"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store-context";
import Button from "@/components/Button";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useStore();

  const shipping = cartTotal >= 999 || cartTotal === 0 ? 0 : 79;
  const total = cartTotal + shipping;

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex max-w-[1280px] flex-col items-center px-6 py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
          <ShoppingBag size={28} className="text-purple-700" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mb-6 text-[13.5px] text-gray-500">Looks like you haven&apos;t added anything yet.</p>
        <Button href="/products">Start Shopping</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {cart.map((line) => {
            const price = line.variant?.price ?? line.product.price;
            const variantLabel = line.variant
              ? line.variant.weightLabel ?? [line.variant.size, line.variant.color?.name].filter(Boolean).join(" / ")
              : null;
            return (
              <div key={`${line.product.id}-${line.variant?.id ?? "base"}`} className="flex gap-4 rounded-2xl border border-[#EFEDF8] bg-white p-4">
                <Link href={`/products/${line.product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                  <Image src={line.product.image} alt={line.product.name} fill className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="text-[11px] tracking-wide text-gray-500 uppercase">{line.product.brand}</div>
                    <Link href={`/products/${line.product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-purple-700">
                      {line.product.name}
                    </Link>
                    {variantLabel && <div className="mt-0.5 text-[12px] text-gray-500">{variantLabel}</div>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-lg border border-[#E7E4F4] px-2.5 py-1">
                      <button onClick={() => updateQuantity(line.product.id, line.quantity - 1, line.variant?.id)} aria-label="Decrease quantity">
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                      <button onClick={() => updateQuantity(line.product.id, line.quantity + 1, line.variant?.id)} aria-label="Increase quantity">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-[15px] font-bold text-gray-900">₹{price * line.quantity}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(line.product.id, line.variant?.id)}
                  className="self-start text-gray-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-[#EFEDF8] bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-gray-900">Order Summary</h2>
          <div className="flex flex-col gap-3 border-b border-[#EFEDF8] pb-5 text-[13.5px]">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
          </div>
          <div className="flex justify-between py-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <Button href="/checkout" className="w-full justify-center">
            Proceed to Checkout <ArrowRight size={16} />
          </Button>
          <p className="mt-3 text-center text-[11.5px] text-gray-500">
            Razorpay payment will be wired up once the backend is connected — this takes you to a UI-only checkout for now.
          </p>
        </div>
      </div>
    </main>
  );
}
