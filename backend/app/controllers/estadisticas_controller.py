from flask import request, jsonify
from app.models.edition import Edition
from app.models.team_statistic import TeamStatistic
from app.models.player_statistic import PlayerStatistic

# ==============================================================================
# CONTROLADORES DE EDICIONES
# ==============================================================================

def get_editions():
    """Retorna el listado de todas las ediciones del mundial."""
    try:
        editions = Edition.get_all()
        return jsonify([ed.to_db_dict() for ed in editions]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las ediciones.", "error": str(e)}), 500

def create_edition():
    """Crea una nueva edición del mundial. Solo Administradores."""
    data = request.get_json() or {}
    year = data.get("anio")
    host = data.get("pais_anfitrion")
    champion = data.get("campeon")

    if not year or not host or not champion:
        return jsonify({"message": "Faltan campos requeridos: anio, pais_anfitrion o campeon."}), 400

    try:
        # Validar si ya existe el año
        for ed in Edition.get_all():
            if ed.year == int(year):
                return jsonify({"message": f"Ya existe una edición registrada para el año {year}."}), 409

        new_ed = Edition(year=int(year), host_country=host, champion=champion)
        new_ed.save()
        return jsonify({
            "message": "Edición creada exitosamente.",
            "edicion": new_ed.to_db_dict()
        }), 201
    except Exception as e:
        return jsonify({"message": "Error al crear la edición.", "error": str(e)}), 500

def update_edition(edition_id):
    """Actualiza una edición existente. Solo Administradores."""
    try:
        ed = Edition.get_by_id(edition_id)
        if not ed:
            return jsonify({"message": "Edición no encontrada."}), 404

        data = request.get_json() or {}
        if "anio" in data:
            ed.year = int(data["anio"])
        if "pais_anfitrion" in data:
            ed.host_country = data["pais_anfitrion"]
        if "campeon" in data:
            ed.champion = data["campeon"]

        ed.save()
        return jsonify({
            "message": "Edición actualizada exitosamente.",
            "edicion": ed.to_db_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": "Error al actualizar la edición.", "error": str(e)}), 500

def delete_edition(edition_id):
    """Elimina una edición de la base de datos. Solo Administradores."""
    try:
        ed = Edition.get_by_id(edition_id)
        if not ed:
            return jsonify({"message": "Edición no encontrada."}), 404

        if Edition.delete_by_id(edition_id):
            return jsonify({"message": "Edición eliminada exitosamente."}), 200
        return jsonify({"message": "No se pudo eliminar la edición."}), 400
    except Exception as e:
        return jsonify({"message": "Error al eliminar la edición.", "error": str(e)}), 500


# ==============================================================================
# CONTROLADORES DE ESTADÍSTICAS DE EQUIPOS
# ==============================================================================

def get_team_statistics():
    """Retorna todas las estadísticas de equipos, incluyendo el rendimiento polimórfico."""
    try:
        stats = TeamStatistic.get_all()
        result = []
        for s in stats:
            dict_data = s.to_db_dict()
            dict_data["performance"] = s.calculate_performance()
            result.append(dict_data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las estadísticas.", "error": str(e)}), 500

def get_team_statistics_by_edition(edition_id):
    """Retorna las estadísticas de equipos para una edición específica."""
    try:
        # Validar si existe la edición
        if not Edition.get_by_id(edition_id):
            return jsonify({"message": "Edición no encontrada."}), 404

        stats = TeamStatistic.get_by_edition(edition_id)
        result = []
        for s in stats:
            dict_data = s.to_db_dict()
            dict_data["performance"] = s.calculate_performance()
            result.append(dict_data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las estadísticas.", "error": str(e)}), 500

def create_team_statistic():
    """Crea una nueva estadística de equipo. Solo Administradores."""
    data = request.get_json() or {}
    edition_id = data.get("edicion_id")
    matches_played = data.get("partidos_jugados", 0)
    team_id = data.get("pais_id")
    team_name = data.get("nombre_pais")
    goals_for = data.get("goles_a_favor", 0)
    goals_against = data.get("goles_en_contra", 0)
    average_possession = data.get("posesion_promedio", 0.0)

    if not edition_id or not team_id or not team_name:
        return jsonify({"message": "Faltan campos requeridos: edicion_id, pais_id o nombre_pais."}), 400

    try:
        # Validar que exista la edición
        if not Edition.get_by_id(edition_id):
            return jsonify({"message": f"Edición ID {edition_id} no encontrada."}), 400

        new_stat = TeamStatistic(
            edition_id=int(edition_id), matches_played=int(matches_played),
            team_id=int(team_id), team_name=team_name,
            goals_for=int(goals_for), goals_against=int(goals_against),
            average_possession=float(average_possession)
        )
        new_stat.save()
        return jsonify({
            "message": "Estadística de equipo creada exitosamente.",
            "estadistica": new_stat.to_db_dict()
        }), 201
    except Exception as e:
        return jsonify({"message": "Error al crear la estadística.", "error": str(e)}), 500

def update_team_statistic(stat_id):
    """Actualiza una estadística de equipo existente. Solo Administradores."""
    try:
        stat = TeamStatistic.get_by_id(stat_id)
        if not stat:
            return jsonify({"message": "Estadística no encontrada."}), 404

        data = request.get_json() or {}
        if "edicion_id" in data:
            if not Edition.get_by_id(data["edicion_id"]):
                return jsonify({"message": "Edición no encontrada."}), 400
            stat.edition_id = int(data["edicion_id"])
        if "partidos_jugados" in data:
            stat.matches_played = int(data["partidos_jugados"])
        if "pais_id" in data:
            stat.team_id = int(data["pais_id"])
        if "nombre_pais" in data:
            stat.team_name = data["nombre_pais"]
        if "goles_a_favor" in data:
            stat.goals_for = int(data["goles_a_favor"])
        if "goles_en_contra" in data:
            stat.goals_against = int(data["goles_en_contra"])
        if "posesion_promedio" in data:
            stat.average_possession = float(data["posesion_promedio"])

        stat.save()
        return jsonify({
            "message": "Estadística de equipo actualizada exitosamente.",
            "estadistica": stat.to_db_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": "Error al actualizar la estadística.", "error": str(e)}), 500

def delete_team_statistic(stat_id):
    """Elimina una estadística de equipo. Solo Administradores."""
    try:
        stat = TeamStatistic.get_by_id(stat_id)
        if not stat:
            return jsonify({"message": "Estadística no encontrada."}), 404

        if TeamStatistic.delete_by_id(stat_id):
            return jsonify({"message": "Estadística eliminada exitosamente."}), 200
        return jsonify({"message": "No se pudo eliminar la estadística."}), 400
    except Exception as e:
        return jsonify({"message": "Error al eliminar la estadística.", "error": str(e)}), 500


# ==============================================================================
# CONTROLADORES DE ESTADÍSTICAS DE JUGADORES
# ==============================================================================

def get_player_statistics():
    """Retorna todas las estadísticas de jugadores, incluyendo el rendimiento polimórfico."""
    try:
        stats = PlayerStatistic.get_all()
        result = []
        for s in stats:
            dict_data = s.to_db_dict()
            dict_data["performance"] = s.calculate_performance()
            result.append(dict_data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las estadísticas de jugadores.", "error": str(e)}), 500

def get_player_statistics_by_edition(edition_id):
    """Retorna las estadísticas de jugadores para una edición específica."""
    try:
        # Validar si existe la edición
        if not Edition.get_by_id(edition_id):
            return jsonify({"message": "Edición no encontrada."}), 404

        stats = PlayerStatistic.get_by_edition(edition_id)
        result = []
        for s in stats:
            dict_data = s.to_db_dict()
            dict_data["performance"] = s.calculate_performance()
            result.append(dict_data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las estadísticas.", "error": str(e)}), 500

def create_player_statistic():
    """Crea una nueva estadística de jugador. Solo Administradores."""
    data = request.get_json() or {}
    edition_id = data.get("edicion_id")
    matches_played = data.get("partidos_jugados", 0)
    player_id = data.get("jugador_id")
    player_name = data.get("nombre_jugador")
    goals = data.get("goles", 0)
    assists = data.get("asistencias", 0)
    yellow_cards = data.get("tarjetas_amarillas", 0)

    if not edition_id or not player_id or not player_name:
        return jsonify({"message": "Faltan campos requeridos: edicion_id, jugador_id o nombre_jugador."}), 400

    try:
        # Validar que exista la edición
        if not Edition.get_by_id(edition_id):
            return jsonify({"message": f"Edición ID {edition_id} no encontrada."}), 400

        new_stat = PlayerStatistic(
            edition_id=int(edition_id), matches_played=int(matches_played),
            player_id=int(player_id), player_name=player_name,
            goals=int(goals), assists=int(assists), yellow_cards=int(yellow_cards)
        )
        new_stat.save()
        return jsonify({
            "message": "Estadística de jugador creada exitosamente.",
            "estadistica": new_stat.to_db_dict()
        }), 201
    except Exception as e:
        return jsonify({"message": "Error al crear la estadística.", "error": str(e)}), 500

def update_player_statistic(stat_id):
    """Actualiza una estadística de jugador. Solo Administradores."""
    try:
        stat = PlayerStatistic.get_by_id(stat_id)
        if not stat:
            return jsonify({"message": "Estadística no encontrada."}), 404

        data = request.get_json() or {}
        if "edicion_id" in data:
            if not Edition.get_by_id(data["edicion_id"]):
                return jsonify({"message": "Edición no encontrada."}), 400
            stat.edition_id = int(data["edicion_id"])
        if "partidos_jugados" in data:
            stat.matches_played = int(data["partidos_jugados"])
        if "jugador_id" in data:
            stat.player_id = int(data["jugador_id"])
        if "nombre_jugador" in data:
            stat.player_name = data["nombre_jugador"]
        if "goles" in data:
            stat.goals = int(data["goles"])
        if "asistencias" in data:
            stat.assists = int(data["asistencias"])
        if "tarjetas_amarillas" in data:
            stat.yellow_cards = int(data["tarjetas_amarillas"])

        stat.save()
        return jsonify({
            "message": "Estadística de jugador actualizada exitosamente.",
            "estadistica": stat.to_db_dict()
        }), 200
    except Exception as e:
        return jsonify({"message": "Error al actualizar la estadística.", "error": str(e)}), 500

def delete_player_statistic(stat_id):
    """Elimina una estadística de jugador. Solo Administradores."""
    try:
        stat = PlayerStatistic.get_by_id(stat_id)
        if not stat:
            return jsonify({"message": "Estadística no encontrada."}), 404

        if PlayerStatistic.delete_by_id(stat_id):
            return jsonify({"message": "Estadística eliminada exitosamente."}), 200
        return jsonify({"message": "No se pudo eliminar la estadística."}), 400
    except Exception as e:
        return jsonify({"message": "Error al eliminar la estadística.", "error": str(e)}), 500
