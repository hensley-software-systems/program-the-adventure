"use client";

import type { LevelDefinition } from "@/types/game";

export function MissionCard({
  level,
  message,
}: {
  level: LevelDefinition;
  message: string | null;
}) {
  return (
    <section className="rounded-3xl bg-white/90 p-4 shadow-lg backdrop-blur">
      <div className="text-sm font-semibold text-[var(--bloop-dark)]">
        Level {level.id}: {level.title}
      </div>
      <h1 className="mt-1 text-2xl font-bold text-[var(--text-dark)]">
        {level.missionText}
      </h1>
      <p className="mt-2 text-sm text-[var(--text-dark)]/70">
        {level.narrationText}
      </p>
      {message && (
        <div
          role="status"
          className="mt-3 rounded-2xl bg-[var(--warm-yellow)]/60 px-4 py-3 text-base font-semibold"
        >
          {message}
        </div>
      )}
    </section>
  );
}
