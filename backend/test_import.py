import os
import sys
import unittest

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Database
from app.services.csv_importer import CSVImporter

class TestCSVImport(unittest.TestCase):
    def test_csv_importer_run(self):
        print("\n--- Test: CSV Ingestion Pipeline ---")
        importer = CSVImporter()
        result = importer.run()
        print("Result:", result)
        self.assertEqual(result["status"], "success")
        self.assertIn("Historico de datos CSV importado correctamente", result["message"])

        # Validate that database has records
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as count FROM ediciones")
                ediciones_count = cursor.fetchone()["count"]
                print(f"Ediciones in DB: {ediciones_count}")
                self.assertGreater(ediciones_count, 0)

                cursor.execute("SELECT COUNT(*) as count FROM estadisticas_equipos")
                equipos_count = cursor.fetchone()["count"]
                print(f"Estadisticas Equipos in DB: {equipos_count}")
                self.assertGreater(equipos_count, 0)

                cursor.execute("SELECT COUNT(*) as count FROM estadisticas_jugadores")
                jugadores_count = cursor.fetchone()["count"]
                print(f"Estadisticas Jugadores in DB: {jugadores_count}")
                self.assertGreater(jugadores_count, 0)
        finally:
            conn.close()

if __name__ == "__main__":
    unittest.main()
