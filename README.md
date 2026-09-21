# Time Blocking Calendar

A Google Calendar–style work schedule built with **React + Vite + TypeScript**,
TanStack Router, Tailwind CSS v4, and Biome. No third-party UI or calendar
libraries.

## Features

- **7-day view port** starting from today (a real month/day calendar).
- **Events** with title, description, start and end date-time (no all-day events).
- **Drag on empty time** to draw a range and open the create dialog, prefilled.
- **Drag an event** to move it — duration preserved, snapped to the 15-minute
  grid.
- **Left-click an event** to view its details.
- **Right-click an event** for an Edit / Delete context menu.
- Overlapping events render side by side; multi-day events break across days
  with continuation chevrons.

## Stack

- React 19 + Vite (+ SWC plugin)
- @tanstack/react-router (code-based routing)
- Tailwind CSS v4 via `@tailwindcss/vite`
- TypeScript, Biome for lint/format, Vitest for tests

## Commands

```bash
pnpm install
pnpm dev          # start the dev server
pnpm build        # typecheck + production build
pnpm preview      # serve the production build
pnpm test         # vitest run
pnpm lint         # biome check
pnpm format       # biome format --write
```

## Layout

- `src/lib/` — pure logic: time/week, events, grid geometry, drag ranges,
  overlap layout. Fully unit-tested.
- `src/components/` — UI pieces: WeekView, DayColumn, EventBlock, dialogs,
  context menu, modal.
- `src/routes/` — the single calendar route hosting state and CRUD wiring.