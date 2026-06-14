# 🏆 Plan de Implementación — User Dashboard (Vista Pública)

> **Proyecto:** Mundial Web App — Parcial Programación III  
> **Rama base:** `Nahuel_Develop`  
> **Stack:** React 19 + TypeScript + Tailwind CSS v4 (Frontend) · Flask + MySQL (Backend)  
> **Base de datos:** ~10.000 registros históricos (1930–2022) + sincronización en vivo 2026  
> **Documento:** Versión 1.0 — Plan de Implementación

---

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────┐
│                   Frontend React                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Epic 1   │ │  Epic 2   │ │     Epic 3       │ │
│  │ Head-to-  │ │ Rankings  │ │   Oráculo IA     │ │
│  │ Head      │ │ Dinámicos │ │                  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │        Context / Hooks / Shared UI          │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ HTTP (axios)
┌──────────────────────▼──────────────────────────┐
│                  Backend Flask                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Epic 1   │ │  Epic 2   │ │     Epic 3       │ │
│  │ Endpoints │ │ Endpoints │ │   Endpoints +    │ │
│  │ H2H       │ │ Rankings  │ │   ML Engine      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │       Models / Services / Database          │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────────────┐
│              MySQL (mundial_db)                   │
│  ediciones · estadisticas_equipos ·              │
│  estadisticas_jugadores · (nuevas tablas)        │
└─────────────────────────────────────────────────┘
```

---

## 📦 Nuevas Librerías a Incorporar

### Backend (Python)

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `scikit-learn` | ≥1.3 | Modelos supervisados de ML para predicciones (Épica 3) |
| `numpy` | ≥1.24 | Operaciones numéricas, álgebra lineal para Monte Carlo |
| `scipy` | ≥1.11 | Distribuciones estadísticas para simulaciones Monte Carlo |
| `joblib` | ≥1.3 | Serialización de modelos ML entrenados (.pkl) |
| `imblearn` (imbalanced-learn) | ≥0.12 | Balanceo de clases si hay desbalance en datos históricos |

### Frontend (React)

| Librería | Propósito |
|----------|-----------|
| `recharts` | Gráficos de barras, líneas, radar (Comparativas y Rankings) |
| `@tanstack/react-query` | Caché, sincronización y estado de datos asíncronos |
| `framer-motion` | Animaciones de transición entre comparativas |

---

## 🔀 Estrategia de Ramas (Git)

Todas las ramas parten de `Nahuel_Develop` y se mergean de vuelta a ella.

```
Nahuel_Develop
├── feature/epic1-head-to-head
│   ├── feat: add H2H backend endpoints (comparison queries)
│   ├── feat: create H2HSelector component (entity + time filters)
│   ├── feat: create ComparisonCard and ComparisonChart components
│   └── feat: wire H2H page into dashboard routing
├── feature/epic2-rankings
│   ├── feat: add rankings backend endpoints (top scorers, etc.)
│   ├── feat: create RankingsTable component with dynamic filtering
│   ├── feat: create RankingsFilters component (edition picker)
│   └── feat: wire Rankings page into dashboard routing
└── feature/epic3-oracle-ai
    ├── feat: add backend Monte Carlo simulation engine
    ├── feat: add backend ML prediction endpoint (model loader)
    ├── feat: create OracleSelector component (match picker)
    ├── feat: create PredictionResult component (probabilities)
    └── feat: wire Oracle page into dashboard routing
```

> **Política de commits:** Un commit por épica (estructura) + commits individuales por cada tarea.  
> **Formato de commits:** `feat(epicN): descripción corta en inglés`

---

## 🧩 ÉPICA 1: Head-to-Head (El Cara a Cara Definitivo)

### Descripción

Sistema interactivo de comparación dual que permite al usuario elegir dos entidades (selecciones o jugadores) y visualizar métricas enfrentadas. Soporta dos niveles de filtro: entidad y tiempo.

### Backend — Nuevos Endpoints Flask

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/h2h/teams` | Comparar dos selecciones (`?team_a_id=X&team_b_id=Y&edition_id=Z`). Si `edition_id` se omite, compara histórico global. | Token |
| `GET` | `/api/h2h/players` | Comparar dos jugadores (`?player_a_id=X&player_b_id=Y&edition_id=Z`). Si `edition_id` se omite, compara histórico global. | Token |
| `GET` | `/api/h2h/teams/list` | Lista de selecciones disponibles para el selector (id + nombre). | Token |
| `GET` | `/api/h2h/players/list` | Lista de jugadores disponibles para el selector (id + nombre). | Token |

