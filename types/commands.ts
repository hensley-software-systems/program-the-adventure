import type { CommandType } from "./game";

export interface CommandDefinition {
  type: CommandType;
  label: string;
  narration: string;
  icon: string;
  ariaLabel: string;
}

export const COMMAND_DEFINITIONS: Record<CommandType, CommandDefinition> = {
  moveForward: {
    type: "moveForward",
    label: "Move Forward",
    narration: "Move forward.",
    icon: "⬆️",
    ariaLabel: "Move forward one step",
  },
  turnLeft: {
    type: "turnLeft",
    label: "Turn Left",
    narration: "Turn left.",
    icon: "↩️",
    ariaLabel: "Turn left",
  },
  turnRight: {
    type: "turnRight",
    label: "Turn Right",
    narration: "Turn right.",
    icon: "↪️",
    ariaLabel: "Turn right",
  },
  jump: {
    type: "jump",
    label: "Jump",
    narration: "Jump.",
    icon: "🦘",
    ariaLabel: "Jump over a puddle",
  },
  sayMoo: {
    type: "sayMoo",
    label: "Say Moo",
    narration: "Say moo.",
    icon: "🐄",
    ariaLabel: "Say moo",
  },
};

export const ALL_COMMAND_TYPES: CommandType[] = [
  "moveForward",
  "turnLeft",
  "turnRight",
  "jump",
  "sayMoo",
];
