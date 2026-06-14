import os
import logging
from dotenv import load_dotenv

# Cargar variables de entorno buscando en directorios padres
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../../.env"))

logger = logging.getLogger(__name__)

API_FOOTBALL_BASE_URL = os.getenv("API_FOOTBALL_BASE_URL", "https://v3.football.api-sports.io")
API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY", "")
API_FOOTBALL_LEAGUE_ID = int(os.getenv("API_FOOTBALL_LEAGUE_ID", 1))
API_FOOTBALL_SEASON = int(os.getenv("API_FOOTBALL_SEASON", 2026))

# Advertir si la API key falta o es la del placeholder
if not API_FOOTBALL_KEY or API_FOOTBALL_KEY == "tu_key_aqui":
    logger.warning("API_FOOTBALL_KEY no configurada o configurada con valor por defecto en el archivo .env. La sincronización fallará.")
