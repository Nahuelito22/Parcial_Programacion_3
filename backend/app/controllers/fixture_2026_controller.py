import os
from flask import request, jsonify
from app.models.match_2026 import Match2026
from app.models.team_2026 import Team2026, Stadium2026, Group2026
from app.models.stats_2026 import Goleador2026, Asistencia2026, Tarjeta2026
from app.services.worldcup_sync_service import WorldCupSyncService
from app.services.espn_stats_scraper import ESPNStatsScraper

def format_match(match, stadiums_cache):
    """
    Formatea un partido al formato JSON esperado por el frontend.
    """
    stadium_id = match.get("estadio_id")
    stadium_info = stadiums_cache.get(stadium_id) if stadium_id else None
    capacidad = stadium_info.get("capacidad") if stadium_info else None
    
    finalizado = bool(match.get("finalizado"))
    
    goleadores_local = match.get("goleadores_local")
    if goleadores_local:
        goleadores_local = [s.strip() for s in goleadores_local.split(",")] if isinstance(goleadores_local, str) else goleadores_local
        
    goleadores_visitante = match.get("goleadores_visitante")
    if goleadores_visitante:
        goleadores_visitante = [s.strip() for s in goleadores_visitante.split(",")] if isinstance(goleadores_visitante, str) else goleadores_visitante

    return {
        "id": match.get("api_game_id"),
        "grupo": match.get("grupo"),
        "tipo": match.get("tipo"),
        "matchday": match.get("matchday"),
        "fecha": match.get("fecha_local"),
        "estadio": {
            "nombre": match.get("estadio_nombre"),
            "ciudad": match.get("ciudad"),
            "capacidad": capacidad
        },
        "local": {
            "id": match.get("equipo_local_id"),
            "nombre": match.get("equipo_local_nombre"),
            "codigo": match.get("equipo_local_codigo"),
            "bandera": match.get("equipo_local_logo")
        },
        "visitante": {
            "id": match.get("equipo_visitante_id"),
            "nombre": match.get("equipo_visitante_nombre"),
            "codigo": match.get("equipo_visitante_codigo"),
            "bandera": match.get("equipo_visitante_logo")
        },
        "goles_local": match.get("goles_local"),
        "goles_visitante": match.get("goles_visitante"),
        "goleadores_local": goleadores_local,
        "goleadores_visitante": goleadores_visitante,
        "finalizado": finalizado,
        "estado": match.get("tiempo_transcurrido"),
        "etapa_detalle": match.get("etapa_detalle")
    }

def get_all_fixtures():
    """
    Retorna la lista de partidos con filtros dinámicos y estadísticas agrupadas.
    """
    try:
        filters = {
            "grupo": request.args.get("grupo"),
            "tipo": request.args.get("tipo"),
            "equipo": request.args.get("equipo"),
            "estado": request.args.get("estado"),
            "matchday": request.args.get("matchday")
        }
        
        matches = Match2026.get_all(filters)
        
        # Obtener caché de estadios
        stadiums = Stadium2026.get_all()
        stadiums_cache = {s["api_stadium_id"]: s for s in stadiums}
        
        formatted_matches = []
        en_vivo_count = 0
        finalizados_count = 0
        proximos_count = 0
        
        for m in matches:
            fmt = format_match(m, stadiums_cache)
            formatted_matches.append(fmt)
            
            finalizado = bool(m.get("finalizado"))
            status = m.get("tiempo_transcurrido")
            
            if finalizado:
                finalizados_count += 1
            elif status == "notstarted":
                proximos_count += 1
            else:
                en_vivo_count += 1
                
        response = {
            "total": len(formatted_matches),
            "en_vivo": en_vivo_count,
            "finalizados": finalizados_count,
            "proximos": proximos_count,
            "partidos": formatted_matches
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener partidos: {str(e)}"}), 500

def get_fixture_by_id(fixture_id):
    """
    Retorna los detalles de un partido específico por su ID.
    """
    try:
        match = Match2026.get_by_api_id(fixture_id)
        if not match:
            return jsonify({"message": "Partido no encontrado."}), 404
            
        stadiums = Stadium2026.get_all()
        stadiums_cache = {s["api_stadium_id"]: s for s in stadiums}
        
        formatted = format_match(match, stadiums_cache)
        return jsonify(formatted), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener detalle del partido: {str(e)}"}), 500

def get_all_teams():
    """
    Retorna la lista de todas las selecciones registradas para el Mundial 2026.
    """
    try:
        teams = Team2026.get_all()
        return jsonify(teams), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener equipos: {str(e)}"}), 500

def get_team_by_id(team_id):
    """
    Retorna la información de un equipo individual por su ID.
    """
    try:
        team = Team2026.get_by_api_id(team_id)
        if not team:
            return jsonify({"message": "Equipo no encontrado."}), 404
        return jsonify(team), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener detalle del equipo: {str(e)}"}), 500

def get_all_groups():
    """
    Retorna las posiciones de clasificación agrupadas por zona (Grupo A-L).
    """
    try:
        standings = Group2026.get_standings()
        
        groups_dict = {}
        for row in standings:
            g_letter = row["grupo"]
            if g_letter not in groups_dict:
                groups_dict[g_letter] = []
            
            groups_dict[g_letter].append({
                "team_id": row["equipo_id"],
                "nombre": row["equipo_nombre"],
                "codigo": row["equipo_codigo"],
                "bandera": row["equipo_bandera"],
                "pts": row["puntos"],
                "pj": row["partidos_jugados"],
                "pg": row["victorias"],
                "pe": row["empates"],
                "pp": row["derrotas"],
                "gf": row["goles_favor"],
                "gc": row["goles_contra"],
                "dg": row["diferencia_gol"]
            })
            
        result = []
        for g_letter in sorted(groups_dict.keys()):
            result.append({
                "grupo": g_letter,
                "equipos": groups_dict[g_letter]
            })
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener posiciones de grupos: {str(e)}"}), 500

def get_all_stadiums():
    """
    Retorna la lista de todas las sedes del Mundial 2026.
    """
    try:
        stadiums = Stadium2026.get_all()
        return jsonify(stadiums), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener estadios: {str(e)}"}), 500

def sync_2026():
    """
    Ejecuta el proceso completo de sincronización de la API de worldcup2026.ir.
    Requiere que se hayan configurado las variables WORLDCUP_API_EMAIL y WORLDCUP_API_PASSWORD en el .env.
    """
    try:
        email = os.getenv("WORLDCUP_API_EMAIL")
        password = os.getenv("WORLDCUP_API_PASSWORD")
        
        sync_service = WorldCupSyncService()
        result = sync_service.run_full_sync(email, password)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "message": f"Error al sincronizar: {result.get('error')}"
            }), 502
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error interno en el servidor: {str(e)}"
        }), 500

