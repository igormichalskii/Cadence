# UI guide

Visual companion to `CLAUDE.md`. Reread at the start of any session that involves building or modifying UI. Captures locked design decisions about tokens, components, layouts, and microcopy patterns. The four key screens (Today, Morning Check-in, Goal Detail, Weekly Pulse) are specified in §6 with hardcoded Phase 1 content.

---

## 1. Design direction

- **Dark mode by default.** Morning PC startup, evening check-ins, easier on tired eyes. Light mode exists but is a later toggle, not v1 priority.
- **Warm amber accent, used sparingly.** Single accent color. Reserved for primary actions, selected states, and emphasis. Never decorative.
- **Quiet UI, high signal.** No gradients. No drop shadows. No decorative illustrations. Minimal chrome. The screen exists to show data and JARVIS's voice, nothing else.
- **Mobile-first.** Designed for ~340px content width on phones. Scales to ~480-640px max-width container on desktop, centered. Don't fill desktop edge-to-edge — feels like a respect-the-user app, not a dashboard.
- **Sentence case everywhere.** Never Title Case, never ALL CAPS except for section labels (which use letter-spacing as the affordance).

---

## 2. Tokens

### Colors — dark mode (default)

```
--bg-base:        #0e0e0d      /* page background */
--bg-surface:     #1a1a18      /* cards, raised elements */
--bg-elevated:    #232321      /* secondary surface on top of surface */

--text-primary:   #f0eee8      /* headings, body, primary text */
--text-secondary: #a8a59c      /* subtitles, supporting text */
--text-tertiary:  #6e6c66      /* section labels, captions, placeholders */

--border-subtle:  rgba(255, 253, 245, 0.06)   /* card edges, dividers */
--border-default: rgba(255, 253, 245, 0.12)   /* hover, focused */

--accent:         #ef9f27      /* warm amber — primary action, emphasis */
--accent-fg:      #0e0e0d      /* text on accent fill */

--success:        #5fa563      /* "done" in heatmap, positive trend */
--success-bg:     #1e2a1e      /* card backgrounds for success state */
--success-text:   #a3d4a6      /* text on success-bg */

--warning:        #ef9f27      /* "drifting" status — same as accent */
--warning-bg:     #2a1f0a
--warning-text:   #fbcb7e

--danger:         #d65a47      /* "questioning" status, drift miss */
--danger-bg:      #2a1411
--danger-text:    #f0a193

--neutral-bg:     #2a2826      /* "life miss" in heatmap, info pills */
```

### Colors — light mode (later, post-alpha)

Mirror structure with inverted lightness. Don't build until dark mode is final.

### Typography

