"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SavedProgress } from "@/types/game";
import { LEVELS } from "@/data/levels";
import { generateJavaScript } from "@/engine/codeGenerator";
import type { ProgramCommand } from "@/types/game";

export function ParentPanel({
  open,
  onClose,
  progress,
  onUpdateSettings,
  onResetProgress,
  program,
  currentLevelId,
}: {
  open: boolean;
  onClose: () => void;
  progress: SavedProgress;
  onUpdateSettings: (settings: Partial<SavedProgress["settings"]>) => void;
  onResetProgress: () => void;
  program: ProgramCommand[];
  currentLevelId: number;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Parent settings"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Parent Mode</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 font-bold"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Toggle
            label="Narration"
            checked={progress.settings.narrationEnabled}
            onChange={(value) => onUpdateSettings({ narrationEnabled: value })}
          />
          <Toggle
            label="Sound effects"
            checked={progress.settings.soundEffectsEnabled}
            onChange={(value) =>
              onUpdateSettings({ soundEffectsEnabled: value })
            }
          />
          <Toggle
            label="Music"
            checked={progress.settings.musicEnabled}
            onChange={(value) => onUpdateSettings({ musicEnabled: value })}
          />
          <Toggle
            label="Act-It-Out narration"
            checked={progress.settings.actItOutEnabled}
            onChange={(value) => onUpdateSettings({ actItOutEnabled: value })}
          />
          <Toggle
            label="Reduced motion"
            checked={progress.settings.reducedMotion}
            onChange={(value) => onUpdateSettings({ reducedMotion: value })}
          />
          <Toggle
            label="Faster animations"
            checked={progress.settings.fastAnimations}
            onChange={(value) => onUpdateSettings({ fastAnimations: value })}
          />
        </div>

        <section className="mt-6">
          <h3 className="text-lg font-bold">Equivalent JavaScript</h3>
          <pre className="mt-2 overflow-x-auto rounded-2xl bg-gray-900 p-4 text-sm text-green-300">
            {generateJavaScript(program)}
          </pre>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-bold">Jump to level</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEVELS.map((level) => {
              const unlocked = level.id <= progress.highestUnlockedLevel;
              return (
                <Link
                  key={level.id}
                  href={unlocked ? `/level/${level.id}` : "#"}
                  onClick={(event) => {
                    if (!unlocked) event.preventDefault();
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-bold ${
                    unlocked
                      ? "bg-[var(--sky)] text-[var(--text-dark)]"
                      : "cursor-not-allowed bg-gray-200 text-gray-400"
                  } ${level.id === currentLevelId ? "ring-4 ring-[var(--bloop-blue)]" : ""}`}
                >
                  {level.id}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-bold">Concepts in this level</h3>
          <p className="mt-1 text-sm opacity-80">
            {LEVELS.find((level) => level.id === currentLevelId)?.concept}
          </p>
        </section>

        <button
          type="button"
          onClick={onResetProgress}
          className="mt-6 min-h-12 rounded-2xl bg-red-100 px-4 font-bold text-red-700"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between rounded-2xl bg-gray-50 px-4">
      <span className="font-semibold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}

export function ParentGateButton({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [answer, setAnswer] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const startHold = () => {
    setHolding(true);
    timerRef.current = window.setTimeout(() => {
      setShowPrompt(true);
      setHolding(false);
    }, 3000);
  };

  const endHold = () => {
    setHolding(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const submitAnswer = () => {
    if (answer.trim() === "7") {
      onUnlock();
      setShowPrompt(false);
      setAnswer("");
    }
  };

  return (
    <>
      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        aria-label="Parent mode. Press and hold for three seconds."
        className={`fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl shadow-lg ${
          holding ? "ring-4 ring-[var(--bloop-blue)]" : ""
        }`}
      >
        👪
      </button>

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Parent check</h2>
            <p className="mt-2">What is 4 + 3?</p>
            <input
              type="number"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="mt-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
              aria-label="Answer to parent check"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={submitAnswer}
                className="min-h-12 flex-1 rounded-2xl bg-[var(--play-green)] font-bold text-white"
              >
                Enter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrompt(false);
                  setAnswer("");
                }}
                className="min-h-12 flex-1 rounded-2xl bg-gray-100 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
