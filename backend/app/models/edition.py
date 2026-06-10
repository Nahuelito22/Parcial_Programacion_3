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
