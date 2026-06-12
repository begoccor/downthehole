# Design: Daily Puzzle, The Burrow & Game Feel

**Date:** 2026-06-10
**Scope:** A1 (daily puzzle), A2 (share grid), A3 (countdown), A4 (global results), B1 (Burrow), B2 (creature album), B3 (cosmetics), B4 (weekly quests), D4 (card stack), D5 (swipe juice) — as cherry-picked and approved by Corentin.

## Goals

Turn the daily from "suggested start topic + fixed Philosophy goal" into a true Wordle-style shared puzzle, add a Monopoly-Go-style meta-progression layer (carrots, creatures, cosmetics, quests) anchored in a Burrow profile page, and make swiping feel like a game. No pay-to-win, no pay-to-play; carrots are never purchasable.

## Decisions (user-approved)

1. **Daily target = themed** (regex match on article title, per language), not an exact page. Keeps the swipe mechanic solvable with ~8 related topics per hop.
2. **Daily global stats accept anonymous device-ID submissions** plus signed-in users.
3. **The Burrow evolves the existing Rabbit Holes page** (route stays `/rabbit-holes`).
4. **Carrot soft currency now; achievement-unlocked cosmetics also supported** — each cosmetic has either `{ cost }` or `{ achievement }`.

## 1. Daily Puzzle — `src/data/dailyPuzzle.js`

Replaces `dailyGoal.js` and the daily role of `dailyTopics.js` (free-explore suggestions can stay).

```js
{
  start:  { en: 'Octopus', fr: 'Pieuvre', es: 'Pulpo' },
  target: {
    label: { en: 'Philosophy', fr: 'Philosophie', es: 'Filosofía' },
    test:  { en: /\bphilosoph/i, fr: /\bphilosoph/i, es: /\bfilosof/i },
  },
  par: 5,
}
```

