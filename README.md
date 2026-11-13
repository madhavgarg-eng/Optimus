# Optimus

Reverentia's daily work management tool for the DWM team. It covers tasks, sessions, the faculty directory, cohorts, KPIs, invoices and the activity log.

- **Frontend:** plain JavaScript built with Vite, hosted free on Cloudflare Pages.
- **Database, sign-in and file storage:** Supabase, on the free plan.

## How access works

The database itself enforces who can see what (Postgres row-level security), so hiding data in the app is not the only protection.

| Role (`kind`) | Who | Sees |
|---|---|---|
| `chair`, `head` | Rajiv, Neha | Everything, including honorariums, faculty rates, bank and PAN details, and senior-faculty invoices with their files |
| `owner`, `lead` | Madhav, Shivpriya | Team view. Confidential money fields are never sent to their browser |
| `pm` | Programme managers | Their own work. Confidential money fields are never sent to their browser |

- **Signing in:** only emails listed in the `team_members` table can sign in and read data.
- **Confidential items:** anyone can add one (for example, a PM attaching a senior faculty member's invoice), but only `chair` and `head` can read it back.
- **Activity log:** it can only be added to. Every database change is also logged automatically, with who made it and when.
- **Invoice files:** they sit in a private storage bucket. Senior-faculty files go under `confidential/` and only `chair` and `head` can open them.

## One-time setup

### 1. Supabase (database)
1. In Supabase, open **SQL Editor**, click **New query**, paste all of `supabase/schema.sql`, and click **Run**.
2. Open **Table Editor**, then `team_members`, and replace the `@example.com` emails with real ones. To add yourself as an admin, add a row with `kind` set to `head`.
3. Open **Authentication**, then **Users**, then **Add user**, then **Create new user**. Create each person with their email and a password, and tick **Auto Confirm User**.
4. Open **Authentication**, then **Sign In / Providers**, and turn off **Allow new users to sign up**. Only people you add can then sign in.
5. The live app starts empty. Add cohorts (Cohorts → Add cohort, with a student Excel/CSV), faculty, sessions and tasks from inside the app.

### 2. Cloudflare Pages (hosting)
1. Push this folder to a GitHub repository.
2. In Cloudflare, go to **Workers & Pages**, then **Create**, then **Pages**, then **Connect to Git**, and pick the repository.
3. Use these build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Under **Environment variables**, add:
   - `VITE_SUPABASE_URL` = `https://hbsgnqjlvxvhhryqavau.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
   - `NODE_VERSION` = `20`
5. Click **Deploy**. The site goes live at `https://<project>.pages.dev`, and every push to `main` redeploys it.
6. In Supabase, open **Authentication**, then **URL Configuration**, and set the **Site URL** to that pages.dev address.

### 3. Keep the free database awake
Free Supabase projects pause after 7 days with no activity. `.github/workflows/keep-supabase-awake.yml` pings the database daily.

To turn it on, add two repository secrets in GitHub (**Settings**, then **Secrets and variables**, then **Actions**):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Local development
```
npm install
cp .env.example .env.local   # then add the anon key
npm run dev
```
Without the env variables, the app runs the original preview: sample data, kept in memory only, with a "view as" persona switcher.

`npm run test:sql` checks the access rules against an in-memory Postgres. `node scripts/test-cleanup.mjs` checks `supabase/remove-sample-data.sql`.

## Free-tier limits (check the current pricing pages)
- **Supabase Free:** 500 MB database, 1 GB file storage, 50,000 monthly active users, 2 projects. Pauses after 7 idle days.
- **Cloudflare Pages Free:** unlimited bandwidth and requests, 500 builds a month, and commercial use allowed.

## Known limits of this first version
- Each person sees changes made by others after they reload the page. There is no live sync yet.
- If two people edit the same item at the same moment, the last save wins.
- KPI scores show "No data yet" until KPI entry or imports are built. Student attendance and scores bulk upload is not built yet (adding a cohort's students is).
- Password reset is done by an admin in Supabase (**Authentication**, then **Users**). Email-based reset is limited on the free plan's built-in mailer.
