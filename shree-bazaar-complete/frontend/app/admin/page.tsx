"use client";

import Link from "next/link";
import { Package, LayoutGrid, ShoppingBag, IndianRupee, Plus, ArrowRight } from "lucide-react";
import { useAdminData } from "@/lib/admin-data-context";
import { useAdminOrders } from "@/lib/use-admin-orders";

export default function AdminDashboard() {
  const { products, categories } = useAdminData();
  const { orders, loading: ordersLoading } = useAdminOrders();

  const revenue = orders.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, href: "/admin/products" },
    { label: "Categories", value: categories.length, icon: LayoutGrid, href: "/admin/categories" },
    { label: "Orders", value: ordersLoading ? "…" : orders.length, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Revenue", value: ordersLoading ? "…" : `₹${revenue}`, icon: IndianRupee, href: "/admin/orders" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">Overview of your storefront.</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-[#EFEDF8] bg-white p-5 transition-shadow hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <s.icon size={19} className="text-purple-700" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-[12.5px] text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-[13px] font-semibold text-purple-700">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-[#F8F8FC] px-4 py-3 text-[13px]">
                <span className="font-semibold text-gray-900">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                    o.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {o.status}
                </span>
                <span className="font-semibold text-gray-900">₹{o.total}</span>
              </div>
            ))}
            {!ordersLoading && orders.length === 0 && <p className="text-[13px] text-gray-400">No orders yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Low on Details</h2>
          <p className="mb-4 text-[13px] text-gray-500">
            Products missing a description or with only one photo — worth finishing before launch.
          </p>
          <div className="flex flex-col gap-2">
            {products
              .filter((p) => !p.description || p.images.length < 2)
              .slice(0, 5)
              .map((p) => (
                <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex items-center justify-between rounded-xl bg-[#F8F8FC] px-4 py-2.5 text-[13px] hover:bg-purple-50">
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
              ))}
            {products.filter((p) => !p.description || p.images.length < 2).length === 0 && (
              <p className="text-[13px] text-gray-400">All products look complete.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
