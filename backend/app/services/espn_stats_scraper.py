import re
import logging
import requests
from app.services.worldcup_groups import TEAM_TO_GROUP

logger = logging.getLogger(__name__)

ESPN_TO_FIFA = {
    "mexico": "MEX", "méxico": "MEX", "argentina": "ARG", "brasil": "BRA",
    "francia": "FRA", "alemania": "GER", "españa": "ESP", "inglaterra": "ENG",
    "portugal": "POR", "países bajos": "NED", "paises bajos": "NED",
    "bélgica": "BEL", "belgica": "BEL", "croacia": "CRO", "uruguay": "URU",
    "colombia": "COL", "ecuador": "ECU", "paraguay": "PAR",
    "estados unidos": "USA", "canadá": "CAN", "canada": "CAN",
    "japón": "JPN", "japon": "JPN", "corea del sur": "KOR",
    "australia": "AUS", "marruecos": "MAR", "senegal": "SEN",
    "ghana": "GHA", "túnez": "TUN", "tunez": "TUN", "egipto": "EGY",
    "argelia": "ALG", "nigeria": "NGA",
    "irán": "IRN", "iran": "IRN", "arabia saudita": "KSA", "qatar": "QAT",
    "sudáfrica": "RSA", "sudafrica": "RSA",
    "costa de marfil": "CIV", "escocia": "SCO", "noruega": "NOR",
    "suecia": "SWE", "suiza": "SUI", "austria": "AUT",
    "chequia": "CZE", "republica checa": "CZE",
    "turquía": "TUR", "turquia": "TUR",
    "bosnia y herzegovina": "BIH", "nueva zelanda": "NZL",
    "panamá": "PAN", "panama": "PAN", "haití": "HAI", "haiti": "HAI",
    "irak": "IRQ", "uzbekistán": "UZB", "uzbekistan": "UZB",
    "jordania": "JOR", "cabo verde": "CPV",
    "república democrática del congo": "COD",
    "curazao": "CUW", "curacao": "CUW",
}


