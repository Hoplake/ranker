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
