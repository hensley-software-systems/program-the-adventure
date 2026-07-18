import type {
  BoardTile,
  CharacterState,
  CommandType,
  Direction,
  LevelDefinition,
  Position,
  SuccessCondition,
} from "@/types/game";
import { createCommand, posKey } from "@/data/levels";
import {
  getForwardPosition,
  isInsideBoard,
  turnLeft,
  turnRight,
} from "./movement";
import { executeProgram } from "./executeProgram";

import type { RandomDifficulty } from "@/data/randomDifficulty";

export const RANDOM_LEVEL_ID_BASE = 9000;

interface DifficultyConfig {
  label: string;
  minSteps: number;
  maxSteps: number;
  commands: CommandType[];
  minObstacles: number;
  addPuddle: boolean;
  addDoor: boolean;
  addStar: boolean;
  addBush: boolean;
}

const DIFFICULTY_CONFIG: Record<RandomDifficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    minSteps: 1,
    maxSteps: 5,
    commands: ["moveForward", "turnLeft", "turnRight"],
    minObstacles: 0,
    addPuddle: false,
    addDoor: false,
    addStar: false,
    addBush: false,
  },
  medium: {
    label: "Medium",
    minSteps: 5,
    maxSteps: 10,
    commands: ["moveForward", "turnLeft", "turnRight", "jump", "sayMoo"],
    minObstacles: 1,
    addPuddle: true,
    addDoor: false,
    addStar: false,
    addBush: false,
  },
  hard: {
    label: "Hard",
    minSteps: 10,
    maxSteps: 15,
    commands: ["moveForward", "turnLeft", "turnRight", "jump", "sayMoo"],
    minObstacles: 3,
    addPuddle: true,
    addDoor: true,
    addStar: false,
    addBush: true,
  },
  impossible: {
    label: "Impossible",
    minSteps: 15,
    maxSteps: 20,
    commands: ["moveForward", "turnLeft", "turnRight", "jump", "sayMoo"],
    minObstacles: 5,
    addPuddle: true,
    addDoor: true,
    addStar: true,
    addBush: true,
  },
};

const RANDOM_TITLES = [
  "Bloop's Lucky Path",
  "Mystery Meadow",
  "Surprise Safari",
  "Twisty Turnabout",
  "Cookie Quest",
  "Star Shuffle",
  "Puddle Puzzle",
  "Door Doodle",
  "Robot Romp",
  "Endless Adventure",
];

interface ImpossibleTemplate {
  title: string;
  start: CharacterState;
  solution: CommandType[];
  tiles: BoardTile[];
  successConditions: SuccessCondition[];
}