#### Estructura de respuesta esperada (`/h2h/teams`)

```json
{
  "entity_a": {
    "id": 1,
    "name": "Argentina",
    "titles": 3,
    "total_matches": 88,
    "goals_for": 152,
    "goals_against": 103,
    "average_possession": 56.8,
    "yellow_cards": 45,
    "assists": 98
  },
  "entity_b": {
    "id": 2,
    "name": "Francia",
    "titles": 2,
    "total_matches": 73,
    "goals_for": 138,
    "goals_against": 87,
    "average_possession": 52.4,
    "yellow_cards": 38,
    "assists": 82
  },
  "head_to_head": {
    "matches_played": 4,
    "wins_a": 2,
    "wins_b": 1,
    "draws": 1,
    "goals_a": 7,
    "goals_b": 5
  },
  "timeframe": "global"
}
```

#### Lógica de negocio (controlador)

- **Nuevo controlador:** `backend/app/controllers/h2h_controller.py`
- Si `edition_id` está presente: filtrar ambas consultas a esa edición.
- Si no: agregar stats a través de todas las ediciones.
- Para el `head_to_head` histórico real (partidos entre ambos): requiere una nueva tabla de partidos o un cruce inteligente. **Opción recomendada:** agregar columna `partidos_h2h` como tabla separada o usar el dataset de Fjelstul que tiene partidos.

#### Nuevos modelos / tablas sugeridas

```sql
CREATE TABLE IF NOT EXISTS partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    edicion_id INT NOT NULL,
    equipo_local_id INT NOT NULL,
    equipo_visitante_id INT NOT NULL,
    goles_local INT NOT NULL DEFAULT 0,
    goles_visitante INT NOT NULL DEFAULT 0,
    FOREIGN KEY (edicion_id) REFERENCES ediciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> **Alternativa:** Si no se quiere migrar datos, el head-to-head puede calcularse desde `estadisticas_equipos` cruzando ediciones donde ambos equipos participaron. Es menos preciso pero evita migración.

### Frontend — Nuevos Componentes React

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `HeadToHeadPage.tsx` | `src/pages/HeadToHeadPage.tsx` | Página principal de la Épica 1 |
| `H2HEntitySelector.tsx` | `src/components/h2h/H2HEntitySelector.tsx` | Selector dual con búsqueda (dos paneles: Lado A vs Lado B) |
| `H2HFilterBar.tsx` | `src/components/h2h/H2HFilterBar.tsx` | Filtros anidados: tipo de entidad (Selección/Jugador) + tiempo (Global/Edición) |
| `H2HComparisonCard.tsx` | `src/components/h2h/H2HComparisonCard.tsx` | Tarjeta de métricas comparadas con barras de progreso duales |
| `H2HRadarChart.tsx` | `src/components/h2h/H2HRadarChart.tsx` | Gráfico radar con recharts comparando múltiples métricas |
| `H2HHistoryBadge.tsx` | `src/components/h2h/H2HHistoryBadge.tsx` | Badge con resultados de enfrentamientos directos históricos |

#### Flujo de interacción

```
1. Usuario selecciona tipo de entidad (Selección / Jugador)
2. Aparecen dos selectores con búsqueda typeahead (Lado A, Lado B)
3. Usuario selecciona filtro temporal (Global / Edición específica)
4. Si elige "Edición": aparece un dropdown de ediciones
5. Al cambiar cualquier filtro → nueva llamada API → se actualiza la UI
```

#### Integración en el Dashboard

Agregar un nuevo tab en la barra lateral del `Dashboard.tsx`:

```
SECCIÓN: ANÁLISIS
├── Head-to-Head    → <HeadToHeadPage />
├── Rankings         → <RankingsPage />
└── Oráculo IA       → <OraclePage />
```

### Consultas SQL clave

```sql
-- Comparación global de dos selecciones (todas las ediciones)
SELECT 
  SUM(ee.goles_a_favor) AS goals_for,
  SUM(ee.goles_en_contra) AS goals_against,
  AVG(ee.posesion_promedio) AS avg_possession,
  SUM(CASE WHEN e.campeon = ee.nombre_pais THEN 1 ELSE 0 END) AS titles
