# 🏆 Mundial Web App - Módulo Estadísticas

Plataforma web orientada a la gestión y visualización de datos históricos y estadísticas del Mundial de Fútbol. Desarrollada bajo arquitectura MVC.

## Características Principales
* **Autenticación:** Registro, login y logout con protección de rutas (Roles: Admin, User).
* **Gestión de Estadísticas (CRUD):** Creación, lectura, actualización y eliminación de métricas deportivas.
* **Dashboard Interactivo:** Visualización de datos y filtros avanzados.
* **Predicción IA (Extra):** Endpoint predictivo basado en datos históricos (WIP).

## Tecnologías Utilizadas
**Frontend**
* React.js (Uso de Hooks: useState, useEffect, useContext y custom hooks).
* Tailwind CSS / shadcn/ui.
* Recharts.

**Backend & Base de Datos**
* Python + Flask.
* MySQL.
* JWT para autenticación de sesiones.
* Arquitectura Orientada a Objetos (POO).

## Instrucciones de Instalación
*(Aquí agregaremos los comandos `npm install`, `pip install -r requirements.txt` y configuración del archivo `.env` más adelante)*

## Diagrama UML
*(Insertar imagen del diagrama UML de clases aquí)*
*El diagrama refleja la aplicación de conceptos de Encapsulamiento, Herencia y Polimorfismo en el Backend.*

## Integrantes
* **Matías Nahuel Ghilardi Salinas** - Módulo: Estadísticas

## Estrategia de Ramas (Git / GitHub)

Para mantener el orden, evitar conflictos y cumplir con las buenas prácticas de control de versiones, utilizaremos la siguiente estructura de ramas:

* **`main`**: Rama principal y protegida. Solo contiene código funcional y estable listo para producción.
* **`dev`**: Rama de desarrollo e integración. Aquí se fusionan los cambios aprobados de cada desarrollador antes de pasar a `main`.
* **`Nahuel_Develop` / `Gustavo_Develop`**: Ramas personales de cada desarrollador. Se utilizan para cambios estructurales de los módulos asignados, actualizaciones del `README.md`, configuración del `.gitignore`, etc.
* **`feature/*`**: Ramas efímeras creadas a partir de la rama del desarrollador para trabajar en características específicas (ej: `feature/crud-estadisticas`).

## Flujo de Trabajo (Diagrama)

```mermaid
graph TD
    A[main] -->|Protegida| B(dev)
    B -->|Entorno de| C(Nahuel_Develop)
    B -->|Entorno de| D(Gustavo_Develop)
    
    C -->|Creación| E(feature/login)
    C -->|Creación| F(feature/api-estadisticas)
    
    D -->|Creación| G(feature/crud-jugadores)
    
    E -.->|Pull Request| C
    F -.->|Pull Request| C
    G -.->|Pull Request| D
    
    C -.->|Pull Request| B
    D -.->|Pull Request| B
    
    B -.->|Merge final| A
    
    classDef mainBranch fill:#f96,stroke:#333,stroke-width:2px;
    classDef devBranch fill:#69b3a2,stroke:#333,stroke-width:2px;
    classDef userBranch fill:#6baed6,stroke:#333,stroke-width:2px;
    classDef featureBranch fill:#cccccc,stroke:#333,stroke-width:2px;
    
    class A mainBranch;
    class B devBranch;
    class C,D userBranch;
    class E,F,G featureBranch;

## 📅 Roadmap del Proyecto (Deadline: 23/06/2026)
- [ ] **Fase 1:** Diseño de BD y Diagrama UML de Clases.
- [ ] **Fase 2:** Configuración de repositorios y entornos (Flask + React).
- [ ] **Fase 3:** Backend Core (Autenticación JWT y CRUD de Estadísticas).
- [ ] **Fase 4:** Frontend Core (Rutas, Contexto de Auth y Formularios).
- [ ] **Fase 5:** Dashboard, Gráficos y Consumo de API REST.
- [ ] **Fase 6 (Opcional):** Integración de modelo de predicción (Scikit-learn/Flask).
- [ ] **Fase 7:** Despliegue en producción (Vercel + Render + DB Cloud).