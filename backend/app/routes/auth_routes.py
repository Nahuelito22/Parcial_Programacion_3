from flask import Blueprint
from app.controllers.auth_controller import register_user, login_user, get_current_user_profile
from app.middlewares.auth_middleware import token_required

# Crear Blueprint para las rutas de autenticación
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Ruta pública para registrar un nuevo usuario en el sistema.
    """
    return register_user()

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Ruta pública para iniciar sesión y obtener el token JWT.
    """
    return login_user()

@auth_bp.route('/me', methods=['GET'])
@token_required
def me():
    """
    Ruta protegida para obtener el perfil del usuario autenticado actual.
    """
    return get_current_user_profile()
