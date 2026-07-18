import type { CommandType } from "@/types/game";

export const commandToCode: Record<CommandType, string> = {
  moveForward: "moveForward();",
  turnLeft: "turnLeft();",
  turnRight: "turnRight();",
  jump: "jump();",
  sayMoo: 'say("Moo!");',
};

export function generateJavaScript(commands: { type: CommandType }[]): string {
  if (commands.length === 0) {
    return "// Tap commands to build a program!";
  }

  return commands.map((command) => commandToCode[command.type]).join("\n");
}
