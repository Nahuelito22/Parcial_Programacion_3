from flask import Blueprint
from app.controllers.rankings_controller import get_top_scorers, get_participations, get_best_attacks

rankings_bp = Blueprint('rankings', __name__)

@rankings_bp.route('/top-goleadores', methods=['GET'])
def top_scorers():
    """
    Endpoint para el top de goleadores.
    """
    return get_top_scorers()

@rankings_bp.route('/participaciones', methods=['GET'])
def participations():
    """
    Endpoint para el ranking de participaciones de selecciones.
    """
    return get_participations()

@rankings_bp.route('/mejor-ataque', methods=['GET'])
def best_attacks():
    """
    Endpoint para el ranking de selecciones con mejor promedio de ataque.
    """
    return get_best_attacks()
