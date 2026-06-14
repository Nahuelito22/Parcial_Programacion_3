import os
import sys
import unittest
import json

# Agregar el directorio raíz del backend al PATH de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar variables de entorno de prueba si es necesario
if "JWT_SECRET_KEY" not in os.environ:
    os.environ["JWT_SECRET_KEY"] = "test_secret_key_12345"

# Importar la app de Flask desde app.py
import importlib.util
spec = importlib.util.spec_from_file_location("app_entry", os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.py"))
app_module = importlib.util.module_from_spec(spec)
sys.modules["app_entry"] = app_module
spec.loader.exec_module(app_module)
from app_entry import app

class TestOracleAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_get_teams(self):
        """Prueba que el listado de selecciones retorne código 200 y una lista de equipos."""
        response = self.client.get('/api/oracle/equipos')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertIn("id", data[0])
            self.assertIn("nombre", data[0])

    def test_get_methods(self):
        """Prueba que los métodos disponibles incluyan monte_carlo y ml (si está entrenado)."""
        response = self.client.get('/api/oracle/methods')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("methods", data)
        methods = [m["id"] for m in data["methods"]]
        self.assertIn("monte_carlo", methods)

    def test_predict_monte_carlo(self):
        """Prueba la predicción usando Monte Carlo Poisson entre dos equipos válidos."""
        # Obtener equipos primero
        teams_resp = self.client.get('/api/oracle/equipos')
        teams = json.loads(teams_resp.data)
        
        if len(teams) < 2:
            self.skipTest("No hay suficientes equipos para probar la predicción.")

        team_a = teams[0]["id"]
        team_b = teams[1]["id"]

        payload = {
            "team_a_id": team_a,
            "team_b_id": team_b,
            "method": "monte_carlo"
        }

        response = self.client.post(
            '/api/oracle/predict',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertEqual(data["metodo_usado"], "monte_carlo_poisson")
        self.assertIn("probabilidades", data)
        probs = data["probabilidades"]
        self.assertIn("victoria_a", probs)
        self.assertIn("empate", probs)
        self.assertIn("victoria_b", probs)
        
        # Verificar que las probabilidades sumen aproximadamente 1
        total_prob = probs["victoria_a"] + probs["empate"] + probs["victoria_b"]
        self.assertAlmostEqual(total_prob, 1.0, places=4)

        self.assertIn("goles_esperados", data)
        self.assertIn("distribucion_goles_local", data)
        self.assertIn("distribucion_goles_visitante", data)
        self.assertIn("most_likely_score", data)

    def test_predict_ml(self):
        """Prueba la predicción usando Machine Learning Random Forest."""
        teams_resp = self.client.get('/api/oracle/equipos')
        teams = json.loads(teams_resp.data)
        
        if len(teams) < 2:
            self.skipTest("No hay suficientes equipos para probar la predicción.")

        team_a = teams[0]["id"]
        team_b = teams[1]["id"]

        payload = {
            "team_a_id": team_a,
            "team_b_id": team_b,
            "method": "ml"
        }

        response = self.client.post(
            '/api/oracle/predict',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertIn(data["metodo_usado"], ["random_forest_classification", "monte_carlo_poisson"])
        self.assertIn("probabilidades", data)
        self.assertIn("goles_esperados", data)

    def test_predict_invalid_same_team(self):
        """Prueba que el sistema rechace predecir un partido contra sí mismo."""
        payload = {
            "team_a_id": 1,
            "team_b_id": 1,
            "method": "monte_carlo"
        }
        response = self.client.post(
            '/api/oracle/predict',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)

if __name__ == "__main__":
    unittest.main()
