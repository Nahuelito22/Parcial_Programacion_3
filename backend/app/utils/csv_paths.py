from pathlib import Path

CSV_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw_fjelstul"

CSV_FILES = {
    "tournaments": "tournaments_curated.csv",
    "teams": "teams_curated.csv",
    "players": "players_curated.csv",
    "group_standings": "group_standings_curated.csv",
    "goals": "goals_curated.csv",
    "bookings": "bookings_curated.csv",
    "squads": "squads_curated.csv",
    "player_appearances": "player_appearances_curated.csv",
    "tournament_standings": "tournament_standings_curated.csv",
    "matches": "matches_curated.csv",
}

