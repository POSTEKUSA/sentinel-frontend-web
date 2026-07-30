# POSTEK SENTINEL

**Sistema web de gestión integral para terminales de punto de venta (POS).**

Monitoreo en tiempo real de dispositivos en campo, administración de cadena de suministro, ciclo de vida de equipos, inventario de SIM Cards y soporte técnico — en una sola plataforma.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Angular 21 (Standalone Components) |
| **Lenguaje** | TypeScript 5.9 |
| **UI** | Angular Material 21 + Tailwind CSS 4 |
| **Tipografía** | Inter + JetBrains Mono (Fontsource) |
| **Mapas** | Leaflet 1.9 |
| **Reactivo** | RxJS 7.8 |
| **Build** | Angular CLI + Vite |
| **Linting** | ESLint + Prettier |
| **Testing** | Vitest + Jasmine |

> **Nota:** Este repositorio contiene exclusivamente el **frontend** (SPA). No incluye backend ni base de datos.

---

## Estructura del Proyecto

```
sentinel-frontend-web/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios, modelos, guardias, config
│   │   │   ├── config/              # Configuración de la aplicación
│   │   │   ├── guards/              # Guards de autenticación
│   │   │   ├── mock/                # Datos mock para desarrollo
│   │   │   ├── models/              # Interfaces y tipos TypeScript
│   │   │   ├── services/            # Servicios de negocio (telemetría, auth, PMT)
│   │   │   └── utils/               # Utilidades (fleet-analytics, etc.)
│   │   ├── features/                # Módulos funcionales (lazy-loaded)
│   │   │   ├── auth/                # Login
│   │   │   ├── dashboard/           # Dashboard de monitoreo
│   │   │   ├── device-info/         # Detalle de dispositivo
│   │   │   ├── device-list/         # Listado de dispositivos
│   │   │   ├── device-map/          # Mapa interactivo (Leaflet)
│   │   │   ├── pos-admin/           # Administración POS
│   │   │   │   ├── catalog/         #   Marcas, modelos, proveedores, accesorios
│   │   │   │   ├── purchase-orders/ #   Órdenes de compra
│   │   │   │   ├── receiving/       #   Recepción de equipos
│   │   │   │   ├── inventory/       #   Inventario central
│   │   │   │   └── merchants/       #   Gestión de comercios
│   │   │   └── pmt/                 # Control POS (ciclo de vida de terminales)
│   │   │       ├── pmt-dashboard/   #   Dashboard PMT
│   │   │       ├── pmt-inventory/   #   Inventario de terminales
│   │   │       ├── pmt-bulk-upload/ #   Carga masiva CSV/JSON
│   │   │       ├── pmt-bodega/      #   Control de bodega
│   │   │       ├── pmt-pos-inyeccion/  # Inyección de software
│   │   │       ├── pmt-asignados/   #   Terminales asignados
│   │   │       ├── pmt-reparacion/  #   Equipos en reparación
│   │   │       ├── pmt-garantia/    #   Garantía y sustitución de serie
│   │   │       ├── pmt-sim-cards/   #   Gestión de SIM Cards
│   │   │       ├── pmt-query/       #   Merchant Config (consultas)
│   │   │       ├── pmt-inicializaciones/ # Registro de inicializaciones
│   │   │       ├── pmt-control-pos/ #   Monitor de transacciones
│   │   │       ├── pmt-solicitudes-equipo/ # Requisiciones
│   │   │       ├── pmt-solicitudes-soporte/ # Tickets de soporte
│   │   │       └── pmt-users/       #   Gestión de usuarios
│   │   ├── layout/                  # Shell (sidebar + header + content)
│   │   └── shared/                  # Componentes reutilizables
│   │       ├── battery-indicator/
│   │       ├── busy-loader/
│   │       ├── confirm-dialog/
│   │       ├── empty-state/
│   │       └── status-badge/
│   └── public/                      # Assets estáticos
├── docs/                            # Documentación del sistema
│   └── caracteristicas.md           # Características y funcionalidad completa
└── pmt/                             # Proyecto PMT original (referencia)
    └── docs/                        # Documentación técnica PMT
```

