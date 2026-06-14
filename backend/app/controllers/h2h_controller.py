from flask import request, jsonify
from app.models.match import Match
from app.models.edition import Edition

def get_teams():
    """
    Retorna la lista de todas las selecciones registradas en el sistema.
    """
    try:
        teams = Match.get_all_teams()
        return jsonify(teams), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las selecciones.", "error": str(e)}), 500

def get_players():
    """
    Retorna la lista de todos los jugadores registrados en el sistema.
    """
    try:
        players = Match.get_all_players()
        return jsonify(players), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener los jugadores.", "error": str(e)}), 500

def get_team_h2h(id_a, id_b):
    """
    Retorna la comparación Head-to-Head (resumen e historial) entre dos selecciones.
    """
    edition_val = request.args.get("edicion")
    edition_id = None
    if edition_val:
        try:
            edition_id = int(edition_val)
        except ValueError:
            return jsonify({"message": "El parámetro edicion debe ser un entero."}), 400

    try:
        stats_a = Match.get_team_stats(id_a, edition_id)
        stats_b = Match.get_team_stats(id_b, edition_id)

        # Si no hay estadísticas ni partidos registrados para ninguno, puede ser que no existan en DB
        if not stats_a and not stats_b:
            return jsonify({"message": "Selecciones no encontradas en el sistema."}), 404

        matches = Match.get_team_h2h_matches(id_a, id_b, edition_id)

        total_partidos = len(matches)
        victorias_a = 0
        victorias_b = 0
        empates = 0
        goles_a = 0
        goles_b = 0

        for m in matches:
            g_local = int(m.get("goles_local", 0))
            g_visit = int(m.get("goles_visitante", 0))
            resultado = m.get("resultado")

            if int(m["equipo_local_id"]) == int(id_a):
                goles_a += g_local
                goles_b += g_visit
                if resultado == "local":
                    victorias_a += 1
                elif resultado == "visitante":
                    victorias_b += 1
                else:
                    empates += 1
            else:
                goles_b += g_local
                goles_a += g_visit
                if resultado == "local":
                    victorias_b += 1
                elif resultado == "visitante":
                    victorias_a += 1
                else:
                    empates += 1

        partidos_list = []
        for m in matches:
            partidos_list.append({
                "edicion_anio": m["edicion_anio"],
                "fecha": str(m["match_date"]) if m["match_date"] else None,
                "estadio": m["stadium_name"],
                "local": m["equipo_local_nombre"],
                "visitante": m["equipo_visitante_nombre"],
                "goles_local": m["goles_local"],
                "goles_visitante": m["goles_visitante"],
                "penales_local": m["penales_local"],
                "penales_visitante": m["penales_visitante"],
                "resultado": m["resultado"]
            })

        response_data = {
            "equipo_a": {
                "id": int(id_a),
                "nombre": stats_a["nombre"],
                "stats": stats_a
            },
            "equipo_b": {
                "id": int(id_b),
                "nombre": stats_b["nombre"],
                "stats": stats_b
            },
            "resumen": {
                "total_partidos": total_partidos,
                "victorias_a": victorias_a,
                "empates": empates,
                "victorias_b": victorias_b,
                "goles_a": goles_a,
                "goles_b": goles_b
            },
            "partidos": partidos_list
        }

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"message": "Error al calcular el Head-to-Head de selecciones.", "error": str(e)}), 500

def get_player_h2h(id_a, id_b):
    """
    Retorna la comparación Head-to-Head de estadísticas individuales entre dos jugadores.
    """
    edition_val = request.args.get("edicion")
    edition_id = None
    if edition_val:
        try:
            edition_id = int(edition_val)
        except ValueError:
            return jsonify({"message": "El parámetro edicion debe ser un entero."}), 400

    try:
        stats_a = Match.get_player_stats(id_a, edition_id)
        stats_b = Match.get_player_stats(id_b, edition_id)

        # Si ninguno tiene estadísticas registradas
        if not stats_a and not stats_b:
            return jsonify({"message": "Jugadores no encontrados en la base de datos."}), 404

        # Fallbacks en caso de que uno de los dos no tenga datos para esa edición
        if not stats_a:
            stats_a = {
                "nombre": f"Jugador A",
                "total_partidos": 0,
                "goles": 0,
                "asistencias": 0,
                "tarjetas_amarillas": 0
            }
        if not stats_b:
            stats_b = {
                "nombre": f"Jugador B",
                "total_partidos": 0,
                "goles": 0,
                "asistencias": 0,
                "tarjetas_amarillas": 0
            }

        response_data = {
            "jugador_a": {
                "id": int(id_a),
                "nombre": stats_a["nombre"],
                "stats": stats_a
            },
            "jugador_b": {
                "id": int(id_b),
                "nombre": stats_b["nombre"],
                "stats": stats_b
            }
        }

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"message": "Error al calcular el Head-to-Head de jugadores.", "error": str(e)}), 500
