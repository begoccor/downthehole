# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite HMR on localhost:5173)
npm run build     # production build → dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint across all source files
```

> `npm` lives at `/opt/homebrew/bin/npm`. If not on PATH: `export PATH="/opt/homebrew/bin:$PATH"`.

## Stack

- **React 19** — JSX, no TypeScript
- **Vite 8** with `@vitejs/plugin-react`
- **Tailwind CSS v4** — wired via `@tailwindcss/vite` plugin (no `tailwind.config.js`); `@import "tailwindcss"` is in `src/index.css`
- **Framer Motion 12** — all animations and swipe/drag gestures
- **React Router 7** — `BrowserRouter` with three routes (`/`, `/how-it-works`, `/rabbit-holes`)
- **Wikipedia REST API** (`https://en.wikipedia.org/api/rest_v1/`) — no auth required

## Design system

Colors: yellow `#F7C948` (bg), red `#E8432D` (accent), dark `#0D0721` (hole).  
Fonts: **Lilita One** (display — class `font-display`) and **Nunito** (body — class `font-body`), loaded via Google Fonts `@import` at the top of `index.css`.  
Card style: white bg + `border-4 border-black` + `shadow-[6-8px_6-8px_0_#111]` — defined as `.card` utility in `index.css`.  
Button press: `.btn-press` utility gives a translate+shadow shrink on `:active`.

## Architecture

```
src/
  App.jsx              # BrowserRouter + Nav + Routes
  pages/
    Home.jsx           # Main page — owns a 6-state machine (input → loading → transition → facts → related → done)
    HowItWorks.jsx     # Static explainer page
    RabbitHoles.jsx    # History page, reads from localStorage
  components/
    Nav.jsx            # Sticky top nav with active-state styling
  hooks/
    useWikipedia.js    # fetchSummary, fetchRelated, extractFacts — no React, pure async functions
    useHistory.js      # localStorage-backed hook; startSession / addToChain / clearHistory
```

### Home.jsx state machine

All phase components live inline in `Home.jsx` and are switched via `AnimatePresence mode="wait"`:

| Phase | Component | Trigger |
|-------|-----------|---------|
| `input` | `InputPhase` | initial / reset |
| `loading` | `LoadingPhase` | form submit or swipe-right |
| `transition` | `TransitionPhase` | API data received (earth zoom → rabbit hole) |
| `facts` | `FactsPhase` | 2100 ms after transition starts (or "Skip" button) |
| `related` | `SwipeCard` | user taps "Related topics →" |
| `done` | `DonePhase` | related list exhausted |

Swipe right on `SwipeCard` → dives into that topic (calls `runSearch` with `continueSession=true`).  
Swipe left → increments `relIdx`; when exhausted → `done`.

### History

`useHistory` is called independently in both `Home` and `RabbitHoles`. They do **not** share React state — `RabbitHoles` always re-reads from localStorage on mount, which is fine because it's only visited via navigation. A session is a `{ id, startTopic, timestamp, chain[] }` object; `addToChain` appends each dive-in topic to the chain.

### Wikipedia API notes

- Summary: `GET /api/rest_v1/page/summary/{title}` — falls back to MediaWiki `opensearch` if 404
- Related: `GET /api/rest_v1/page/related/{title}` — returns up to 20 pages, we use 8
- Disambiguation pages are detected via `data.type === 'disambiguation'` and filtered out
- `extractFacts(text)` strips short parentheticals, splits on sentence boundaries, returns max 5 sentences (35–280 chars each)
