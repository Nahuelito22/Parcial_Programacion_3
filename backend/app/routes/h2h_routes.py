from flask import Blueprint
from app.controllers.h2h_controller import get_teams, get_players, get_team_h2h, get_player_h2h

h2h_bp = Blueprint('h2h', __name__)

@h2h_bp.route('/equipos', methods=['GET'])
def list_teams():
    """
    Retorna la lista de selecciones.
    """
    return get_teams()

@h2h_bp.route('/jugadores', methods=['GET'])
def list_players():
    """
    Retorna la lista de jugadores.
    """
    return get_players()

@h2h_bp.route('/equipos/<int:id_a>/<int:id_b>', methods=['GET'])
def compare_teams(id_a, id_b):
    """
    Retorna la comparación cara a cara entre dos selecciones.
    """
    return get_team_h2h(id_a, id_b)

@h2h_bp.route('/jugadores/<int:id_a>/<int:id_b>', methods=['GET'])
def compare_players(id_a, id_b):
    """
    Retorna la comparación cara a cara entre dos jugadores.
    """
    return get_player_h2h(id_a, id_b)

@h2h_bp.route('/ediciones', methods=['GET'])
def list_editions():
    """
    Retorna las ediciones mundiales disponibles.
    """
    from app.controllers.estadisticas_controller import get_editions
    return get_editions()
