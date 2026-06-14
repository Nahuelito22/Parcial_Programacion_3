# Plan de Implementación — User Dashboard (Vista Pública Interactiva)

> **Proyecto:** Mundial Web App  
> **Fecha:** Junio 2026  
> **Branch base:** `Nahuel_Develop`  
> **Stack:** React 19 / Tailwind CSS v4 / Recharts / Framer Motion | Flask / PyMySQL / Pandas / NumPy / SciPy / scikit-learn  

---

## Estado Actual del Proyecto

### Backend Existente

| Componente | Estado | Archivo |
|---|---|---|
| Auth (Register/Login/JWT) | Funcional | `routes/auth_routes.py`, `controllers/auth_controller.py` |
| CRUD Ediciones | Funcional (7 endpoints) | `routes/estadisticas_routes.py`, `controllers/estadisticas_controller.py` |
| CRUD Equipos | Funcional (5 endpoints) | Mismos archivos |
| CRUD Jugadores | Funcional (5 endpoints) | Mismos archivos |
| Admin: Import CSV | Funcional | `routes/admin_routes.py`, `services/csv_importer.py` |
| Admin: Sync API 2026 | Funcional | `services/api_sync_service.py` |
| Admin: Clear DB | Funcional | `controllers/admin_controller.py` |
| **Tablas en MySQL** | **4 tablas:** `usuarios`, `ediciones`, `estadisticas_equipos`, `estadisticas_jugadores` | `schema.sql` |

### Frontend Existente

| Componente | Estado | Archivo |
|---|---|---|
| Landing Page (scroll animado) | Funcional | `pages/Home.tsx` |
| Login / Register | Funcional | `pages/Login.tsx`, `pages/Register.tsx` |
| Admin Dashboard (sidebar + tabs) | Funcional (parcial) | `pages/Dashboard.tsx` |
| Data Management Panel | Funcional | `components/DataManagementPanel.tsx` |
| Navbar | Funcional | `components/Navbar.tsx` |
| ProtectedRoute | Funcional | `components/ProtectedRoute.tsx` |
| Auth Context | Funcional | `context/AuthContext.tsx` |
| **Rutas del Router** | **4:** `/`, `/login`, `/register`, `/dashboard` | `App.tsx` |

### Datos Disponibles (CSVs de Fjelstul, 27 archivos, ~77K filas)

| CSV | Filas | Relevancia para este plan |
|---|---|---|
| `tournaments_curated.csv` | 31 | Ediciones mundiales (año, país anfitrión, campeón) |
| `teams_curated.csv` | 91 | Catálogo de selecciones |
| `players_curated.csv` | 10,912 | Catálogo de jugadores (nombre, posición, torneos) |
| `matches_curated.csv` | 1,312 | **CRÍTICO:** Partidos con resultado final, localía, etapa |
| `team_appearances_curated.csv` | 2,624 | Participaciones de equipo por partido (goles a favor/en contra, resultado) |
| `player_appearances_curated.csv` | 29,334 | Apariciones de jugador por partido (titular/suplente, posición) |
| `goals_curated.csv` | 3,801 | Goles por jugador/partido (minuto, penal, autogol) |
| `bookings_curated.csv` | 3,292 | Tarjetas por jugador/partido |
| `squads_curated.csv` | 14,579 | Jugadores convocados por selección y edición |
| `group_standings_curated.csv` | 658 | Posiciones finales por grupo |
| `tournament_standings_curated.csv` | 124 | Posiciones finales del torneo |
| `substitutions_curated.csv` | 11,210 | Sustituciones por partido |

### Contrato Backend → Frontend (endpoints públicos existentes)

```
GET /api/ediciones                    → [{ id, anio, pais_anfitrion, campeon }, ...]
GET /api/estadisticas/equipos         → [{ id, edicion_id, ..., nombre_pais, goles_a_favor, ... }, ...]
GET /api/estadisticas/equipos/edicion/:id → [filtro por edición]
GET /api/estadisticas/jugadores       → [{ id, edicion_id, ..., nombre_jugador, goles, ... }, ...]
GET /api/estadisticas/jugadores/edicion/:id → [filtro por edición]
```

### Dependencias Frontend Instaladas vs Planificadas

| Librería | Estado | Uso |
|---|---|---|
| react, react-dom, react-router-dom | Instalada | Core |
| axios | Instalada | HTTP client |
| lucide-react | Instalada | Iconos |
| tailwindcss v4 | Instalada | Estilos |
| **recharts** | **NO instalada** | Gráficos para H2H y Rankings |
| **framer-motion** | **NO instalada** | Animaciones de transición |
| **@tanstack/react-query** | **NO instalada** | Data fetching + caching |

### Dependencias Backend Instaladas vs Planificadas

| Librería | Estado | Uso |
|---|---|---|
| flask, flask-cors, PyMySQL, PyJWT, bcrypt, pandas, requests | Instalada | Core + ETL |
| **numpy** | **NO instalada** | Cálculos numéricos (Monte Carlo) |
| **scipy** | **NO instalada** | Distribuciones de probabilidad (Poisson, Normal) |
| **scikit-learn** | **NO instalada** | Modelos de ML supervisados |
| **joblib** | **NO instalada** | Serialización de modelos entrenados |

### Bug Conocido
- El CSV importer **NO inserta posesión** (la columna `posesion_promedio` queda en 0.00 para todos los registros). API-Football sí puede proveerla.
- Las **asistencias** quedan en 0 (no existen en el dataset Fjelstul). API-Football puede proveerlas.

---

## Flujo Git por Épica

Para cada épica:

1. Crear rama desde `Nahuel_Develop`: `git checkout -b feature/<nombre-epica> Nahuel_Develop`
2. Desarrollar tareas (1 commit por tarea completada con mensaje descriptivo).
3. Al finalizar la épica, push de la rama feature.
4. Merge a `Nahuel_Develop`: `git checkout Nahuel_Develop && git merge feature/<nombre-epica>`
5. Push de `Nahuel_Develop`: `git push origin Nahuel_Develop`
6. Crear siguiente rama desde `Nahuel_Develop` actualizado.

