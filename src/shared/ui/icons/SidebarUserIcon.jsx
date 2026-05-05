export function SidebarUserIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9.25" stroke="#0F2E6B" strokeWidth="1.5" fill="white" />
      <circle cx="10" cy="8" r="3" fill="#0F2E6B" />
      <path
        d="M3.5 17c1.2-3 3.6-4.6 6.5-4.6S15.3 14 16.5 17"
        stroke="#0F2E6B"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
