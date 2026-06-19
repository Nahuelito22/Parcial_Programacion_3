from app.database import Database


class Goleador2026:
    @staticmethod
    def get_all(limit=20, offset=0):
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM goleadores_2026 ORDER BY goles DESC, partidos ASC LIMIT %s OFFSET %s",
                    [limit, offset]
                )
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as cnt FROM goleadores_2026")
                return cursor.fetchone()["cnt"]
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO goleadores_2026 (api_player_id, nombre, equipo, equipo_codigo, partidos, goles)
                    VALUES (%(api_player_id)s, %(nombre)s, %(equipo)s, %(equipo_codigo)s, %(partidos)s, %(goles)s)
                    ON DUPLICATE KEY UPDATE
                        nombre = VALUES(nombre),
                        equipo = VALUES(equipo),
                        equipo_codigo = VALUES(equipo_codigo),
                        partidos = VALUES(partidos),
                        goles = VALUES(goles)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM goleadores_2026")
        finally:
            conn.close()


class Asistencia2026:
    @staticmethod
    def get_all(limit=20, offset=0):
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM asistencias_2026 ORDER BY asistencias DESC, partidos ASC LIMIT %s OFFSET %s",
                    [limit, offset]
                )
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as cnt FROM asistencias_2026")
                return cursor.fetchone()["cnt"]
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO asistencias_2026 (api_player_id, nombre, equipo, equipo_codigo, partidos, asistencias)
                    VALUES (%(api_player_id)s, %(nombre)s, %(equipo)s, %(equipo_codigo)s, %(partidos)s, %(asistencias)s)
                    ON DUPLICATE KEY UPDATE
                        nombre = VALUES(nombre),
                        equipo = VALUES(equipo),
                        equipo_codigo = VALUES(equipo_codigo),
                        partidos = VALUES(partidos),
                        asistencias = VALUES(asistencias)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM asistencias_2026")
        finally:
            conn.close()


class Tarjeta2026:
    @staticmethod
    def get_all(limit=20, offset=0):
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM tarjetas_2026 ORDER BY puntos DESC, amarillas DESC LIMIT %s OFFSET %s",
                    [limit, offset]
                )
                return cursor.fetchall()
        finally:
            conn.close()

    @staticmethod
    def count():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as cnt FROM tarjetas_2026")
                return cursor.fetchone()["cnt"]
        finally:
            conn.close()

    @staticmethod
    def upsert(data):
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO tarjetas_2026 (equipo, equipo_codigo, partidos, amarillas, rojas, puntos)
                    VALUES (%(equipo)s, %(equipo_codigo)s, %(partidos)s, %(amarillas)s, %(rojas)s, %(puntos)s)
                    ON DUPLICATE KEY UPDATE
                        partidos = VALUES(partidos),
                        amarillas = VALUES(amarillas),
                        rojas = VALUES(rojas),
                        puntos = VALUES(puntos)
                """
                cursor.execute(query, data)
        finally:
            conn.close()

    @staticmethod
    def delete_all():
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM tarjetas_2026")
        finally:
            conn.close()
