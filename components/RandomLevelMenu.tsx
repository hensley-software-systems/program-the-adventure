"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RandomDifficulty } from "@/data/randomDifficulty";
import {
  getDifficultyLabel,
  getDifficultyStepRange,
  RANDOM_DIFFICULTIES,
} from "@/engine/generateRandomLevel";

const DIFFICULTY_STYLES: Record<
  RandomDifficulty,
  { emoji: string; color: string }
> = {
  easy: { emoji: "🌱", color: "bg-green-400 hover:bg-green-500" },
  medium: { emoji: "🌊", color: "bg-[var(--sky)] hover:bg-[#6ab8d6]" },
  hard: { emoji: "🔥", color: "bg-orange-400 hover:bg-orange-500" },
  impossible: { emoji: "🌈", color: "bg-[var(--soft-purple)] hover:bg-[#a595de]" },
};

export function RandomLevelMenuButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const startRandom = (difficulty: RandomDifficulty) => {
    setOpen(false);
    router.push(`/random/${difficulty}?t=${Date.now()}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open random level menu"
        className={
          compact
            ? "rounded-2xl bg-white/80 px-4 py-2 font-bold shadow-md"
            : "inline-flex min-h-14 min-w-56 items-center justify-center rounded-2xl bg-[var(--bloop-blue)] px-8 text-xl font-bold text-white shadow-lg transition hover:bg-[var(--bloop-dark)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--bloop-dark)]"
        }
      >
        {compact ? "🎲 Random" : "🎲 Random Level"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose random level difficulty"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Random Adventure</h2>
                <p className="mt-1 text-sm opacity-70">
                  Generate a surprise level for Bloop. Play forever!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close random level menu"
                className="rounded-xl bg-gray-100 px-3 py-2 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {RANDOM_DIFFICULTIES.map((difficulty) => {
                const style = DIFFICULTY_STYLES[difficulty];
                return (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => startRandom(difficulty)}
                    className={`flex min-h-24 flex-col items-center justify-center rounded-2xl px-4 py-4 text-white shadow-md transition ${style.color}`}
                  >
                    <span className="text-3xl" aria-hidden="true">
                      {style.emoji}
                    </span>
                    <span className="mt-2 text-lg font-bold">
                      {getDifficultyLabel(difficulty)}
                    </span>
                    <span className="mt-1 text-sm opacity-90">
                      {getDifficultyStepRange(difficulty)}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs opacity-60">
              Medium and above include Jump and Say Moo.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
