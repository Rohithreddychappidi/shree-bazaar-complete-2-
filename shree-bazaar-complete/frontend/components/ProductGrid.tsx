import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, columns = 4 }: { products: Product[]; columns?: 3 | 4 }) {
  const colClass = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-2 gap-5 ${colClass}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
