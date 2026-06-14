import os
import logging
import pandas as pd
from app.database import Database
from app.utils.csv_paths import CSV_DATA_DIR, CSV_FILES

logger = logging.getLogger(__name__)

class CSVImporter:
    def __init__(self):
        self.csv_dir = CSV_DATA_DIR
        self.files = CSV_FILES

    def _load_csv(self, key):
        file_path = self.csv_dir / self.files[key]
        if not file_path.exists():
            raise FileNotFoundError(f"Archivo CSV no encontrado: {file_path}")
        logger.info(f"Cargando CSV: {self.files[key]}")
        return pd.read_csv(file_path)

    def run(self):
        # Orquestador del pipeline ETL
        logger.info("Iniciando pipeline ETL de importación de CSVs...")
        
        # 1. Cargar DataFrames
        try:
            df_tournaments = self._load_csv("tournaments")
            df_standings = self._load_csv("tournament_standings")
            df_group_standings = self._load_csv("group_standings")
            df_teams = self._load_csv("teams")
            df_players = self._load_csv("players")
            df_squads = self._load_csv("squads")
            df_appearances = self._load_csv("player_appearances")
            df_goals = self._load_csv("goals")
            df_bookings = self._load_csv("bookings")
            df_matches = self._load_csv("matches")
        except Exception as e:
            logger.error(f"Error al cargar archivos CSV: {e}")
            return {"status": "error", "message": f"Error al cargar archivos CSV: {str(e)}"}

        conn = None
        try:
            # Conexión sin autocommit para transacciones
            conn = Database.get_connection(autocommit=False)
            cursor = conn.cursor()

            # --- FASE 1: LIMPIEZA SEGURA (Clear-then-insert) ---
            logger.info("Fase de Limpieza: Vaciando tablas existentes...")
            cursor.execute("DELETE FROM partidos")
            cursor.execute("DELETE FROM estadisticas_jugadores")
            cursor.execute("DELETE FROM estadisticas_equipos")
            cursor.execute("DELETE FROM ediciones")
            logger.info("Limpieza completada con éxito.")

            # --- FASE 2: EDICIONES ---
            logger.info("Fase de Transformación: Procesando Ediciones...")
            # Filtrar mundiales masculinos
            df_men_tournaments = df_tournaments[df_tournaments["men"].astype(str).str.upper() == "TRUE"].copy()
            
            # Obtener ganadores de las posiciones
            df_winners = df_standings[df_standings["position"].astype(int) == 1][["tournament_id", "team_name"]].copy()
            
            # Unir para obtener campeon
            df_editions_merged = pd.merge(
                df_men_tournaments,
                df_winners,
                on="tournament_id",
                how="left"
            )
            df_editions_merged["campeon"] = df_editions_merged["team_name"].fillna("Por determinar")
            df_editions_merged = df_editions_merged.sort_values(by="year")

            # Cargar ediciones en BD
            edition_rows = []
            for _, row in df_editions_merged.iterrows():
                edition_rows.append((
                    int(row["year"]),
                    str(row["host_country"]),
                    str(row["campeon"])
                ))

            logger.info(f"Fase de Carga: Insertando {len(edition_rows)} ediciones...")
            cursor.executemany(
                "INSERT INTO ediciones (anio, pais_anfitrion, campeon) VALUES (%s, %s, %s)",
                edition_rows
            )

            # Recuperar mapeo de year -> edicion_id
            cursor.execute("SELECT id, anio FROM ediciones")
            ediciones_db = cursor.fetchall()
            year_to_edicion_id = {row["anio"]: row["id"] for row in ediciones_db}

            # --- FASE 3: ESTADÍSTICAS DE EQUIPOS ---
            logger.info("Fase de Transformación: Procesando Estadísticas de Equipos...")
            # Filtrar standings de grupos por mundiales masculinos
            df_group_standings_men = df_group_standings[
                df_group_standings["tournament_id"].isin(df_men_tournaments["tournament_id"])
            ].copy()

            # Agregar para evitar duplicados en ediciones con segunda fase de grupos
            df_team_grouped = df_group_standings_men.groupby(["tournament_id", "team_id", "team_name"], as_index=False).agg({
                "played": "sum",
                "goals_for": "sum",
                "goals_against": "sum"
            })

            # Añadir anio de torneo
            df_team_stats_merged = pd.merge(
                df_team_grouped,
                df_men_tournaments[["tournament_id", "year"]],
                on="tournament_id",
                how="inner"
            )

            # Generar mapeo único de team_id a entero secuencial usando el maestro de equipos
            all_men_team_ids = df_teams["team_id"].dropna().unique()
            sorted_team_ids = sorted(list(all_men_team_ids))
            team_uuid_to_int = {uuid: idx + 1 for idx, uuid in enumerate(sorted_team_ids)}

            team_rows = []
            for _, row in df_team_stats_merged.iterrows():
                edicion_id = year_to_edicion_id.get(int(row["year"]))
                if not edicion_id:
                    continue
                team_rows.append((
                    int(edicion_id),
                    int(row["played"]),
                    int(team_uuid_to_int[row["team_id"]]),
                    str(row["team_name"]),
                    int(row["goals_for"]),
                    int(row["goals_against"]),
                    0.00  # posesion_promedio placeholder
                ))

            logger.info(f"Fase de Carga: Insertando {len(team_rows)} estadísticas de equipos...")
            cursor.executemany(
                "INSERT INTO estadisticas_equipos (edicion_id, partidos_jugados, pais_id, nombre_pais, goles_a_favor, goles_en_contra, posesion_promedio) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                team_rows
            )

            # --- FASE 4: ESTADÍSTICAS DE JUGADORES ---
            logger.info("Fase de Transformación: Procesando Estadísticas de Jugadores...")
            
            # Cargar y preparar maestros de jugadores
            df_players["full_name"] = df_players["given_name"].fillna("").str.strip() + " " + df_players["family_name"].fillna("").str.strip()
            df_players["full_name"] = df_players["full_name"].str.strip()
            
            sorted_player_ids = sorted(df_players["player_id"].dropna().unique())
            player_uuid_to_int = {uuid: idx + 1 for idx, uuid in enumerate(sorted_player_ids)}
            player_id_to_name = dict(zip(df_players["player_id"], df_players["full_name"]))

            # Filtrar squads por mundiales masculinos
            df_squads_men = df_squads[df_squads["tournament_id"].isin(df_men_tournaments["tournament_id"])].copy()

            # Calcular apariciones desde player_appearances
            df_appearances_men = df_appearances[df_appearances["tournament_id"].isin(df_men_tournaments["tournament_id"])].copy()
            df_app_grouped = df_appearances_men.groupby(["tournament_id", "player_id"], as_index=False).size()
            df_app_grouped.rename(columns={"size": "partidos_jugados"}, inplace=True)

            # Calcular goles desde goals (excluyendo autogoles)
            df_goals_men = df_goals[
                (df_goals["tournament_id"].isin(df_men_tournaments["tournament_id"])) &
                (df_goals["own_goal"].astype(str).str.upper() != "TRUE")
            ].copy()
            df_goals_grouped = df_goals_men.groupby(["tournament_id", "player_id"], as_index=False).size()
            df_goals_grouped.rename(columns={"size": "goles"}, inplace=True)

            # Calcular tarjetas amarillas desde bookings
            df_bookings_men = df_bookings[
                (df_bookings["tournament_id"].isin(df_men_tournaments["tournament_id"])) &
                (df_bookings["yellow_card"].astype(str).str.upper() == "TRUE")
            ].copy()
            df_bookings_grouped = df_bookings_men.groupby(["tournament_id", "player_id"], as_index=False).size()
            df_bookings_grouped.rename(columns={"size": "tarjetas_amarillas"}, inplace=True)

            # Unir todos los datos al maestro squads
            df_squads_unique = df_squads_men[["tournament_id", "player_id", "given_name", "family_name"]].drop_duplicates()

            df_player_merged = pd.merge(df_squads_unique, df_app_grouped, on=["tournament_id", "player_id"], how="left")
            df_player_merged = pd.merge(df_player_merged, df_goals_grouped, on=["tournament_id", "player_id"], how="left")
            df_player_merged = pd.merge(df_player_merged, df_bookings_grouped, on=["tournament_id", "player_id"], how="left")

            # Rellenar nulos
            df_player_merged["partidos_jugados"] = df_player_merged["partidos_jugados"].fillna(0).astype(int)
            df_player_merged["goles"] = df_player_merged["goles"].fillna(0).astype(int)
            df_player_merged["tarjetas_amarillas"] = df_player_merged["tarjetas_amarillas"].fillna(0).astype(int)

            # Unir anio de torneo
            df_player_merged = pd.merge(
                df_player_merged,
                df_men_tournaments[["tournament_id", "year"]],
                on="tournament_id",
                how="inner"
            )

            # Preparar filas de inserción
            player_rows = []
            for _, row in df_player_merged.iterrows():
                edicion_id = year_to_edicion_id.get(int(row["year"]))
                if not edicion_id:
                    continue
                
                # Nombre del jugador
                p_id = row["player_id"]
                full_name = player_id_to_name.get(p_id)
                if not full_name:
                    full_name = str(row["given_name"]).strip() + " " + str(row["family_name"]).strip()
                    full_name = full_name.strip()

                # Mapeo de player_id entero
                if p_id in player_uuid_to_int:
                    int_player_id = player_uuid_to_int[p_id]
                else:
                    # Fallback robusto
                    import zlib
                    int_player_id = zlib.crc32(str(p_id).encode('utf-8')) & 0x7fffffff

                player_rows.append((
                    int(edicion_id),
                    int(row["partidos_jugados"]),
                    int(int_player_id),
                    str(full_name),
                    int(row["goles"]),
                    0,  # asistencias placeholder
                    int(row["tarjetas_amarillas"])
                ))

            logger.info(f"Fase de Carga: Insertando {len(player_rows)} estadísticas de jugadores...")
            cursor.executemany(
                "INSERT INTO estadisticas_jugadores (edicion_id, partidos_jugados, jugador_id, nombre_jugador, goles, asistencias, tarjetas_amarillas) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                player_rows
            )

            # --- FASE 5: PARTIDOS ---
            logger.info("Fase de Transformación: Procesando Partidos...")
            
            # Helper para limpiar nulos
            def clean_val(val, default=None):
                if pd.isna(val) or val is None:
                    return default
                return val

            df_matches_men = pd.merge(
                df_matches,
                df_men_tournaments[["tournament_id", "year"]],
                on="tournament_id",
                how="inner"
            )

            match_rows = []
            for _, row in df_matches_men.iterrows():
                edicion_id = year_to_edicion_id.get(int(row["year"]))
                if not edicion_id:
                    continue

                home_uuid = row["home_team_id"]
                away_uuid = row["away_team_id"]
                home_id = team_uuid_to_int.get(home_uuid)
                away_id = team_uuid_to_int.get(away_uuid)

                if not home_id or not away_id:
                    logger.warning(f"Ignorando partido {row['match_id']}: equipo local ({home_uuid}) o visitante ({away_uuid}) no encontrado en mapeo.")
                    continue

                # Limpieza de nulos
                group_name = clean_val(row["group_name"])
                stadium_name = clean_val(row["stadium_name"])
                city_name = clean_val(row["city_name"])
                match_date = clean_val(row["match_date"])

                pen_local = clean_val(row["home_team_score_penalties"])
                pen_visitante = clean_val(row["away_team_score_penalties"])
                
                # Conversión a enteros para penales
                penales_local = int(pen_local) if pen_local is not None and not pd.isna(pen_local) else None
                penales_visitante = int(pen_visitante) if pen_visitante is not None and not pd.isna(pen_visitante) else None

                # Extra time boolean
                is_extra = True if str(row["extra_time"]).upper() == "TRUE" else False

                # Resultado
                res_raw = clean_val(row["result"])
                if res_raw == "home team win":
                    resultado = "local"
                elif res_raw == "away team win":
                    resultado = "visitante"
                elif res_raw == "draw":
                    resultado = "empate"
                else:
                    g_local = int(row["home_team_score"])
                    g_visitante = int(row["away_team_score"])
                    if g_local > g_visitante:
                        resultado = "local"
                    elif g_visitante > g_local:
                        resultado = "visitante"
                    else:
                        resultado = "empate"

                match_rows.append((
                    int(edicion_id),
                    match_date,
                    clean_val(row["stage_name"]),
                    group_name,
                    stadium_name,
                    city_name,
                    int(home_id),
                    clean_val(row["home_team_name"]),
                    int(away_id),
                    clean_val(row["away_team_name"]),
                    int(row["home_team_score"]),
                    int(row["away_team_score"]),
                    penales_local,
                    penales_visitante,
                    is_extra,
                    resultado,
                    clean_val(row["match_id"])
                ))

            logger.info(f"Fase de Carga: Insertando {len(match_rows)} partidos...")
            cursor.executemany(
                """
                INSERT INTO partidos (
                    edicion_id, match_date, stage_name, group_name, stadium_name, city_name,
                    equipo_local_id, equipo_local_nombre, equipo_visitante_id, equipo_visitante_nombre,
                    goles_local, goles_visitante, penales_local, penales_visitante, extra_time,
                    resultado, external_match_id
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                match_rows
            )

            # Confirmar transacción
            conn.commit()
            logger.info("Transacción confirmada. Pipeline ETL finalizado correctamente.")

            return {
                "status": "success",
                "message": f"Historico de datos CSV importado correctamente. Ediciones: {len(edition_rows)}, Equipos: {len(team_rows)}, Jugadores: {len(player_rows)}, Partidos: {len(match_rows)}"
            }

        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error durante la ejecución del pipeline ETL: {e}", exc_info=True)
            return {
                "status": "error",
                "message": f"Error al importar los datos: {str(e)}"
            }
        finally:
            if conn:
                conn.close()
