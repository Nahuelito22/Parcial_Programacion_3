import os
from functools import wraps
from flask import request, jsonify, g
import jwt
from app.models.user import User

def token_required(f):
    """
    Decorador para proteger endpoints que requieren autenticación.
    Lee el header 'Authorization: Bearer <token>', valida el JWT
    y almacena el usuario autenticado en la variable global de petición `g.current_user`.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Validar presencia del header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"message": "Token de autenticación faltante o con formato incorrecto."}), 401
        
        try:
            # Obtener el secreto JWT desde el entorno o fallback seguro
            secret_key = os.getenv("JWT_SECRET_KEY", "tu_jwt_secret_aqui")
            
            # Decodificar el token
            payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            user_id = payload.get("sub")
            
            # Buscar el usuario correspondiente al token
            current_user = User.get_by_id(user_id)
            if not current_user:
                return jsonify({"message": "Usuario no encontrado o inexistente."}), 401
            
            # Inyectar el usuario actual en el contexto de la request
            g.current_user = current_user
            
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "El token ha expirado. Inicia sesión nuevamente."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token inválido o corrupto."}), 401
            
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """
    Decorador para validar privilegios de Administrador.
    Requiere que se use en conjunto con @token_required.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Asegurar que se ejecutó previamente @token_required y g.current_user existe
        if not hasattr(g, 'current_user') or g.current_user is None:
            return jsonify({"message": "Es necesario iniciar sesión primero."}), 401
            
        # Validar el rol
        if g.current_user.role != 'Admin':
            return jsonify({"message": "Acceso denegado: Se requieren privilegios de Administrador."}), 403
            
        return f(*args, **kwargs)
    return decorated
