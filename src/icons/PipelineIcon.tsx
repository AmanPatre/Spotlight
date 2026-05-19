export const PipelineIcon = ({
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
    <circle cx="5" cy="6" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="19" cy="6" r="2" />
    <line x1="5" y1="8" x2="5" y2="14" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <rect x="2" y="14" width="6" height="4" rx="1" />
    <rect x="9" y="14" width="6" height="4" rx="1" />
    <rect x="16" y="14" width="6" height="4" rx="1" />
  </svg>
);
