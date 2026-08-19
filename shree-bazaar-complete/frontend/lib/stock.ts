import { Product, ProductVariant } from "./types";

// A product counts as out of stock if it has no variants and its own stock is 0 or
// below, or if it has variants and every single one is at 0 or below. Products with
// stock === null/undefined are untracked (created before this feature, or admin chose
// not to track inventory for it) and are always considered in stock.
export function isProductOutOfStock(product: Product): boolean {
  if (product.variantType === "none") {
    return product.stock !== null && product.stock !== undefined && product.stock <= 0;
  }
  if (!product.variants || product.variants.length === 0) return false;
  return product.variants.every((v) => v.stock <= 0);
}

export function isVariantOutOfStock(variant: ProductVariant): boolean {
  return variant.stock <= 0;
}
