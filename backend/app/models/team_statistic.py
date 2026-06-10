from app.models.statistic import Statistic

class TeamStatistic(Statistic):
    """
    Clase que representa las estadísticas de un equipo en una edición del mundial.
    Hereda de la clase abstracta Statistic e implementa polimorfismo.
    """
    def __init__(self, edition_id: int, matches_played: int, team_id: int, 
                 team_name: str, goals_for: int, goals_against: int, 
                 average_possession: float, id: int = None):
        super().__init__(edition_id, matches_played, id)
        self.team_id = team_id
        self.team_name = team_name
        self.goals_for = goals_for
        self.goals_against = goals_against
        self.average_possession = average_possession

    def calculate_performance(self) -> float:
        """
        Polimorfismo: Calcula la diferencia de goles promedio por partido jugado.
        Si partidos_jugados es 0, retorna 0.0 para evitar división por cero.
        """
        if self.matches_played == 0:
            return 0.0
        return (self.goals_for - self.goals_against) / self.matches_played

    @staticmethod
    def from_db_row(row: dict):
        """
        Mapea una fila de base de datos MySQL (con nombres en español) 
        a una instancia de la clase TeamStatistic en Python.
        """
        if not row:
            return None
        return TeamStatistic(
            id=row.get("id"),
            edition_id=row.get("edicion_id"),
            matches_played=row.get("partidos_jugados"),
            team_id=row.get("pais_id"),
            team_name=row.get("nombre_pais"),
            goals_for=row.get("goles_a_favor"),
            goals_against=row.get("goles_en_contra"),
            average_possession=float(row.get("posesion_promedio", 0.0))
        )

    def to_db_dict(self) -> dict:
        """
        Mapea la instancia de TeamStatistic a un diccionario estructurado 
        con los nombres de columnas de la base de datos MySQL (en español).
        """
        return {
            "id": self.id,
            "edicion_id": self.edition_id,
            "partidos_jugados": self.matches_played,
            "pais_id": self.team_id,
            "nombre_pais": self.team_name,
            "goles_a_favor": self.goals_for,
            "goles_en_contra": self.goals_against,
            "posesion_promedio": self.average_possession
        }
