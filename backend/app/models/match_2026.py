from app.database import Database

class Match2026:
    """
    Clase que representa un partido del fixture del Mundial 2026 en vivo.
    """
    def __init__(self, id=None, api_game_id=None, grupo=None, tipo=None, matchday=None,
                 fecha_local=None, estadio_id=None, estadio_nombre=None, ciudad=None,
                 pais_sede=None, equipo_local_id=None, equipo_local_nombre=None,
                 equipo_local_codigo=None, equipo_local_logo=None, equipo_visitante_id=None,
                 equipo_visitante_nombre=None, equipo_visitante_codigo=None,
                 equipo_visitante_logo=None, goles_local=0, goles_visitante=0,
                 goleadores_local=None, goleadores_visitante=None, finalizado=False,
                 tiempo_transcurrido=None, etapa_detalle=None, actualizado_en=None):
        self.id = id
        self.api_game_id = api_game_id
        self.grupo = grupo
        self.tipo = tipo
        self.matchday = matchday
        self.fecha_local = fecha_local
        self.estadio_id = estadio_id
        self.estadio_nombre = estadio_nombre
        self.ciudad = ciudad
        self.pais_sede = pais_sede
        self.equipo_local_id = equipo_local_id
        self.equipo_local_nombre = equipo_local_nombre
        self.equipo_local_codigo = equipo_local_codigo
        self.equipo_local_logo = equipo_local_logo
        self.equipo_visitante_id = equipo_visitante_id
        self.equipo_visitante_nombre = equipo_visitante_nombre
        self.equipo_visitante_codigo = equipo_visitante_codigo
        self.equipo_visitante_logo = equipo_visitante_logo
        self.goles_local = goles_local
        self.goles_visitante = goles_visitante
        self.goleadores_local = goleadores_local
        self.goleadores_visitante = goleadores_visitante
        self.finalizado = finalizado
        self.tiempo_transcurrido = tiempo_transcurrido
        self.etapa_detalle = etapa_detalle
        self.actualizado_en = actualizado_en

    @staticmethod
    def get_all(filters=None):
        """
        Retorna la lista de todos los partidos del Mundial 2026 según filtros aplicados.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = "SELECT * FROM partidos_2026"
                params = []
                where_clauses = []
                
                if filters:
                    if filters.get("grupo"):
                        where_clauses.append("grupo = %s")
                        params.append(filters["grupo"])
                    if filters.get("tipo"):
                        where_clauses.append("tipo = %s")
                        params.append(filters["tipo"])
                    if filters.get("equipo"):
                        where_clauses.append("(equipo_local_id = %s OR equipo_visitante_id = %s)")
                        params.extend([filters["equipo"], filters["equipo"]])
                    if filters.get("estado"):
                        estado = filters["estado"]
                        if estado == "live":
                            where_clauses.append("finalizado = FALSE AND tiempo_transcurrido NOT IN ('notstarted', 'Match Finished')")
                        elif estado == "finished":
                            where_clauses.append("finalizado = TRUE")
                        elif estado == "upcoming":
                            where_clauses.append("finalizado = FALSE AND tiempo_transcurrido = 'notstarted'")
                    if filters.get("matchday"):
                        where_clauses.append("matchday = %s")
                        params.append(filters["matchday"])
                
                if where_clauses:
                    query += " WHERE " + " AND ".join(where_clauses)
                
                query += " ORDER BY id ASC"
                cursor.execute(query, params)
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_by_api_id(api_game_id):
        """
        Retorna un partido individual por su ID externo de la API.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM partidos_2026 WHERE api_game_id = %s", [api_game_id])
                return cursor.fetchone()
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        """
        Inserta o actualiza un partido del Mundial 2026 de forma atómica.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO partidos_2026 (
                        api_game_id, grupo, tipo, matchday, fecha_local, estadio_id, estadio_nombre,
                        ciudad, pais_sede, equipo_local_id, equipo_local_nombre, equipo_local_codigo,
                        equipo_local_logo, equipo_visitante_id, equipo_visitante_nombre,
                        equipo_visitante_codigo, equipo_visitante_logo, goles_local, goles_visitante,
                        goleadores_local, goleadores_visitante, finalizado, tiempo_transcurrido, etapa_detalle
                    ) VALUES (
                        %(api_game_id)s, %(grupo)s, %(tipo)s, %(matchday)s, %(fecha_local)s, %(estadio_id)s, %(estadio_nombre)s,
                        %(ciudad)s, %(pais_sede)s, %(equipo_local_id)s, %(equipo_local_nombre)s, %(equipo_local_codigo)s,
                        %(equipo_local_logo)s, %(equipo_visitante_id)s, %(equipo_visitante_nombre)s,
                        %(equipo_visitante_codigo)s, %(equipo_visitante_logo)s, %(goles_local)s, %(goles_visitante)s,
                        %(goleadores_local)s, %(goleadores_visitante)s, %(finalizado)s, %(tiempo_transcurrido)s, %(etapa_detalle)s
                    )
                    ON DUPLICATE KEY UPDATE
                        grupo = VALUES(grupo),
                        tipo = VALUES(tipo),
                        matchday = VALUES(matchday),
                        fecha_local = VALUES(fecha_local),
                        estadio_id = VALUES(estadio_id),
                        estadio_nombre = VALUES(estadio_nombre),
                        ciudad = VALUES(ciudad),
                        pais_sede = VALUES(pais_sede),
                        equipo_local_id = VALUES(equipo_local_id),
                        equipo_local_nombre = VALUES(equipo_local_nombre),
                        equipo_local_codigo = VALUES(equipo_local_codigo),
                        equipo_local_logo = VALUES(equipo_local_logo),
                        equipo_visitante_id = VALUES(equipo_visitante_id),
                        equipo_visitante_nombre = VALUES(equipo_visitante_nombre),
                        equipo_visitante_codigo = VALUES(equipo_visitante_codigo),
                        equipo_visitante_logo = VALUES(equipo_visitante_logo),
                        goles_local = VALUES(goles_local),
                        goles_visitante = VALUES(goles_visitante),
                        goleadores_local = VALUES(goleadores_local),
                        goleadores_visitante = VALUES(goleadores_visitante),
                        finalizado = VALUES(finalizado),
                        tiempo_transcurrido = VALUES(tiempo_transcurrido),
                        etapa_detalle = VALUES(etapa_detalle)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM partidos_2026")
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM partidos_2026")
                return cursor.fetchone()["COUNT(*)"]
        finally:
            conn.close()
