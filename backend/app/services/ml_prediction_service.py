import os
import joblib
from pathlib import Path
from app.models.match import Match

class MLPredictor:
    def __init__(self):
        # El modelo se almacena en backend/models/match_predictor.joblib
        self.model_dir = Path(__file__).parent.parent.parent / "models"
        self.model_path = self.model_dir / "match_predictor.joblib"
        self.model = None
        
        if self.model_path.exists():
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error al cargar el modelo ML: {e}")

    def is_available(self) -> bool:
        """
        Retorna True si el modelo entrenado está disponible para realizar predicciones.
        """
        return self.model is not None

    def predict(self, team_a_id: int, team_b_id: int, edition_id: int = None) -> dict:
        """
        Realiza la predicción utilizando el modelo RandomForest cargado.
        """
        if not self.is_available():
            raise FileNotFoundError("El modelo de Machine Learning no está disponible. Entrénalo primero.")

        # 1. Obtener estadísticas de los equipos
        stats_a = Match.get_team_stats(team_a_id, edition_id)
        stats_b = Match.get_team_stats(team_b_id, edition_id)

        # Fallback a estadísticas globales si no hay en la edición
        if edition_id is not None and stats_a["total_partidos"] == 0:
            stats_a = Match.get_team_stats(team_a_id, None)
        if edition_id is not None and stats_b["total_partidos"] == 0:
            stats_b = Match.get_team_stats(team_b_id, None)

        # 2. Extraer características (features)
        avg_goals_a_for = stats_a["goles_a_favor"] / max(stats_a["total_partidos"], 1)
        avg_goals_a_against = stats_a["goles_en_contra"] / max(stats_a["total_partidos"], 1)
        
        avg_goals_b_for = stats_b["goles_a_favor"] / max(stats_b["total_partidos"], 1)
        avg_goals_b_against = stats_b["goles_en_contra"] / max(stats_b["total_partidos"], 1)

        # Defaults si no hay estadísticas
        if stats_a["total_partidos"] == 0:
            avg_goals_a_for = 1.2
            avg_goals_a_against = 1.2
        if stats_b["total_partidos"] == 0:
            avg_goals_b_for = 1.2
            avg_goals_b_against = 1.2

        features = [
            avg_goals_a_for,
            avg_goals_a_against,
            stats_a["posesion_promedio"],
            stats_a["titulos"],
            avg_goals_b_for,
            avg_goals_b_against,
            stats_b["posesion_promedio"],
            stats_b["titulos"]
        ]

        # 3. Ejecutar predicción
        # El modelo predice clases: 0 = Victoria Visitante (B), 1 = Empate, 2 = Victoria Local (A)
        # predict_proba retorna un array de la forma [[prob_visitante, prob_empate, prob_local]]
        probas = self.model.predict_proba([features])[0]

        prob_b = float(probas[0])
        prob_draw = float(probas[1])
        prob_a = float(probas[2])

        # Goles esperados (hacer una aproximación simple usando los promedios)
        expected_goals_a = avg_goals_a_for * (1.1 if prob_a > prob_b else 0.9)
        expected_goals_b = avg_goals_b_for * (1.1 if prob_b > prob_a else 0.9)

        # Marcador más probable basado en goles esperados redondeados
        most_likely_score = f"{round(expected_goals_a)}-{round(expected_goals_b)}"

        # Distribución de goles aproximada (usando Poisson en base a los promedios esperados)
        import scipy.stats as stats
        dist_a = {}
        for i in range(5):
            dist_a[str(i)] = float(stats.poisson.pmf(i, expected_goals_a))
        dist_a["5+"] = float(1.0 - sum(dist_a.values()))

        dist_b = {}
        for i in range(5):
            dist_b[str(i)] = float(stats.poisson.pmf(i, expected_goals_b))
        dist_b["5+"] = float(1.0 - sum(dist_b.values()))

        return {
            "metodo_usado": "random_forest_classification",
            "equipo_a": {
                "id": team_a_id,
                "nombre": stats_a["nombre"]
            },
            "equipo_b": {
                "id": team_b_id,
                "nombre": stats_b["nombre"]
            },
            "probabilidades": {
                "victoria_a": prob_a,
                "empate": prob_draw,
                "victoria_b": prob_b
            },
            "goles_esperados": {
                "a": round(expected_goals_a, 2),
                "b": round(expected_goals_b, 2)
            },
            "distribucion_goles_local": dist_a,
            "distribucion_goles_visitante": dist_b,
            "most_likely_score": most_likely_score
        }
