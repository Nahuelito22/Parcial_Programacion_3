import requests
import logging

logger = logging.getLogger(__name__)

class WorldCupClient:
    def __init__(self, base_url="https://worldcup26.ir"):
        """
        Inicializa el cliente para consumir la API de worldcup2026.ir.
        """
        self.base_url = base_url.rstrip("/")
        self.token = None

    def authenticate(self, email, password):
        """
        Autentica con la API de worldcup2026 y cachea el token JWT.
        Endpoint: POST /auth/authenticate
        """
        url = f"{self.base_url}/auth/authenticate"
        payload = {
            "email": email,
            "password": password
        }
        try:
            logger.info(f"Intentando autenticación en {url}...")
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Obtener el token de los campos comunes
            self.token = data.get("token") or data.get("access_token") or data.get("data", {}).get("token")
            if not self.token:
                logger.error("La autenticación fue exitosa pero no se encontró el token en la respuesta.")
                raise ValueError("No se encontró el token en la respuesta de la API.")
            
            logger.info("Autenticación exitosa. Token JWT cacheado correctamente.")
            return self.token
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al intentar autenticar con la API de worldcup2026: {e}")
            raise

    def _get_headers(self, token):
        """
        Construye las cabeceras HTTP incluyendo el token de autorización.
        """
        t = token or self.token
        headers = {
            "Content-Type": "application/json"
        }
        if t:
            headers["Authorization"] = f"Bearer {t}"
        return headers

    def get_teams(self, token=None):
        """
        Obtiene el listado de las 48 selecciones clasificadas.
        Endpoint: GET /get/teams
        """
        url = f"{self.base_url}/get/teams"
        try:
            headers = self._get_headers(token)
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error("Error 401: No autorizado. El token de la API de worldcup2026 podría haber expirado.")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener selecciones (teams) desde la API: {e}")
            raise

    def get_groups(self, token=None):
        """
        Obtiene las posiciones de los 12 grupos.
        Endpoint: GET /get/groups
        """
        url = f"{self.base_url}/get/groups"
        try:
            headers = self._get_headers(token)
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error("Error 401: No autorizado. El token de la API de worldcup2026 podría haber expirado.")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener grupos desde la API: {e}")
            raise

    def get_games(self, token=None):
        """
        Obtiene la lista de los 104 partidos del fixture.
        Endpoint: GET /get/games
        """
        url = f"{self.base_url}/get/games"
        try:
            headers = self._get_headers(token)
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error("Error 401: No autorizado. El token de la API de worldcup2026 podría haber expirado.")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener partidos (games) desde la API: {e}")
            raise

    def get_game(self, token, game_id=None):
        """
        Obtiene el detalle de un partido individual.
        Endpoint: GET /get/game/:id
        Soporta firmas tanto de get_game(token, game_id) como de get_game(game_id) con caché.
        """
        # Si se invoca con un solo argumento posicional (game_id) y tenemos token cacheado:
        if game_id is None:
            game_id = token
            t = self.token
        else:
            t = token

        url = f"{self.base_url}/get/game/{game_id}"
        try:
            headers = self._get_headers(t)
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error("Error 401: No autorizado. El token de la API de worldcup2026 podría haber expirado.")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener detalle del partido {game_id}: {e}")
            raise

    def get_stadiums(self, token=None):
        """
        Obtiene la lista de los 16 estadios sedes.
        Endpoint: GET /get/stadiums
        """
        url = f"{self.base_url}/get/stadiums"
        try:
            headers = self._get_headers(token)
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                logger.error("Error 401: No autorizado. El token de la API de worldcup2026 podría haber expirado.")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener estadios (stadiums) desde la API: {e}")
            raise
