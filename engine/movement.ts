import type { Direction, Position } from "@/types/game";

const DIRECTION_DELTAS: Record<Direction, Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

const LEFT_TURN: Record<Direction, Direction> = {
  north: "west",
  west: "south",
  south: "east",
  east: "north",
};

const RIGHT_TURN: Record<Direction, Direction> = {
  north: "east",
  east: "south",
  south: "west",
  west: "north",
};

export function turnLeft(direction: Direction): Direction {
  return LEFT_TURN[direction];
}

export function turnRight(direction: Direction): Direction {
  return RIGHT_TURN[direction];
}

export function getForwardPosition(
  position: Position,
  direction: Direction,
): Position {
  const delta = DIRECTION_DELTAS[direction];
  return { x: position.x + delta.x, y: position.y + delta.y };
}

export function isInsideBoard(
  position: Position,
  width: number,
  height: number,
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < width &&
    position.y < height
  );
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function directionToRotation(direction: Direction): number {
  switch (direction) {
    case "north":
      return 0;
    case "east":
      return 90;
    case "south":
      return 180;
    case "west":
      return 270;
  }
}
