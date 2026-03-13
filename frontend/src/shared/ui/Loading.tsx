interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label = "Loading...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-sm text-moss/80 ${className}`}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
}

export function ListSkeleton({ rows = 4 }: ListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="list-row animate-pulse">
          <span className="skeleton-line h-4 w-32" />
          <span className="skeleton-line h-4 w-40" />
          <span className="skeleton-line h-4 w-20 justify-self-end" />
        </div>
      ))}
    </div>
  );
}
