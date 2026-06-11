import os
import sys
import unittest
import datetime
import jwt
from unittest.mock import MagicMock

# Agregar el directorio raíz del backend al PATH de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar variables de entorno ficticias para la prueba
os.environ["JWT_SECRET_KEY"] = "test_secret_key_12345"
os.environ["JWT_ACCESS_TOKEN_EXPIRES"] = "2"

# Simulación en memoria de Base de Datos para evitar errores de conexión MySQL
mock_users = {}
mock_editions = {}
mock_team_stats = {}
mock_player_stats = {}

user_id_counter = 0
edition_id_counter = 0
team_stat_counter = 0
player_stat_counter = 0

# Mockear persistencia de User
from app.models.user import User
@staticmethod
def mock_user_get_by_id(user_id):
    return mock_users.get(user_id)
User.get_by_id = mock_user_get_by_id

# Mockear persistencia de Edition
from app.models.edition import Edition
@staticmethod
def mock_edition_get_all():
    return list(mock_editions.values())

@staticmethod
def mock_edition_get_by_id(edition_id):
    return mock_editions.get(edition_id)

def mock_edition_save(self):
    global edition_id_counter
    if self.id is None:
        edition_id_counter += 1
        self.id = edition_id_counter
    mock_editions[self.id] = self
    return self.id

@staticmethod
def mock_edition_delete(edition_id):
    if edition_id in mock_editions:
        del mock_editions[edition_id]
        return True
    return False

Edition.get_all = mock_edition_get_all
Edition.get_by_id = mock_edition_get_by_id
Edition.save = mock_edition_save
Edition.delete_by_id = mock_edition_delete

# Mockear persistencia de TeamStatistic
from app.models.team_statistic import TeamStatistic
@staticmethod
def mock_team_get_all():
    return list(mock_team_stats.values())

@staticmethod
def mock_team_get_by_id(stat_id):
    return mock_team_stats.get(stat_id)

@staticmethod
def mock_team_get_by_edition(edition_id):
    return [s for s in mock_team_stats.values() if s.edition_id == edition_id]

def mock_team_save(self):
    global team_stat_counter
    if self.id is None:
        team_stat_counter += 1
        self.id = team_stat_counter
    mock_team_stats[self.id] = self
    return self.id

@staticmethod
def mock_team_delete(stat_id):
    if stat_id in mock_team_stats:
        del mock_team_stats[stat_id]
        return True
    return False

TeamStatistic.get_all = mock_team_get_all
TeamStatistic.get_by_id = mock_team_get_by_id
TeamStatistic.get_by_edition = mock_team_get_by_edition
TeamStatistic.save = mock_team_save
TeamStatistic.delete_by_id = mock_team_delete

# Mockear persistencia de PlayerStatistic
from app.models.player_statistic import PlayerStatistic
@staticmethod
def mock_player_get_all():
    return list(mock_player_stats.values())

@staticmethod
def mock_player_get_by_id(stat_id):
    return mock_player_stats.get(stat_id)

@staticmethod
def mock_player_get_by_edition(edition_id):
    return [s for s in mock_player_stats.values() if s.edition_id == edition_id]

def mock_player_save(self):
    global player_stat_counter
    if self.id is None:
        player_stat_counter += 1
        self.id = player_stat_counter
    mock_player_stats[self.id] = self
    return self.id

@staticmethod
def mock_player_delete(stat_id):
    if stat_id in mock_player_stats:
        del mock_player_stats[stat_id]
        return True
    return False

PlayerStatistic.get_all = mock_player_get_all
PlayerStatistic.get_by_id = mock_player_get_by_id
PlayerStatistic.get_by_edition = mock_player_get_by_edition
PlayerStatistic.save = mock_player_save
PlayerStatistic.delete_by_id = mock_player_delete

