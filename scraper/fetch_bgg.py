"""
BoardGameGeek (BGG) scraper for fetching board game data.
Uses authenticated env config, fetches owned collection, downloads thumbnails,
and exports games.json for the tier maker frontend.
"""

import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from boardgamegeek import BGGClient

# Load .env from scraper directory
load_dotenv(Path(__file__).resolve().parent / ".env")

BGG_USER = os.getenv("BGG_USER")
BGG_API_KEY = os.getenv("BGG_API_KEY")

# Paths relative to this script
SCRIPT_DIR = Path(__file__).resolve().parent
GAMES_IMAGE_DIR = (SCRIPT_DIR / ".." / "frontend" / "public" / "games").resolve()
GAMES_JSON_PATH = (SCRIPT_DIR / ".." / "frontend" / "src" / "games.json").resolve()


def fetch_bgg():
    """Fetch owned BGG collection, download thumbnails, and export games.json."""
    if not BGG_USER:
        raise SystemExit("BGG_USER is not set. Configure it in scraper/.env")
    if not BGG_API_KEY:
        raise SystemExit("BGG_API_KEY is not set. Get a token from https://boardgamegeek.com/applications")

    # Initialize BGG client with application token (bgg-api)
    bgg = BGGClient(BGG_API_KEY)

    print(f"Fetching collection for user: {BGG_USER}")
    collection = bgg.collection(BGG_USER, own=1, exclude_subtype="boardgameexpansion")

    if collection is None:
        raise SystemExit(f"Could not load collection for user '{BGG_USER}'")

    items = list(collection.items) if hasattr(collection, "items") else []
    if not items:
        print("No owned games in collection.")
        _write_games_json([])
        return

    GAMES_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    games_data = []

    for i, item in enumerate(items):
        game_id = getattr(item, "id", None)
        name = getattr(item, "name", "Unknown")
        thumbnail = getattr(item, "thumbnail", None) or getattr(item, "image", None)

        if game_id is None:
            continue

        game_id_str = str(game_id)
        image_path = GAMES_IMAGE_DIR / f"{game_id_str}.jpg"
        image_url_path = f"/games/{game_id_str}.jpg"

        if thumbnail:
            try:
                resp = requests.get(thumbnail, timeout=30)
                resp.raise_for_status()
                image_path.write_bytes(resp.content)
            except Exception as e:
                print(f"  Skip thumbnail for {name!r}: {e}")
            time.sleep(0.5)

        games_data.append({
            "id": game_id_str,
            "name": name,
            "image": image_url_path,
        })
        print(f"  [{i + 1}/{len(items)}] {name} (id={game_id_str})")

    _write_games_json(games_data)
    print(f"Wrote {len(games_data)} games to {GAMES_JSON_PATH}")


def _write_games_json(games: list):
    """Write games array to frontend src/games.json."""
    GAMES_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    GAMES_JSON_PATH.write_text(
        json.dumps(games, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


if __name__ == "__main__":
    fetch_bgg()
