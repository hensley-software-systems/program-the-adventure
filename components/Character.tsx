"use client";

import { directionToRotation } from "@/engine/movement";
import type { CharacterState } from "@/types/game";

export function Character({
  character,
  lastAction,
  celebrating,
  reducedMotion,
}: {
  character: CharacterState;
  lastAction: string | null;
  celebrating?: boolean;
  reducedMotion?: boolean;
}) {
  const rotation = directionToRotation(character.direction);
  const jumpClass =
    lastAction === "jump" && !reducedMotion ? "animate-jump" : "";
  const celebrateClass =
    celebrating && !reducedMotion ? "animate-celebrate" : "";
  const confusedClass =
    lastAction === "sillyJump" && !reducedMotion ? "animate-bounce-in" : "";

  return (
    <div
      className={`absolute inset-1 flex items-center justify-center transition-transform duration-500 ${jumpClass} ${celebrateClass} ${confusedClass}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`Bloop facing ${character.direction}`}
    >
      <div className="relative flex h-[85%] w-[85%] flex-col items-center justify-center rounded-2xl bg-[var(--bloop-blue)] shadow-md ring-4 ring-white/70">
        <div className="absolute -top-2 flex w-full justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-white shadow" />
          <span className="h-3 w-3 rounded-full bg-white shadow" />
        </div>
        <div className="mt-2 h-2 w-8 rounded-full bg-[var(--bloop-dark)]/40" />
        <div className="absolute -bottom-1 text-lg">🤖</div>
      </div>
      {lastAction === "moo" && (
        <div className="absolute -top-8 rounded-full bg-white px-2 py-1 text-sm font-bold shadow-md">
          Moo!
        </div>
      )}
    </div>
  );
}
