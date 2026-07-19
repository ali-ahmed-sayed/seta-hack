export function SetaMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Outer capsule */}
      <path d="M50 8 C74 8 88 28 88 65 C88 102 74 122 50 122 C26 122 12 102 12 65 C12 28 26 8 50 8 Z" />
      {/* S curve top */}
      <path d="M64 30 C56 26 40 26 36 38 C32 50 46 54 54 58" />
      {/* diagonal / cross */}
      <path d="M34 44 L66 96" />
      {/* T stem */}
      <path d="M50 70 L50 104" />
      {/* small arc bottom */}
      <path d="M36 100 C44 106 56 106 64 100" />
    </svg>
  );
}
