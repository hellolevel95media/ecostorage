export function WarehouseIcon({ className = "h-auto w-[26px]" }: { className?: string }) {
  return (
    <svg
      viewBox="2.3 3.3 19.4 17.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 9.5 12 4l9 5.5V20H3z" />
      <path d="M7.5 20v-7.5h9V20" />
      <path d="M7.5 15h9M7.5 17.5h9" />
    </svg>
  );
}
