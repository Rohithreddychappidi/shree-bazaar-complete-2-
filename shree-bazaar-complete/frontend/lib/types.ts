export type Category = {
  slug: string;
  name: string;
  subcategories: string[];
  icon: string; // lucide icon name
  image: string;
};

// A single purchasable option of a product.
// - "size-color" products (fashion): one variant per size+color combo, price usually same across variants.
// - "weight" products (grocery/food): one variant per pack size, each with its own price.
// - "none": product has no variants — price/oldPrice on the product itself is used directly.
export type ProductVariant = {
  id: string;
  size?: string; // e.g. "M", "L", "XL" — only for variantType "size-color"
  color?: { name: string; hex: string }; // only for variantType "size-color"
  weightLabel?: string; // e.g. "250g", "1kg" — only for variantType "weight"
  price: number;
  oldPrice: number;
  stock: number;
  weightKg?: number | null; // package weight for shipping-rate calc — falls back to the
                             // parent Product's weightKg when unset
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  price: number;
  oldPrice: number;
  rating: number;
  ratingCount: number;
  image: string;
  images: string[];
  description?: string;
  tag?: "new" | "trending" | "featured" | "special" | "clearance";
  variantType: "none" | "size-color" | "weight";
  sizeChart?: Record<string, Record<string, string>> | null; // { "M": { "Shoulder": "18in", ... } }
  variants?: ProductVariant[];
  stock?: number | null; // only meaningful for variantType "none" — null means untracked/always orderable
  outOfStockSince?: string | null;
  pickupLocation?: string | null; // falls back to the store's default pickup location if unset
  weightKg?: number; // package weight in kg, used for live Shiprocket shipping-rate calculation
                      // and actual shipment creation — used directly for variantType "none",
                      // and as the fallback default for variant products without their own override
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  productId: string | null;
  product: { id: string; name: string; slug: string } | null;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  line: string;
  city: string;
  pincode: string | null;
  phone: string;
  isDefault: boolean;
};

export type Service = {
  title: string;
  description: string;
  icon: string;
};

export type TeamMember = {
  name: string;
  role: string;
  image: string;
};