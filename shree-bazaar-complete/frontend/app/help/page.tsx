"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import { useSettings } from "@/lib/use-settings";

const faqs = [
  { q: "How do I track my order?", a: "Go to My Profile → Orders, or use the Orders tab in the mobile bottom navigation. Each order shows its live shipment status." },
  { q: "Can I cancel my order?", a: "Yes, within the cancellation window shown on your order (usually a few hours after placing it), as long as it hasn't shipped yet and doesn't contain a \"No Return\" item. See our Returns & Cancellation Policy for full details." },
  { q: "Why does my order have multiple parcels?", a: "If your order contains products from more than one of our warehouses, it ships as separate parcels, sometimes on different days. Your total cost already accounts for this — nothing extra is charged." },
  { q: "What payment methods do you accept?", a: "All major cards, UPI, and net banking, processed securely through Razorpay." },
  { q: "How long does delivery take?", a: "Most orders arrive within 3–7 business days of dispatch, depending on your location." },
  { q: "Is shipping free?", a: "Yes, on orders above the free shipping threshold shown at checkout. Below that, delivery cost is calculated live based on your pincode and order weight." },
  { q: "My order arrived damaged — what do I do?", a: "Contact us within 48 hours of delivery with photos of the product and packaging, and we'll arrange a replacement or refund." },
];

export default function HelpPage() {
  const { settings } = useSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="mx-auto max-w-[820px] px-6 py-10">
      <div className="mb-10 text-center">
        <p className="mb-1 text-[12px] font-semibold tracking-[2px] text-purple-700 uppercase">We're Here to Help</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">Help & FAQs</h1>
      </div>

      {/* Contact */}
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {settings?.contactPhone && (
          <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="flex flex-col items-center gap-2 rounded-2xl border border-[#EFEDF8] bg-white p-5 text-center hover:border-purple-400">
            <Phone size={20} className="text-purple-700" />
            <p className="text-[12.5px] font-semibold text-gray-800">Call Us</p>
            <p className="text-[12px] text-gray-500">{settings.contactPhone}</p>
          </a>
        )}
        {settings?.contactEmail && (
          <a href={`mailto:${settings.contactEmail}`} className="flex flex-col items-center gap-2 rounded-2xl border border-[#EFEDF8] bg-white p-5 text-center hover:border-purple-400">
            <Mail size={20} className="text-purple-700" />
            <p className="text-[12.5px] font-semibold text-gray-800">Email Us</p>
            <p className="text-[12px] text-gray-500">{settings.contactEmail}</p>
          </a>
        )}
        {settings?.contactAddress && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-[#EFEDF8] bg-white p-5 text-center">
            <MapPin size={20} className="text-purple-700" />
            <p className="text-[12.5px] font-semibold text-gray-800">Find Us</p>
            <p className="text-[12px] text-gray-500">{settings.contactAddress}</p>
          </div>
        )}
      </div>

      {/* FAQs */}
      <h2 className="mb-4 font-display text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
      <div className="flex flex-col gap-2">
        {faqs.map((item, i) => (
          <div key={item.q} className="overflow-hidden rounded-xl border border-[#EFEDF8] bg-white">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[13.5px] font-medium text-gray-800"
            >
              {item.q}
              <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
            </button>
            {openIndex === i && <p className="px-5 pb-4 text-[13px] leading-relaxed text-gray-500">{item.a}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
