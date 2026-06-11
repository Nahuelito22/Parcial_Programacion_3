# BEST_PRACTICES.md — Buenas Prácticas y Estándares de Calidad

> Este documento define los estándares de calidad del equipo y las pautas para el uso responsable de inteligencia artificial en el desarrollo del proyecto **Mundial Web App — Parcial Programación III**.

---

## 1. Guía de Uso de IA y Agentes de Código

### Principio fundamental

> **La IA es una herramienta, no un reemplazo.** Vos sos el desarrollador. La IA te asiste, pero la responsabilidad del código es tuya.

### Reglas de uso

#### ✅ Lo que SÍ hacer:

1. **Pedir tareas atómicas** — Siempre dar instrucciones pequeñas y específicas.
   - ✅ *"Creá un componente de botón con estas propiedades: ..."*
   - ❌ *"Hacé toda la página de login con autenticación"*

2. **Entender antes de implementar** — Nunca copies código que no entiendas.
   - Si la IA genera algo y no sabés qué hace, **preguntale que te lo explique**.
   - Si después de la explicación seguís sin entender, **pedí ayuda a un compañero**.

3. **Dar contexto** — Cuanto más contexto le des a la IA, mejor resultado obtenés.
   - Mencioná qué tecnologías usás (React, Flask, MySQL, JWT)
   - Describí qué querés lograr, no solo qué código querés
   - Compartí archivos relevantes si es necesario

4. **Iterar** — Si el primer resultado no es perfecto, refiná el pedido.
   - *"Está bien, pero cambiale X por Y"*
   - *"Ahora agregale manejo de errores"*

#### ❌ Lo que NO hacer:

1. **No pedir todo junto** — Las tareas grandes generan código de baja calidad.
2. **No confiar ciegamente** — La IA puede generar código incorrecto, inseguro o ineficiente.
3. **No copiar y pegar sin revisar** — Siempre leé y entendé el código antes de usarlo.
4. **No usar IA para saltear el aprendizaje** — Si no sabés CSS, aprendé CSS. La IA te ayuda a practicar, no a evitar.

### Flujo recomendado con IA

```
1. Definí qué querés hacer (en español, claro y específico)
       │
2. Pedile a la IA una tarea atómica
       │
3. Revisá el código generado
       │
4. ¿Lo entendés? ──── No ──── Pedí explicación
       │                              │
      Sí                         ¿Lo entendés ahora?
       │                              │
5. Probalo en local              No ──── Pedí ayuda humana
       │                              │
6. ¿Funciona? ──── No ──── Iterá con la IA (explicale qué falló)
       │
      Sí
       │
7. Commiteá y seguí con la próxima tarea
```

---

## 2. Estándares de Calidad y Testing

### La regla de oro

> ⚠️ **Siempre testeá en local antes de cualquier push al repositorio remoto.**

No importa qué tan seguro estés de que "funciona". Abrí tu navegador, revisá que todo se vea bien y que no se rompió nada.

### Checklist Frontend (React) antes de hacer push

- [ ] `pnpm dev` funciona sin errores
- [ ] Revisé visualmente la página en el navegador
- [ ] Probé en al menos **1 navegador** (Chrome, Firefox o Edge)
- [ ] No hay errores en la consola del navegador (F12 → Console)
- [ ] Los cambios no rompen funcionalidad existente
- [ ] Eliminé código de debug (`console.log`, comentarios temporales)
- [ ] El código sigue las convenciones del equipo (ver abajo)

### Checklist Backend (Flask) antes de hacer push

- [ ] `flask run` o `python app.py` arranca sin errores
- [ ] Probé los endpoints afectados con Postman, Thunder Client o `curl`
- [ ] Las respuestas JSON tienen la estructura esperada
- [ ] Los endpoints protegidos rechazan peticiones sin JWT válido
- [ ] No hay `print()` de debug olvidados en el código
- [ ] Las queries SQL están parametrizadas (sin concatenación de strings)

### Antes de crear un Pull Request (adicional)

- [ ] `pnpm build` compila sin errores (Frontend)
- [ ] Probé en **vista móvil** (F12 → Toggle Device Toolbar)
- [ ] Los textos visibles están en **español** (interfaz de usuario)
- [ ] El código (variables, funciones) está en **inglés**

---

## 3. Convenciones de Código

### Idiomas

| Qué | Idioma | Ejemplo |
|-----|--------|---------|
| Variables y funciones (JS/TS) | Inglés | `getUserData()`, `isLoading` |
| Variables y funciones (Python) | Inglés | `get_user_data()`, `is_loading` |
| Componentes React | Inglés | `NavBar.tsx`, `LoginForm.tsx` |
| Clases Python | Inglés | `TeamStatistic`, `PlayerStatistic` |
| Comentarios en código | Inglés | `// Fetch stats from API`, `# Calculate performance` |
| Interfaz de usuario (textos visibles) | Español | `"Iniciar Sesión"`, `"Bienvenido"` |
| Documentación del proyecto | Español | README.md, GIT_GUIDELINES.md |
| Commits | Inglés | `feat: add login component` |

### Formato de archivos