---

## ÉPICA 1 — Head-to-Head (El Cara a Cara Definitivo)

**Rama:** `feature/head-to-head`  
**Objetivo:** Sistema de comparación dual interactivo que permita enfrentar Selecciones o Jugadores en métricas históricas o por edición específica.

---

### Task 1.1 — Instalar dependencias Frontend

**Qué se hace:**  
Agregar `recharts`, `@tanstack/react-query` y `framer-motion` al proyecto frontend.

```bash
cd frontend && npm install recharts @tanstack/react-query framer-motion
```

**Dónde se modifica:**
- `frontend/package.json` — 3 dependencias nuevas

**Commit:**  
`chore(frontend): add recharts, @tanstack/react-query, and framer-motion dependencies`

---

### Task 1.2 — Crear tabla `partidos` en MySQL

**Qué se hace:**  
Crear la tabla `partidos` que actualmente no existe pero es esencial para H2H (historial de enfrentamientos directos). Mapeada desde `matches_curated.csv` + `team_appearances_curated.csv`.

**Schema propuesto:**

```sql
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
    FOREIGN KEY (edicion_id) REFERENCES ediciones(id) ON DELETE CASCADE
);
```

**Dónde se modifica:**
- `backend/schema.sql` — agregar DDL de la tabla
- Script de migración o ejecución directa en MySQL

**Commit:**  
`feat(backend): add partidos table schema for head-to-head match history`

---

### Task 1.3 — Extender ETL para importar partidos

**Qué se hace:**  
Modificar `services/csv_importer.py` para que en la fase de importación también popule la tabla `partidos` leyendo `matches_curated.csv` y cruzando con `team_appearances_curated.csv` para obtener goles por equipo en cada partido.

**Lógica:**
```
1. Leer matches_curated.csv → obtener tournament_id, home_team_id, away_team_id, scores
2. Cruzar con ediciones para obtener edicion_id (tournament_id → year → edicion_id)
3. Cruzar con teams para mapear team_id UUID → pais_id INT
4. INSERT masivo en partidos
```

**Dónde se modifica:**
- `backend/app/services/csv_importer.py` — agregar fase `import_partidos()`

**Commit:**  
`feat(backend): extend CSV importer to populate partidos table from matches CSV`

---

### Task 1.4 — Crear Modelos de Partido y Consultas H2H

**Qué se hace:**  
Crear `models/match.py` con la clase `Match` (Active Record) que represente un partido. Crear función de consulta SQL para obtener el historial de enfrentamientos directos entre dos equipos o dos jugadores.

**Modelo `Match`:**
- Campos: id, edicion_id, match_date, stage_name, stadium_name, equipo_local_id/nombre, equipo_visitante_id/nombre, goles_local, goles_visitante, resultado
- Método estático `get_head_to_head(team_a_id, team_b_id, edition_id=None) -> list[dict]`
- Método estático `get_player_head_to_head(player_a_id, player_b_id, edition_id=None) -> list[dict]` (requiere cruzar con player_appearances)

**Query H2H de equipos:**
```sql
SELECT p.*, e.anio as edicion_anio
FROM partidos p
JOIN ediciones e ON p.edicion_id = e.id
WHERE (
    (p.equipo_local_id = :team_a AND p.equipo_visitante_id = :team_b)
    OR
    (p.equipo_local_id = :team_b AND p.equipo_visitante_id = :team_a)
)
AND (:edition_id IS NULL OR p.edicion_id = :edition_id)
ORDER BY e.anio DESC, p.match_date DESC
```

**Query H2H de jugadores (vía partidos compartidos):**
```sql
SELECT DISTINCT p.*
FROM partidos p
JOIN player_appearances pa1 ON p.match_id = pa1.match_id AND pa1.player_id = :player_a
JOIN player_appearances pa2 ON p.match_id = pa2.match_id AND pa2.player_id = :player_b
WHERE (:edition_id IS NULL OR p.edicion_id = :edition_id)
ORDER BY p.match_date DESC
```

**Nota:** Para la query de jugadores, necesitamos también importar el `match_id` original del CSV en la tabla `partidos`. Se agregará una columna `external_match_id VARCHAR(50)` para el cruce.

**Dónde se modifica:**
- **NUEVO** `backend/app/models/match.py`
- `backend/app/models/__init__.py` — exportar Match
- `backend/app/services/csv_importer.py` — guardar `match_id` del CSV como `external_match_id`

**Commit:**  
`feat(backend): add Match model with head-to-head query logic for teams and players`

---

### Task 1.5 — Crear controller y rutas H2H

**Qué se hace:**  
Crear `controllers/h2h_controller.py` y `routes/h2h_routes.py` con los endpoints que el frontend consumirá.

**Endpoints:**

| Método | Ruta | Auth | Descripción | Query Params |
|---|---|---|---|---|
| GET | `/api/h2h/equipos` | Pública | Lista todas las selecciones disponibles | — |
| GET | `/api/h2h/equipos/:a/:b` | Pública | Historial H2H entre dos equipos | `?edicion=` (opcional) |
| GET | `/api/h2h/jugadores` | Pública | Lista todos los jugadores disponibles | — |
| GET | `/api/h2h/jugadores/:a/:b` | Pública | Historial H2H entre dos jugadores | `?edicion=` (opcional) |
| GET | `/api/h2h/ediciones` | Pública | Lista ediciones para filtro temporal | — |

**Estructura de respuesta H2H (ejemplo equipos):**

