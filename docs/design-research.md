# Recreation spec: a Brilliant-grade design language for Zero to Quant

Draft 2, 6 October 2026. This draft revises Draft 1 using gap research on buttons, feedback, lesson flow, typography, the course map, Home and gamification. It is the input to the Stage 1 coded mockups and covers the design system, interaction model, pedagogy and curriculum architecture.

**Evidence tags.** Every concrete value carries one of these:

- **[verified]**: confirmed by adversarial verification against first-party sources or several independent sources.
- **[sourced]**: stated by a cited source, but the source is a single one, a third-party screenshot or a video analysis, or it was not re-checked independently. Where two independent captures agree, the tag reads [sourced, two captures].
- **[plausible]**: partly supported, or consistent with prior knowledge. Likely, but not established.
- **[inferred]**: our deduction from verified or sourced facts.
- **[our choice]**: either no Brilliant evidence exists or we depart from Brilliant on purpose. Each such value is chosen to fit the verified character of the design.

No gap-research finding was adversarially re-verified, so none was promoted to [verified].

**Brand guard.** We recreate the system, the interaction model and the pedagogy. We do not use any of the following:

- Brilliant's name or wordmark.
- The Koji character or voice, or Koji's two slots: the avatar beside lesson feedback and the marker floating over the current node.
- The CoFo typefaces, including CoFo Brilliant, `coFoBrilliantFont`, CoFo Robert and CoFo Semi Mono, and the Soleil face.
- PIX or Blorb artwork.
- The element-named league tiers and their U-shaped element shields.
- The term "Streak Charge" and the battery motif.
- The "Gift Premium" pill.
- Brilliant marketing lines: "Learn by doing", "6x more effective", "Get smarter in 15 minutes a day".

Working name: **Zero to Quant**, taken from the curriculum title [our choice, needs approval].

**Research limits.**

- No researcher opened brilliant.org directly. The web-search budget was used up (200 of 200), and most fetches were blocked.
- Draft 1 drew on four kinds of source:
  - Brilliant's help centre, blog and job postings, as quoted in search results;
  - case studies (Koto, ustwo, Rive, Pop & Strange);
  - 60fps.design and Mobbin titles;
  - third-party GitHub teardowns.
- Draft 2 adds pixel measurements from third-party screenshot sets hosted on GitHub:
  - 12 light-mode web lesson screenshots dated 12 September 2026 (informach/sistema-zero);
  - 116 light-mode iOS screens from a Mobbin set dated October 2025 (vascodegraaff/KoalaSleep);
  - dark-mode web Home and course-map screenshots plus video frames dated 18 July 2026 (lohjo/innopoly-financial-literacy);
  - a marketing landing screenshot dated 14 February 2026 (chekos/pedagogical-engine).
- Measurement limits:
  - Values read from PNGs may be off by about ±2. Values read from mobile JPEGs may be off by about ±4.
  - Some coloured button fills may show hover rather than resting colours.
  - Mobbin sets are curated subsets, so a screen missing from a set does not prove the screen does not exist.
- One screenshot set was downloaded from raw.githubusercontent.com after the GitHub API refused access to that repository. The user may want to confirm this was acceptable.

Section 12 lists what is still missing.

---

## 1. Design philosophy

Brilliant is a white, quiet workbench with loud edges. Each screen holds one small idea and one thing to do with your hands: drag a point, set a slider, place a block, pick an option. Each step replaces the one before it. The explanation comes after you have tried, and when you are wrong the diagram moves to show why. Mistakes cost nothing inside a lesson. Scaffolding is removed in practice, so independent skill is tested separately.

Motion inside the problem follows only the learner's input. Colour and celebration are kept for the boundaries: Check, the end of a lesson, a streak day, a league result. The chrome is plain: white surfaces, black ink, neutral greys, and pill buttons with a hard bottom lip that press down like keys. The single action button is neutral charcoal until Check, then turns green or amber with the verdict. Pear yellow-green belongs to the streak.

Gamification is restrained habit scaffolding: one streak, one XP count and one weekly league. During a lesson only an XP counter and a streak bolt show, in the top bar. The product uses one squarish grotesque everywhere, and a Clarendon slab appears only at brand moments. Diagrams are drawn in code with uniform strokes.

Zero to Quant keeps all of this. It adds what Brilliant lacks for an adult heading towards quant work: derivations, timed exams, homework with spaced redo, and code drills checked by tests.

### Principles

1. **Act before you read.** Every lesson screen asks for an action. Prose always sits next to an interaction, except on the title screen [verified].
2. **One idea per screen, one primary action.** Each screen has one prompt, one canvas and one button group whose main button moves from Check to Continue [sourced]. Each step replaces the screen rather than stacking below it [inferred from sourced screenshots, two captures].
3. **The diagram explains.** Feedback changes the diagram rather than adding paragraphs. A wrong answer animates to show the failure [verified].
4. **Free mistakes in lessons, real stakes in exams.** Lessons have no hearts or lives, and wrong answers prompt a retry with no points docked [verified]. Exams are timed, with no hints and no retries [our choice].
5. **Quiet canvas, loud boundaries.** Fun is balanced against the concentration STEM work needs [verified, ustwo]. Celebration is short, can be skipped, and happens only at boundaries [inferred].
6. **Scaffolding fades on a schedule.** Lessons give hints and visual aids, and practice removes them [verified]. Exams remove them and add a clock [our choice].
7. **White, neutral, serious; pear for the streak.**
   - White page, black ink, neutral greys [sourced].
   - A neutral charcoal action that turns green or amber at Check [sourced].
   - Pear only on the streak bolt and streak surfaces in 2025 to 2026 captures [sourced]. The 2024 refresh named pear for "primary CTAs and streaks" [verified], but no in-product pear CTA has been observed.
   - Dark mode is a full, equal theme [our choice; Brilliant ships dark on web, sourced].
8. **Rigour you can see.** Every answer is checked by machine, and the rule for accepted answers is shown after submission [our choice, answering the ambiguity critique].
9. **Accessible by default.** Colour always comes with an icon and a label, every motion has a reduced-motion fallback, and every drag has a keyboard path. Where a Brilliant colour pair fails WCAG AA, we keep the fill and darken the text [our choice].

---

## 2. Design tokens

### 2.1 Colour: what is known

- **2024 refresh.** Koto, working with Brilliant's in-house team, brought "a lighter, brighter colour palette and a new pear colour spectrum for use across primary CTAs and streaks" [verified]. No hexes were published [verified].
- **Light lesson player, measured on web, September 2026** [sourced]:
  - Page #FFFFFF, ink #000000.
  - Neutral greys: #F2F2F2, #E5E5E5, #CCCCCC, #C2C2C2, #999999, #7F7F7F, #797979.
  - Correct uses a family of greens, not one hex: #29CC57, #15B441, #49D470, #38BF5D, #5ED981, #9FE8B3, #F4FCF7, #009B2B.
  - Not yet is amber, not red: #F9D25C, #F8CC45, #C29B26, #FCE49D, #746026.
  - The streak bolt is #BBCC00.
- **Brand green.** Brandfetch's auto-extracted #29CC57 matches the 2026 lesson progress-bar fill exactly [sourced, two independent sources]. Brandfetch's #B78900 is unexplained [sourced, low confidence].
- **Dark web, July 2026** [sourced]:
  - Page #141414; header and cards #1E1E1E.
  - Borders #4B4B4B, #4C4C4C and #424242.
  - Secondary text #A1A1A1; inactive navigation #A5A5A5.
  - Streak lime #D8E82E.
- **Course accents.** In iOS captures from October 2025, programming is purple, Functions (maths) is blue and Data is orange [sourced]. "Science gold" is [plausible] only. The purple family was measured on dark web, July 2026 [sourced]:

  | Hex | Where |
  |---|---|
  | #9D62FF | Start and Continue face, done-node side |
  | #874DE5 | Start lip |
  | #C19CFF | done-node face |
  | #7E43E0 | node shading |
  | #7139CC | level-card lip and overline |
  | #AB7BFB | current-node halo |