Font: `Inter`, fallback to system sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`). Inter is free, modern, legible at all sizes, and feels JARVIS-appropriate.

Two weights only: **400 (regular)** and **500 (medium)**. Never 600 or 700 — too heavy against the quiet UI.

| Use | Size | Weight | Notes |
|---|---|---|---|
| Screen title / greeting | 22px | 500 | h1, line-height 1.25 |
| Card title | 14px | 500 | inside cards |
| Body | 13px | 400 | most text |
| Subtitle / supporting | 12px | 400 | under titles, captions |
| Tertiary / hint | 12px | 400 | `--text-tertiary` color |
| Section label | 11px | 500 | uppercase, letter-spacing 0.8px, `--text-tertiary` color |
| Numeric metric | 20-22px | 500 | for tile numbers, adherence % |

Body line-height: 1.5. Card text line-height: 1.4-1.5. Don't go tighter.

### Spacing

4px base unit.

| Token | px | Use |
|---|---|---|
| `space-1` | 4px | inline gap, icon-to-text |
| `space-2` | 8px | between related elements |
| `space-3` | 12px | card internal padding |
| `space-4` | 14-16px | card padding, button padding |
| `space-5` | 18-22px | between sections |
| `space-6` | 24px | major section gap |

### Radii

| Token | px | Use |
|---|---|---|
| `radius-sm` | 4px | inline elements, heatmap cells |
| `radius-md` | 8px | cards, buttons, inputs |
| `radius-lg` | 12px | bigger surfaces, modals |
| `radius-pill` | 16px+ | chips, status badges |
| `radius-circle` | 50% | check-circle buttons, ask tab indicator |

### Borders

`0.5px` solid `--border-subtle` for cards and dividers. Not 1px — looks heavier than intended on retina. `1px dashed --border-default` for the quick-capture input and "today pending" heatmap cell.

### Iconography

Use [Tabler Icons](https://tabler.io/icons) (outline set, not filled). Sizes:

- Inline with text: 14-16px
- Nav icons: 19-20px
- Standalone decorative: 18-22px

Common icons used in the app: `IconSun` (Today), `IconTarget` (Goals), `IconMessageCircle` (Ask, AI observations), `IconChartBar` (Insights), `IconActivity` (Pulse), `IconClock` (anchor time), `IconArrowLeft` (back), `IconDots` (overflow menu), `IconPencil` (edit), `IconPlus` (capture), `IconPlayerPause` (pause goal), `IconX` (close), `IconTrendingUp`, `IconClockExclamation`, `IconAlertCircle` (observation kinds).

No emoji. Ever.

---

## 3. Layout primitives

### Viewport

- Mobile: full width.
- Desktop: max-width 480px container, centered on the page. The app is intentionally narrow on desktop — same one-thumb shape as mobile, just framed in a wider page.
- Content padding inside the container: 20px horizontal, 18px top/bottom.

### Status bar (mobile PWA)

When installed as PWA, iOS shows its own status bar — don't reimplement it. The mockups in the sketch phase showed a fake status bar; in real implementation, just leave a `safe-area-inset-top` worth of padding.

### Bottom nav (mobile)

Fixed bottom, 5 tabs in this order: **Today · Goals · Ask · Insights · Pulse**.

- Height: ~56px content + `safe-area-inset-bottom`.
- Background: `--bg-base` with a `0.5px solid --border-subtle` top border.
- Each tab: vertical stack of icon (19-20px) + label (10px). Active tab uses `--text-primary`; inactive tabs use `--text-tertiary` at full opacity (not faded).
- **Ask is centered and slightly emphasized**: wrap its icon in a 38px circle with a `0.5px solid --border-default` border. Sits a few pixels higher than the others. This is the "summon JARVIS" affordance.

Bottom nav is hidden on focused flow screens (Morning Check-in, Weekly Pulse, Goal Detail). Those use back navigation or close button instead.

### Desktop nav

Same 5 destinations, but as a sidebar or top bar (TBD in Phase 1). Use whatever's simpler to ship first.

---

## 4. Components

### Goal card (Today screen)

```
┌─────────────────────────────────────────┐
│ Goal name · qualifier              [○]  │  ← title row + action
│ ⏱ 07:00 · neighborhood loop             │  ← anchor (time + place)
│ Habit · 5 of 7 days on track this week  │  ← why / context
└─────────────────────────────────────────┘
```

- Container: `--bg-base` with `0.5px solid --border-subtle`, `radius-md`, padding `13px 14px`.
- Title: 14px medium, `--text-primary`.
- Anchor row: 12px regular, `--text-tertiary`, with `IconClock` (12px) prefix.
- Context line: 12px regular, `--text-secondary`. Format: `[Type] · [why this matters now]`.
- Action button (right side, top-aligned): 22px circle, `1.5px solid --border-default`, transparent fill. Tap to mark done; filled with `--accent` when complete with a checkmark.
- For project goals: replace the check circle with a small text block showing "2h · 14:00" (duration · scheduled time).

### Chip — single-select (Energy)

Used for the morning check-in Energy row. Three options: Low / Mid / High.

- Full-width row, `display: grid`, 3 equal columns, 6px gap.
- Each chip: padding `10px 0`, `radius-md`, `0.5px solid --border-subtle`, transparent background, 13px regular, `--text-primary`.
- Selected state: background `--text-primary`, text `--bg-base`, weight 500.

### Chip — multi-select (Mind)

Pill chips that wrap. Used for Mind state in morning check-in.

- `display: flex; flex-wrap: wrap; gap: 6px`.
- Each chip: padding `8px 13px`, `radius-pill` (16px), `0.5px solid --border-subtle`, transparent background, 13px regular.
- Selected state: background `--text-primary`, text `--bg-base`, weight 500.

(In both chip variants the selected state currently uses inverted neutral, not accent. Reserve accent for primary actions and emphasis only.)

### Status badge

Small pill in the corner of pulse review cards. Three variants:

| State | Background | Text |
|---|---|---|
| `On track` | `--success-bg` | `--success-text` |
| `Drifting` | `--warning-bg` | `--warning-text` |
| `Questioning` | `--danger-bg` | `--danger-text` |

Padding `2px 7px`, `radius-pill` (10px), 10px weight 500, uppercase.

### AI observation card

The visual signature of JARVIS speaking.

- Container: `--bg-surface` background, `radius-md`, padding `12px 14px`.
- Layout: 16px icon left + text right, `gap: 10px`.
- Icon: 16px Tabler icon in `--text-secondary`. Choose by observation kind: `IconMessageCircle` (general), `IconTrendingUp` (positive pattern), `IconClockExclamation` (timing/estimation), `IconAlertCircle` (drift/concern).
- Text: 13px regular, `--text-secondary`, line-height 1.5.

### Metric tile

Used on Today ("This week") and Pulse ("The numbers").

- Container: `--bg-surface`, `radius-md`, padding `11-12px`.
- Top row: 11px label in `--text-secondary`.
- Value: 20-22px medium, `--text-primary`, line-height 1.
- Optional: trend arrow inline with value (`↑ 11` in `--success-text`, `↓ 3` in `--danger-text`).
- Optional bottom row: a tiny inline bar or 7-segment sparkbar (12-14px tall) showing the metric's recent trajectory.

Use in 2-column or 2x2 grid with 8px gap.

### Section label

Small caps label that introduces a section. Reuse everywhere.

- 11px medium, uppercase, `letter-spacing: 0.8px`, `--text-tertiary`.
- Margin: 0 below, 8-10px below.

Examples: `TODAY'S FOCUS`, `THIS WEEK`, `MORNING CHECK-IN`, `ENERGY`, `MIND`, `WALKING THROUGH EACH ONE`, `NEXT WEEK`.

