import logging
from datetime import datetime, timedelta
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

            # 2b. Obtener posiciones de grupos desde ESPN
            espn_groups = {}
            try:
                print("[Sync] Obteniendo posiciones de grupos desde ESPN...")
                standings = self.espn.get_standings()
                for g in standings:
                    group_letter = g["grupo"]
                    for t in g["equipos"]:
                        Group2026.upsert({
                            "grupo": group_letter,
                            "equipo_id": t["equipo_id"],
                            "posicion": t["posicion"],
                            "puntos": t["puntos"],
                            "goles_favor": t["goles_favor"],
                            "goles_contra": t["goles_contra"],
                            "diferencia_gol": t["diferencia_gol"],
                            "partidos_jugados": t["partidos_jugados"],
                            "victorias": t["victorias"],
                            "empates": t["empates"],
                            "derrotas": t["derrotas"],
                        })
                        espn_groups[t["equipo_codigo"]] = group_letter
                print(f"[Sync] Grupos ESPN: {len(espn_groups)} equipos en {len(standings)} grupos.")
            except Exception as e:
                logger.warning(f"ESPN standings no disponible, usando worldcup_groups: {e}")
                print(f"[Sync] WARNING: ESPN standings fallo, usando worldcup_groups.py")

                # Fallback: crear posiciones en 0 desde worldcup_groups.py
                for t in teams_data:
                    abbrev = t["abbreviation"]
                    group = get_group_by_abbrev(abbrev)
                    if group:
                        teams_in_group = [x for x in teams_data if get_group_by_abbrev(x["abbreviation"]) == group]
                        pos = next((i + 1 for i, x in enumerate(teams_in_group) if x["abbreviation"] == abbrev), 1)
                        Group2026.upsert({
                            "grupo": group,
                            "equipo_id": str(t["id"]),
                            "posicion": pos,
                            "puntos": 0,
                            "goles_favor": 0,
                            "goles_contra": 0,
                            "diferencia_gol": 0,
                            "partidos_jugados": 0,
                            "victorias": 0,
                            "empates": 0,
                            "derrotas": 0,
                        })
                print(f"[Sync] Grupos fallback: {len(teams_data)} equipos con posiciones en 0.")
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
        Actualizacion rapida de partidos en vivo.
        Busca scoreboard de HOY y de AYER para capturar partidos que acabaron de finalizar.
        No limpia datos, solo actualiza partidos existentes.
        """
        try:
            teams_cache = {t["codigo_fifa"]: t for t in Team2026.get_all()}

            # Traer scoreboard de hoy + ayer
            all_espn_matches = []
            all_espn_matches.extend(self.espn.get_all_matches())

            yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y%m%d")
            try:
                yesterday_data = self.espn.get_scoreboard(date=yesterday)
                for event in yesterday_data.get("events", []):
                    for comp in event.get("competitions", []):
                        parsed = self.espn._parse_match(event, comp)
                        if parsed["api_game_id"] not in {m["api_game_id"] for m in all_espn_matches}:
                            all_espn_matches.append(parsed)
            except Exception:
                pass  # Si ayer no tiene datos, sigue con los de hoy

            if not all_espn_matches:
                return {"success": True, "matches": 0, "source": "espn"}

            for m in all_espn_matches:
                local = m["equipo_local"]
                visitante = m["equipo_visitante"]
                local_group = get_group_by_abbrev(local["code"])
                visitante_group = get_group_by_abbrev(visitante["code"])
                match_group = local_group or visitante_group

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

            print(f"[Sync] Refresh: {len(all_espn_matches)} partidos actualizados (hoy+ayer).")
            return {"success": True, "matches": len(all_espn_matches), "source": "espn"}
        except Exception as e:
            logger.warning(f"ESPN refresh fallo: {e}")
            return {"success": False, "error": str(e)}

    def refresh_live(self, email=None, password=None):
        return self.refresh_live_games(email, password)

    def _recalculate_groups(self, matches_data, teams_data):
        """
        Recalcula las posiciones de grupos a partir de los partidos finalizados.
        """
        # Construir mapa team_id -> grupo
        team_group = {}
        for t in teams_data:
            abbrev = t["abbreviation"]
            group = get_group_by_abbrev(abbrev)
            if group:
                team_group[str(t["id"])] = group

        # Acumular stats por equipo
        stats = {}
        for m in matches_data:
            if not m.get("finalizado"):
                continue
            local_id = str(m["equipo_local"]["id"])
            visit_id = str(m["equipo_visitante"]["id"])
            gl = m.get("goles_local", 0)
            gv = m.get("goles_visitante", 0)

            for tid, gf, gc in [(local_id, gl, gv), (visit_id, gv, gl)]:
                if tid not in stats:
                    stats[tid] = {"pj": 0, "pg": 0, "pe": 0, "pp": 0, "gf": 0, "gc": 0, "pts": 0}
                s = stats[tid]
                s["pj"] += 1
                s["gf"] += gf
                s["gc"] += gc
                if gf > gc:
                    s["pg"] += 1
                    s["pts"] += 3
                elif gf == gc:
                    s["pe"] += 1
                    s["pts"] += 1
                else:
                    s["pp"] += 1

        # Actualizar grupos_2026 con stats acumuladas
        for team_id, s in stats.items():
            group = team_group.get(team_id)
            if not group:
                continue
            Group2026.upsert({
                "grupo": group,
                "equipo_id": team_id,
                "posicion": 1,
                "puntos": s["pts"],
                "goles_favor": s["gf"],
                "goles_contra": s["gc"],
                "diferencia_gol": s["gf"] - s["gc"],
                "partidos_jugados": s["pj"],
                "victorias": s["pg"],
                "empates": s["pe"],
                "derrotas": s["pp"],
            })

        # Reordenar posiciones dentro de cada grupo
        all_groups = Group2026.get_standings()
        groups_map = {}
        for row in all_groups:
            g = row["grupo"]
            if g not in groups_map:
                groups_map[g] = []
            groups_map[g].append(row)

        for g, teams in groups_map.items():
            teams.sort(key=lambda x: (-x["puntos"], -x["diferencia_gol"], -x["goles_favor"]))
            for pos, t in enumerate(teams, 1):
                if t["posicion"] != pos:
                    Group2026.upsert({
                        "grupo": g,
                        "equipo_id": t["equipo_id"],
                        "posicion": pos,
                        "puntos": t["puntos"],
                        "goles_favor": t["goles_favor"],
                        "goles_contra": t["goles_contra"],
                        "diferencia_gol": t["diferencia_gol"],
                        "partidos_jugados": t["partidos_jugados"],
                        "victorias": t["victorias"],
                        "empates": t["empates"],
                        "derrotas": t["derrotas"],
                    })
