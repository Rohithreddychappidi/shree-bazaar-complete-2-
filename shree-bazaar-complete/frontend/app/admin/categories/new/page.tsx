import CategoryForm from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Add Category</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Create a new category for the storefront.</p>
      <div className="max-w-[600px]">
        <CategoryForm />
      </div>
    </div>
  );
}
