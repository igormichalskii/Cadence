# Goal accountability app

> Personal goal-pursuit system with embedded AI. Web PWA installable on iPhone home screen. Built by Igor; single-user during alpha.
>
> **App name**: TBD (placeholder — pick before Phase 1 ships)
> **Repo**: TBD
> **Working AI voice**: JARVIS (see voice spec below)

This file is Claude Code's session-zero context. Reread it at the start of every session. It captures locked decisions about voice, taxonomy, design, stack, and scope. Implementation lives in code; product decisions live here and in claude.ai conversations with Igor.

---

## 1. What this app is

A goal-pursuit system that captures, refines, executes, and adapts goals with the help of an embedded AI assistant. Unlike most goal apps, it:

- Treats different goal types differently (habit vs project vs learning vs outcome vs direction).
- Refuses streak-based gamification.
- Uses AI as a working layer woven through the experience, not as a chat tab bolted to the side.
- Is local-first — the user's data lives on the device; cloud sync is backup.
- Is opinionated about what's worth doing and what's noise.

The goal is to be the app Igor actually opens every morning and Friday afternoon. Not to be a marketable product (yet). That comes after the alpha proves itself in daily use.

---

## 2. JARVIS voice spec

The AI throughout the app speaks as JARVIS. This applies to every piece of AI-generated output, every microcopy string, every empty state, every button label.

**Tone**: dry, professional humor. A touch of wit. Never chirpy or cheering. Confident without being arrogant. Treats Igor like an adult.

**Behavior**:
- Anticipatory — says useful things before being asked.
- Discreet — speaks up when there's real signal, quiet otherwise.
- Honest — surfaces drift; asks uncomfortable questions when the data warrants.
- Specific — pattern observations cite real data from Igor's history. Never generic.
- Conversational — uses contractions, natural phrasing.

**Examples that land**:
- "Three of four runs this week. Friday's the usual slip — shall we settle it now?"
- "A solid week on the body, a slower one on the head."
- "Anything I should know before we start?"
- "Three out of four Wednesdays missed this month — the 09:00 meeting is pressing on the morning. Worth shifting Wednesday to evening, or making it an honest rest day?"

**Examples that fail**:
- "Great morning! You're crushing it!" (chirpy, sycophantic)
- "Have you considered adjusting your routine?" (generic)
- "I'm so proud of your progress!" (sycophantic)
- "Don't worry, tomorrow is a new day." (empty comfort)

When in doubt: write what a competent, slightly dry British butler with a data-driven mind would say.

---

## 3. Design philosophy

### What this app is

- Honest. Surfaces drift instead of hiding it.
- Adaptive. Goals evolve, pause, or die. Not write-once.
- Quiet. Minimal chrome. No notification spam. AI speaks only when there's signal.
- Multi-type. Five goal types, each with its own mechanics.
- Local-first. User data lives on device; cloud is a backup channel.

### Anti-patterns — never add these

- ❌ Streak counters anywhere.
- ❌ Badges, achievements, levels, points, ranks, leaderboards.
- ❌ Notification spam. Push only fires for: morning check-in window if not done, JARVIS escalation when drift signals warrant, weekly pulse reminder.
- ❌ "Great job!" or any chirpy encouragement.
- ❌ Generic templates ("Drink 8 cups of water!").
- ❌ AI as a passive sidebar / chat tab only. AI is woven throughout.
- ❌ Treating all goal types as identical checkboxes.
- ❌ Social features, public goals, accountability partners. Out of scope.
- ❌ Hardcoded biometric integrations (steps, sleep, calories). Out of scope for v1.

If a feature would require any of the above, surface to Igor rather than building it.

---

## 4. Goal taxonomy

Five types, all stored in a single `goals` table with a `type` discriminator field. The UI shell is unified; per-type behavior diverges in details.

1. **Habit** — recurring action with a frequency target.
   - Required: `anchor_time`, `anchor_place`, `frequency_target`.
   - Example: "Morning run · 3km · 5x/week · 07:00 · neighborhood loop."
   - Detail view: rolling consistency heatmap, no streaks.

2. **Project** — one-off achievement with milestones and a ship date.
   - Required: scope, target completion date, milestone list.
   - Example: "Ship side-project MVP by June 30."
   - Detail view: milestone timeline, scheduled work blocks.

3. **Learning** — skill acquisition over time.
   - Required: `anchor_time`, `anchor_place`, current focus area, skill markers.
   - Example: "Spanish · day 22 · present-tense fluency push."
   - Detail view: consistency heatmap + skill marker log.

