import { notFound } from "next/navigation";
import { getLevelById, LEVELS } from "@/data/levels";
import { GameScreen } from "@/components/GameScreen";

interface LevelPageProps {
  params: Promise<{ levelId: string }>;
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { levelId } = await params;
  const id = Number(levelId);
  const level = getLevelById(id);

  if (!level) {
    notFound();
  }

  return <GameScreen level={level} />;
}

export function generateStaticParams() {
  return LEVELS.map((level) => ({
    levelId: String(level.id),
  }));
}
