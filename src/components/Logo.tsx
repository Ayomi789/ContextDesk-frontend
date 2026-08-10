export function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="7" className="fill-text" />
      <path d="M9 10.5h14M9 16h10M9 21.5h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-bg" />
    </svg>
  );
}
