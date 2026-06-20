import requests
import logging
import time

logger = logging.getLogger(__name__)


class ESPNClient:
    """
    Cliente HTTP para la API publica de ESPN.
    No requiere autenticacion. Sin limite de rate conocido.
    """

    BASE_URL = "https://site.api.espn.com"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "MundialWebApp/1.0",
            "Accept": "application/json"
        })

    def _get(self, path, params=None, timeout=15):
        url = f"{self.BASE_URL}{path}"
        last_error = None
        for attempt in range(3):
            try:
                resp = self.session.get(url, params=params, timeout=timeout)
                if resp.status_code == 429:
                    wait = 2 ** attempt
                    logger.warning(f"ESPN rate-limited (429). Reintentando en {wait}s...")
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                return resp.json()
            except requests.exceptions.RequestException as e:
                last_error = e
                if attempt < 2:
                    time.sleep(1)
        raise last_error

    # ------------------------------------------------------------------
    # Scoreboard
    # ------------------------------------------------------------------
    def get_scoreboard(self, date=None):
        params = {}
        if date:
            params["dates"] = date
        return self._get("/apis/site/v2/sports/soccer/fifa.world/scoreboard", params=params)

    def get_all_matches(self):
        data = self.get_scoreboard()
        events = data.get("events", [])
        results = []
        for event in events:
            for comp in event.get("competitions", []):
                results.append(self._parse_match(event, comp))
        return results

    def get_live_matches(self):
        data = self.get_scoreboard()
        events = data.get("events", [])
        results = []
        for event in events:
            for comp in event.get("competitions", []):
                status_type = comp.get("status", {}).get("type", {})
                if status_type.get("state") in ("in", "post"):
                    results.append(self._parse_match(event, comp))
        return results

    def _parse_match(self, event, competition):
        competitors = competition.get("competitors", [])
        home = next((c for c in competitors if c.get("homeAway") == "home"), None)
        away = next((c for c in competitors if c.get("homeAway") == "away"), None)

        status = competition.get("status", {})
        status_type = status.get("type", {})

        def _team(c):
            if not c:
                return {"id": "0", "name": "TBD", "code": "TBD", "logo": None}
            team = c.get("team", {})
            logo = self._extract_logo(team)
            return {
                "id": str(team.get("id", "0")),
                "name": team.get("displayName", team.get("shortDisplayName", "TBD")),
                "code": team.get("abbreviation", "TBD"),
                "logo": logo,
            }

        venue = competition.get("venue", {})

        return {
            "api_game_id": str(competition.get("id", event.get("id", "0"))),
            "grupo": None,
            "tipo": "group",
            "matchday": None,
            "fecha_local": event.get("date"),
            "estadio_nombre": venue.get("fullName", "TBD"),
            "ciudad": venue.get("address", {}).get("city", "TBD"),
            "equipo_local": _team(home),
            "equipo_visitante": _team(away),
            "goles_local": int(home.get("score", "0")) if home else 0,
            "goles_visitante": int(away.get("score", "0")) if away else 0,
            "finalizado": status_type.get("completed", False),
            "tiempo_transcurrido": self._map_status(status_type),
            "estado_detalle": status_type.get("detail", ""),
            "etapa_detalle": status.get("displayClock", ""),
            "period": competition.get("period", 0),
        }

    def _extract_logo(self, team):
        logos = team.get("logos", [])
        if logos and len(logos) > 0:
            return logos[0].get("href")
        direct_logo = team.get("logo")
        if direct_logo and isinstance(direct_logo, str) and direct_logo.startswith("http"):
            return direct_logo
        return None

    def _map_status(self, status_type):
        state = status_type.get("state", "")
        detail = status_type.get("detail", "").lower()

        if state == "pre":
            return "notstarted"
        if state == "post":
            return "Match Finished"
        if state == "in":
            if "halftime" in detail:
                return "halftime"
            if "extra" in detail or "et" in detail:
                return "Extra Time"
            if "penalty" in detail:
                return "Penalty Shootout"
            return "2nd Half" if "2nd" in detail or "second" in detail else "1st Half"
        return status_type.get("description", "notstarted")

    # ------------------------------------------------------------------
    # Teams
    # ------------------------------------------------------------------
    def get_teams(self):
        data = self._get("/apis/site/v2/sports/soccer/fifa.world/teams")
        teams = data.get("sports", [{}])[0].get("leagues", [{}])[0].get("teams", [])
        result = []
        for t in teams:
            team = t.get("team", t)
            logo = self._extract_logo(team)
            result.append({
                "id": str(team.get("id")),
                "displayName": team.get("displayName", team.get("shortDisplayName")),
                "abbreviation": team.get("abbreviation"),
                "logo": logo,
                "color": team.get("color"),
            })
        return result