### Primary CTA

The button that commits a flow.

- Full-width, padding `14px`, `radius-md`.
- Background `--text-primary`, text `--bg-base`, 14px weight 500.
- No hover effect needed on mobile; desktop hover dims to 90%.

Phase 1 examples: `Set the day`, `Lock in the week`, `Add goal`.

### Secondary action

Outlined button for non-primary actions.

- Padding `12px 14px`, `radius-md`.
- Background transparent, `0.5px solid --border-default`, text `--text-secondary`, 13px regular.

### Quick capture input

The always-present "anything to log" affordance.

- Container: `0.5px dashed --border-default`, `radius-md`, padding `11px 13px`.
- Layout: `IconPlus` (14px, `--text-tertiary`) + placeholder text (13px, `--text-tertiary`).
- Placeholder: "Anything worth logging?" (Today screen) or "A note, an obstacle on the horizon, something on your mind — optional." (morning check-in).
- On tap/focus: dashed border becomes solid `--border-default`, expands to a textarea.

### Heatmap (consistency view)

7-column × 4-row grid for the last 4 weeks of a habit.

- Day labels row (M T W T F S S) above the grid, 10px `--text-tertiary`, centered above each column.
- Grid: `display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px`.
- Each cell: `aspect-ratio: 1; radius-sm` (3px).

Cell states:

| State | Fill |
|---|---|
| Done | `--success-bg` (or a slightly stronger green if too pale) |
| Drift miss | `--danger-bg` |
| Life miss | `--neutral-bg` with `0.5px solid --border-subtle` |
| Today / pending | transparent with `1px dashed --border-default` |
| Future | transparent, no border |

Below the grid: legend row with 4 entries, 9×9px swatch + 11px `--text-secondary` label, gap 14px.

---

## 5. Voice in microcopy

Cross-reference: full voice spec lives in `CLAUDE.md` §2. UI-specific patterns below.

### Section labels — short, declarative

✓ `TODAY'S FOCUS` / `THIS WEEK` / `RECENT`
✗ `Here are your goals for today`

### Button labels — active verbs

✓ `Set the day` / `Lock in the week` / `Add goal`
✗ `Submit` / `Save changes` / `Continue`

### Placeholders — conversational, not instructional

✓ `Anything worth logging?` / `What's the one thing that, if it goes well, makes the week count?`
✗ `Enter note here` / `Type your reflection`

### Status badges — short, honest, kind

