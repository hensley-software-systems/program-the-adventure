"use client";

import type { ProgramCommand } from "@/types/game";
import { ProgramStep } from "./ProgramStep";

export function ProgramSequence({
  program,
  activeCommandIndex,
  onRemove,
  onMove,
  disabled,
  verticalReorder,
}: {
  program: ProgramCommand[];
  activeCommandIndex: number | null;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "left" | "right" | "up" | "down") => void;
  disabled?: boolean;
  verticalReorder?: boolean;
}) {
  return (
    <section aria-label="Your program">
      <h2 className="mb-3 text-lg font-bold text-[var(--text-dark)]">
        Your program
      </h2>
      {program.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-white/70 bg-white/50 px-4 py-8 text-center text-[var(--text-dark)]/70">
          Tap commands below to build your program!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {program.map((command, index) => (
            <ProgramStep
              key={command.id}
              command={command}
              index={index}
              active={activeCommandIndex === index}
              onRemove={() => onRemove(command.id)}
              onMoveLeft={() =>
                onMove(command.id, verticalReorder ? "up" : "left")
              }
              onMoveRight={() =>
                onMove(command.id, verticalReorder ? "down" : "right")
              }
              disabled={disabled}
              isLast={index === program.length - 1}
              verticalReorder={verticalReorder}
            />
          ))}
        </div>
      )}
    </section>
  );
}
