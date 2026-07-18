"use client";

import type { CommandType } from "@/types/game";
import { COMMAND_DEFINITIONS } from "@/types/commands";

export function CommandButton({
  type,
  onClick,
  disabled,
}: {
  type: CommandType;
  onClick: () => void;
  disabled?: boolean;
}) {
  const command = COMMAND_DEFINITIONS[type];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={command.ariaLabel}
      className="flex min-h-16 min-w-16 flex-1 flex-col items-center justify-center rounded-2xl bg-white px-3 py-3 text-center shadow-md transition hover:scale-[1.03] hover:bg-[var(--warm-yellow)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--bloop-blue)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-20 sm:min-w-20"
    >
      <span className="text-3xl sm:text-4xl" aria-hidden="true">
        {command.icon}
      </span>
      <span className="mt-1 text-xs font-bold sm:text-sm">{command.label}</span>
    </button>
  );
}
