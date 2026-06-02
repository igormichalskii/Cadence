# Activation checklist — notification escalation

The code for server-side escalation is in place. These steps are the parts only
you can do (provisioning + secrets) before it goes live. ~10 minutes.

## 1. Create a KV store

In the Vercel dashboard → your project → **Storage** → **Create** → **KV**
(Upstash Redis). Connect it to the Cadence project. Vercel auto-injects
`KV_REST_API_URL` and `KV_REST_API_TOKEN` into the project's env vars.

## 2. Add a cron secret

Generate a random string and add it as an env var so the escalation endpoint
isn't publicly triggerable:

```powershell
# any random string works
vercel env add CRON_SECRET
```

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on its cron
calls, and `api/escalate.ts` checks it.

## 3. Confirm the VAPID + AI vars are still set

These should already exist from the Web Push work; the cron reuses them:

- `VAPID_MAILTO`, `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- `ANTHROPIC_API_KEY` (needed for the low-state JARVIS line — falls back to a
  static line if missing/out of credits)

## 4. Pull env vars locally (optional, for `vercel dev`)

```powershell
vercel env pull .env.local
```

Remember `vercel env pull` overwrites `.env.local` — re-add any local-only vars
afterward.

## 5. Deploy

```powershell
vercel --prod
```

The cron is declared in `vercel.json` and registers on deploy. It runs once a
day at **11:00 UTC**. On the Hobby plan, cron granularity is once-per-day, so a
single daily job branches its logic by what it finds:

| Condition (at run time)                    | Push fired                          |
|--------------------------------------------|-------------------------------------|
| No morning check-in recorded today         | "Morning check-in's still open…"    |
| Check-in done, energy low / mind heavy/tired | JARVIS escalation line (AI)        |
| Friday, check-in done and state fine       | Weekly pulse reminder               |
| Otherwise                                  | nothing (stays quiet)               |

To change the time, edit the `schedule` in `vercel.json` (cron is UTC).

## 6. Smoke-test

- Open the app, **Enable notifications** (stores your subscription in KV).
- Manually trigger the endpoint:
  ```powershell
  curl -H "Authorization: Bearer <CRON_SECRET>" https://cadence-puce-five.vercel.app/api/escalate
  ```
  With no check-in today you should get the morning reminder push, and the JSON
  response echoes what it sent.

## Still manual (OS-level)

PC startup auto-open — see `scripts/startup-README.md`. One-time Task Scheduler
registration on your machine.

---

# Activation checklist — cross-device sync

Brought forward from post-alpha by explicit decision. Lets goals/activities/
check-ins/pulses sync between your laptop and phone. ~10 minutes.

## 1. Create a Neon Postgres database

Vercel dashboard → project → **Storage** → **Create** → **Postgres** (Neon),
or sign up at neon.tech and copy the connection string. Connecting it via the
Vercel dashboard injects `DATABASE_URL` automatically; otherwise add it:

```powershell
vercel env add DATABASE_URL   # paste the Neon connection string
```

The `sync_records` table auto-creates on the first sync call — no migrations.

## 2. Set the sync passphrase secret

Pick a passphrase and set it server-side:

```powershell
vercel env add SYNC_SECRET
```

This is the shared secret the endpoint checks. It is **not** in the client
bundle — you type it into each device once (next step).

## 3. Deploy

```powershell
vercel --prod
```

## 4. Connect each device

Open the app on the laptop → tap **Sync** on Today → enter the passphrase from
step 2. Repeat on the phone with the *same* passphrase. The first sync pushes
that device's data up and pulls everything else down. After that it syncs on
launch, when the app regains focus, and after every change.

## How it works (for future reference)

- Local-first is unchanged — IndexedDB stays the source of truth. Sync is a
  push-then-pull against `/api/sync`.
- Conflicts resolve **last-write-wins** by each record's `updated_at` (stamped
  on every write).
- Observations are **not** synced — they're AI-derived and each device
  regenerates them.
- Auth is a single shared passphrase (sent as a bearer token), not real
  accounts. Fine for one person on two devices; revisit if Cadence ever goes
  multi-user.

---

## Note on scope

Escalation adds a minimal one-way device→server push (subscription + a check-in
snapshot in KV). Cross-device sync (above) now mirrors the core tables through
Postgres. Multi-user accounts / real auth remain post-alpha — the passphrase is
a single-user stand-in.
