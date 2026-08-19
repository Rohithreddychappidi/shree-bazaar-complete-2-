import CouponForm from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Add Coupon</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Create a new discount code.</p>
      <div className="max-w-[700px]">
        <CouponForm />
      </div>
    </div>
  );
}
