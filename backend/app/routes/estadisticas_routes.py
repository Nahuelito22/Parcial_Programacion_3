from flask import Blueprint
from app.middlewares.auth_middleware import token_required, admin_required
from app.controllers.estadisticas_controller import (
    get_editions, create_edition, update_edition, delete_edition,
    get_team_statistics, get_team_statistics_by_edition, create_team_statistic, update_team_statistic, delete_team_statistic,
    get_player_statistics, get_player_statistics_by_edition, create_player_statistic, update_player_statistic, delete_player_statistic
)

estadisticas_bp = Blueprint('estadisticas', __name__)

# ==============================================================================
# RUTAS DE EDICIONES
# ==============================================================================

@estadisticas_bp.route('/ediciones', methods=['GET'])
def list_editions():
    return get_editions()

@estadisticas_bp.route('/ediciones', methods=['POST'])
@token_required
@admin_required
def add_edition():
    return create_edition()

@estadisticas_bp.route('/ediciones/<int:edition_id>', methods=['PUT'])
@token_required
@admin_required
def edit_edition(edition_id):
    return update_edition(edition_id)

@estadisticas_bp.route('/ediciones/<int:edition_id>', methods=['DELETE'])
@token_required
@admin_required
def remove_edition(edition_id):
    return delete_edition(edition_id)


# ==============================================================================
# RUTAS DE ESTADÍSTICAS DE EQUIPOS
# ==============================================================================

@estadisticas_bp.route('/estadisticas/equipos', methods=['GET'])
def list_team_statistics():
    return get_team_statistics()

@estadisticas_bp.route('/estadisticas/equipos/edicion/<int:edition_id>', methods=['GET'])
def list_team_statistics_by_edition(edition_id):
    return get_team_statistics_by_edition(edition_id)

@estadisticas_bp.route('/estadisticas/equipos', methods=['POST'])
@token_required
@admin_required
def add_team_statistic():
    return create_team_statistic()

@estadisticas_bp.route('/estadisticas/equipos/<int:stat_id>', methods=['PUT'])
@token_required
@admin_required
def edit_team_statistic(stat_id):
    return update_team_statistic(stat_id)

@estadisticas_bp.route('/estadisticas/equipos/<int:stat_id>', methods=['DELETE'])
@token_required
@admin_required
def remove_team_statistic(stat_id):
    return delete_team_statistic(stat_id)


# ==============================================================================
# RUTAS DE ESTADÍSTICAS DE JUGADORES
# ==============================================================================

@estadisticas_bp.route('/estadisticas/jugadores', methods=['GET'])
def list_player_statistics():
    return get_player_statistics()

@estadisticas_bp.route('/estadisticas/jugadores/edicion/<int:edition_id>', methods=['GET'])
def list_player_statistics_by_edition(edition_id):
    return get_player_statistics_by_edition(edition_id)

@estadisticas_bp.route('/estadisticas/jugadores', methods=['POST'])
@token_required
@admin_required
def add_player_statistic():
    return create_player_statistic()

@estadisticas_bp.route('/estadisticas/jugadores/<int:stat_id>', methods=['PUT'])
@token_required
@admin_required
def edit_player_statistic(stat_id):
    return update_player_statistic(stat_id)

@estadisticas_bp.route('/estadisticas/jugadores/<int:stat_id>', methods=['DELETE'])
@token_required
@admin_required
def remove_player_statistic(stat_id):
    return delete_player_statistic(stat_id)
