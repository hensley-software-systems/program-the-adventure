import type {
  CharacterState,
  ExecutionContext,
  ExecutionResult,
  LevelDefinition,
  ProgramCommand,
  SuccessCondition,
  TileType,
} from "@/types/game";
import { posKey } from "@/data/levels";
import {
  getForwardPosition,
  isInsideBoard,
  positionsEqual,
  turnLeft,
  turnRight,
} from "./movement";

function buildTileMap(level: LevelDefinition): Map<string, TileType> {
  const map = new Map<string, TileType>();
  for (const boardTile of level.tiles) {
    map.set(posKey(boardTile.position), boardTile.type);
  }
  return map;
}

function getTileAt(
  tileMap: Map<string, TileType>,
  position: { x: number; y: number },
): TileType {
  return tileMap.get(posKey(position)) ?? "empty";
}

function collectItemAt(
  position: { x: number; y: number },
  tileMap: Map<string, TileType>,
  collectedItems: string[],
): string[] {
  const tile = getTileAt(tileMap, position);
  if (tile === "cookie" || tile === "star") {
    const key = `${tile}-${posKey(position)}`;
    if (!collectedItems.includes(key)) {
      return [...collectedItems, key];
    }
  }
  return collectedItems;
}

function isAdjacent(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

export function evaluateSuccessConditions(
  level: LevelDefinition,
  character: CharacterState,
  collectedItems: string[],
  doorStates: Record<string, "open" | "closed">,
): { success: boolean; message: string } {
  for (const condition of level.successConditions) {
    if (!checkCondition(condition, character, collectedItems, doorStates)) {
      return {
        success: false,
        message: getRetryMessage(condition),
      };
    }
  }

  return {
    success: true,
    message: getSuccessMessage(level),
  };
}

function checkCondition(
  condition: SuccessCondition,
  character: CharacterState,
  collectedItems: string[],
  doorStates: Record<string, "open" | "closed">,
): boolean {
  switch (condition.type) {
    case "reachPosition":
      return positionsEqual(character.position, condition.position);
    case "collectItem": {
      const prefix = `${condition.item}-`;
      return collectedItems.some((item) => item.startsWith(prefix));
    }
    case "sayMooAtDoor":
      return doorStates[posKey(condition.doorPosition)] === "open";
  }
}

function getSuccessMessage(level: LevelDefinition): string {
  if (level.id >= 9000) {
    return "Awesome random programming! Bloop crushed it!";
  }
  if (level.id === 11) {
    return "Incredible! Bloop finished the biggest quest ever!";
  }
  if (level.id === 10) {
    return "Amazing programming! Bloop rescued the cookie!";
  }
  return "You did it! Great programming!";
}

function getRetryMessage(failedCondition: SuccessCondition): string {
  switch (failedCondition.type) {
    case "collectItem":
      return failedCondition.item === "cookie"
        ? "Almost! Bloop still needs the cookie."
        : "Almost! Bloop still needs the star.";
    case "sayMooAtDoor":
      return "The door is still closed. Try saying Moo next to it!";
    case "reachPosition":
      return "Almost! Bloop is not at the goal yet.";
    default:
      return "Try changing one step.";
  }
}

async function executeCommand(
  command: ProgramCommand,
  context: ExecutionContext,
  tileMap: Map<string, TileType>,
): Promise<ExecutionResult> {
  const { level } = context;
  let character = { ...context.character };
  let collectedItems = [...context.collectedItems];
  let doorStates = { ...context.doorStates };

  switch (command.type) {
    case "turnLeft":
      character = {
        ...character,
        direction: turnLeft(character.direction),
      };
      context.onAction("turn");
      break;

    case "turnRight":
      character = {
        ...character,
        direction: turnRight(character.direction),
      };
      context.onAction("turn");
      break;

    case "moveForward": {
      const next = getForwardPosition(character.position, character.direction);
      if (!isInsideBoard(next, level.boardSize.width, level.boardSize.height)) {
        return blockedResult(
          character,
          collectedItems,
          doorStates,
          "Bloop bumped the edge of the board! Try changing one step.",
        );
      }

      const nextTile = getTileAt(tileMap, next);
      if (nextTile === "bush") {
        return blockedResult(
          character,
          collectedItems,
          doorStates,
          "Bloop bumped into a bush! Try going around it.",
        );
      }

      if (nextTile === "puddle") {
        return blockedResult(
          character,
          collectedItems,
          doorStates,
          "Bloop splashed into the puddle! Try using Jump.",
        );
      }

      if (nextTile === "door") {
        const doorKey = posKey(next);
        if (doorStates[doorKey] !== "open") {
          return blockedResult(
            character,
            collectedItems,
            doorStates,
            "The door is closed! Try saying Moo while standing next to it.",
          );
        }
      }

      character = { ...character, position: next };
      collectedItems = collectItemAt(next, tileMap, collectedItems);
      context.onAction("move");
      break;
    }

    case "jump": {
      const next = getForwardPosition(character.position, character.direction);
      if (!isInsideBoard(next, level.boardSize.width, level.boardSize.height)) {
        return blockedResult(
          character,
          collectedItems,
          doorStates,
          "Bloop tried to jump off the board! That was silly.",
        );
      }

      const nextTile = getTileAt(tileMap, next);
      if (nextTile === "bush") {
        return blockedResult(
          character,
          collectedItems,
          doorStates,
          "Bloop jumped into a bush! Oops!",
        );
      }

      if (nextTile !== "puddle" && nextTile !== "empty" && nextTile !== "start") {
        const canLand =
          nextTile === "cookie" ||
          nextTile === "star" ||
          (nextTile === "door" && doorStates[posKey(next)] === "open");

        if (!canLand && nextTile !== "goal") {
          context.onAction("sillyJump");
        }
      }

      character = { ...character, position: next };
      collectedItems = collectItemAt(next, tileMap, collectedItems);
      context.onAction("jump");
      break;
    }

    case "sayMoo": {
      context.onAction("moo");
      const adjacentDoors = level.tiles.filter(
        (boardTile) =>
          boardTile.type === "door" &&
          isAdjacent(character.position, boardTile.position),
      );

      if (adjacentDoors.length > 0) {
        for (const door of adjacentDoors) {
          doorStates = {
            ...doorStates,
            [posKey(door.position)]: "open",
          };
        }
      }
      break;
    }
  }

  context.onCharacterUpdate(character);
  context.onCollectedItemsUpdate(collectedItems);
  context.onDoorStatesUpdate(doorStates);

  return {
    status: "complete",
    character,
    collectedItems,
    doorStates,
  };
}

function blockedResult(
  character: CharacterState,
  collectedItems: string[],
  doorStates: Record<string, "open" | "closed">,
  message: string,
): ExecutionResult {
  return {
    status: "blocked",
    message,
    character,
    collectedItems,
    doorStates,
  };
}

function getTiming(context: ExecutionContext) {
  if (context.reducedMotion) {
    return { highlight: 0, pause: 0, animation: 0 };
  }
  if (context.fastAnimations) {
    return { highlight: 80, pause: 120, animation: 250 };
  }
  return { highlight: 150, pause: 300, animation: 600 };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitWithPause(ms: number, context: ExecutionContext): Promise<void> {
  if (ms <= 0) {
    await context.waitIfPaused();
    return;
  }

  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (context.signal.aborted) {
      return;
    }

    await context.waitIfPaused();

    const remaining = end - Date.now();
    if (remaining <= 0) {
      return;
    }

    await wait(Math.min(50, remaining));
  }
}

export async function executeProgram(
  commands: ProgramCommand[],
  context: ExecutionContext,
): Promise<ExecutionResult> {
  const tileMap = buildTileMap(context.level);
  let character = { ...context.character };
  let collectedItems = [...context.collectedItems];
  let doorStates = { ...context.doorStates };
  const timing = getTiming(context);

  for (let index = 0; index < commands.length; index += 1) {
    if (context.signal.aborted) {
      return {
        status: "cancelled",
        character,
        collectedItems,
        doorStates,
      };
    }

    context.setActiveCommandIndex(index);
    await waitWithPause(timing.highlight, context);

    const result = await executeCommand(
      commands[index],
      {
        ...context,
        character,
        collectedItems,
        doorStates,
      },
      tileMap,
    );

    character = result.character;
    collectedItems = result.collectedItems;
    doorStates = result.doorStates;

    if (result.status === "blocked") {
      return result;
    }

    await waitWithPause(timing.animation, context);
    await context.waitForAnimation();
    await waitWithPause(timing.pause, context);
  }

  const evaluation = evaluateSuccessConditions(
    context.level,
    character,
    collectedItems,
    doorStates,
  );

  if (evaluation.success) {
    return {
      status: "complete",
      message: evaluation.message,
      character,
      collectedItems,
      doorStates,
    };
  }

  return {
    status: "blocked",
    message: evaluation.message,
    character,
    collectedItems,
    doorStates,
  };
}
