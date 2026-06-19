import os
import logging
from app.services.worldcup_client import WorldCupClient
from app.models.team_2026 import Team2026, Stadium2026, Group2026
from app.models.match_2026 import Match2026

logger = logging.getLogger(__name__)

class WorldCupSyncService:
    def __init__(self, base_url="https://worldcup26.ir"):
        """
        Inicializa el servicio de sincronización.
        """
        self.client = WorldCupClient(base_url)

    def ensure_authenticated(self, email=None, password=None):
        """
        Garantiza que el cliente de la API esté autenticado.
        Si no hay token, intenta leer de variables de entorno si no se proveen.
        """
        if not self.client.token:
            e = email or os.getenv("WORLDCUP_API_EMAIL")
            p = password or os.getenv("WORLDCUP_API_PASSWORD")
            if not e or not p:
                raise ValueError("Se requieren credenciales (email y password) para la autenticación de la API.")
            self.client.authenticate(e, p)

    def run_full_sync(self, email=None, password=None):
        """
        Realiza la sincronización completa del Mundial 2026 en orden estricto de dependencias:
        1. Autenticación.
        2. Equipos (teams) -> UPSERT.
        3. Estadios (stadiums) -> UPSERT.
        4. Grupos (groups) -> UPSERT.
        5. Partidos (games) -> UPSERT (resolviendo relaciones locales).
        """
        try:
            print("Iniciando sincronización completa del Mundial 2026...")
            logger.info("Verificando autenticación...")
            self.ensure_authenticated(email, password)
            token = self.client.token

            # 1. Sincronizar Equipos
            print("Obteniendo equipos clasificados desde la API...")
            teams_data = self.client.get_teams(token)
            print(f"Sincronizando {len(teams_data)} equipos en la base de datos...")
            for t in teams_data:
                Team2026.upsert({
                    "api_team_id": str(t.get("id")),
                    "nombre_en": t.get("name_en"),
                    "codigo_fifa": t.get("fifa_code"),
                    "grupo": t.get("groups"),
                    "bandera_url": t.get("flag")
                })
            print("Equipos sincronizados exitosamente.")

            # 2. Sincronizar Estadios
            print("Obteniendo estadios sede desde la API...")
            stadiums_data = self.client.get_stadiums(token)
            print(f"Sincronizando {len(stadiums_data)} estadios en la base de datos...")
            for s in stadiums_data:
                Stadium2026.upsert({
                    "api_stadium_id": str(s.get("id")),
                    "nombre_en": s.get("name_en"),
                    "nombre_fifa": s.get("fifa_name"),
                    "ciudad": s.get("city_en"),
                    "pais": s.get("country_en"),
                    "capacidad": int(s.get("capacity")) if s.get("capacity") else None
                })
            print("Estadios sincronizados exitosamente.")

            # 3. Sincronizar Grupos
            print("Obteniendo posiciones de los grupos desde la API...")
            groups_data = self.client.get_groups(token)
            print(f"Sincronizando {len(groups_data)} grupos en la base de datos...")
            for g_item in groups_data:
                grupo = g_item.get("group")
                for idx, team_pos in enumerate(g_item.get("teams", [])):
                    gf = int(team_pos.get("gf", 0))
                    ga = int(team_pos.get("ga", 0))
                    Group2026.upsert({
                        "grupo": grupo,
                        "equipo_id": str(team_pos.get("team_id")),
                        "posicion": idx + 1,
                        "puntos": int(team_pos.get("pts", 0)),
                        "goles_favor": gf,
                        "goles_contra": ga,
                        "diferencia_gol": int(team_pos.get("gd", gf - ga)),
                        "partidos_jugados": int(team_pos.get("mp", team_pos.get("played", team_pos.get("played_games", 0)))),
                        "victorias": int(team_pos.get("w", team_pos.get("won", 0))),
                        "empates": int(team_pos.get("d", team_pos.get("drawn", 0))),
                        "derrotas": int(team_pos.get("l", team_pos.get("lost", 0)))
                    })
            print("Grupos sincronizados exitosamente.")

            # 4. Sincronizar Partidos (Games)
            # Primero cargamos en caché local equipos y estadios para no hacer queries en el loop
            teams_list = Team2026.get_all()
            teams_cache = {t["api_team_id"]: t for t in teams_list}
            stadiums_list = Stadium2026.get_all()
            stadiums_cache = {s["api_stadium_id"]: s for s in stadiums_list}

            print("Obteniendo fixture de partidos desde la API...")
            games_data = self.client.get_games(token)
            print(f"Sincronizando {len(games_data)} partidos en la base de datos...")
            for g in games_data:
                home_id = str(g.get("home_team_id", "0"))
                away_id = str(g.get("away_team_id", "0"))
                stadium_id = str(g.get("stadium_id", "0"))

                home_team = teams_cache.get(home_id)
                away_team = teams_cache.get(away_id)
                stadium = stadiums_cache.get(stadium_id)

                home_name = home_team["nombre_en"] if home_team else (g.get("home_team_name_en") or g.get("home_team_label") or "TBD")
                home_code = home_team["codigo_fifa"] if home_team else "TBD"
                home_logo = home_team["bandera_url"] if home_team else None

                away_name = away_team["nombre_en"] if away_team else (g.get("away_team_name_en") or g.get("away_team_label") or "TBD")
                away_code = away_team["codigo_fifa"] if away_team else "TBD"
                away_logo = away_team["bandera_url"] if away_team else None

                stadium_name = stadium["nombre_en"] if stadium else (g.get("stadium_nombre") or "TBD")
                ciudad = stadium["ciudad"] if stadium else "TBD"
                pais_sede = stadium["pais"] if stadium else "TBD"

                Match2026.upsert({
                    "api_game_id": str(g.get("id")),
                    "grupo": g.get("group"),
                    "tipo": g.get("type"),
                    "matchday": int(g.get("matchday")) if g.get("matchday") else None,
                    "fecha_local": g.get("local_date"),
                    "estadio_id": stadium_id,
                    "estadio_nombre": stadium_name,
                    "ciudad": ciudad,
                    "pais_sede": pais_sede,
                    "equipo_local_id": home_id,
                    "equipo_local_nombre": home_name,
                    "equipo_local_codigo": home_code,
                    "equipo_local_logo": home_logo,
                    "equipo_visitante_id": away_id,
                    "equipo_visitante_nombre": away_name,
                    "equipo_visitante_codigo": away_code,
                    "equipo_visitante_logo": away_logo,
                    "goles_local": int(g.get("home_score", 0)) if g.get("home_score") is not None and g.get("home_score") != "null" else 0,
                    "goles_visitante": int(g.get("away_score", 0)) if g.get("away_score") is not None and g.get("away_score") != "null" else 0,
                    "goleadores_local": self._parse_scorers(g.get("home_scorers")),
                    "goleadores_visitante": self._parse_scorers(g.get("away_scorers")),
                    "finalizado": g.get("finished", "FALSE").upper() == "TRUE",
                    "tiempo_transcurrido": g.get("time_elapsed", "notstarted"),
                    "etapa_detalle": g.get("home_team_label") if home_id == "0" else (g.get("away_team_label") if away_id == "0" else None)
                })
            
            print("Sincronización completa exitosa.")
            return {
                "success": True,
                "teams": len(teams_data),
                "stadiums": len(stadiums_data),
                "groups": len(groups_data),
                "matches": len(games_data)
            }
        except Exception as e:
            logger.error(f"Error fatal durante la sincronización completa del fixture 2026: {e}")
            print(f"ERROR EN SINCRONIZACIÓN COMPLETA: {e}")
            return {"success": False, "error": str(e)}

    def refresh_live_games(self, email=None, password=None):
        """
        Realiza una sincronización rápida enfocada únicamente en partidos y resultados (GET /get/games),
        ideal para invocar cada 2 minutos en segundo plano durante partidos en juego.
        """
        try:
            print("Iniciando actualización rápida de partidos en vivo...")
            logger.info("Verificando autenticación para actualización en vivo...")
            self.ensure_authenticated(email, password)
            token = self.client.token

            # Cargamos en caché local los equipos y estadios de la base de datos
            teams_list = Team2026.get_all()
            teams_cache = {t["api_team_id"]: t for t in teams_list}
            stadiums_list = Stadium2026.get_all()
            stadiums_cache = {s["api_stadium_id"]: s for s in stadiums_list}

            games_data = self.client.get_games(token)
            print(f"Sincronizando {len(games_data)} partidos actualizados en la base de datos...")
            
            for g in games_data:
                home_id = str(g.get("home_team_id", "0"))
                away_id = str(g.get("away_team_id", "0"))
                stadium_id = str(g.get("stadium_id", "0"))

                home_team = teams_cache.get(home_id)
                away_team = teams_cache.get(away_id)
                stadium = stadiums_cache.get(stadium_id)

                home_name = home_team["nombre_en"] if home_team else (g.get("home_team_name_en") or g.get("home_team_label") or "TBD")
                home_code = home_team["codigo_fifa"] if home_team else "TBD"
                home_logo = home_team["bandera_url"] if home_team else None

                away_name = away_team["nombre_en"] if away_team else (g.get("away_team_name_en") or g.get("away_team_label") or "TBD")
                away_code = away_team["codigo_fifa"] if away_team else "TBD"
                away_logo = away_team["bandera_url"] if away_team else None

                stadium_name = stadium["nombre_en"] if stadium else (g.get("stadium_nombre") or "TBD")
                ciudad = stadium["ciudad"] if stadium else "TBD"
                pais_sede = stadium["pais"] if stadium else "TBD"

                Match2026.upsert({
                    "api_game_id": str(g.get("id")),
                    "grupo": g.get("group"),
                    "tipo": g.get("type"),
                    "matchday": int(g.get("matchday")) if g.get("matchday") else None,
                    "fecha_local": g.get("local_date"),
                    "estadio_id": stadium_id,
                    "estadio_nombre": stadium_name,
                    "ciudad": ciudad,
                    "pais_sede": pais_sede,
                    "equipo_local_id": home_id,
                    "equipo_local_nombre": home_name,
                    "equipo_local_codigo": home_code,
                    "equipo_local_logo": home_logo,
                    "equipo_visitante_id": away_id,
                    "equipo_visitante_nombre": away_name,
                    "equipo_visitante_codigo": away_code,
                    "equipo_visitante_logo": away_logo,
                    "goles_local": int(g.get("home_score", 0)) if g.get("home_score") is not None and g.get("home_score") != "null" else 0,
                    "goles_visitante": int(g.get("away_score", 0)) if g.get("away_score") is not None and g.get("away_score") != "null" else 0,
                    "goleadores_local": self._parse_scorers(g.get("home_scorers")),
                    "goleadores_visitante": self._parse_scorers(g.get("away_scorers")),
                    "finalizado": g.get("finished", "FALSE").upper() == "TRUE",
                    "tiempo_transcurrido": g.get("time_elapsed", "notstarted"),
                    "etapa_detalle": g.get("home_team_label") if home_id == "0" else (g.get("away_team_label") if away_id == "0" else None)
                })
            
            print("Actualización rápida completada con éxito.")
            return {"success": True, "matches": len(games_data)}
        except Exception as e:
            logger.error(f"Error fatal durante la actualización de partidos en vivo: {e}")
            print(f"ERROR EN ACTUALIZACIÓN EN VIVO: {e}")
            return {"success": False, "error": str(e)}

    def refresh_live(self, email=None, password=None):
        """
        Alias de refresh_live_games() para compatibilidad con la documentación.
        """
        return self.refresh_live_games(email, password)

    def _parse_scorers(self, scorers):
        """
        Parsea los goleadores a un formato de cadena de texto plano compatible con columnas TEXT.
        """
        if not scorers or scorers == "null" or scorers == "None":
            return None
        if isinstance(scorers, list):
            return ", ".join(scorers)
        if isinstance(scorers, str):
            return scorers
        return str(scorers)