---

## Características Principales

> 📄 Documentación detallada de todas las funcionalidades en [`docs/caracteristicas.md`](./docs/caracteristicas.md)

### 🛰️ Monitoreo de Flota
- Dashboard ejecutivo con KPIs en tiempo real (dispositivos online, retrasados, offline)
- Desglose por organización y por comercio con porcentajes
- Panel de dispositivos que requieren atención, ordenados por antigüedad
- Mapa interactivo con geolocalización del usuario y marcadores por estado
- Listado de dispositivos con búsqueda, filtros por estado y parámetros de URL
- Detalle individual: batería, red, ubicación GPS, historial de telemetría

### 🏪 Administración POS
- Catálogo de marcas, modelos, proveedores y accesorios
- Órdenes de compra con tracking de progreso de recepción
- Recepción de equipos individual y masiva (CSV) con detección de duplicados
- Inventario central con vistas por ubicación, custodia y accesorios
- Gestión de comercios afiliados con reporte por MCC

### 📱 Control POS (Ciclo de Vida de Terminales)
- **Bodega** → **Inyección** → **Asignación** (supervisor/técnico) → **Instalación**
- Reparación con resolución (reparado, garantía, irreparable, obsoleto)
- Garantía con sustitución de serie automática
- Gestión de SIM Cards (ICCID, compañía, estado, terminal asociada)
- Monitor de transacciones ISO 8583 con estadísticas
- Carga masiva de inventario (CSV / JSON) con mapeo inteligente de columnas
- Requisiciones de equipo con flujo de aprobación
- Tickets de soporte técnico con comentarios y estados
- Gestión de usuarios y roles (Admin, Inventario, Supervisor, Técnico, Ejecutivo, Consulta)

---

## Requisitos

- **Node.js** ≥ 20
- **npm** ≥ 11

---

## Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd sentinel-frontend-web

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo (http://localhost:4200)
npm run start
```

### Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| **dev** | `npm run dev` | Inicia servidor de desarrollo en puerto 4200 |
| **start** | `npm run start` | Igual que `dev` |
| **build** | `npm run build` | Compila para producción |
| **build:pages** | `npm run build:pages` | Compila con configuración para GitHub Pages |
| **test** | `npm run test` | Ejecuta las pruebas |
| **lint** | `npm run lint` | Verifica estilo de código con ESLint |
| **watch** | `npm run watch` | Compila en modo watch para desarrollo |

---

## Documentación

| Documento | Descripción |
|---|---|
| [`docs/caracteristicas.md`](./docs/caracteristicas.md) | Características completas del sistema: módulos, funcionalidades, procesos de negocio y ciclo de vida de terminales |

---

## Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                        Angular App                              │
│                                                                 │
│  ┌─────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Core   │  │   Features   │  │         Layout            │  │
│  │         │  │              │  │                           │  │
│  │ Guards  │  │  Dashboard   │  │  Shell (Sidebar + Header) │  │
│  │ Models  │  │  Devices     │  │                           │  │
│  │ Services│  │  POS Admin   │  └───────────────────────────┘  │
│  │ Utils   │  │  PMT         │                                 │
│  │ Config  │  │  Auth        │  ┌───────────────────────────┐  │
│  │ Mock    │  │              │  │        Shared             │  │
│  └─────────┘  └──────────────┘  │  StatusBadge, Battery,   │  │
│                                  │  BusyLoader, EmptyState,  │  │
│                                  │  ConfirmDialog            │  │
│                                  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

- **Core:** Servicios singleton, modelos, guardias de autenticación, configuración y datos mock.
- **Features:** Módulos funcionales cargados de forma lazy. Cada módulo es un standalone component con su template, estilos y lógica.
- **Layout:** Shell principal con sidebar colapsable, header con breadcrumb, y area de contenido.
- **Shared:** Componentes reutilizables sin lógica de negocio.

---

## Licencia

Propietario — **POSTEKUSA**. Todos los derechos reservados.  
© POSTEKUSA 1999 - 2026
