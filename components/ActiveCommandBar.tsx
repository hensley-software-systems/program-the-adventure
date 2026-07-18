"use client";

import type { ProgramCommand } from "@/types/game";
import { COMMAND_DEFINITIONS } from "@/types/commands";

export function ActiveCommandBar({
  program,
  activeCommandIndex,
  isPaused,
}: {
  program: ProgramCommand[];
  activeCommandIndex: number | null;
  isPaused?: boolean;
}) {
  if (program.length === 0 || activeCommandIndex === null) {
    return null;
  }

  const activeCommand = program[activeCommandIndex];
  const activeDefinition = activeCommand
    ? COMMAND_DEFINITIONS[activeCommand.type]
    : null;

  return (
    <section
      aria-label="Program execution"
      aria-live="polite"
      className="rounded-3xl bg-white/90 p-4 shadow-lg backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--bloop-dark)]">
          Running program
        </h2>
        {isPaused && (
          <span className="rounded-full bg-[var(--warm-yellow)] px-3 py-1 text-sm font-bold">
            Paused — press Space
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {program.map((command, index) => {
          const definition = COMMAND_DEFINITIONS[command.type];
          const isActive = index === activeCommandIndex;

          return (
            <div
              key={command.id}
              aria-current={isActive ? "step" : undefined}
              className={`flex min-h-14 min-w-14 flex-col items-center justify-center rounded-2xl px-3 py-2 transition ${
                isActive
                  ? "scale-110 bg-[var(--warm-yellow)] shadow-lg ring-4 ring-[var(--bloop-blue)]"
                  : "bg-white/70 opacity-50"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">
                {definition.icon}
              </span>
              <span className="mt-1 text-xs font-bold">{definition.label}</span>
            </div>
          );
        })}
      </div>

      {activeDefinition && (
        <p className="mt-3 text-center text-base font-semibold text-[var(--text-dark)]">
          Now running: {activeDefinition.label}
        </p>
      )}
    </section>
  );
}
