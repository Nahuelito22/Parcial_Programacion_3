class Match:
    """
    Clase que representa un partido histórico del mundial.
    """
    def __init__(self, id: int, edicion_id: int, match_date, stage_name: str, group_name: str,
                 stadium_name: str, city_name: str, equipo_local_id: int, equipo_local_nombre: str,
                 equipo_visitante_id: int, equipo_visitante_nombre: str, goles_local: int,
                 goles_visitante: int, penales_local: int, penales_visitante: int,
                 extra_time: bool, resultado: str, external_match_id: str = None):
        self.id = id
        self.edicion_id = edicion_id
        self.match_date = match_date
        self.stage_name = stage_name
        self.group_name = group_name
        self.stadium_name = stadium_name
        self.city_name = city_name
        self.equipo_local_id = equipo_local_id
        self.equipo_local_nombre = equipo_local_nombre
        self.equipo_visitante_id = equipo_visitante_id
        self.equipo_visitante_nombre = equipo_visitante_nombre
        self.goles_local = goles_local
        self.goles_visitante = goles_visitante
        self.penales_local = penales_local
        self.penales_visitante = penales_visitante
        self.extra_time = extra_time
        self.resultado = resultado
        self.external_match_id = external_match_id

    @staticmethod
    def get_all_teams():
        """
        Retorna la lista de todas las selecciones (id y nombre) ordenadas alfabéticamente.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT pais_id as id, nombre_pais as nombre 
                    FROM estadisticas_equipos 
                    ORDER BY nombre_pais ASC
                """)
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_all_players():
        """
        Retorna la lista de todos los jugadores (id y nombre) ordenados alfabéticamente.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT jugador_id as id, nombre_jugador as nombre 
                    FROM estadisticas_jugadores 
                    ORDER BY nombre_jugador ASC
                """)
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_team_h2h_matches(team_a_id: int, team_b_id: int, edition_id: int = None):
        """
        Obtiene el historial de enfrentamientos directos entre dos selecciones.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    SELECT p.*, e.anio as edicion_anio
                    FROM partidos p
                    JOIN ediciones e ON p.edicion_id = e.id
                    WHERE (
                        (p.equipo_local_id = %s AND p.equipo_visitante_id = %s)
                        OR
                        (p.equipo_local_id = %s AND p.equipo_visitante_id = %s)
                    )
                """
                params = [team_a_id, team_b_id, team_b_id, team_a_id]
                if edition_id is not None:
                    query += " AND p.edicion_id = %s"
                    params.append(edition_id)
                query += " ORDER BY e.anio DESC, p.match_date DESC"
                
                cursor.execute(query, params)
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_team_stats(team_id: int, edition_id: int = None):
        """
        Obtiene estadísticas agregadas (goles, partidos, etc.) de una selección.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                if edition_id is not None:
                    query = """
                        SELECT 
                            nombre_pais as nombre,
                            partidos_jugados as total_partidos,
                            goles_a_favor,
                            goles_en_contra,
                            posesion_promedio
                        FROM estadisticas_equipos
                        WHERE pais_id = %s AND edicion_id = %s
                    """
                    cursor.execute(query, (team_id, edition_id))
                else:
                    query = """
                        SELECT 
                            nombre_pais as nombre,
                            SUM(partidos_jugados) as total_partidos,
                            SUM(goles_a_favor) as goles_a_favor,
                            SUM(goles_en_contra) as goles_en_contra,
                            AVG(posesion_promedio) as posesion_promedio
                        FROM estadisticas_equipos
                        WHERE pais_id = %s
                        GROUP BY nombre_pais
                    """
                    cursor.execute(query, (team_id,))
                
                row = cursor.fetchone()
                if not row:
                    # Intenta obtener el nombre de la selección desde los partidos si no tiene estadísticas
                    cursor.execute("SELECT DISTINCT equipo_local_nombre as nombre FROM partidos WHERE equipo_local_id = %s LIMIT 1", (team_id,))
                    fallback_row = cursor.fetchone()
                    if not fallback_row:
                        cursor.execute("SELECT DISTINCT equipo_visitante_nombre as nombre FROM partidos WHERE equipo_visitante_id = %s LIMIT 1", (team_id,))
                        fallback_row = cursor.fetchone()
                    
                    nombre = fallback_row["nombre"] if fallback_row else f"Selección {team_id}"
                    return {
                        "nombre": nombre,
                        "total_partidos": 0,
                        "goles_a_favor": 0,
                        "goles_en_contra": 0,
                        "posesion_promedio": 0.0,
                        "titulos": 0
                    }
                
                # Calcular cantidad de títulos ganados (campeón en ediciones)
                cursor.execute("SELECT COUNT(*) as titles FROM ediciones WHERE campeon = %s", (row["nombre"],))
                titles_row = cursor.fetchone()
                titles = titles_row["titles"] if titles_row else 0

                return {
                    "nombre": row["nombre"],
                    "total_partidos": int(row["total_partidos"]),
                    "goles_a_favor": int(row["goles_a_favor"]),
                    "goles_en_contra": int(row["goles_en_contra"]),
                    "posesion_promedio": float(row["posesion_promedio"]) if row["posesion_promedio"] is not None else 0.0,
                    "titulos": titles
                }
        finally:
            conn.close()

    @staticmethod
    def get_player_stats(player_id: int, edition_id: int = None):
        """
        Obtiene estadísticas agregadas (goles, asistencias, tarjetas) de un jugador.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                if edition_id is not None:
                    query = """
                        SELECT 
                            nombre_jugador as nombre,
                            partidos_jugados as total_partidos,
                            goles,
                            asistencias,
                            tarjetas_amarillas
                        FROM estadisticas_jugadores
                        WHERE jugador_id = %s AND edicion_id = %s
                    """
                    cursor.execute(query, (player_id, edition_id))
                else:
                    query = """
                        SELECT 
                            nombre_jugador as nombre,
                            SUM(partidos_jugados) as total_partidos,
                            SUM(goles) as goles,
                            SUM(asistencias) as asistencias,
                            SUM(tarjetas_amarillas) as tarjetas_amarillas
                        FROM estadisticas_jugadores
                        WHERE jugador_id = %s
                        GROUP BY nombre_jugador
                    """
                    cursor.execute(query, (player_id,))
                
                row = cursor.fetchone()
                if not row:
                    return None
                
                return {
                    "nombre": row["nombre"],
                    "total_partidos": int(row["total_partidos"]),
                    "goles": int(row["goles"]),
                    "asistencias": int(row["asistencias"]),
                    "tarjetas_amarillas": int(row["tarjetas_amarillas"])
                }
        finally:
            conn.close()
