import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "white";
  className?: string;
};

export default function Button({ children, href, onClick, variant = "primary", className = "" }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200";
  const variants: Record<string, string> = {
    primary: "bg-purple-700 text-white hover:bg-purple-800 hover:-translate-y-0.5",
    outline: "border-2 border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white",
    white: "bg-white text-purple-700 hover:bg-purple-50 hover:-translate-y-0.5",
  };
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
