-- Script de Inicialización de Base de Datos - Mundial Web App
-- Módulo: Estadísticas

CREATE DATABASE IF NOT EXISTS mundial_db;
USE mundial_db;

-- 1. Tabla: usuarios
-- Mapea usuarios regulares y administradores (Roles: Admin, User)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasenia_hash VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla: ediciones
-- Representa cada edición histórica del mundial
CREATE TABLE IF NOT EXISTS ediciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio INT NOT NULL UNIQUE,
    pais_anfitrion VARCHAR(100) NOT NULL,
    campeon VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla: estadisticas_equipos
-- Almacena estadísticas agregadas de un país/equipo para una edición específica
CREATE TABLE IF NOT EXISTS estadisticas_equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    edicion_id INT NOT NULL,
    partidos_jugados INT NOT NULL DEFAULT 0,
    pais_id INT NOT NULL,
    nombre_pais VARCHAR(100) NOT NULL,
    goles_a_favor INT NOT NULL DEFAULT 0,
    goles_en_contra INT NOT NULL DEFAULT 0,
    posesion_promedio DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (edicion_id) REFERENCES ediciones(id) ON DELETE CASCADE,
    CONSTRAINT chk_partidos_equipo CHECK (partidos_jugados >= 0),
    CONSTRAINT chk_goles_favor CHECK (goles_a_favor >= 0),
    CONSTRAINT chk_goles_contra CHECK (goles_en_contra >= 0),
    CONSTRAINT chk_posesion CHECK (posesion_promedio BETWEEN 0.00 AND 100.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla: estadisticas_jugadores
-- Almacena estadísticas individuales de un jugador para una edición específica
CREATE TABLE IF NOT EXISTS estadisticas_jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    edicion_id INT NOT NULL,
    partidos_jugados INT NOT NULL DEFAULT 0,
    jugador_id INT NOT NULL,
    nombre_jugador VARCHAR(100) NOT NULL,
    goles INT NOT NULL DEFAULT 0,
    asistencias INT NOT NULL DEFAULT 0,
    tarjetas_amarillas INT NOT NULL DEFAULT 0,
    FOREIGN KEY (edicion_id) REFERENCES ediciones(id) ON DELETE CASCADE,
    CONSTRAINT chk_partidos_jugador CHECK (partidos_jugados >= 0),
    CONSTRAINT chk_goles CHECK (goles >= 0),
    CONSTRAINT chk_asistencias CHECK (asistencias >= 0),
    CONSTRAINT chk_tarjetas CHECK (tarjetas_amarillas >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla: partidos
-- Almacena la información histórica de cada partido de los mundiales
CREATE TABLE IF NOT EXISTS partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    edicion_id INT NOT NULL,
    match_date DATE,
    stage_name VARCHAR(50),
    group_name VARCHAR(10),
    stadium_name VARCHAR(100),
    city_name VARCHAR(100),
    equipo_local_id INT NOT NULL,
    equipo_local_nombre VARCHAR(100),
    equipo_visitante_id INT NOT NULL,
    equipo_visitante_nombre VARCHAR(100),
    goles_local INT NOT NULL DEFAULT 0,
    goles_visitante INT NOT NULL DEFAULT 0,
    penales_local INT DEFAULT NULL,
    penales_visitante INT DEFAULT NULL,
    extra_time BOOLEAN DEFAULT FALSE,
    resultado VARCHAR(20),  -- 'local' | 'visitante' | 'empate'
    external_match_id VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (edicion_id) REFERENCES ediciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- TABLAS PARA EL FIXTURE Y ESTADÍSTICAS DEL MUNDIAL 2026
-- ========================================================

-- 6. Tabla: partidos_2026
-- Almacena el fixture en vivo y resultados del Mundial 2026
CREATE TABLE IF NOT EXISTS partidos_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_game_id VARCHAR(10) NOT NULL UNIQUE,
    grupo VARCHAR(10),
    tipo VARCHAR(20),        -- group, r32, r16, qf, sf, third, final
    matchday INT,
    fecha_local VARCHAR(50),
    estadio_id VARCHAR(10),
    estadio_nombre VARCHAR(100),
    ciudad VARCHAR(100),
    pais_sede VARCHAR(100),
    equipo_local_id VARCHAR(10),
    equipo_local_nombre VARCHAR(100),
    equipo_local_codigo VARCHAR(10),
    equipo_local_logo VARCHAR(255),
    equipo_visitante_id VARCHAR(10),
    equipo_visitante_nombre VARCHAR(100),
    equipo_visitante_codigo VARCHAR(10),
    equipo_visitante_logo VARCHAR(255),
    goles_local INT DEFAULT 0,
    goles_visitante INT DEFAULT 0,
    goleadores_local TEXT,
    goleadores_visitante TEXT,
    finalizado BOOLEAN DEFAULT FALSE,
    tiempo_transcurrido VARCHAR(50),
    etapa_detalle VARCHAR(100),  -- "Winner Group A", etc. para knockout
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_grupo (grupo),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha_local)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla: equipos_2026
-- Almacena los 48 equipos clasificados del Mundial 2026
CREATE TABLE IF NOT EXISTS equipos_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_team_id VARCHAR(10) NOT NULL UNIQUE,
    nombre_en VARCHAR(100),
    codigo_fifa VARCHAR(10),
    grupo VARCHAR(10),
    bandera_url VARCHAR(255),
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla: estadios_2026
-- Almacena los 16 estadios sedes del Mundial 2026
CREATE TABLE IF NOT EXISTS estadios_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_stadium_id VARCHAR(10) NOT NULL UNIQUE,
    nombre_en VARCHAR(100),
    nombre_fifa VARCHAR(100),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    capacidad INT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabla: grupos_2026
-- Almacena las posiciones de los 12 grupos del Mundial 2026
CREATE TABLE IF NOT EXISTS grupos_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo VARCHAR(10) NOT NULL,
    equipo_id VARCHAR(10) NOT NULL,
    posicion INT,
    puntos INT DEFAULT 0,
    goles_favor INT DEFAULT 0,
    goles_contra INT DEFAULT 0,
    diferencia_gol INT DEFAULT 0,
    partidos_jugados INT DEFAULT 0,
    victorias INT DEFAULT 0,
    empates INT DEFAULT 0,
    derrotas INT DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_grupo_equipo (grupo, equipo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tabla: goleadores_2026
-- Goleadores del Mundial 2026 (scrapeados desde ESPN)
CREATE TABLE IF NOT EXISTS goleadores_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_player_id VARCHAR(20),
    nombre VARCHAR(100),
    equipo VARCHAR(100),
    equipo_codigo VARCHAR(10),
    partidos INT DEFAULT 0,
    goles INT DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_goles (goles DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Tabla: asistencias_2026
-- Asistencias del Mundial 2026 (scrapeados desde ESPN)
CREATE TABLE IF NOT EXISTS asistencias_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_player_id VARCHAR(20),
    nombre VARCHAR(100),
    equipo VARCHAR(100),
    equipo_codigo VARCHAR(10),
    partidos INT DEFAULT 0,
    asistencias INT DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asistencias (asistencias DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Tabla: tarjetas_2026
-- Tarjetas por equipo del Mundial 2026 (scrapeados desde ESPN)
CREATE TABLE IF NOT EXISTS tarjetas_2026 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo VARCHAR(100),
    equipo_codigo VARCHAR(10),
    posicion INT,
    partidos INT DEFAULT 0,
    amarillas INT DEFAULT 0,
    rojas INT DEFAULT 0,
    puntos INT DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_puntos (puntos DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

