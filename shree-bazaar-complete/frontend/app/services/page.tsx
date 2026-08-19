import Button from "@/components/Button";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/data";
import { ChevronDown } from "lucide-react";

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1,200+", label: "Products" },
  { value: "20+", label: "Cities Served" },
  { value: "4.7/5", label: "Average Rating" },
];

const faqs = [
  { q: "How long does delivery take?", a: "Most orders are delivered within 3–6 business days, depending on your location." },
  { q: "Is Cash on Delivery available?", a: "Yes, COD is available on eligible orders alongside Razorpay online payments." },
  { q: "Can I return a product?", a: "Yes, most items can be returned within 7 days of delivery in original condition." },
  { q: "Do you deliver pan-India?", a: "Yes, we ship across India through our Shiprocket courier network." },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-3 text-xs font-semibold tracking-[2px] uppercase opacity-85">What We Offer</div>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Service You Can Rely On</h1>
          <p className="text-sm opacity-90 sm:text-base">
            From doorstep delivery to secure payments, everything is built around a smooth, trustworthy shopping experience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.title} service={s} />
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-purple-700">{s.value}</div>
              <div className="mt-1 text-[13px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-6 py-14">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-[#EFEDF8] bg-white p-[18px]">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
                {f.q}
                <ChevronDown size={16} className="text-purple-700 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[13.5px] leading-relaxed text-gray-500">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16">
        <div className="flex flex-col items-center gap-4 rounded-[18px] bg-purple-50 px-6 py-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Ready to start shopping?</h3>
          <p className="max-w-[420px] text-sm text-gray-500">Browse our full catalog of food, fashion, pooja items and more.</p>
          <Button href="/products">Explore Products</Button>
        </div>
      </section>
    </main>
  );
}
