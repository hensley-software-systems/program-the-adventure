"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LevelDefinition } from "@/types/game";
import { getLevelById } from "@/data/levels";
import { preloadVoices, speakText } from "@/engine/speech";
import { useGameState } from "@/hooks/useGameState";
import { useProgress } from "@/hooks/useProgress";
import { CommandPalette } from "./CommandPalette";
import { GameBoard } from "./GameBoard";
import { MissionCard } from "./MissionCard";
import { ParentGateButton, ParentPanel } from "./ParentPanel";
import { PlaybackControls } from "./PlaybackControls";
import { ProgramSequence } from "./ProgramSequence";
import { RetryMessage } from "./RetryMessage";
import { SuccessModal } from "./SuccessModal";

export function GameScreen({ level }: { level: LevelDefinition }) {
  const router = useRouter();
  const {
    progress,
    loaded,
    completeLevel,
    updateSettings,
    resetProgress,
    isLevelUnlocked,
  } = useProgress();
  const [parentOpen, setParentOpen] = useState(false);
  const [verticalLayout, setVerticalLayout] = useState(false);

  useEffect(() => {
    preloadVoices();
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setVerticalLayout(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const {
    gameState,
    addCommand,
    removeCommand,
    moveCommand,
    runProgram,
    resetLevel,
    stopProgram,
    resumeEditing,
    showHint,
  } = useGameState(level, progress.settings, completeLevel);

  useEffect(() => {
    if (loaded && !isLevelUnlocked(level.id) && level.id !== 1) {
      router.replace(`/level/${progress.highestUnlockedLevel}`);
    }
  }, [loaded, isLevelUnlocked, level.id, progress.highestUnlockedLevel, router]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl font-bold">
        Loading adventure...
      </div>
    );
  }

  const isRunning = gameState.status === "running";
  const isEditing = gameState.status === "editing" || gameState.status === "retry";
  const hasNextLevel = Boolean(getLevelById(level.id + 1));

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6">
      <header className="mx-auto mb-4 flex max-w-6xl items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-2xl bg-white/80 px-4 py-2 font-bold shadow-md"
          aria-label="Back to home"
        >
          🏠 Home
        </Link>
        <div className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold shadow-md">
          Level {level.id} / 10
        </div>
        <button
          type="button"
          onClick={() =>
            speakText(level.narrationText, progress.settings.narrationEnabled)
          }
          aria-label="Replay mission narration"
          className="rounded-2xl bg-white/80 px-4 py-2 font-bold shadow-md"
        >
          🔊 Replay
        </button>
      </header>

      <div
        className={`mx-auto grid max-w-6xl gap-4 ${
          verticalLayout
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]"
        }`}
      >
        <div className="flex flex-col gap-4">
          <MissionCard level={level} message={isEditing ? gameState.message : null} />
          <GameBoard
            level={level}
            character={gameState.character}
            collectedItems={gameState.collectedItems}
            doorStates={gameState.doorStates}
            lastAction={gameState.lastAction}
            celebrating={gameState.status === "success"}
            reducedMotion={progress.settings.reducedMotion}
          />
          {gameState.status === "retry" && gameState.message && (
            <RetryMessage
              message={gameState.message}
              onEdit={resumeEditing}
              onRetry={runProgram}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl bg-white/70 p-4 shadow-lg backdrop-blur">
          <ProgramSequence
            program={gameState.program}
            activeCommandIndex={gameState.activeCommandIndex}
            onRemove={removeCommand}
            onMove={moveCommand}
            disabled={!isEditing}
            verticalReorder={verticalLayout}
          />
          <CommandPalette
            availableCommands={level.availableCommands}
            onAdd={addCommand}
            disabled={!isEditing}
          />
          <PlaybackControls
            onPlay={runProgram}
            onReset={resetLevel}
            onStop={stopProgram}
            onHint={showHint}
            canPlay={gameState.program.length > 0}
            isRunning={isRunning}
            disabled={!isEditing && !isRunning}
          />
        </div>
      </div>

      {gameState.status === "success" && gameState.message && (
        <SuccessModal
          message={gameState.message}
          hasNextLevel={hasNextLevel}
          reducedMotion={progress.settings.reducedMotion}
          onContinue={() => router.push(`/level/${level.id + 1}`)}
          onReplay={resetLevel}
        />
      )}

      <ParentGateButton onUnlock={() => setParentOpen(true)} />
      <ParentPanel
        open={parentOpen}
        onClose={() => setParentOpen(false)}
        progress={progress}
        onUpdateSettings={updateSettings}
        onResetProgress={resetProgress}
        program={gameState.program}
        currentLevelId={level.id}
      />
    </div>
  );
}
