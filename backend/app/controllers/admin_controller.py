from flask import jsonify
from app.database import Database

def clear_database():
    """
    Endpoint para vaciar las tablas de estadísticas y ediciones de forma segura (FK-safe).
    """
    conn = None
    try:
        conn = Database.get_connection(autocommit=False)
        with conn.cursor() as cursor:
            # Orden seguro de FK
            cursor.execute("DELETE FROM estadisticas_jugadores")
            jugadores_deleted = cursor.rowcount
            
            cursor.execute("DELETE FROM estadisticas_equipos")
            equipos_deleted = cursor.rowcount
            
            cursor.execute("DELETE FROM ediciones")
            ediciones_deleted = cursor.rowcount
            
            conn.commit()
            
            return jsonify({
                "message": f"Base de datos vaciada correctamente. Ediciones: {ediciones_deleted}, Equipos: {equipos_deleted}, Jugadores: {jugadores_deleted}"
            }), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": f"Error al vaciar la base de datos: {str(e)}"}), 500
    finally:
        if conn:
            conn.close()

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
