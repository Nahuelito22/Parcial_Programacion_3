import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Database
from app.services.api_sync_service import APISyncService

class TestAPISync(unittest.TestCase):
    @patch('app.services.api_sync_service.APIFootballClient')
    @patch('app.services.api_sync_service.API_FOOTBALL_KEY', 'valid_mock_key')
    def test_sync_service_run_success(self, mock_client_class):
        print("\n--- Test: API Sync Service (Success) ---")
        mock_client = mock_client_class.return_value
        
        # Mock get_teams
        mock_client.get_teams.return_value = {
            "response": [
                {"team": {"id": 9999, "name": "Selección de Prueba"}}
            ]
        }
        
        # Mock get_fixtures
        mock_client.get_fixtures.return_value = {
            "response": [
                {
                    "fixture": {"status": {"short": "FT"}},
                    "teams": {
                        "home": {"id": 9999},
                        "away": {"id": 8888}
                    },
                    "goals": {"home": 3, "away": 1}
                }
            ]
        }
        
        # Mock get_players
        mock_client.get_players.return_value = {
            "response": [
                {
                    "player": {"id": 88888, "name": "Jugador de Prueba"},
                    "statistics": [
                        {
                            "games": {"appearences": 5},
                            "goals": {"total": 2, "assists": 1},
                            "cards": {"yellow": 1}
                        }
                    ]
                }
            ]
        }
        
        # Run sync
        sync_service = APISyncService()
        result = sync_service.run()
        print("Result:", result)
        self.assertEqual(result["status"], "success")
        self.assertIn("sincronizados correctamente", result["message"])

        # Validate database records
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                # Check edition
                cursor.execute("SELECT id FROM ediciones WHERE anio = 2026")
                ed_row = cursor.fetchone()
                self.assertIsNotNone(ed_row)
                edicion_id = ed_row["id"]

                # Check team statistics
                cursor.execute("SELECT * FROM estadisticas_equipos WHERE edicion_id = %s AND pais_id = 9999", (edicion_id,))
                team_row = cursor.fetchone()
                self.assertIsNotNone(team_row)
                self.assertEqual(team_row["partidos_jugados"], 1)
                self.assertEqual(team_row["nombre_pais"], "Selección de Prueba")
                self.assertEqual(team_row["goles_a_favor"], 3)
                self.assertEqual(team_row["goles_en_contra"], 1)

                # Check player statistics
                cursor.execute("SELECT * FROM estadisticas_jugadores WHERE edicion_id = %s AND jugador_id = 88888", (edicion_id,))
                player_row = cursor.fetchone()
                self.assertIsNotNone(player_row)
                self.assertEqual(player_row["partidos_jugados"], 5)
                self.assertEqual(player_row["nombre_jugador"], "Jugador de Prueba")
                self.assertEqual(player_row["goles"], 2)
                self.assertEqual(player_row["asistencias"], 1)
                self.assertEqual(player_row["tarjetas_amarillas"], 1)
        finally:
            conn.close()

if __name__ == "__main__":
    unittest.main()
