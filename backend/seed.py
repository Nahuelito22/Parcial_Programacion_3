import os
import sys
import bcrypt

# Agregar el directorio raíz del backend al path para que reconozca el módulo app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Database
from app.models.user import User
from app.models.edition import Edition
from app.models.team_statistic import TeamStatistic
from app.models.player_statistic import PlayerStatistic

def run_seeder():
    print("=== Iniciando Seeding de Base de Datos ===")

    # 1. Verificar y crear Usuario Administrador
    print("Sembrando Administrador...")
    admin_email = "admin@mundial.com"
    existing_admin = User.get_by_email(admin_email)
    
    if not existing_admin:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw("admin123".encode("utf-8"), salt)
        password_hash = hashed.decode("utf-8")
        
        admin = User(
            username="admin",
            email=admin_email,
            password_hash=password_hash,
            role="Admin"
        )
        admin.save()
        print(f"Administrador creado: {admin_email} / admin123")
    else:
        print("El Administrador ya existe en la base de datos.")

    # 2. Verificar y crear Edición de Prueba (Catar 2022)
    print("Sembrando Edición Catar 2022...")
    edition_year = 2022
    edition_id = None
    
    # Buscar si ya existe la edición Catar 2022
    for ed in Edition.get_all():
        if ed.year == edition_year:
            edition_id = ed.id
            print(f"Edición Catar 2022 encontrada (ID: {edition_id}).")
            break
            
    if not edition_id:
        new_ed = Edition(
            year=edition_year,
            host_country="Catar",
            champion="Argentina"
        )
        edition_id = new_ed.save()
        print(f"Edición Catar 2022 creada (ID: {edition_id}).")

    # 3. Sembrar Estadísticas de Equipos para Catar 2022
    print("Sembrando Estadísticas de Equipos...")
    
    # Argentina
    existing_team_stats = TeamStatistic.get_by_edition(edition_id)
    argentina_seeded = any(s.team_name == "Argentina" for s in existing_team_stats)
    if not argentina_seeded:
        arg_stat = TeamStatistic(
            edition_id=edition_id,
            matches_played=7,
            team_id=1,
            team_name="Argentina",
            goals_for=15,
            goals_against=8,
            average_possession=57.5
        )
        arg_stat.save()
        print("Estadística de equipo sembrada: Argentina")
    else:
        print("Estadística de equipo Argentina ya existe.")

    # Francia
    francia_seeded = any(s.team_name == "Francia" for s in existing_team_stats)
    if not francia_seeded:
        fra_stat = TeamStatistic(
            edition_id=edition_id,
            matches_played=7,
            team_id=2,
            team_name="Francia",
            goals_for=16,
            goals_against=8,
            average_possession=51.3
        )
        fra_stat.save()
        print("Estadística de equipo sembrada: Francia")
    else:
        print("Estadística de equipo Francia ya existe.")

    # 4. Sembrar Estadísticas de Jugadores para Catar 2022
    print("Sembrando Estadísticas de Jugadores...")
    existing_player_stats = PlayerStatistic.get_by_edition(edition_id)
    
    # Messi
    messi_seeded = any(s.player_name == "Lionel Messi" for s in existing_player_stats)
    if not messi_seeded:
        messi_stat = PlayerStatistic(
            edition_id=edition_id,
            matches_played=7,
            player_id=10,
            player_name="Lionel Messi",
            goals=7,
            assists=3,
            yellow_cards=1
        )
        messi_stat.save()
        print("Estadística de jugador sembrada: Lionel Messi")
    else:
        print("Estadística de jugador Lionel Messi ya existe.")

    # Mbappé
    mbappe_seeded = any(s.player_name == "Kylian Mbappé" for s in existing_player_stats)
    if not mbappe_seeded:
        mbappe_stat = PlayerStatistic(
            edition_id=edition_id,
            matches_played=7,
            player_id=7,
            player_name="Kylian Mbappé",
            goals=8,
            assists=2,
            yellow_cards=0
        )
        mbappe_stat.save()
        print("Estadística de jugador sembrada: Kylian Mbappé")
    else:
        print("Estadística de jugador Kylian Mbappé ya existe.")

    print("=== Seeding Completado con Éxito ===")

if __name__ == "__main__":
    run_seeder()
