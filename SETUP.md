# Setup Guides

## A. Supabase (database + storage + realtime)

1. Go to https://supabase.com → **Sign in** (top right), sign in with GitHub or email.
2. On the dashboard click **New project**.
3. Fill in:
   - **Name:** `silhouette-puzzle`
   - **Database Password:** click **Generate a password**, then copy it somewhere safe (you rarely need it, but keep it).
   - **Region:** pick the one closest to your venue.
4. Click **Create new project**. Wait ~1–2 minutes while it provisions.
5. Left sidebar → **Storage** → **New bucket**:
   - Name: `puzzles` → toggle **Public bucket ON** → **Save**.
   - **New bucket** again → Name: `captures` → **Public bucket ON** → **Save**.
6. Left sidebar → **Project Settings** (gear) → **API**. Copy:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under "Project API keys")
   - Paste both into `config.js` in your project.

(Tables for puzzles/captures come in a later phase — buckets + keys are all Phase 1 needs.)

---

## B. GitHub repo

1. Go to https://github.com → sign in.
2. Top-right **+** → **New repository**.
3. **Repository name:** `silhouette-puzzle`. Leave everything else default. Set it **Private** if you prefer. Do NOT tick "Add a README". Click **Create repository**.
4. Keep that page open — it shows a command block. We'll push from your computer (Claude will run the commands with you).

---

## C. Vercel project (connect the repo, auto-deploy)

1. Go to https://vercel.com → **Sign up / Log in** → choose **Continue with GitHub**.
2. On the Vercel dashboard click **Add New… → Project**.
3. Find `silhouette-puzzle` in the list → **Import**. (If you don't see it, click **Adjust GitHub App Permissions** and grant access to the repo.)
4. Framework Preset: leave as **Other**. Root directory: leave as `./`. No build command needed (plain HTML).
5. Click **Deploy**. After ~30 seconds you get a live URL like `https://silhouette-puzzle.vercel.app`.
6. From then on, every `git push` auto-deploys the new version.