```json
{
  "equipo_a": { "id": 1, "nombre": "Argentina" },
  "equipo_b": { "id": 2, "nombre": "Brasil" },
  "resumen": {
    "total_partidos": 15,
    "victorias_a": 6,
    "empates": 4,
    "victorias_b": 5,
    "goles_a": 22,
    "goles_b": 18
  },
  "partidos": [
    {
      "edicion_anio": 2022,
      "fecha": "2022-12-18",
      "estadio": "Lusail Stadium",
      "local": "Argentina",
      "visitante": "Francia",
      "goles_local": 3,
      "goles_visitante": 3,
      "penales_local": 4,
      "penales_visitante": 2,
      "resultado": "local"
    }
  ]
}
```

**Dónde se modifica:**
- **NUEVO** `backend/app/controllers/h2h_controller.py`
- **NUEVO** `backend/app/routes/h2h_routes.py`
- `backend/app.py` — registrar blueprint `h2h_bp` con prefijo `/api/h2h`

**Commit:**  
`feat(backend): add H2H controller and routes with team/player comparison endpoints`

---

### Task 1.6 — Crear componente `SearchSelect` reutilizable

**Qué se hace:**  
Crear un componente de búsqueda/selección con autocomplete que se usará tanto en H2H como en Rankings. Estilo glassmorphism oscuro, con debounce de búsqueda, ícono de lupa, y dropdown animado.

**Props:**
```typescript
interface SearchSelectProps {
  options: { id: number; label: string; subtitle?: string }[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder: string;
  loading?: boolean;
}
```

**Dónde se crea:**
- **NUEVO** `frontend/src/components/ui/SearchSelect.tsx`

**Commit:**  
`feat(frontend): create reusable SearchSelect autocomplete component`

---

### Task 1.7 — Crear componente `ComparisonBar` de métricas comparativas

**Qué se hace:**  
Crear un componente visual que muestre una barra dual tipo "vs" con una métrica a la izquierda (entidad A) y otra a la derecha (entidad B). Estilo premium con gradientes.

**Props:**
```typescript
interface ComparisonBarProps {
  label: string;
  valueA: number | string;
  valueB: number | string;
  colorA?: string;  // default: cyan
  colorB?: string;  // default: amber
  maxValue?: number;
}
```

**Dónde se crea:**
- **NUEVO** `frontend/src/components/ui/ComparisonBar.tsx`

**Commit:**  
`feat(frontend): create ComparisonBar component for dual metric visualization`

---

### Task 1.8 — Crear página `HeadToHeadPage.tsx`

**Qué se hace:**  
Crear la página principal de H2H con la siguiente estructura:

```
┌─────────────────────────────────────────────────┐
│  HEADER: "COMPARATIVAS HEAD-TO-HEAD"            │
│  Subtítulo: "Enfréntate a la historia..."       │
├─────────────────────────────────────────────────┤
│  Nivel de Entidad:  [Selecciones] [Jugadores]   │
│  Nivel de Tiempo:   [Histórica] [Por Edición]   │
│                                                 │
│  [SearchSelect A]  VS  [SearchSelect B]         │
│                                                 │
│  ▼ Si "Por Edición": selector de edición ▼      │
├─────────────────────────────────────────────────┤
│  RESUMEN H2H:                                   │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ Part. │  │ Vict.A│  │Empates│  │Vict.B│      │
│  └──────┘  └──────┘  └──────┘  └──────┘        │
├─────────────────────────────────────────────────┤
│  BARRAS COMPARATIVAS (ComparisonBar x N):       │
│  - Goles a Favor    [████████░░░░░░░░]          │
│  - Goles en Contra  [████░░░░░░░░░░░░]          │
│  - Tarjetas Amarillas [██████░░░░░░░░░]         │
│  - Posesión Promedio  [█████████░░░░░░]         │
│  - Partidos Jugados   [███████░░░░░░░░]         │
├─────────────────────────────────────────────────┤
│  GRÁFICO RADAR (Recharts RadarChart):           │
│  Pentágono con las 5 métricas normalizadas      │
├─────────────────────────────────────────────────┤
│  HISTORIAL DE PARTIDOS (tabla scrollable):      │
│  Fecha | Edición | Local | Score | Visitante    │
└─────────────────────────────────────────────────┘
```

**Componentes usados:**
- `SearchSelect` (Task 1.6)
- `ComparisonBar` (Task 1.7)
- Recharts: `RadarChart`, `Radar`, `PolarGrid`, `PolarAngleAxis`, `ResponsiveContainer`

**Hook personalizado:** `useHeadToHead` que encapsule la lógica de fetch (via react-query) y el estado de filtros.

**Dónde se crea:**
- **NUEVO** `frontend/src/pages/HeadToHeadPage.tsx`
- **NUEVO** `frontend/src/hooks/useHeadToHead.ts`
- **NUEVO** `frontend/src/components/h2h/H2HSidebar.tsx` (panel de filtros)
- **NUEVO** `frontend/src/components/h2h/H2HSummary.tsx` (tarjetas resumen)
- **NUEVO** `frontend/src/components/h2h/H2HMetrics.tsx` (barras comparativas)
- **NUEVO** `frontend/src/components/h2h/H2HRadarChart.tsx` (gráfico radar)
- **NUEVO** `frontend/src/components/h2h/H2HMatchHistory.tsx` (tabla de partidos)

**Commit:**  
`feat(frontend): build HeadToHeadPage with filters, comparison bars, radar chart, and match history`

---

### Task 1.9 — Integrar H2H en el Dashboard (sidebar + rutas)

**Qué se hace:**  
Modificar `App.tsx` para agregar la ruta `/dashboard/h2h`. Modificar `Dashboard.tsx` para agregar un nuevo tab/sección "ANALISIS" en el sidebar con enlace a H2H. El sidebar del Dashboard tendrá ahora:

```
GESTION MANUAL: Ediciones, Equipos, Jugadores
ANALISIS: Head-to-Head
INGESTA DE DATOS: Panel de Control
```

