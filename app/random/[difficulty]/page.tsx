import { Suspense } from "react";
import { notFound } from "next/navigation";
import { parseRandomDifficulty, RANDOM_DIFFICULTY_PATHS } from "@/data/randomDifficulty";
import { RandomLevelScreen } from "@/components/RandomLevelScreen";

interface RandomPageProps {
  params: Promise<{ difficulty: string }>;
}

function RandomLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-xl font-bold">
      Loading random adventure...
    </div>
  );
}

export default async function RandomLevelPage({ params }: RandomPageProps) {
  const { difficulty } = await params;
  const parsed = parseRandomDifficulty(difficulty);

  if (!parsed) {
    notFound();
  }

  return (
    <Suspense fallback={<RandomLoading />}>
      <RandomLevelScreen difficulty={parsed} />
    </Suspense>
  );
}

export function generateStaticParams() {
  return RANDOM_DIFFICULTY_PATHS;
}
