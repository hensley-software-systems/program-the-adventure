"use client";

import type { ProgramCommand } from "@/types/game";
import { COMMAND_DEFINITIONS } from "@/types/commands";

export function ProgramStep({
  command,
  index,
  active,
  onRemove,
  onMoveLeft,
  onMoveRight,
  disabled,
  isLast,
  verticalReorder,
}: {
  command: ProgramCommand;
  index: number;
  active: boolean;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  disabled?: boolean;
  isLast?: boolean;
  verticalReorder?: boolean;
}) {
  const definition = COMMAND_DEFINITIONS[command.type];

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl bg-white p-2 shadow-md transition ${
        active
          ? "ring-4 ring-[var(--warm-yellow)] scale-[1.03]"
          : "ring-2 ring-transparent"
      }`}
    >
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onMoveLeft}
          disabled={disabled || index === 0}
          aria-label={`Move step ${index + 1} ${verticalReorder ? "up" : "left"}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sky)] text-lg font-bold disabled:opacity-40"
        >
          {verticalReorder ? "↑" : "←"}
        </button>
        <button
          type="button"
          onClick={onMoveRight}
          disabled={disabled || isLast}
          aria-label={`Move step ${index + 1} ${verticalReorder ? "down" : "right"}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sky)] text-lg font-bold disabled:opacity-40"
        >
          {verticalReorder ? "↓" : "→"}
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${definition.label} from program`}
        className="flex min-h-14 flex-1 items-center gap-3 rounded-xl px-3 text-left hover:bg-red-50 disabled:cursor-not-allowed"
      >
        <span className="text-3xl" aria-hidden="true">
          {definition.icon}
        </span>
        <span className="font-bold">{definition.label}</span>
      </button>
    </div>
  );
}
