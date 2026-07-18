"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LevelDefinition } from "@/types/game";
import { getLevelById, LEVEL_COUNT } from "@/data/levels";
import { getDifficultyLabel } from "@/engine/generateRandomLevel";
import type { RandomDifficulty } from "@/data/randomDifficulty";
import { preloadVoices, speakText } from "@/engine/speech";
import { useGameState } from "@/hooks/useGameState";
import { useProgress } from "@/hooks/useProgress";
import { CommandPalette } from "./CommandPalette";
import { ActiveCommandBar } from "./ActiveCommandBar";
import { GameBoard } from "./GameBoard";
import { LevelPicker } from "./LevelPicker";
import { MissionCard } from "./MissionCard";
import { ParentGateButton, ParentPanel } from "./ParentPanel";
import { PlaybackControls } from "./PlaybackControls";
import { ProgramSequence } from "./ProgramSequence";
import { RetryMessage } from "./RetryMessage";
import { SuccessModal } from "./SuccessModal";
import { RandomLevelMenuButton } from "./RandomLevelMenu";

export function GameScreen({
  level,
  isRandom = false,
  randomDifficulty,
  onNewRandom,
}: {
  level: LevelDefinition;
  isRandom?: boolean;
  randomDifficulty?: RandomDifficulty;
  onNewRandom?: () => void;
}) {
  const router = useRouter();
  const {
    progress,
    loaded,
    completeLevel,
    updateSettings,
    resetProgress,
  } = useProgress();
  const [parentOpen, setParentOpen] = useState(false);
  const [verticalLayout, setVerticalLayout] = useState(false);

  useEffect(() => {
    preloadVoices();
    const media = window.matchMedia("(max-width: 1023px)");
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
    togglePause,
  } = useGameState(
    level,
    progress.settings,
    isRandom ? () => {} : completeLevel,
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || gameState.status !== "running") {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      togglePause();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameState.status, togglePause]);

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
          {isRandom && randomDifficulty
            ? `Random · ${getDifficultyLabel(randomDifficulty)}`
            : `Level ${level.id} / ${LEVEL_COUNT}`}
        </div>
        <div className="flex flex-wrap gap-2">
          {isRandom && onNewRandom && (
            <button
              type="button"
              onClick={onNewRandom}
              className="rounded-2xl bg-[var(--warm-yellow)] px-4 py-2 font-bold shadow-md"
            >
              🎲 Another
            </button>
          )}
          <RandomLevelMenuButton compact />
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
        </div>
      </header>

      <div className="mx-auto mb-4 max-w-6xl rounded-2xl bg-white/70 px-3 py-3 shadow-md backdrop-blur">
        <p className="mb-2 text-center text-sm font-bold text-[var(--text-dark)]/80">
          Jump to any level
        </p>
        <LevelPicker currentLevelId={level.id} compact />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,1fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex w-full flex-col gap-4 lg:sticky lg:top-4 lg:z-10">
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
          {(isRunning || gameState.activeCommandIndex !== null) && (
            <ActiveCommandBar
              program={gameState.program}
              activeCommandIndex={gameState.activeCommandIndex}
              isPaused={gameState.isPaused}
            />
          )}
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
            activeCommandIndex={
              isRunning ? null : gameState.activeCommandIndex
            }
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
            onPause={togglePause}
            canPlay={gameState.program.length > 0}
            isRunning={isRunning}
            isPaused={gameState.isPaused}
            disabled={!isEditing && !isRunning}
          />
        </div>
      </div>

      {gameState.status === "success" && gameState.message && (
        <SuccessModal
          message={gameState.message}
          hasNextLevel={isRandom ? Boolean(onNewRandom) : hasNextLevel}
          continueLabel={isRandom ? "Another Random →" : "Next Level →"}
          reducedMotion={progress.settings.reducedMotion}
          onContinue={() => {
            if (isRandom && onNewRandom) {
              onNewRandom();
              resetLevel();
            } else {
              router.push(`/level/${level.id + 1}`);
            }
          }}
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