**Dónde se modifica:**
- `frontend/src/App.tsx` — agregar ruta protegida `/dashboard/h2h`
- `frontend/src/pages/Dashboard.tsx` — agregar sección ANALISIS en sidebar
- `frontend/src/components/Navbar.tsx` — (opcional) agregar link directo a H2H

**Commit:**  
`feat(frontend): integrate H2H page into Dashboard sidebar and router`

---

### Commit de cierre Épica 1

**Merge a `Nahuel_Develop`:**  
`git checkout Nahuel_Develop && git merge feature/head-to-head`  
`git push origin Nahuel_Develop`

---

## ÉPICA 2 — Rankings Dinámicos

**Rama:** `feature/rankings`  
**Objetivo:** Tablas de posiciones globales con filtros dinámicos por edición, tipo de métrica y categoría.

---

### Task 2.1 — Crear controller y rutas de Rankings

**Qué se hace:**  
Crear `controllers/rankings_controller.py` y `routes/rankings_routes.py` con endpoints para cada tipo de ranking.

**Endpoints:**

| Método | Ruta | Auth | Descripción | Query Params |
|---|---|---|---|---|
| GET | `/api/rankings/top-goleadores` | Pública | Top goleadores | `?edicion=&limit=` (default: 20) |
| GET | `/api/rankings/top-asistentes` | Pública | Top asistentes | `?edicion=&limit=` |
| GET | `/api/rankings/selecciones-mas-participaciones` | Pública | Selecciones con más ediciones disputadas | `?limit=` |
| GET | `/api/rankings/selecciones-mas-goles` | Pública | Selecciones con más goles a favor (histórico) | `?edicion=&limit=` |
| GET | `/api/rankings/selecciones-mas-tarjetas` | Pública | Selecciones con más amarillas | `?edicion=&limit=` |
| GET | `/api/rankings/mejor-ataque` | Pública | Mejor promedio de goles por partido | `?edicion=&limit=` |
| GET | `/api/rankings/mejor-defensa` | Pública | Menor promedio de goles en contra por partido | `?edicion=&limit=` |
| GET | `/api/rankings/mayor-posesion` | Pública | Mayor posesión promedio | `?edicion=&limit=` |

**Query de ejemplo — Top goleadores:**
```sql
SELECT
    ej.jugador_id,
    ej.nombre_jugador,
    SUM(ej.goles) AS total_goles,
    SUM(ej.asistencias) AS total_asistencias,
    SUM(ej.partidos_jugados) AS total_partidos,
    COUNT(DISTINCT ej.edicion_id) AS ediciones_disputadas,
    ROUND(SUM(ej.goles) / GREATEST(SUM(ej.partidos_jugados), 1), 2) AS goles_por_partido
FROM estadisticas_jugadores ej
WHERE (:edicion_id IS NULL OR ej.edicion_id = :edicion_id)
GROUP BY ej.jugador_id, ej.nombre_jugador
HAVING total_goles > 0
ORDER BY total_goles DESC
LIMIT :limit
```

**Dónde se modifica:**
- **NUEVO** `backend/app/controllers/rankings_controller.py`
- **NUEVO** `backend/app/routes/rankings_routes.py`
- `backend/app.py` — registrar blueprint `rankings_bp` con prefijo `/api/rankings`

**Commit:**  
`feat(backend): add rankings controller and routes with 8 ranking endpoints`

---

### Task 2.2 — Crear componente `RankingTable`

**Qué se hace:**  
Crear un componente de tabla reutilizable para rankings con las siguientes características:
- Encabezados con iconos de lucide-react
- Filas animadas con framer-motion (stagger effect)
- Columna de posición con medalla de bronce/plata/oro (top 3)
- Hover effect sutil
- Indicador de "mejor en columna" (highlight en valor más alto)
- Total de filas dinámico

**Props:**
```typescript
interface RankingTableProps {
  data: Array<Record<string, any>>;
  columns: { key: string; label: string; icon?: LucideIcon; highlight?: boolean }[];
  title: string;
  loading?: boolean;
}
```

**Dónde se crea:**
- **NUEVO** `frontend/src/components/ui/RankingTable.tsx`

**Commit:**  
`feat(frontend): create reusable RankingTable component with medal highlights and stagger animation`

---

### Task 2.3 — Crear componente `RankingFilterBar`

**Qué se hace:**  
Crear un componente de filtros horizontal con:
- Selector de edición (desplegable con lista de ediciones cargadas desde `/api/ediciones`)
- Selector de métrica (Top Goleadores, Top Asistentes, Mejor Ataque, etc.)
- Botón de "Histórico" vs "Por Edición"
- Límite de resultados (10, 20, 50)

**Dónde se crea:**
- **NUEVO** `frontend/src/components/rankings/RankingFilterBar.tsx`

**Commit:**  
`feat(frontend): create RankingFilterBar with edition, metric, and limit selectors`

---

### Task 2.4 — Crear página `RankingsPage.tsx`

**Qué se hace:**  
Crear la página de Rankings con la siguiente estructura:

```
┌─────────────────────────────────────────────────┐
│  HEADER: "RANKINGS MUNDIALES"                   │
│  Subtítulo: "Los mejores de la historia..."     │
├─────────────────────────────────────────────────┤
│  [RankingFilterBar]                             │
│  ┌─────────────────────────────────────────┐    │
│  │ Selección: [Todas ▼]  Métrica: [Goles▼]│    │
│  │ Modo: [Histórico] [Por Edición]  Top: [20]│  │
│  └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│  [KPI Cards resumen]                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Total G │ │Total A │ │Máx Gol│ │Más Part│   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
├─────────────────────────────────────────────────┤
│  [RankingTable]                                 │
│  #  │ Jugador/Selección │ Goles │ Part. │ G/P  │
│  1  │ Lionel Messi      │  13   │  26   │ 0.50 │
│  2  │ Miroslav Klose    │  16   │  24   │ 0.67 │
│  ...                                            │
├─────────────────────────────────────────────────┤
│  [Gráfico de barras horizontal — top 10]        │
│  Recharts BarChart (horizontal)                  │
└─────────────────────────────────────────────────┘
```