# Importar app usando importlib para evitar colisiones
import importlib.util
spec = importlib.util.spec_from_file_location("app_entry", os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.py"))
app_module = importlib.util.module_from_spec(spec)
sys.modules["app_entry"] = app_module
spec.loader.exec_module(app_module)
from app_entry import app

class StatisticsCrudTestSuite(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        mock_users.clear()
        mock_editions.clear()
        mock_team_stats.clear()
        mock_player_stats.clear()
        
        global user_id_counter, edition_id_counter, team_stat_counter, player_stat_counter
        user_id_counter = 0
        edition_id_counter = 0
        team_stat_counter = 0
        player_stat_counter = 0

        # Crear usuarios para las pruebas
        self.admin_user = User(username="admin", email="admin@test.com", password_hash="dummy", role="Admin", id=1)
        self.regular_user = User(username="user", email="user@test.com", password_hash="dummy", role="User", id=2)
        mock_users[1] = self.admin_user
        mock_users[2] = self.regular_user

        # Generar tokens JWT
        self.admin_token = self._generate_token(1, "Admin")
        self.user_token = self._generate_token(2, "User")

        # Sembrar datos de prueba iniciales
        self.ed1 = Edition(year=2022, host_country="Catar", champion="Argentina", id=1)
        mock_editions[1] = self.ed1
        edition_id_counter = 1

        self.team1 = TeamStatistic(edition_id=1, matches_played=7, team_id=1, team_name="Argentina", goals_for=15, goals_against=8, average_possession=57.5, id=1)
        mock_team_stats[1] = self.team1
        team_stat_counter = 1

        self.player1 = PlayerStatistic(edition_id=1, matches_played=7, player_id=10, player_name="Lionel Messi", goals=7, assists=3, yellow_cards=1, id=1)
        mock_player_stats[1] = self.player1
        player_stat_counter = 1

    def _generate_token(self, user_id, role):
        payload = {
            "sub": str(user_id),
            "role": role,
            "iat": datetime.datetime.utcnow(),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }
        return jwt.encode(payload, "test_secret_key_12345", algorithm="HS256")

    def test_get_editions(self):
        print("\n--- Test: Obtener Ediciones (Público) ---")
        response = self.client.get("/api/ediciones")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        print("Response:", data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["anio"], 2022)

    def test_get_team_statistics_and_polymorphism(self):
        print("\n--- Test: Obtener Estadísticas Equipos y Polimorfismo ---")
        response = self.client.get("/api/estadisticas/equipos")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        print("Response:", data)
        self.assertEqual(len(data), 1)
        # Verificar cálculo polimórfico de rendimiento: (15 - 8) / 7 = 1.00
        self.assertEqual(data[0]["performance"], 1.00)

    def test_get_player_statistics_and_polymorphism(self):
        print("\n--- Test: Obtener Estadísticas Jugadores y Polimorfismo ---")
        response = self.client.get("/api/estadisticas/jugadores")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        print("Response:", data)
        self.assertEqual(len(data), 1)
        # Verificar cálculo polimórfico de rendimiento: (7 + 3) / 7 = 1.42857...
        self.assertAlmostEqual(data[0]["performance"], 1.43, places=2)

    def test_create_edition_permissions(self):
        print("\n--- Test: Permisos de Creación de Edición ---")
        payload = {"anio": 2026, "pais_anfitrion": "Norteamérica", "campeon": "TBD"}

        # Sin Token -> 401
        res_no_token = self.client.post("/api/ediciones", json=payload)
        self.assertEqual(res_no_token.status_code, 401)
        print("Sin Token (401):", res_no_token.get_json())

        # Con Token de User Regular -> 403
        headers_user = {"Authorization": f"Bearer {self.user_token}"}
        res_user_token = self.client.post("/api/ediciones", json=payload, headers=headers_user)
        self.assertEqual(res_user_token.status_code, 403)
        print("Token Regular User (403):", res_user_token.get_json())

        # Con Token de Admin -> 201
        headers_admin = {"Authorization": f"Bearer {self.admin_token}"}
        res_admin_token = self.client.post("/api/ediciones", json=payload, headers=headers_admin)
        self.assertEqual(res_admin_token.status_code, 201)
        print("Token Admin (210):", res_admin_token.get_json())
        self.assertEqual(len(mock_editions), 2)

    def test_update_and_delete_edition_as_admin(self):
        print("\n--- Test: Modificar y Eliminar Edición como Admin ---")
        headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Actualizar
        update_payload = {"campeon": "Argentina Bicampeón"}
        res_put = self.client.put("/api/ediciones/1", json=update_payload, headers=headers)
        self.assertEqual(res_put.status_code, 200)
        print("PUT Response:", res_put.get_json())
        self.assertEqual(mock_editions[1].champion, "Argentina Bicampeón")

        # Eliminar
        res_delete = self.client.delete("/api/ediciones/1", headers=headers)
        self.assertEqual(res_delete.status_code, 200)
        print("DELETE Response:", res_delete.get_json())
        self.assertEqual(len(mock_editions), 0)

if __name__ == "__main__":
    unittest.main()
