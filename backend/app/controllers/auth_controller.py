import os
import datetime
from flask import request, jsonify, g
import jwt
import bcrypt
from app.models.user import User

def register_user():
    """
    Controlador para el registro de nuevos usuarios en el sistema.
    Hashea la contraseña con bcrypt antes de guardarla.
    """
    data = request.get_json() or {}
    
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "User") # Rol por defecto: User
    
    # Validar campos requeridos
    if not username or not email or not password:
        return jsonify({"message": "Faltan campos obligatorios: username, email o password."}), 400
        
    # Limitar roles válidos
    if role not in ["Admin", "User"]:
        return jsonify({"message": "Rol inválido. Debe ser 'Admin' o 'User'."}), 400
        
    try:
        # Verificar si el nombre de usuario ya existe
        if User.get_by_username(username):
            return jsonify({"message": "El nombre de usuario ya está registrado."}), 409
            
        # Verificar si el email ya existe
        if User.get_by_email(email):
            return jsonify({"message": "El correo electrónico ya está registrado."}), 409
            
        # Encriptar la contraseña con bcrypt
        salt = bcrypt.gensalt()
        hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), salt)
        password_hash = hashed_bytes.decode("utf-8")
        
        # Crear usuario y guardar
        new_user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            role=role
        )
        new_user.save()
        
        return jsonify({
            "message": "Usuario registrado exitosamente.",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "role": new_user.role
            }
        }), 201
        
    except Exception as e:
        return jsonify({"message": "Ocurrió un error en el servidor.", "error": str(e)}), 500

def login_user():
    """
    Controlador para iniciar sesión.
    Verifica las credenciales y devuelve un token JWT firmado.
    """
    data = request.get_json() or {}
    
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"message": "Se requieren email y password."}), 400
        
    try:
        # Buscar usuario
        user = User.get_by_email(email)
        if not user:
            return jsonify({"message": "Credenciales inválidas (usuario o contraseña incorrectos)."}), 401
            
        # Verificar contraseña
        if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
            return jsonify({"message": "Credenciales inválidas (usuario o contraseña incorrectos)."}), 401
            
        # Generar Token JWT
        secret_key = os.getenv("JWT_SECRET_KEY", "tu_jwt_secret_aqui")
        expiration_hours = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 24))
        payload = {
            "sub": str(user.id),
            "role": user.role,
            "iat": datetime.datetime.utcnow(),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=expiration_hours)
        }
        
        token = jwt.encode(payload, secret_key, algorithm="HS256")


        
        return jsonify({
            "message": "Inicio de sesión exitoso.",
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Ocurrió un error en el servidor.", "error": str(e)}), 500

def get_current_user_profile():
    """
    Devuelve los datos del perfil del usuario actualmente logueado.
    Requiere pasar previamente por el middleware de validación del token.
    """
    # g.current_user es inyectado por @token_required
    user = getattr(g, "current_user", None)
    
    if not user:
        return jsonify({"message": "No autenticado."}), 401
        
    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200
