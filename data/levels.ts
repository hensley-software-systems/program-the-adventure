import type { CommandType, LevelDefinition, ProgramCommand } from "@/types/game";

export function posKey(position: { x: number; y: number }): string {
  return `${position.x},${position.y}`;
}

export function createCommand(type: CommandType, id?: string): ProgramCommand {
  return {
    id: id ?? `${type}-${crypto.randomUUID()}`,
    type,
  };
}

function tile(
  x: number,
  y: number,
  type: LevelDefinition["tiles"][number]["type"],
) {
  return { position: { x, y }, type };
}

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    title: "One Big Step",
    concept: "Single instruction",
    missionText: "Help Bloop reach the cookie!",
    narrationText: "Help Bloop reach the cookie.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 1, y: 2 }, direction: "east" },
    tiles: [
      tile(1, 2, "start"),
      tile(2, 2, "cookie"),
    ],
    availableCommands: ["moveForward"],
    maxCommands: 3,
    successConditions: [{ type: "collectItem", item: "cookie" }],
    hints: [
      "Bloop wants the cookie right in front!",
      "Tap Move Forward once.",
      "Try Move Forward.",
    ],
  },
  {
    id: 2,
    title: "Two Steps to the Cookie",
    concept: "Sequence",
    missionText: "Move twice to get the cookie!",
    narrationText: "Move forward two times to reach the cookie.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(2, 2, "cookie"),
    ],
    availableCommands: ["moveForward"],
    maxCommands: 5,
    successConditions: [{ type: "collectItem", item: "cookie" }],
    hints: [
      "How many steps to the cookie?",
      "You need two Move Forward steps.",
      "Try Move Forward, then Move Forward again.",
    ],
  },
  {
    id: 3,
    title: "Turn Toward the Star",
    concept: "Orientation and sequence",
    missionText: "Turn and grab the star!",
    narrationText: "Turn right, then move forward to collect the star.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "north" },
    tiles: [
      tile(0, 2, "start"),
      tile(1, 2, "star"),
    ],
    availableCommands: ["moveForward", "turnRight"],
    maxCommands: 6,
    successConditions: [{ type: "collectItem", item: "star" }],
    hints: [
      "Which way is Bloop facing?",
      "Bloop needs to turn before moving.",
      "Try Turn Right, then Move Forward twice.",
    ],
  },
  {
    id: 4,
    title: "Around the Bush",
    concept: "Multi-step sequence",
    missionText: "Go around the bush to the star!",
    narrationText: "Navigate around the bush to reach the star.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(1, 2, "bush"),
      tile(2, 2, "bush"),
      tile(2, 1, "star"),
    ],
    availableCommands: ["moveForward", "turnLeft", "turnRight"],
    maxCommands: 10,
    successConditions: [{ type: "collectItem", item: "star" }],
    hints: [
      "The bush blocks the straight path.",
      "Try going up or down around the bush.",
      "Turn, move, turn, move — find a path around!",
    ],
  },
  {
    id: 5,
    title: "Jump the Puddle",
    concept: "Choosing the correct primitive",
    missionText: "Jump over the puddle to the cookie!",
    narrationText: "Cross the puddle and reach the cookie.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(1, 2, "puddle"),
      tile(2, 2, "cookie"),
    ],
    availableCommands: ["moveForward", "jump"],
    maxCommands: 5,
    successConditions: [{ type: "collectItem", item: "cookie" }],
    hints: [
      "Something wet is in the way!",
      "Walking into the puddle gets Bloop splashy.",
      "Try Jump, then Move Forward.",
    ],
  },
  {
    id: 6,
    title: "Moo at the Door",
    concept: "Non-movement commands",
    missionText: "Reach the door and say Moo!",
    narrationText: "Reach the door and say Moo to open it.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(2, 2, "door"),
      tile(3, 2, "star"),
    ],
    availableCommands: ["moveForward", "turnLeft", "turnRight", "sayMoo"],
    maxCommands: 8,
    successConditions: [
      { type: "sayMooAtDoor", doorPosition: { x: 2, y: 2 } },
      { type: "collectItem", item: "star" },
    ],
    hints: [
      "The door needs a special knock!",
      "Stand next to the door and try Say Moo.",
      "Move Forward, Say Moo, Move Forward, Move Forward.",
    ],
  },
  {
    id: 7,
    title: "Fix the Silly Program",
    concept: "Debugging",
    missionText: "Fix Bloop's silly steps!",
    narrationText: "Something is wrong in the program. Change one step and try again.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(2, 2, "cookie"),
    ],
    availableCommands: ["moveForward", "turnLeft", "turnRight", "jump"],
    starterProgram: [
      createCommand("moveForward", "starter-1"),
      createCommand("turnRight", "starter-2"),
      createCommand("moveForward", "starter-3"),
    ],
    maxCommands: 6,
    successConditions: [{ type: "collectItem", item: "cookie" }],
    hints: [
      "Press Play and watch what goes wrong.",
      "One step makes Bloop turn the wrong way.",
      "Replace Turn Right with Move Forward.",
    ],
  },
  {
    id: 8,
    title: "Longer Path",
    concept: "Planning",
    missionText: "Follow the twisty path to the star!",
    narrationText: "Navigate the twisty path to collect the star.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 4 }, direction: "east" },
    tiles: [
      tile(0, 4, "start"),
      tile(1, 4, "empty"),
      tile(2, 4, "empty"),
      tile(2, 3, "empty"),
      tile(2, 2, "empty"),
      tile(3, 2, "empty"),
      tile(4, 2, "star"),
    ],
    availableCommands: ["moveForward", "turnLeft", "turnRight"],
    maxCommands: 12,
    successConditions: [{ type: "collectItem", item: "star" }],
    hints: [
      "Plan your turns before you move.",
      "Go right, then turn and go down.",
      "Move, turn right, move, turn right, move, move, move.",
    ],
  },
  {
    id: 9,
    title: "Jump and Moo",
    concept: "Combining primitives",
    missionText: "Jump, reach the door, and say Moo!",
    narrationText: "Jump over the puddle, reach the door, and say Moo.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(1, 2, "puddle"),
      tile(2, 2, "door"),
      tile(3, 2, "star"),
    ],
    availableCommands: ["moveForward", "turnLeft", "turnRight", "jump", "sayMoo"],
    maxCommands: 10,
    successConditions: [
      { type: "sayMooAtDoor", doorPosition: { x: 2, y: 2 } },
      { type: "collectItem", item: "star" },
    ],
    hints: [
      "First cross the puddle safely.",
      "Jump, then move to the door.",
      "Jump, Move Forward, Say Moo, Move Forward.",
    ],
  },
  {
    id: 10,
    title: "Cookie Rescue",
    concept: "Capstone sequence",
    missionText: "Rescue the cookie! Go around, jump, and grab the star!",
    narrationText:
      "Navigate around the bush, jump the puddle, collect the star, and reach the cookie.",
    boardSize: { width: 5, height: 5 },
    characterStart: { position: { x: 0, y: 2 }, direction: "east" },
    tiles: [
      tile(0, 2, "start"),
      tile(1, 2, "bush"),
      tile(1, 1, "empty"),
      tile(2, 1, "puddle"),
      tile(3, 1, "star"),
      tile(3, 2, "cookie"),
    ],
    availableCommands: ["moveForward", "turnLeft", "turnRight", "jump", "sayMoo"],
    maxCommands: 16,
    successConditions: [
      { type: "collectItem", item: "star" },
      { type: "collectItem", item: "cookie" },
    ],
    hints: [
      "Go up around the bush first.",
      "Jump the puddle, grab the star, then reach the cookie.",
      "Turn left, move, turn right, move, jump, move, move, move.",
    ],
  },
];

export function getLevelById(id: number): LevelDefinition | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function getInitialDoorStates(
  level: LevelDefinition,
): Record<string, "open" | "closed"> {
  const states: Record<string, "open" | "closed"> = {};
  for (const boardTile of level.tiles) {
    if (boardTile.type === "door") {
      states[posKey(boardTile.position)] = "closed";
    }
  }
  return states;
}