FROM estadisticas_equipos ee
JOIN ediciones e ON e.id = ee.edicion_id
WHERE ee.nombre_pais IN ('Argentina', 'Francia')
GROUP BY ee.nombre_pais;
```

---

## 🏆 ÉPICA 2: Rankings Dinámicos

### Descripción

Tablas de posiciones globales con capacidad de filtrado por edición. Múltiples categorías: Goleadores, Participaciones, Tarjetas, Equipos.

### Backend — Nuevos Endpoints Flask

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/rankings/top-scorers` | Top N goleadores (`?limit=20&edition_id=X`). Sin `edition_id` = histórico global. | Token |
| `GET` | `/api/rankings/most-participations` | Selecciones con más participaciones (`?limit=20`). | Token |
| `GET` | `/api/rankings/most-carded` | Equipos con más tarjetas (`?limit=20&edition_id=X`). | Token |
| `GET` | `/api/rankings/best-attack` | Equipos con más goles a favor (`?limit=20&edition_id=X`). | Token |
| `GET` | `/api/rankings/best-defense` | Equipos con menos goles en contra (`?limit=20&edition_id=X`). | Token |

#### Estructura de respuesta (top-scorers)

```json
{
  "ranking": "top_scorers",
  "timeframe": "global",
  "edition": null,
  "data": [
    { "position": 1, "player_id": 10, "player_name": "Miroslav Klose", "goals": 16, "editions": 4 },
    { "position": 2, "player_id": 7, "player_name": "Ronaldo Nazário", "goals": 15, "editions": 4 }
  ]
}
```

#### Lógica de negocio (controlador)

- **Nuevo controlador:** `backend/app/controllers/rankings_controller.py`
- Cada ranking usa queries agregadas sobre `estadisticas_jugadores` y `estadisticas_equipos`.
- El parámetro `edition_id` aplica un `WHERE edicion_id = X` para filtrar por edición.

### Frontend — Nuevos Componentes React

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `RankingsPage.tsx` | `src/pages/RankingsPage.tsx` | Página principal con tabs de categorías |
| `RankingCategoryTabs.tsx` | `src/components/rankings/RankingCategoryTabs.tsx` | Tabs horizontales: Goleadores / Participaciones / Tarjetas / Ataque / Defensa |
| `RankingsEditionFilter.tsx` | `src/components/rankings/RankingsEditionFilter.tsx` | Dropdown de ediciones para filtrar (opción "Histórico Global" por defecto) |
| `RankingsTable.tsx` | `src/components/rankings/RankingsTable.tsx` | Tabla rankeada con posiciones, barra de valor y medallas (🥇🥈🥉) |
| `RankingCard.tsx` | `src/components/rankings/RankingCard.tsx` | Versión mobile compacta de cada fila del ranking |

### Consultas SQL clave

```sql
-- Top goleadores históricos global
SELECT 
  nombre_jugador, 
  SUM(goles) AS total_goles,
  COUNT(DISTINCT edicion_id) AS ediciones_participadas
FROM estadisticas_jugadores
GROUP BY jugador_id, nombre_jugador
ORDER BY total_goles DESC
LIMIT 20;

-- Top goleadores por edición específica
SELECT 
  nombre_jugador, 
  goles,
  partidos_jugados
FROM estadisticas_jugadores
WHERE edicion_id = %s
ORDER BY goles DESC
LIMIT 20;
```

---

## 🤖 ÉPICA 3: El Oráculo IA (Predicciones)

### Descripción

Interfaz para seleccionar un partido futuro o hipotético entre dos selecciones y obtener predicciones generadas por un motor híbrido: simulación Monte Carlo + modelo de Machine Learning supervisado.

