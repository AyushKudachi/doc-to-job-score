# Deploying to Render

This app is a TanStack Start SSR app built to a Node server bundle
(`.output/server/index.mjs`) via Nitro's `node-server` preset. It uses
**Supabase** for auth/database and **OpenRouter** for AI analysis.

## 1. Push to GitHub

```bash
git remote add origin https://github.com/<your-user>/<repo>.git
git push -u origin main
```

## 2. Create a Render Web Service

- New → Web Service → connect the GitHub repo.
- Runtime: **Node**
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Instance Type: Free is fine to start.

Render auto-detects `render.yaml` in the repo root — if you use "Blueprint"
instead of "Web Service", it will read the service definition and env var
placeholders automatically.

## 3. Environment variables (Render → Environment)

### Required — server-only secrets
| Key | Where to get it |
| --- | --- |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys |
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API (publishable / anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role) — **secret** |

### Required — client (Vite) — must start with `VITE_` and be present at build time
| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | same as `SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | same as `SUPABASE_PUBLISHABLE_KEY` |
| `VITE_SUPABASE_PROJECT_ID` | your Supabase project ref (e.g. `qzpmwrmyebmldmdbbxxa`) |

### Optional
| Key | Default | Purpose |
| --- | --- | --- |
| `OPENROUTER_MODEL` | `google/gemini-2.5-flash` | Any OpenRouter model slug |
| `OPENROUTER_SITE_URL` | your Render URL | Sent as `HTTP-Referer` (OpenRouter analytics) |
| `OPENROUTER_APP_NAME` | `Resume ATS Analyzer` | Sent as `X-Title` |
| `PORT` | `10000` | Render sets this automatically |
| `NODE_VERSION` | `20` | Node runtime version |

> After changing any env var, click **Manual Deploy → Clear build cache & deploy**
> — Vite bakes `VITE_*` values into the bundle at build time.

## 4. Supabase setup

- The `resume_analyses` table and its RLS policies already exist in the
  connected Supabase project. If you're moving to a fresh project, apply the
  schema in `supabase/` first.
- In Supabase Auth → URL Configuration, add your Render URL
  (`https://<your-service>.onrender.com`) to **Site URL** and
  **Redirect URLs** so login redirects work.

## 5. Local dev

Create `.env` with the same variables above and run:

```bash
npm install
npm run dev
```
