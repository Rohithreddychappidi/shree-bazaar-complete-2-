"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Category, Product } from "./types";
import { api } from "./api";

// --- Backend shapes differ slightly from the frontend's Product/Category types
// (nested `category` object instead of a flat `categorySlug`, variantType uses
// "size_color" instead of "size-color", variant colors are flattened to
// colorName/colorHex instead of a nested {name,hex}). These adapters translate
// between the two so every other component keeps using the frontend shape.

type ApiCategory = Category & { id: string };
type ApiVariant = {
  id: string;
  size: string | null;
  colorName: string | null;
  colorHex: string | null;
  weightLabel: string | null;
  price: number;
  oldPrice: number;
  stock: number;
};
type ApiProduct = Omit<Product, "categorySlug" | "variantType" | "variants"> & {
  categoryId: string;
  category: ApiCategory;
  variantType: "none" | "size_color" | "weight";
  variants: ApiVariant[];
};

function fromApiProduct(p: ApiProduct): Product {
  return {
    ...p,
    categorySlug: p.category.slug,
    variantType: p.variantType === "size_color" ? "size-color" : p.variantType,
    variants: (p.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size ?? undefined,
      color: v.colorName ? { name: v.colorName, hex: v.colorHex ?? "#000000" } : undefined,
      weightLabel: v.weightLabel ?? undefined,
      price: v.price,
      oldPrice: v.oldPrice,
      stock: v.stock,
    })),
  };
}

function toApiPayload(product: Partial<Product>) {
  return {
    ...product,
    variantType: product.variantType === "size-color" ? "size_color" : product.variantType,
  };
}

type AdminDataContextType = {
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCategory: (category: Omit<Category, "slug"> & { name: string }) => Promise<void>;
  updateCategory: (slug: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (slug: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [cats, prods] = await Promise.all([
        api.get<Category[]>("/api/categories"),
        api.get<ApiProduct[]>("/api/products"),
      ]);
      setCategories(cats);
      setProducts(prods.map(fromApiProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load storefront data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, not a derived-state anti-pattern
    refresh();
  }, [refresh]);

  const addCategory: AdminDataContextType["addCategory"] = async (category) => {
    await api.post("/api/categories", category);
    await refresh();
  };
  const updateCategory: AdminDataContextType["updateCategory"] = async (slug, updates) => {
    await api.put(`/api/categories/${slug}`, updates);
    await refresh();
  };
  const deleteCategory: AdminDataContextType["deleteCategory"] = async (slug) => {
    await api.delete(`/api/categories/${slug}`);
    await refresh();
  };

  const addProduct: AdminDataContextType["addProduct"] = async (product) => {
    await api.post("/api/products", toApiPayload(product));
    await refresh();
  };
  const updateProduct: AdminDataContextType["updateProduct"] = async (id, updates) => {
    await api.put(`/api/products/${id}`, toApiPayload(updates));
    await refresh();
  };
  const deleteProduct: AdminDataContextType["deleteProduct"] = async (id) => {
    await api.delete(`/api/products/${id}`);
    await refresh();
  };

  return (
    <AdminDataContext.Provider
      value={{ categories, products, loading, error, refresh, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within an AdminDataProvider");
  return ctx;
}