- ~60 hand-curated puzzles, rotated deterministically by day number; hole number = days since launch epoch (`2026-06-10` = Hole #1).
- Home daily card becomes the primary CTA: "🕳️ Daily Hole #N — Start → 🎯 Target · Par P". Once solved, the card flips to the result + countdown.
- During a daily session a slim banner shows `🎯 target · hops · par`.
- Win = current article title matches `target.test[lang]`. Win flow reuses/upgrades `DailyChallengeWonPhase`.
- Local result `dth-daily-result`: `{ date, hole, hops, layers[] }` (replaces `dth-daily-win`; keep a read of the old key for the `daily` trophy backcompat).

## 2. Share grid

Copy-to-clipboard block on the win screen and injected into `SocialShare`:

```
Down The H⬤LE #142
Octopus → 🎯
🟩🟫🟫🟧🟥🏁 5 hops · Par 5
followthehole.com
```

- One square per hop, mapped from the existing `LAYERS` depth table: surface 🟩, topsoil 🟫, deep soil 🟫, rock ⬜, magma 🟧, core 🟥, dimension 🟪. Target replaced by 🎯 (spoiler-free). Cap at 12 squares then `+N`.
- Pure function in `src/data/shareGrid.js`, unit-tested.

## 3. Countdown

`NextHoleCountdown` component: "Next hole in 07:42:13" to local midnight (matches local-date rotation). Shown on win screen and on the solved daily card.

## 4. Global results (Supabase)

- Table `daily_results (id uuid pk, day text, device_id uuid, user_id uuid null, hops int, created_at)`, unique `(day, device_id)`, RLS: anonymous insert with `hops between 1 and 200`, public select via RPC only.
- RPC `daily_distribution(p_day text)` → rows of `(hops, count)`.
- `dth-device-id` UUID in localStorage identifies anonymous players.
- Win screen: "Better than X% of diggers today" + pixel bar-chart histogram with your bar highlighted. Hidden entirely when Supabase is unconfigured (noop client) or the fetch fails.
- SQL migration provided in `docs/superpowers/specs/sql/daily_results.sql` for manual application in the Supabase dashboard.

## 5. Carrot economy — `src/hooks/useCarrots.js`

- Wallet in `dth-carrots` (int). Earn: daily win +10 (+5 at/under par), quest +15–30, first creature meeting +5, depth milestones 10/25/50 → +5/+10/+25. Spend: cosmetics only.
- Reward moments fire a toast (reuse trophy-toast pattern, carrot variant).

## 6. Weekly quests — `src/data/quests.js` + `src/hooks/useQuests.js`

- ~12 templates with ids, i18n keys, target counts, carrot rewards. 3 active per week picked deterministically from ISO week number (same for everyone).
- Progress in `dth-quests-<isoWeek>`; old keys pruned. Events recorded from existing flows: session end (depth), daily win, star, creature meeting, hops.
- Compact 3-bar widget on Home input phase; full panel in the Burrow. Completion → toast + carrots.

## 7. Creature album — `src/data/creatures.js` + `dth-creatures`

- Existing 5 (worm, beetle, mole, centipede, spider) recorded when they appear at their depth thresholds.
- 3 new rare creatures in the same pixel-SVG style: Trilobite (depth ≥ 16, 25% spawn/session), Crystal Golem (depth ≥ 25, 20%), Golden Axolotl (depth ≥ 5, 5%). Spawn rolls are per-session and deterministic per (session, creature).
- Record `{ firstMet, timesSeen }`. Album in Burrow: silhouettes + "???" until met; then name, flavor text, first-met date, times seen.
- Completing the album unlocks the Explorer Hat cosmetic (achievement unlock).

## 8. Cosmetics — `src/data/cosmetics.js` + `dth-cosmetics`

- Slots: `hat`, `neck`, `tool`. ~10 launch items: Miner Helmet 30🥕, Red Scarf 25🥕, Flower Crown 35🥕, Aviator Goggles 40🥕, Top Hat 50🥕, Wizard Hat 75🥕, Cape 60🥕, Golden Shovel 100🥕; Crown (achievement: 10 daily wins), Explorer Hat (achievement: full creature album).
- State: `{ owned: [], equipped: { hat, neck, tool } }`.
- `PixelRabbit` gains an `outfit` prop rendering overlay pixel layers; rabbit shows the outfit everywhere it appears (loading, transition, done, Burrow).
- Wardrobe section in Burrow: live preview, equip/buy, locked items show unlock condition.

## 9. The Burrow (Rabbit Holes page evolution)

- Header scene: pixel underground cross-section — rabbit with outfit, trophy shelf that fills, carrot counter, streak flame, deepest-dive marker.
- Sections: Stats (existing) · Quests · Trophies (existing) · Creatures · Wardrobe · History (existing). Nav label becomes "The Burrow" (i18n).

## 10. Game feel

- **Card stack (D4):** next 2 related topics render behind the active card (scale 0.95/0.9, y-offset), promoted on swipe.
- **Swipe juice (D5):** dive-in throws the card with exit velocity + dirt-particle burst in the current layer color; depth badge "+1" pop; skip gets a dust puff; `navigator.vibrate(10)` on swipe commit when supported.

## Structural

- `Home.jsx` (1,628 lines) splits: phases move to `src/components/phases/` (Input, Loading, Transition, Facts, SwipeCard, Done, Challenge, DailyWin, Dimension) plus shared bits (`Stars`, `EarthWithGlow`, layer helpers → `src/data/layers.js`). `Home.jsx` keeps the state machine only.
- All new strings in `i18n.js` (EN/FR/ES).
- Tests: dailyPuzzle rotation/matching/par, shareGrid mapping, quests weekly rotation, carrots, creatures recording. `dailyGoal.test.js` migrates to `dailyPuzzle.test.js`.

## Build order

1. Phase-split refactor
2. Daily Puzzle + share grid + countdown (client-only, fully playable)
3. Supabase `daily_results` + percentile screen
4. Carrots + quests
5. Creatures
6. Cosmetics
7. Burrow scene
8. Card stack + juice

Each step leaves the app shippable.

## Error handling & edge cases

- Supabase absent/failing → all A4 UI hidden; daily remains fully playable offline.
- Daily already solved → daily card shows result + countdown; replaying the start topic is a normal free session (no double submission thanks to the `(day, device_id)` unique constraint).
- Language switch mid-day → same puzzle index; target test is per-language.
- Clock changes / timezone: day boundary is the user's local date, consistent with existing behavior.
- localStorage quota/corruption → all reads wrapped in try/catch with safe defaults (existing pattern).
