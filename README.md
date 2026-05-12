# Down The H⬤LE

> *Explore anything. Learn everything.*

A Wikipedia rabbit-hole explorer disguised as a swipe game. Type any topic, dive into the facts, and follow related subjects until you hit the earth's core — or another dimension.

---

## What it does

- **Search any topic** — pulls a clean summary and images from Wikipedia
- **Swipe to explore** — swipe right to dive into a related topic, left to skip
- **Depth system** — each hop takes you deeper through soil → rock → magma → earth's core → another dimension (at 50 hops)
- **Detail levels** — toggle between *Hmm, interesting* (quick read) and *Let's dive deeper* (full Wikipedia intro)
- **Trophies** — 14 achievements unlocked by reaching depth milestones, streaks, and hidden searches
- **Daily hole** — a new topic every day, same for everyone
- **Share your trail** — copy a link that lets anyone continue your exact session
- **EN / FR** — full bilingual support including searching French Wikipedia
- **Dark / light mode**
- **Fully offline-capable** — all user data stored in `localStorage`, no account needed

## Stack

| Layer | Tech |
|---|---|
| UI | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Animation | Framer Motion 12 |
| Routing | React Router 7 |
| Data | Wikipedia REST API + MediaWiki API (no auth) |
| Storage | `localStorage` only — no backend |
| Deploy | Netlify (drag & drop `dist/`) |

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the build locally
npm run lint
```

## Project structure

```
src/
  App.jsx                   # Providers + router
  pages/
    Home.jsx                # 6-phase state machine (input → loading → transition → facts → related → done)
    RabbitHoles.jsx         # History, stats, trophies
    HowItWorks.jsx          # Explainer
  components/
    Nav.jsx
  hooks/
    useWikipedia.js         # All Wikipedia API calls (pure async, no React)
    useHistory.js           # Session history → localStorage
    useStreak.js            # Daily streak + depth badges → localStorage
    useDownvotes.js         # Dismissed topics → localStorage
    useTheme.js             # Dark/light toggle → localStorage
  contexts/
    TrophyContext.jsx        # Trophy state + toast queue
    LanguageContext.jsx      # EN/FR + t() translation helper
  data/
    trophies.js             # Trophy definitions
    dailyTopics.js          # Rotating daily topic list
    i18n.js                 # All UI strings in EN and FR
```

## localStorage keys

| Key | Contents |
|---|---|
| `dth-rabbit-holes` | Full session history |
| `dth-likes` | Starred topics |
| `dth-streak` | Streak count, deepest dive, total sessions |
| `dth-trophies` | Earned trophy IDs |
| `dth-downvotes` | Topics dismissed with 👎 |
| `dth-lang` | Language preference |
| `dth-theme` | Dark / light preference |

## Hidden easter eggs

- Search **"down the rabbit hole"** to unlock *The O.G.* trophy
- Reach **50 hops** in one session to break through reality

---

Made by Corentin — built with React, Wikipedia, and too much curiosity.
