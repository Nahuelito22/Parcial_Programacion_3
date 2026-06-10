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
