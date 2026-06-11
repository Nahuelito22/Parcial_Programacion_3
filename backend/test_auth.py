import os
import sys
import unittest
from unittest.mock import MagicMock

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

# Importar la app de Flask desde app.py usando importlib para evitar colisión con el paquete app/
import importlib.util
spec = importlib.util.spec_from_file_location("app_entry", os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.py"))
app_module = importlib.util.module_from_spec(spec)
sys.modules["app_entry"] = app_module
spec.loader.exec_module(app_module)
from app_entry import app


class AuthTestSuite(unittest.TestCase):
    def setUp(self):
        # Crear un cliente de prueba de Flask
        self.client = app.test_client()
        mock_db.clear()
        global user_id_counter
        user_id_counter = 0

    def test_register_success(self):
        print("\n--- Test: Registro Exitoso ---")
        payload = {
            "username": "nahuel",
            "email": "nahuel@test.com",
            "password": "mi_password_seguro",
            "role": "User"
        }
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        print("Response:", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], "nahuel")

    def test_register_duplicate(self):
        print("\n--- Test: Registro Duplicado ---")
        payload = {
            "username": "gustavo",
            "email": "gustavo@test.com",
            "password": "password123"
        }
        # Registro inicial
        self.client.post("/api/auth/register", json=payload)
        
        # Registro duplicado (mismo email)
        response = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(response.status_code, 409)
        data = response.get_json()
        print("Response:", data)
        self.assertEqual(data["message"], "El nombre de usuario ya está registrado.")

    def test_login_and_protected_route(self):
        print("\n--- Test: Login y Acceso a Ruta Protegida ---")
        # 1. Registrar usuario
        reg_payload = {
            "username": "admin_test",
            "email": "admin@test.com",
            "password": "adminpassword",
            "role": "Admin"
        }
        self.client.post("/api/auth/register", json=reg_payload)

        # 2. Login con credenciales válidas
        login_payload = {
            "email": "admin@test.com",
            "password": "adminpassword"
        }
        login_response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(login_response.status_code, 200)
        login_data = login_response.get_json()
        print("Login Response:", login_data)
        token = login_data.get("token")
        self.assertIsNotNone(token)

        # 3. Acceso a /me sin token (Debe fallar)
        me_fail_response = self.client.get("/api/auth/me")
        self.assertEqual(me_fail_response.status_code, 401)
        print("Acceso /me sin token:", me_fail_response.get_json())

        # 4. Acceso a /me con token válido
        headers = {"Authorization": f"Bearer {token}"}
        me_success_response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(me_success_response.status_code, 200)

        me_data = me_success_response.get_json()
        print("Acceso /me con token válido:", me_data)
        self.assertEqual(me_data["user"]["username"], "admin_test")
        self.assertEqual(me_data["user"]["role"], "Admin")

    def test_login_invalid_password(self):
        print("\n--- Test: Login con Contraseña Incorrecta ---")
        reg_payload = {
            "username": "user1",
            "email": "user1@test.com",
            "password": "correct_password"
        }
        self.client.post("/api/auth/register", json=reg_payload)

        login_payload = {
            "email": "user1@test.com",
            "password": "wrong_password"
        }
        response = self.client.post("/api/auth/login", json=login_payload)
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        print("Response:", data)
        self.assertIn("Credenciales inválidas", data["message"])

if __name__ == "__main__":
    unittest.main()
