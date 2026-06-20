from app.database import Database

class Team2026:
    """
    Clase que representa una selección nacional del Mundial 2026.
    """
    def __init__(self, id=None, api_team_id=None, nombre_en=None, codigo_fifa=None,
                 grupo=None, bandera_url=None, actualizado_en=None):
        self.id = id
        self.api_team_id = api_team_id
        self.nombre_en = nombre_en
        self.codigo_fifa = codigo_fifa
        self.grupo = grupo
        self.bandera_url = bandera_url
        self.actualizado_en = actualizado_en

    @staticmethod
    def get_all():
        """
        Retorna la lista de todos los equipos del Mundial 2026.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM equipos_2026 ORDER BY nombre_en ASC")
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def get_by_api_id(api_team_id):
        """
        Retorna un equipo individual por su ID externo de la API.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM equipos_2026 WHERE api_team_id = %s", [api_team_id])
                return cursor.fetchone()
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        """
        Inserta o actualiza un equipo del Mundial 2026.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO equipos_2026 (api_team_id, nombre_en, codigo_fifa, grupo, bandera_url)
                    VALUES (%(api_team_id)s, %(nombre_en)s, %(codigo_fifa)s, %(grupo)s, %(bandera_url)s)
                    ON DUPLICATE KEY UPDATE
                        nombre_en = VALUES(nombre_en),
                        codigo_fifa = VALUES(codigo_fifa),
                        grupo = VALUES(grupo),
                        bandera_url = VALUES(bandera_url)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM equipos_2026")
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM equipos_2026")
                return cursor.fetchone()["COUNT(*)"]
        finally:
            conn.close()


class Stadium2026:
    """
    Clase que representa un estadio sede del Mundial 2026.
    """
    def __init__(self, id=None, api_stadium_id=None, nombre_en=None, nombre_fifa=None,
                 ciudad=None, pais=None, capacidad=None, actualizado_en=None):
        self.id = id
        self.api_stadium_id = api_stadium_id
        self.nombre_en = nombre_en
        self.nombre_fifa = nombre_fifa
        self.ciudad = ciudad
        self.pais = pais
        self.capacidad = capacidad
        self.actualizado_en = actualizado_en

    @staticmethod
    def get_all():
        """
        Retorna todos los estadios del Mundial 2026.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM estadios_2026 ORDER BY nombre_en ASC")
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        """
        Inserta o actualiza un estadio del Mundial 2026.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO estadios_2026 (api_stadium_id, nombre_en, nombre_fifa, ciudad, pais, capacidad)
                    VALUES (%(api_stadium_id)s, %(nombre_en)s, %(nombre_fifa)s, %(ciudad)s, %(pais)s, %(capacidad)s)
                    ON DUPLICATE KEY UPDATE
                        nombre_en = VALUES(nombre_en),
                        nombre_fifa = VALUES(nombre_fifa),
                        ciudad = VALUES(ciudad),
                        pais = VALUES(pais),
                        capacidad = VALUES(capacidad)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM estadios_2026")
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM estadios_2026")
                return cursor.fetchone()["COUNT(*)"]
        finally:
            conn.close()


class Group2026:
    """
    Clase que representa la posición de un equipo en un grupo del Mundial 2026.
    """
    def __init__(self, id=None, grupo=None, equipo_id=None, posicion=None, puntos=0,
                 goles_favor=0, goles_contra=0, diferencia_gol=0, partidos_jugados=0,
                 victorias=0, empates=0, derrotas=0, actualizado_en=None):
        self.id = id
        self.grupo = grupo
        self.equipo_id = equipo_id
        self.posicion = posicion
        self.puntos = puntos
        self.goles_favor = goles_favor
        self.goles_contra = goles_contra
        self.diferencia_gol = diferencia_gol
        self.partidos_jugados = partidos_jugados
        self.victorias = victorias
        self.empates = empates
        self.derrotas = derrotas
        self.actualizado_en = actualizado_en

    @staticmethod
    def get_standings():
        """
        Retorna las posiciones de todos los grupos del Mundial 2026 con los datos del equipo.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    SELECT g.*, e.nombre_en as equipo_nombre, e.codigo_fifa as equipo_codigo, e.bandera_url as equipo_bandera
                    FROM grupos_2026 g
                    JOIN equipos_2026 e ON g.equipo_id = e.api_team_id
                    ORDER BY g.grupo ASC, g.posicion ASC, g.puntos DESC, g.diferencia_gol DESC
                """
                cursor.execute(query)
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        """
        Inserta o actualiza la posición de un equipo en un grupo del Mundial 2026.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO grupos_2026 (
                        grupo, equipo_id, posicion, puntos, goles_favor, goles_contra,
                        diferencia_gol, partidos_jugados, victorias, empates, derrotas
                    ) VALUES (
                        %(grupo)s, %(equipo_id)s, %(posicion)s, %(puntos)s, %(goles_favor)s, %(goles_contra)s,
                        %(diferencia_gol)s, %(partidos_jugados)s, %(victorias)s, %(empates)s, %(derrotas)s
                    )
                    ON DUPLICATE KEY UPDATE
                        posicion = VALUES(posicion),
                        puntos = VALUES(puntos),
                        goles_favor = VALUES(goles_favor),
                        goles_contra = VALUES(goles_contra),
                        diferencia_gol = VALUES(diferencia_gol),
                        partidos_jugados = VALUES(partidos_jugados),
                        victorias = VALUES(victorias),
                        empates = VALUES(empates),
                        derrotas = VALUES(derrotas)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM grupos_2026")
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM grupos_2026")
                return cursor.fetchone()["COUNT(*)"]
        finally:
            conn.close()
