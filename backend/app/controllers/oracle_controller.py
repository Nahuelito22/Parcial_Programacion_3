from flask import jsonify, request
from app.models.match import Match
from app.services.monte_carlo_service import MonteCarloPredictor
from app.services.ml_prediction_service import MLPredictor

class OracleController:
    @staticmethod
    def get_teams():
        """
        Retorna la lista de todas las selecciones disponibles en el sistema.
        """
        try:
            teams = Match.get_all_teams()
            return jsonify(teams), 200
        except Exception as e:
            return jsonify({"error": f"Error al obtener equipos: {str(e)}"}), 500

    @staticmethod
    def get_methods():
        """
        Retorna la lista de métodos de predicción habilitados.
        """
        try:
            predictor_ml = MLPredictor()
            methods = [
                {"id": "monte_carlo", "name": "Simulación Monte Carlo (Poisson)", "description": "10,000 simulaciones estadísticas de goles"}
            ]
            if predictor_ml.is_available():
                methods.append({
                    "id": "ml", 
                    "name": "Machine Learning (Random Forest)", 
                    "description": "Clasificador predictivo entrenado con resultados históricos"
                })
            return jsonify({"methods": methods}), 200
        except Exception as e:
            return jsonify({"error": f"Error al obtener métodos: {str(e)}"}), 500

    @staticmethod
    def predict():
        """
        Ejecuta la predicción entre dos selecciones y retorna el análisis probabilístico.
        """
        data = request.get_json() or {}
        team_a_id = data.get("team_a_id")
        team_b_id = data.get("team_b_id")
        method = data.get("method", "monte_carlo")
        edition_id = data.get("edition_id") # Opcional

        if not team_a_id or not team_b_id:
            return jsonify({"error": "Debe proporcionar team_a_id y team_b_id en el cuerpo de la solicitud."}), 400

        if int(team_a_id) == int(team_b_id):
            return jsonify({"error": "No se puede predecir un partido de un equipo contra sí mismo."}), 400

        try:
            # Castings seguros
            team_a_id = int(team_a_id)
            team_b_id = int(team_b_id)
            if edition_id is not None:
                edition_id = int(edition_id)

            predictor_ml = MLPredictor()

            # Resolver método y ejecutar
            if method == "ml" and predictor_ml.is_available():
                result = predictor_ml.predict(team_a_id, team_b_id, edition_id)
            else:
                predictor_mc = MonteCarloPredictor()
                result = predictor_mc.predict(team_a_id, team_b_id, edition_id)

            # Agregar los métodos disponibles a la respuesta para control de la UI
            available_methods = ["monte_carlo"]
            if predictor_ml.is_available():
                available_methods.append("ml")
            result["metodos_disponibles"] = available_methods

            return jsonify(result), 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Error al ejecutar la predicción: {str(e)}"}), 500
