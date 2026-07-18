import { describe, expect, it } from "vitest";
import {
  countLevelObstacles,
  generateRandomLevel,
  getDifficultyLabel,
  getDifficultyStepRange,
  isRandomLevel,
  RANDOM_DIFFICULTIES,
} from "@/engine/generateRandomLevel";

describe("generateRandomLevel", () => {
  it.each(RANDOM_DIFFICULTIES)(
    "generates a verified %s level",
    async (difficulty) => {
      const level = await generateRandomLevel(difficulty);

      expect(isRandomLevel(level.id)).toBe(true);
      expect(level.boardSize).toEqual({ width: 5, height: 5 });
      expect(level.tiles.some((tile) => tile.type === "start")).toBe(true);
      expect(level.successConditions.length).toBeGreaterThan(0);
      expect(level.maxCommands).toBeGreaterThan(0);
      expect(level.title.length).toBeGreaterThan(0);
      expect(level.concept).toContain(getDifficultyLabel(difficulty));

      if (difficulty === "easy") {
        expect(level.availableCommands).toEqual([
          "moveForward",
          "turnLeft",
          "turnRight",
        ]);
      } else {
        expect(level.availableCommands).toContain("jump");
        expect(level.availableCommands).toContain("sayMoo");
      }

      expect(getDifficultyStepRange(difficulty)).toMatch(/\d+–\d+ steps/);
    },
    15000,
  );

  it("impossible levels include at least five obstacles", async () => {
    for (let index = 0; index < 5; index += 1) {
      const level = await generateRandomLevel("impossible");
      expect(countLevelObstacles(level.tiles)).toBeGreaterThanOrEqual(5);
      expect(level.narrationText).not.toContain("short impossible path");
    }
  }, 30000);
});
