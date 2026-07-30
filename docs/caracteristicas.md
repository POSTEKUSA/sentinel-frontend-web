# Características del Sistema — POSTEK SENTINEL

**Versión:** 2026.5.22.0  
**Plataforma:** Aplicación Web (SPA)  
**Tecnología:** Angular 21 + TypeScript + Angular Material + Tailwind CSS

---

## Índice

1. [Visión General](#1-visión-general)
2. [Autenticación](#2-autenticación)
3. [Monitoreo](#3-monitoreo)
   - 3.1 [Vista General](#31-vista-general)
   - 3.2 [Dispositivos](#32-dispositivos)
   - 3.3 [Mapa](#33-mapa)
4. [Administración](#4-administración)
   - 4.1 [Marcas](#41-marcas)
   - 4.2 [Compras](#42-compras)
   - 4.3 [Recepción](#43-recepción)
   - 4.4 [Inventario (Administración)](#44-inventario-administración)
   - 4.5 [Comercios](#45-comercios)
   - 4.6 [Vista General (Control POS)](#46-vista-general-control-pos)
   - 4.7 [Inventario (Control POS)](#47-inventario-control-pos)
   - 4.8 [Subir Inventario](#48-subir-inventario)
   - 4.9 [Bodega](#49-bodega)
   - 4.10 [Inyección](#410-inyección)
   - 4.11 [Asignados](#411-asignados)
   - 4.12 [Reparación](#412-reparación)
   - 4.13 [Garantía](#413-garantía)
   - 4.14 [SIM Cards](#414-sim-cards)
   - 4.15 [Merchant Config](#415-merchant-config)
   - 4.16 [Inicializaciones](#416-inicializaciones)
   - 4.17 [Tráfico](#417-tráfico)
   - 4.18 [Requisiciones](#418-requisiciones)
   - 4.19 [Soporte](#419-soporte)
   - 4.20 [Usuarios](#420-usuarios)
5. [Ciclo de Vida de una Terminal POS](#5-ciclo-de-vida-de-una-terminal-pos)
6. [Componentes Compartidos](#6-componentes-compartidos)

---

## 1. Visión General

**POSTEK SENTINEL** es un sistema web de gestión integral para la operación de terminales de punto de venta (POS). Abarca desde el monitoreo en tiempo real de dispositivos desplegados en campo, hasta la administración completa de la cadena de suministro, ciclo de vida de equipos y soporte técnico.

El sistema está organizado en **dos módulos principales**:

| Módulo | Propósito |
|---|---|
| **Monitoreo** | Supervisión en tiempo real del estado, ubicación y salud de dispositivos POS desplegados en campo |
| **Administración** | Gestión de catálogos, órdenes de compra, recepción, inventario, comercios afiliados, ciclo de vida completo de terminales (bodega → inyección → asignación → instalación → soporte → retiro/garantía), SIM Cards, transacciones y soporte técnico |

> **Nota:** El módulo de Administración unifica la gestión de POS (Administración POS) con el sistema de Control POS (anteriormente conocido como PMT Control POS), consolidando toda la operación en una sola plataforma.

---

## 2. Autenticación

### Funcionalidad
- Inicio de sesión con correo electrónico y contraseña.
- Protección de rutas mediante guardias de autenticación (`authGuard` / `guestGuard`).
- Redirección automática: los usuarios no autenticados son redirigidos al login; los ya autenticados son redirigidos al dashboard.
- Cierre de sesión con indicador visual de progreso.

### Proceso Operativo
1. El usuario accede a la aplicación.
2. Si no tiene sesión activa, se presenta la pantalla de login.
3. Al ingresar credenciales válidas, se establece la sesión y se redirige a la Vista General.
4. La sesión persiste durante la navegación hasta que el usuario cierra sesión manualmente.

---

## 3. Monitoreo

El módulo de **Monitoreo** permite supervisar en tiempo real toda la flota de dispositivos POS desplegados en campo.

### 3.1 Vista General

**Ruta:** `/dashboard` · **Navbar:** Monitoreo → Vista General

#### Descripción
Panel de control ejecutivo que presenta un resumen en tiempo real del estado de toda la flota de dispositivos POS. Es la primera vista tras iniciar sesión.

#### Funcionalidades
- **KPIs de estado:** Tarjetas con el total de dispositivos, cantidad en línea, retrasados y fuera de línea, con porcentaje de cada estado. Cada tarjeta es clickeable y filtra el listado al estado correspondiente.
- **Desglose por organización (tenant):** Tabla que agrupa dispositivos por entidad organizacional, mostrando cantidad y porcentaje por cada estado.
- **Desglose por comercio (merchant):** Tabla que agrupa por comercio afiliado.
- **Panel "Requiere atención":** Lista los dispositivos que no están en línea, ordenados por antigüedad del último heartbeat. Muestra alias, batería, última conexión y estado.
- **Mapa de atención:** Mapa interactivo (Leaflet) con la ubicación de los dispositivos que requieren atención. Se puede maximizar a pantalla completa.
- **Auto-actualización:** Los datos se refrescan automáticamente cada 30 segundos con indicador de frescura.

#### Proceso de Negocio
Permite al equipo de operaciones identificar rápidamente cuáles dispositivos necesitan intervención, cuáles zonas tienen problemas de conectividad y cuál es el estado general de la flota.

---

### 3.2 Dispositivos

**Ruta:** `/device-list` · **Navbar:** Monitoreo → Dispositivos

#### Descripción
Vista tabular completa de todos los dispositivos de la flota con capacidades avanzadas de filtrado y búsqueda.

#### Funcionalidades
- **Búsqueda global:** Filtra por alias, ID de dispositivo, comercio u organización.
- **Filtros por estado:** Botones para filtrar por todos, en línea, retrasados o fuera de línea.
- **Filtros por URL:** Se puede acceder con filtros pre-aplicados desde otras vistas (por organización, comercio, estado o sincronización obsoleta).
- **Información por dispositivo:** ID, alias, batería (indicador visual), última conexión (tiempo relativo), estado (badge de color) y enlace al detalle.

#### Detalle de Dispositivo

**Ruta:** `/device-info/:id`

Vista individual con toda la información técnica del dispositivo: metadatos, salud (batería, red, cobertura), ubicación GPS, último heartbeat, historial de eventos de telemetría (latido, ubicación, salud, sincronización) con datos crudos expandibles en JSON.

---

### 3.3 Mapa

**Ruta:** `/device-map` · **Navbar:** Monitoreo → Mapa

#### Descripción
Mapa interactivo de pantalla completa que muestra la ubicación geográfica de todos los dispositivos.

#### Funcionalidades
- **Mapa interactivo (Leaflet):** Tiles de CartoDB Voyager.
- **Marcadores por estado:** Verde = en línea (con pulso animado), amarillo = retrasado, rojo = fuera de línea.
- **Popups informativos:** Alias, ID, batería, tipo de red, última conexión, estado y enlace al detalle.
- **Geolocalización del usuario:** Marcador azul con efecto de pulso.
- **Filtro por dispositivo:** Se puede centrar en un dispositivo específico vía `?deviceId=X`.
- **Centrado inteligente:** Se centra en la ubicación del usuario o ajusta los bounds para mostrar todos los dispositivos.

#### Proceso Operativo
El supervisor puede ver dónde están físicamente todos los equipos, detectar patrones geográficos de desconexión y planificar visitas de mantenimiento en campo.

---

## 4. Administración

El módulo de **Administración** gestiona toda la cadena de suministro y ciclo de vida de los equipos POS. Incluye la gestión de catálogos y compras (Administración POS) y el control operativo de terminales (Control POS, anteriormente PMT).

---

### 4.1 Marcas

**Ruta:** `/pos-admin/catalog` · **Navbar:** Administración → Marcas

#### Descripción
Gestión del catálogo maestro de marcas, modelos, proveedores y accesorios de terminales POS.

#### Funcionalidades
- **Tres pestañas:** Marcas/Modelos, Proveedores, Accesorios.
- **Marcas y modelos:** Alta, edición y eliminación con tipo de POS y estado (activo, obsoleto, descontinuado).
- **Proveedores:** Gestión de proveedores con marcas y modelos que suministran.
- **Accesorios:** Catálogo de accesorios con categorías y compatibilidad.
- **Eliminación con confirmación:** Diálogo de confirmación para acciones destructivas.

#### Proceso de Negocio
El catálogo se mantiene actualizado antes de registrar equipos o crear órdenes de compra, asegurando consistencia de datos en todo el sistema.

---

### 4.2 Compras

**Ruta:** `/pos-admin/purchase-orders` · **Navbar:** Administración → Compras

#### Descripción
Gestión del proceso de compra de terminales POS y accesorios.

#### Funcionalidades
- **Listado de órdenes:** Número de orden, proveedor, estado, progreso de recepción (barra visual), fecha.
- **Filtros avanzados:** Por número, proveedor, estado, marca, modelo y ubicación de entrega.
- **Estados:** Creada → En tránsito → Parcialmente recibida → Recibida → Cerrada / Cancelada.
- **Formulario de orden:** Proveedor, fecha estimada, ubicación de entrega y líneas de detalle (marca, modelo, cantidad).
- **Progreso automático:** Se actualiza conforme se reciben equipos en el módulo de Recepción.

---

### 4.3 Recepción

**Ruta:** `/pos-admin/receiving` · **Navbar:** Administración → Recepción

#### Descripción
Registro de entrada de equipos POS al inventario, individual o masivamente.

#### Funcionalidades
- **Recepción individual:** Formulario por número de serie, marca, modelo, tipo de POS, ubicación y condición inicial.
- **Recepción masiva (CSV):** Carga de archivo con validación previa (equipos válidos, duplicados, errores) antes de confirmar.
- **Vinculación a orden de compra:** Actualización automática de cantidades recibidas.
- **Plantilla descargable:** CSV de ejemplo con el formato esperado.
- **Detección de duplicados:** Rechaza series ya registradas.

#### Proceso de Negocio
1. Llegan equipos del proveedor.
2. El operador registra cada equipo individualmente o carga un CSV.
3. El sistema valida, detecta duplicados y registra los equipos.
4. Las cantidades se reflejan automáticamente en la orden de compra.

---

### 4.4 Inventario (Administración)

**Ruta:** `/pos-admin/inventory` · **Navbar:** Administración → Inventario

#### Descripción
Vista consolidada del inventario de equipos POS y accesorios.

#### Funcionalidades
- **Cuatro pestañas:**
  - **Inventario Central:** Listado completo con filtros, estado, ubicación y fecha.
  - **Por Ubicación:** Agrupación por ubicación física.
  - **Custodia:** Control de equipos asignados a personal con diálogo de asignación.
  - **Accesorios:** Stock con movimientos de entrada/salida.

---

### 4.5 Comercios

**Ruta:** `/pos-admin/merchants` · **Navbar:** Administración → Comercios

#### Descripción
Administración de los comercios afiliados donde se instalan las terminales.

#### Funcionalidades
- **Dos pestañas:** Comercios y Reporte MCC (distribución por código de categoría con gráficas de barra).
- **Filtros avanzados:** Por código de afiliado, nombre comercial, MCC, departamento, municipio y estado.
- **Detalle de comercio:** Razón social, NIT, representante, dirección, contacto.
- **Creación de comercios:** Diálogo con todos los datos fiscales y de ubicación.

---

### 4.6 Vista General (Control POS)

**Ruta:** `/pmt/dashboard` · **Navbar:** OLD Control POS → Vista General

#### Descripción
Panel de control con indicadores clave del estado del inventario de terminales y SIM Cards.

#### Funcionalidades
- **KPIs primarios:** En bodega, en inyección, instalados.
- **KPIs secundarios:** Asignados a supervisor/técnico, en reparación, en garantía.
- **KPIs terciarios:** Retirados, irreparables, obsoletos, serie sustituida.
- **Distribución por zona:** Gráfico de barras (top 8 zonas).
- **Distribución por modelo:** Top 6 modelos.
- **Estadísticas de SIM Cards:** Total, disponibles, asignadas e instaladas por compañía.
- **Actividad reciente:** Últimos 8 eventos de tracking.

---

### 4.7 Inventario (Control POS)

**Ruta:** `/pmt/inventory` · **Navbar:** OLD Control POS → Inventario

#### Descripción
Gestión completa del inventario de terminales POS con operaciones CRUD y consulta de historial.

#### Funcionalidades
- **Listado paginado:** 50 terminales por página.
- **Filtros:** Búsqueda global (serie, modelo, nombre, inventario, zona, ciudad), estado, zona y modelo.
- **Alta de terminal:** Serie, inventario, modelo, estado, zona, caja, inyectado, fecha, nombre, dirección, ciudad.
- **Edición y eliminación** con confirmación.
- **Historial del terminal:** Cambios de estado (tracking) y eventos del ciclo de vida (instalaciones/retiros).

---

### 4.8 Subir Inventario

**Ruta:** `/pmt/bulk-upload` · **Navbar:** OLD Control POS → Subir Inventario

#### Descripción
Importación masiva de terminales desde archivos CSV o datos JSON.

#### Funcionalidades
- **CSV:** Carga de archivo con mapeo automático de columnas (acepta nombres en español e inglés).
- **JSON:** Pegado directo de un array JSON.
- **Mapeo inteligente:** Reconoce variaciones de nombres de columna y estados legibles.
- **Vista previa** antes de confirmar.
- **Plantilla descargable** con columnas y filas de ejemplo.

---

### 4.9 Bodega

**Ruta:** `/pmt/bodega` · **Navbar:** OLD Control POS → Bodega

#### Descripción
Control del inventario en almacén — terminales con estado `en_bodega`.

#### Funcionalidades
- **Filtros exactos:** Serie, inventario, modelo, caja, estado de inyección.
- **Selección múltiple** con checkboxes.
- **Acciones masivas:**
  - **Enviar a inyección:** Cambia a `en_inyeccion`.
  - **Asignar:** Asigna a supervisor o técnico con nombre y comentario.
  - **Enviar a reparación:** Mueve a `en_reparacion`.

#### Proceso de Negocio
La bodega es el punto de partida del ciclo de vida. Desde aquí los equipos se envían a inyección, se asignan a personal, o se mueven a reparación.

---

### 4.10 Inyección

**Ruta:** `/pmt/pos-inyeccion` · **Navbar:** OLD Control POS → Inyección

#### Descripción
Seguimiento de terminales en proceso de inyección de software.

#### Funcionalidades
- **Listado filtrado:** Solo terminales en estado `en_inyeccion`.
- **Búsqueda:** Por serie, modelo o zona.
- **Selección masiva** para procesamiento en lote.
- **Marcar salida de inyección:** Cambia a `asignado_supervisor`.

#### Proceso de Negocio
Después de bodega, el equipo pasa por inyección donde se instala software, certificados y configuración de comunicaciones. Una vez completo, está listo para asignación.

---

### 4.11 Asignados

**Ruta:** `/pmt/asignados` · **Navbar:** OLD Control POS → Asignados

#### Descripción
Vista de terminales actualmente asignados a supervisores y técnicos.

#### Funcionalidades
- **Dos pestañas:** Supervisor / Técnico, con contadores.
- **Filtros:** Búsqueda global y filtro por persona asignada.
- **Reasignación:** De una persona a otra con registro del cambio.
- **Historial de asignaciones:** Todas las asignaciones históricas de un terminal.

---

### 4.12 Reparación

**Ruta:** `/pmt/reparacion` · **Navbar:** OLD Control POS → Reparación

#### Descripción
Gestión de terminales en proceso de reparación.

#### Funcionalidades
- **Listado filtrado:** Solo terminales en `en_reparacion`.
- **Resolución** con opciones: Reparado (instalado), Garantía, Irreparable, Obsoleto.
- **Comentario de resolución** registrado en tracking.

---

### 4.13 Garantía

**Ruta:** `/pmt/garantia` · **Navbar:** OLD Control POS → Garantía

#### Descripción
Control de terminales enviados a garantía con el fabricante.

#### Funcionalidades
- **Sustitución de serie:** Serie vieja → `serie_sustituida`, serie nueva → `en_bodega` automáticamente.
- **Retiro:** Marcar como `retirado` si no se sustituye.

#### Proceso de Negocio
El fabricante puede reparar y devolver o sustituir. La sustitución mantiene trazabilidad completa: la serie vieja queda marcada y la nueva entra al inventario.

---

### 4.14 SIM Cards

**Ruta:** `/pmt/sim-cards` · **Navbar:** OLD Control POS → SIM Cards

#### Descripción
Gestión del inventario de tarjetas SIM para conectividad de las terminales.

#### Funcionalidades
- **Filtros:** Por ICCID, número, terminal, persona asignada, estado y compañía.
- **Alta y edición:** ICCID, número, compañía (Claro, Tigo, Postek), estado, terminal, APN, IP y notas.
- **Estados:** Disponible, asignada, instalada, dañada, retirada.

---

### 4.15 Merchant Config

**Ruta:** `/pmt/query` · **Navbar:** OLD Control POS → Merchant Config

#### Descripción
Consulta de registros de configuración de comercios asociados a terminales.

#### Funcionalidades
- **Listado paginado:** 50 registros por página.
- **Filtros:** Terminal, código, comercio, ciudad, zona.
- **Columnas:** Terminal, código, comercio, dirección, ciudad, MCC, límite, zona, fecha.
- **Eliminación** con confirmación.

---

### 4.16 Inicializaciones

**Ruta:** `/pmt/inicializaciones` · **Navbar:** OLD Control POS → Inicializaciones

#### Descripción
Registro y consulta de inicializaciones de terminales POS.

#### Funcionalidades
- **Listado filtrable:** Por serie, terminal, versión y resultado (OK/Error).
- **Registro:** Serie, terminal, versión, APN, resultado y usuario.
- **Historial completo** con fecha y hora de cada inicialización.

---

### 4.17 Tráfico

**Ruta:** `/pmt/control-pos` · **Navbar:** OLD Control POS → Tráfico

#### Descripción
Monitor de transacciones procesadas por las terminales POS.

#### Funcionalidades
- **Listado:** Serie, terminal, MTI (tipo de mensaje ISO 8583), código de respuesta, comercio, monto, fecha.
- **Filtros:** Por serie, terminal, MTI, código de respuesta y comercio.
- **Estadísticas:** Resumen por aplicación y por APN.
- **Badges de respuesta:** Visual para exitosas (`00 · OK`) y fallidas.

---

### 4.18 Requisiciones

**Ruta:** `/pmt/solicitudes-equipo` · **Navbar:** OLD Control POS → Requisiciones

#### Descripción
Solicitudes internas para equipamiento y compras de activo fijo.

#### Funcionalidades
- **Filtro por estado:** Pendiente, aprobada, rechazada, entregada.
- **Creación:** Ítems predefinidos (POS, SIM, cargador, cable, base, etc.) con cantidades y notas.
- **Múltiples ítems** por solicitud.
- **Detalle con historial:** Quién aprobó/rechazó, cuándo, comentarios.
- **Flujo de aprobación:** Aprobar, rechazar o marcar como entregada.

---

### 4.19 Soporte

**Ruta:** `/pmt/solicitudes-soporte` · **Navbar:** OLD Control POS → Soporte

#### Descripción
Tickets internos para reportar y dar seguimiento a incidencias técnicas.

#### Funcionalidades
- **Filtros:** Por serie, descripción, creador, estado (pendiente, en proceso, resuelto, cerrado) y tipo.
- **Creación:** Serie (opcional), tipo y descripción del problema.
- **Detalle:** Información completa, historial de comentarios y cambios de estado.
- **Flujo de estados:** Pendiente → En proceso → Resuelto → Cerrado.

---

### 4.20 Usuarios

**Ruta:** `/pmt/users` · **Navbar:** OLD Control POS → Usuarios

#### Descripción
Administración de usuarios y roles del sistema.

#### Funcionalidades
- **Filtros:** Por username, nombre, email, rol y estado activo/inactivo.
- **Roles:** Admin, Inventario, Supervisor, Técnico, Ejecutivo, Consulta.
- **Alta y edición:** Username, nombre, email, rol, estado activo, primer inicio de sesión.
- **Activar/Desactivar:** Toggle rápido sin abrir el formulario.
- **Eliminación** con confirmación.

---

## 5. Ciclo de Vida de una Terminal POS

El sistema gestiona el siguiente flujo de estados para cada terminal:

```
                                    ┌─── serie_sustituida
                                    │
en_bodega ──► en_inyeccion ──► asignado_supervisor ──► asignado_tecnico ──► instalado
                                                                              │
                                                                         en_reparacion
                                                                          │   │   │
                                                                          ▼   ▼   ▼
                                                                    garantia  irreparable  obsoleto
                                                                      │
                                                                      ▼
                                                                   retirado
```

| Estado | Descripción |
|---|---|
| `en_bodega` | El equipo está almacenado en la bodega central |
| `en_inyeccion` | En proceso de instalación y configuración de software |
| `asignado_supervisor` | Asignado a un supervisor para distribución |
| `asignado_tecnico` | Entregado a un técnico para instalación en campo |
| `instalado` | Instalado y operativo en un comercio |
| `en_reparacion` | Retirado del campo para diagnóstico y reparación |
| `garantia` | Enviado al fabricante bajo garantía |
| `serie_sustituida` | Serie original sustituida por el fabricante |
| `irreparable` | No puede repararse — dado de baja |
| `obsoleto` | Retirado por antigüedad u obsolescencia |
| `retirado` | Retirado definitivamente del inventario |

Cada transición genera un evento de **tracking** con: estado anterior, estado nuevo, fecha, usuario y comentario.

---

## 6. Componentes Compartidos

| Componente | Descripción |
|---|---|
| `StatusBadge` | Badge de color según el estado del dispositivo |
| `BatteryIndicator` | Indicador visual del nivel de batería con ícono de carga |
| `BusyLoader` | Indicador de carga global con mensaje y progreso de navegación |
| `EmptyState` | Mensaje y acción sugerida cuando una vista no tiene datos |
| `ConfirmDialog` | Diálogo de confirmación para acciones destructivas |

---

*Documento generado a partir del código fuente del proyecto.*  
*Última actualización: Julio 2026*
