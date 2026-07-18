"use client";

import type { CharacterState, LevelDefinition } from "@/types/game";
import { posKey } from "@/data/levels";
import { Character } from "./Character";
import { TileIcon } from "./Tile";

interface GameBoardProps {
  level: LevelDefinition;
  character: CharacterState;
  collectedItems: string[];
  doorStates: Record<string, "open" | "closed">;
  lastAction: string | null;
  celebrating?: boolean;
  reducedMotion?: boolean;
}

export function GameBoard({
  level,
  character,
  collectedItems,
  doorStates,
  lastAction,
  celebrating,
  reducedMotion,
}: GameBoardProps) {
  const cells = Array.from(
    { length: level.boardSize.height },
    (_, y) =>
      Array.from({ length: level.boardSize.width }, (_, x) => {
        const tile =
          level.tiles.find(
            (boardTile) =>
              boardTile.position.x === x && boardTile.position.y === y,
          )?.type ?? "empty";
        const key = posKey({ x, y });
        const isCollected =
          collectedItems.some((item) => item.endsWith(key)) &&
          (tile === "cookie" || tile === "star");
        const doorOpen = doorStates[key] === "open";
        const isCharacterHere =
          character.position.x === x && character.position.y === y;

        return (
          <div
            key={key}
            className={`relative aspect-square rounded-xl border-2 border-white/50 shadow-inner ${
              tile === "puddle"
                ? "bg-cyan-300/80"
                : tile === "bush"
                  ? "bg-green-700/30"
                  : "bg-[var(--sand)]/90"
            }`}
          >
            <div className="flex h-full items-center justify-center">
              <TileIcon
                type={tile}
                doorOpen={doorOpen}
                collected={isCollected}
              />
            </div>
            {isCharacterHere && (
              <Character
                character={character}
                lastAction={lastAction}
                celebrating={celebrating}
                reducedMotion={reducedMotion}
              />
            )}
          </div>
        );
      }),
  );

  return (
    <div
      className="grid w-full max-w-xl gap-2 rounded-3xl bg-white/40 p-3 shadow-lg backdrop-blur lg:max-w-none"
      style={{
        gridTemplateColumns: `repeat(${level.boardSize.width}, minmax(3.25rem, 1fr))`,
      }}
      aria-label={`Game board level ${level.id}`}
    >
      {cells.flat()}
    </div>
  );
}
