export type Direction = "north" | "east" | "south" | "west";

export type CommandType =
  | "moveForward"
  | "turnLeft"
  | "turnRight"
  | "jump"
  | "sayMoo";

export interface ProgramCommand {
  id: string;
  type: CommandType;
}

export interface Position {
  x: number;
  y: number;
}

export interface CharacterState {
  position: Position;
  direction: Direction;
}

export type TileType =
  | "empty"
  | "start"
  | "goal"
  | "cookie"
  | "star"
  | "bush"
  | "puddle"
  | "door";

export interface BoardTile {
  position: Position;
  type: TileType;
}

export type SuccessCondition =
  | {
      type: "reachPosition";
      position: Position;
    }
  | {
      type: "collectItem";
      item: "cookie" | "star";
    }
  | {
      type: "sayMooAtDoor";
      doorPosition: Position;
    };

export interface LevelDefinition {
  id: number;
  title: string;
  concept: string;
  missionText: string;
  narrationText: string;
  boardSize: {
    width: number;
    height: number;
  };
  characterStart: CharacterState;
  tiles: BoardTile[];
  availableCommands: CommandType[];
  maxCommands?: number;
  starterProgram?: ProgramCommand[];
  successConditions: SuccessCondition[];
  hints: string[];
}

export type GameStatus =
  | "editing"
  | "running"
  | "success"
  | "retry"
  | "cancelled";

export interface GameState {
  levelId: number;
  program: ProgramCommand[];
  character: CharacterState;
  collectedItems: string[];
  doorStates: Record<string, "open" | "closed">;
  activeCommandIndex: number | null;
  status: GameStatus;
  message: string | null;
  lastAction: string | null;
  isPaused: boolean;
}

export interface SavedProgress {
  highestUnlockedLevel: number;
  completedLevelIds: number[];
  settings: {
    narrationEnabled: boolean;
    soundEffectsEnabled: boolean;
    musicEnabled: boolean;
    actItOutEnabled: boolean;
    reducedMotion: boolean;
    fastAnimations: boolean;
  };
}

export type ExecutionStatus = "complete" | "blocked" | "cancelled";

export interface ExecutionResult {
  status: ExecutionStatus;
  message?: string;
  character: CharacterState;
  collectedItems: string[];
  doorStates: Record<string, "open" | "closed">;
}

export interface ExecutionContext {
  level: LevelDefinition;
  character: CharacterState;
  collectedItems: string[];
  doorStates: Record<string, "open" | "closed">;
  signal: AbortSignal;
  setActiveCommandIndex: (index: number) => void;
  waitForAnimation: () => Promise<void>;
  onCharacterUpdate: (character: CharacterState) => void;
  onCollectedItemsUpdate: (items: string[]) => void;
  onDoorStatesUpdate: (states: Record<string, "open" | "closed">) => void;
  onAction: (action: string) => void;
  waitIfPaused: () => Promise<void>;
  reducedMotion: boolean;
  fastAnimations: boolean;
}