✓ `On track` / `Drifting` / `Questioning`
✗ `Success` / `Behind` / `Failing`

### JARVIS day reading (Today screen) — one sentence, references actual data

✓ `Three on the board. The run is the only thing standing between you and a calm Friday.`
✗ `You have 3 tasks today. Make it count!`

### JARVIS observations — specific, ends with a question or implication

✓ `Three out of four Wednesdays missed this month — the 09:00 meeting is pressing on the morning. Worth shifting Wednesday to evening, or making it an honest rest day?`
✗ `It looks like you struggle with Wednesdays.`

### Action button row on pulse goals — one-word verbs

`Keep` · `Evolve` · `Pause` · `Kill`. These are the locked verbs. Don't soften "Kill" — the bluntness is the point.

---

## 6. Screen specifications

### Today (default landing)

**Purpose**: the daily home base. Shows what's actionable now, JARVIS's read on the day, and quick metrics.

**Layout (top to bottom)**:

```
Today
├── Date label             "THU 21 MAY · 09:41"
├── Greeting (h1)          "Good morning, Igor."
├── Day reading (body)     "Three on the board. The run is the only thing standing between you and a calm Friday."
├── AI observation card    "Three of four runs this week. Friday's the usual slip — shall we settle it now?"
├── Section: TODAY'S FOCUS
├── Goal card × 3          (sorted ascending by anchor time)
│    1. Morning run · 3 km     ⏱ 07:00 · neighborhood loop           Habit · 5 of 7 days on track this week
│    2. Side project · auth flow  ⏱ 14:00 · 2h deep block · desk      Project · last blocker before Friday demo
│    3. Spanish · 10 minutes  ⏱ 21:30 · couch · after dinner          Learning · day 22 · present tense
├── Quick capture input    placeholder: "Anything worth logging?"
├── Section: THIS WEEK
├── Metric tile × 2 (grid)
│    1. Adherence  78%    [progress bar]
│    2. Focus hours  12.5  [sparkbar of last 7 days]
└── (bottom nav)
```

**Phase 1 hardcoded data**: use the three goals above. Date string is `"THU 21 MAY · 09:41"`. JARVIS lines can be hardcoded strings until Phase 3 wires up the AI.

---

### Morning check-in

**Purpose**: capture morning state (energy + mind), confirm today's drafted focus, optional context. Auto-fires on PC startup; lands on iPhone open if pre-check-in time.

**Layout (top to bottom, focused flow — no bottom nav)**:

```
Morning check-in
├── Top row                "MORNING CHECK-IN"  [Skip for now] (right-aligned)
├── Greeting (h1)          "Good morning, Igor."
├── Question (body)        "How are we starting?"
├── Section: ENERGY
├── Chip row (3 cols)      Low · Mid · High
├── Section: MIND
├── Chip cloud (multi)     Focused · Scattered · Heavy · Calm · Tired
├── Section: TODAY · DRAFTED                                              [✏ Edit] (right)
├── Compact item × 3       (smaller than Today's goal cards, just checkbox + name + anchor)
│    ◯ Morning run · 3 km          07:00 · neighborhood loop
│    ◯ Side project · auth flow    14:00 · 2h deep block
│    ◯ Spanish · 10 minutes        21:30 · couch · after dinner
├── Section: ANYTHING I SHOULD KNOW?
├── Capture input          "A note, an obstacle on the horizon, something on your mind — optional."
└── Primary CTA            "Set the day"
```

**Compact item style** (different from full Goal card): row layout, no card border, divider line between items. 16px check circle + name (13px medium) + anchor below (11px tertiary). The whole list of three has dividers, not gaps.

**Phase 1 hardcoded data**: pre-select "High" energy and "Focused" mind to demonstrate selected-chip styling. Goals listed match Today.

---

### Goal detail (habit type — Morning run)

**Purpose**: the home of one goal. Why, anchor, consistency truth, JARVIS's read on this goal, recent activity, actions.

**Layout (top to bottom, focused flow — no bottom nav)**:

