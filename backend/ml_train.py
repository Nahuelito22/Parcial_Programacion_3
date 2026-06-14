import os
import sys
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier

# Añadir el directorio actual al path para poder importar de app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Database
from app.models.match import Match

def train_model():
    print("Iniciando entrenamiento del modelo del Oráculo IA...")
    
    # 1. Obtener todos los partidos de la base de datos
    conn = Database.get_connection()
    matches = []
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT edicion_id, equipo_local_id, equipo_visitante_id, resultado 
                FROM partidos
            """)
            matches = cursor.fetchall()
    except Exception as e:
        print(f"Error al leer partidos de la BD: {e}")
        return
    finally:
        conn.close()

    if not matches:
        print("No se encontraron partidos en la base de datos para entrenar el modelo.")
        return

    print(f"Procesando {len(matches)} partidos para extracción de características...")

    X = []
    y = []

    # Cache de estadísticas para no consultar repetidamente la BD
    stats_cache = {}

    def get_cached_stats(team_id, edicion_id):
        cache_key = (team_id, edicion_id)
        if cache_key not in stats_cache:
            stats = Match.get_team_stats(team_id, edicion_id)
            # Fallback a global
            if edicion_id is not None and stats["total_partidos"] == 0:
                stats = Match.get_team_stats(team_id, None)
            stats_cache[cache_key] = stats
        return stats_cache[cache_key]

    for match in matches:
        edicion_id = match["edicion_id"]
        local_id = match["equipo_local_id"]
        visitor_id = match["equipo_visitante_id"]
        resultado = match["resultado"]

        stats_l = get_cached_stats(local_id, edicion_id)
        stats_v = get_cached_stats(visitor_id, edicion_id)

        avg_goals_l_for = stats_l["goles_a_favor"] / max(stats_l["total_partidos"], 1)
        avg_goals_l_against = stats_l["goles_en_contra"] / max(stats_l["total_partidos"], 1)
        
        avg_goals_v_for = stats_v["goles_a_favor"] / max(stats_v["total_partidos"], 1)
        avg_goals_v_against = stats_v["goles_en_contra"] / max(stats_v["total_partidos"], 1)

        # Defaults
        if stats_l["total_partidos"] == 0:
            avg_goals_l_for = 1.2
            avg_goals_l_against = 1.2
        if stats_v["total_partidos"] == 0:
            avg_goals_v_for = 1.2
            avg_goals_v_against = 1.2

        features = [
            avg_goals_l_for,
            avg_goals_l_against,
            stats_l["posesion_promedio"],
            stats_l["titulos"],
            avg_goals_v_for,
            avg_goals_v_against,
            stats_v["posesion_promedio"],
            stats_v["titulos"]
        ]

        # Mapear resultado: 'visitante' -> 0, 'empate' -> 1, 'local' -> 2
        if resultado == 'local':
            target = 2
        elif resultado == 'empate':
            target = 1
        elif resultado == 'visitante':
            target = 0
        else:
            continue  # Saltar si hay algún dato erróneo

        X.append(features)
        y.append(target)

    if not X:
        print("No se pudieron extraer características válidas para entrenar.")
        return

    print("Entrenando clasificador RandomForest...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Validar que exista la carpeta backend/models
    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)

    model_path = models_dir / "match_predictor.joblib"
    joblib.dump(model, model_path)
    
    print(f"¡Modelo entrenado con éxito y guardado en {model_path}!")

if __name__ == "__main__":
    train_model()