**Componentes usados:**
- `RankingFilterBar` (Task 2.3)
- `RankingTable` (Task 2.2)
- Recharts: `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`

**Hook:** `useRankings` con react-query para fetch de datos.

**Dónde se crea:**
- **NUEVO** `frontend/src/pages/RankingsPage.tsx`
- **NUEVO** `frontend/src/hooks/useRankings.ts`
- **NUEVO** `frontend/src/components/rankings/RankingsKPICards.tsx`
- **NUEVO** `frontend/src/components/rankings/RankingsBarChart.tsx`

**Commit:**  
`feat(frontend): build RankingsPage with KPI cards, ranking table, and bar chart visualization`

---

### Task 2.5 — Integrar Rankings en el Dashboard

**Qué se hace:**  
Agregar ruta `/dashboard/rankings` en `App.tsx`. Agregar tab "Rankings" bajo la sección ANALISIS en el sidebar de `Dashboard.tsx`.

**Dónde se modifica:**
- `frontend/src/App.tsx` — ruta protegida
- `frontend/src/pages/Dashboard.tsx` — sidebar con nueva entrada

**Commit:**  
`feat(frontend): integrate Rankings page into Dashboard sidebar and router`

---

### Commit de cierre Épica 2

**Merge a `Nahuel_Develop`:**  
`git checkout Nahuel_Develop && git merge feature/rankings`  
`git push origin Nahuel_Develop`

---

## ÉPICA 3 — El Oráculo IA (Predicciones)

**Rama:** `feature/oracle-ai`  
**Objetivo:** Interfaz de predicciones de partidos con motor Monte Carlo y preparación para modelo ML supervisado.

---

### Task 3.1 — Instalar dependencias Backend

**Qué se hace:**  
Agregar numpy, scipy, scikit-learn y joblib al backend.

```bash
cd backend && pip install numpy scipy scikit-learn joblib
```

Actualizar `requirements.txt`.

**Dónde se modifica:**
- `backend/requirements.txt` — 4 dependencias nuevas

**Commit:**  
`chore(backend): add numpy, scipy, scikit-learn, and joblib for ML pipeline`

---

### Task 3.2 — Crear servicio Monte Carlo Simulation

**Qué se hace:**  
Crear `services/monte_carlo_service.py` con la clase `MonteCarloPredictor`.

**Algoritmo:**

```
1. Recibir: team_a_id, team_b_id, (opcional) edición específica
2. Calcular estadísticas base de ambos equipos:
   - Promedio de goles a favor por partido (μ_attack)
   - Promedio de goles en contra por partido (μ_defense)
   - Factor localía (mejora del 15% en goles para local)
3. Definir distribución de Poisson para cada equipo:
   - λ_local = μ_attack_local × μ_defense_visitante / promedio_liga
   - λ_visitante = μ_attack_visitante × μ_defense_local / promedio_liga
4. Simular N partidos (default: 10,000):
   - Para cada simulación:
     - goals_local = np.random.poisson(λ_local)
     - goals_visitante = np.random.poisson(λ_visitante)
5. Calcular probabilidades:
   - P victoria local = count(local_win) / N
   - P empate = count(draw) / N
   - P victoria visitante = count(away_win) / N
   - Promedio goles esperados local = mean(goals_local)
   - Promedio goles esperados visitante = mean(goals_visitante)
```

**Método principal:**

```python
class MonteCarloPredictor:
    SIMULATIONS = 10_000
    
    def predict(self, team_a_id: int, team_b_id: int, edition_id: int = None) -> dict:
        """Retorna probabilidades y métricas de predicción."""
```

**Respuesta de ejemplo:**
```json
{
  "equipo_a": { "id": 1, "nombre": "Argentina" },
  "equipo_b": { "id": 2, "nombre": "Brasil" },
  "metodo": "monte_carlo_poisson",
  "simulaciones": 10000,
  "probabilidades": {
    "victoria_a": 0.45,
    "empate": 0.25,
    "victoria_b": 0.30
  },
  "goles_esperados": {
    "a": 1.62,
    "b": 1.18
  },
  "distribucion_goles_local": {
    "0": 0.20, "1": 0.32, "2": 0.26, "3": 0.14, "4": 0.06, "5+": 0.02
  },
  "distribucion_goles_visitante": {
    "0": 0.30, "1": 0.36, "2": 0.22, "3": 0.09, "4": 0.03, "5+": 0.01
  }
}
```

**Dónde se crea:**
- **NUEVO** `backend/app/services/monte_carlo_service.py`

**Commit:**  
`feat(backend): implement Monte Carlo Poisson simulator for match predictions`

---

### Task 3.3 — Crear servicio ML Prediction ( preparación )

**Qué se hace:**  
Crear `services/ml_prediction_service.py` con la clase `MLPredictor`. Esta clase prepara la estructura para un modelo supervisado entrenado con datos históricos. Incluye:

**Subtask 3.3a — Script de entrenamiento `ml_train.py`:**

```
1. Cargar datos de la DB (estadisticas_equipos + partidos)
2. Feature engineering:
   - goles_a_favor_promedio (últimos 5 partidos)
   - goles_en_contra_promedio
   - diferencia_goles_promedio
   - forma (puntos últimos 5 partidos: W=3, D=1, L=0)
   - factor_localía (1 si local, 0 si visitante)
3. Target: resultado (0=derrota, 1=empate, 2=victoria)
4. Split: 80% train, 20% test
5. Modelo: RandomForestClassifier (scikit-learn)
6. Métricas: accuracy, F1-score, matriz de confusión
7. Guardar modelo con joblib: backend/models/match_predictor.joblib
```

