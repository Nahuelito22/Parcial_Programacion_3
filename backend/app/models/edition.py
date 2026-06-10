class Edition:
    """
    Clase que representa una edición del mundial (ej: Catar 2022).
    """
    def __init__(self, year: int, host_country: str, champion: str, id: int = None):
        self.id = id
        self.year = year
        self.host_country = host_country
        self.champion = champion

    @staticmethod
    def from_db_row(row: dict):
        """
        Mapea una fila de base de datos MySQL (con nombres en español) 
        a una instancia de la clase Edition en Python.
        """
        if not row:
            return None
        return Edition(
            id=row.get("id"),
            year=row.get("anio"),
            host_country=row.get("pais_anfitrion"),
            champion=row.get("campeon")
        )

    def to_db_dict(self) -> dict:
        """
        Mapea la instancia de Edition a un diccionario estructurado 
        con los nombres de columnas de la base de datos MySQL (en español).
        """
        return {
            "id": self.id,
            "anio": self.year,
            "pais_anfitrion": self.host_country,
            "campeon": self.champion
        }

    @staticmethod
    def get_all():
        """
        Retorna todas las ediciones ordenadas por año descendente.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM ediciones ORDER BY anio DESC")
                rows = cursor.fetchall()
                return [Edition.from_db_row(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(edition_id: int):
        """
        Retorna una edición específica según su ID.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM ediciones WHERE id = %s", (edition_id,))
                row = cursor.fetchone()
                return Edition.from_db_row(row)
        finally:
            conn.close()

    def save(self) -> int:
        """
        Inserta o actualiza la edición en la base de datos.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                if self.id is None:
                    cursor.execute(
                        "INSERT INTO ediciones (anio, pais_anfitrion, campeon) VALUES (%s, %s, %s)",
                        (self.year, self.host_country, self.champion)
                    )
                    self.id = cursor.lastrowid
                else:
                    cursor.execute(
                        "UPDATE ediciones SET anio = %s, pais_anfitrion = %s, campeon = %s WHERE id = %s",
                        (self.year, self.host_country, self.champion, self.id)
                    )
            return self.id
        finally:
            conn.close()

    @staticmethod
    def delete_by_id(edition_id: int) -> bool:
        """
        Elimina una edición específica de la base de datos.
        """
        from app.database import Database
        conn = Database.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM ediciones WHERE id = %s", (edition_id,))
                return cursor.rowcount > 0
        finally:
            conn.close()

