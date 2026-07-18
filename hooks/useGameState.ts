"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CharacterState,
  CommandType,
  GameState,
  LevelDefinition,
  ProgramCommand,
  SavedProgress,
} from "@/types/game";
import { createCommand, getInitialDoorStates } from "@/data/levels";
import { executeProgram } from "@/engine/executeProgram";
import {
  playAddCommand,
  playJump,
  playMove,
  playMoo,
  playRemoveCommand,
  playRetry,
  playSuccess,
} from "@/engine/sounds";
import { speakText } from "@/engine/speech";
import { COMMAND_DEFINITIONS } from "@/types/commands";

function createInitialState(level: LevelDefinition): GameState {
  return {
    levelId: level.id,
    program: level.starterProgram ? [...level.starterProgram] : [],
    character: { ...level.characterStart },
    collectedItems: [],
    doorStates: getInitialDoorStates(level),
    activeCommandIndex: null,
    status: "editing",
    message: null,
    lastAction: null,
  };
}

export function useGameState(
  level: LevelDefinition,
  settings: SavedProgress["settings"],
  onLevelComplete: (levelId: number) => void,
) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(level),
  );
  const abortRef = useRef<AbortController | null>(null);
  const hintIndexRef = useRef(0);

  useEffect(() => {
    setGameState(createInitialState(level));
    hintIndexRef.current = 0;
    speakText(level.narrationText, settings.narrationEnabled);
  }, [level, settings.narrationEnabled]);

  const resetLevel = useCallback(() => {
    abortRef.current?.abort();
    setGameState(createInitialState(level));
    hintIndexRef.current = 0;
  }, [level]);

  const addCommand = useCallback(
    (type: CommandType) => {
      if (gameState.status === "running") return;
      if (
        level.maxCommands &&
        gameState.program.length >= level.maxCommands
      ) {
        return;
      }

      playAddCommand(settings.soundEffectsEnabled);
      speakText(
        COMMAND_DEFINITIONS[type].narration,
        settings.narrationEnabled,
      );

      setGameState((current) => ({
        ...current,
        status: "editing",
        message: null,
        program: [...current.program, createCommand(type)],
      }));
    },
    [gameState.program.length, gameState.status, level.maxCommands, settings],
  );

  const removeCommand = useCallback(
    (id: string) => {
      if (gameState.status === "running") return;
      playRemoveCommand(settings.soundEffectsEnabled);
      setGameState((current) => ({
        ...current,
        status: "editing",
        message: null,
        program: current.program.filter((command) => command.id !== id),
      }));
    },
    [gameState.status, settings.soundEffectsEnabled],
  );

  const moveCommand = useCallback(
    (id: string, direction: "left" | "right" | "up" | "down") => {
      if (gameState.status === "running") return;

      setGameState((current) => {
        const index = current.program.findIndex((command) => command.id === id);
        if (index === -1) return current;

        const delta =
          direction === "left" || direction === "up" ? -1 : 1;
        const nextIndex = index + delta;
        if (nextIndex < 0 || nextIndex >= current.program.length) {
          return current;
        }

        const nextProgram = [...current.program];
        const [item] = nextProgram.splice(index, 1);
        nextProgram.splice(nextIndex, 0, item);

        return {
          ...current,
          status: "editing",
          message: null,
          program: nextProgram,
        };
      });
    },
    [gameState.status],
  );

  const showHint = useCallback(() => {
    const hint =
      level.hints[
        Math.min(hintIndexRef.current, level.hints.length - 1)
      ];
    hintIndexRef.current += 1;
    speakText(hint, settings.narrationEnabled);
    setGameState((current) => ({ ...current, message: hint }));
  }, [level.hints, settings.narrationEnabled]);

  const stopProgram = useCallback(() => {
    abortRef.current?.abort();
    setGameState((current) => ({
      ...createInitialState(level),
      program: current.program,
      status: "editing",
    }));
  }, [level]);

  const resumeEditing = useCallback(() => {
    setGameState((current) => ({
      ...createInitialState(level),
      program: current.program,
      status: "editing",
      message: null,
    }));
  }, [level]);

  const runProgram = useCallback(async () => {
    if (gameState.status === "running" || gameState.program.length === 0) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const initial = createInitialState(level);
    setGameState({
      ...initial,
      program: gameState.program,
      status: "running",
      message: null,
    });

    if (settings.actItOutEnabled) {
      speakText("You are the robot!", settings.narrationEnabled);
      for (const command of gameState.program) {
        speakText(
          COMMAND_DEFINITIONS[command.type].narration,
          settings.narrationEnabled,
        );
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
      speakText("Now watch Bloop run!", settings.narrationEnabled);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    let runtimeCharacter: CharacterState = { ...initial.character };
    let runtimeCollected: string[] = [];
    let runtimeDoors = { ...initial.doorStates };

    const result = await executeProgram(gameState.program, {
      level,
      character: runtimeCharacter,
      collectedItems: runtimeCollected,
      doorStates: runtimeDoors,
      signal: controller.signal,
      reducedMotion: settings.reducedMotion,
      fastAnimations: settings.fastAnimations,
      setActiveCommandIndex: (index) => {
        setGameState((current) => ({
          ...current,
          activeCommandIndex: index,
        }));
      },
      waitForAnimation: async () => {},
      onCharacterUpdate: (character) => {
        runtimeCharacter = character;
        setGameState((current) => ({ ...current, character }));
      },
      onCollectedItemsUpdate: (items) => {
        runtimeCollected = items;
        setGameState((current) => ({ ...current, collectedItems: items }));
      },
      onDoorStatesUpdate: (states) => {
        runtimeDoors = states;
        setGameState((current) => ({ ...current, doorStates: states }));
      },
      onAction: (action) => {
        setGameState((current) => ({ ...current, lastAction: action }));
        if (action === "move") playMove(settings.soundEffectsEnabled);
        if (action === "jump" || action === "sillyJump") {
          playJump(settings.soundEffectsEnabled);
        }
        if (action === "moo") playMoo(settings.soundEffectsEnabled);
      },
    });

    if (result.status === "cancelled") {
      setGameState((current) => ({
        ...createInitialState(level),
        program: current.program,
        status: "editing",
      }));
      return;
    }

    if (result.status === "blocked") {
      playRetry(settings.soundEffectsEnabled);
      speakText(result.message ?? "Try changing one step.", settings.narrationEnabled);
      setGameState((current) => ({
        ...current,
        character: result.character,
        collectedItems: result.collectedItems,
        doorStates: result.doorStates,
        activeCommandIndex: null,
        status: "retry",
        message: result.message ?? "Try changing one step.",
      }));
      return;
    }

    playSuccess(settings.soundEffectsEnabled);
    speakText(result.message ?? "You did it!", settings.narrationEnabled);
    onLevelComplete(level.id);
    setGameState((current) => ({
      ...current,
      character: result.character,
      collectedItems: result.collectedItems,
      doorStates: result.doorStates,
      activeCommandIndex: null,
      status: "success",
      message: result.message ?? "You did it!",
    }));
  }, [gameState.program, gameState.status, level, onLevelComplete, settings]);

  return {
    gameState,
    addCommand,
    removeCommand,
    moveCommand,
    runProgram,
    resetLevel,
    stopProgram,
    resumeEditing,
    showHint,
  };
}
