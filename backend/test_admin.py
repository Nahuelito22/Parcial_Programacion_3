import os
import sys
import unittest
import unittest.mock
import jwt
import datetime

# Agregar el directorio raíz del backend al PATH de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar variables de entorno ficticias para la prueba
os.environ["JWT_SECRET_KEY"] = "test_secret_key_12345"
os.environ["JWT_ACCESS_TOKEN_EXPIRES"] = "2"

# Simulación en memoria de la Base de Datos para evitar errores de conexión MySQL
mock_db = {}
user_id_counter = 0

def mock_save(self):
    global user_id_counter
    if self.id is None:
        user_id_counter += 1
        self.id = user_id_counter
    mock_db[self.id] = self
    return self.id

@staticmethod
def mock_get_by_id(user_id):
    return mock_db.get(user_id)

@staticmethod
def mock_get_by_email(email):
    for u in mock_db.values():
        if u.email == email:
            return u
    return None

@staticmethod
def mock_get_by_username(username):
    for u in mock_db.values():
        if u.username == username:
            return u
    return None

# Importar el modelo User y monkeypatching de sus métodos de BD
from app.models.user import User
User.save = mock_save
User.get_by_id = mock_get_by_id
User.get_by_email = mock_get_by_email
User.get_by_username = mock_get_by_username

# Importar la app de Flask
import importlib.util
spec = importlib.util.spec_from_file_location("app_entry", os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.py"))
app_module = importlib.util.module_from_spec(spec)
sys.modules["app_entry"] = app_module
spec.loader.exec_module(app_module)
from app_entry import app


class AdminTestSuite(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        mock_db.clear()
        global user_id_counter
        user_id_counter = 0

        # Crear un usuario admin y un usuario común
        self.admin_user = User(username="admin", email="admin@test.com", password_hash="hash", role="Admin")
        self.admin_user.save()

        self.normal_user = User(username="user", email="user@test.com", password_hash="hash", role="User")
        self.normal_user.save()

    def _generate_token(self, user):
        payload = {
            "sub": str(user.id),
            "role": user.role,
            "iat": datetime.datetime.utcnow(),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }
        return jwt.encode(payload, "test_secret_key_12345", algorithm="HS256")

    def test_clear_db_no_token(self):
        response = self.client.post("/api/admin/clear-db")
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertIn("faltante", data["message"])

    def test_clear_db_normal_user(self):
        token = self._generate_token(self.normal_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/clear-db", headers=headers)
        self.assertEqual(response.status_code, 403)
        data = response.get_json()
        self.assertIn("denegado", data["message"])

    def test_clear_db_admin(self):
        token = self._generate_token(self.admin_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/clear-db", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("vaciada correctamente", data["message"])

    def test_import_csv_admin(self):
        token = self._generate_token(self.admin_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/import-csv", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("importado correctamente", data["message"])

    @unittest.mock.patch('app.services.api_sync_service.APISyncService.run')
    def test_sync_api_admin_success(self, mock_run):
        mock_run.return_value = {
            "status": "success",
            "message": "Datos del Mundial 2026 sincronizados correctamente. Equipos: 48, Jugadores: 100"
        }
        token = self._generate_token(self.admin_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/sync-api", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("sincronizados correctamente", data["message"])

    @unittest.mock.patch('app.services.api_sync_service.APISyncService.run')
    def test_sync_api_admin_partial(self, mock_run):
        mock_run.return_value = {
            "status": "partial",
            "message": "Sincronizacion parcial del Mundial 2026 realizada debido a limitacion de peticiones API (Rate Limit 429)."
        }
        token = self._generate_token(self.admin_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/sync-api", headers=headers)
        self.assertEqual(response.status_code, 202)
        data = response.get_json()
        self.assertIn("Sincronizacion parcial", data["message"])

    @unittest.mock.patch('app.services.api_sync_service.APISyncService.run')
    def test_sync_api_admin_no_data(self, mock_run):
        mock_run.return_value = {
            "status": "no_data",
            "message": "No hay datos disponibles aun para el Mundial 2026 en API-Football. Intente mas tarde."
        }
        token = self._generate_token(self.admin_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/sync-api", headers=headers)
        self.assertEqual(response.status_code, 202)
        data = response.get_json()
        self.assertIn("No hay datos disponibles", data["message"])

    @unittest.mock.patch('app.services.api_sync_service.APISyncService.run')
    def test_sync_api_admin_timeout(self, mock_run):
        import requests
        mock_run.side_effect = requests.Timeout("Connection timed out")
        token = self._generate_token(self.admin_user)
        headers = {"Authorization": f"Bearer {token}"}
        response = self.client.post("/api/admin/sync-api", headers=headers)
        self.assertEqual(response.status_code, 502)
        data = response.get_json()
        self.assertIn("Tiempo de espera agotado", data["message"])

if __name__ == "__main__":
    unittest.main()
