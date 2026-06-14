from flask import request, jsonify
from app.database import Database

def get_top_scorers():
    """
    Retorna el ranking de goleadores históricos o de una edición específica.
    """
    edicion_val = request.args.get("edicion_id")
    limit_val = request.args.get("limit", "10")
    
    edition_id = None
    if edicion_val:
        try:
            edition_id = int(edicion_val)
        except ValueError:
            return jsonify({"message": "edicion_id debe ser un número entero."}), 400
            
    try:
        limit = int(limit_val)
    except ValueError:
        return jsonify({"message": "limit debe ser un número entero."}), 400

    conn = Database.get_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    jugador_id as id,
                    nombre_jugador as nombre,
                    SUM(goles) AS total_goles,
                    SUM(asistencias) AS total_asistencias,
                    SUM(partidos_jugados) AS total_partidos,
                    COUNT(DISTINCT edicion_id) AS ediciones_disputadas
                FROM estadisticas_jugadores
                WHERE (%s IS NULL OR edicion_id = %s)
                GROUP BY jugador_id, nombre_jugador
                HAVING total_goles > 0
                ORDER BY total_goles DESC, total_partidos ASC
                LIMIT %s
            """
            cursor.execute(query, (edition_id, edition_id, limit))
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "id": int(r["id"]),
                    "nombre": r["nombre"],
                    "goles": int(r["total_goles"]),
                    "asistencias": int(r["total_asistencias"]),
                    "partidos_jugados": int(r["total_partidos"]),
                    "ediciones": int(r["ediciones_disputadas"])
                })
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener goleadores.", "error": str(e)}), 500
    finally:
        conn.close()

def get_participations():
    """
    Retorna el ranking de selecciones con más participaciones (ediciones disputadas).
    """
    edicion_val = request.args.get("edicion_id")
    limit_val = request.args.get("limit", "10")
    
    edition_id = None
    if edicion_val:
        try:
            edition_id = int(edicion_val)
        except ValueError:
            return jsonify({"message": "edicion_id debe ser un número entero."}), 400
            
    try:
        limit = int(limit_val)
    except ValueError:
        return jsonify({"message": "limit debe ser un número entero."}), 400

    conn = Database.get_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    pais_id as id,
                    nombre_pais as nombre,
                    COUNT(DISTINCT edicion_id) AS total_participaciones,
                    SUM(partidos_jugados) AS total_partidos
                FROM estadisticas_equipos
                WHERE (%s IS NULL OR edicion_id = %s)
                GROUP BY pais_id, nombre_pais
                ORDER BY total_participaciones DESC, total_partidos DESC
                LIMIT %s
            """
            cursor.execute(query, (edition_id, edition_id, limit))
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "id": int(r["id"]),
                    "nombre": r["nombre"],
                    "participaciones": int(r["total_participaciones"]),
                    "partidos_jugados": int(r["total_partidos"])
                })
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener participaciones.", "error": str(e)}), 500
    finally:
        conn.close()

def get_best_attacks():
    """
    Retorna el ranking de selecciones con mejor promedio de goles a favor.
    """
    edicion_val = request.args.get("edicion_id")
    limit_val = request.args.get("limit", "10")
    
    edition_id = None
    if edicion_val:
        try:
            edition_id = int(edicion_val)
        except ValueError:
            return jsonify({"message": "edicion_id debe ser un número entero."}), 400
            
    try:
        limit = int(limit_val)
    except ValueError:
        return jsonify({"message": "limit debe ser un número entero."}), 400

    conn = Database.get_connection()
    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    pais_id as id,
                    nombre_pais as nombre,
                    SUM(goles_a_favor) AS total_goles,
                    SUM(partidos_jugados) AS total_partidos,
                    ROUND(SUM(goles_a_favor) / GREATEST(SUM(partidos_jugados), 1), 2) AS promedio_goles
                FROM estadisticas_equipos
                WHERE (%s IS NULL OR edicion_id = %s)
                GROUP BY pais_id, nombre_pais
                HAVING total_partidos > 0
                ORDER BY promedio_goles DESC, total_goles DESC
                LIMIT %s
            """
            cursor.execute(query, (edition_id, edition_id, limit))
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "id": int(r["id"]),
                    "nombre": r["nombre"],
                    "goles": int(r["total_goles"]),
                    "partidos_jugados": int(r["total_partidos"]),
                    "promedio": float(r["promedio_goles"])
                })
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener mejor ataque.", "error": str(e)}), 500
    finally:
        conn.close()