```
Goal detail
├── Top nav row            [← Goals]              [Habit pill]  [⋯]
├── Title (h1)             "Morning run"
├── Subtitle               "3 km · 5x per week · feeds Fitness baseline"
├── Section: WHY
├── Body paragraph         "Sleep is better. Mind is sharper. Mood lifts. The load-bearing habit of my week."
├── Section: ANCHOR
├── Row                    ⏱ 07:00 · neighborhood loop                          Edit (right)
├── Section: CONSISTENCY · LAST 4 WEEKS                                          20 of 23 (right)
├── Day labels             M  T  W  T  F  S  S
├── Heatmap grid           4 weeks × 7 days
├── Heatmap legend         Done · Drift miss · Life miss · Today
├── AI observation card    "Three out of four Wednesdays missed this month — the 09:00 meeting is pressing on the morning. Worth shifting Wednesday to evening, or making it an honest rest day?"
├── Section: RECENT
├── Activity row × 4
│    Yesterday   Done · 22 min · felt easy
│    Tuesday     Done · 24 min
│    Monday      Done · 21 min · gusty wind
│    Sunday      Missed · life · family dinner ran late
├── Action row
│    [Ask about this] (primary, takes 70%)     [⏸] (secondary, narrow)
└── (no bottom nav — back navigation)
```

**Type pill**: small uppercase-ish pill in the top right, `--bg-surface` background, `--text-secondary` text, padding `3px 9px`, `radius-pill` (10px). Always shows goal type: `Habit`, `Project`, `Learning`, `Outcome`, `Direction`.

**Heatmap data for Phase 1 hardcoded**:
- Row 1 (oldest): Done, Done, Drift, Done, Done, Done, Done
- Row 2: Done, Done, Drift, Done, Done, Done, Done
- Row 3: Done, Done, Drift, Done, Done, Done, Life
- Row 4 (current week, Thursday is today): Done, Done, Done, Today-pending, future, future, future

**Action row**: "Ask about this" navigates to Ask tab with this goal as context (Phase 3+). Pause icon button shows a confirm dialog. Delete is in the `⋯` overflow menu, with a 2-step confirm — killing a goal is intentional.

**Goal detail variants for other types** (project, learning, outcome, direction) are post-alpha. Same shell, different middle: see CLAUDE.md §4.

---

### Weekly pulse

**Purpose**: AI-led weekly review. Synthesis of the week, three observations, walk through each goal with keep/evolve/pause/kill decisions, forward-looking prompt.

**Layout (top to bottom, focused flow — no bottom nav)**:

```
Weekly pulse
├── Top row                "FRIDAY PULSE · 12 – 16 MAY"                          [×] (right)
├── Title (h1)             "Let's take stock."
├── Synthesis (body)       "A solid week on the body, a slower one on the head. Three things worth examining before we set next week."
├── Section: THE NUMBERS
├── Metric tile × 4 (2×2 grid)
│    Adherence    82%   ↑ 11
│    Focus hours  14.5  ↓ 3
│    Goals on track  4 / 5
│    Drift flags   2
├── Section: WHAT I NOTICED
├── AI observation card × 3
│    1. (IconTrendingUp) "Run consistency climbed from 4 to 5 this week. The two skipped days were both low-energy mornings — what shifted on Tue and Wed nights?"
│    2. (IconClockExclamation) "Auth flow took twelve days against your five-day estimate. The work was fine — the estimate wasn't. Worth a quick post-mortem before the next chunk."
│    3. (IconAlertCircle) "Spanish has been declining for three weeks. The check-ins say 'done' but the sessions are getting shorter. Still a goal, or has it become an obligation?"
├── Section: WALKING THROUGH EACH ONE
├── Pulse goal card × N
│    Each card:
│    ┌───────────────────────────────────────────────────────┐
│    │ Morning run                              [ON TRACK]   │
│    │ "This one's working. Keep it boring."                 │
│    │ [Keep] [Evolve] [Pause] [Kill]   ← 4-button row       │
│    └───────────────────────────────────────────────────────┘
├── Section: NEXT WEEK
├── Capture input          "What's the one thing that, if it goes well, makes the week count?"
└── Primary CTA            "Lock in the week"
```

