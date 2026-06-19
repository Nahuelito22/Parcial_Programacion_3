# Plan de Implementacion — Fixture 2026 (Dashboard en Vivo)

> **Proyecto:** Mundial Web App  
> **Fecha:** Junio 2026  
> **Branch base:** `Nahuel_Develop`  
> **Fuente de datos:** [ESPN API](https://site.api.espn.com) (gratis, sin auth, sin rate limit)  
> **Fuente de datos HISTORICA:** API-Football (datos historicos 2022)  

---

## Estrategia de Fuentes de Datos

### ESPN API — Unica fuente de datos

worldcup26.ir fue eliminado por completo tras auditar que el API esta caido (SSL `UNEXPECTED_EOF_WHILE_READING`, auth 400). ESPN API es la unica fuente de datos para todo el Fixture 2026.

| Criterio | ESPN API | worldcup26.ir (ELIMINADO) |
|---|---|---|
| **Costo** | Gratis, sin key | Gratis, con JWT |
| **Temporada 2026** | SI soportada | SI soportada |
| **Rate limit** | Sin limite conocido | 500 req/min |
| **Auth** | NO requerida | JWT obligatoria |
| **Scores en vivo** | SI, scoreboard actualizado | SI |
| **Estadios con capacidad** | NO (solo venue por partido) | SI (lista dedicada) |
| **Grupos/standings** | Endpoint existe pero devuelve `{}` | SI, con posiciones |
| **Estadisticas individuales** | SI (goals, assists, cards) | NO |
| **Disponibilidad actual** | Funcionando | CAIDO (SSL/auth) |

### Arquitectura actual (ESPN-only)

```
FUENTE UNICA: ESPN API
  → Equipos (48 selecciones con logos) — teams endpoint
  → Scoreboard en vivo (partidos del dia) — scoreboard endpoint
  → Goleadores (50 top scorers) — statistics endpoint (JSON)
  → Asistencias (50 top providers) — statistics endpoint (JSON)
  → Tarjetas por equipo (48 equipos) — HTML scraping (ESPN AR)
  → Datos en tiempo real cada 2 min con backoff exponencial

GRUPOS: worldcup_groups.py (hardcoded)
  → FIFA official draw 2026 (May 5, 2026)
  → 48 equipos → 12 grupos A-L
  → Asignados durante sync, no desde API
```

---

## Flujo de Sincronizacion

```
1. EQUIPOS: ESPN teams (48 selecciones con logos)
2. PARTIDOS: ESPN scoreboard (N partidos del dia)
3. STATS: ESPN statistics (goleadores + asistencias) + HTML scraping (tarjetas)
4. GRUPOS: worldcup_groups.py (FIFA official draw)
5. REFRESH EN VIVO: ESPN scoreboard cada 2 min con backoff exponencial
```

---

## Analisis de Viabilidad: APIs

### ESPN API

**Endpoints principales:**
| Endpoint | Uso | Method |
|---|---|---|
| `/apis/site/v2/sports/soccer/fifa.world/scoreboard` | Partidos del dia | GET |
| `/apis/site/v2/sports/soccer/fifa.world/teams` | 48 selecciones | GET |
| `/apis/site/v2/sports/soccer/fifa.world/standings` | Posiciones (no funciona) | GET |
| `/apis/site/v2/sports/soccer/fifa.world/teams/:id` | Detalle equipo | GET |

**Estructura de respuesta del scoreboard:**
```json
{
  "events": [{
    "id": "601488535",
    "name": "Group A - Mexico vs South Africa",
    "date": "2026-06-11T20:00Z",
    "competitions": [{
      "id": "601488535",
      "competitors": [{
        "homeAway": "home",
        "team": { "id": "36", "displayName": "Mexico", "abbreviation": "MEX", "logo": "..." },
        "score": "2"
      }, {
        "homeAway": "away",
        "team": { "id": "55", "displayName": "South Africa", "abbreviation": "RSA", "logo": "..." },
        "score": "1"
      }],
      "status": {
        "type": { "completed": false, "state": "in", "detail": "2nd Half - 75'" },
        "displayClock": "75'"
      },
      "venue": { "fullName": "Estadio Azteca", "address": { "city": "Mexico City" } }
    }]
  }]
}
```

### worldcup2026 API

**Endpoints:**
| Endpoint | Uso | Auth |
|---|---|---|
| `POST /auth/authenticate` | Obtener JWT | Email+Password |
| `GET /get/teams` | 48 equipos | JWT |
| `GET /get/stadiums` | 16 estadios | JWT |
| `GET /get/groups` | 12 grupos con posiciones | JWT |
| `GET /get/games` | 104 partidos | JWT |

**Estado actual:** CAIDO (SSL + auth errors). Usar solo como fallback secundario.

---

## Flujo Git

1. Crear rama desde `Nahuel_Develop`: `git checkout -b feature/fixture-2026-v2 Nahuel_Develop`
2. Desarrollar tareas (1 commit por tarea).
3. Push de la rama feature.
4. Merge a `Nahuel_Develop`: `git checkout Nahuel_Develop && git merge feature/fixture-2026-v2`
5. Push de `Nahuel_Develop`.

---

## TAREAS COMPLETADAS

---

### Task 1 — Crear clientes HTTP (COMPLETADO)

**Que se hizo:**
- `backend/app/services/espn_client.py` — Cliente HTTP para ESPN API
  - `get_scoreboard(date)` — Scoreboard del Mundial 2026
  - `get_live_matches()` — Solo partidos en vivo/finalizados
  - `get_all_matches()` — Todos los partidos
  - `get_teams()` — 48 selecciones con logos
  - `get_standings()` — Posiciones (endpoint no funciona)
  - Reintentos con backoff ante 429
- `backend/app/services/worldcup_client.py` — Cliente HTTP para worldcup2026 (ELIMINADO, API caido)

**Commits:**
- `feat(backend): create ESPNClient for World Cup 2026 live data`

---

### Task 2 — Crear tablas y modelos (COMPLETADO)

**Que se hizo:**
- 7 tablas en MySQL: `partidos_2026`, `equipos_2026`, `estadios_2026`, `grupos_2026`, `goleadores_2026`, `asistencias_2026`, `tarjetas_2026`
- Modelos: `Match2026`, `Team2026`, `Stadium2026`, `Group2026`, `Goleador2026`, `Asistencia2026`, `Tarjeta2026`

**Commits:**
- `feat(backend): add partidos_2026, equipos_2026, estadios_2026, grupos_2026 tables`
- `feat(backend): add goleadores_2026, asistencias_2026, tarjetas_2026 tables and models`

---

### Task 3 — Crear servicio de sincronizacion (COMPLETADO)

**Que se hizo:**
- `backend/app/services/worldcup_sync_service.py` — ESPN-only sync
  1. ESPN teams (48 selecciones con logos)
  2. ESPN scoreboard (partidos)
  3. ESPN stats (goleadores + asistencias + tarjetas)
  4. worldcup_groups.py (grupos FIFA official draw)
- `backend/app/services/worldcup_groups.py` — FIFA official draw 2026 (May 5, 2026)
- `backend/app/services/espn_stats_scraper.py` — Scraping de estadisticas

**Commits:**
- `feat(backend): implement hybrid sync service with ESPN primary`
- `feat(backend): add ESPN stats scraper for goals, assists, cards, and standings calculation`

---

### Task 4 — Crear endpoints de Fixture 2026 (COMPLETADO)

**Que se hizo:**
Blueprint `fixture_2026_bp` con 10 endpoints:

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| GET | `/api/2026/fixtures` | No | Todos los partidos (con filtros) |
| GET | `/api/2026/fixtures/:id` | No | Detalle de un partido |
| GET | `/api/2026/teams` | No | Todos los equipos |
| GET | `/api/2026/teams/:id` | No | Detalle de un equipo |
| GET | `/api/2026/groups` | No | Posiciones por grupo |
| GET | `/api/2026/stadiums` | No | Estadios |
| GET | `/api/2026/stats` | No | Goleadores + asistencias + tarjetas |
| POST | `/api/2026/sync` | Admin | Trigger sync completo |
| POST | `/api/2026/refresh-live` | Admin | Refresh rapido partidos en vivo |
| POST | `/api/2026/stats/sync` | Admin | Scrape stats desde ESPN |

**Commits:**
- `feat(backend): add fixture_2026 blueprint with fixtures, teams, groups, stadiums endpoints`
- `feat(backend): add sync and refresh-live admin endpoints`
- `feat(backend): add /api/2026/stats endpoint and integrate stats scraping into sync`

---

### Task 5-7 — Componentes Frontend (COMPLETADOS)

**Que se hizo:**
- `LiveIndicator.tsx` — Badge de estado en vivo con animacion pulsante
- `FixtureCard2026.tsx` — Tarjeta de partido con goleadores
- `GroupStandings.tsx` — Tabla de posiciones por grupo

**Commits:**
- `feat(frontend): create LiveIndicator component`
- `feat(frontend): create FixtureCard2026 with team flags`
- `feat(frontend): create GroupStandings component`

---

### Task 8 — Hooks de datos (COMPLETADO)

**Que se hizo:**
- `useWorldCup2026.ts` con React Query
  - `useFixtures2026()` — refetch cada 60s
  - `useTeams2026()` — stale 5min
  - `useGroups2026()` — refetch cada 60s
  - `useStadiums2026()` — stale 1h
  - `useStats2026()` — stale 5min

**Commit:**
- `feat(frontend): add useWorldCup2026 hooks with live refetch`

---

### Task 9 — Pagina principal (COMPLETADO)

**Que se hizo:**
- `Fixture2026Page.tsx` con 5 tabs: Fixture, Grupos, Equipos, Estadios, Estadisticas
- `TeamCard.tsx` — Card de equipo con bandera
- `StadiumCard.tsx` — Card de estadio
- `StatsGoleadores.tsx` — Tabla de goleadores
- `StatsAsistencias.tsx` — Tabla de asistencias
- `StatsTarjetas.tsx` — Tabla de tarjetas por equipo

**Commit:**
- `feat(frontend): build Fixture2026Page with 5 tabs`
- `feat(frontend): add Estadisticas tab, remove emojis from tabs`

---

### Task 10 — Integrar en Dashboard (COMPLETADO)

**Que se hizo:**
- Ruta `/dashboard/fixture-2026` en App.tsx
- Entrada en sidebar de Dashboard.tsx

**Commit:**
- `feat(frontend): integrate Fixture 2026 into Dashboard sidebar`

---

### Task 11 — Endpoint sync y boton admin (COMPLETADO)

**Que se hizo:**
- `POST /api/2026/sync` ejecuta sync completo (ESPN-only)
- Boton en DataManagementPanel.tsx

**Commit:**
- `feat(fullstack): add sync endpoint and admin button for Fixture 2026`

---

### Task 12 — Auto-refresh con backoff (COMPLETADO)

**Que se hizo:**
- `backend/app/services/live_refresh_service.py` con:
  - Intervalo base: 120s
  - Backoff exponencial: 120s → 300s → 600s → 900s (max)
  - Reset tras 3 exitos consecutivos
  - Metodo `get_status()` para debugging
  - Solo ESPN (sin worldcup26 fallback)

**Commits:**
- `feat(backend): add LiveRefreshService with exponential backoff`
- `fix(backend): add error handling and backoff to prevent log spam`

---

### Task 13 — Estadisticas: scraping ESPN (COMPLETADO)

**Que se hizo:**
- `backend/app/services/espn_stats_scraper.py`
  - `scrape_goals()` — 50 goleadores desde ESPN JSON API
  - `scrape_assists()` — 50 asistencias desde ESPN JSON API
  - `scrape_cards()` — 48 equipos con tarjetas desde ESPN HTML
  - `calculate_standings()` — Posiciones calculadas desde scoreboard
- `backend/app/controllers/fixture_2026_controller.py` — `get_stats()` + `sync_stats()`
- `backend/app/models/stats_2026.py` — `Goleador2026`, `Asistencia2026`, `Tarjeta2026`
- `backend/schema.sql` — 3 tablas nuevas

**Commits:**
- `feat(backend): add ESPN stats scraper for goals, assists, cards, and standings calculation`
- `feat(backend): add goleadores_2026, asistencias_2026, tarjetas_2026 tables and models`
- `feat(backend): add /api/2026/stats endpoint and integrate stats scraping into sync`

---

### Task 14 — Frontend: Estadisticas (COMPLETADO)

**Que se hizo:**
- `StatsGoleadores.tsx` — Tabla de goleadores con ranking
- `StatsAsistencias.tsx` — Tabla de asistencias con ranking
- `StatsTarjetas.tsx` — Tabla de tarjetas por equipo
- Emojis removidos de todos los tabs (profesional)

**Commits:**
- `feat(frontend): add Estadisticas tab, remove emojis from tabs`

---

### Task 15 — Verificar end-to-end (COMPLETADO)

**Que se hizo:**
- MySQL: 3 tablas creadas (`goleadores_2026`, `asistencias_2026`, `tarjetas_2026`)
- Scraper verificado: 50 goleadores, 50 asistencias, 48 equipos con tarjetas
- API verificada: GET `/api/2026/stats` retorna datos correctamente
- TypeScript compila sin errores

**Datos verificados:**
- Top scorer: Lionel Messi (ARG) — 3G
- Top assists: Chris Wood (NZL) — 2A
- Top cards: South Africa — 4Y 2R

---

## Resumen de Archivos

### Nuevos (Backend — 8)

| Archivo | Proposito |
|---|---|
| `app/services/espn_client.py` | Cliente HTTP para ESPN API |
| `app/services/espn_stats_scraper.py` | Scraping de estadisticas ESPN (goals, assists, cards) |
| `app/services/worldcup_groups.py` | FIFA official draw 2026 (48 equipos → 12 grupos) |
| `app/services/worldcup_sync_service.py` | Servicio de sincronizacion ESPN-only |
| `app/services/live_refresh_service.py` | Auto-refresh con backoff exponencial |
| `app/controllers/fixture_2026_controller.py` | Controller con 10 endpoints |
| `app/routes/fixture_2026_routes.py` | Blueprint con rutas publicas + admin |
| `app/models/stats_2026.py` | Modelos: Goleador2026, Asistencia2026, Tarjeta2026 |

### Nuevos (Frontend — 12)

| Archivo | Proposito |
|---|---|
| `components/fixture/FixtureCard2026.tsx` | Tarjeta de partido con goleadores |
| `components/fixture/LiveIndicator.tsx` | Badge de estado en vivo |
| `components/fixture/GroupStandings.tsx` | Tabla de posiciones por grupo |
| `components/fixture/TeamCard.tsx` | Card de equipo con bandera |
| `components/fixture/StadiumCard.tsx` | Card de estadio |
| `components/fixture/StatsGoleadores.tsx` | Tabla de goleadores |
| `components/fixture/StatsAsistencias.tsx` | Tabla de asistencias |
| `components/fixture/StatsTarjetas.tsx` | Tabla de tarjetas por equipo |
| `pages/Fixture2026Page.tsx` | Pagina principal con 5 tabs |
| `hooks/useWorldCup2026.ts` | Hooks de datos con React Query |
| (modificar App.tsx) | Ruta nueva |
| (modificar Dashboard.tsx) | Sidebar actualizado |

### Database (7 tablas)

| Tabla | Registros | Descripcion |
|---|---|---|
| `partidos_2026` | N | Fixtures del Mundial 2026 |
| `equipos_2026` | 48 | Selecciones participantes |
| `estadios_2026` | 16 | Sedes del torneo |
| `grupos_2026` | 48 | Posiciones por grupo (4 equipos x 12 grupos) |
| `goleadores_2026` | 50 | Top 50 goleadores |
| `asistencias_2026` | 50 | Top 50 asistencias |
| `tarjetas_2026` | 48 | Tarjetas por equipo |

---

## Presupuesto de API

| Operacion | Requests | Frecuencia |
|---|---|---|
| Sync completo | ~4 (ESPN teams + scoreboard + statistics + cards) | Bajo demanda (admin) |
| Refresh live | 1 (ESPN scoreboard) | Cada 2 min con backoff |
| **Total por hora (sin errores)** | **~30 requests** | Sin limite conocido |
| **Total con backoff (errores)** | **~10 requests** | Backoff reduce frecuencia |

ESPN es la unica fuente de datos. Sin dependencia de APIs caidos.

---

## Diagrama de Arquitectura

```
[ESPN API (site.api.espn.com)]
  │
  │ GET /apis/.../scoreboard, /teams, /statistics
  │ HTML scraping: /soccer/scoreboard/_/league/fifa.world (cards)
  │ (sin auth, sin rate limit)
  │
  ▼
[ESPNClient + ESPNStatsScraper] ────────┐
  │                                     │
  │                                     ▼
  │                          [WorldCupSyncService]
  │                                     │
  │                                     ├── UPSERT equipos_2026 (48 rows)
  │                                     ├── UPSERT partidos_2026 (N rows)
  │                                     ├── UPSERT grupos_2026 (48 rows)
  │                                     ├── UPSERT goleadores_2026 (50 rows)
  │                                     ├── UPSERT asistencias_2026 (50 rows)
  │                                     └── UPSERT tarjetas_2026 (48 rows)
  │
  │                     ┌─────────────────────────┐
  │                     │ LiveRefreshService       │
  │                     │ (thread, cada 2 min)    │
  │                     │ ESPN → Backoff 120-900s │
  │                     └─────────────────────────┘
  │
  ▼
[MySQL: partidos_2026, equipos_2026, grupos_2026,
        goleadores_2026, asistencias_2026, tarjetas_2026]
  │
  │ GET /api/2026/fixtures, /teams, /groups, /stats
  │ (lectura local, sin llamadas a API)
  │
  ▼
[Frontend: Fixture2026Page]
  ├── FixtureCard2026 (con LiveIndicator)
  ├── GroupStandings (12 grupos)
  ├── TeamCard (48 equipos)
  ├── StadiumCard (16 estadios)
  ├── StatsGoleadores (50 goleadores)
  ├── StatsAsistencias (50 asistencias)
  └── StatsTarjetas (48 equipos)
```

---

## Notas Importantes

1. **ESPN API es la unica fuente de datos.** worldcup26.ir fue eliminado por completo.

2. **worldcup_groups.py contiene el draw oficial de FIFA** (May 5, 2026). Los grupos se asignan durante el sync, no desde API.

3. **El LiveRefreshService usa backoff exponencial.** Intervalo sube de 120s a 900s (15 min) cuando ESPN falla. Resetea a 120s tras 3 exitos.

4. **Los 48 equipos tienen logos reales de ESPN.** Extraidos desde el endpoint teams (logo) o scoreboard (team.logo).

5. **Estadisticas scraping**: Goals/assists desde JSON API (`/statistics`), cards desde HTML scraping (ESPN AR).

6. **Si ESPN falla**, la UI muestra "Buscando datos" (empty state). No hay fallback a otras APIs.

7. **API-Football sigue reservada para datos historicos 2022.** No se usa para 2026.

8. **MySQL debe tener las 7 tablas creadas.** Ejecutar `backend/schema.sql` para crearlas.