**Subtask 3.3b — Servicio de predicción:**

```python
class MLPredictor:
    def __init__(self):
        self.model_path = Path(__file__).parent.parent.parent / "models" / "match_predictor.joblib"
        self.model = None
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)
    
    def is_available(self) -> bool:
        """True si el modelo está entrenado y cargado."""
    
    def predict(self, team_a_id: int, team_b_id: int, edition_id: int = None) -> dict:
        """Retorna probabilidades usando el modelo ML. Similar formato a MonteCarlo."""
```

**Dónde se crea:**
- **NUEVO** `backend/app/services/ml_prediction_service.py`
- **NUEVO** `backend/ml_train.py` (script de entrenamiento)
- **NUEVO** `backend/models/` (directorio para modelos serializados)

**Commit:**  
`feat(backend): add ML prediction service with training script and RandomForest model`

---

### Task 3.4 — Crear controller y rutas del Oráculo

**Qué se hace:**  
Crear `controllers/oracle_controller.py` y `routes/oracle_routes.py`.

**Endpoints:**

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/oracle/equipos` | Pública | Lista equipos para selector |
| POST | `/api/oracle/predict` | Pública | Ejecuta predicción (body: `{ team_a_id, team_b_id, edition_id? }`) |
| GET | `/api/oracle/methods` | Pública | Lista métodos disponibles (Monte Carlo siempre; ML si modelo entrenado) |
| GET | `/api/oracle/historical` | Pública | Predicciones pasadas (para validar modelo) |

**Respuesta de `/api/oracle/predict`:**

```json
{
  "metodo_usado": "monte_carlo_poisson",
  "metodos_disponibles": ["monte_carlo_poisson", "random_forest"],
  "equipo_a": { "id": 1, "nombre": "Argentina" },
  "equipo_b": { "id": 2, "nombre": "Brasil" },
  "probabilidades": {
    "victoria_a": 0.45,
    "empate": 0.25,
    "victoria_b": 0.30
  },
  "goles_esperados": { "a": 1.62, "b": 1.18 },
  "confianza_modelo": 0.82,
  "distribucion_goles_local": { "0": 0.20, "1": 0.32, "2": 0.26, "3": 0.14, "4": 0.06, "5+": 0.02 },
  "distribucion_goles_visitante": { "0": 0.30, "1": 0.36, "2": 0.22, "3": 0.09, "4": 0.03, "5+": 0.01 }
}
```

**Dónde se modifica:**
- **NUEVO** `backend/app/controllers/oracle_controller.py`
- **NUEVO** `backend/app/routes/oracle_routes.py`
- `backend/app.py` — registrar blueprint `oracle_bp` con prefijo `/api/oracle`

**Commit:**  
`feat(backend): add Oracle controller and routes with prediction endpoint`

---

### Task 3.5 — Crear componente `ProbabilityGauge`

**Qué se hace:**  
Crear un componente semicircular tipo gauge que muestre la probabilidad de victoria de cada equipo. Estilo premium con degradados.

**Props:**
```typescript
interface ProbabilityGaugeProps {
  teamAName: string;
  teamBName: string;
  probA: number;  // 0-1
  probB: number;  // 0-1
  drawProb: number;  // 0-1
}
```

**Diseño visual:**
```
        TEAM A: 45%
       ╭─────────────╮
      ╱    ████████   ╲
     ╱   ██████████    ╲
    │  ██████████████   │
    │ ████████████████  │
    └───────────────────┘
        TEAM B: 30%
         Empate: 25%
```

Implementado con SVG path + CSS animations.

**Dónde se crea:**
- **NUEVO** `frontend/src/components/ui/ProbabilityGauge.tsx`

**Commit:**  
`feat(frontend): create ProbabilityGauge SVG component for win probability visualization`

---

### Task 3.6 — Crear componente `GoalDistributionChart`

**Qué se hace:**  
Crear un componente que muestre la distribución de goles esperados para cada equipo usando Recharts `BarChart`. Eje X = número de goles (0, 1, 2, 3, 4, 5+), Eje Y = probabilidad.

**Dónde se crea:**
- **NUEVO** `frontend/src/components/oracle/GoalDistributionChart.tsx`

**Commit:**  
`feat(frontend): create GoalDistributionChart with grouped bar chart for expected goals`

---

### Task 3.7 — Crear página `OraclePage.tsx`

**Qué se hace:**  
Crear la página del Oráculo IA con la siguiente estructura:

```
┌─────────────────────────────────────────────────┐
│  HEADER: "EL ORÁCULO IA"                        │
│  Subtítulo: "Simulaciones Monte Carlo + ML..."  │
├─────────────────────────────────────────────────┤
│  SELECTOR DE PARTIDO:                           │
│  [SearchSelect: Seleccione Equipo A]            │
│                     VS                          │
│  [SearchSelect: Seleccione Equipo B]            │
│                                                 │
│  Método: [Monte Carlo] [ML (si disponible)]     │
│                                                 │
│  [  🔮  PREDICIR  ]                             │
├─────────────────────────────────────────────────┤
│  RESULTADOS (aparecen con animación):           │
│                                                 │
│  [ProbabilityGauge]                             │
│  Argentina: 45%  |  Empate: 25%  |  Brasil: 30%│
│                                                 │
│  Goles Esperados:                               │
│  Argentina: 1.62  |  Brasil: 1.18               │
│                                                 │
│  [GoalDistributionChart]                        │
│  ┌─────────────────────────────────────────┐    │
│  │  0    1    2    3    4    5+            │    │
│  │  ██   ████ ███  ██   █    ▌             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Análisis de Confianza:                         │
│  "Basado en 10,000 simulaciones de Poisson..." │
└─────────────────────────────────────────────────┘
```

**Componentes usados:**
- `SearchSelect` (de Épica 1)
- `ProbabilityGauge` (Task 3.5)
- `GoalDistributionChart` (Task 3.6)

**Hook:** `useOracle` con react-query.

**Dónde se crea:**
- **NUEVO** `frontend/src/pages/OraclePage.tsx`
- **NUEVO** `frontend/src/hooks/useOracle.ts`
- **NUEVO** `frontend/src/components/oracle/OracleHeader.tsx`
- **NUEVO** `frontend/src/components/oracle/OraclePredictionResult.tsx`

**Commit:**  
`feat(frontend): build OraclePage with match selector, probability gauge, and goal distribution`

---

### Task 3.8 — Integrar Oráculo en el Dashboard

**Qué se hace:**  
Agregar ruta `/dashboard/oracle` en `App.tsx`. Agregar tab "Oráculo IA" bajo la sección ANALISIS en el sidebar de `Dashboard.tsx`.

**Sidebar final del Dashboard:**

```
GESTION MANUAL:
  📁 Ediciones
  📊 Equipos
  👤 Jugadores