**Pulse goal card**: container `0.5px solid --border-subtle`, `radius-md`, padding `12px 14px`. Action button row at bottom: 4 equal-width buttons with 4px gap. Default-selected button (JARVIS's recommendation) gets primary styling (`--text-primary` bg, `--bg-base` text); others are outlined.

**Phase 1 hardcoded Pulse goals**:
1. **Morning run** · ON TRACK · "This one's working. Keep it boring." · Default: Keep
2. **Side project · MVP** · DRIFTING · "Scope keeps growing. Time to cut, or push the demo date and admit it?" · Default: Evolve
3. **Spanish · daily** · QUESTIONING · "Three weeks of going-through-the-motions. Is this still a real goal, or are we ticking a box?" · Default: none (let the user decide)

---

## 7. Navigation rules

- **Tab destinations** (Today / Goals / Ask / Insights / Pulse) maintain their own state — switching tabs and back returns you where you were.
- **Focused flows** (Morning Check-in, Weekly Pulse, Goal Detail) hide the bottom nav. They use a top-row back button or close `×`.
- **Morning Check-in** auto-routes on app open if it's before the user's check-in window and today's check-in isn't done. Otherwise lands on Today.
- **Pulse** is available anytime via its tab. On Friday afternoon (or user's chosen day/time), a prompt appears on Today inviting the user to do this week's pulse.
- **Ask** can be entered with goal context (from "Ask about this" buttons) or empty (from the tab). When entered with context, prepopulate the system message; let the user start typing in an empty input.

---

## 8. Empty states

Phase 1 won't hit most of these (hardcoded data), but defining now so Phase 2+ has shape.

- **No goals yet**: Today shows "Nothing on the board yet. Want to set up your first goal?" with a CTA `Add a goal` that opens the goal capture flow. Goals tab shows the same empty state.
- **No activity for a goal**: Recent section in goal detail shows "No history yet. Log your first one from Today."
- **No observations for a goal**: AI observation card shows "Nothing to add yet — give it a week of data and we'll see what shows up."
- **Pulse not due yet**: Pulse tab shows "Next pulse on Friday. Until then, just keep walking."

Empty states should sound like JARVIS, not a generic empty-state library.

---

## 9. Accessibility

- **Color contrast**: every text/background combination must hit WCAG AA (4.5:1 for normal text, 3:1 for large). The tokens above are designed to pass; verify when implementing.
- **Touch targets**: 44×44px minimum on mobile. The 22px check circles need a larger tap area (padding the parent).
- **Focus states**: every interactive element needs a visible focus ring. Use a 2px `--accent` outline at 2px offset.
- **Reduced motion**: respect `prefers-reduced-motion` — no animations on chip selection, no progress bar transitions.
- **Screen readers**: bottom nav tabs need `aria-label`, status badges need text alternatives ("On track", "Drifting", "Questioning" — already readable), heatmap cells need `aria-label` describing date and state.

---

## 10. What's deliberately not specified

- **Animations and transitions** — keep absent in Phase 1. Static is fine. Add later only where it earns its place (chip-to-selected feedback, pulse review card slide).
- **Onboarding** — post-alpha. Phase 1 hardcoded data IS the onboarding for Igor's personal use.
- **Settings screen** — not needed for personal alpha. Hardcode any preferences.
- **Goals list page** — implied by the Goals tab but minimally specified here. Phase 2 sketches a list of goal-summary rows (name, type pill, status, last activity). Keep it boring.
- **Light mode tokens** — defer to post-alpha.
- **Insights tab** — entirely post-alpha. Don't build in Phase 1.

---

---

## Implementation status (2026-06-01)

Design system + all current screens implemented (`src/index.css` tokens/base, `src/App.css` components, Tabler icons, Inter via `@fontsource`). Deliberate deviations from this guide:

- **Bottom nav has 4 tabs, not 5** — Insights is post-alpha (CLAUDE.md), so it's omitted. Ask still gets the emphasized centered circle; it sits at position 3 of 4 rather than dead-center.
- **Mind is single-select**, not multi-select — the locked data model (`CheckIn.mind`) is a single enum. Honoring the data model over the chip spec.
- **Consistency heatmap not built** — Goal Detail uses the live activity timeline instead. The 4-week heatmap is a habit-type detail-view variant, which CLAUDE.md scopes post-alpha.
- **Today metrics (Adherence / Focus hours) are placeholder values** — styled per spec but not yet computed from activity data.
- **Today's focus list is wired to real active goals** (sorted by anchor time), an improvement over the Phase-1 hardcoded list.
- **Light mode** not built (post-alpha, per §2).

_Last updated: design system + screens implemented (2026-06-01)._
