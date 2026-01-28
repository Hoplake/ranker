# Board Game Tier Maker

Monorepo for a board game tier maker app.

## Structure

- **`/scraper`** – Python scripts to fetch board game data (e.g. from BoardGameGeek).
- **`/frontend`** – Vite + React + TypeScript app with Tailwind CSS and @dnd-kit for drag-and-drop tier lists.
- **`/frontend/public/games`** – Directory for game images (scraper output or manual assets).

## Scraper

1. Copy `scraper/.env.example` to `scraper/.env` and set:
   - **BGG_USER** – your BoardGameGeek username
   - **BGG_API_KEY** – your BGG Application Token from [boardgamegeek.com/applications](https://boardgamegeek.com/applications)

2. Run:

```bash
cd scraper
py -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
py fetch_bgg.py
```

This fetches your owned collection (`own=1`), downloads thumbnails to `frontend/public/games/` (as `{id}.jpg`), and writes `frontend/src/games.json` with `{ id, name, image }` (image path relative to public, e.g. `/games/12345.jpg`).

## Frontend

```bash
cd frontend
npm install   # if not already run
npm run dev
```

Images in `frontend/public/games/` are served at `/games/` (e.g. `/games/catan.jpg`).

## Deploy frontend to Cloudflare Pages

### Option A: Dashboard (Git integration)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the repo and configure:
   - **Production branch:** `main` (or your default)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend` (because this repo is a monorepo)
3. **Environment variables:** Add any needed under **Settings** → **Environment variables** (e.g. for future API keys).
4. Save and deploy. Cloudflare will run `npm install` and `npm run build` inside `frontend`, then serve `frontend/dist`.

### Option B: Wrangler CLI (direct upload)

From the repo root:

```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=ranker
```

Create the project once in the dashboard (**Workers & Pages** → **Create** → **Pages** → **Upload assets**) and name it `ranker`, or use `npx wrangler pages project create ranker` first.

### Notes

- **Node version:** Cloudflare Pages uses a recent Node LTS. To pin a version, add an `.nvmrc` (e.g. `20`) in `frontend/` or set **NODE_VERSION** in the build environment.
- **SPA routing:** `frontend/public/_redirects` is copied into `dist` and sends all routes to `index.html` so client-side routing works if you add it later.
