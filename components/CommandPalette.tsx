"use client";

import type { CommandType } from "@/types/game";
import { CommandButton } from "./CommandButton";

export function CommandPalette({
  availableCommands,
  onAdd,
  disabled,
}: {
  availableCommands: CommandType[];
  onAdd: (type: CommandType) => void;
  disabled?: boolean;
}) {
  return (
    <section aria-label="Available commands">
      <h2 className="mb-3 text-lg font-bold text-[var(--text-dark)]">
        Tap a command
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {availableCommands.map((type) => (
          <CommandButton
            key={type}
            type={type}
            onClick={() => onAdd(type)}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}