4. **Outcome** — a measurable target (weight, income, fitness baseline).
   - Required: metric, target value, target date, linked input habits.
   - Detail view: outcome line **always** overlaid with input habit frequency. Never show outcome alone.

5. **Direction** — vague aspiration that JARVIS translates periodically into concrete moves.
   - Required: stated direction, current expressions (linked habits/projects).
   - Example: "Become someone who reads serious nonfiction."
   - Detail view: list of habits/projects currently expressing this direction, plus the conversation log where JARVIS forces it into concrete next moves.

JARVIS handles slotting a captured goal into its right type during the refinement conversation.

---

## 5. Tech stack — locked

- **Frontend**: React + TypeScript + Vite, with `vite-plugin-pwa` for PWA install + offline.
- **Backend**: TypeScript + Hono, deployed as Vercel functions.
- **Local storage**: IndexedDB via Dexie.js.
- **Database (post-alpha)**: Postgres on Neon, accessed via Drizzle ORM.
- **AI**: Anthropic Claude API. Called server-side only — API key never reaches the client. Default model: Claude Sonnet for most calls; Claude Opus for Pulse synthesis and goal-refinement conversations.
- **Hosting**: Vercel (frontend + backend functions). Free tier covers personal use.
- **Auth (post-alpha)**: TBD when multi-user becomes a real concern.

Java is **not** in the stack. Igor's Java skills transfer at the type-system instinct level (TypeScript will feel familiar). Don't reach for Java analogies for things that genuinely differ (structural typing, union types, JS-style async, npm/pnpm).

---

## 6. Architecture

Three tiers. For alpha, only the client and a minimal backend are live.

1. **Client (PWA)** — React app, IndexedDB local storage, service worker for offline + push. Source of truth for the user's data.
2. **Backend API** — Thin Hono service. Alpha responsibility: proxy AI calls (keep Anthropic key secret). Post-alpha responsibilities: sync, calendar OAuth.
3. **External services** — Anthropic API (always). Google Calendar API (post-alpha). Postgres on Neon (post-alpha, for cloud backup/sync).

For alpha, all real data lives in IndexedDB on Igor's devices. No sync. No multi-device. No accounts.

---

## 7. Data model

TypeScript types in `src/lib/types.ts` must match this. Dexie schema mirrors it.

```
Goal:           id, name, type, why, operational_def,
                anchor_time?, anchor_place?, frequency_target?,
                status (active|paused|killed),
                linked_outcome_id?, created_at

CheckIn:        id, kind (morning|evening), timestamp,
                energy (low|mid|high),
                mind (focused|scattered|heavy|calm|tired),
                note?, ai_synthesis?

Activity:       id, goal_id, timestamp,
                status (done|missed_drift|missed_life),
                duration_min?, note?

Observation:    id, goal_id? (nullable for portfolio-wide),
                timestamp, content, kind (pattern|nudge|question)

Pulse:          id, week_start, opening_synthesis, next_week_focus?

PulseDecision:  id, pulse_id, goal_id,
                decision (keep|evolve|pause|kill), note?
```

Note: `CheckIn` has no foreign key to any goal — check-ins capture *state of the user*, not state of a goal.

---

## 8. App surfaces

Five tabs. Ask sits in the center as the "summon JARVIS" affordance.

1. **Today** (default landing) — JARVIS greeting + day reading, 1-3 focus items sorted by time, quick capture, mini metrics.
2. **Goals** — full goal portfolio. Add/edit/pause/kill. Drill into goal detail.
3. **Ask** — open AI chat. Centered tab. The unstructured-conversation surface.
4. **Insights** — six-view analytics dashboard. **Post-alpha.**
5. **Pulse** — weekly review ritual, observations, per-goal decisions.

Plus two flow screens that aren't tabs:
- **Morning check-in** — auto-fires on PC startup; lands first on iPhone open if pre-check-in.
- **Weekly pulse** — Friday afternoon or Sunday evening (user-chosen during onboarding).

---

## 9. Build phases

**Current phase**: Phase 2 — Goals CRUD locally.

**Phase 0 · Foundation** — COMPLETE. Deployed at cadence-puce-five.vercel.app. Installed on iPhone home screen.

**Phase 1 · Static UI** — COMPLETE. Five tabs (Today, Goals, Ask, Pulse), GoalDetail drill-down, CheckIn flow shell. Hardcoded data. Navigation works.

**Phase 0 · Foundation (≈ 1 week).** Vite + React + TypeScript project. `vite-plugin-pwa` configured. Deploy to Vercel. Install on iPhone home screen. End: "Hello, Igor" renders on PC and on phone home screen as installed PWA.

