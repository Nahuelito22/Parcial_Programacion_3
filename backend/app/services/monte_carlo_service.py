import numpy as np
from scipy.stats import poisson
from app.models.match import Match
from app.database import Database

class MonteCarloPredictor:
    SIMULATIONS = 10000

    @staticmethod
    def get_league_average_goals(edition_id: int = None) -> float:
        """
        Calcula el promedio general de goles anotados por equipo por partido.
        """
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                if edition_id is not None:
                    cursor.execute("""
                        SELECT SUM(goles_a_favor) as total_goles, SUM(partidos_jugados) as total_partidos
                        FROM estadisticas_equipos
                        WHERE edicion_id = %s
                    """, (edition_id,))
                else:
                    cursor.execute("""
                        SELECT SUM(goles_a_favor) as total_goles, SUM(partidos_jugados) as total_partidos
                        FROM estadisticas_equipos
                    """)
                row = cursor.fetchone()
                if row and row["total_partidos"] and row["total_partidos"] > 0:
                    return float(row["total_goles"]) / float(row["total_partidos"])
                return 1.35  # Valor por defecto si no hay datos
        except Exception:
            return 1.35
        finally:
            conn.close()

    def predict(self, team_a_id: int, team_b_id: int, edition_id: int = None) -> dict:
        """
        Realiza la predicción del partido usando simulación de Monte Carlo con Poisson.
        """
        # 1. Obtener estadísticas de los equipos
        stats_a = Match.get_team_stats(team_a_id, edition_id)
        stats_b = Match.get_team_stats(team_b_id, edition_id)

        # Si no hay estadísticas para la edición seleccionada, recurrir a estadísticas globales
        if edition_id is not None and stats_a["total_partidos"] == 0:
            stats_a = Match.get_team_stats(team_a_id, None)
        if edition_id is not None and stats_b["total_partidos"] == 0:
            stats_b = Match.get_team_stats(team_b_id, None)

        # 2. Calcular goles promedio anotados y recibidos
        avg_goals_a_for = stats_a["goles_a_favor"] / max(stats_a["total_partidos"], 1)
        avg_goals_a_against = stats_a["goles_en_contra"] / max(stats_a["total_partidos"], 1)
        
        avg_goals_b_for = stats_b["goles_a_favor"] / max(stats_b["total_partidos"], 1)
        avg_goals_b_against = stats_b["goles_en_contra"] / max(stats_b["total_partidos"], 1)

        # Defaults si no hay estadísticas históricas del todo
        if stats_a["total_partidos"] == 0:
            avg_goals_a_for = 1.2
            avg_goals_a_against = 1.2
        if stats_b["total_partidos"] == 0:
            avg_goals_b_for = 1.2
            avg_goals_b_against = 1.2

        # 3. Obtener el promedio de goles general de la liga/mundial
        league_avg = self.get_league_average_goals(edition_id)

        # 4. Calcular lambda (fuerza de ataque * debilidad de defensa * promedio)
        lambda_a = avg_goals_a_for * avg_goals_b_against / max(league_avg, 0.1)
        lambda_b = avg_goals_b_for * avg_goals_a_against / max(league_avg, 0.1)

        # Limitar lambda a un valor mínimo razonable para evitar errores matemáticos
        lambda_a = max(lambda_a, 0.1)
        lambda_b = max(lambda_b, 0.1)

        # 5. Simular 10.000 partidos usando distribución de Poisson
        goals_a = poisson.rvs(lambda_a, size=self.SIMULATIONS)
        goals_b = poisson.rvs(lambda_b, size=self.SIMULATIONS)

        # 6. Calcular probabilidades de resultado
        wins_a = float(np.sum(goals_a > goals_b) / self.SIMULATIONS)
        wins_b = float(np.sum(goals_b > goals_a) / self.SIMULATIONS)
        draws = float(np.sum(goals_a == goals_b) / self.SIMULATIONS)

        # Goles promedio esperados
        expected_goals_a = float(np.mean(goals_a))
        expected_goals_b = float(np.mean(goals_b))

        # 7. Calcular distribución de goles de 0 a 5+
        dist_a = {}
        for i in range(5):
            dist_a[str(i)] = float(np.sum(goals_a == i) / self.SIMULATIONS)
        dist_a["5+"] = float(np.sum(goals_a >= 5) / self.SIMULATIONS)

        dist_b = {}
        for i in range(5):
            dist_b[str(i)] = float(np.sum(goals_b == i) / self.SIMULATIONS)
        dist_b["5+"] = float(np.sum(goals_b >= 5) / self.SIMULATIONS)

        # 8. Obtener el marcador más probable (moda)
        score_counts = {}
        for ga, gb in zip(goals_a, goals_b):
            score_str = f"{ga}-{gb}"
            score_counts[score_str] = score_counts.get(score_str, 0) + 1
        most_likely_score = max(score_counts, key=score_counts.get)

        return {
            "metodo_usado": "monte_carlo_poisson",
            "equipo_a": {
                "id": team_a_id,
                "nombre": stats_a["nombre"]
            },
            "equipo_b": {
                "id": team_b_id,
                "nombre": stats_b["nombre"]
            },
            "probabilidades": {
                "victoria_a": wins_a,
                "empate": draws,
                "victoria_b": wins_b
            },
            "goles_esperados": {
                "a": round(expected_goals_a, 2),
                "b": round(expected_goals_b, 2)
            },
            "distribucion_goles_local": dist_a,
            "distribucion_goles_visitante": dist_b,
            "most_likely_score": most_likely_score,
            "simulaciones": self.SIMULATIONS
        }
