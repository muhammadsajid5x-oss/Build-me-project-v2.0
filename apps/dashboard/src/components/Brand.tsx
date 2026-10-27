/**
 * Build Me brand mark.
 *
 * Renders a small, dark-friendly SVG logo. The logo is intentionally simple
 * so it scales cleanly in the sidebar and profile menu.
 */
export function BuildMeLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="6" fill="#1e40af" />
      <path
        d="M9 22V10h4.5c2.5 0 4.5 1.5 4.5 4s-2 4-4.5 4H11m0 4v-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Horizontal brand lockup: logo + wordmark.
 */
export function BuildMeBrand({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <BuildMeLogo size={size} />
      <span className="text-lg font-bold tracking-tight text-white">
        Build Me
      </span>
    </span>
  );
}