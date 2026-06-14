import time
import logging
from app.database import Database
from app.services.api_football_client import APIFootballClient
from app.utils.api_config import API_FOOTBALL_LEAGUE_ID, API_FOOTBALL_SEASON, API_FOOTBALL_KEY

logger = logging.getLogger(__name__)

class APISyncService:
    def __init__(self):
        self.client = APIFootballClient()
        self.league_id = API_FOOTBALL_LEAGUE_ID
        self.season = API_FOOTBALL_SEASON

    def run(self):
        logger.info("Iniciando servicio de sincronización API-Football...")

        # 1. Validar presencia de la API Key
        if not API_FOOTBALL_KEY or API_FOOTBALL_KEY == "tu_key_aqui":
            logger.error("Sincronización abortada: API_FOOTBALL_KEY no configurada.")
            return {
                "status": "error",
                "message": "Error de configuración: API_FOOTBALL_KEY no configurada en el archivo .env"
            }

        conn = None
        try:
            conn = Database.get_connection(autocommit=False)
            cursor = conn.cursor()

            # --- PASO 1: VERIFICAR O CREAR LA EDICIÓN "2026" ---
            cursor.execute("SELECT id FROM ediciones WHERE anio = %s", (self.season,))
            edicion_row = cursor.fetchone()

            if edicion_row:
                edicion_id = edicion_row["id"]
                logger.info(f"Edición {self.season} encontrada con ID {edicion_id}.")
            else:
                logger.info(f"Edición {self.season} no encontrada. Creando nueva edición...")
                cursor.execute(
                    "INSERT INTO ediciones (anio, pais_anfitrion, campeon) VALUES (%s, %s, %s)",
                    (self.season, "Norteamérica", "Por determinar")
                )
                edicion_id = cursor.lastrowid
                logger.info(f"Edición {self.season} creada exitosamente con ID {edicion_id}.")

            # --- PASO 2: OBTENER EQUIPOS DESDE LA API ---
            logger.info(f"Obteniendo equipos para la liga {self.league_id} y temporada {self.season}...")
            teams_data = self.client.get_teams(self.league_id, self.season)

            if not teams_data or "response" not in teams_data or not teams_data["response"]:
                # Manejar caso de error o sin datos
                if teams_data and "errors" in teams_data and teams_data["errors"]:
                    errors = teams_data["errors"]
                    if "rate_limit" in errors or (isinstance(errors, dict) and any("limit" in str(k).lower() or "limit" in str(v).lower() for k, v in errors.items())):
                        return {
                            "status": "partial",
                            "message": "No se pudo sincronizar debido al límite de peticiones diario (Rate Limit 429) alcanzado al intentar obtener equipos."
                        }
                
                # Mundial sin equipos disponibles aún
                logger.warning(f"La API no devolvió equipos para el Mundial {self.season}.")
                return {
                    "status": "no_data",
                    "message": f"No hay datos disponibles aun para el Mundial {self.season} en API-Football. Intente mas tarde."
                }

            teams_list = teams_data["response"]
            logger.info(f"Se encontraron {len(teams_list)} equipos en la API.")

            # --- PASO 3: OBTENER FIXTURES PARA CALCULAR ESTADÍSTICAS ---
            logger.info("Obteniendo partidos (fixtures) para acumular estadísticas en vivo...")
            fixtures_data = self.client.get_fixtures(self.league_id, self.season)
            
            # Inicializar acumuladores de estadísticas
            stats_acumuladas = {}
            for t_item in teams_list:
                t_id = int(t_item["team"]["id"])
                stats_acumuladas[t_id] = {
                    "played": 0,
                    "goals_for": 0,
                    "goals_against": 0
                }

            if fixtures_data and "response" in fixtures_data:
                for fix_item in fixtures_data["response"]:
                    status = fix_item["fixture"]["status"]["short"]
                    # Consideramos partidos jugados terminados
                    if status in ["FT", "AET", "PEN"]:
                        home_id = int(fix_item["teams"]["home"]["id"])
                        away_id = int(fix_item["teams"]["away"]["id"])
                        home_goals = fix_item["goals"]["home"] or 0
                        away_goals = fix_item["goals"]["away"] or 0

                        # Sumar home stats
                        if home_id in stats_acumuladas:
                            stats_acumuladas[home_id]["played"] += 1
                            stats_acumuladas[home_id]["goals_for"] += home_goals
                            stats_acumuladas[home_id]["goals_against"] += away_goals
                        
                        # Sumar away stats
                        if away_id in stats_acumuladas:
                            stats_acumuladas[away_id]["played"] += 1
                            stats_acumuladas[away_id]["goals_for"] += away_goals
                            stats_acumuladas[away_id]["goals_against"] += home_goals

            # --- PASO 4: SINCRONIZAR EQUIPOS (INSERT / UPDATE) ---
            logger.info("Guardando estadísticas de equipos en base de datos...")
            for t_item in teams_list:
                t_id = int(t_item["team"]["id"])
                t_name = t_item["team"]["name"]
                
                # Obtener estadísticas acumuladas (o 0 si no hay partidos)
                t_stats = stats_acumuladas.get(t_id, {"played": 0, "goals_for": 0, "goals_against": 0})

                # Verificar si ya existe el registro de equipo para esta edición
                cursor.execute(
                    "SELECT id FROM estadisticas_equipos WHERE edicion_id = %s AND pais_id = %s",
                    (edicion_id, t_id)
                )
                existing_team = cursor.fetchone()

                if existing_team:
                    # Actualizar existente
                    cursor.execute(
                        """
                        UPDATE estadisticas_equipos 
                        SET partidos_jugados = %s, nombre_pais = %s, goles_a_favor = %s, goles_en_contra = %s
                        WHERE id = %s
                        """,
                        (t_stats["played"], t_name, t_stats["goals_for"], t_stats["goals_against"], existing_team["id"])
                    )
                else:
                    # Insertar nuevo
                    cursor.execute(
                        """
                        INSERT INTO estadisticas_equipos 
                        (edicion_id, partidos_jugados, pais_id, nombre_pais, goles_a_favor, goles_en_contra, posesion_promedio)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (edicion_id, t_stats["played"], t_id, t_name, t_stats["goals_for"], t_stats["goals_against"], 0.00)
                    )

            # --- PASO 5: SINCRONIZAR JUGADORES POR EQUIPO (Soporte parcial para rate limit) ---
            logger.info("Iniciando sincronización de jugadores por cada selección...")
            equipos_sincronizados = 0
            jugadores_sincronizados = 0
            rate_limit_alcanzado = False

            for idx, t_item in enumerate(teams_list):
                t_id = int(t_item["team"]["id"])
                t_name = t_item["team"]["name"]

                # Límite preventivo de red (delay de 1 segundo)
                if idx > 0:
                    time.sleep(1)

                logger.info(f"({idx+1}/{len(teams_list)}) Sincronizando jugadores de {t_name} (ID: {t_id})...")
                players_data = self.client.get_players(t_id, self.season)

                # Verificar si alcanzamos el rate limit
                if not players_data or "response" not in players_data or not players_data["response"]:
                    if players_data and "errors" in players_data and players_data["errors"]:
                        errors = players_data["errors"]
                        if "rate_limit" in errors or (isinstance(errors, dict) and any("limit" in str(k).lower() or "limit" in str(v).lower() for k, v in errors.items())):
                            logger.warning(f"Rate limit detectado al consultar jugadores del equipo {t_name}. Deteniendo sincronización de jugadores.")
                            rate_limit_alcanzado = True
                            break
                    # Si no hay jugadores devueltos pero no es error, continuamos con el siguiente equipo
                    continue

                for p_item in players_data["response"]:
                    player_info = p_item["player"]
                    p_id = int(player_info["id"])
                    p_name = player_info["name"]

                    # Sumar estadísticas de todas las apariciones
                    p_stats_list = p_item.get("statistics", [])
                    p_appearances = 0
                    p_goals = 0
                    p_assists = 0
                    p_yellow = 0

                    for stat in p_stats_list:
                        # Filtrar estadísticas correspondientes a esta selección o copa
                        p_appearances += stat.get("games", {}).get("appearences") or 0
                        p_goals += stat.get("goals", {}).get("total") or 0
                        p_assists += stat.get("goals", {}).get("assists") or 0
                        p_yellow += stat.get("cards", {}).get("yellow") or 0

                    # Verificar si el jugador ya está registrado en la base de datos para esta edición
                    cursor.execute(
                        "SELECT id FROM estadisticas_jugadores WHERE edicion_id = %s AND jugador_id = %s",
                        (edicion_id, p_id)
                    )
                    existing_player = cursor.fetchone()

                    if existing_player:
                        # Actualizar
                        cursor.execute(
                            """
                            UPDATE estadisticas_jugadores
                            SET partidos_jugados = %s, nombre_jugador = %s, goles = %s, asistencias = %s, tarjetas_amarillas = %s
                            WHERE id = %s
                            """,
                            (p_appearances, p_name, p_goals, p_assists, p_yellow, existing_player["id"])
                        )
                    else:
                        # Insertar nuevo
                        cursor.execute(
                            """
                            INSERT INTO estadisticas_jugadores
                            (edicion_id, partidos_jugados, jugador_id, nombre_jugador, goles, asistencias, tarjetas_amarillas)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (edicion_id, p_appearances, p_id, p_name, p_goals, p_assists, p_yellow)
                        )
                    jugadores_sincronizados += 1

                equipos_sincronizados += 1

            # Guardar todos los cambios realizados
            conn.commit()
            logger.info("Sincronización confirmada en base de datos.")

            # Devolver resumen según el caso
            if rate_limit_alcanzado:
                return {
                    "status": "partial",
                    "message": f"Sincronizacion parcial del Mundial 2026 realizada debido a limitacion de peticiones API (Rate Limit 429). Equipos: {len(teams_list)}, Selecciones completadas: {equipos_sincronizados}, Jugadores: {jugadores_sincronizados}"
                }
            else:
                return {
                    "status": "success",
                    "message": f"Datos del Mundial 2026 sincronizados correctamente. Equipos: {len(teams_list)}, Jugadores: {jugadores_sincronizados}"
                }

        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error durante el proceso de sincronización API: {e}", exc_info=True)
            raise e
        finally:
            if conn:
                conn.close()