ANALISIS:
  ⚔️  Head-to-Head
  🏆 Rankings
  🔮 Oráculo IA

INGESTA DE DATOS:
  📥 Panel de Control
```

**Dónde se modifica:**
- `frontend/src/App.tsx` — ruta protegida
- `frontend/src/pages/Dashboard.tsx` — sidebar actualizado

**Commit:**  
`feat(frontend): integrate Oracle page into Dashboard sidebar and router`

---

### Task 3.9 — Script de entrenamiento ML + modelo base

**Qué se hace:**  
Ejecutar `ml_train.py` para entrenar un modelo base con los datos actuales (ediciones históricas 1930-2022). Guardar el modelo serializado en `backend/models/match_predictor.joblib`.

**Flujo del script:**

```python
# ml_train.py (ejecutado desde backend/)
from app.services.ml_prediction_service import MLTrainer

trainer = MLTrainer()
trainer.load_data()           # SELECT de estadisticas_equipos + partidos
trainer.engineer_features()   # Crear features
trainer.train()               # RandomForestClassifier
trainer.evaluate()            # accuracy, F1, matriz de confusión
trainer.save()                # joblib.dump(model, 'models/match_predictor.joblib')
```

**Métricas esperadas del modelo base:**
- Accuracy: ~45-55% (predicción de resultado exacto: W/D/L es difícil)
- El modelo mejorará a medida que entrenemos con más datos de API-Football 2026

**Dónde se modifica:**
- `backend/ml_train.py` — script de ejecución
- `backend/models/` — directorio con modelo serializado

**Commit:**  
`feat(backend): train base RandomForest model and serialize to match_predictor.joblib`

---

### Commit de cierre Épica 3

**Merge a `Nahuel_Develop`:**  
`git checkout Nahuel_Develop && git merge feature/oracle-ai`  
`git push origin Nahuel_Develop`

---

## Resumen de Archivos Nuevos y Modificados

### Archivos Nuevos — Backend (9 archivos)

| Archivo | Épica | Propósito |
|---|---|---|
| `app/models/match.py` | 1 | Modelo Active Record para partidos |
| `app/controllers/h2h_controller.py` | 1 | Controller Head-to-Head |
| `app/routes/h2h_routes.py` | 1 | Rutas H2H |
| `app/controllers/rankings_controller.py` | 2 | Controller Rankings |
| `app/routes/rankings_routes.py` | 2 | Rutas Rankings |
| `app/services/monte_carlo_service.py` | 3 | Simulador Monte Carlo Poisson |
| `app/services/ml_prediction_service.py` | 3 | Servicio ML + trainer |
| `app/controllers/oracle_controller.py` | 3 | Controller Oráculo |
| `app/routes/oracle_routes.py` | 3 | Rutas Oráculo |
| `ml_train.py` | 3 | Script de entrenamiento ML |
| `models/match_predictor.joblib` | 3 | Modelo serializado |

### Archivos Nuevos — Frontend (20 archivos)

| Archivo | Épica | Propósito |
|---|---|---|
| `components/ui/SearchSelect.tsx` | 1 | Autocomplete reutilizable |
| `components/ui/ComparisonBar.tsx` | 1 | Barra dual de métricas |
| `components/ui/RankingTable.tsx` | 2 | Tabla de rankings |
| `components/ui/ProbabilityGauge.tsx` | 3 | Gauge SVG de probabilidades |
| `pages/HeadToHeadPage.tsx` | 1 | Página H2H |
| `hooks/useHeadToHead.ts` | 1 | Hook de datos H2H |
| `components/h2h/H2HSidebar.tsx` | 1 | Panel de filtros H2H |
| `components/h2h/H2HSummary.tsx` | 1 | Tarjetas resumen H2H |
| `components/h2h/H2HMetrics.tsx` | 1 | Barras comparativas |
| `components/h2h/H2HRadarChart.tsx` | 1 | Gráfico radar |
| `components/h2h/H2HMatchHistory.tsx` | 1 | Tabla de historial |
| `pages/RankingsPage.tsx` | 2 | Página Rankings |
| `hooks/useRankings.ts` | 2 | Hook de datos Rankings |
| `components/rankings/RankingFilterBar.tsx` | 2 | Filtros de rankings |
| `components/rankings/RankingsKPICards.tsx` | 2 | Tarjetas KPI |
| `components/rankings/RankingsBarChart.tsx` | 2 | Gráfico de barras |
| `pages/OraclePage.tsx` | 3 | Página Oráculo |
| `hooks/useOracle.ts` | 3 | Hook de datos Oráculo |
| `components/oracle/GoalDistributionChart.tsx` | 3 | Distribución de goles |
| `components/oracle/OraclePredictionResult.tsx` | 3 | Resultado de predicción |

### Archivos Modificados

| Archivo | Épica(s) | Cambio |
|---|---|---|
| `backend/schema.sql` | 1 | Agregar tabla `partidos` |
| `backend/app.py` | 1,2,3 | Registrar 3 blueprints nuevos |
| `backend/app/models/__init__.py` | 1 | Exportar Match |
| `backend/app/services/csv_importer.py` | 1 | Importar partidos |
| `backend/requirements.txt` | 3 | numpy, scipy, scikit-learn, joblib |
| `frontend/package.json` | 1 | recharts, react-query, framer-motion |
| `frontend/src/App.tsx` | 1,2,3 | 3 rutas protegidas nuevas |
| `frontend/src/pages/Dashboard.tsx` | 1,2,3 | Sidebar actualizado con ANALISIS |

---

## Dependencias Finales

### Backend (requirements.txt)

```
flask
flask-cors
PyMySQL
python-dotenv
PyJWT
bcrypt
pandas
requests
numpy
scipy
scikit-learn
joblib
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "axios": "^1.17.0",
    "lucide-react": "^1.17.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.17.0",
    "recharts": "^2.x.x",
    "@tanstack/react-query": "^5.x.x",
    "framer-motion": "^12.x.x"
  }
}
```

---

## Diagrama de Arquitectura Final

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Home   │  │  Login   │  │ Register │  │Dashboard │       │
│  │ (scroll) │  │          │  │          │  │(sidebar) │       │
│  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘       │
│                                                  │              │
│                              ┌────────────────────┼───────┐     │
│                              │                    │       │     │
│                         ┌────▼────┐  ┌──────▼──┐  ┌──▼──┐ │    │
│                         │  H2H    │  │Rankings │  │Orcl │ │    │
│                         │  Page   │  │  Page   │  │Page │ │    │
│                         └────┬────┘  └────┬────┘  └──┬──┘ │    │
│                              │            │          │     │    │
│                    useHeadToHead  useRankings    useOracle│    │
│                              │            │          │     │    │
└──────────────────────────────┼────────────┼──────────┼─────┘    │
                               │            │          │           │
                         ┌─────▼────────────▼──────────▼──────┐   │
                         │          FLASK API (Backend)        │   │
                         │                                     │   │
                         │  ┌──────────┐ ┌──────────────────┐  │   │
                         │  │  Auth    │ │   Estadisticas   │  │   │
                         │  │  /auth/* │ │   /ediciones     │  │   │
                         │  └──────────┘ │   /equipos       │  │   │
                         │               │   /jugadores     │  │   │
                         │  ┌──────────┐ └──────────────────┘  │   │
                         │  │  Admin   │                       │   │
                         │  │ /admin/* │ ┌──────────────────┐  │   │
                         │  │  (CSV,   │ │     H2H          │  │   │
                         │  │  Sync,   │ │   /h2h/*         │  │   │
                         │  │  Clear)  │ └──────────────────┘  │   │
                         │  └──────────┘                       │   │
                         │               ┌──────────────────┐  │   │
                         │               │    Rankings      │  │   │
                         │               │  /rankings/*     │  │   │
                         │               └──────────────────┘  │   │
                         │               ┌──────────────────┐  │   │
                         │               │     Oracle       │  │   │
                         │               │   /oracle/*      │  │   │
                         │               └──────────────────┘  │   │
                         │                                     │   │
                         │  Services:                          │   │
                         │  ┌────────────┐ ┌───────────────┐   │   │
                         │  │ CSVImporter│ │APIFootballClnt│   │   │
                         │  └────────────┘ └───────────────┘   │   │
                         │  ┌────────────┐ ┌───────────────┐   │   │
                         │  │ MonteCarlo │ │ MLPredictor   │   │   │
                         │  │ Predictor  │ │ (RandomForest)│   │   │
                         │  └────────────┘ └───────────────┘   │   │
                         └─────────────────┬───────────────────┘   │
                                           │                       │
                                     ┌─────▼──────┐                │
                                     │   MySQL    │                │
                                     │ mundial_db │                │
                                     │  5 tablas  │                │
                                     └────────────┘                │
                                     + models/*.joblib             │
```

