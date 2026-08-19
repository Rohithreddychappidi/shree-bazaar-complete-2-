import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Add Product</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Create a new product for the storefront.</p>
      <div className="max-w-[760px]">
        <ProductForm />
      </div>
    </div>
  );
}
