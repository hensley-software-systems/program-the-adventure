"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  generateRandomLevel,
  getDifficultyLabel,
} from "@/engine/generateRandomLevel";
import type { RandomDifficulty } from "@/data/randomDifficulty";
import type { LevelDefinition } from "@/types/game";
import { GameScreen } from "@/components/GameScreen";

export function RandomLevelScreen({
  difficulty,
}: {
  difficulty: RandomDifficulty;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refreshKey = searchParams.get("t") ?? "0";
  const [level, setLevel] = useState<LevelDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLevel = useCallback(async () => {
    setLoading(true);
    const generated = await generateRandomLevel(difficulty);
    setLevel(generated);
    setLoading(false);
  }, [difficulty]);

  useEffect(() => {
    void loadLevel();
  }, [loadLevel, refreshKey]);

  if (loading || !level) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">🎲</div>
        <p className="text-xl font-bold">
          Creating a {getDifficultyLabel(difficulty).toLowerCase()} level for
          Bloop...
        </p>
      </div>
    );
  }

  return (
    <GameScreen
      level={level}
      isRandom
      randomDifficulty={difficulty}
      onNewRandom={() => router.push(`/random/${difficulty}?t=${Date.now()}`)}
    />
  );
}
