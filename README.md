# Program the Adventure

A child-friendly programming game where kids help **Bloop** the robot complete missions using visual commands. No typing required.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm test` | Run automated tests |
| `npm run lint` | Run ESLint |

## Architecture

- **Next.js App Router** — pages at `/` and `/level/[levelId]`
- **`engine/`** — pure game logic (movement, execution, speech, code generation)
- **`data/levels.ts`** — 10 handcrafted levels
- **`components/`** — child-friendly UI (board, commands, program sequence)
- **`hooks/`** — React state + localStorage progress

## Features

- 5×5 game board with Bloop the robot
- 5 visual commands: Move Forward, Turn Left, Turn Right, Jump, Say Moo
- 10 progressive levels teaching sequence and debugging
- Tap-to-add/remove/reorder program steps
- Step-by-step execution with highlights
- Speech synthesis narration
- Web Audio sound effects
- Local progress persistence
- Parent mode (hold + math gate) with JavaScript view and settings

## Known Limitations

- Graphics use emoji + CSS (placeholder style, easy to swap later)
- Music toggle exists but no background music yet
- Act-It-Out mode is narration-only
- Loops, conditionals, variables, and functions are planned for future phases

## Next Steps

- Add visual loop containers ("Repeat 2 times")
- Add conditional blocks ("If puddle, jump")
- Variable chest UI for collected stars
- Named function blocks ("Super Hop")
- Custom SVG art for Bloop and tiles