class ESPNStatsScraper:
    """
    Scraper de estadisticas del Mundial 2026.
    Fuente: ESPN API (JSON) + ESPN AR (texto para tarjetas).
    """

    API_URL = "https://site.api.espn.com"
    WEB_URL = "https://www.espn.com.ar"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "es-AR,es;q=0.9",
        })

    def _api_get(self, path, timeout=15):
        url = f"{self.API_URL}{path}"
        resp = self.session.get(url, timeout=timeout)
        resp.raise_for_status()
        return resp.json()

    def _web_get(self, path, timeout=15):
        url = f"{self.WEB_URL}{path}"
        resp = self.session.get(url, timeout=timeout)
        resp.raise_for_status()
        return resp.text

    def _resolve_team_code(self, team_name):
        name_lower = team_name.lower().strip()
        if name_lower in ESPN_TO_FIFA:
            return ESPN_TO_FIFA[name_lower]
        for key, val in ESPN_TO_FIFA.items():
            if key in name_lower or name_lower in key:
                return val
        return name_lower[:3].upper()

    # ------------------------------------------------------------------
    # Goleadores (JSON API)
    # ------------------------------------------------------------------
    def scrape_goals(self):
        data = self._api_get("/apis/site/v2/sports/soccer/fifa.world/statistics")
        goals_stat = None
        for s in data.get("stats", []):
            if s.get("name") == "goalsLeaders":
                goals_stat = s
                break

        if not goals_stat:
            return []

        results = []
        for leader in goals_stat.get("leaders", []):
            athlete = leader.get("athlete", {})
            team = athlete.get("team", {})
            display = leader.get("displayValue", "")

            matches = 0
            goals = 0
            m = re.search(r'Matches:\s*(\d+)', display)
            g = re.search(r'Goals:\s*(\d+)', display)
            if m:
                matches = int(m.group(1))
            if g:
                goals = int(g.group(1))

            team_name = team.get("displayName", "")
            team_code = team.get("abbreviation", self._resolve_team_code(team_name))

            results.append({
                "nombre": athlete.get("displayName", ""),
                "equipo": team_name,
                "equipo_codigo": team_code,
                "partidos": matches,
                "goles": goals,
            })

        return results

    # ------------------------------------------------------------------
    # Asistencias (JSON API)
    # ------------------------------------------------------------------
    def scrape_assists(self):
        data = self._api_get("/apis/site/v2/sports/soccer/fifa.world/statistics")
        assists_stat = None
        for s in data.get("stats", []):
            if s.get("name") == "assistsLeaders":
                assists_stat = s
                break

        if not assists_stat:
            return []

        results = []
        for leader in assists_stat.get("leaders", []):
            athlete = leader.get("athlete", {})
            team = athlete.get("team", {})
            display = leader.get("displayValue", "")

            matches = 0
            assists = 0
            m = re.search(r'Matches:\s*(\d+)', display)
            a = re.search(r'Assists:\s*(\d+)', display)
            if m:
                matches = int(m.group(1))
            if a:
                assists = int(a.group(1))

            team_name = team.get("displayName", "")
            team_code = team.get("abbreviation", self._resolve_team_code(team_name))

            results.append({
                "nombre": athlete.get("displayName", ""),
                "equipo": team_name,
                "equipo_codigo": team_code,
                "partidos": matches,
                "asistencias": assists,
            })

        return results

    # ------------------------------------------------------------------
    # Tarjetas por equipo (web scraping del texto)
    # ------------------------------------------------------------------
    def scrape_cards(self):
        html = self._web_get("/futbol/estadisticas/_/liga/FIFA.WORLD/temporada/2026/vista/tarjetas/copa-mundial")

        cards = []
        row_pattern = re.compile(
            r'<tr[^>]*>\s*'
            r'<td[^>]*>(\d*)</td>\s*'                            # position (can be empty for ties)
            r'<td[^>]*>.*?>([^<]+)</a></span></td>\s*'            # team name
            r'<td[^>]*><span[^>]*>(\d+)</span></td>\s*'            # P
            r'<td[^>]*><span[^>]*>(\d+)</span></td>\s*'            # TA
            r'<td[^>]*><span[^>]*>(\d+)</span></td>\s*'            # TR
            r'<td[^>]*><span[^>]*>(\d+)</span></td>',              # PTS
            re.DOTALL
        )

        position = 0
        for m in row_pattern.finditer(html):
            pos_str = m.group(1).strip()
            if pos_str:
                position = int(pos_str)
            else:
                position += 1

            team_name = m.group(2).strip()
            team_code = self._resolve_team_code(team_name)
            cards.append({
                "equipo": team_name,
                "equipo_codigo": team_code,
                "posicion": position,
                "partidos": int(m.group(3)),
                "amarillas": int(m.group(4)),
                "rojas": int(m.group(5)),
                "puntos": int(m.group(6)),
            })

        return cards

    # ------------------------------------------------------------------
    # Standings (calculados desde el scoreboard)
    # ------------------------------------------------------------------
    def calculate_standings(self, matches):
        """
        Calcula posiciones de grupo desde los partidos del scoreboard.
        matches: lista de dicts del ESPN scoreboard parseado.
        Retorna: [{"grupo": "A", "equipos": [{"equipo_id": "MEX", "posicion": 1, ...}]}]
        """
        groups = {g: [] for g in "ABCDEFGHIJKL"}
        team_stats = {}

        for m in matches:
            local = m.get("equipo_local", {})
            away = m.get("equipo_visitante", {})
            if not local.get("code") or not away.get("code"):
                continue

            local_code = local["code"]
            away_code = away["code"]
            local_goals = m.get("goles_local", 0)
            away_goals = m.get("goles_visitante", 0)

            group = TEAM_TO_GROUP.get(local_code) or TEAM_TO_GROUP.get(away_code)
            if not group:
                continue

            for code in [local_code, away_code]:
                if code not in team_stats:
                    team_stats[code] = {
                        "equipo_id": code,
                        "pj": 0, "pg": 0, "pe": 0, "pp": 0,
                        "gf": 0, "gc": 0, "dg": 0, "pts": 0,
                    }

            ts = team_stats[local_code]
            ts["pj"] += 1
            ts["gf"] += local_goals
            ts["gc"] += away_goals

            ts2 = team_stats[away_code]
            ts2["pj"] += 1
            ts2["gf"] += away_goals
            ts2["gc"] += local_goals

            if local_goals > away_goals:
                ts["pg"] += 1
                ts["pts"] += 3
                ts2["pp"] += 1
            elif local_goals < away_goals:
                ts2["pg"] += 1
                ts2["pts"] += 3
                ts["pp"] += 1
            else:
                ts["pe"] += 1
                ts2["pe"] += 1
                ts["pts"] += 1
                ts2["pts"] += 1

            for code in [local_code, away_code]:
                team_stats[code]["dg"] = team_stats[code]["gf"] - team_stats[code]["gc"]

        for code, ts in team_stats.items():
            group = TEAM_TO_GROUP.get(code)
            if group:
                groups[group].append(ts)

        results = []
        for g_letter in sorted(groups.keys()):
            teams = sorted(
                groups[g_letter],
                key=lambda t: (-t["pts"], -t["dg"], -t["gf"])
            )
            for idx, t in enumerate(teams):
                t["posicion"] = idx + 1
            if teams:
                results.append({"grupo": g_letter, "equipos": teams})

        return results
