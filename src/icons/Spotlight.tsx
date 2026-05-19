export const SpotlightIcon = ({
  className = "w-6 h-6",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="7" r="4" />
    <line x1="9" y1="11" x2="5" y2="20" />
    <line x1="15" y1="11" x2="19" y2="20" />
    <line x1="5" y1="20" x2="19" y2="20" />
  </svg>
);
