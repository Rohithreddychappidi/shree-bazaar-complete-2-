export default function LogoMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* handles */}
      <path d="M16 18v-5a8 8 0 0 1 16 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* bag body */}
      <rect x="7" y="17" width="34" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
      {/* SH monogram */}
      <text
        x="24"
        y="33.5"
        textAnchor="middle"
        fontFamily="'Playfair Display', serif"
        fontSize="13"
        fontWeight="700"
        className="fill-surface-fg"
      >
        SH
      </text>
    </svg>
  );
}
