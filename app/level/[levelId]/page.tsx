import { notFound } from "next/navigation";
import { getLevelById } from "@/data/levels";
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
  return Array.from({ length: 10 }, (_, index) => ({
    levelId: String(index + 1),
  }));
}
