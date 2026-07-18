import Link from "next/link";
import { LevelPicker } from "@/components/LevelPicker";
import { RandomLevelMenuButton } from "@/components/RandomLevelMenu";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <div className="rounded-[2rem] bg-white/90 px-8 py-10 shadow-xl backdrop-blur">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--bloop-blue)] text-5xl shadow-lg">
          🤖
        </div>
        <h1 className="text-4xl font-bold text-[var(--text-dark)] sm:text-5xl">
          Program the Adventure
        </h1>
        <p className="mt-3 text-lg text-[var(--text-dark)]/80">
          Help Bloop the robot with picture commands. No typing needed!
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/level/1"
            className="inline-flex min-h-14 min-w-56 items-center justify-center rounded-2xl bg-[var(--play-green)] px-8 text-xl font-bold text-white shadow-lg transition hover:bg-[var(--play-green-dark)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--play-green-dark)]"
            aria-label="Start playing level one"
          >
            ▶ Start Adventure
          </Link>
          <RandomLevelMenuButton />
        </div>
      </div>

      <section aria-label="All levels">
        <h2 className="mb-3 text-xl font-bold text-[var(--text-dark)]">
          Pick any level
        </h2>
        <LevelPicker />
      </section>
    </main>
  );
}