def refresh_live_2026():
    """
    Ejecuta una actualización rápida de partidos en vivo y resultados en curso de la API.
    """
    try:
        email = os.getenv("WORLDCUP_API_EMAIL")
        password = os.getenv("WORLDCUP_API_PASSWORD")
        
        sync_service = WorldCupSyncService()
        result = sync_service.refresh_live_games(email, password)
        
        if result.get("success"):
            return jsonify(result), 200
        else:
            return jsonify({
                "success": False,
                "message": f"Error al refrescar partidos en vivo: {result.get('error')}"
            }), 502
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error interno en el servidor: {str(e)}"
        }), 500


def get_stats():
    """
    Retorna estadisticas del Mundial 2026: goleadores, asistencias, tarjetas.
    Soporta paginacion via query params: limit, page, tab.
    """
    try:
        limit = int(request.args.get("limit", 20))
        page = int(request.args.get("page", 1))
        tab = request.args.get("tab", "goleadores")
        offset = (page - 1) * limit

        if tab == "asistencias":
            rows = Asistencia2026.get_all(limit, offset)
            total = Asistencia2026.count()
            return jsonify({"items": rows, "total": total, "page": page, "limit": limit}), 200
        elif tab == "tarjetas":
            rows = Tarjeta2026.get_all(limit, offset)
            total = Tarjeta2026.count()
            return jsonify({"items": rows, "total": total, "page": page, "limit": limit}), 200
        else:
            rows = Goleador2026.get_all(limit, offset)
            total = Goleador2026.count()
            return jsonify({"items": rows, "total": total, "page": page, "limit": limit}), 200
    except Exception as e:
        return jsonify({"message": f"Error al obtener estadisticas: {str(e)}"}), 500


def sync_stats():
    """
    Scrapea estadisticas desde ESPN y las guarda en la base de datos.
    """
    try:
        scraper = ESPNStatsScraper()

        goleadores = scraper.scrape_goals()
        Goleador2026.delete_all()
        for g in goleadores:
            Goleador2026.upsert({
                "api_player_id": None,
                "nombre": g["nombre"],
                "equipo": g["equipo"],
                "equipo_codigo": g["equipo_codigo"],
                "partidos": g["partidos"],
                "goles": g["goles"],
            })

        asistencias = scraper.scrape_assists()
        Asistencia2026.delete_all()
        for a in asistencias:
            Asistencia2026.upsert({
                "api_player_id": None,
                "nombre": a["nombre"],
                "equipo": a["equipo"],
                "equipo_codigo": a["equipo_codigo"],
                "partidos": a["partidos"],
                "asistencias": a["asistencias"],
            })

        tarjetas = scraper.scrape_cards()
        Tarjeta2026.delete_all()
        for t in tarjetas:
            Tarjeta2026.upsert({
                "equipo": t["equipo"],
                "equipo_codigo": t["equipo_codigo"],
                "partidos": t["partidos"],
                "amarillas": t["amarillas"],
                "rojas": t["rojas"],
                "puntos": t["puntos"],
            })

        return jsonify({
            "success": True,
            "goleadores": len(goleadores),
            "asistencias": len(asistencias),
            "tarjetas": len(tarjetas),
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al sincronizar estadisticas: {str(e)}"
        }), 500
