"use client";

export function SuccessModal({
  message,
  onContinue,
  onReplay,
  hasNextLevel,
  reducedMotion,
}: {
  message: string;
  onContinue: () => void;
  onReplay: () => void;
  hasNextLevel: boolean;
  reducedMotion?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Level complete"
    >
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="animate-confetti absolute text-2xl"
              style={{
                left: `${(index * 17) % 100}%`,
                top: `${(index * 11) % 40}%`,
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {index % 2 === 0 ? "⭐" : "🎉"}
            </span>
          ))}
        </div>
      )}

      <div className="relative max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl">🎉</div>
        <h2 className="mt-4 text-3xl font-bold">You did it!</h2>
        <p className="mt-3 text-lg">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {hasNextLevel && (
            <button
              type="button"
              onClick={onContinue}
              className="min-h-14 flex-1 rounded-2xl bg-[var(--play-green)] px-4 text-lg font-bold text-white"
            >
              Next Level →
            </button>
          )}
          <button
            type="button"
            onClick={onReplay}
            className="min-h-14 flex-1 rounded-2xl bg-[var(--sky)] px-4 text-lg font-bold text-[var(--text-dark)]"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
