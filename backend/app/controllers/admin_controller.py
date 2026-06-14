from flask import jsonify

def clear_database():
    """
    Endpoint para vaciar las tablas de estadísticas y ediciones.
    """
    return jsonify({"message": "clear-db endpoint activo"}), 200

def import_csv_data():
    """
    Endpoint para importar datos históricos desde archivos CSV.
    """
    return jsonify({"message": "import-csv endpoint activo"}), 200

def sync_api_data():
    """
    Endpoint para sincronizar datos en vivo desde API-Football.
    """
    return jsonify({"message": "sync-api endpoint activo"}), 200
