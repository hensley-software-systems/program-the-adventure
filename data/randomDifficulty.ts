export type RandomDifficulty = "easy" | "medium" | "hard" | "impossible";

const VALID_DIFFICULTIES: RandomDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "impossible",
];

export function parseRandomDifficulty(value: string): RandomDifficulty | null {
  return VALID_DIFFICULTIES.includes(value as RandomDifficulty)
    ? (value as RandomDifficulty)
    : null;
}

export const RANDOM_DIFFICULTY_PATHS = VALID_DIFFICULTIES.map((difficulty) => ({
  difficulty,
}));