### Backend — Nuevos Endpoints Flask

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/oracle/predict` | Recibe `{ team_a_id, team_b_id, use_ml: bool }`. Retorna probabilidades de victoria, empate y stats esperados. | Token |
| `GET` | `/api/oracle/available-teams` | Lista de selecciones disponibles para simulación (todas las que tienen datos históricos). | Token |
| `GET` | `/api/oracle/model-info` | Información del modelo activo: tipo, versión, fecha de entrenamiento, features usadas, accuracy. | Token |

#### Estructura de respuesta (`/oracle/predict`)

```json
{
  "matchup": {
    "team_a": { "id": 1, "name": "Argentina", "ranking_fifa": 1 },
    "team_b": { "id": 2, "name": "Brasil", "ranking_fifa": 3 }
  },
  "prediction": {
    "win_probability_a": 0.38,
    "win_probability_b": 0.35,
    "draw_probability": 0.27,
    "expected_goals_a": 1.8,
    "expected_goals_b": 1.6,
    "most_likely_score": "2-1"
  },
  "method": "monte_carlo",
  "simulations_run": 10000,
  "confidence_interval": { "lower": 0.32, "upper": 0.44 }
}
```

### Motor Predictivo

#### Fase 1: Modelo Estadístico — Simulación Monte Carlo

- **Archivo:** `backend/app/services/monte_carlo_service.py`
- **Input:** Estadísticas históricas de ambos equipos (goles F/C promedio, posesión).
- **Proceso:**
  1. Calcular tasa de goles esperada (λ) por equipo usando promedio histórico.
  2. Simular 10,000 partidos usando distribución de Poisson (goles) o Skellam (diferencia).
  3. Contar victorias A, victorias B, empates → convertir a probabilidades.
- **Librerías:** `numpy`, `scipy.stats`

```python
# Pseudocódigo conceptual
import numpy as np
from scipy.stats import poisson

def monte_carlo_simulation(goals_for_avg_a, goals_against_avg_a, 
                            goals_for_avg_b, goals_against_avg_b, n=10000):
    lambda_a = (goals_for_avg_a + goals_against_avg_b) / 2
    lambda_b = (goals_for_avg_b + goals_against_avg_a) / 2
    
    goals_a = poisson.rvs(lambda_a, size=n)
    goals_b = poisson.rvs(lambda_b, size=n)
    
    wins_a = np.sum(goals_a > goals_b) / n
    wins_b = np.sum(goals_b > goals_a) / n
    draws = np.sum(goals_a == goals_b) / n
    
    return wins_a, wins_b, draws
```

#### Fase 2: Modelo de Machine Learning (Preparado para integración)

- **Archivo:** `backend/app/services/ml_prediction_service.py`
- **Modelo:** Clasificador supervisado (Random Forest o Gradient Boosting)
- **Features (vector de entrada):**
  - Goles a favor promedio (últimos 5 partidos / histórico)
  - Goles en contra promedio
  - Posesión promedio
  - Diferencia de goles (performance)
  - Títulos ganados
  - Número de participaciones mundialistas
- **Target:** Resultado del partido (Victoria A / Empate / Victoria B)
- **Serialización:** Modelo pre-entrenado guardado como `backend/ml_models/worldcup_predictor_v1.pkl`
- **Framework:** `scikit-learn` + `joblib`

```python
# Pseudocódigo conceptual
from sklearn.ensemble import RandomForestClassifier
import joblib

class MLPredictionService:
    def __init__(self):
        self.model = joblib.load("ml_models/worldcup_predictor_v1.pkl")
    
    def predict(self, features_a, features_b):
        combined = features_a + features_b  # vector de 10-12 features
        probas = self.model.predict_proba([combined])[0]
        return {"win_a": probas[0], "draw": probas[1], "win_b": probas[2]}
