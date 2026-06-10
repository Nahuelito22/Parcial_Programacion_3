from abc import ABC, abstractmethod

class Statistic(ABC):
    """
    Clase base abstracta (POO) que representa una estadística genérica de un mundial.
    Aplica encapsulamiento básico para los atributos en común.
    """
    def __init__(self, edition_id: int, matches_played: int, id: int = None):
        self.id = id
        self.edition_id = edition_id
        self.matches_played = matches_played

    @abstractmethod
    def calculate_performance(self) -> float:
        """
        Método abstracto que debe ser implementado por las clases hijas.
        Aplica polimorfismo según si es estadística de equipo o de jugador.
        """
        pass
