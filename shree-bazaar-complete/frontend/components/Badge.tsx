export default function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md bg-purple-700 px-2 py-1 text-[11px] font-bold text-white ${className}`}>
      {children}
    </span>
  );
}
