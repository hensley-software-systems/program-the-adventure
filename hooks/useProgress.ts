"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedProgress } from "@/types/game";

const STORAGE_KEY = "program-the-adventure-progress";

export const DEFAULT_PROGRESS: SavedProgress = {
  highestUnlockedLevel: 1,
  completedLevelIds: [],
  settings: {
    narrationEnabled: true,
    soundEffectsEnabled: true,
    musicEnabled: false,
    actItOutEnabled: false,
    reducedMotion: false,
    fastAnimations: false,
  },
};

function readProgress(): SavedProgress {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROGRESS;
    }
    const parsed = JSON.parse(raw) as SavedProgress;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...parsed.settings,
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function writeProgress(progress: SavedProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Remain functional without storage.
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<SavedProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = readProgress();
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setProgress({
      ...saved,
      settings: {
        ...saved.settings,
        reducedMotion: saved.settings.reducedMotion || prefersReducedMotion,
      },
    });
    setLoaded(true);
  }, []);

  const persist = useCallback((next: SavedProgress) => {
    setProgress(next);
    writeProgress(next);
  }, []);

  const completeLevel = useCallback(
    (levelId: number) => {
      setProgress((current) => {
        const completedLevelIds = current.completedLevelIds.includes(levelId)
          ? current.completedLevelIds
          : [...current.completedLevelIds, levelId];
        const next: SavedProgress = {
          ...current,
          completedLevelIds,
          highestUnlockedLevel: Math.max(
            current.highestUnlockedLevel,
            levelId + 1,
          ),
        };
        writeProgress(next);
        return next;
      });
    },
    [],
  );

  const updateSettings = useCallback(
    (settings: Partial<SavedProgress["settings"]>) => {
      setProgress((current) => {
        const next = {
          ...current,
          settings: { ...current.settings, ...settings },
        };
        writeProgress(next);
        return next;
      });
    },
    [],
  );

  const resetProgress = useCallback(() => {
    persist(DEFAULT_PROGRESS);
  }, [persist]);

  const isLevelUnlocked = useCallback(
    (levelId: number) => levelId <= progress.highestUnlockedLevel,
    [progress.highestUnlockedLevel],
  );

  return {
    progress,
    loaded,
    completeLevel,
    updateSettings,
    resetProgress,
    isLevelUnlocked,
  };
}
