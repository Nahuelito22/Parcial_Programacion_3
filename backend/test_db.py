import os
import sys

# Agregar el directorio raíz del backend al path para que reconozca el módulo app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Database
from app.models.team_statistic import TeamStatistic
from app.models.player_statistic import PlayerStatistic

def test():
    print("=== TEST 1: Conexión a Base de Datos ===")
    try:
        conn = Database.get_connection()
        print("Conexión exitosa a MySQL!")
        conn.close()
    except Exception as e:
        print(f"Error de conexión: {e}")
        print("Nota: Si no tienes MySQL corriendo localmente, esta prueba fallará pero los modelos seguirán cargados correctamente.")

    print("\n=== TEST 2: Polimorfismo y Métodos de Modelos ===")
    
    # Instanciar Estadísticas de Equipo (Diferencia de goles promedio)
    team_stat = TeamStatistic(
        edition_id=1, matches_played=7, team_id=10, team_name="Argentina",
        goals_for=15, goals_against=8, average_possession=57.5
    )
    # Instanciar Estadísticas de Jugador (Goles + Asistencias promedio)
    player_stat = PlayerStatistic(
        edition_id=1, matches_played=7, player_id=99, player_name="Lionel Messi",
        goals=7, assists=3, yellow_cards=1
    )

    print(f"Equipo: {team_stat.team_name} | Partidos: {team_stat.matches_played}")
    print(f"  Goles a Favor: {team_stat.goals_for} | Goles en Contra: {team_stat.goals_against}")
    print(f"  Rendimiento calculado (Diferencia de goles promedio): {team_stat.calculate_performance():.2f}")
    
    print(f"Jugador: {player_stat.player_name} | Partidos: {player_stat.matches_played}")
    print(f"  Goles: {player_stat.goals} | Asistencias: {player_stat.assists}")
    print(f"  Rendimiento calculado (Goles + Asistencias promedio): {player_stat.calculate_performance():.2f}")

    print("\n=== TEST 3: Serialización a Formato DB (Mapeador) ===")
    print("Diccionario DB Equipo:")
    print(team_stat.to_db_dict())
    print("Diccionario DB Jugador:")
    print(player_stat.to_db_dict())

if __name__ == "__main__":
    test()