const IMPOSSIBLE_TEMPLATES: ImpossibleTemplate[] = [
  {
    title: "Bloop's Biggest Quest",
    start: { position: { x: 0, y: 2 }, direction: "east" },
    solution: [
      "turnLeft",
      "moveForward",
      "turnRight",
      "moveForward",
      "jump",
      "sayMoo",
      "moveForward",
      "moveForward",
      "turnRight",
      "moveForward",
      "moveForward",
      "turnRight",
      "moveForward",
    ],
    tiles: [
      tile(0, 2, "start"),
      tile(1, 2, "bush"),
      tile(2, 2, "bush"),
      tile(1, 1, "empty"),
      tile(2, 1, "puddle"),
      tile(3, 1, "door"),
      tile(4, 1, "star"),
      tile(3, 3, "cookie"),
      tile(0, 3, "bush"),
      tile(4, 3, "bush"),
    ],
    successConditions: [
      { type: "sayMooAtDoor", doorPosition: { x: 3, y: 1 } },
      { type: "collectItem", item: "star" },
      { type: "collectItem", item: "cookie" },
    ],
  },
  {
    title: "Fortress of Bushes",
    start: { position: { x: 0, y: 4 }, direction: "east" },
    solution: [
      "moveForward",
      "turnRight",
      "moveForward",
      "moveForward",
      "turnLeft",
      "moveForward",
      "jump",
      "turnRight",
      "moveForward",
      "sayMoo",
      "moveForward",
      "turnLeft",
      "moveForward",
      "moveForward",
      "turnRight",
      "moveForward",
    ],
    tiles: [
      tile(0, 4, "start"),
      tile(1, 4, "bush"),
      tile(2, 4, "empty"),
      tile(2, 3, "puddle"),
      tile(3, 3, "door"),
      tile(4, 3, "star"),
      tile(1, 2, "bush"),
      tile(2, 2, "bush"),
      tile(4, 2, "bush"),
      tile(4, 1, "cookie"),
    ],
    successConditions: [
      { type: "collectItem", item: "star" },
      { type: "sayMooAtDoor", doorPosition: { x: 3, y: 3 } },
      { type: "collectItem", item: "cookie" },
    ],
  },
  {
    title: "Star Maze Mayhem",
    start: { position: { x: 0, y: 0 }, direction: "south" },
    solution: [
      "moveForward",
      "moveForward",
      "turnLeft",
      "moveForward",
      "turnLeft",
      "moveForward",
      "jump",
      "moveForward",
      "turnRight",
      "sayMoo",
      "moveForward",
      "turnLeft",
      "moveForward",
      "moveForward",
      "moveForward",
    ],
    tiles: [
      tile(0, 0, "start"),
      tile(0, 2, "star"),
      tile(1, 2, "bush"),
      tile(2, 2, "puddle"),
      tile(3, 2, "door"),
      tile(4, 2, "bush"),
      tile(4, 3, "empty"),
      tile(4, 4, "cookie"),
      tile(2, 0, "bush"),
      tile(3, 0, "bush"),
    ],
    successConditions: [
      { type: "collectItem", item: "star" },
      { type: "sayMooAtDoor", doorPosition: { x: 3, y: 2 } },
      { type: "collectItem", item: "cookie" },
    ],
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function randomDirection(): Direction {
  return shuffle<Direction>(["north", "east", "south", "west"])[0];
}

function randomStart(boardWidth: number, boardHeight: number): CharacterState {
  return {
    position: {
      x: randomInt(0, boardWidth - 1),
      y: randomInt(0, boardHeight - 1),
    },
    direction: randomDirection(),
  };
}

function tile(x: number, y: number, type: BoardTile["type"]): BoardTile {
  return { position: { x, y }, type };
}

function countObstacles(tiles: BoardTile[]): number {
  return tiles.filter((boardTile) =>
    ["bush", "puddle", "door", "star"].includes(boardTile.type),
  ).length;
}

function applyBasicCommand(
  state: CharacterState,
  command: CommandType,
  boardWidth: number,
  boardHeight: number,
  blockedCells: Set<string>,
): CharacterState | null {
  switch (command) {
    case "turnLeft":
      return { ...state, direction: turnLeft(state.direction) };
    case "turnRight":
      return { ...state, direction: turnRight(state.direction) };
    case "moveForward":
    case "jump":
    case "sayMoo": {
      if (command === "sayMoo") {
        return { ...state };
      }
      const next = getForwardPosition(state.position, state.direction);
      if (!isInsideBoard(next, boardWidth, boardHeight)) {
        return null;
      }
      if (blockedCells.has(posKey(next))) {
        return null;
      }
      return { ...state, position: next };
    }
  }
}

function simulatePath(
  start: CharacterState,
  commands: CommandType[],
  boardWidth: number,
  boardHeight: number,
): { final: CharacterState; visited: Position[] } | null {
  let state = { ...start };
  const visited: Position[] = [{ ...start.position }];

  for (const command of commands) {
    const next = applyBasicCommand(
      state,
      command,
      boardWidth,
      boardHeight,
      new Set(),
    );
    if (!next) {
      return null;
    }
    state = next;
    if (command === "moveForward" || command === "jump") {
      visited.push({ ...state.position });
    }
  }

  return { final: state, visited };
}

function simulateToIndex(
  start: CharacterState,
  commands: CommandType[],
  endIndex: number,
  boardWidth: number,
  boardHeight: number,
): CharacterState | null {
  let state = { ...start };
  for (let index = 0; index < endIndex; index += 1) {
    const next = applyBasicCommand(
      state,
      commands[index],
      boardWidth,
      boardHeight,
      new Set(),
    );
    if (!next) {
      return null;
    }
    state = next;
  }
  return state;
}

function buildPath(
  config: DifficultyConfig,
  boardWidth: number,
  boardHeight: number,
  targetSteps: number,
): { start: CharacterState; commands: CommandType[] } | null {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const start = randomStart(boardWidth, boardHeight);
    let state = { ...start };
    const commands: CommandType[] = [];
    const visited = new Set<string>([posKey(start.position)]);

    for (let step = 0; step < targetSteps; step += 1) {
      const weighted = shuffle([
        ...config.commands,
        ...config.commands.filter((command) => command === "moveForward"),
        ...config.commands.filter((command) => command === "turnLeft"),
        ...config.commands.filter((command) => command === "turnRight"),
      ]);
      let placed = false;

      for (const command of weighted) {
        const nextState = applyBasicCommand(
          state,
          command,
          boardWidth,
          boardHeight,
          new Set(),
        );
        if (!nextState) {
          continue;
        }

        const nextKey = posKey(nextState.position);
        const prefersNewCell =
          command === "moveForward" || command === "jump"
            ? !visited.has(nextKey)
            : true;

        if (prefersNewCell || step > targetSteps - 4) {
          commands.push(command);
          state = nextState;
          visited.add(nextKey);
          placed = true;
          break;
        }
      }

      if (!placed) {
        for (const command of weighted) {
          const nextState = applyBasicCommand(
            state,
            command,
            boardWidth,
            boardHeight,
            new Set(),
          );
          if (nextState) {
            commands.push(command);
            state = nextState;
            visited.add(posKey(nextState.position));
            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        break;
      }
    }

    if (commands.length === targetSteps) {
      const moveCount = commands.filter(
        (command) => command === "moveForward" || command === "jump",
      ).length;
      if (moveCount >= Math.min(3, Math.floor(targetSteps / 4))) {
        return { start, commands };
      }
    }
  }

  return null;
}

function addBushesOffPath(
  tiles: BoardTile[],
  pathCells: Set<string>,
  start: CharacterState,
  minTotalObstacles: number,
  boardWidth: number,
  boardHeight: number,
): void {
  let attempts = 0;
  while (countObstacles(tiles) < minTotalObstacles && attempts < 80) {
    attempts += 1;
    const bushPosition = {
      x: randomInt(0, boardWidth - 1),
      y: randomInt(0, boardHeight - 1),
    };
    const key = posKey(bushPosition);
    const occupied = tiles.some(
      (boardTile) =>
        boardTile.position.x === bushPosition.x &&
        boardTile.position.y === bushPosition.y,
    );
    const onPath = pathCells.has(key);
    const onStart =
      bushPosition.x === start.position.x &&
      bushPosition.y === start.position.y;

    if (!occupied && !onPath && !onStart) {
      tiles.push(tile(bushPosition.x, bushPosition.y, "bush"));
    }
  }
}

function buildLevelFromPath(
  config: DifficultyConfig,
  start: CharacterState,
  commands: CommandType[],
  seed: number,
): { level: LevelDefinition; solution: CommandType[] } | null {
  const boardWidth = 5;
  const boardHeight = 5;
  const solution = [...commands];
  const pathResult = simulatePath(start, solution, boardWidth, boardHeight);
  if (!pathResult) {
    return null;
  }

  const pathCells = new Set(pathResult.visited.map((position) => posKey(position)));
  const tiles: BoardTile[] = [tile(start.position.x, start.position.y, "start")];
  const successConditions: SuccessCondition[] = [];
  const goalPosition = { ...pathResult.final.position };

  tiles.push(tile(goalPosition.x, goalPosition.y, "cookie"));
  successConditions.push({ type: "collectItem", item: "cookie" });

  if (config.addStar && pathResult.visited.length > 2) {
    const starPosition = pathResult.visited[randomInt(1, pathResult.visited.length - 2)];
    if (
      (starPosition.x !== start.position.x ||
        starPosition.y !== start.position.y) &&
      (starPosition.x !== goalPosition.x || starPosition.y !== goalPosition.y)
    ) {
      tiles.push(tile(starPosition.x, starPosition.y, "star"));
      successConditions.unshift({ type: "collectItem", item: "star" });
    }
  }

  if (config.addPuddle) {
    const puddleCount = config.minObstacles >= 5 ? 2 : 1;
    const forwardIndexes = solution
      .map((command, index) => ({ command, index }))
      .filter(({ command }) => command === "moveForward");

    const picks = shuffle(forwardIndexes).slice(0, puddleCount);
    for (const pick of picks) {
      const beforeMove = simulateToIndex(
        start,
        solution,
        pick.index,
        boardWidth,
        boardHeight,
      );
      if (!beforeMove) {
        continue;
      }
      const puddlePosition = getForwardPosition(
        beforeMove.position,
        beforeMove.direction,
      );
      const alreadyPuddle = tiles.some(
        (boardTile) =>
          boardTile.type === "puddle" &&
          boardTile.position.x === puddlePosition.x &&
          boardTile.position.y === puddlePosition.y,
      );
      if (
        !alreadyPuddle &&
        isInsideBoard(puddlePosition, boardWidth, boardHeight) &&
        (puddlePosition.x !== goalPosition.x ||
          puddlePosition.y !== goalPosition.y)
      ) {
        tiles.push(tile(puddlePosition.x, puddlePosition.y, "puddle"));
        solution[pick.index] = "jump";
      }
    }
  }

  if (config.addDoor) {
    let sim = { ...start };
    let doorIndex = -1;
    let doorPosition: Position | null = null;

    for (let index = 0; index < solution.length; index += 1) {
      const command = solution[index];
      if (command === "moveForward" || command === "jump") {
        const landing = getForwardPosition(sim.position, sim.direction);
        if (
          landing.x === goalPosition.x &&
          landing.y === goalPosition.y &&
          isInsideBoard(landing, boardWidth, boardHeight)
        ) {
          doorIndex = index;
          doorPosition = { ...landing };
          break;
        }
      }
      const next = applyBasicCommand(
        sim,
        command,
        boardWidth,
        boardHeight,
        new Set(),
      );
      if (!next) {
        return null;
      }
      sim = next;
    }

    if (doorPosition && doorIndex >= 0) {
      tiles.push(tile(doorPosition.x, doorPosition.y, "door"));
      successConditions.unshift({
        type: "sayMooAtDoor",
        doorPosition,
      });

      if (!solution.includes("sayMoo")) {
        solution.splice(doorIndex, 0, "sayMoo");
      } else {
        const sayIndex = solution.indexOf("sayMoo");
        if (sayIndex !== doorIndex - 1 && sayIndex >= 0) {
          solution.splice(sayIndex, 1);
          const insertAt = sayIndex < doorIndex ? doorIndex - 1 : doorIndex;
          solution.splice(insertAt, 0, "sayMoo");
        }
      }
    }
  }

  if (config.addBush || config.minObstacles > countObstacles(tiles)) {
    addBushesOffPath(
      tiles,
      pathCells,
      start,
      config.minObstacles,
      boardWidth,
      boardHeight,
    );
  }

  if (countObstacles(tiles) < config.minObstacles) {
    return null;
  }

  const level: LevelDefinition = {
    id: RANDOM_LEVEL_ID_BASE + (seed % 1000),
    title: RANDOM_TITLES[seed % RANDOM_TITLES.length],
    concept: `${config.label} random level`,
    missionText: `Complete Bloop's random ${config.label.toLowerCase()} quest!`,
    narrationText: `Help Bloop finish a surprise ${config.label.toLowerCase()} adventure.`,
    boardSize: { width: boardWidth, height: boardHeight },
    characterStart: start,
    tiles,
    availableCommands: [...config.commands],
    maxCommands: solution.length + 6,
    successConditions,
    hints: [
      "Try one step at a time.",
      "Watch which way Bloop is facing.",
      "Use the commands that match the path.",
    ],
  };

  return { level, solution };
}

function templateToLevel(
  template: ImpossibleTemplate,
  config: DifficultyConfig,
  seed: number,
): LevelDefinition {
  return {
    id: RANDOM_LEVEL_ID_BASE + (seed % 1000),
    title: template.title,
    concept: `${config.label} random level`,
    missionText: `Conquer ${template.title}!`,
    narrationText:
      "Jump puddles, moo at doors, dodge bushes, and grab the star and cookie!",
    boardSize: { width: 5, height: 5 },
    characterStart: template.start,
    tiles: template.tiles,
    availableCommands: [...config.commands],
    maxCommands: template.solution.length + 6,
    successConditions: template.successConditions,
    hints: [
      "There are lots of obstacles on this board!",
      "Use Jump for puddles and Say Moo at the door.",
      "Collect the star before the cookie.",
    ],
  };
}

async function verifySolution(
  level: LevelDefinition,
  solution: CommandType[],
): Promise<boolean> {
  const doorStates: Record<string, "open" | "closed"> = {};
  for (const boardTile of level.tiles) {
    if (boardTile.type === "door") {
      doorStates[posKey(boardTile.position)] = "closed";
    }
  }

  const result = await executeProgram(
    solution.map((type) => createCommand(type)),
    {
      level,
      character: { ...level.characterStart },
      collectedItems: [],
      doorStates,
      signal: new AbortController().signal,
      reducedMotion: true,
      fastAnimations: true,
      setActiveCommandIndex: () => {},
      waitForAnimation: async () => {},
      onCharacterUpdate: () => {},
      onCollectedItemsUpdate: () => {},
      onDoorStatesUpdate: () => {},
      onAction: () => {},
      waitIfPaused: async () => {},
    },
  );

  return result.status === "complete";
}

async function generateFromTemplate(
  difficulty: RandomDifficulty,
  config: DifficultyConfig,
  seed: number,
): Promise<LevelDefinition | null> {
  const templates =
    difficulty === "impossible"
      ? IMPOSSIBLE_TEMPLATES
      : IMPOSSIBLE_TEMPLATES.slice(0, 2);

  for (const template of shuffle(templates)) {
    const level = templateToLevel(template, config, seed);
    if (countObstacles(level.tiles) < config.minObstacles) {
      continue;
    }
    if (await verifySolution(level, template.solution)) {
      return level;
    }
  }

  return null;
}

function createFallbackLevel(
  difficulty: RandomDifficulty,
  config: DifficultyConfig,
  seed: number,
): LevelDefinition {
  if (difficulty === "impossible" || difficulty === "hard") {
    const template = IMPOSSIBLE_TEMPLATES[seed % IMPOSSIBLE_TEMPLATES.length];
    return templateToLevel(template, config, seed);
  }

  const stepCount = Math.min(config.maxSteps, config.minSteps + 2);

  return {
    id: RANDOM_LEVEL_ID_BASE + (seed % 1000),
    title: RANDOM_TITLES[seed % RANDOM_TITLES.length],
    concept: `${config.label} random level`,
    missionText: "Move Bloop to the cookie!",
    narrationText: `Help Bloop on a short ${config.label.toLowerCase()} path.`,
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(Math.min(stepCount, 4), 2, "cookie"),
    ],
    availableCommands: [...config.commands],
    maxCommands: stepCount + 4,
    successConditions: [{ type: "collectItem", item: "cookie" }],
    hints: ["Try Move Forward.", "Keep going forward.", "You can do it!"],
  };
}

export async function generateRandomLevel(
  difficulty: RandomDifficulty,
): Promise<LevelDefinition> {
  const config = DIFFICULTY_CONFIG[difficulty];
  const seed = Date.now() + randomInt(0, 99999);
  const maxAttempts = difficulty === "impossible" ? 200 : 120;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const targetSteps = randomInt(config.minSteps, config.maxSteps);
    const path = buildPath(config, 5, 5, targetSteps);
    if (!path) {
      continue;
    }

    const built = buildLevelFromPath(
      config,
      path.start,
      path.commands,
      seed + attempt,
    );
    if (!built) {
      continue;
    }

    if (await verifySolution(built.level, built.solution)) {
      return built.level;
    }
  }

  const templateLevel = await generateFromTemplate(difficulty, config, seed);
  if (templateLevel) {
    return templateLevel;
  }

  return createFallbackLevel(difficulty, config, seed);
}

export function isRandomLevel(levelId: number): boolean {
  return levelId >= RANDOM_LEVEL_ID_BASE;
}

export function getDifficultyLabel(difficulty: RandomDifficulty): string {
  return DIFFICULTY_CONFIG[difficulty].label;
}

export function getDifficultyStepRange(difficulty: RandomDifficulty): string {
  const config = DIFFICULTY_CONFIG[difficulty];
  return `${config.minSteps}–${config.maxSteps} steps`;
}

export function countLevelObstacles(tiles: BoardTile[]): number {
  return countObstacles(tiles);
}

export const RANDOM_DIFFICULTIES: RandomDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "impossible",
];