**Phase 1 · Static UI (≈ 2 weeks).** Build Today, Goals (list), Goal Detail, Ask shell, Pulse shell. Plus Morning Check-in flow. Hardcoded data. Navigation works. No persistence, no AI.

**Phase 2 · Goals CRUD locally (≈ 2 weeks).** Dexie + IndexedDB. TypeScript types matching the data model. Goal create/edit/pause/kill flows. Activity logging from Today and goal detail. Data persists.

**Phase 3 · AI integration (≈ 2-3 weeks).** Hono backend deployed on Vercel. Single AI proxy endpoint to Anthropic. Goal capture conversation (refinement loop). Daily JARVIS line on Today. JARVIS voice goes live.

**Phase 4 · Check-ins + activity logging (≈ 1 week).** Morning + evening check-in flows write state. JARVIS synthesis after each check-in. Rich activity logging with soft-context fields. History timeline in goal detail.

**Phase 5 · Pulse + observations (≈ 2 weeks).** Weekly pulse flow end-to-end. Background observation generation from accumulated data. Keep/evolve/pause/kill update portfolio. The negotiator surfaces drift between stated priorities and actual time spent.

**Phase 6 · Polish for personal alpha (≈ 1 week).** Web Push notifications. PWA install polish. PC startup auto-open. Notification escalation when morning state is low. End: daily-usable personal alpha.

**Total**: 11-12 weeks focused; realistic 4-5 months part-time.

**Post-alpha** (don't build until alpha is in daily use): cloud sync + auth, Google Calendar two-way sync, Insights tab with the six visualizations, goal-type detail view variants (project / learning / outcome / direction), onboarding flow, generalization for other users.

---

## 10. How Igor learns

Calibrate your teaching to these preferences. These are not optional.

- **Attempt first.** When Igor asks how to do something, ask if he wants to try first. Don't lead with solutions. If he says "just show me," then show.
- **Line-by-line explanations.** When showing new code, explain what each line does and why. Expect "why" questions throughout — answer the why, not just the what.
- **Learn-vs-delegate framework.** Some things Igor wants to deeply understand: TypeScript fundamentals, React state model, AI prompt design, the data model, architecture decisions. Some are safe to delegate: build tooling, deployment config, CSS minutiae, third-party integrations. Default to teaching. Ask if unsure.
- **Broken code technique.** Sometimes Igor will ask you to break working code in a specific way so he can practice fixing it. Cooperate.
- **No premature abstraction.** Build simple, ugly, direct things first. Refactor later with intent. Premature abstraction is a learning blocker.
- **Java is his background.** Connect TypeScript concepts to Java where they actually map (interface ≈ interface, class ≈ class, type assertion ≈ cast). Don't lean on Java analogies for things that work differently (structural typing, union types, async/await, JS truthiness, prototype model).
- **One concept at a time.** When introducing two new ideas in one piece of code, name them both and ask which to dig into first.

---

## 11. Concepts covered

Auto-updating. When a new concept is genuinely learned (not just touched), append a one-line summary. Most-recent on top.

- `useParams()` returns an object — destructure it (`const { id } = useParams()`) to get the value you want.
- `Link` vs `NavLink` — `Link` for plain navigation, `NavLink` when you need active state styling.
- Dynamic route segments (`:id`) — match any value in that URL position; read it with `useParams`.
- Named exports vs default exports (`import { X }` vs `import X`) — modules choose one style; TypeScript tells you which.
- React Fragment (`<>...</>`) — returns multiple elements without adding a DOM node.
- `public/` folder in Vite — files here are served at the root URL, used for static assets like PWA icons.
- PWA manifest — `name`, `short_name`, `theme_color`, `icons` tell the browser/phone how to install the app.
- `registerType: 'autoUpdate'` — service worker silently updates on new deploys.

---

## 12. Working agreement

- **Architecture and product decisions** are made in conversations with Claude in claude.ai, not Claude Code. Don't redesign the spec mid-build. If a decision is unclear, surface it to Igor.
- **Implementation** happens in Claude Code with this file as context.
- **Anti-patterns are non-negotiable.** If a feature seems to need a streak counter, badge, social element, or notification ping, propose an alternative.
- **JARVIS voice is non-negotiable.** All AI output, all microcopy, all button labels must conform. When writing copy, read it against the examples in §2.
- **Goal taxonomy is locked.** New goal types require a conversation, not a code change.
- **Out of scope means out of scope.** Don't build post-alpha features during alpha, even "just a small version."
- **When you ship something, update this file.** Phase complete? Move "current phase" marker. New concept learned? Append to §11.

---

_Last updated: Phase 1 complete (2026-05-23)._