```

- **Endpoints del modelo:** El endpoint `/oracle/predict` acepta `use_ml: bool`. Si es `true`, llama a `ml_prediction_service` en lugar de `monte_carlo_service`.

#### Fase 3: Entrenamiento del Modelo (Offline)

- **Script:** `backend/scripts/train_predictor.py`
- Se ejecuta bajo demanda (no en el servidor).
- Usa datos históricos de `estadisticas_equipos` como dataset de entrenamiento.
- Cada fila = un enfrentamiento real entre dos equipos.
- Target: resultado (1 = victoria local/primero, 0 = empate, -1 = victoria visitante/segundo).
- Guarda el modelo entrenado en `backend/ml_models/`.

### Frontend — Nuevos Componentes React

| Componente | Ruta | Propósito |
|------------|------|-----------|
| `OraclePage.tsx` | `src/pages/OraclePage.tsx` | Página principal del Oráculo IA |
| `OracleMatchSelector.tsx` | `src/components/oracle/OracleMatchSelector.tsx` | Selector de dos equipos con búsqueda e información contextual |
| `OraclePredictionCard.tsx` | `src/components/oracle/OraclePredictionCard.tsx` | Panel principal de resultado: probabilidades, score esperado, confianza |
| `OracleProbabilityGauge.tsx` | `src/components/oracle/OracleProbabilityGauge.tsx` | Gauge visual (barra horizontal con tres segmentos) para A / Empate / B |
| `OracleMethodToggle.tsx` | `src/components/oracle/OracleMethodToggle.tsx` | Toggle para elegir entre Monte Carlo o ML (si el modelo está disponible) |
| `OracleMatchHistory.tsx` | `src/components/oracle/OracleMatchHistory.tsx` | Mini tabla con enfrentamientos previos reales entre ambos equipos |

---

## 🧭 Integración en el Dashboard Existente

### Nuevas rutas (App.tsx)

```tsx
<Route path="/dashboard/h2h" element={<ProtectedRoute><HeadToHeadPage /></ProtectedRoute>} />
<Route path="/dashboard/rankings" element={<ProtectedRoute><RankingsPage /></ProtectedRoute>} />
<Route path="/dashboard/oracle" element={<ProtectedRoute><OraclePage /></ProtectedRoute>} />
```

### Modificaciones al Navbar lateral (Dashboard.tsx)

Agregar una nueva sección "ANÁLISIS" en el sidebar, entre "GESTIÓN MANUAL" e "INGESTA DE DATOS":

```
SECCIÓN: GESTIÓN MANUAL
├── Ediciones
├── Equipos
└── Jugadores

SECCIÓN: ANÁLISIS (NUEVA)
├── 🆚 Head-to-Head
├── 🏆 Rankings
└── 🤖 Oráculo IA

