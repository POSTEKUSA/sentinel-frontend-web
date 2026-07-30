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
│   │   │   ├── services/            # Servicios de negocio
│   │   │   └── utils/               # Utilidades (fleet-analytics, etc.)
│   │   ├── features/                # Módulos funcionales (lazy-loaded)
│   │   │   ├── auth/                # Login
│   │   │   ├── dashboard/           # Vista General (Monitoreo)
│   │   │   ├── device-info/         # Detalle de Dispositivo
│   │   │   ├── device-list/         # Dispositivos (Monitoreo)
│   │   │   ├── device-map/          # Mapa (Monitoreo)
│   │   │   ├── pos-admin/           # Administración POS
│   │   │   │   ├── catalog/         #   Marcas
│   │   │   │   ├── purchase-orders/ #   Compras
│   │   │   │   ├── receiving/       #   Recepción
│   │   │   │   ├── inventory/       #   Inventario
│   │   │   │   └── merchants/       #   Comercios
│   │   │   └── pmt/                 # Control POS (en unificación)
│   │   │       ├── pmt-dashboard/   #   Vista General
│   │   │       ├── pmt-inventory/   #   Inventario
│   │   │       ├── pmt-bulk-upload/ #   Subir Inventario
│   │   │       ├── pmt-bodega/      #   Bodega
│   │   │       ├── pmt-pos-inyeccion/  # Inyección
│   │   │       ├── pmt-asignados/   #   Asignados
│   │   │       ├── pmt-reparacion/  #   Reparación
│   │   │       ├── pmt-garantia/    #   Garantía
│   │   │       ├── pmt-sim-cards/   #   SIM Cards
│   │   │       ├── pmt-query/       #   Merchant Config
│   │   │       ├── pmt-inicializaciones/ # Inicializaciones
│   │   │       ├── pmt-control-pos/ #   Tráfico
│   │   │       ├── pmt-solicitudes-equipo/ # Requisiciones
│   │   │       ├── pmt-solicitudes-soporte/ # Soporte
│   │   │       └── pmt-users/       #   Usuarios
│   │   ├── layout/                  # Shell (sidebar + header + content)
│   │   └── shared/                  # Componentes reutilizables
│   └── public/                      # Assets estáticos
├── docs/                            # Documentación del sistema
│   ├── caracteristicas.md           # Características y funcionalidad completa
│   └── ventas/                      # Material de presentación
└── pmt/                             # Proyecto PMT original (referencia)
```

---

## Módulos Principales

> 📄 Documentación detallada en [`docs/caracteristicas.md`](./docs/caracteristicas.md)

### 🛰️ Monitoreo
- **Vista General** — Dashboard ejecutivo con KPIs en tiempo real, desglose por organización y comercio, mapa de atención
- **Dispositivos** — Listado completo con búsqueda, filtros por estado, detalle individual con batería, red, GPS y telemetría
- **Mapa** — Mapa interactivo con geolocalización, marcadores por estado y popups informativos

### 🏪 Administración

**Administración POS:**
- **Marcas** — Catálogo de marcas, modelos, proveedores y accesorios
- **Compras** — Órdenes de compra con tracking de progreso de recepción
- **Recepción** — Ingreso de equipos individual y masivo (CSV) con detección de duplicados
- **Inventario** — Vista central por ubicación, custodia y accesorios
- **Comercios** — Gestión de afiliados con reporte por MCC

**Control POS (en proceso de unificación con Administración POS):**
- **Bodega** → **Inyección** → **Asignados** (supervisor/técnico) → instalación en campo
- **Reparación** con resolución (reparado, garantía, irreparable, obsoleto)
- **Garantía** con sustitución automática de serie
- **SIM Cards** — ICCID, compañía, estado, terminal asociada
- **Tráfico** — Monitor de transacciones ISO 8583
- **Subir Inventario** — Carga masiva CSV/JSON con mapeo inteligente
- **Requisiciones** — Solicitudes de equipo con flujo de aprobación
- **Soporte** — Tickets de soporte técnico con comentarios y estados
- **Usuarios** — Gestión de roles (Admin, Inventario, Supervisor, Técnico, Ejecutivo, Consulta)

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
| **dev** | `npm run dev` | Servidor de desarrollo en puerto 4200 |
| **start** | `npm run start` | Igual que `dev` |
| **build** | `npm run build` | Compila para producción |
| **build:pages** | `npm run build:pages` | Compila para GitHub Pages |
| **test** | `npm run test` | Ejecuta las pruebas |
| **lint** | `npm run lint` | Verifica estilo de código |

---

## Documentación

| Documento | Descripción |
|---|---|
| [`docs/caracteristicas.md`](./docs/caracteristicas.md) | Características completas: módulos, funcionalidades, procesos de negocio y ciclo de vida |

---

## Licencia

Propietario — **POSTEKUSA**. Todos los derechos reservados.  
© POSTEKUSA 1999 - 2026
