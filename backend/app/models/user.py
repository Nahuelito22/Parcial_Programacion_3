class User:
    """
    Clase que representa un usuario del sistema. Mapea la lógica de
    usuarios regulares y administradores a través del rol (Admin/User).
    """
    def __init__(self, username: str, email: str, password_hash: str, role: str = "User", id: int = None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role

    @staticmethod
    def from_db_row(row: dict):
        """
        Mapea una fila de base de datos MySQL (con nombres en español) 
        a una instancia de la clase User en Python.
        """
        if not row:
            return None
        return User(
            id=row.get("id"),
            username=row.get("nombre_usuario"),
            email=row.get("email"),
            password_hash=row.get("contrasenia_hash"),
            role=row.get("rol")
        )

    def to_db_dict(self) -> dict:
        """
        Mapea la instancia de User a un diccionario estructurado 
        con los nombres de columnas de la base de datos MySQL (en español).
        """
        return {
            "id": self.id,
            "nombre_usuario": self.username,
            "email": self.email,
            "contrasenia_hash": self.password_hash,
            "rol": self.role
        }

    @staticmethod
    def get_by_id(user_id: int):
        """
        Obtiene un usuario de la base de datos por su ID.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
                row = cursor.fetchone()
                return User.from_db_row(row)
        finally:
            conn.close()

    @staticmethod
    def get_by_email(email: str):
        """
        Obtiene un usuario de la base de datos por su email.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
                row = cursor.fetchone()
                return User.from_db_row(row)
        finally:
            conn.close()

    @staticmethod
    def get_by_username(username: str):
        """
        Obtiene un usuario de la base de datos por su nombre de usuario.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM usuarios WHERE nombre_usuario = %s", (username,))
                row = cursor.fetchone()
                return User.from_db_row(row)
        finally:
            conn.close()

    def save(self) -> int:
        """
        Inserta o actualiza el registro del usuario en la base de datos.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                if self.id is None:
                    # Inserción
                    cursor.execute(
                        "INSERT INTO usuarios (nombre_usuario, email, contrasenia_hash, rol) VALUES (%s, %s, %s, %s)",
                        (self.username, self.email, self.password_hash, self.role)
                    )
                    self.id = cursor.lastrowid
                else:
                    # Actualización
                    cursor.execute(
                        "UPDATE usuarios SET nombre_usuario = %s, email = %s, contrasenia_hash = %s, rol = %s WHERE id = %s",
                        (self.username, self.email, self.password_hash, self.role, self.id)
                    )
            return self.id
        finally:
            conn.close()

