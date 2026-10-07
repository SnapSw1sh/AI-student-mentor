// Иконкой, а не символом «→»: подмножество Inter с Google Fonts этот символ не содержит,
// и браузер подставлял тонкую длинную стрелку из системного шрифта.
export function ArrowRightIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 8H13M8.5 3.5L13 8L8.5 12.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
