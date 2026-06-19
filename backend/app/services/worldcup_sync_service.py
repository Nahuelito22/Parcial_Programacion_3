import logging
from app.services.espn_client import ESPNClient
from app.services.espn_stats_scraper import ESPNStatsScraper
from app.services.worldcup_groups import get_group_by_abbrev
from app.models.team_2026 import Team2026, Stadium2026, Group2026
from app.models.match_2026 import Match2026
from app.models.stats_2026 import Goleador2026, Asistencia2026, Tarjeta2026

logger = logging.getLogger(__name__)


class WorldCupSyncService:
    """
    Servicio de sincronizacion del Mundial 2026.
    Fuente unica: ESPN API.
    """

    def __init__(self):
        self.espn = ESPNClient()
        self._last_source = None

    def run_full_sync(self, email=None, password=None):
        """
        Sincronizacion completa: ESPN teams + scoreboard + groups from mapping.
        Limpia datos viejos antes de insertar.
        """
        print("[Sync] Iniciando sincronizacion completa (ESPN)...")

        # 1. Limpiar datos viejos
        print("[Sync] Limpiando datos anteriores...")
        Match2026.delete_all()
        Group2026.delete_all()
        Stadium2026.delete_all()
        Team2026.delete_all()

        # 2. Equipos desde ESPN
        teams_data = []
        try:
            print("[Sync] Obteniendo equipos desde ESPN...")
            teams_data = self.espn.get_teams()
            teams_cache = {}
            for t in teams_data:
                abbrev = t["abbreviation"]
                group = get_group_by_abbrev(abbrev)
                Team2026.upsert({
                    "api_team_id": str(t["id"]),
                    "nombre_en": t["displayName"],
                    "codigo_fifa": abbrev,
                    "grupo": group,
                    "bandera_url": t["logo"],
                })
                teams_cache[abbrev] = {
                    "api_team_id": str(t["id"]),
                    "nombre_en": t["displayName"],
                    "codigo_fifa": abbrev,
                    "bandera_url": t["logo"],
                }
            print(f"[Sync] {len(teams_data)} equipos sincronizados.")
        except Exception as e:
            logger.error(f"Error obteniendo equipos de ESPN: {e}")
            print(f"[Sync] ERROR: No se pudieron obtener equipos: {e}")
            return {"success": False, "error": str(e)}

        # 3. Estadios desde el scoreboard (ESPN no tiene endpoint dedicado)
        stadiums_seen = {}
        matches_data = []

        # 4. Partidos desde el scoreboard
        try:
            print("[Sync] Obteniendo scoreboard desde ESPN...")
            matches_data = self.espn.get_all_matches()
            for m in matches_data:
                stadium_name = m.get("estadio_nombre", "TBD")
                city = m.get("ciudad", "TBD")
                key = f"{stadium_name}|{city}"
                if key not in stadiums_seen:
                    stadiums_seen[key] = {
                        "nombre": stadium_name,
                        "ciudad": city,
                    }

            # Insertar estadios unicos
            for idx, (key, info) in enumerate(stadiums_seen.items(), 1):
                Stadium2026.upsert({
                    "api_stadium_id": str(idx),
                    "nombre_en": info["nombre"],
                    "nombre_fifa": info["nombre"],
                    "ciudad": info["ciudad"],
                    "pais": "Multiple",
                    "capacidad": None,
                })
            print(f"[Sync] {len(stadiums_seen)} estadios detectados.")

            # Insertar partidos
            for m in matches_data:
                local = m["equipo_local"]
                visitante = m["equipo_visitante"]
                local_group = get_group_by_abbrev(local["code"])
                visitante_group = get_group_by_abbrev(visitante["code"])
                match_group = local_group or visitante_group

                Match2026.upsert({
                    "api_game_id": m["api_game_id"],
                    "grupo": match_group,
                    "tipo": m.get("tipo", "group"),
                    "matchday": m.get("matchday"),
                    "fecha_local": m.get("fecha_local"),
                    "estadio_id": None,
                    "estadio_nombre": m.get("estadio_nombre", "TBD"),
                    "ciudad": m.get("ciudad", "TBD"),
                    "pais_sede": None,
                    "equipo_local_id": local["id"],
                    "equipo_local_nombre": local["name"],
                    "equipo_local_codigo": local["code"],
                    "equipo_local_logo": local["logo"],
                    "equipo_visitante_id": visitante["id"],
                    "equipo_visitante_nombre": visitante["name"],
                    "equipo_visitante_codigo": visitante["code"],
                    "equipo_visitante_logo": visitante["logo"],
                    "goles_local": m.get("goles_local", 0),
                    "goles_visitante": m.get("goles_visitante", 0),
                    "goleadores_local": None,
                    "goleadores_visitante": None,
                    "finalizado": m.get("finalizado", False),
                    "tiempo_transcurrido": m.get("tiempo_transcurrido", "notstarted"),
                    "etapa_detalle": m.get("etapa_detalle"),
                })
            print(f"[Sync] {len(matches_data)} partidos sincronizados.")

        except Exception as e:
            logger.error(f"Error obteniendo scoreboard de ESPN: {e}")
            print(f"[Sync] ERROR: No se pudo obtener scoreboard: {e}")
            return {"success": False, "error": str(e)}

        self._last_source = "espn"
        result = {
            "success": True,
            "source": "espn",
            "teams": len(teams_data),
            "stadiums": len(stadiums_seen),
            "matches": len(matches_data),
        }

        # 5. Estadisticas (goleadores, asistencias, tarjetas)
        try:
            print("[Sync] Obteniendo estadisticas desde ESPN...")
            scraper = ESPNStatsScraper()

            goleadores = scraper.scrape_goals()
            Goleador2026.delete_all()
            for g in goleadores:
                Goleador2026.upsert({
                    "api_player_id": None, "nombre": g["nombre"],
                    "equipo": g["equipo"], "equipo_codigo": g["equipo_codigo"],
                    "partidos": g["partidos"], "goles": g["goles"],
                })

            asistencias = scraper.scrape_assists()
            Asistencia2026.delete_all()
            for a in asistencias:
                Asistencia2026.upsert({
                    "api_player_id": None, "nombre": a["nombre"],
                    "equipo": a["equipo"], "equipo_codigo": a["equipo_codigo"],
                    "partidos": a["partidos"], "asistencias": a["asistencias"],
                })

            tarjetas = scraper.scrape_cards()
            Tarjeta2026.delete_all()
            for t in tarjetas:
                Tarjeta2026.upsert({
                    "equipo": t["equipo"], "equipo_codigo": t["equipo_codigo"],
                    "partidos": t["partidos"], "amarillas": t["amarillas"],
                    "rojas": t["rojas"], "puntos": t["puntos"],
                })

            result["goleadores"] = len(goleadores)
            result["asistencias"] = len(asistencias)
            result["tarjetas"] = len(tarjetas)
            print(f"[Sync] Estadisticas: {len(goleadores)} goleadores, {len(asistencias)} asistencias, {len(tarjetas)} equipos con tarjetas.")
        except Exception as e:
            logger.warning(f"Error obteniendo estadisticas: {e}")
            print(f"[Sync] WARNING: No se pudieron obtener estadisticas: {e}")

        print(f"[Sync] Sincronizacion completa. Fuente: ESPN")
        return result

    def refresh_live_games(self, email=None, password=None):
        """
        Actualizacion rapida de partidos en vivo. Solo scoreboard de ESPN.
        No limpia datos, solo actualiza partidos existentes.
        """
        try:
            espn_matches = self.espn.get_all_matches()
            if not espn_matches:
                return {"success": True, "matches": 0, "source": "espn"}

            teams_cache = {t["codigo_fifa"]: t for t in Team2026.get_all()}

            for m in espn_matches:
                local = m["equipo_local"]
                visitante = m["equipo_visitante"]
                local_group = get_group_by_abbrev(local["code"])
                visitante_group = get_group_by_abbrev(visitante["code"])
                match_group = local_group or visitante_group

                # Buscar logos del cache local si ESPN no los tiene
                local_logo = local["logo"]
                if not local_logo and local["code"] in teams_cache:
                    local_logo = teams_cache[local["code"]].get("bandera_url")

                away_logo = visitante["logo"]
                if not away_logo and visitante["code"] in teams_cache:
                    away_logo = teams_cache[visitante["code"]].get("bandera_url")

                Match2026.upsert({
                    "api_game_id": m["api_game_id"],
                    "grupo": match_group,
                    "tipo": m.get("tipo", "group"),
                    "matchday": m.get("matchday"),
                    "fecha_local": m.get("fecha_local"),
                    "estadio_id": None,
                    "estadio_nombre": m.get("estadio_nombre", "TBD"),
                    "ciudad": m.get("ciudad", "TBD"),
                    "pais_sede": None,
                    "equipo_local_id": local["id"],
                    "equipo_local_nombre": local["name"],
                    "equipo_local_codigo": local["code"],
                    "equipo_local_logo": local_logo,
                    "equipo_visitante_id": visitante["id"],
                    "equipo_visitante_nombre": visitante["name"],
                    "equipo_visitante_codigo": visitante["code"],
                    "equipo_visitante_logo": away_logo,
                    "goles_local": m.get("goles_local", 0),
                    "goles_visitante": m.get("goles_visitante", 0),
                    "goleadores_local": None,
                    "goleadores_visitante": None,
                    "finalizado": m.get("finalizado", False),
                    "tiempo_transcurrido": m.get("tiempo_transcurrido", "notstarted"),
                    "etapa_detalle": m.get("etapa_detalle"),
                })

            print(f"[Sync] Refresh: {len(espn_matches)} partidos actualizados.")
            return {"success": True, "matches": len(espn_matches), "source": "espn"}
        except Exception as e:
            logger.warning(f"ESPN refresh falló: {e}")
            return {"success": False, "error": str(e)}

    def refresh_live(self, email=None, password=None):
        return self.refresh_live_games(email, password)
