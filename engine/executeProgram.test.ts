import { describe, expect, it } from "vitest";
import { getLevelById } from "@/data/levels";
import { executeProgram, evaluateSuccessConditions } from "@/engine/executeProgram";
import { generateJavaScript } from "@/engine/codeGenerator";
import {
  getForwardPosition,
  isInsideBoard,
  turnLeft,
  turnRight,
} from "@/engine/movement";
import { createCommand, getInitialDoorStates } from "@/data/levels";
import type { ExecutionContext } from "@/types/game";

function createContext(
  levelId: number,
  programLength: number,
): {
  context: ExecutionContext;
  updates: {
    character: ExecutionContext["character"];
    collected: string[];
    doors: Record<string, "open" | "closed">;
    activeIndex: number | null;
  };
} {
  const level = getLevelById(levelId)!;
  const updates = {
    character: { ...level.characterStart },
    collected: [] as string[],
    doors: getInitialDoorStates(level),
    activeIndex: null as number | null,
  };

  const context: ExecutionContext = {
    level,
    character: { ...level.characterStart },
    collectedItems: [],
    doorStates: getInitialDoorStates(level),
    signal: new AbortController().signal,
    reducedMotion: true,
    fastAnimations: true,
    setActiveCommandIndex: (index) => {
      updates.activeIndex = index;
    },
    waitForAnimation: async () => {},
    onCharacterUpdate: (character) => {
      updates.character = character;
      context.character = character;
    },
    onCollectedItemsUpdate: (items) => {
      updates.collected = items;
      context.collectedItems = items;
    },
    onDoorStatesUpdate: (states) => {
      updates.doors = states;
      context.doorStates = states;
    },
    onAction: () => {},
    waitIfPaused: async () => {},
  };

  void programLength;
  return { context, updates };
}

describe("movement", () => {
  it("turns left and right correctly", () => {
    expect(turnLeft("north")).toBe("west");
    expect(turnRight("north")).toBe("east");
  });

  it("moves forward in the current direction", () => {
    expect(getForwardPosition({ x: 1, y: 2 }, "east")).toEqual({ x: 2, y: 2 });
    expect(getForwardPosition({ x: 1, y: 2 }, "north")).toEqual({ x: 1, y: 1 });
  });

  it("detects board boundaries", () => {
    expect(isInsideBoard({ x: 0, y: 0 }, 5, 5)).toBe(true);
    expect(isInsideBoard({ x: -1, y: 0 }, 5, 5)).toBe(false);
    expect(isInsideBoard({ x: 5, y: 0 }, 5, 5)).toBe(false);
  });
});

describe("executeProgram", () => {
  it("completes level 1 with one move forward", async () => {
    const { context } = createContext(1, 1);
    const result = await executeProgram([createCommand("moveForward")], context);
    expect(result.status).toBe("complete");
    expect(result.collectedItems.some((item) => item.startsWith("cookie"))).toBe(
      true,
    );
  });

  it("completes level 2 with two move forward commands", async () => {
    const { context } = createContext(2, 2);
    const result = await executeProgram(
      [createCommand("moveForward"), createCommand("moveForward")],
      context,
    );
    expect(result.status).toBe("complete");
  });

  it("blocks when walking into a puddle", async () => {
    const { context } = createContext(5, 1);
    const result = await executeProgram([createCommand("moveForward")], context);
    expect(result.status).toBe("blocked");
    expect(result.message).toContain("puddle");
  });

  it("allows jumping over a puddle", async () => {
    const { context } = createContext(5, 2);
    const result = await executeProgram(
      [createCommand("jump"), createCommand("moveForward")],
      context,
    );
    expect(result.status).toBe("complete");
  });

  it("opens the door when saying moo adjacent to it", async () => {
    const { context, updates } = createContext(6, 4);
    const result = await executeProgram(
      [
        createCommand("moveForward"),
        createCommand("sayMoo"),
        createCommand("moveForward"),
        createCommand("moveForward"),
      ],
      context,
    );
    expect(result.status).toBe("complete");
    expect(Object.values(updates.doors)).toContain("open");
  });

  it("blocks when hitting a bush", async () => {
    const level = getLevelById(4)!;
    const context = createContext(4, 1).context;
    const result = await executeProgram([createCommand("moveForward")], context);
    expect(result.status).toBe("blocked");
    expect(result.message).toContain("bush");
    expect(level.title).toBe("Around the Bush");
  });

  it("supports cancellation", async () => {
    const controller = new AbortController();
    const { context } = createContext(2, 2);
    context.signal = controller.signal;
    controller.abort();
    const result = await executeProgram([createCommand("moveForward")], context);
    expect(result.status).toBe("cancelled");
  });

  it("completes level 11 master quest", async () => {
    const { context } = createContext(11, 13);
    const result = await executeProgram(
      [
        createCommand("turnLeft"),
        createCommand("moveForward"),
        createCommand("turnRight"),
        createCommand("moveForward"),
        createCommand("jump"),
        createCommand("sayMoo"),
        createCommand("moveForward"),
        createCommand("moveForward"),
        createCommand("turnRight"),
        createCommand("moveForward"),
        createCommand("moveForward"),
        createCommand("turnRight"),
        createCommand("moveForward"),
      ],
      context,
    );
    expect(result.status).toBe("complete");
  });
});

describe("evaluateSuccessConditions", () => {
  it("checks collect item success", () => {
    const level = getLevelById(1)!;
    const evaluation = evaluateSuccessConditions(
      level,
      level.characterStart,
      ["cookie-2,2"],
      {},
    );
    expect(evaluation.success).toBe(true);
  });
});

describe("codeGenerator", () => {
  it("generates javascript from commands", () => {
    const code = generateJavaScript([
      createCommand("moveForward"),
      createCommand("jump"),
      createCommand("sayMoo"),
    ]);
    expect(code).toContain("moveForward();");
    expect(code).toContain("jump();");
    expect(code).toContain('say("Moo!");');
  });
});

describe("local progress defaults", () => {
  it("starts with level 1 unlocked", async () => {
    const { DEFAULT_PROGRESS } = await import("@/hooks/useProgress");
    expect(DEFAULT_PROGRESS.highestUnlockedLevel).toBe(1);
  });
});