- **Indentación:** 2 espacios en JS/TS/JSX, 4 espacios en Python (PEP 8)
- **Fin de línea:** LF (Unix)
- **Encoding:** UTF-8
- **Punto y coma:** Sí en TypeScript/JavaScript
- **Comillas:** Simples (`'`) en JS/TS, dobles (`"`) en HTML y Python

### Nombres de archivos

| Tipo | Convención | Ejemplo |
|------|-----------|---------| 
| Componentes React | PascalCase | `NavBar.tsx`, `StatsCard.tsx` |
| Páginas React | PascalCase | `Dashboard.tsx`, `Login.tsx` |
| Custom Hooks | camelCase con `use` | `useAuth.ts`, `useFetch.ts` |
| Contextos | PascalCase con `Context` | `AuthContext.tsx` |
| Utilidades JS/TS | camelCase | `formatDate.ts`, `apiClient.ts` |
| Estilos | kebab-case | `global-styles.css` |
| Modelos Python | PascalCase | `team_statistic.py` (clase `TeamStatistic`) |
| Rutas Flask | snake_case | `auth_routes.py`, `stats_routes.py` |
| Controladores Flask | snake_case | `stats_controller.py` |

---

## 4. Seguridad

### 4.1 Reglas fundamentales

1. **Nunca subir secrets al repositorio** — Las API keys, tokens y contraseñas van en `.env` (que está en `.gitignore`)
2. **Usar `.env.example`** — Crear un archivo de ejemplo con las variables necesarias pero **sin valores reales**
3. **Validar inputs** — Nunca confiar en datos que vienen del usuario sin validar (tanto en Frontend como Backend)
4. **Parametrizar queries SQL** — **NUNCA** concatenar strings para armar queries. Siempre usar placeholders (`%s` en MySQL)

### 4.2 Gestor de paquetes: pnpm (Mitigación de Supply Chain Attacks)

> ⚠️ **Usamos `pnpm` obligatoriamente en lugar de `npm` para el Frontend.**

#### ¿Por qué?

En 2025, paquetes populares como **axios** fueron comprometidos a través de ataques de cadena de suministro (supply chain attacks). Un atacante logró inyectar código malicioso en dependencias que, gracias a la estructura **plana** de `node_modules` de `npm`, quedaban accesibles para cualquier paquete del proyecto — incluso si no las declaraban como dependencia directa.

#### ¿Cómo nos protege pnpm?

| Característica | npm | pnpm |
|---|---|---|
| Estructura de `node_modules` | Plana (hoisting) — todos los paquetes acceden a todo | **Estricta** — cada paquete solo accede a sus dependencias declaradas |
| Acceso a dependencias no declaradas | ✅ Permitido (phantom dependencies) | ❌ **Bloqueado** |
| Almacenamiento | Copia completa por proyecto | **Content-addressable store** (ahorra disco y es verificable) |
| Integridad | `package-lock.json` | `pnpm-lock.yaml` + verificación de checksums más estricta |

#### Comandos de pnpm

```bash
# Instalar dependencias
pnpm install

# Agregar una dependencia
pnpm add axios

# Agregar dependencia de desarrollo
pnpm add -D @types/react

# Ejecutar scripts
pnpm dev          # equivale a npm run dev
pnpm build        # equivale a npm run build

# Ejecutar binarios (equivale a npx)
pnpm dlx create-react-app ./
```

> 💡 **Regla:** Si ves un tutorial o documentación que usa `npm install`, traducilo mentalmente a `pnpm install`. La API es casi idéntica.

### 4.3 Seguridad en el Backend (Flask)

1. **SQL Injection** — Siempre usar queries parametrizadas:
   ```python
   # ✅ CORRECTO
   cursor.execute("SELECT * FROM players WHERE id = %s", (player_id,))

   # ❌ INCORRECTO — vulnerable a SQL injection
   cursor.execute(f"SELECT * FROM players WHERE id = {player_id}")
   ```

2. **CORS** — Configurar Flask-CORS para permitir solo el origen del frontend:
   ```python
   from flask_cors import CORS
   CORS(app, origins=["http://localhost:5173"])  # URL de Vite dev server
   ```

3. **JWT** — No almacenar tokens en `localStorage` si es posible. Preferir `httpOnly cookies`.

4. **Contraseñas** — Siempre hashear con `bcrypt` o `werkzeug.security`. Nunca guardar en texto plano.

### 4.4 Ejemplo de `.env.example`

```env
# Flask
FLASK_APP=app.py
FLASK_ENV=development
FLASK_SECRET_KEY=tu_secret_key_aqui

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password_aqui
MYSQL_DATABASE=mundial_db

# JWT
JWT_SECRET_KEY=tu_jwt_secret_aqui
JWT_ACCESS_TOKEN_EXPIRES=3600

# Frontend (React / Vite)
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Comunicación del Equipo

- **Antes de empezar algo nuevo:** Avisá en qué vas a trabajar para evitar conflictos
- **Si encontrás un bug:** Reportalo con contexto (qué hiciste, qué esperabas, qué pasó)
- **Si estás trabado:** Pedí ayuda. No pierdas horas en algo que un compañero puede resolver en 5 minutos
- **Si rompiste algo:** Avisá inmediatamente. Todos nos equivocamos, lo importante es no ocultar errores

---

*Documento creado para el Parcial de Programación III — Mundial Web App (IES 9-023)*
