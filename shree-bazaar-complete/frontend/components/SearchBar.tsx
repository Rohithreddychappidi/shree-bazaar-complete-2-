"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
};

export default function SearchBar({ className = "", value, onChange, onSubmit }: SearchBarProps) {
  const inner = (
    <div className="flex items-center gap-2.5 rounded-xl border border-[#E7E4F4] bg-[#F8F8FC] px-3.5 py-2.5">
      <Search size={16} className="shrink-0 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Search for sarees, pickles, pooja items, gifts..."
        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
      />
    </div>
  );

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className={className}>
        {inner}
      </form>
    );
  }
  return <div className={className}>{inner}</div>;
}
