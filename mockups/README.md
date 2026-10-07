# Zero to Quant: Stage 1 mockups

A clickable, high-fidelity prototype of the Zero to Quant learning app. The design language, interaction model and pedagogy recreate Brilliant's 2025 to 2026 product, applied to the curriculum in `docs/curriculum.md`. Every design value and its evidence level is in `docs/design-research.md`.

## Open it

```sh
sh scripts/vendor.sh          # once: fetches Pyodide (13 MB) for the code drill
npx http-server . -p 8080     # any static server; the code drill needs http, not file://
```

Then open `http://localhost:8080/#today`. The tab on the left edge lists every screen and switches theme, motion and sound.

## Screens

| Route | Screen |
|---|---|
| `#onboarding` | Eight-step onboarding with adaptive placement |
| `#today` | Home: streak, weekly goal, league, due work, warm-up, resume |
| `#warmup` | Playable two-minute mental arithmetic drill |
| `#learn` | Catalogue by stage, track and topic; Stage 2 paths |
| `#course` | Course map for Conditional Probability |
| `#lesson` | Lesson player: 9 screens, quiz, celebration, streak |
| `#review` | Redo queue, homework, exams, practice, Notebook |
| `#homework` | Homework set with a self-marked written proof |
| `#exam` | Timed topic exam and result |
| `#drill` | Code drill checked by hidden tests in in-browser Python |
| `#you` | Profile, league board, mastery map, streak calendar, settings |
| `#system` | Design tokens, type, buttons, states, course art |

## Structure

- `css/tokens.css`: every colour, type, radius, motion and layout token, light and dark.
- `css/components.css`: shared components (lipped buttons, option cards, sheets, shell).
- `js/core.js`: router, icons, KaTeX helpers, sound, motion helpers, shell.
- `js/data.js`: curriculum model and the example learner.
- `js/art.js`: code-drawn course art.
- `js/screens/*.js`, `css/screens/*.css`: one file pair per screen.

The learner, dates and scores are example data. The prototype clock is Saturday 3 October 2026.
