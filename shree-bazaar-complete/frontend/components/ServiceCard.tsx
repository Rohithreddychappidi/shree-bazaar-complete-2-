import * as Icons from "lucide-react";
import { Service } from "@/lib/types";

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[service.icon] ?? Icons.Circle;
  return (
    <div className="rounded-2xl border border-[#EFEDF8] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_28px_-14px_rgba(17,24,39,0.15)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
        <Icon size={24} className="text-purple-700" strokeWidth={1.8} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900">{service.title}</h3>
      <p className="text-[13.5px] leading-relaxed text-gray-500">{service.description}</p>
    </div>
  );
}