- **Blue.** Blue for learner-movable objects until grading [sourced, earlier single capture]. Code keywords are #456DFF [sourced].
- **Do not use:**
  - #D1E231, which is the generic dictionary "pear";
  - the brilliant.design tokens (#0080FF, #FF3377, #FF9900, #FFDD00), which belong to an unrelated company [verified].

Contrast ratios below were computed with the WCAG formula.

### 2.2 Brand: pear ramp

The ramp is anchored on the two measured bolt colours. The other steps are [our choice].

| Token | Hex | Use | Evidence |
|---|---|---|---|
| pear-50 | #FAFCE6 | streak card wash | [our choice] |
| pear-100 | #F3F8C4 | selected streak-goal wash | [our choice] |
| pear-200 | #E9F28F | focus highlight wash on canvases | [our choice] |
| pear-300 | #D8E82E | bolt and lit day circle on dark (13.6:1 on #141414) | [sourced: July 2026 dark web] |
| pear-400 | #C9DA17 | lit day circle on light | [our choice, between the sourced steps] |
| **pear-500** | **#BBCC00** | bolt on light (ink on it 11.8:1) | [sourced: September 2026 lesson header] |
| pear-600 | #96A300 | bolt outline on light; ring around today's lit day | [our choice]; the darker olive ring is [sourced] |
| pear-700 | #6B7500 | pear text on white (5.0:1) | [our choice] |
| pear-800 | #4D5400 | | [our choice] |
| pear-900 | #2F3300 | | [our choice] |

Rules:

- Text on pear is always ink #000000, never white [inferred: white on pear-500 is 1.8:1].
- Pear is never used for Check, Continue or course Start buttons [inferred from the sourced captures].

### 2.3 Neutrals and surfaces

Brilliant uses pure neutral greys, not warm ones [sourced]. We match them, and step a value away only where WCAG needs it.

| Token | Light | Dark | Use | Evidence |
|---|---|---|---|---|
| bg.canvas | #FFFFFF | #141414 | app and lesson background | [sourced] both |
| bg.surface | #FFFFFF | #1E1E1E | cards, lesson frame, header | [sourced] both |
| bg.raised | #FFFFFF + e2 | #262626 | sheets, modals | light [our choice]; dark [our choice] |
| bg.sunken | #F2F2F2 | #101010 | disabled fills, track wells, code blocks | light [sourced]; dark [our choice] |
| bg.hover | #F7F7F7 | #2B2B2B | hover wash | light [our choice]; dark #2B2B2B is a sourced button fill |
| line.default | #E5E5E5 | #4B4B4B | frame, option cards, progress track, dividers | [sourced] both |
| line.lip-neutral | #CCCCCC | #0F0F0F | lip under secondary buttons | light [sourced]; dark [our choice] |
| line.control | #8A8A8A (3.5:1) | #6E6E6E (3.6:1) | input and checkbox borders, which need 3:1 | [our choice] |
| text.primary (ink) | #000000 (21:1) | #FFFFFF (18.4:1) | body, titles | [sourced] both |
| text.secondary | #4D4D4D (8.5:1) | #A1A1A1 (7.1:1) | secondary copy, descriptions | light [our choice]; dark [sourced] |
| text.muted | #6B6B6B (5.3:1) | #8C8C8C (5.5:1) | captions, upcoming node titles, dimmed graded options | [our choice]. Brilliant's #7F7F7F is about 4.0:1 and its dark #727272 about 3.8:1; both fail AA |
| text.disabled | #C2C2C2 | #5A5A5A | disabled labels, unlit icons | [sourced] both (exempt from contrast rules) |
| icon.default | #797979 (4.4:1) | #A5A5A5 | close, top-bar icons | [sourced] both |
| icon.quiet | #8A8A8A (3.5:1) | #6E6E6E | flag, sound | [our choice]. Brilliant's #CCCCCC is 1.6:1 |
| link.disabled | #999999 | #5A5A5A | "Start over" link before any change | light [sourced]; dark [our choice] |

### 2.4 Semantic colours

Correctness is never shown by hue alone. It always comes with an icon (check or cross) and a text verdict [our choice]. Brilliant ships white labels on green (1.9:1) and an olive label on amber (4.0:1). We keep the fills and use ink labels [our choice].

**Correct family.** Fills are [sourced, September 2026 web] unless marked otherwise.

| Role | Brilliant (observed) | Ours, light | Ours, dark |
|---|---|---|---|
| Brand green: progress fill | #29CC57 | #29CC57 | #29CC57 |
| Strong: chosen-card border, check badge, XP glyph | #15B441 | #15B441 | #2ECC57 [our choice] |
| Continue after correct: face / lip / label | #49D470 / #38BF5D / white (1.9:1) | #49D470 / #38BF5D / ink (10.9:1) [our choice] | same fills, ink label [our choice] |
| Frame border; verdict-chip border | #5ED981 | #5ED981 | #5ED981 |
| Verdict-chip fill | #9FE8B3 | #9FE8B3 | #5ED981 at 20% alpha [our choice] |
| Chosen-card fill | #F4FCF7 | #F4FCF7 | #49D470 at 14% alpha [our choice] |
| Green text | #009B2B (3.7:1 on white, fails AA) | #13803B (5.0:1) [our choice] | #5ED981 [our choice] |
| Page wash after correct | #EAFAEE to #D1F5DB, rising from the bottom | same | #49D470 at 16% alpha [our choice] |

**Not-yet family.** Fills are [sourced, September 2026 web] unless marked otherwise.

| Role | Brilliant (observed) | Ours, light | Ours, dark |
|---|---|---|---|
| Frame border; verdict-chip border | #F9D25C | #F9D25C | #F9D25C |
| Try again: face / lip / label | #F8CC45 / #C29B26 / #746026 (4.0:1) | #F8CC45 / #C29B26 / ink (13.7:1) [our choice] | same fills, ink label [our choice] |
| Verdict-chip fill | #FCE49D | #FCE49D | #F9D25C at 20% alpha [our choice] |
| Page wash after not yet | #FEF9EA to #FEF3D1 | same | #F8CC45 at 14% alpha [our choice] |
| Amber text on white | not measured | #9A5800 (5.6:1) [our choice] | #F9D25C [our choice] |
| Per-criterion failure mark in checklist puzzles | a red cross [sourced, single video analysis] | #C9302C cross icon with label [our choice] | #F26B66 [our choice] |

**Buttons and other roles.**

| Role | Light | Dark | Evidence |
|---|---|---|---|
| Neutral action (enabled Check, plain Continue): face / lip / label | #565656 / #262626 / white (7.3:1) | #F2F2F2 / #B3B3B3 / ink | light [sourced; may be a hover colour, and enabled Check is inferred]; dark: a white idle button was reported [sourced, single video analysis], hexes [our choice] |
| Secondary (Why?, Get help) | #E5E5E5 / #CCCCCC / ink | #2B2B2B / #0F0F0F / white | light [sourced]; dark [our choice] |
| Disabled Check | #F2F2F2 fill, #C2C2C2 label, no lip, sits 4px lower | #1F1F1F, #5A5A5A | light [sourced]; dark [our choice] |
| Unchosen options after grading | border #F2F2F2, text #6B6B6B | border #2B2B2B, text #8C8C8C | Brilliant uses text #7F7F7F [sourced]; ours [our choice] |
| Hint / help | #5A5FE0 (5.1:1), wash #EEEFFD | #8F93F2 | [our choice] |
| Manipulable (learner-controlled) | #2F6BFF (4.5:1), wash #EAF0FF | #4D8BFF (5.7:1) | blue for movable objects [sourced]; hexes [our choice] |
| Code keyword | #456DFF (4.3:1) | #8FA6FF | light [sourced]; dark [our choice] |
| Selected option before Check | 2px #2F6BFF border + #EAF0FF fill | 2px #4D8BFF + 16% alpha | blue border and light-blue fill [sourced, single earlier capture]; hexes [our choice] |
| Focus ring | 2px #2F6BFF, 2px offset | 2px #4D8BFF | [our choice] |
| Streak bolt, lit | pear-500 #BBCC00 | pear-300 #D8E82E | [sourced] |
| Streak bolt, unlit | grey outline #C8C8C8 | grey outline #5A5A5A | dark [sourced]; light [inferred] |
| XP glyph | grey outline at 0 XP, solid #15B441 once XP is above 0 | same | [sourced] |
| League: current user's row | #D4F5E0 | #004E16 | [sourced] |
| Rank medals 1 to 3 | gold rim #F7C325, face #F8CF50; silver #C2C2C2; bronze #F7B67C | same | [sourced] |

### 2.5 Subject (track) accents

Brilliant colours each course and path by topic [verified for path colour-coding]. The level overline, done nodes, the level-card lip, the Start and "Continue course" pills and the course art all take the course accent [sourced, iOS October 2025 and web July 2026]. The progress bar does not: it stays brand green in every course [sourced, two captures].

We map our six curriculum tracks onto the same hue families. Each track has five steps:

- **accent:** fills, rings and node sides; at least 3:1 on white.
- **deep:** text and the face of track buttons; at least 4.5:1 with white.
- **lip:** the hard edge under track buttons and the level card.
- **soft:** washes.
- **dark accent:** the dark-mode equivalent.

| Track | Curriculum items | Accent | Deep (face, text) | Lip | Soft | Dark accent | Basis |
|---|---|---|---|---|---|---|---|
| Maths | 0.1 to 0.3, 1.3, 1.4, 3.2 | #2A78D6 (4.4:1) | #1C5CAB (6.6:1) | #144686 | #E8F1FC | #5598E7 | maths blue [sourced]; hexes [our choice] |
| Probability and statistics | 1.5, 1.6, 2.2 | #D95926 (3.9:1) | #A8441A (6.0:1) | #7F3212 | #FDEEE7 | #EB6834 | data orange [sourced]; hexes [our choice] |
| Programming | 0.4, 1.1, 1.2, 1.8, 1.9 | #4A3AA7 (8.6:1) | #4A3AA7 | #33277A | #EEECF9 | #9085E9 | programming purple [sourced; Brilliant's measured family is listed in 2.1]; hexes [our choice] |
| Finance | 1.7, 2.3 projects | #12875E (4.5:1) | #0B6B4A (6.5:1) | #064D35 | #E3F5EE | #1BAF7A | [our choice] |
| Machine learning | 2.1, 3.1 | #C43C78 (4.9:1) | #C43C78 | #962B5A | #FBE8F0 | #E87BA4 | [our choice] |
| Interview and speed | 0.5, 2.4, 3.3 | #A36D00 (4.4:1) | #8A5C00 (5.8:1) | #634200 | #FBF1DC | #EDA100 | science gold reused [plausible]; hexes [our choice] |

Rules:

- **Track buttons on light.** They use the deep step as the face, a 4px lip in the lip step, and a white label [our choice]. Brilliant's #9D62FF Start with a white label is about 3.7:1.
- **Track buttons on dark.** They use the dark accent face with an ink label (about 7:1 for maths) [our choice]. Check each pair at build.
- **Done-node faces.** The accent mixed 45% towards white, with the accent as the side band and the deep step for shading [our choice]. This mirrors the sourced purple set: face #C19CFF, side #9D62FF, shade #7E43E0.
- **Conflicts.** The interview gold sits near the not-yet amber, and the finance green sits near correct green. Feedback therefore always uses the frame, the icon and the verdict text, and never recolours track chrome [our choice].

### 2.6 Diagram and chart palette

Diagrams are code-drawn vector graphics with shared styles. Brilliant uses its in-house Elm library, Diagrammar [verified]. Equations inside lessons render in a TeX-style italic serif [sourced, iOS October 2025].

Categorical series use the six-slot order below. We validated it with the dataviz palette checker:

- lightness band, chroma floor, colour-blind separation of adjacent slots (worst ΔE 9.1 light, 8.4 dark) and the normal-vision floor (worst 19.6 light, 19.3 dark) all pass;
- slots 1 to 3 also pass all-pairs.

[our choice, validated]

| Slot | Light | Dark |
|---|---|---|
| 1 blue | #2A78D6 | #3987E5 |
| 2 orange | #EB6834 | #D95926 |
| 3 aqua | #1BAF7A | #199E70 |
| 4 yellow | #EDA100 | #C98500 |
| 5 magenta | #E87BA4 | #D55181 |
| 6 violet | #4A3AA7 | #9085E9 |

Diagram rules [our choice unless tagged]:

- **Series count.** Assign slots in order and never cycle. In scatter plots, area models and any chart where two marks can touch, use at most 3 series. Lines, bars and stacks allow up to 6.
- **Labels.** In light mode slots 3 to 5 fall below 3:1 on white, so every series gets a direct label. Legends are a fallback, not the default.
- **Movable elements.** Learner-movable elements take the manipulable blue (#2F6BFF) with a 2px white ring and a 1px ink outline. No series ever uses that exact colour [inferred from the sourced blue-means-movable rule].
- **Geometry ink:**
  - primary strokes: 2px, text.primary;
  - gridlines: 1px, line.default;
  - axes: 1.5px, text.muted;
  - targets and constraints: 1.5px dashed ink (6 on, 4 off);
  - focus highlight: pear-200 wash at 60% opacity.
- **Grading.** Grading recolours only the answer objects (the chosen option, the placed token, the shaded region) and the frame. It never recolours series [inferred from the sourced amber re-tint of wrong items].
- **Sequential ramps** (heatmaps, densities): a single-hue blue ramp from #CDE2FB to #0D366B [our choice, from the dataviz reference].
- **Diverging ramps** (P&L, residuals): blue to red (#E34948) through a grey midpoint, #F0EFEC light and #383835 dark [our choice, from the dataviz reference].

### 2.7 Dark mode

Brilliant was light-only through 2024. In December 2024 it said it was "actively working on" dark mode [verified]. The claim that dark mode never launched was **refuted**:

- By mid-2026 the logged-in web app supports light and dark through CSS `light-dark()` [sourced].
- Dated dark screenshots from July 2026 show Home and the course map on a #141414 page with #1E1E1E cards [sourced].
- Marketing pages stay light [sourced].
- Native iOS captures from October 2025 are light [sourced].

Ours [our choice]:

- **Themes.** Light is the default and dark is a full, equal theme. Follow the OS setting, with an in-app override (System, Light, Dark).
- **Tokens.** Implement every token as a CSS custom property on `:root`. Redefine it under `@media (prefers-color-scheme: dark)`, guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`.
- **Elevation in dark mode.** Shadows become surface steps plus a 1px rgba(255,255,255,0.08) hairline. Button lips stay hard edges in a darker tone. Accent washes become the accent at 16% alpha.
- **Maths and code.** KaTeX output inherits `color: currentColor`. Code blocks use bg.sunken in both themes.

### 2.8 Typography

**What Brilliant uses.** It uses two Contrast Foundry faces [verified]:

- **CoFo Sans**, slightly customised, across the product. It is a squarish grotesque with "strong squareness of shapes" and carefully drawn figures and fractions. On the web it is served as `"CoFo Brilliant"` / `coFoBrilliantFont` [sourced, two captures: element styles scraped January 2026 at 16, 14.4, 12.8 and 12px, and a CSS bundle from July 2026].
- **CoFo Robert**, a Clarendon-style slab named after Robert Besley. The July 2026 CSS bundle also lists CoFo Semi Mono, Soleil and Source Code Pro [sourced, single bundle].

**Where the serif appears.** The iOS set of 116 screens from October 2025 shows the serif in only two places [sourced]:

- the splash headline;
- Premium paywall and trial headlines, at about 34 to 36pt in regular or medium weight.

Everything else is bold or regular sans [sourced]: lesson titles, course titles, Home, the course map, Lesson Complete, catalogue heads and onboarding questions.

**Marketing.**

- February 2026: serif hero at about 155 to 160px; serif section heads at about 58 to 60px, medium weight; sans body at 16 to 17px [sourced].
- September 2026: the new hero is declared as `"CoFo Robert"`, 76px/79.8px, weight 500, letter-spacing -1.4px. It renders as a sans in that capture. A "CoFo Robert Sans" family may exist, so the cause is undetermined [sourced, undetermined].

**Corrections to Draft 1.**

- Draft 1 said 2026 screenshots show serif course titles and Home titles in the product. That is **refuted**: the claim came from the QuranLab repo, which committed no images, and its descriptions conflict with the matching Mobbin screens.
- A July 2026 video analysis reports a "full-bleed serif question" in onboarding [sourced, single weak source]. In October 2025 the same questions were sans.

Both families are commercial, and we use neither.

**Free matches** (Google Fonts) [our choice]:

| Role | Family | Why |
|---|---|---|
| UI sans (stand-in for CoFo Sans) | **Archivo** (variable: wght 100 to 900, wdth 62 to 125) | A grotesque skeleton with flattened, squarish curves. It has heavy weights for numbers and a width axis for dense tables. Second choice: Schibsted Grotesk. How closely it matches CoFo Sans is unverified. |
| Display slab (stand-in for CoFo Robert) | **Besley** (wght 400 to 900, with italics) | A Clarendon revival named after Robert Besley, the same lineage. Used only at brand moments (2.9). Second choice: Bitter. |
| Maths | **KaTeX** default fonts (Computer Modern lineage), KaTeX 0.16.9 from cdn.jsdelivr.net | Brilliant's maths renders in a TeX-style italic serif [sourced], but its engine is unknown. KaTeX also matches the user's maths-teaching skill, which mandates it. |
| Code | **Source Code Pro** (400, 500, 700), with the `zero` feature on | Listed in Brilliant's July 2026 CSS bundle [sourced] and free under the OFL. Second choice: JetBrains Mono. |

Font stacks [our choice]:

```css
--font-sans: "Archivo", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-serif: "Besley", Georgia, "Times New Roman", serif;
--font-mono: "Source Code Pro", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

Numeric features [our choice]:

- `font-variant-numeric: tabular-nums` for timers, scores, XP counters, streak counts, tables and axis ticks.
- `diagonal-fractions` only in prose fractions. Typeset maths uses KaTeX.

### 2.9 Type scale

Values are size/line-height in px, mobile then desktop. Mobile sizes come from iOS points measured at about 1.069px per point, ±1.5pt [sourced where tagged].

The serif is used only for the Welcome screen, onboarding framing questions, stage milestones and marketing [our choice, matching Brilliant's splash, paywall and marketing scope]. Everything in the product is sans [sourced].

| Token | Family, weight | Mobile | Desktop | Tracking | Use | Evidence |
|---|---|---|---|---|---|---|
| display-xl | Besley 500 | 44/46 | 76/80 | -0.018em | marketing hero | desktop size, weight and tracking [sourced: September 2026 hero declaration]; mobile [our choice] |
| display-section | Besley 500 | 32/36 | 58/62 | -0.015em | marketing section heads | desktop [sourced: February 2026, medium weight]; mobile [our choice] |
| display | Besley 500 | 34/40 | 40/46 | -0.01em | Welcome, onboarding framing questions, stage-exam pass | paywall headlines 34 to 36 [sourced]; this use [our choice] |
| lesson-title | Archivo 700 | 32/38 | 32/38 | -0.01em | lesson title screen, in-lesson titles, left-aligned | [sourced: about 31 to 32 on iOS, 30 to 32 on web] |
| complete | Archivo 700 | 30/36 | 30/36 | -0.01em | lesson complete, exam result, centred | [sourced] |
| course-title | Archivo 700 | 25/30 | 28/34 | -0.01em | course page title, onboarding statement screens, centred | mobile [sourced]; desktop [our choice] |
| h1 | Archivo 700 | 22/28 | 24/30 | -0.01em | Home greeting, catalogue and section heads | [sourced: 20 to 24 bold; web greeting about 24] |
| sheet-title | Archivo 700 | 21/26 | 21/26 | 0 | bottom-sheet and modal titles | [sourced: sheet lesson name about 21, explanation header about 20] |
| node-label | Archivo 400 | 17/22 | 20/26 | 0 | course-map lesson titles, at most 2 lines | [sourced] |
| h2 | Archivo 700 | 16/22 | 16/22 | 0 | level name, card titles, onboarding chip questions | [sourced: level name and bubble questions about 16 bold] |
| prose | Archivo 400 | 17/25 | 17/26 | 0 | lesson prose, key terms in 700, 22px paragraph gap | mobile and gap [sourced]; web measured about 16/26 [sourced]; desktop 17 [our choice] |
| body | Archivo 400 | 16/24 | 16/24 | 0 | interface copy | [sourced: 16px on web] |
| button | Archivo 700 | 17/20 | 17/20 | 0.01em | buttons | [our choice; not measured] |
| label | Archivo 600 | 15/20 | 15/20 | 0 | stats rows ("22 Lessons · 220 Exercises"), chips | [sourced: stats row about 15] |
| caption | Archivo 500 | 13/18 | 13/18 | 0.01em | metadata, axis labels | [our choice] |
| overline | Archivo 700, uppercase | 13/16 | 13/16 | 0.08em | "LEVEL 2" in the track deep step, "TOTAL XP", league name | size and colour role [sourced]; tracking [our choice] |
| stat | Archivo 800, tabular | 40/44 | 48/52 | -0.01em | XP totals, streak count | large bold numerals [sourced]; sizes [our choice] |
| code | Source Code Pro 400 | 14/22 | 15/24 | 0 | editors, inline code | [our choice] |
| maths inline | KaTeX | 1.05em of the surrounding text | | | inline maths | [our choice] |
| maths display | KaTeX | 1.15em | | | displayed equations | [our choice] |

Measure and length:

- The content column is 540px on desktop [sourced], which holds about 62ch of prose.
- A lesson screen holds at most about 60 words of prose. Third-party reviews describe 2 to 4 sentences per concept introduction [sourced, third-party estimate]. The 60-word cap is [our choice].

### 2.10 Spacing, radii, lips, borders

**Spacing** uses a 4px base: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 [our choice].

| Context | Value | Evidence |
|---|---|---|
| Lesson side margin, mobile | 20 | [sourced] |
| Lesson content, desktop | 540px column centred in the frame | [sourced] |
| Gap between prose and canvas | 24 | [our choice] |
| Gap between canvas and answer widget | 20 | [our choice] |
| Gap between option cards | 8 | [sourced] |
| Gap between two buttons | 8 | [sourced] |

**Radii.** The brand motif is "rounds and squared-off corners" [verified]. The product uses large, consistent radii [sourced]. Mixed corners appear only on our logo mark [our choice].

| Token | px | Use | Evidence |
|---|---|---|---|
| r-xs | 6 | code tokens inside inputs | [our choice] |
| r-sm | 10 | answer option cards, inputs | [sourced: option cards about 10] |
| r-md | 16 | code blocks, league current-user row, list rows | [sourced: league row about 16] |
| r-lg | 20 | explanation modal, bottom-sheet top corners | [sourced: modal about 20] |
| r-xl | 24 | lesson frame, Home cards, streak and league cards, resume card | [sourced: about 24] |
| r-pill | 999 | every button (a 48px face gives radius 24), progress bar and pills, chips, ask bar, streak pill, floating tab bar | [sourced] |

**Lips and elevation.** Brilliant's pressable elements carry a hard bottom edge in a darker tone of the same colour, with no blur. Pressing sinks the face until the lip almost disappears [sourced, two captures]. Answer option cards and frames are flat [sourced].

| Token | Spec | Use | Evidence |
|---|---|---|---|
| lip-button | 4px hard bottom edge, no blur. Pressed: the face moves down 4px and the lip shrinks to 0. Disabled: no lip, drawn 4px lower | primary and secondary buttons | [sourced] |
| lip-token | 2px border on all sides plus a 4px bottom edge in the border colour | code chips, draggable tokens | code chips [sourced]; tokens [inferred] |
| lip-start | 5px lip on a face about 65px tall | course-map Start | [sourced] |
| lip-level | 2px sides, 3px top, 7px bottom, in the track lip step | level card | [sourced] |
| flat | 2px border, no lip | option cards, lesson frame, Home cards | [sourced] |
| e1 | 0 1px 2px rgba(0,0,0,0.06) | resting cards on grey | [our choice] |
| e2 | 0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08) | dragged items, popovers, floating tab bar | soft shadow on the tab bar [sourced]; values [our choice] |
| e3 | 0 -8px 32px rgba(0,0,0,0.16) | bottom sheets | [our choice] |
| node-puck | side band 12% of node width | course-map nodes | [sourced] |

**Borders.**

| Context | Border | Evidence |
|---|---|---|
| Hairline dividers | 1px | [our choice] |
| Option cards, frame, Home cards, inputs | 2px | [sourced] |
| Selected or graded state | 2px, colour change only | [sourced] |
| Lesson feedback (desktop) | Frame border turns #5ED981 or #F9D25C, and a wash rises from the bottom of the page outside the frame | [sourced]; wash height 240px [our choice] |
| Lesson feedback (mobile) | No frame. The button area takes the wash and a 2px top border in the semantic colour | [our choice] |

### 2.11 Layout, widths and breakpoints

| Token | Value | Basis |
|---|---|---|
| Lesson top bar | 64px desktop; 56px mobile | desktop [sourced]; mobile [our choice] |
| Lesson frame, desktop | Full viewport minus 32px left, right and bottom, starting under the top bar; radius 24; 2px border. Capped at 1280px wide and centred | measured at 1366×900 [sourced]; cap [our choice]; behaviour beyond 1366px is a gap |
| Lesson frame, mobile | none; content runs edge to edge | [sourced] |
| Lesson content column | 540px, centred | [sourced] |
| Button group, desktop | 366px wide, bottom-centre inside the frame, about 17px above its bottom edge. One button fills it; two buttons sit 8px apart (secondary 100 to 112px, primary the rest) | [sourced] |
| Button, mobile | 286 × 48 plus a 4px lip, right-aligned with a 16px margin. Brilliant puts the tutor icon in the left slot; ours puts a 48px round hint button there | button [sourced]; hint slot [our choice] |
| Explanation modal | 592px wide, radius 20, close X, 50% black scrim | [sourced] |
| Progress bar | 592 × 12 on desktop; 206 × 12 at 390px | [sourced] |
| Course map | path column 575px wide, with the course card to its left on web | [sourced] |
| Home, web | two columns, the left about 480px | [sourced, at capture scale] |
| App shell max width | 1120px | [our choice] |
| Marketing max width | 1200px | [our choice] |
| Tap target minimum | 44 × 44px | generous tap targets are an internal eval criterion [verified]; 44 [our choice] |

Breakpoints [our choice; Brilliant's are unknown]:

| Name | Range | Shell |
|---|---|---|
| xs | under 480 | floating tab bar, full-bleed cards |
| sm | 480 to 767 | floating tab bar |
| md | 768 to 1023 | top header, single column |
| lg | 1024 to 1279 | top header, two-column Home; code drills split editor and brief side by side |
| xl | 1280 and up | as lg, with wider gutters |

---

## 3. Iconography and illustration

**What is known.**

- An app release (8.19.0) shipped "an updated tab bar complete with new icons" [sourced, release-note snippet; date not pinned, about 2024].
- iOS tab icons are 24pt-class outline icons over small labels [sourced]. Their stroke weight is unknown.
- The wordmark mixes rounded and squared-off corners [verified].
- Before 2024 the house illustration style, PIX, was "built from straight-edged line segments" [verified]. Whether PIX survives in 2026 is unknown [verified gap].
- Lesson diagrams are code-generated [verified].
- Course art appears only at course and level level, on course cards, level carousels and Home thumbnails. Lesson nodes carry no illustrations [sourced].

**Icon rules** [our choice]:

- 24px grid, 2px stroke, round caps and joins, 2px optical padding.
- Outline icons at rest. Filled icons for selected states. The active tab gets a pill fill behind it rather than a filled icon [sourced pattern].
- Corners follow the motif: outer corners rounded at a 3px radius, with one squared corner allowed where it helps recognition, such as a flag.
- Sizes: 20px inline, 24px controls and tab bar [sourced size class for tabs].

**Specific glyphs.**

- **Streak glyph:** a lightning bolt [sourced, two captures].
  - Unlit (before today qualifies): a grey outline.
  - Lit: filled pear-500 on light, pear-300 on dark [sourced].
  - The flame some summaries mention is unsupported, and it is Duolingo's mark [verified].
- **XP glyph:** a four-point spark. A grey outline at 0 XP, solid #15B441 once XP is earned [sourced behaviour; the glyph is generic].
- **Rest days** (our streak protection): two small pill slots beside the count, filled pear when held. We do not use Brilliant's battery [our choice, brand guard].
- **Lessons ahead:** no lock glyph on course-map nodes [sourced].
- **Exam:** a squared shield. **Homework:** a clipboard. **Code drill:** a terminal prompt `>_`. **Hint:** a lightbulb.
- **Report:** a flag. Brilliant now puts the flag and the sound toggle at the top left inside the lesson card, from first load [sourced, September 2026 web]. Earlier evidence placed the flag beside Continue after an answer [verified for earlier versions]. Ours follows the 2026 placement.

**Logo** [our choice, needs approval]:

- Mark: a rounded square with a radius of 28% of its side and one squared corner at top right, enclosing a rising step line. It quotes the motif without copying any letterform.
- Wordmark: "zero to quant" in Archivo 800 at -2% tracking, with "to" in weight 500.

**Course art** [our choice, faithful to the verified flat-vector and code-diagram character]:

- One hero object per course: for example a die for probability, a 3×3 matrix grid for linear algebra, a payoff kink for options, a stack of layers for neural nets.
- Flat fills from the track ramp, in three value steps for form. No texture gradients.
- Straight facets with rounded outer corners, at a light three-quarter or isometric angle.
- An optional 2px ink outline, used on every element of a course or none.
- Each piece sits on its track soft wash. Brilliant's course page ends in a warm wash at the bottom, and its web course map sits over a radial glow in the course colour [sourced]. We use the soft step for both.

**Character.**

- **Brilliant's use.** Brilliant uses a mascot, Koji, to "lower the stakes" [verified]. In 2026 Koji has three jobs [sourced]:
  - it docks bottom-left in lessons and delivers feedback in speech bubbles;
  - it floats over the current course-map node with a beam of light;
  - it hosts onboarding questions in speech bubbles.
- **Learner view.** Learners asked for "a character they could talk to" [verified].
- **Criticism.** Critics note a cute character can read as unserious, and Brilliant considered dropping it [verified].

Our learner is an adult heading for quant roles, so [our choice, needs approval]:

- No character in version 1.
- Koji's slots are filled without a character:
  - lesson feedback becomes a verdict chip at bottom-left (5.1);
  - the current-node marker becomes our logo mark with a beam (7.4);
  - the tutor slot beside the mobile button becomes the hint button.
- Celebrations animate the logo mark: it pulses and emits small square particles.

---

## 4. Motion system

No Brilliant easing, spring constant or duration has been observed. Still captures cannot show them. Every timing below is [our choice] unless tagged.

### 4.1 Principles

1. **Animations are state machines.** Brilliant builds motivational animation in Rive State Machines: designers author the states and the app only fires inputs [verified]. We author each animated asset as an explicit state graph: idle, trigger, celebrate, settle [inferred].
2. **Numbers move with the picture.** The streak count changes at the animation's peak, synced through an event [verified].
3. **Direct manipulation is never tweened.** Dragged geometry redraws on every pointer frame. A spring applies only on release, to snap [inferred from the Diagrammar architecture].
4. **The diagram changes to explain.** After a wrong answer the canvas animates to the counter-example or the correct state [verified]. Hints highlight or annotate canvas elements [verified for the 2026 tutor].
5. **Boundaries get the energy.** Check feedback, lesson end, streak, league result and exam result [verified principle, ustwo]. Small flourishes on correct answers are allowed [sourced].
6. **Buttons behave like keys.** On press the face sinks into its lip [sourced, two captures]. There is no hover lift: a 1px rise on hover appears only in a third-party copy [unverified].
7. **Every celebration can be skipped.** A tap anywhere jumps to the final state. Total celebration time is at most 2.4s [our choice].
8. **One file, every platform.** Brilliant shipped its streak to iOS, Android and web from one Rive file [verified]. We define each animation once, as a shared Rive file or a shared JS/CSS state machine [our choice].

### 4.2 Easing curves [our choice]

| Token | Curve | Use |
|---|---|---|
| ease-standard | cubic-bezier(0.2, 0, 0, 1) | state changes on screen |
| ease-enter | cubic-bezier(0.05, 0.7, 0.1, 1) | elements arriving, sheets opening |
| ease-exit | cubic-bezier(0.3, 0, 0.8, 0.15) | elements leaving |
| ease-morph | cubic-bezier(0.65, 0, 0.35, 1) | loader morphs, "show why" diagram morphs |
| linear | linear | progress during timed tasks; count-ups, with ease-out on the last 20% |

### 4.3 Springs [our choice]

All springs use mass 1. The CSS `linear()` approximation is given alongside.

| Token | Stiffness / damping | Behaviour | CSS approximation and use |
|---|---|---|---|
| spring-snap | 500 / 40 (damping ratio 0.89) | no visible overshoot; settles in about 250ms | `linear(0, 0.069, 0.214, 0.379, 0.533, 0.662, 0.764, 0.841, 0.897, 0.936, 0.962, 0.979, 0.990, 0.996, 0.999, 1)` over 300ms. Use: drop into slot, sheet snap. |
| spring-bounce | 320 / 24 (ratio 0.67) | about 6% overshoot | `linear(0, 0.121, 0.366, 0.618, 0.818, 0.952, 1.026, 1.055, 1.057, 1.046, 1.031, 1.017, 1.007, 1.001, 0.998, 0.997, 1)` over 500ms. Use: check badge, XP chip, streak bolt, node completion. |
| spring-physical | 170 / 14 (ratio 0.54) | about 13% overshoot; reads as having mass | `linear(0, 0.131, 0.407, 0.698, 0.927, 1.068, 1.129, 1.131, 1.101, 1.061, 1.025, 0.999, 0.986, 0.982, 0.984, 0.989, 1)` over 700ms. Use: balance beams, pendulums, probability-tree swings. |

### 4.4 Durations [our choice]

| Token | ms | Use |
|---|---|---|
| press | 80 | button sinks into its lip; option pressed state |
| hover | 120 | hover washes |
| micro | 150 | icon swaps, chip in and out |
| base | 200 | option state changes, frame colour on feedback |
| enter | 200 | incoming screen content, verdict chip |
| exit | 120 | outgoing content |
| sheet | 280 enter / 200 exit | bottom sheets, explanation modal |
| progress | 320 | progress bar width change |
| explain | 480 to 800 | "show why" diagram morph (longer for bigger changes) |
| count | 700 | XP and stat count-ups |
| stagger | 80 per item | stat badges, list reveals |

### 4.5 Feedback animations

**Check, correct.** States are [sourced: September 2026 screenshots and a July 2026 video analysis]. Timings are [our choice].

1. **0ms.** Inputs lock. The frame border moves to #5ED981 over 200ms (ease-standard), and the green wash rises from the bottom of the page.
2. **0ms.** The chosen option takes a #15B441 border, a #F4FCF7 fill and green text. A #15B441 check badge appears on its top-right corner, scaling from 0.6 to 1 on spring-bounce. Unchosen options fade to a #F2F2F2 border and muted text [sourced states].
3. **80ms.** The verdict chip fades in at bottom-left and rises 8px over 200ms. It shows a check icon, "Correct", a one-line reason, and "+15 XP".
   - Brilliant shows a "+15 XP" chip that pops [sourced, two captures].
   - Brilliant's copy is "Yeah, that's it." or "That's it!" on web in September 2026, and "Correct!" with a party emoji in earlier mobile and July 2026 captures [sourced].
4. **160ms.** The top-bar XP counter ticks up by 15, and the XP glyph fills green [sourced behaviour]. There is no chip flight to the counter: no source shows one [our choice].
5. **Buttons.** The row becomes **Why?** (secondary) and **Continue** (green #49D470 face, #38BF5D lip, ink label) [sourced, except the label colour, which is our choice].
6. **Feedback.** Sound and haptic fire at 0ms (see 4.9).

**Check, not yet.** States are [sourced: the July 2026 video analysis and the September 2026 screenshots]. Timings are [our choice].

1. **0ms.** The frame border moves to #F9D25C over 200ms, and the amber wash rises.
   - Wrong answer objects take an amber border, a wash and a cross badge.
   - Correct items the learner kept dim to grey [sourced, single video analysis].
   - In checklist puzzles, failed criteria show a cross [sourced].
2. **80ms.** The verdict chip shows a cross icon and "Not quite right." [sourced string, single capture], plus a one-line diagnosis when the wrong answer matches a known misconception [our choice]. Brilliant's September 2026 web copy is "Not quite, but that's okay! If you're not making mistakes, you're not learning." and "Give it another shot." [sourced].
3. **Show why.** Where the canvas supports it, the diagram animates over 480 to 800ms (ease-morph) to show the consequence of the chosen answer. For example, the beam tips, or the double-counted cell flashes twice at 150ms intervals [verified pattern; specifics our choice].
4. **Buttons.** The row becomes **Get help** (secondary) and **Try again** (#F8CC45 face, #C29B26 lip, ink label) [sourced, except the label colour, which is our choice].
5. **No shake.** No evidence of a shake exists, and it would contradict the no-penalty tone [our choice].

**Try again** [our choice]: the frame returns to neutral over 200ms. The previous input stays and can be edited. The verdict clears.

**Reveal solution.** No 2025 to 2026 source shows a solution reveal [gap]. Ours is [our choice]:

- The canvas animates to the correct state over 600ms (ease-morph).
- Correct objects take a hint-indigo outline, not green, so a reveal never reads as a success.

### 4.6 Progress

- **Lesson bar.** One continuous bar, not segmented [sourced, measured, September 2026].
  - 12px tall, pill-shaped, with a rounded fill end.
  - Fill #29CC57, track #E5E5E5. The fill is the same green in every course [sourced, two captures].
  - Before step 1 it shows a 16px dot [sourced].
  - The bar is followed by small grey #F2F2F2 pills: 16 × 12 and 12px apart on desktop, 12px circles 8px apart on mobile [sourced]. They probably stand for the lesson's later sections [inferred, unconfirmed].
  - The fill advances in equal steps, only when Continue is pressed, never on Check [sourced].
  - Ours: the bar covers the lesson's screens, and one trailing pill stands for the lesson quiz [our choice]. The fill runs over 320ms (ease-standard) [our choice].
- **Quiz, practice and homework:** a row of dots, one per item [sourced: practice uses dot progress]. Each dot fills green, amber or grey by result after its item [our choice].
- **Course cards:** a 4px bar in the track accent [sourced: course cards carry a progress bar].
- **Level:** a ring around the level badge [our choice].
- **Course map:** the course map has no connector lines [sourced]. Rive's "connecting lines" most likely refer to the Learning Path map of courses [inferred]. On completion, the done node fills with the accent over 300ms and the next node gains its halo on spring-bounce [our choice].

### 4.7 Celebrations

| Moment | Sequence | Evidence |
|---|---|---|
| Lesson complete | Full screen, with "Lesson complete" in the complete token, centred, and "TOTAL XP" overline above large bold numerals. The logo mark pulses on spring-bounce with a 12-particle square burst (600ms). Three stat badges (Accuracy, Time, First-try) enter 80ms apart and count up over 700ms, then merge into the XP total. A dark Continue pill follows. | Brilliant: title, TOTAL XP and numerals [sourced]; animated mascot and staggered stat badges that resolve into XP [verified]. Ours replaces the mascot with the mark. |
| Rest day earned | A full-screen card after Lesson complete: our rest-slot glyph fills pear, with "You earned a rest day. It keeps your streak if you miss a day." and a Continue pill. | Brilliant shows a full-screen "Streak Charge earned" page straight after Lesson Complete, with an animation [sourced]. Ours [our choice]. |
| Streak day 1 | Full screen: a pale pear wash at the top fading to the page colour, a large pear bolt, the count "1", "You started a streak", the week strip, and Continue. Then a goal picker (7, 14 or 30 days) with "Set goal". | Brilliant: full-screen day 1, then a goal picker with 3, 7 or 14 days, "Commit to my goal" [sourced, two captures]. Our goal values and plain labels [our choice]. |
| Streak day 2 onwards | The header bolt fills and scales 1 to 1.25 to 1 on spring-bounce. At the peak (about 45% through), the number flips like an odometer over 250ms. On return to the course map, a full-width pear toast with a bolt reads "Streak extended". | Toast [sourced]; count synced at the peak [verified]; no full screen for later days [inferred, low confidence]; values [our choice] |
| Rest day used | Shown on next open: a slot empties with a 300ms fade and the line "Rest day used. Your streak is safe." | streak protection [verified]; visual [our choice] |
| Perfect lesson | Adds a sweep around the stat badges (800ms) and a "Perfect" ribbon. | A separate Perfect Score animation exists [sourced] |
| League result (weekly) | Promote: the badge rises 16px, the new tier colour sweeps in, then a glow. Stay: a small 4-degree wobble. Demote: the badge drops 8px and desaturates gently. Each runs once, at the first session after the reset. | three outcome animations [verified]; motion [our choice] |
| Exam passed | Score counts up over 900ms, then a pass stamp lands on spring-snap, then the per-skill breakdown fades in. Stage-exam passes use the display serif. No particles. | [our choice] |
| Confetti | Not used. | No source shows particle confetti. Brilliant's "Correct!" carries a party emoji [sourced], and our no-emoji rule drops it. The confetti shot sometimes credited to Brilliant belongs to Elevate [verified]. |

### 4.8 Transitions

- **Between steps.** Each step replaces the screen [inferred from sourced screenshots, two captures]. Older Brilliant appended content and auto-scrolled [plausible, outdated]. Inside a screen, the feedback, the button swap, the Why? modal and diagram steppers appear progressively [sourced, including a job posting describing "the layout engine for progressively showing content, hints, and feedback"]. The transition itself has never been observed [gap].
- **Between screens** [our choice]:
  - The top bar, frame and button row stay fixed. Only the content column changes.
  - Outgoing content fades over 120ms. Incoming content fades in over 200ms and rises 8px or less.
  - The progress bar moves on the same beat.
- **Within a screen** [our choice]: new blocks fade in and rise 8px over 200ms with ease-enter.
- **Explanation:** a centred modal on desktop and a bottom sheet on mobile [sourced: web modal; iOS explanation sheet]. It enters over 280ms with ease-enter, over a 50% black scrim [scrim sourced; timing our choice].
- **Sheets:** slide up 100% over 280ms with ease-enter, over a 50% black scrim [our choice, matching the sourced modal scrim].
- **Tabs:** a 150ms cross-fade, with no horizontal slide [our choice].
- **Loader:** seven flat tangram-style pieces in the track ramp. They morph between three of our own silhouettes over 700ms with ease-morph and hold each for 400ms.
  - Brilliant uses a tangram loader instead of a spinner [plausible, single source].
  - The silhouettes and timings are [our choice].

### 4.9 Reduced motion, sound and haptics

**Reduced motion** [our choice]. It is triggered by `prefers-reduced-motion: reduce` or by the in-app Motion setting (System, Full, Reduced). Under it:

- Translate and scale animations become opacity cross-fades of 120ms or less.
- Particles, wobbles, halo breathing and badge pops are removed.
- Count-ups show the final value at once.
- The progress bar jumps to its new width.
- The streak bolt shows its new state without a pulse.
- "Show why" diagram morphs become a stepped before-and-after with a **Play** button.
- Drag-snap springs become instant placement.
- Button press still sinks the face, since that is feedback rather than decoration.

The Brilliant tutor's motion drew complaints in May 2026 [sourced]. This control exists partly for that reason.

**Sound.**

- Brilliant designs sounds and haptics as part of the pedagogy [verified].
- Users can switch sounds off, and some reviewers called them "somewhat annoying" [sourced].
- The sound icon sits at the top left of the learning area on desktop and at the top right on mobile [sourced, help centre].
- Muting the mascot keeps the small correct and incorrect messages [sourced, help centre].
- The sound assets are unpublished [gap].

Ours [our choice]:

- Sound is off by default on web. Mobile asks once, after the first lesson.
- A one-tap mute sits with the flag at the top left of the lesson card.

| Event | Sound | Length |
|---|---|---|
| Correct | two rising sine-and-marimba notes, a major third apart | 220ms |
| Not yet | one soft, low wooden tock, no buzzer | 120ms |
| Lesson complete | three-note arpeggio | 600ms |
| Streak day | short rising chime | 400ms |

All sounds peak about 12dB below full scale and duck under any speech.

**Haptics** [our choice]:

| Event | iOS | Web (Android Chrome only, progressive) |
|---|---|---|
| Correct | notification feedback, success | 10ms vibration |
| Not yet | impact feedback, light (not the error pattern) | none |
| Drag snap | selection feedback | 10ms vibration |
| Lesson complete | success | none |

Never use haptics during exams.

---

## 5. Lesson anatomy

### 5.1 Screen structure (top to bottom)

1. **Top bar.**
   - Brilliant on desktop: 64px tall. Close X on the left (#797979). Progress bar and pills in the centre. On the right, the XP count, the XP glyph and the streak bolt [sourced].
   - Brilliant on mobile web at 390px: X, bar and pills, and the bolt only [sourced].
   - Ours, left to right [our choice following the sourced layout]:
     - Close (X), which saves position and returns to the course map.
     - The progress bar and the quiz pill, centred.
     - The XP count (tabular figures) and the XP glyph.
     - The streak bolt, unlit or lit.
2. **Lesson frame.**
   - Desktop: a near-full-screen card. It has 32px margins on the left, right and bottom, radius 24 and a 2px line.default border [sourced].
   - Mobile: no frame [sourced].
   - Feedback recolours the frame and adds the page wash (2.10).
3. **Card utilities.** The flag and the sound toggle sit at the top left inside the card from first load [sourced]. A "Start over" text link resets the canvas. It is #999999 until the learner changes something, then ink [sourced]. We place it at the top right of the canvas [our choice].
4. **Title and prompt prose.** These sit in the 540px column [sourced]. Prose is at most about 60 words, with inline maths in KaTeX [our choice].
5. **Canvas.** The interactive or diagram, scaled to the column width. Aspect ratio between 4:3 and 1:1 on mobile [our choice].
6. **Question line**, in h2 weight, directly above the answer widget [our choice].
7. **Answer widget** (5.3).
8. **Bottom of the card.**
   - **Verdict chip** at bottom-left, after Check: icon, verdict, reason, XP.
     - Brilliant uses a mascot speech bubble at bottom-left on web [sourced]. It used a green bottom banner, "Correct! +15 XP", in earlier mobile captures [sourced].
     - Ours is a bubble without a character, in the verdict-chip colours from 2.4 [our choice].
   - **Button group.** Desktop: bottom-centre, 366px wide [sourced]. Mobile: a right-aligned 286px button with our hint button in the left slot (2.11).

### 5.2 Step (screen) types

| Type | Purpose | Interaction | Evidence |
|---|---|---|---|
| Title | lesson name (lesson-title, left-aligned), illustration, one framing sentence in prose | Continue only; the only screen with no task | [sourced] |
| Explore | a canvas to play with before any question | free manipulation, then Continue | [inferred from problem-first ordering] |
| Problem | a question on a canvas | interact, Check, feedback, Continue | [verified] |
| Ladder step | the same canvas with one new constraint | as Problem; copy such as "Now with three coins." | constraint ladders [sourced]; one canvas carried across 4 screens [sourced] |
| Demonstrate | animated step-through of a process | a stepper inside the diagram (dots plus previous and next), then Continue | [sourced] |
| Trap | a deliberately tempting wrong path, then the reveal | a Problem whose likely answer is the misconception | [our choice, from the user's lesson-creator "Common Trap" rule] |
| Generalise | states the rule as a description of what the learner just did, with the formula or pseudocode | read, then one confirmation item | [sourced] |
| Derive | complete the missing line of a derivation | expression entry or order-the-steps | [our choice] |
| Code | write or complete a function, run tests | code editor, Run, Submit | [our choice] |
| Summary | key ideas, the formula card, what comes next | Continue | [our choice] |

### 5.3 Interaction catalogue

Every interaction shares one state set (5.4) and one button group. Only the canvas and the widget change [our choice].

| # | Type | Behaviour | Evidence |
|---|---|---|---|
| 1 | Single choice | Flat option cards in a 2-column grid when there are 4 or fewer short options, otherwise stacked. Grid gap 8px. Each card: 2px line.default border, r-sm, 60px minimum height, 16px padding. On desktop each column is 266px. Options can be text, KaTeX or a small image. Selection style as in 2.4. Graded states as in 4.5. Keys 1 to 9 select on web. | Flat 2px cards, about 10px radius, 60px tall, two 266px columns with an 8px gap [sourced]; 2×2 grid on mobile [sourced]; default state [inferred: not captured]; keys [our choice] |
| 2 | Multi-select | Same cards, each with a square check. The question line says "Select all that apply" and hides the count. | [our choice] |
| 3 | Numeric entry | A single field with an optional unit suffix, and an on-screen keypad on mobile (digits, point, minus, fraction). The tolerance is shown after grading ("Accepted: 0.183 to 0.185"). | numeric entry [plausible]; tolerance display [our choice] |
| 4 | Expression entry | A maths keyboard with fraction, root, power and Greek keys. Graded by symbolic equivalence, so equivalent forms are accepted. Uses MathLive and the CortexJS Compute Engine. | Brilliant has a maths keyboard with fraction and root boxes [sourced]; engine [our choice] |
| 5 | Slider | 4px track, 24px thumb in manipulable blue, 44px hit area. Value label above the thumb. Optional snap ticks. Dependent geometry redraws live. Arrow keys step; Shift+arrow steps 10×. | sliders in Diagrammar [verified]; sizes [our choice] |
| 6 | Drag point (locator) | A 20px handle with a white ring and a 44px hit area on a graph or figure. Optional grid snap on release (spring-snap). Arrow keys move one grid unit. | drag locators [verified] |
| 7 | Place or sort | Tokens use lip-token at rest. A lifted token scales to 1.03 with an e2 shadow and drops its lip. Siblings slide aside over 200ms, and the drop snaps. Keyboard: Space lifts, arrows move, Space drops. | drag and drop [verified]; lipped chips [sourced]; motion [our choice] |
| 8 | Tap regions | Tap cells or regions on a canvas to shade them (grids, Venn regions, sample spaces). The running count shows in the question line. | region selection on the canvas [sourced] |
| 9 | Block code | Drag lipped command chips into program slots from a small palette. Keywords in #456DFF. A Run button animates execution on the canvas. | blocks, program slots and palette [verified]; chip style and keyword colour [sourced] |
| 10 | Code editor | Source Code Pro editor with line numbers. Run executes in-browser Python (Pyodide) against the visible examples. Submit runs hidden tests. | [our choice] |
| 11 | Expression manipulator | Tap a term and apply an operation (add to both sides, factor, expand). The terms animate to their new positions over 300ms. | expression build and simplify [verified] |
| 12 | Balance | Weights and unknown blocks on two pans. The beam tilts on spring-physical by clamp(k × (right − left), ±15°). Removing equal amounts from both pans keeps the beam level. | weight-scale puzzles [sourced]; maths [our choice] |
| 13 | Simulate | Run 10, 100 or 1,000 trials. A histogram fills live, and the empirical frequency converges on the exact value line. | [our choice] |
| 14 | Table | Edit cells or sort columns. Dependent charts update. | table manipulation [verified] |
| 15 | Order steps | Reorder the lines of a proof or derivation. Graded on order, with per-line marks after grading. | [our choice] |
| 16 | Sketch | Drag the control points of a curve to match a target, for example a CDF or a payoff. Graded by tolerance band. | [our choice] |

### 5.4 Check, Continue and feedback state machine

```
idle            Check disabled: flat #F2F2F2 pill, #C2C2C2 label, no lip, 4px low   [sourced]
  │ first interaction
  ▼
engaged         Check enabled: #565656 face, #262626 lip, white label          [inferred: not captured]
  │ Check (or Enter)
  ▼
evaluating      inputs locked, ≤150ms, no spinner unless >400ms (then tangram loader in the button)
  ├── correct ─────► correct     green frame, verdict chip, +15 XP, [Why?] [Continue]   [sourced]
  │                    └ Continue ─► next screen; the progress bar advances here         [sourced]
  └── incorrect ───► not-yet     amber frame, "Not quite right.", [Get help] [Try again]  [sourced]
                       ├ Try again ─► engaged (input kept)
                       ├ Get help ──► hint ladder (5.5) ─► engaged
                       └ after 2 not-yet results: a "Show solution" link above the buttons   [our choice]
                              └ Show solution ─► revealed  canvas morphs to answer, explanation,
                                                           [Continue]; screen XP = 0
```

- **Retries.** Unlimited retries in lessons, with no points docked [verified].
- **Mastery and XP.** Mastery credits the first attempt only. XP rules are in section 6 [our choice].
- **Keys.** Enter triggers the primary button on web, and Escape closes sheets and modals. Neither key appears in Brilliant evidence [our choice].
- **Multi-part answers.** Partly correct multi-part answers are marked per part: green parts lock, amber parts reopen [our choice].

### 5.5 Hints and help

Evidence on hints:

- A 2022 review describes a hint on every problem.
- A 2026 review says hints appear after a wrong answer.
- Since May 2026, Brilliant's tutor answers "Get help". It asks questions, highlights and annotates the canvas, and never gives the answer [verified].
- Whether "Get help" existed before the tutor launched is unknown [inferred link, unproven].

Ours, with no AI dependency [our choice]:

- **Lesson hint ladder.** Get help, or the hint button in the mobile left slot, opens a bottom sheet with up to three rungs:
  1. **Nudge:** a question back to the learner.
  2. **Point:** highlights the relevant canvas element with a pear wash and a 2px ink ring that pulses twice.
  3. **Step:** the first step of the solution, worked through.

  After the third rung, the sheet offers Show solution.
- **Availability.** Hints become available after the first Check in a lesson. Practice, quizzes, homework and exams have no hints. Brilliant removes hints and visual aids in practice [verified].
- **Optional AI explainer.** A later addition behind a setting. It reads the screen state and follows the same never-the-answer rule [our choice].

### 5.6 Explanations

- **Brilliant.** "Why?" appears after a correct answer [sourced, two captures]. On web it opens a centred modal titled "Explanation" [sourced]. On iOS it opens a sheet with a bold header of about 20pt [sourced].
- **Ours.** "Why?" is available after both correct and incorrect answers [our choice]. It opens the modal or sheet with at most 3 sentences plus an annotated diagram state [our choice].
- **Wording.** Explanations refer to the learner's own action ("You added the two cases, but the corner cell is in both"). They do not restate the rule [our choice].
- **Distractors.** Each multiple-choice distractor encodes one named misconception and has its own feedback line and diagram state [our choice].

### 5.7 Mistakes policy

- **No hearts, lives or energy.** Brilliant limits lessons per day for free users, not mistakes [plausible]. We limit neither [our choice].
- **No penalty.** Wrong answers never cost XP or the streak [verified for Brilliant; kept].
- **Redo queue.** Wrong answers from lessons, quizzes and homework go into the learner's **Redo queue**. Each one returns after 7 days and again after 30 days, matching the curriculum's review rule [sourced, curriculum file].

### 5.8 Lesson length

- **Daily pitch.** Brilliant pitches about 15 minutes a day [verified].
- **Exercises per lesson.** Its courses run 7.4 to 13.2 exercises per lesson by course-page ratios [verified].
- **Section length.** One measured section ran about 8 screens [inferred from equal progress steps].
- **Lesson duration.** Third-party estimates put lessons at 5 to 15 minutes [sourced].
- **Ours.** **8 to 12 screens, 10 to 15 minutes**, with at most 1 title screen and at most 2 non-task screens per lesson [our choice].

### 5.9 End of lesson

Brilliant's sequence [verified unless tagged]:

1. A celebration screen ("Lesson Complete!", TOTAL XP, mascot, stat badges resolving into XP).
2. Optionally a "Streak Charge earned" page [sourced].
3. The streak moment.
4. Continue.
5. A choice of quick practice or the next lesson.

Ours:

1. **Celebration** (4.7), then a rest-day card if one was earned, then the streak moment.
2. **Summary card** [our choice]:
   - three key ideas, one line each;
   - the lesson's formula card, saved to the Notebook;
   - one "common trap" line.
3. **Lesson quiz** [our choice]:
   - 3 to 5 items in the scaffold-free style of Brilliant's practice sets, with no hints and no visual aids [verified pattern];
   - one attempt each;
   - dot progress;
   - "Why?" after each item.
4. **Next.** Continue to the next lesson, or Done. If a level has just finished, homework is announced here.

---

## 6. Gamification

### 6.1 Brilliant's mechanics

- **Streak.**
  - A day counts after 3 problems or 1 full lesson [verified]. A missed day resets the streak to 0 unless protection is held [verified].
  - Before the day qualifies, the bolt is a grey outline. It fills lime once the day qualifies [sourced].
  - Tapping the streak pill opens a sheet: a large count with the bolt, two batteries and a share button, the week strip, and a stats panel ("Max streak | Lessons complete") [sourced].
- **Week strip** [sourced]:
  - 5 day circles, labelled S, Su, M, T, W, Th, F, with today's label in bold.
  - Lit days are filled lime circles with a black bolt. Future days are outlined circles with a grey bolt.
  - The window appears to start on the streak's first day [inferred].
  - Missed-day and protected-day states are not captured [gap].
- **Streak Charges:**
  - earned, not bought; up to 2 held [verified];
  - they never expire, are applied automatically, and keep the streak without extending it [verified];
  - not every completion earns one [verified];
  - shown as upright lime batteries [sourced, two captures];
  - framed as a chance to "take a break" [verified].
- **XP:**
  - scales with time and effort; repeating a completed lesson earns none [verified];
  - 2025 to 2026 captures show **+15 XP per correct problem** (the counter went 0, 15, 30) and lesson totals such as 175 [sourced, two captures];
  - one reading says repeats on a later day can earn XP [sourced].
- **Leagues:**
  - 30 learners per group, reset every Monday at 03:00 UTC, 10 tiers named after chemical elements [verified];
  - learners promote, demote or stay [verified];
  - in Hydrogen, the bottom tier, the **top 15 of 30 advance** [sourced, two captures]; Hydrogen has no demotion [inferred];
  - cut-offs for higher tiers and any demotion zone are unpublished and uncaptured [gap];
  - the countdown is in days ("6 days left") [sourced, two captures];
  - joining happens automatically on the week's first XP according to the help centre [verified], but iOS showed an unlock gate, "150 of 175 XP earned" [sourced]; the conflict is unresolved [gap].
- **League board** [sourced]:
  - ranks 1 to 3 carry octagonal gold, silver and bronze medals; rank 4 down shows plain numbers;
  - each row: rank, a solid-colour avatar with a white initial, "First L.", and XP right-aligned in grey;
  - the user's own row is filled mint (#D4F5E0) or deep green (#004E16) in dark;
  - in a preview, ranks 4 and 5 showed green numerals, which probably marks the promotion zone [inferred].
- **Restraint.** Brilliant keeps to "a few core habit formation loops including Streaks and Leagues" [verified].
- **Goals.** After day 1, a picker titled "Build a long-term habit" offers 3, 7 or 14 days ("Great", "Amazing", "Phenomenal") with "Commit to my goal" [sourced, two captures]. No daily-minutes goal was found [gap].
- **Achievements:** none documented [gap].

### 6.2 Ours

**Streak** [our choice unless tagged]:

- **Qualifying day.** 3 problems, or 1 lesson, quiz or homework set. The day boundary is local midnight [inferred].
- **Bolt.** A grey outline until today qualifies, then pear [matches sourced behaviour].
- **Rest days.** Up to 2 held, one earned per 7 qualifying days. They apply automatically and never expire.
- **Week strip.** 7 circles, Monday to Sunday (M, T, W, Th, F, S, Su). We depart from Brilliant's 5-slot window because weekly mode counts days per calendar week.
  - Lit: pear-400 fill, ink bolt.
  - Today: bold label, plus a pear-600 ring once lit.
  - Future: outlined with a grey bolt [sourced pattern].
  - Missed: outlined, empty.
  - Rest day used: outlined with the rest glyph.
- **Weekly mode** (optional): the goal is N of 7 days, with N chosen from 3 to 7. Missing days within the target does not break the streak.
- **Planned breaks.** Up to 14 days a year can be booked ahead and do not break the streak.
- **Streak goal.** After day 1, offer 7, 14 or 30 days with a plain "Set goal" button, and no superlatives.
- **Streak off.** A switch hides all streak surfaces.

**XP** [our choice]:

| Source | XP |
|---|---|
| Problem screen, first try | 15 (matches the sourced +15) |
| Problem screen, after a retry | 5 |
| Problem screen, after Show solution | 0 |
| Lesson completion | 20 |
| Quiz item correct | 15 |
| Homework set submitted | 50 + 5 per correct item |
| Topic exam passed | 200 |
| Stage exam passed | 1,000 |
| Repeating completed content | 0 |

**Mastery points (MP)** are a separate measure [our choice]. They come only from:

- first-try correct answers in quizzes, homework and exams;
- successful 7-day and 30-day redos.

MP drives the per-skill mastery map and review scheduling. XP measures activity only.

**Leagues** [our choice]:

- Off by default; opt in from You.
- Weekly groups of 30, ranked by MP, not XP.
- Ten tiers named after Greek letters: Alpha, Beta, Gamma, Delta, Epsilon, Zeta, Theta, Lambda, Sigma, Omega.
- Promotion and demotion:
  - Alpha (bottom tier): top 15 promote, nobody demotes. This matches the sourced Hydrogen rule.
  - Beta to Sigma: top 10 promote, bottom 5 demote.
  - Omega: bottom 5 demote.
  - A "no demotion" toggle is available.
- Board: ranks 1 to 3 get medals in the sourced medal colours. Our medal shape is a circle with a squared corner. Promotion-zone numerals are green. A 1px dashed divider labelled "Promotion zone" sits under the cut-off, and a second one, labelled "Demotion zone", sits above the bottom 5 where demotion applies. The user's row uses the sourced fills.
- Countdown in days, switching to hours on the last day.
- Reset Monday 03:00 UTC.

**Goals** [our choice]:

- Weekly hours goal (5, 10, 15 or 25 h), from the curriculum's 15 and 25 h/week plans [sourced, curriculum file].
- The weekly rhythm splits the goal into Main subject, Build, Review and Mental arithmetic blocks, 9/3/2/1 at 15 h [sourced, curriculum file].

**Achievements** [our choice]: competence only, at most 12. Examples: "First topic exam passed", "100 code drills verified", "Redo queue cleared", "Mental arithmetic score 40". No participation or login badges.

**Perfect lesson** [our choice]: every problem correct first try. It plays the perfect animation and adds +15 XP, and the mastery map marks the lesson.

**Notifications** [our choice]:

- At most 1 a day, at the learner's chosen time, and none after 21:00 local time.
- Plain and factual, never guilt-based. Brilliant asks permission with "I'll remind you to learn so it becomes a long-term habit." [sourced]. Our examples:
  - "Two redo problems are due. About six minutes."
  - "Your streak is on 12 days. One lesson keeps it going."
  - "The topic exam for 1.5 Probability is unlocked when you are ready."
- Never: "Don't lose your streak!", sad faces, or countdown pressure.

### 6.3 Adopt or drop

| Brilliant mechanic | Decision | Reason |
|---|---|---|
| Daily streak with a low bar | Adopt | low cost, proven habit loop [verified] |
| Earned streak protection, max 2 | Adopt as Rest days | the rest framing is healthy [verified] |
| Battery icon and "Streak Charge" name | Drop | brand guard |
| Day-1 full screen, then "Streak extended" toast | Adopt | [sourced]; quieter than a daily full screen |
| XP for effort, none for repeats; +15 per problem | Adopt | [verified]; +15 [sourced] |
| Weekly 30-person leagues on raw XP | Change: opt-in, ranked by MP | XP volume rewards guessing [plausible critique]; one reviewer called his streak chase "obsessive" [verified] |
| Element tier names and shields | Drop; use Greek letters | brand guard; quant-flavoured |
| Lesson-complete stats resolving into XP | Adopt | [verified] |
| Perfect-score moment | Adopt | [sourced] |
| Mascot cheerleader | Drop in version 1 | adult audience [our choice] |
| Daily keys, forced order, ads | Drop | personal tool; the keys drew complaints [verified] |
| Placement diagnostic and level checks | Adopt, free for all | the curriculum says to sit each stage's exit test first [sourced, curriculum file] |
| Hearts or lives | Never | Brilliant never had them either [plausible] |

---

## 7. App shell

### 7.1 Navigation

**Brilliant on mobile** (iOS, October 2025):

- A floating white pill-shaped tab bar, centred, about 70% of the screen width, with a soft shadow [sourced].
- Three tabs, each with an outline icon over a small label: **Home**, **Courses**, **You** [sourced, two captures]. The active tab gets a rounded pill fill behind its icon and label [sourced].
- No Leagues tab: the league board sits at the top of You, under the avatar, name and a settings icon [sourced].
- Lessons, practice and celebrations are full screen with no tab bar [sourced].

**Brilliant on web** (July 2026, dark) [sourced]:

- A #1E1E1E header with a 1px #4B4B4B bottom line.
- Left: wordmark, Home, Courses. The active item is white with a 2px white underline; inactive items are #A5A5A5.
- Right: a "Gift Premium" pill, the streak pill and a hamburger menu.
- The league is a Home card.

**Ours on mobile, under 768px** [our choice following the sourced pattern]:

- A floating pill tab bar, centred, about 86% of the width to fit four tabs, 64px tall above the safe area, with e2 shadow.
- 24px outline icons over 12px labels. The active tab gets an ink-on-#F2F2F2 pill fill (#2B2B2B in dark).
- Tabs:
  - **Today:** the daily plan.
  - **Learn:** catalogue and course maps.
  - **Review:** redo queue, practice, homework, exams, Notebook.
  - **You:** profile, stats, the league board (if opted in), settings.

**Ours, 768px and up** [our choice following the sourced web layout]:

- A 64px header on bg.surface with a 1px line.default bottom line.
- Left: the wordmark, then Today, Learn and Review. The active item is ink with a 2px underline.
- Right: the streak pill, the MP chip, and the avatar menu (which holds You).

**Lessons, quizzes and exams:** full screen with no shell [our choice, matching Brilliant].

### 7.2 Today (Home)

**Brilliant on mobile** (iOS, October 2025), top to bottom [sourced]:

1. The streak pill, alone at the top right: the count, then a lime bolt, in a white pill with a light grey 1px border.
2. A course hero, centred: the course title in bold sans, "LEVEL 1" below it in the course accent, and a large level illustration. It is a horizontal carousel of levels with dots and the next card peeking in.
3. "Nice work today!" after the day's activity [inferred].
4. A white card with a large radius, holding one lesson row and a full-width "Continue course" pill in the accent ("Start" on a fresh level).
5. The floating tab bar.

**Brilliant on web** (July 2026, dark), in two columns [sourced]:

- **Left column:**
  1. "Welcome, {first name}" at about 24px bold.
  2. An ask bar, "What do you want to learn?", with an Ask button.
  3. A streak card (radius about 24, 2px border): count and bolt, two batteries, 5 day circles.
  4. A league card: shield, "HYDROGEN LEAGUE", "Top 15 advance · 2 days left", three rows around the user, and an expand button.
- **Right column:**
  1. "Jump back in".
  2. A course card with two cards stacked behind it, shading from the surface at the top to the course accent at the bottom. It holds the title, "LEVEL 1", art, "Nice work today!", a lesson row and a "Continue course" pill.
  3. A row of 5 level thumbnails, with the selected one in a 2px accent border and a tick badge.

The quick-practice and recommended-courses modules in earlier notes are **not confirmed** on the 2026 Home [gap]. Whether mobile gained the ask bar is unknown [gap].

**Ours on mobile**, top to bottom [our choice unless tagged]:

1. **Top row:** the date on the left; the streak pill on the right (count, bolt, two rest-day slots) [sourced position].
2. **Course hero carousel:**
   - course title in course-title, centred;
   - "LEVEL n" overline in the track deep step below it;
   - level art on the soft wash;
   - level dots [sourced pattern].
3. **Resume card** (r-xl): the next lesson row and a full-width "Continue course" track button. After the day qualifies, the line "Done for today." [sourced pattern; copy our choice].
4. **Daily warm-up:** 10 minutes of mental arithmetic, as a timed 120-second drill with the score trend [sourced: the curriculum asks for 10 minutes a day from the first week; drill design our choice].
5. **Due:**
   - redo problems due (count and minutes);
   - homework due (date);
   - weekly probability problems (3 a week from item 1.5 on) [sourced, curriculum file].
6. **Exam card:** the next topic exam, with readiness from mastery as a percentage, and "Sit now".
7. **Search bar:** "Search topics, formulas, lessons". Not AI by default.

**Ours on desktop**, two columns [our choice following the sourced web layout]:

- **Left, 480px:**
  1. greeting (h1);
  2. search bar (pill, 2px line.default);
  3. streak card (count, bolt, rest slots, 7-day strip, weekly hours bar split by block);
  4. league card, only if opted in (badge, "ALPHA LEAGUE", "Top 15 advance · 2 days left", 3 rows, expand);
  5. Due card;
  6. warm-up card.
- **Right:**
  1. "Jump back in";
  2. the deck card, shading from bg.surface to the track soft step;
  3. level thumbnails;
  4. exam card.

### 7.3 Catalogue (Learn)

**Brilliant** [verified]:

- subject tabs with an underline in the subject accent;
- a section header with illustration; catalogue heads are bold sans at about 20 to 24 [sourced];
- course cards (art, title, progress bar);
- a "Learning Paths: step-by-step paths to mastery" list;
- retired courses moved to an Archived section.

**Ours** [our choice]:

- A **stage selector** (Stage 0, 1, 2, 3) at the top as segmented chips.
- Below it, **track tabs** (Maths, Prob & Stats, Programming, Finance, ML, Interview) with a 3px accent underline.
- Each track lists **topic cards** by curriculum number ("1.5 Probability · 250 h"), each holding its course cards.
- Course cards (r-xl, 2px line.default) show:
  - 16:10 art on the soft wash;
  - an Archivo 700 title;
  - "N lessons · M exercises" in label;
  - a 4px progress bar;
  - a state chip (Not started, In progress, Exam ready, Passed).
- A **Paths** view shows the Stage 2 tracks (Trader, Researcher, Developer) as ordered course stacks [sourced, curriculum file].

### 7.4 Course map

Brilliant (dark web screenshot, July 2026, measured; corroborated by Mobbin descriptions) [sourced unless tagged]:

- **Layout.** On web, the course card sits on the left and a 575px path column on the right. The course card has a 2px #424242 border on a #141414 page.
- **Header.** Course art; a bold **sans** title (not serif, which corrects Draft 1); a grey description (#A1A1A1); and a stats line, "22 Lessons · 220 Exercises", with icons.
- **Level card.**
  - Full column width, about 90px tall, with a page-coloured fill.
  - Accent border: 2px sides, 3px top, 7px bottom lip (#7139CC).
  - Centred "LEVEL 2" overline in the accent, with the level title below.
  - It may be sticky [inferred].
- **Path.**
  - A staggered, serpentine column, not a straight one.
  - Node centres step about 13% of the column width per node, oscillating between about 20% and 50% of the width.
  - Vertical pitch is about 1.7× the node width.
  - **No connector lines.** Smooth curve or straight runs: unestablished.
- **Nodes.**
  - Tilted 3D pucks: an elliptical top face of about 2.1:1, with a side band about 12% of the width.
  - A faint segmented inner ring on the face.
  - Done: accent face (#C19CFF), accent side (#9D62FF), a small white check.
  - Upcoming: #E5E5E5 face and #ADADAD side, with **no lock**.
  - Free users go in order; Premium users can jump to any lesson [sourced].
- **Current node.**
  - About 1.28× wider, through an 8px halo ring separated by a gap.
  - The face glows white, and the mascot floats above with a beam of light.
  - No Start tooltip. Idle motion is unknown, though likely, since the nodes are Rive [inferred].
- **Titles.** To the right of each node, about 20px sans, at most 2 lines, with a 16px gap. The current title is white; the others are #727272.
- **Level Review node.** Its shape is not established. The hexagon in Draft 1 had no source.
- **Tap.**
  - On web, a card anchored at the bottom of the path column (#1E1E1E, 2px #4C4C4C border) over a radial glow in the course colour. It holds the lesson title in bold and one full-width "Start" pill (#9D62FF face, 5px #874DE5 lip, about 65px tall).
  - On mobile, a bottom sheet with the lesson name (about 21pt bold) and one action: **Start** (current), **Practice** with a replay icon (done), or **Jump here** (ahead).
  - Mobile also shows a scroll-to-current chevron button.

Ours [our choice for sizes unless tagged]:

- **Header** as Brilliant's. The title uses course-title, the description is at most 90 characters, and the stats line has our own icons.
- **Level card** as Brilliant's: 2px sides, 3px top, a 7px bottom lip in the track lip step, and a centred overline and h2 title. It is sticky under the header.
- **Path:**
  - a smooth sine serpentine, with no connectors;
  - centres oscillate between 20% and 50% of the column width, stepping 13% of the column per node;
  - pitch is 1.7× the node width [values follow the sourced measurements].
- **Nodes:**
  - Pucks 116px wide on desktop and 92px on mobile, with a 2.1:1 top face and a 12% side band.
  - Done: the face colour from 2.5, accent side, white check.
  - Upcoming: #E5E5E5 face and #ADADAD side in light; #2B2B2B face and #1F1F1F side in dark. No lock.
  - Mastered nodes (quiz at least 80%) get a small pear star on the face.
- **Current node:**
  - an 8px halo ring in the accent at 60%, separated by a 6px gap, about 1.28× wider;
  - a white glow on the face;
  - our logo mark floats above with a soft beam;
  - a 2s breathing glow (3% scale), off under reduced motion.
- **Titles:** node-label, to the right, at most 2 lines, 16px gap. Current in text.primary, others in text.muted.
- **Special nodes:**
  - Level review: a puck with a star glyph, in a gold variant (#EDA100 side). This replaces the unsourced hexagon.
  - Homework: a puck with a clipboard glyph.
  - Topic exam: a 1.2× puck with a shield glyph, at the end of the last level.
- **Tap:**
  - On desktop, a bottom card in the path column over a radial glow of the track soft step, with the title and one track button.
  - On mobile, a bottom sheet with the title in sheet-title, "12 screens · about 12 min", the best quiz score, and one action:
    - Start (current);
    - Practice with replay (done);
    - **Jump here** (ahead). Jumping offers a 5-item level check first, and skipping the check still allows the jump [our choice: a free version of Brilliant's level checks].
- **Scroll-to-current** chevron button [sourced pattern].

### 7.5 Profile and stats (You)

**Brilliant.** On iOS, You opens with the avatar, the name and a settings icon, then the league board [sourced]. The rest of the page is undocumented [gap].

**Ours** [our choice]:

- **Header:** avatar, name, current stage, hours this week against the goal.
- **League board**, if opted in.
- **Mastery map:** a grid of skills per topic. Each cell is shaded on a single-hue sequential ramp by mastery, with a tooltip and a table view.
- **Streak calendar:** a 12-week heatmap, with the longest streak and lessons completed [sourced pattern from the streak sheet].
- **Exam history:** date, score, pass mark and a link to review.
- **Drill record:** verified drills by topic.
- **Export:** a downloadable PDF record of exams and drills.
- **Settings:** theme, motion, sound, haptics, reminders, weekly goal, streak mode, leagues opt-in, keyboard shortcuts, data export and reset.

### 7.6 Onboarding

**Brilliant.** Its mobile onboarding runs to about 12 steps [verified]:

- A splash with the serif headline [sourced].
- One question per screen (goal, comfort level, schedule), with a reaction to each answer [sourced]:
  - In October 2025, questions sat in a mascot speech bubble: about 16pt bold sans, pale yellow fill, yellow-green border. Answer rows were about 17pt regular [sourced].
  - A July 2026 capture reports a "full-bleed serif question" [sourced, single weak source].
- Statement screens in bold sans at about 24 to 25, centred ("You'll fit right in", "You're on your way!") [sourced].
- Placement through real problems [verified].
- A loader, "Finding learning path recommendations…" [sourced], which may be the tangram loader [plausible].
- A learning-plan preview [sourced].
- Sign-up, then a soft trial paywall with serif headlines [verified; serif sourced].
- The first lesson, then the streak commitment [sourced].

Critics flag the sign-up and paywall walls that come before any real learning [verified].

**Ours.** 8 screens, no paywall, account optional and local-first [our choice]:

1. **Welcome.** A display-token Besley headline: "Zero to quant, one problem at a time." Primary "Start" (neutral action); secondary "I have an account".
2. **Goal.** The question is set full-bleed in the display token: "What are you aiming for?" Options: Trader, Researcher, Developer, Not sure yet, Refresh my maths. These map to the curriculum's Stage 2 tracks [sourced, curriculum file]. The serif framing question follows the 2026 report [inferred].
3. **Starting point.** Arithmetic, GCSE, A-level or University maths. Then Python: Never, Some or Comfortable. Answer rows in body, 60px tall, 2px borders.
4. **Placement.** 5 to 8 adaptive interactive problems drawn from the stage exit tests, with no colour feedback during the problems and a summary at the end. A learner may sit a full stage exit test instead, to skip that stage [sourced, curriculum file].
5. **Week.** Hours per week (5, 10, 15 or 25) and a reminder time.
6. **Loader.** "Building your plan", with the tangram-style loader, for 2 to 3s.
7. **Your plan.** Stage, first topic, first course, an estimated finish at the chosen pace, and the four weekly blocks. Statement in course-title.
8. **First lesson.** It starts at once. Account creation is offered after the lesson summary, for sync.

---

## 8. Curriculum architecture

### 8.1 Brilliant's structure

| Fact | Detail | Evidence |
|---|---|---|
| Hierarchy | Path, then Course, then Level, then Lesson, then Exercise (screen) | [verified] |
| URL pattern | `/courses/{course}/{level}/{lesson}/{step}/?from_llp={path}` | [verified] |
| Course size | 22 to 68 lessons and 220 to 900 exercises | [verified] |
| Level size | 4 to 7 lessons, ending in a Level Review | [verified] |
| Catalogue | 4 subject tabs, 10 Learning Paths, about 40 to 60 live courses | [verified] |
| Per lesson | each lesson has practice sets | [verified] |
| Personalised practice | predicts "the optimal next problem X" to prepare for a future problem Y | [verified] |
| Placement | a light diagnostic at sign-up | [verified] |
| Jumping ahead | gated by level checks; Premium can open any lesson, while free users go in order | [verified]; order rule [sourced] |
| Difficulty | authored by hand: "progressively harder problem solving", a deliberate difficulty curve per core game | [verified] |
| Authoring | humans design the "core story or pedagogy for every single concept"; AI builds from modular, API-exposed interactive components; every configuration must be "a correct, solvable, meaningful puzzle" | [verified] |

### 8.2 Ours

```
Stage (0 to 3)                   from the curriculum file, closed by the exit test
 └ Topic (numbered item, e.g. 1.5 Probability, 250 h)   closed by the topic exam
    └ Course (1 to 4 per topic, 20 to 45 lessons each)
       └ Level (4 to 7 lessons + Level review + Homework)
          └ Lesson (8 to 12 screens, 10 to 15 min) + Lesson quiz (3 to 5 items)
             └ Screen (one task)
Daily: mental arithmetic warm-up · Weekly: 3 probability problems (from 1.5) · Always: Redo queue
```

- **Hierarchy:** Stage, Topic, Course, Level, Lesson, Screen [our choice]. Stages and topics come straight from the curriculum file [sourced].
- **URL scheme:** `/learn/{stage}/{topic}/{course}/{level}/{lesson}/{screen}`, with practice at `/review/{topic}/{set}` [our choice, mirroring Brilliant's pattern].
- **Assessment ladder** [our choice; gates sourced from the curriculum file]:

| Layer | Format | Pass rule |
|---|---|---|
| Lesson quiz | 3 to 5 items, no hints, one attempt | 80% marks the lesson Mastered. Below that, items are added to the Redo queue. Never blocks. |
| Level review | 6 to 10 mixed items from the level, spaced and interleaved | none; feeds mastery |
| Homework (per level) | 6 to 12 problems, including at least 1 long-form item (derivation, proof ordering, or a written answer marked against a rubric) and at least 1 code drill; due in 7 days | Auto-marked. Long-form items are self-marked against a model answer with a 10-point rubric, as in the user's lesson-creator skill. |
| Topic exam | 45 to 90 min, timed, no hints, no retries, mixed formats | 70% to complete the topic; can be sat first to test out |
| Stage exam | the curriculum exit tests rebuilt in-app. Stage 0: a GCSE Higher style paper at 80%, a precalculus test at 85%, mental arithmetic 25 or more, and a script that runs. Stage 1: finals-style papers at 70%, and 150 algorithm problems solved. | as listed; sit first to skip the stage [sourced, curriculum file] |

- **Time budget.** The curriculum totals about 3,100 hours [sourced]. Lessons are the interactive core. Homework, drills, projects and exams carry most of the hours. The curriculum's rule that at least 60% of time goes on solving [sourced] holds, because lessons are themselves solving.
- **Tracks in Stage 2.** Trader, Researcher and Developer change which courses are core and which are optional [sourced, curriculum file].

### 8.3 Lesson sequencing pattern

Brilliant introduces a concept with a problem at the edge of the learner's understanding, one that needs "a small mental leap". The name and formal rule come after the learner has manipulated the idea [verified]. Constraints are added one at a time [sourced].

Ours [our choice, built on the verified pattern and the user's maths-teaching skill]:

1. **Hook:** a problem the learner can attempt by intuition, on a canvas.
2. **Explore:** free manipulation, then one observation question.
3. **Name:** introduce the term and notation, defined by what the learner just did.
4. **Ladder:** 2 to 4 screens on the same canvas, each adding one constraint.
5. **Trap:** the most common misconception, met and resolved.
6. **Generalise and derive:** the formal statement in KaTeX, derived step by step. The learner completes at least one line.
7. **Transfer:** the same idea in a quant context (a bet, a price path, a portfolio, a dataset).
8. **Summary**, then the **Lesson quiz**.

### 8.4 Difficulty ramp

Every item carries a difficulty from 1 to 5 [our choice]. Brilliant's legacy problems were rated on levels 1 to 5 [plausible].

| Context | Difficulty |
|---|---|
| Lesson screens | 1 rising to 3 |
| Quiz | 2 to 3 |
| Level review | 2 to 4 |
| Homework | 3 to 5, with at least one item at 5 |
| Topic exam | 20% at 2, 50% at 3, 20% at 4, 10% at 5 |

- **Ordering.** Courses are ordered by dependency within a topic. Topics follow the curriculum's numbering, where each item builds on the one before [sourced, curriculum file].
- **Practice selection.** Practice and review sets interleave concepts. They weight the next problem towards the lowest-mastery skills that are due for review [verified pattern]. The algorithm is [our choice]: an Elo-style skill score with Leitner-style intervals of 1, 3, 7 and 30 days.

---

## 9. Teaching style

### 9.1 How a concept is introduced

- **Puzzle first.** Ask before telling. Brilliant: "We don't teach how to do something before asking questions" [verified].
- **Manipulation before notation.** The learner acts on a visual model (bar model, balance, area model, simulator) before any symbols appear [verified].
- **The rule describes what the learner did.** The generalisation screen rephrases the learner's own steps as the rule [sourced].
- **Concreteness fades.** The visual shrinks and then disappears across ladder steps and practice [verified for practice; plausible within lessons].
- **From the user's maths-teaching skill** [our choice to adopt]:
  - show why the direct approach fails before the creative step;
  - derive rather than state;
  - build towards a single "aha" line;
  - typeset all maths in KaTeX;
  - British English throughout.
- **From the user's lesson-creator skill** [our choice to adopt]:
  - every lesson includes one Common Trap and one edge case;
  - worked examples contain a decision point where a naive approach fails;
  - long-form answers are marked out of 10 against a full model answer.

### 9.2 Voice and tone

**Brilliant's in-product copy** is short, second-person and warm [sourced]:

- "Alright, try this one."
- "One more."
- "Correct!"
- "Not quite right."
- "Yeah, that's it."
- "That's it!"
- "Not quite, but that's okay! If you're not making mistakes, you're not learning."
- "Give it another shot."
- "Give it one more shot."
- "Nice work today!"

Its brand voice has some wit [verified: the mascot is "a sentient particle born from the Big Bang"]. In 2026 it leans towards children and parents [verified], and its scope is "grade 5 to college and beyond" [verified].

**Ours.** An adult learner and a knowledgeable friend [our choice]. The rules:

- Second person for instructions; "we" for reasoning together, a convention from the user's maths-teaching skill.
- Sentences of at most 20 words, one idea per sentence.
- Honest about difficulty. Never praise the question.
- No exclamation marks.
- No emoji in lesson copy.
- British spelling.
- Name a term only after it has been used.
- Numbers carry units, and money uses £ or $ consistently within a course.

### 9.3 Five example lines

1. "Drag the strike until the payoff kinks at 105. What does the call pay if the stock finishes at 120?"
2. "Not quite right. You added the two chances, but the double six is counted twice. Look at the corner cell."
3. "That works for one coin. Try three before you trust it."
4. "You just computed a conditional probability without the formula. Here is the formula: it says exactly what you did."
5. "Most people get this wrong first time. Take two tries before you open a hint."

### 9.4 Explanation conventions

- **Timing:** after the attempt, never before [verified pattern].
- **Length:** at most 3 sentences plus one annotated diagram state [our choice].
- **Maths layout:** displayed equations in KaTeX, with `aligned` for derivations [our choice]. Each derivation line gets a short justification in the right margin on desktop, or below the line on mobile [our choice].
- **Notation** [our choice]:

  | Object | Convention |
  |---|---|
  | Random variables | capitals |
  | Realisations | lower case |
  | Vectors | bold lower case |
  | Matrices | bold capitals |
  | Probability | P(·) |
  | Expectation | E[·] |
  | Variance | Var(·) |
  | Logarithm | ln for the natural log |
  | Percentages | prose only; maths uses decimals |

  A notation card for each topic lives in the Notebook.
- **Worked solutions:** each step is labelled with its justification. No "it can be shown". From the user's lesson-creator skill [our choice to adopt].
- **Code explanations:** annotate only the non-obvious lines. When the lesson is about a pitfall, show the failing version beside the fix [our choice].
- **Accepted-answer rule:** shown after grading, for example "Accepted: any form equal to 1/6, or 0.1667 ± 0.0005" [our choice].

---

## 10. Known critiques and our improvements

Every value in the "Our response" column is [our choice] unless it carries another tag.

| Critique | Evidence | Our response |
|---|---|---|
| Builds intuition but too shallow to replace a textbook: few proofs, little derivation | Reddit threads 2024 to 2026; Brilliant replied in February 2026 promising calculus improvements [plausible] | Derive and Order-steps screens; a long-form homework item per level; topic exams with written items; Notebook formula cards |
| Coverage stops near the foundations; the tutor launched on foundational courses only, with Calculus "later in 2026" | [verified] | The curriculum runs to stochastic calculus, time series, ML, research papers and interview prep [sourced, curriculum file] |
| No exams or certificates; the hardest test is a low-stakes practice set or a level check | No credentials; level checks give "no grade, course credit, transcript" [verified] | Timed topic and stage exams with pass marks taken from the curriculum exit tests; an exportable record. This is not accreditation, and we say so. |
| Ambiguous or wrong answer keys: "figure out which answer the app wanted" | single review [plausible]; Brilliant's own eval post on AI-generated puzzles that cannot be solved [verified] | Machine verification of every answer (tolerance, symbolic equivalence, unit tests); the accepted-answer rule shown; a flag on every item; each item ships with a solver test in CI |
| Retry-until-green lets learners guess through | mechanics [verified]; harm [plausible] | First-try mastery points separate from XP; multiple choice at most 40% of lesson items; more expression, numeric and code items |
| Learning is "one-way", with no help when stuck | [verified review summary] | Three-rung hint ladder; Show solution after 2 attempts; worked solutions everywhere; optional AI explainer later |
| No reference material; revisiting means redoing lessons | Redo and Review exist [verified]; the complaint [unverifiable] | A Notebook of formula cards, a glossary, searchable lesson summaries |
| Lessons cannot be used offline | help article, October 2025 [sourced] | Local-first PWA: lessons, Pyodide and KaTeX cached; sync when online |
| Sound effects are annoying; tutor motion and noise are distracting | [sourced] | Sound off by default on web; a Motion setting; one-tap mute in the lesson |
| No accessibility statement, and shipped colour pairs fail WCAG AA: white on #49D470 is 1.9:1, #746026 on #F8CC45 is 4.0:1, green text #009B2B is about 3.7:1, dimmed #7F7F7F is about 4.0:1, the flag icon #CCCCCC is 1.6:1 | no statement [verified]; ratios computed from [sourced] pixels | Same fills with ink labels and darker text steps (2.3, 2.4); WCAG 2.2 AA target; keyboard paths for every interaction; an ARIA live region for verdicts; text and table views for every chart; colour always with an icon and a label; a published statement |
| Free tier gated by daily keys, forced order and ads; trial and renewal complaints | [verified] | None of these; local-first and personal |
| Volume-driven leagues and streak pressure | "obsessive" [verified] | Leagues opt-in and ranked on mastery points; weekly streak mode; rest days; a streak-off switch |
| Child-leaning 2026 brand | [verified] | Adult copy, no mascot in version 1, finance-grade charts |
| The "6x" efficacy claim rests on a correlational MOOC study, not a trial of Brilliant | [verified] | Cite primary studies only; make no multiplier claims |
| **Homework missing** | no Brilliant homework exists [inferred] | Per-level homework with due dates and spaced redo at 7 and 30 days [sourced, curriculum file] |
| **Code drills not verifiable** | Brilliant's coding is mostly block and puzzle based [verified] | Pyodide drills with visible examples and hidden tests; fixed random seeds; `math.isclose` tolerances (rel 1e-9 unless stated); a 5s time limit; a diff view of expected against actual; the first failing test shown with its input. C++ drills are a gap (section 12). |

---

## 11. Evidence table: 30 key claims

| # | Claim | Verdict | Source |
|---|---|---|---|
| 1 | Brand refresh by Koto LA with Brilliant's in-house team, begun autumn 2023, launched April 2024 | Confirmed | pcho.medium.com/a-brilliant-brand-refresh-4af021c11486; logos.fandom.com/wiki/Brilliant |
| 2 | "Lighter, brighter" palette and a pear spectrum for primary CTAs and streaks; no hexes published. No in-product pear CTA observed in 2025 to 2026 captures | Confirmed (CTA use not observed) | pcho.medium.com; github.com/informach/sistema-zero |
| 3 | CoFo Sans (customised, served as "CoFo Brilliant") across the product; CoFo Robert at the splash, on paywall headlines and on marketing only. The claim of serif course and Home titles is refuted | Confirmed; serif-in-product refuted | pcho.medium.com; github.com/vascodegraaff/KoalaSleep (design/app-flow/brilliant-2025-10); github.com/patiHash1/shomonnoy; github.com/chekos/pedagogical-engine |
| 4 | Brandfetch's #29CC57 matches the 2026 lesson progress-bar fill | Confirmed (two sources) | brandfetch.com/brilliant.org; github.com/informach/sistema-zero |
| 5 | "No videos, and everything is interactive" | Confirmed | pcho.medium.com |
| 6 | The learner does the work before the explanation; a wrong answer changes the diagram to show why | Confirmed | beginnersinai.org/brilliant-explained |
| 7 | Diagrams are written in Diagrammar (Elm, SVG) with author-declared sliders and drag locators | Confirmed | thestrangeloop.com/2022/diagrammar-simply-make-interactive-diagrams.html |
| 8 | Rive State Machines run the streak and path; a Rive Event syncs the streak count to the animation | Confirmed | rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations |
| 9 | Path nodes are colour-coded by topic, with many colour variants and node types | Confirmed | rive.app (as above) |
| 10 | ustwo's 10-week "Game Feel" project balanced fun against the concentration STEM needs | Confirmed | ustwo.com/work/brilliant |
| 11 | Wrong answers prompt a retry, with no points docked and no reprimands | Confirmed | brilliant.org/help/schools-and-educators/how-brilliant-fits-into-a-math-lesson |
| 12 | Practice sets remove scaffolding and use spacing and interleaving | Confirmed | brilliant.org/about |
| 13 | Check is disabled (flat #F2F2F2, no lip) until the first interaction. The lesson progress bar is one continuous 12px bar in #29CC57 followed by grey pills | Disabled Check: sourced, two captures. "Segmented bar": refuted | github.com/lohjo/innopoly-financial-literacy; github.com/informach/sistema-zero; github.com/doum6to/QuranLab- |
| 14 | Correct: green frame (#5ED981), green Continue (#49D470), Why?, +15 XP. Not yet: amber frame (#F9D25C), Get help and Try again (#F8CC45) | Sourced, two captures; copy differs between captures | github.com/lohjo/innopoly-financial-literacy (docs/plans/2026-07-17-001-brilliant-replicate.md); github.com/informach/sistema-zero (docs/research/brilliant-2026-09-12) |
| 15 | A streak day takes 3 problems or 1 full lesson | Confirmed | brilliant.org/help/using-brilliant/what-is-a-streak |
| 16 | Streak protection is earned, max 2, never expires, applies automatically, and is shown as batteries | Confirmed | help.brilliant.org/en/articles/8507079-streak-charge-faq |
| 17 | Leagues: 30 learners, Monday 03:00 UTC reset, 10 element-named tiers, three outcome animations | Confirmed | brilliant.org/help/features/what-are-leagues-and-leaderboards; popandstrange.com/popfolio/brilliant-org |
| 18 | XP scales with effort, and repeating a completed lesson earns none. Captures show +15 per correct problem | Confirmed; +15 sourced, two captures | brilliant.org/help/using-brilliant/what-is-xp; github.com/informach/sistema-zero; github.com/doum6to/QuranLab- |
| 19 | Lesson complete shows the mascot and staggered stat badges that resolve into XP | Confirmed | 60fps.design/apps/brilliant |
| 20 | Hierarchy: Path, Course, Level, Lesson, Exercise; levels of 4 to 7 lessons plus a Level Review | Confirmed | github.com/ANFAIA/SkillNet (brilliant-learning-patterns) |
| 21 | Courses run 22 to 68 lessons at 7.4 to 13.2 exercises per lesson | Confirmed | github.com/stafawashere/growth; github.com/doum6to/QuranLab- |
| 22 | Course map: a serpentine column of tilted 3D puck nodes with no connector lines and no lock glyph. The current node has a halo and the mascot above it. Tapping gives a bottom card or sheet (Start; Practice; Jump here) | Sourced (one dated web screenshot, measured), corroborated by Mobbin descriptions | github.com/lohjo/innopoly-financial-literacy (commit 5777c93); github.com/doum6to/QuranLab- |
| 23 | A placement diagnostic at sign-up; level checks gate jumping ahead (Premium) | Confirmed | brilliant.org/help/courses-and-curriculum/course-placement-guide |
| 24 | AI tutor announced 29 May 2026: Socratic, draws on the canvas, "never, ever just hands you the answer" | Confirmed | blog.brilliant.org/a-world-class-tutor-in-every-home; x.com/suekhim/status/2060378988606878147 |
| 25 | "No dark mode launched" is false: by mid-2026 the web app supports light and dark through CSS `light-dark()`, with a #141414 page | Original claim refuted; correction sourced, two captures | github.com/patiHash1/shomonnoy (design-reference-brilliant.md); github.com/lohjo/innopoly-financial-literacy |
| 26 | Lesson buttons are full pills (48px face, radius 24) with a 4px hard darker bottom lip; disabled has no lip and sits 4px lower; option cards are flat with 2px borders; code chips are lipped | Sourced, two captures | github.com/informach/sistema-zero (screenshots and globals.css "O 3D DO BRILLIANT"); github.com/lohjo/innopoly-financial-literacy |
| 27 | In-lesson CTAs are never pear: neutral #565656, correct #49D470, Try again #F8CC45. Pear appears on the streak bolt (#BBCC00 light, #D8E82E dark), charges and the mascot | Sourced; coloured fills may be hover states | github.com/informach/sistema-zero; github.com/lohjo/innopoly-financial-literacy (commit 5777c93) |
| 28 | Desktop lesson: a 540px content column inside a near-full-screen card (32px margins, radius 24, 2px #E5E5E5); buttons bottom-centre in a 366px group; flag and sound top-left in the card; feedback in a mascot bubble at bottom-left | Sourced, measured; sound placement corroborated by the help centre | github.com/informach/sistema-zero; brilliant.org/help/features/how-does-koji-work |
| 29 | Mobile tabs are Home, Courses and You in a floating pill bar. Leagues sit on You on mobile and as a Home card on web | Sourced, two captures | github.com/vascodegraaff/KoalaSleep (Mobbin set, October 2025); github.com/lohjo/innopoly-financial-literacy (Home screenshot, July 2026) |
| 30 | Hydrogen League: the top 15 of 30 advance; the countdown is shown in days | Sourced, two captures | github.com/vascodegraaff/KoalaSleep (s077, s100); github.com/lohjo/innopoly-financial-literacy (Home screenshot) |

**Do not use these** (refuted, misattributed or unsupported):

- the "Correct Answer Words Morph" shot, which is Elevate's [verified];
- the flame streak icon [unsupported];
- "How AI Works" as a course title [unsupported];
- "Brilliant has no mascot" [refuted];
- the brilliant.design tokens [unrelated company];
- serif course titles, Home titles and "Lesson Complete!" in serif, as the QuranLab repo claimed [refuted];
- a segmented lesson progress bar, or a progress fill in the course accent [refuted];
- a pear Check or Continue button [unsupported in all captures];
- a hexagon Level Review node [unsupported];
- connector lines on the course map, and lock glyphs on upcoming nodes [refuted];
- a 6px feedback glow, and an XP chip flying to the counter [unsupported; lohjo's own design tokens];
- the "Show solution", "See solution", "Incorrect" and "Show explanation" strings as 2025 to 2026 Brilliant copy [unsupported].

---

## 12. Open gaps

**Unknown Brilliant facts.** All are filled with [our choice] values above. Confirm them against live screenshots before treating any mockup as a faithful recreation.

1. **Hexes still missing:**
   - the pear ramp beyond the two bolt colours;
   - course accents other than the measured purple;
   - the enabled Check before grading;
   - the default and selected-before-Check option cards;
   - dark-mode lesson frame values;
   - whether the measured button fills are resting or hover colours.
2. **Button geometry on native apps.** Web geometry is closed. Native iOS and Android in light mode, and node puck depth on mobile, are not captured.
3. **Motion:** all easing curves, spring constants and durations; the screen-to-screen transition; the progress fill animation; idle motion on the current node.
4. **Sound and haptics:** sound assets, haptic patterns, and the default sound state.
5. **Solution reveal:** whether any solution reveal exists after repeated wrong answers.
6. **Hint timing:** whether hints are available before the first attempt or only after a wrong one. Whether "Get help" existed before the May 2026 tutor launch.
7. **Breakpoints and wide screens:** breakpoints; whether the lesson card or column grows beyond 1366px; whether long content scrolls inside the card.
8. **Lesson progress bar:** what its trailing grey pills mean.
9. **Week-strip states:** missed-day and protected-day states. How the strip scrolls for long streaks.
10. **League rules:** cut-offs above Hydrogen; the demotion zone and divider styling; whether the countdown switches to hours; tier badge colours other than Hydrogen's; the conflict between the iOS unlock gate and the help centre's first-XP rule.
11. **Level Review node:** its shape and colour.
12. **Home modules:** what sits below the first 1080px of web Home; whether mobile Home has the ask bar.
13. **Profile:** the contents of You beyond the header and league board; whether achievements exist.
14. **Maths engine:** the engine behind the TeX-style rendering.
15. **Illustration:** the illustration style after 2024 (whether PIX survives), and tab icon stroke weights.
16. **Dark mode:** parity on iOS and Android, and the launch date.
17. **Onboarding:** the order after the May 2026 tutor launch; whether framing questions moved to the serif (single weak source).
18. **Marketing hero:** whether the September 2026 hero declared as CoFo Robert renders as a serif or as a sans variant.

**Build risks to test:**

19. **Fonts:** Archivo's tabular figures and fraction features at our sizes. Besley next to Archivo on the Welcome and onboarding screens.
20. **Expression grading:** MathLive and Compute Engine equivalence on edge cases: domains, simplification, ± forms.
21. **Pyodide cold start:** about 10MB on mobile. It needs a preload during the lesson title screen.
22. **C++ drills:** curriculum item 1.9 cannot run in the browser without a WebAssembly toolchain or a server. Undecided.
23. **Brand review:** the tangram loader, the serpentine puck path and the lipped-pill buttons are distinctive Brilliant patterns. They seem generic enough to reuse, but a brand review should confirm.
24. **Contrast:** ink labels on green and amber depart from Brilliant's look. Check the visual weight in mockups.

**Decisions needed from the user before the Stage 1 mockups:**

25. **Name and logo:** the app name ("Zero to Quant" is a working name), the logo mark and the wordmark.
26. **Mascot:** none in version 1 (recommended), or a subtle abstract companion. Its slots (verdict chip, current-node marker, hint button) are filled either way.
27. **Leagues:** opt-in and ranked on mastery points (recommended), or off entirely.
28. **Sound default:** off on web (recommended).
29. **AI explainer:** whether it is in scope for version 1.
30. **Theme:** light-first with dark as an equal theme (recommended), or a dark-first look matching Brilliant's 2026 web captures.
31. **Contrast against fidelity:** ink labels on green and amber buttons and darker text steps (recommended, WCAG AA), or Brilliant's exact white and olive labels.
32. **Desktop lesson layout:** Brilliant's near-full-screen card with a 540px column (recommended for fidelity), or a narrower centred card.