SECCIÓN: INGESTA DE DATOS
├── Panel de Control
```

---

## 📁 Estructura de Archivos (Solo nuevos)

### Backend

```
backend/
├── app/
│   ├── controllers/
│   │   ├── h2h_controller.py          ← NUEVO
│   │   ├── rankings_controller.py      ← NUEVO
│   │   └── oracle_controller.py        ← NUEVO
│   ├── routes/
│   │   ├── h2h_routes.py               ← NUEVO
│   │   ├── rankings_routes.py          ← NUEVO
│   │   └── oracle_routes.py            ← NUEVO
│   └── services/
│       ├── monte_carlo_service.py      ← NUEVO
│       └── ml_prediction_service.py    ← NUEVO
├── ml_models/
│   └── worldcup_predictor_v1.pkl       ← NUEVO (generado)
├── scripts/
│   └── train_predictor.py              ← NUEVO
└── requirements.txt                    ← MODIFICADO (agregar numpy, scipy, scikit-learn, joblib, imblearn)
```

### Frontend

```
frontend/src/
├── pages/
│   ├── HeadToHeadPage.tsx              ← NUEVO
│   ├── RankingsPage.tsx                ← NUEVO
│   └── OraclePage.tsx                  ← NUEVO
├── components/
│   ├── h2h/
│   │   ├── H2HEntitySelector.tsx       ← NUEVO
│   │   ├── H2HFilterBar.tsx            ← NUEVO
│   │   ├── H2HComparisonCard.tsx       ← NUEVO
│   │   ├── H2HRadarChart.tsx           ← NUEVO
│   │   └── H2HHistoryBadge.tsx         ← NUEVO
│   ├── rankings/
│   │   ├── RankingCategoryTabs.tsx     ← NUEVO
│   │   ├── RankingsEditionFilter.tsx   ← NUEVO
│   │   ├── RankingsTable.tsx           ← NUEVO
│   │   └── RankingCard.tsx             ← NUEVO
│   └── oracle/
│       ├── OracleMatchSelector.tsx     ← NUEVO
│       ├── OraclePredictionCard.tsx    ← NUEVO
│       ├── OracleProbabilityGauge.tsx  ← NUEVO
│       ├── OracleMethodToggle.tsx      ← NUEVO
│       └── OracleMatchHistory.tsx      ← NUEVO
└── package.json                        ← MODIFICADO (agregar recharts, @tanstack/react-query, framer-motion)
```

---

## ✅ Resumen de Tareas por Épica

### Épica 1 — Head-to-Head (Estimación: 4-5 días)

| # | Tarea | Tipo |
|---|-------|------|
| 1.1 | Crear rama `feature/epic1-head-to-head` desde `Nahuel_Develop` | Git |
| 1.2 | Implementar tabla `partidos` en schema.sql y migrar datos | DB |
| 1.3 | Crear controlador `h2h_controller.py` con lógica de comparación | Backend |
| 1.4 | Crear rutas `h2h_routes.py` y registrar blueprint en app.py | Backend |
| 1.5 | Crear `H2HEntitySelector` con búsqueda typeahead | Frontend |
| 1.6 | Crear `H2HFilterBar` con filtros anidados | Frontend |
| 1.7 | Crear `H2HComparisonCard` y `H2HRadarChart` | Frontend |
| 1.8 | Crear `HeadToHeadPage` e integrar en el dashboard | Frontend |
| 1.9 | Mergear `feature/epic1-head-to-head` → `Nahuel_Develop` | Git |

### Épica 2 — Rankings Dinámicos (Estimación: 3-4 días)

| # | Tarea | Tipo |
|---|-------|------|
| 2.1 | Crear rama `feature/epic2-rankings` desde `Nahuel_Develop` | Git |
| 2.2 | Crear controlador `rankings_controller.py` con queries agregadas | Backend |
| 2.3 | Crear rutas `rankings_routes.py` y registrar blueprint | Backend |
| 2.4 | Crear `RankingCategoryTabs` con 5 categorías | Frontend |
| 2.5 | Crear `RankingsEditionFilter` (dropdown con opción global) | Frontend |
| 2.6 | Crear `RankingsTable` con posiciones, barras y medallas | Frontend |
| 2.7 | Crear `RankingsPage` e integrar en el dashboard | Frontend |
| 2.8 | Mergear `feature/epic2-rankings` → `Nahuel_Develop` | Git |

### Épica 3 — Oráculo IA (Estimación: 5-6 días)

| # | Tarea | Tipo |
|---|-------|------|
| 3.1 | Crear rama `feature/epic3-oracle-ai` desde `Nahuel_Develop` | Git |
| 3.2 | Instalar librerías: numpy, scipy, scikit-learn, joblib | Backend |
| 3.3 | Implementar `monte_carlo_service.py` (simulaciones Poisson) | Backend |
| 3.4 | Implementar `ml_prediction_service.py` (cargar modelo .pkl) | Backend |
| 3.5 | Crear script `train_predictor.py` para entrenar modelo offline | Backend |
| 3.6 | Entrenar modelo y guardar `worldcup_predictor_v1.pkl` | Backend |
| 3.7 | Crear controlador `oracle_controller.py` | Backend |
| 3.8 | Crear rutas `oracle_routes.py` y registrar blueprint | Backend |
| 3.9 | Crear `OracleMatchSelector` con búsqueda de equipos | Frontend |
| 3.10 | Crear `OraclePredictionCard` y `OracleProbabilityGauge` | Frontend |
| 3.11 | Crear `OracleMethodToggle` (Monte Carlo / ML) | Frontend |
| 3.12 | Crear `OraclePage` e integrar en el dashboard | Frontend |
| 3.13 | Mergear `feature/epic3-oracle-ai` → `Nahuel_Develop` | Git |

---

## 📊 Diseño Visual (Guías)

- **Paleta:** Fondo oscuro (`#030712` slate-950), acento amarillo/dorado (`#e5b842`), acentos secundarios cyan y ámbar.
- **Componentes:** Glassmorphism consistente con `backdrop-filter: blur(12px)` y bordes semitransparentes.
- **Gráficos:** Recharts con tema oscuro, colores de dataset #e5b842 (dorado), #06b6d4 (cyan), #f59e0b (ámbar).
- **Animaciones:** Framer Motion para transiciones suaves entre selecciones y rankings.
- **Responsive:** Todos los componentes deben ser funcionales en desktop y tablet.

---

*Documento creado para el Parcial de Programación III — Mundial Web App (IES 9-023)*  
*Versión 1.0 — Revisado y aprobado por Arquitectura*
