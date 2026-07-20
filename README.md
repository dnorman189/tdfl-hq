# The Dynasty League Hub

Cap sheet, keeper planner, FAAB tracker, live rookie draft room, trade analyzer, and franchise history for TDFL — synced from Sleeper, shared across the whole league through Supabase.

Everything lives in one file (`index.html`). No build step, no framework, no server to run.

---

## Part 1 — Supabase (shared data for everyone)

This is what makes keeper plans, salary overrides, dates, and the big board show up the same for all 12 owners on any device.

1. Go to [supabase.com](https://supabase.com), sign in with GitHub, and click **New project**. Give it a name, set a database password (save it somewhere), pick the free tier. Wait ~2 minutes for it to provision.
2. In the project, open **SQL Editor → New query**. Paste the entire contents of `supabase-setup.sql`, click **Run**. You should see "Success."
3. Open **Settings → API**. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")
4. Open `index.html`, find these two lines near the top of the `<script>`:
   ```js
   const SUPABASE_URL = "";
   const SUPABASE_ANON_KEY = "";
   ```
   Paste your values inside the quotes. Save.

> The anon key is meant to be public — it can only read and write the one `league_state` table this app uses, nothing else in your database. Fine for a private league hub.

If you skip this part entirely, the hub still works — it just saves per-device instead of shared, and you'd pass data around with the Export/Import buttons.

---

## Part 2 — GitHub Pages (the live URL)

1. Create a GitHub account if you don't have one. Click **New repository**, name it something like `tdfl-hub`, set it **Public**, click **Create**.
2. On the repo page, click **Add file → Upload files**. Drag in `index.html` (and optionally `README.md`, `supabase-setup.sql`). Commit.
3. Go to **Settings → Pages**. Under "Build and deployment," set **Source: Deploy from a branch**, **Branch: main / (root)**, click **Save**.
4. Wait ~1 minute, refresh the Pages settings screen. Your live URL appears at the top: `https://YOURNAME.github.io/tdfl-hub/`. Share it with the league.

To update the site later, edit `index.html` and upload the new version the same way — Pages redeploys automatically.

---

## Using it

- **Sync with Sleeper** — pulls live rosters, contracts (auction bid / rookie slot / FAAB bid, +$5 per year kept), FAAB spent, standings, and full franchise history. Hit it whenever rosters change.
- **Cap mode toggle** — Auction $200 (taxi exempt, IR counts) vs In-Season $250 (2026 rule: FAAB counts, IR + taxi exempt).
- **Commissioner mode** — the 🔒 badge in the header. Everyone can view; editing contracts and league emails is locked behind a PIN. Set it via the `COMMISH_PIN` constant near the top of `index.html` (default `1225` — change it). Every salary override is written to an append-only audit log visible on the **Office** tab.
- **Salary overrides** — edit any salary to override the computed number; overrides survive every future sync (tagged "manual") and are logged with who/when/old→new.
- **Draft night** — set the order, run the board, picks land on rosters at slotted values, everyone's screen follows live.

## Weekly cap-report email (optional)

The **Office** tab holds each team's email and a "Send cap report now" button. To make it actually send:

1. Sign up at [resend.com](https://resend.com) (free tier), grab an API key.
2. Install the Supabase CLI, then from this folder:
   ```
   supabase functions deploy send-cap-report --no-verify-jwt
   supabase secrets set RESEND_API_KEY=re_your_key
   ```
3. That's it — "Send cap report now" will email all registered owners. For a recurring Sunday-night send, add a scheduled trigger in the Supabase dashboard (Database → Cron) that calls the same function.

Without this step, "Send cap report now" falls back to opening a pre-filled email draft in your mail app — still useful, just manual.

## Cost

Free. GitHub Pages is free for public repos; Supabase's free tier is far more than a fantasy league will ever touch.
