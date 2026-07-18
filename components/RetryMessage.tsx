"use client";

export function RetryMessage({
  message,
  onEdit,
  onRetry,
}: {
  message: string;
  onEdit: () => void;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-3xl bg-white/95 p-5 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">
          😅
        </span>
        <div>
          <h2 className="text-xl font-bold">Almost!</h2>
          <p className="mt-1 text-base">{message}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-12 rounded-2xl bg-[var(--warm-yellow)] px-5 font-bold"
        >
          Edit Program
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-12 rounded-2xl bg-[var(--play-green)] px-5 font-bold text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
