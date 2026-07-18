"use client";

export function PlaybackControls({
  onPlay,
  onReset,
  onStop,
  onHint,
  onPause,
  canPlay,
  isRunning,
  isPaused,
  disabled,
}: {
  onPlay: () => void;
  onReset: () => void;
  onStop: () => void;
  onHint: () => void;
  onPause?: () => void;
  canPlay: boolean;
  isRunning: boolean;
  isPaused?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onPlay}
        disabled={!canPlay || disabled}
        aria-label="Play program"
        className="flex min-h-16 min-w-32 flex-1 items-center justify-center rounded-2xl bg-[var(--play-green)] px-6 text-xl font-bold text-white shadow-lg hover:bg-[var(--play-green-dark)] disabled:opacity-50"
      >
        ▶ Play
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={isRunning}
        aria-label="Start over"
        className="flex min-h-16 min-w-32 flex-1 items-center justify-center rounded-2xl bg-white px-6 text-lg font-bold shadow-md hover:bg-[var(--warm-yellow)] disabled:opacity-50"
      >
        ↺ Start Over
      </button>
      {isRunning && (
        <button
          type="button"
          onClick={onPause}
          aria-label={isPaused ? "Resume program" : "Pause program"}
          aria-pressed={isPaused}
          className="flex min-h-16 min-w-24 items-center justify-center rounded-2xl bg-[var(--warm-yellow)] px-4 text-lg font-bold shadow-md"
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      )}
      {isRunning && (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop program"
          className="flex min-h-16 min-w-24 items-center justify-center rounded-2xl bg-red-400 px-4 text-lg font-bold text-white shadow-md"
        >
          Stop
        </button>
      )}
      <button
        type="button"
        onClick={onHint}
        disabled={isRunning}
        aria-label="Get a hint"
        className="flex min-h-16 min-w-24 items-center justify-center rounded-2xl bg-[var(--soft-purple)] px-4 text-lg font-bold text-white shadow-md disabled:opacity-50"
      >
        💡 Hint
      </button>
    </div>
  );
}
