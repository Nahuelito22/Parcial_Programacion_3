# Proyecto: Mundial Web App — Parcial Programación III

## Contexto
Aplicación web para la gestión y visualización de datos históricos y estadísticas del Mundial de Fútbol.
Desarrollada como parcial de la materia **Programación III** del IES 9-023.
Arquitectura **MVC** con React (Frontend) y Flask (Backend).

## Stack Tecnológico
- **Frontend**: React.js (Hooks: useState, useEffect, useContext, custom hooks)
- **UI**: Tailwind CSS / shadcn/ui + Recharts (gráficos)
- **Backend**: Python + Flask (API REST)
- **Base de Datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Gestor de paquetes**: pnpm (ver nota de seguridad abajo)
- **Control de versiones**: Git / GitHub

## Gestor de Paquetes: pnpm (Obligatorio)
> **⚠️ Seguridad:** Usamos `pnpm` en lugar de `npm` como medida preventiva contra ataques de cadena de suministro (supply chain attacks).
> Un caso real fue el incidente de `axios` donde paquetes comprometidos se infiltraron via dependencias planas de `npm`.
> `pnpm` mitiga esto mediante su estructura de `node_modules` no plana (content-addressable storage), que impide que paquetes accedan a dependencias que no declararon explícitamente.

Comandos equivalentes:
```
npm install   →  pnpm install
npm run dev   →  pnpm dev
npm run build →  pnpm build
npx           →  pnpm dlx
```

## Reglas de Desarrollo
- Idioma del código (variables, funciones, componentes, commits): **inglés**
- Idioma de documentación y comentarios de usuario: **español**
- Preferir TypeScript sobre JavaScript en el Frontend cuando sea posible
- Backend en Python con convenciones PEP 8 (snake_case para funciones/variables, PascalCase para clases)
- Nunca hacer merge ni push directo a `main` — siempre vía Pull Request
- Testear en local antes de cualquier push
- Seguir la arquitectura MVC en Flask

## Flujo de Ramas
```
[Nombre]_Develop → test local OK → PR a dev → test OK → PR a main (Producción)
```

## Estructura del Proyecto
```
Mundial-Web-App/
├── frontend/                # Proyecto React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Vistas/páginas
│   │   ├── hooks/           # Custom hooks (useAuth, useFetch, etc.)
│   │   ├── context/         # Contexts (AuthContext, etc.)
│   │   ├── services/        # Lógica de consumo de API (fetch/axios)
│   │   ├── styles/          # CSS / Tailwind config
│   │   └── utils/           # Helpers y utilidades
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── vite.config.ts
├── backend/                 # Proyecto Flask
│   ├── app/
│   │   ├── models/          # Clases POO (Estadistica, EstadisticaEquipo, etc.)
│   │   ├── controllers/     # Controladores MVC
│   │   ├── routes/          # Rutas/endpoints de la API REST
│   │   └── utils/           # Helpers (JWT, validación, etc.)
│   ├── requirements.txt
│   ├── app.py               # Entry point de Flask
│   └── config.py            # Configuración de la app
├── .env.example             # Variables de entorno de ejemplo (SIN secrets)
├── .gitignore
├── README.md
├── GIT_GUIDELINES.md        # Guía de contribución y control de versiones
├── BEST_PRACTICES.md        # Buenas prácticas, testing y uso de IA
└── GEMINI.md                # Este archivo (contexto para el agente IA)
```
> **Nota:** Esta estructura se completará cuando se inicialicen los proyectos React y Flask.

## Archivos Importantes
- `GIT_GUIDELINES.md` — Reglas de ramas, commits y Pull Requests
- `BEST_PRACTICES.md` — Estándares de calidad, testing, seguridad y uso de IA
- `.env.example` — Template de variables de entorno (SIN secrets)

## Notas para el Agente
- La carpeta `ayudas_y_recursos/` es personal y está ignorada por git. No la modifiques.
- La carpeta `.gemini/` es configuración personal del agente. Está ignorada por git.
- Este es un proyecto de parcial universitario con 2 desarrolladores junior — priorizar claridad y simplicidad.
- Ante la duda, pedir confirmación antes de hacer cambios destructivos.
- El deadline del proyecto es el **23/06/2026**.
- El docente es Cristian Pietrobon (cristian.pietrobon@ies9023.net).
