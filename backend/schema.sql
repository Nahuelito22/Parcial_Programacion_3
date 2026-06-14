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
