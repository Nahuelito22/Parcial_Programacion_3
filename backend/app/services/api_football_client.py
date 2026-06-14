import logging
import requests
from app.utils.api_config import API_FOOTBALL_BASE_URL, API_FOOTBALL_KEY

logger = logging.getLogger(__name__)

class APIFootballClient:
    def __init__(self):
        self.base_url = API_FOOTBALL_BASE_URL
        self.api_key = API_FOOTBALL_KEY
        self.headers = {
            "x-apisports-key": self.api_key,
            "Accept": "application/json"
        }
        self.timeout = 10

    def _request(self, endpoint, params=None):
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        # Simple retry logic (up to 2 attempts)
        for attempt in range(1, 3):
            try:
                logger.info(f"Haciendo petición GET a {url} con parámetros {params} (Intento {attempt})")
                response = requests.get(url, headers=self.headers, params=params, timeout=self.timeout)
                
                # Manejar Rate Limit de forma explícita
                if response.status_code == 429:
                    logger.warning("Límite de solicitudes alcanzado (HTTP 429).")
                    return {"errors": {"rate_limit": "Too Many Requests"}, "response": []}
                
                # Levantar excepción para otros códigos de error
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                logger.error(f"Error de red/solicitud en GET {url}: {e}")
                if attempt == 2:
                    raise e
        return None

    def get_teams(self, league, season):
        params = {"league": league, "season": season}
        return self._request("/teams", params=params)

    def get_fixtures(self, league, season):
        params = {"league": league, "season": season}
        return self._request("/fixtures", params=params)

    def get_players(self, team_id, season):
        params = {"team": team_id, "season": season}
        return self._request("/players", params=params)

    def get_fixture_statistics(self, fixture_id):
        params = {"fixture": fixture_id}
        return self._request("/fixtures/statistics", params=params)
