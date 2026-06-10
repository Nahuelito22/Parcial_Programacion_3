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
