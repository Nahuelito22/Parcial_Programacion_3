# GIT_GUIDELINES.md — Guía de Contribución y Control de Versiones

> Este documento establece las reglas para trabajar con Git en el proyecto **Mundial Web App — Parcial Programación III**.
> Su objetivo es proteger la rama de producción y mantener un flujo de trabajo ordenado, especialmente en un equipo con perfiles junior.

---

## 1. Convención de Nombres para Ramas

Cada desarrollador debe trabajar en su **propia rama de desarrollo**, siguiendo esta convención:

```
[Nombre]_Develop
```

### Integrantes del equipo:
| Desarrollador | Nombre de rama |
|---------------|---------------|
| Nahuel Ghilardi | `Nahuel_Develop` |
| Gustavo Garcia | `Gustavo_Develop` |

### Reglas:
- ✅ Usar tu **nombre real** (primera letra mayúscula, sin tildes ni espacios)
- ✅ Siempre terminar con `_Develop`
- ❌ No crear ramas con nombres genéricos como `test`, `prueba`, `fix`, etc.
- ❌ No usar caracteres especiales ni espacios

> **¿Necesitás una rama temporal para una feature?** Usá el formato: `feature/[descripcion-corta]`
> Ejemplo: `feature/crud-estadisticas`, `feature/login-page`

---

## 2. Flujo de Trabajo Local

### 🔴 Lo que NUNCA debés hacer:
1. **Nunca hacer merge manual a `main` en tu máquina local**
2. **Nunca hacer `git push` directo a `main`**
3. **Nunca hacer `git push` directo a `dev`** sin Pull Request

### 🟢 Lo que SÍ debés hacer:

#### Configuración inicial (una sola vez)
```bash
# Clonar el repositorio
git clone https://github.com/Nahuelito22/Parcial_Programacion_3.git

# Crear tu rama de desarrollo (si no existe)
git checkout -b [Nombre]_Develop
```

#### Flujo diario de trabajo
```bash
# 1. Asegurarte de estar en TU rama
git checkout [Nombre]_Develop

# 2. Traer los últimos cambios de dev a tu rama
git pull origin dev

# 3. Resolver conflictos si los hay (pedí ayuda si no sabés)

# 4. Trabajar en tu código...

# 5. Guardar tus cambios
git add .
git commit -m "feat: descripcion breve del cambio"

# 6. Subir TU rama al repositorio remoto
git push origin [Nombre]_Develop
```

#### Mantener tu rama actualizada
```bash
# Siempre antes de empezar a trabajar:
git checkout [Nombre]_Develop
git pull origin dev
```

> ⚠️ **Importante:** Siempre traés los cambios de `dev` hacia **tu rama**, nunca al revés. El merge hacia `dev` y `main` solo ocurre mediante Pull Request en GitHub.

---

## 3. Protocolo de Pull Requests (PR)

### Flujo completo

```
Tu rama ([Nombre]_Develop)
    │
    │  1. Test local OK ✅
    │
    ▼
  PR a dev (Integración)
    │
    │  2. Review + Test OK ✅
    │
    ▼
  PR a main (Producción) 🚀
```

### Antes de crear un PR:

#### Checklist obligatorio:
- [ ] El Frontend compila sin errores (`pnpm build`)
- [ ] El Backend arranca sin errores (`flask run` o `python app.py`)
- [ ] Probé los cambios en mi navegador local (`pnpm dev`)
- [ ] No rompí ninguna funcionalidad existente
- [ ] Los nombres de variables y funciones están en **inglés**
- [ ] Eliminé `console.log()` y `print()` de debug, y código comentado innecesario

### Cómo crear un Pull Request:

1. Ir a GitHub → Pestaña **Pull Requests** → **New Pull Request**
2. **Base:** `dev` ← **Compare:** `[Nombre]_Develop`
3. Escribir un título descriptivo:
   - ✅ `feat: add player stats CRUD endpoints`
   - ✅ `fix: correct JWT token expiration handling`
   - ✅ `style: update dashboard chart colors`
   - ❌ `cambios`, `update`, `fix cosas`
4. En la descripción, explicar brevemente:
   - **Qué** cambiaste
   - **Por qué** lo cambiaste
   - **Cómo** probarlo
5. Asignar al menos **1 revisor**

### Convención de commits:

Usamos prefijos para que los commits sean claros:

| Prefijo | Uso | Ejemplo |
|---------|-----|---------| 
| `feat:` | Nueva funcionalidad | `feat: add team statistics dashboard` |
| `fix:` | Corrección de bug | `fix: resolve JWT decode error on expired tokens` |
| `style:` | Cambios de CSS/diseño (sin lógica) | `style: update stats card hover effects` |
| `docs:` | Documentación | `docs: update README with install instructions` |
| `refactor:` | Reestructuración sin cambiar funcionalidad | `refactor: extract auth logic to useAuth hook` |
| `chore:` | Tareas de mantenimiento | `chore: update dependencies` |

---

## 4. Ramas del Proyecto

| Rama | Propósito | Protección |
|------|-----------|------------|
| `main` | **Producción** — Código estable y funcional | 🔒 Solo via PR, requiere aprobación |
| `dev` | **Integración** — Se fusionan los cambios de cada desarrollador | 🔒 Solo via PR |
| `[Nombre]_Develop` | Desarrollo individual | ✅ Push libre |
| `feature/*` | Features específicas (efímeras) | ✅ Push libre |

### Diagrama visual:

```
main (Producción) ◄──── PR ──── dev (Integración) ◄──── PR ──── [Nombre]_Develop
     🔒                              🔒                              ✅
```

---

## 5. ¿Qué hacer si algo sale mal?

| Situación | Solución |
|-----------|----------|
| Hice commit en la rama equivocada | `git stash` → cambiar de rama → `git stash pop` |
| Tengo conflictos de merge | Pedí ayuda a un compañero o al líder del equipo |
| Rompí algo en mi rama | `git log` para ver historial → `git revert [hash]` |
| Necesito descartar todos mis cambios locales | `git checkout -- .` (⚠️ esto borra cambios no guardados) |
| No sé qué hacer | **Preguntá antes de actuar.** Es mejor preguntar que romper producción |

> 💡 **Regla de oro:** Si no estás seguro de algo con Git, **preguntá**. Es mejor tardar 5 minutos en preguntar que 2 horas arreglando un merge roto.

---

*Documento creado para el Parcial de Programación III — Mundial Web App (IES 9-023)*