---

## Orden de Ejecución

```
ÉPICA 1 (Head-to-Head)         ← Dependencia: tabla partidos + ETL extendido
  └─→ Merge a Nahuel_Develop
ÉPICA 2 (Rankings)             ← Dependencia: solo tablas existentes + endpoints
  └─→ Merge a Nahuel_Develop
ÉPICA 3 (Oráculo IA)           ← Dependencia: tablas existentes + numpy/scipy/sklearn
  └─→ Merge a Nahuel_Develop
```

Épicas 2 y 3 son funcionalmente independientes de Épica 1, pero se desarrollan en orden para que el merge de `Nahuel_Develop` siempre esté limpio.

---

## Notas Técnicas Clave

| Aspecto | Decisión |
|---|---|
| **Predicciones ML** | RandomForestClassifier con 6 features básicos. Accuracy esperado: 45-55%. Se re-entrena con datos de API-Football 2026 para mejorar. |
| **Monte Carlo** | Distribución de Poisson con λ ajustado por factor localía y defensa rival. 10,000 simulaciones por predicción. |
| **Gráficos** | Recharts (React wrapper de D3). Componentes: RadarChart, BarChart, custom SVG (ProbabilityGauge). |
| **Data Fetching** | @tanstack/react-query para caché de queries, refetch automático, y manejo de loading/error states. |
| **Animaciones** | framer-motion para transiciones de página, stagger de filas, y aparición de resultados de predicción. |
| **Tabla partidos** | No existía. Se crea en Épica 1 Task 1.2. Se alimenta de `matches_curated.csv` (1,312 partidos). |
| **Asistencias** | 0 en CSV Fjelstul. Se mantienen en 0 hasta que API-Football 2026 provea datos reales. |
| **Posesión** | 0.00 en CSV Fjelstul. API-Football provee posesión por partido. Se actualizará en Épica 4 de `backend_admin.md`. |
