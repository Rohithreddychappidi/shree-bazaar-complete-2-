"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product, ProductVariant } from "./types";

type CartLine = {
  product: Product;
  quantity: number;
  variant?: ProductVariant; // undefined for products with variantType "none"
};

// Cart lines are keyed by product id + variant id, so different sizes/colors/weights
// of the same product are separate lines.
const lineKey = (productId: string, variantId?: string) => (variantId ? `${productId}::${variantId}` : productId);

type StoreContextType = {
  cart: CartLine[];
  wishlist: Product[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = "shree-bazaar-cart";
const WISHLIST_KEY = "shree-bazaar-wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavoidable due to SSR/CSR mismatch
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const key = lineKey(product.id, variant?.id);
    setCart((prev) => {
      const existing = prev.find((l) => lineKey(l.product.id, l.variant?.id) === key);
      if (existing) {
        return prev.map((l) => (lineKey(l.product.id, l.variant?.id) === key ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...prev, { product, variant, quantity }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    const key = lineKey(productId, variantId);
    setCart((prev) => prev.filter((l) => lineKey(l.product.id, l.variant?.id) !== key));
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity < 1) return removeFromCart(productId, variantId);
    const key = lineKey(productId, variantId);
    setCart((prev) => prev.map((l) => (lineKey(l.product.id, l.variant?.id) === key ? { ...l, quantity } : l)));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]
    );
  };

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = cart.reduce((sum, l) => sum + l.quantity * (l.variant?.price ?? l.product.price), 0);

  return (
    <StoreContext.Provider
      value={{ cart, wishlist, addToCart, removeFromCart, updateQuantity, toggleWishlist, isWishlisted, cartCount, cartTotal }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
