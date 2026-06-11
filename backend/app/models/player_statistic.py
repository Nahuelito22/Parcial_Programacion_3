from app.models.statistic import Statistic

class PlayerStatistic(Statistic):
    """
    Clase que representa las estadísticas individuales de un jugador en una edición del mundial.
    Hereda de la clase abstracta Statistic e implementa polimorfismo.
    """
    def __init__(self, edition_id: int, matches_played: int, player_id: int,
                 player_name: str, goals: int, assists: int, 
                 yellow_cards: int, id: int = None):
        super().__init__(edition_id, matches_played, id)
        self.player_id = player_id
        self.player_name = player_name
        self.goals = goals
        self.assists = assists
        self.yellow_cards = yellow_cards

    def calculate_performance(self) -> float:
        """
        Polimorfismo: Calcula la contribución de goles (goles + asistencias) por partido jugado.
        Si partidos_jugados es 0, retorna 0.0.
        """
        if self.matches_played == 0:
            return 0.0
        return (self.goals + self.assists) / self.matches_played

    @staticmethod
    def from_db_row(row: dict):
        """
        Mapea una fila de base de datos MySQL (con nombres en español) 
        a una instancia de la clase PlayerStatistic en Python.
        """
        if not row:
            return None
        return PlayerStatistic(
            id=row.get("id"),
            edition_id=row.get("edicion_id"),
            matches_played=row.get("partidos_jugados"),
            player_id=row.get("jugador_id"),
            player_name=row.get("nombre_jugador"),
            goals=row.get("goles"),
            assists=row.get("asistencias"),
            yellow_cards=row.get("tarjetas_amarillas")
        )

    def to_db_dict(self) -> dict:
        """
        Mapea la instancia de PlayerStatistic a un diccionario estructurado 
        con los nombres de columnas de la base de datos MySQL (en español).
        """
        return {
            "id": self.id,
            "edicion_id": self.edition_id,
            "partidos_jugados": self.matches_played,
            "jugador_id": self.player_id,
            "nombre_jugador": self.player_name,
            "goles": self.goals,
            "asistencias": self.assists,
            "tarjetas_amarillas": self.yellow_cards
        }

    @staticmethod
    def get_all():
        """
        Retorna todas las estadísticas de jugadores.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM estadisticas_jugadores")
                rows = cursor.fetchall()
                return [PlayerStatistic.from_db_row(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(stat_id: int):
        """
        Retorna una estadística de jugador por su ID.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM estadisticas_jugadores WHERE id = %s", (stat_id,))
                row = cursor.fetchone()
                return PlayerStatistic.from_db_row(row)
        finally:
            conn.close()

    @staticmethod
    def get_by_edition(edition_id: int):
        """
        Retorna todas las estadísticas de jugadores para una edición específica.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM estadisticas_jugadores WHERE edicion_id = %s", (edition_id,))
                rows = cursor.fetchall()
                return [PlayerStatistic.from_db_row(row) for row in rows]
        finally:
            conn.close()

    def save(self) -> int:
        """
        Inserta o actualiza la estadística del jugador en la base de datos.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                if self.id is None:
                    cursor.execute(
                        """
                        INSERT INTO estadisticas_jugadores 
                        (edicion_id, partidos_jugados, jugador_id, nombre_jugador, goles, asistencias, tarjetas_amarillas) 
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (self.edition_id, self.matches_played, self.player_id, self.player_name, self.goals, self.assists, self.yellow_cards)
                    )
                    self.id = cursor.lastrowid
                else:
                    cursor.execute(
                        """
                        UPDATE estadisticas_jugadores 
                        SET edicion_id = %s, partidos_jugados = %s, jugador_id = %s, nombre_jugador = %s, goles = %s, asistencias = %s, tarjetas_amarillas = %s 
                        WHERE id = %s
                        """,
                        (self.edition_id, self.matches_played, self.player_id, self.player_name, self.goals, self.assists, self.yellow_cards, self.id)
                    )
            return self.id
        finally:
            conn.close()

    @staticmethod
    def delete_by_id(stat_id: int) -> bool:
        """
        Elimina una estadística de jugador específica.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM estadisticas_jugadores WHERE id = %s", (stat_id,))
                return cursor.rowcount > 0
        finally:
            conn.close()

