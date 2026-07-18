"use client";

import Link from "next/link";
import { LEVELS } from "@/data/levels";

export function LevelPicker({
  currentLevelId,
  compact = false,
}: {
  currentLevelId?: number;
  compact?: boolean;
}) {
  return (
    <nav
      aria-label="Choose a level"
      className={
        compact
          ? "flex flex-wrap justify-center gap-1.5"
          : "grid w-full gap-3 sm:grid-cols-2"
      }
    >
      {LEVELS.map((level) => {
        const isCurrent = currentLevelId === level.id;

        if (compact) {
          return (
            <Link
              key={level.id}
              href={`/level/${level.id}`}
              aria-label={`Level ${level.id}: ${level.title}`}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold shadow-sm transition hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--bloop-blue)] ${
                isCurrent
                  ? "bg-[var(--bloop-blue)] text-white ring-4 ring-white"
                  : "bg-white/90 text-[var(--text-dark)] hover:bg-white"
              }`}
            >
              {level.id}
            </Link>
          );
        }

        return (
          <Link
            key={level.id}
            href={`/level/${level.id}`}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-2xl px-5 py-4 text-left shadow-md transition hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--bloop-blue)] ${
              isCurrent ? "bg-white ring-4 ring-[var(--bloop-blue)]" : "bg-white/80"
            }`}
          >
            <div className="text-sm font-semibold text-[var(--bloop-dark)]">
              Level {level.id}
            </div>
            <div className="text-lg font-bold">{level.title}</div>
            <div className="text-sm opacity-70">{level.missionText}</div>
          </Link>
        );
      })}
    </nav>
  );
}
