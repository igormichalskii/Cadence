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

## Note on scope

This adds a minimal one-way device→server push (subscription + a check-in
snapshot in KV). It is **not** general sync — goals, activities, and the rest
still live only in IndexedDB. Full sync + auth remain post-alpha.
