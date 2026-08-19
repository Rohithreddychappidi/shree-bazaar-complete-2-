import Link from "next/link";
import { ChevronRight } from "lucide-react";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  viewAllHref?: string;
};

export default function SectionTitle({ eyebrow, title, viewAllHref }: SectionTitleProps) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <div className="mb-1.5 text-xs font-semibold tracking-widest text-purple-700 uppercase">{eyebrow}</div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-[26px]">{title}</h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-800">
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
