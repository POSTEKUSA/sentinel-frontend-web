# Características del Sistema — POSTEK SENTINEL

**Versión:** 2026.5.22.0  
**Plataforma:** Aplicación Web (SPA)  
**Tecnología:** Angular 21 + TypeScript + Angular Material + Tailwind CSS

---

## Índice

1. [Visión General](#1-visión-general)
2. [Módulo de Autenticación](#2-módulo-de-autenticación)
3. [Monitoreo de Flota (Sentinel)](#3-monitoreo-de-flota-sentinel)
   - 3.1 [Dashboard — Vista General de la Flota](#31-dashboard--vista-general-de-la-flota)
   - 3.2 [Listado de Dispositivos](#32-listado-de-dispositivos)
   - 3.3 [Detalle de Dispositivo](#33-detalle-de-dispositivo)
   - 3.4 [Mapa de Dispositivos](#34-mapa-de-dispositivos)
4. [Administración POS](#4-administración-pos)
   - 4.1 [Catálogo de Marcas y Modelos](#41-catálogo-de-marcas-y-modelos)
   - 4.2 [Órdenes de Compra](#42-órdenes-de-compra)
   - 4.3 [Recepción de Equipos](#43-recepción-de-equipos)
   - 4.4 [Inventario Central](#44-inventario-central)
   - 4.5 [Gestión de Comercios](#45-gestión-de-comercios)
5. [Control POS (PMT)](#5-control-pos-pmt)
   - 5.1 [Dashboard PMT](#51-dashboard-pmt)
   - 5.2 [Inventario de Terminales](#52-inventario-de-terminales)
   - 5.3 [Carga Masiva de Inventario](#53-carga-masiva-de-inventario)
   - 5.4 [Bodega](#54-bodega)
   - 5.5 [Inyección de Software](#55-inyección-de-software)
   - 5.6 [Terminales Asignados](#56-terminales-asignados)
   - 5.7 [Reparación](#57-reparación)
   - 5.8 [Garantía](#58-garantía)
   - 5.9 [SIM Cards](#59-sim-cards)
   - 5.10 [Configuración de Comercio (Merchant Config)](#510-configuración-de-comercio-merchant-config)
   - 5.11 [Inicializaciones](#511-inicializaciones)
   - 5.12 [Tráfico de Transacciones (ControlPOS)](#512-tráfico-de-transacciones-controlpos)
   - 5.13 [Requisiciones de Equipo](#513-requisiciones-de-equipo)
   - 5.14 [Soporte Técnico](#514-soporte-técnico)
   - 5.15 [Gestión de Usuarios](#515-gestión-de-usuarios)
6. [Ciclo de Vida de una Terminal POS](#6-ciclo-de-vida-de-una-terminal-pos)
7. [Componentes Compartidos](#7-componentes-compartidos)

---

## 1. Visión General

**POSTEK SENTINEL** es un sistema web de gestión integral para la operación de terminales de punto de venta (POS). El sistema abarca desde el monitoreo en tiempo real de dispositivos desplegados en campo, hasta la administración completa de la cadena de suministro, ciclo de vida de equipos y soporte técnico.

El sistema está organizado en tres grandes áreas funcionales:

| Área | Propósito |
|---|---|
| **Monitoreo de Flota** | Supervisión en tiempo real del estado, ubicación y salud de dispositivos POS desplegados en campo |
| **Administración POS** | Gestión de catálogos, órdenes de compra, recepción de equipos, inventario y comercios afiliados |
| **Control POS (PMT)** | Gestión del ciclo de vida completo de terminales: bodega, inyección, asignación, reparación, garantía, SIM Cards, transacciones y soporte |

---

## 2. Módulo de Autenticación

### Funcionalidad
- Inicio de sesión con correo electrónico y contraseña.
- Protección de rutas mediante guardias de autenticación (`authGuard` / `guestGuard`).
- Redirección automática: los usuarios no autenticados son redirigidos al login; los ya autenticados son redirigidos al dashboard.
- Cierre de sesión con indicador visual de progreso.

### Proceso Operativo
1. El usuario accede a la aplicación.
2. Si no tiene sesión activa, se presenta la pantalla de login.
3. Al ingresar credenciales válidas, se establece la sesión y se redirige al dashboard principal.
4. La sesión persiste durante la navegación hasta que el usuario cierra sesión manualmente.

---

## 3. Monitoreo de Flota (Sentinel)

### 3.1 Dashboard — Vista General de la Flota

**Ruta:** `/dashboard`

#### Descripción
Panel de control ejecutivo que presenta un resumen en tiempo real del estado de toda la flota de dispositivos POS desplegados. Es la primera vista que se presenta al usuario tras iniciar sesión.

#### Funcionalidades
- **KPIs de estado:** Tarjetas con el total de dispositivos, cantidad en línea, retrasados y fuera de línea, con porcentaje de cada estado. Cada tarjeta es clickeable y filtra el listado de dispositivos al estado correspondiente.
- **Desglose por organización (tenant):** Tabla que agrupa dispositivos por entidad organizacional, mostrando cantidad y porcentaje por cada estado.
- **Desglose por comercio (merchant):** Tabla similar que agrupa por comercio afiliado.
- **Panel "Requiere atención":** Lista los dispositivos que no están en línea (retrasados u offline), ordenados por antigüedad del último heartbeat. Muestra alias, batería, última conexión y estado. Permite navegar al detalle del dispositivo.
- **Mapa de atención:** Mapa interactivo (Leaflet) que muestra geográficamente la ubicación de los dispositivos que requieren atención. Se puede maximizar a pantalla completa.
- **Auto-actualización:** Los datos se refrescan automáticamente cada 30 segundos con indicador de frescura de los datos.

#### Proceso de Negocio
El dashboard permite al equipo de operaciones identificar rápidamente cuáles dispositivos necesitan intervención, cuáles zonas geográficas tienen problemas de conectividad, y cuál es el estado general de la flota por organización y comercio.

---

### 3.2 Listado de Dispositivos

**Ruta:** `/device-list`

#### Descripción
Vista tabular completa de todos los dispositivos de la flota con capacidades avanzadas de filtrado y búsqueda.

#### Funcionalidades
- **Búsqueda global:** Campo de texto que filtra por alias, ID de dispositivo, comercio u organización.
- **Filtros por estado:** Botones para filtrar por estado (todos, en línea, retrasados, fuera de línea).
- **Filtros por URL:** Se puede acceder con filtros pre-aplicados desde otras vistas (por organización, por comercio, por estado, por sincronización obsoleta).
- **Información por dispositivo:** ID, alias, estado de batería (con indicador visual), última conexión (tiempo relativo), estado (badge de color), y enlace al detalle.
- **Indicador de datos:** Muestra el total de dispositivos filtrados vs. el total general.

#### Proceso Operativo
Desde el dashboard u otras vistas, el usuario navega al listado filtrado para investigar un grupo específico de dispositivos. Puede refinar los filtros para encontrar dispositivos problemáticos y acceder a su detalle individual.

---

### 3.3 Detalle de Dispositivo

**Ruta:** `/device-info/:id`

#### Descripción
Vista detallada de un dispositivo individual con toda su información técnica, métricas de salud y telemetría.

#### Funcionalidades
- **Información del dispositivo:** ID, alias, organización, comercio.
- **Salud del equipo:** Nivel de batería (con indicador gráfico y estado de carga), tipo de red, cobertura.
- **Ubicación:** Coordenadas GPS con último reporte.
- **Estado de conectividad:** Último heartbeat con formato relativo ("hace X minutos"), badge de estado.
- **Historial de eventos:** Registro de telemetría reciente con tipo de evento (latido, ubicación, salud, sincronización), timestamp y datos crudos en JSON expandible.
- **Navegación:** Enlace rápido para ver el dispositivo en el mapa.

#### Proceso de Negocio
El técnico o supervisor accede al detalle de un dispositivo para diagnosticar su situación actual, verificar su nivel de batería, confirmar su ubicación y revisar el historial de comunicaciones recientes.

---

### 3.4 Mapa de Dispositivos

**Ruta:** `/device-map`

#### Descripción
Mapa interactivo de pantalla completa que muestra la ubicación geográfica de todos los dispositivos de la flota.

#### Funcionalidades
- **Mapa interactivo (Leaflet):** Utiliza tiles de CartoDB Voyager para renderizado rápido y estéticamente limpio.
- **Marcadores por estado:** Cada dispositivo se representa con un marcador circular coloreado según su estado (verde = en línea, amarillo = retrasado, rojo = fuera de línea). Los dispositivos en línea tienen animación de pulso.
- **Popups informativos:** Al hacer clic en un marcador se muestra alias, ID, batería, tipo de red, última conexión, estado y enlace al detalle.
- **Geolocalización del usuario:** Muestra la ubicación del usuario con un marcador azul con efecto de pulso, centrado automático si se concede permiso.
- **Filtro por dispositivo:** Se puede acceder con `?deviceId=X` para centrar y resaltar un dispositivo específico.
- **Centrado inteligente:** Se centra en la ubicación del usuario si hay geolocalización, si no, ajusta los bounds para mostrar todos los dispositivos.

#### Proceso Operativo
El supervisor puede ver dónde están físicamente todos los equipos y detectar patrones geográficos de desconexión. Esto es útil para planificar visitas de mantenimiento en campo y verificar que los equipos están en la ubicación esperada.

---

## 4. Administración POS

### 4.1 Catálogo de Marcas y Modelos

**Ruta:** `/pos-admin/catalog`

#### Descripción
Gestión del catálogo maestro de marcas, modelos, proveedores y accesorios de terminales POS.

#### Funcionalidades
- **Tres pestañas:** Marcas/Modelos, Proveedores, Accesorios.
- **Marcas y modelos:** Alta, edición y eliminación de combinaciones marca-modelo con tipo de POS y estado (activo, obsoleto, descontinuado). Búsqueda por marca, modelo o tipo.
- **Proveedores:** Gestión de proveedores con marcas y modelos que suministran. Diálogo de creación/edición.
- **Accesorios:** Catálogo de accesorios compatibles con categorías (cargador, cable, base, etc.) y compatibilidad con marcas/modelos específicos.
- **Eliminación con confirmación:** Todas las eliminaciones requieren confirmación explícita mediante diálogo.

#### Proceso de Negocio
Antes de registrar equipos en el inventario o crear órdenes de compra, se debe mantener actualizado el catálogo de marcas, modelos y proveedores. Esto asegura la consistencia de datos en todo el sistema.

---

### 4.2 Órdenes de Compra

**Ruta:** `/pos-admin/purchase-orders`

#### Descripción
Gestión del proceso de compra de terminales POS y accesorios, desde la creación de la orden hasta su cierre.

#### Funcionalidades
- **Listado de órdenes:** Tabla con número de orden, proveedor, estado, progreso de recepción (barra de progreso), fecha de creación y acciones.
- **Filtros avanzados:** Filtrado por número de orden, proveedor, estado, marca, modelo y ubicación de entrega.
- **Estados de orden:** Creada → En tránsito → Parcialmente recibida → Recibida → Cerrada / Cancelada. Cada estado se muestra con badge de color.
- **Formulario de orden:** Creación y edición de órdenes con proveedor, fecha estimada, ubicación de entrega y líneas de detalle (marca, modelo, cantidad solicitada).
- **Progreso:** Indicador de porcentaje y barra visual que muestra cuántas unidades de la orden ya fueron recibidas.

#### Proceso de Negocio
1. El administrador crea una orden de compra seleccionando proveedor y definiendo las líneas con marca, modelo y cantidades.
2. La orden pasa a estado "en tránsito" cuando el proveedor despacha.
3. A medida que se reciben equipos (en el módulo de Recepción), el progreso se actualiza automáticamente.
4. Cuando todas las unidades son recibidas, la orden puede cerrarse.

---

### 4.3 Recepción de Equipos

**Ruta:** `/pos-admin/receiving`

#### Descripción
Registro de entrada de equipos POS al inventario, individual o masivamente, opcionalmente vinculados a una orden de compra.

#### Funcionalidades
- **Dos modos de recepción:**
  - **Individual:** Formulario para registrar un equipo por su número de serie, marca, modelo, tipo de POS, ubicación inicial y condición.
  - **Masiva (CSV):** Carga de archivo CSV con múltiples equipos. Validación previa que muestra equipos válidos, duplicados y errores antes de confirmar.
- **Vinculación a orden de compra:** Se puede seleccionar la orden de compra y línea correspondiente para actualizar automáticamente las cantidades recibidas.
- **Plantilla descargable:** Botón para descargar un archivo CSV de ejemplo con el formato esperado.
- **Detección de duplicados:** El sistema detecta y rechaza números de serie ya registrados.
- **Ubicación inicial:** Se asigna ubicación (bodega central, sucursal, técnico, etc.) y condición (nuevo, sellado de fábrica, reacondicionado, etc.).

#### Proceso de Negocio
1. Llegan equipos del proveedor.
2. El operador de bodega selecciona la orden de compra (si aplica) y la línea correspondiente.
3. Registra cada equipo individualmente o carga un CSV con múltiples series.
4. El sistema valida las series, detecta duplicados y registra los equipos en el inventario central.
5. Las cantidades recibidas se reflejan automáticamente en la orden de compra.

---

### 4.4 Inventario Central

**Ruta:** `/pos-admin/inventory`

#### Descripción
Vista consolidada del inventario de equipos POS y accesorios con múltiples perspectivas de consulta.

#### Funcionalidades
- **Cuatro pestañas:**
  - **Inventario Central:** Listado completo de equipos con filtros, estado, ubicación actual, fecha de registro.
  - **Por Ubicación:** Agrupación de equipos por ubicación física (bodega, sucursal, campo).
  - **Custodia:** Control de equipos asignados a personal (supervisores, técnicos) con diálogo de asignación/reasignación.
  - **Accesorios:** Stock de accesorios con movimientos de entrada/salida.
- **Acciones de custodia:** Asignación de equipos a custodios con registro de quién tiene cada equipo.
- **Movimientos de accesorios:** Registro de entrada y salida de accesorios vinculados a equipos o personas.

#### Proceso de Negocio
El inventario central es la fuente de verdad sobre la ubicación y estado de cada equipo y accesorio. Permite saber en todo momento dónde está cada terminal, quién lo tiene en custodia y cuál es su estado actual.

---

### 4.5 Gestión de Comercios

**Ruta:** `/pos-admin/merchants`

#### Descripción
Administración de los comercios afiliados donde se instalan las terminales POS.

#### Funcionalidades
- **Dos pestañas:**
  - **Comercios:** Listado con código de afiliado, nombre comercial, departamento, municipio, estado (activo/inactivo), cantidad de POS activos.
  - **Reporte MCC:** Distribución de comercios por código de categoría de comercio (Merchant Category Code) con gráficas de barra.
- **Filtros avanzados:** Por código de afiliado, nombre comercial, MCC, departamento, municipio y estado.
- **Detalle de comercio:** Vista individual con datos completos del comercio: razón social, NIT, representante legal, dirección, contacto.
- **Creación de comercios:** Diálogo para registrar nuevos comercios con todos sus datos fiscales y de ubicación.

#### Proceso de Negocio
Los comercios son las entidades cliente donde se instalan las terminales POS. El sistema mantiene un registro completo de cada comercio para vincular los equipos instalados y facilitar el soporte de campo.

---

## 5. Control POS (PMT)

El módulo **Control POS** (originalmente desarrollado como sistema independiente bajo el nombre **PMT Control POS**) gestiona el ciclo de vida completo de terminales POS: desde su ingreso a bodega hasta su retiro o sustitución.

### 5.1 Dashboard PMT

**Ruta:** `/pmt/dashboard`

#### Descripción
Panel de control con indicadores clave del estado del inventario de terminales y SIM Cards.

#### Funcionalidades
- **KPIs primarios:** Terminales en bodega, en inyección e instalados.
- **KPIs secundarios:** Asignados a supervisor, asignados a técnico, en reparación, en garantía.
- **KPIs terciarios:** Retirados, irreparables, obsoletos, con serie sustituida.
- **Distribución por zona:** Gráfico de barras horizontales mostrando terminales por zona geográfica (top 8).
- **Distribución por modelo:** Top 6 modelos de terminal más frecuentes.
- **Estadísticas de SIM Cards:** Total, disponibles, asignadas e instaladas por compañía (Claro, Tigo, Postek).
- **Actividad reciente:** Últimos 8 eventos de tracking (cambios de estado) con detalle.

---

### 5.2 Inventario de Terminales

**Ruta:** `/pmt/inventory`

#### Descripción
Gestión completa del inventario de terminales POS con operaciones CRUD y consulta de historial.

#### Funcionalidades
- **Listado paginado:** 50 terminales por página con navegación de páginas.
- **Filtros:** Búsqueda global (serie, modelo, nombre, inventario, zona, ciudad), filtro por estado, zona y modelo.
- **Alta de terminal:** Formulario con campos: serie, inventario, modelo, estado, zona, caja, inyectado, fecha, nombre del comercio, dirección, ciudad.
- **Edición de terminal:** Modificación de cualquier campo de un terminal existente.
- **Eliminación:** Con confirmación previa.
- **Historial del terminal:** Diálogo con dos pestañas:
  - **Cambios de estado:** Eventos de tracking con estado anterior → nuevo, fecha, usuario y comentario.
  - **Eventos del ciclo de vida:** Historial de instalaciones y retiros asociados a la serie.

#### Proceso de Negocio
El inventario es el registro maestro de todas las terminales. Cada terminal tiene un número de serie único y un estado que refleja su posición en el ciclo de vida. Todas las operaciones de los demás módulos (bodega, inyección, asignación, etc.) modifican el estado de los registros de este inventario.

---

### 5.3 Carga Masiva de Inventario

**Ruta:** `/pmt/bulk-upload`

#### Descripción
Importación masiva de terminales desde archivos CSV o datos JSON.

#### Funcionalidades
- **Dos modos de entrada:**
  - **CSV:** Carga de archivo con mapeo automático de columnas (acepta nombres en español e inglés).
  - **JSON:** Pegado directo de un array JSON con los datos de los terminales.
- **Mapeo inteligente de columnas:** Reconoce variaciones de nombres de columna (e.g., "N° Serie", "serial", "serie" → campo `serie`).
- **Mapeo de estados:** Convierte nombres de estado legibles ("en bodega", "activo") a valores internos (`en_bodega`, `instalado`).
- **Vista previa:** Muestra los datos parseados antes de confirmar la importación.
- **Plantilla descargable:** CSV con columnas y filas de ejemplo.
- **Resultado detallado:** Reporte de cuántos registros se crearon y cuántos errores ocurrieron.

---

### 5.4 Bodega

**Ruta:** `/pmt/bodega`

#### Descripción
Control del inventario en almacén — terminales con estado `en_bodega`.

#### Funcionalidades
- **Filtros exactos:** Serie, inventario, modelo, caja, estado de inyección.
- **Selección múltiple:** Checkboxes para seleccionar uno o varios terminales.
- **Acciones masivas sobre seleccionados:**
  - **Enviar a inyección:** Cambia el estado de los terminales seleccionados a `en_inyeccion`.
  - **Asignar:** Asigna los terminales a un supervisor o técnico con campo para nombre del asignatario y comentario.
  - **Enviar a reparación:** Mueve los terminales seleccionados a estado `en_reparacion`.
- **Comentarios:** Cada acción permite agregar un comentario que se registra en el tracking.

#### Proceso de Negocio
La bodega es el punto de partida del ciclo de vida de un terminal. Aquí se almacenan los equipos recién recibidos. Desde la bodega, los equipos pueden enviarse a inyección de software, asignarse directamente a personal, o enviarse a reparación si se detecta un defecto.

---

### 5.5 Inyección de Software

**Ruta:** `/pmt/pos-inyeccion`

#### Descripción
Seguimiento de terminales en proceso de inyección de software (instalación de aplicaciones, configuración de red, certificados).

#### Funcionalidades
- **Listado filtrado:** Solo terminales con estado `en_inyeccion`.
- **Búsqueda:** Por serie, modelo o zona.
- **Selección masiva:** Para procesar múltiples terminales a la vez.
- **Marcar salida de inyección:** Cambia el estado a `asignado_supervisor` con comentario de salida.

#### Proceso de Negocio
Después de que un equipo sale de bodega, pasa por el proceso de inyección donde se instala y configura el software necesario (aplicación de pagos, certificados de seguridad, configuración de comunicaciones). Una vez completado, el equipo está listo para ser asignado a personal de campo.

---

### 5.6 Terminales Asignados

**Ruta:** `/pmt/asignados`

#### Descripción
Vista de terminales actualmente asignados a supervisores y técnicos.

#### Funcionalidades
- **Dos pestañas:** Asignados a supervisor / Asignados a técnico, con contadores.
- **Filtros:** Búsqueda global y filtro por persona asignada.
- **Reasignación:** Permite reasignar un terminal de una persona a otra con registro del cambio.
- **Historial de asignaciones:** Diálogo que muestra todas las asignaciones históricas de un terminal (quién lo tuvo, cuándo, y motivo de la reasignación).

#### Proceso de Negocio
Los supervisores reciben equipos del proceso de inyección y los distribuyen a los técnicos. Los técnicos los llevan al campo para instalación en comercios. Este módulo permite rastrear qué persona tiene cada equipo y cuándo se reasignó.

---

### 5.7 Reparación

**Ruta:** `/pmt/reparacion`

#### Descripción
Gestión de terminales en proceso de reparación o mantenimiento.

#### Funcionalidades
- **Listado filtrado:** Solo terminales con estado `en_reparacion`.
- **Búsqueda:** Por serie o modelo.
- **Resolución:** Diálogo para resolver el caso con las opciones:
  - **Reparado (instalado):** El equipo vuelve a estar operativo.
  - **Garantía:** Se envía al fabricante bajo garantía.
  - **Irreparable:** El equipo no puede ser reparado.
  - **Obsoleto:** El equipo se retira por obsolescencia.
- **Comentario de resolución:** Se registra el motivo o detalle de la resolución.

#### Proceso de Negocio
Cuando un equipo presenta fallas, se envía a reparación. El equipo técnico evalúa la falla y determina si el equipo puede repararse, si debe enviarse a garantía con el fabricante, o si debe darse de baja como irreparable u obsoleto.

---

### 5.8 Garantía

**Ruta:** `/pmt/garantia`

#### Descripción
Control de terminales enviados a garantía con el fabricante.

#### Funcionalidades
- **Listado filtrado:** Solo terminales con estado `garantia`.
- **Búsqueda:** Por serie o modelo.
- **Sustitución de serie:** Cuando el fabricante reemplaza un equipo, el sistema permite registrar la sustitución:
  - Se marca la serie vieja como `serie_sustituida`.
  - Se crea automáticamente un nuevo registro con la serie nueva en estado `en_bodega`.
- **Retiro de garantía:** Si el equipo no es sustituido, se puede marcar como `retirado`.

#### Proceso de Negocio
Cuando un equipo se envía a garantía, el fabricante puede repararlo y devolverlo o sustituirlo por uno nuevo. El módulo de sustitución de serie permite mantener la trazabilidad: la serie vieja queda marcada y la nueva serie entra automáticamente al inventario de bodega para iniciar su ciclo de vida.

---

### 5.9 SIM Cards

**Ruta:** `/pmt/sim-cards`

#### Descripción
Gestión completa del inventario de tarjetas SIM para conectividad de las terminales.

#### Funcionalidades
- **Listado con filtros:** Búsqueda por ICCID, número, terminal asociada o persona asignada. Filtros por estado y compañía.
- **Alta de SIM:** Formulario con ICCID, número, compañía (Claro, Tigo, Postek), estado, terminal asociada, APN, IP y notas.
- **Edición de SIM:** Modificación de cualquier campo.
- **Estados de SIM:** Disponible, asignada, instalada, dañada, retirada.

#### Proceso de Negocio
Las SIM Cards son necesarias para la conectividad de datos de las terminales POS. Se gestionan de forma independiente y se vinculan a terminales específicas. El sistema permite rastrear qué SIM está en qué equipo, su estado y compañía proveedora.

---

### 5.10 Configuración de Comercio (Merchant Config)

**Ruta:** `/pmt/query`

#### Descripción
Consulta de registros de configuración de comercios asociados a terminales, incluyendo datos de TID, código de comercio y parámetros operativos.

#### Funcionalidades
- **Listado paginado:** 50 registros por página.
- **Filtros:** Por terminal, código de comercio, nombre de comercio, ciudad y zona.
- **Columnas:** Terminal, código, comercio, dirección, ciudad, MCC, límite, zona, fecha de registro.
- **Eliminación de registros:** Con confirmación previa.

#### Proceso de Negocio
Estos registros representan la configuración de cada terminal en el sistema de procesamiento de pagos: su identificador de terminal (TID), el comercio al que está vinculado, su código de categoría (MCC) y su zona operativa. Se consultan para verificar y auditar las configuraciones activas.

---

### 5.11 Inicializaciones

**Ruta:** `/pmt/inicializaciones`

#### Descripción
Registro y consulta de inicializaciones de terminales POS (proceso de configuración inicial de software de pagos).

#### Funcionalidades
- **Listado filtrable:** Búsqueda por serie, terminal o versión. Filtro por resultado (OK/Error).
- **Registro de inicialización:** Formulario con serie, terminal, versión, APN, resultado y usuario que realizó el proceso.
- **Historial completo:** Cada inicialización queda registrada con fecha y hora.

#### Proceso de Negocio
La inicialización es el proceso por el cual una terminal descarga su configuración de pagos del servidor host. Esto incluye claves de cifrado, parámetros de comercio, menús y aplicaciones. Se registra cada intento con su resultado para auditoría y diagnóstico de problemas.

---

### 5.12 Tráfico de Transacciones (ControlPOS)

**Ruta:** `/pmt/control-pos`

#### Descripción
Monitor de transacciones procesadas por las terminales POS.

#### Funcionalidades
- **Listado de transacciones:** Con serie, terminal, MTI (tipo de mensaje ISO 8583), código de respuesta, comercio, monto, fecha.
- **Filtros:** Por serie, terminal, MTI, código de respuesta y comercio.
- **Estadísticas:** Resumen de transacciones por aplicación y por APN.
- **Badges de respuesta:** Indicador visual para transacciones exitosas (código `00 · OK`) y fallidas.

#### Proceso de Negocio
El monitor de transacciones permite al equipo de operaciones verificar que las terminales están procesando pagos correctamente. Se pueden identificar terminales con altas tasas de error, comercios con problemas y patrones de comportamiento anómalo.

---

### 5.13 Requisiciones de Equipo

**Ruta:** `/pmt/solicitudes-equipo`

#### Descripción
Sistema de solicitudes internas para equipamiento y compras de activo fijo.

#### Funcionalidades
- **Listado con filtro por estado:** Pendiente, aprobada, rechazada, entregada.
- **Creación de solicitud:** Formulario con ítems predefinidos (POS, SIM, cargador, cable, base, etc.), cantidades y notas.
- **Múltiples ítems:** Se pueden agregar varios ítems por solicitud.
- **Detalle con historial:** Vista del detalle de la solicitud con historial de cambios de estado (quién aprobó/rechazó, cuándo, comentarios).
- **Cambio de estado:** Aprobar, rechazar o marcar como entregada con comentario.

#### Proceso de Negocio
Cuando un supervisor o técnico necesita equipos o insumos, crea una solicitud especificando qué necesita y en qué cantidad. El administrador revisa, aprueba o rechaza la solicitud. Una vez aprobada y los materiales entregados, se marca como entregada. Todo el flujo queda registrado con auditoría completa.

---

### 5.14 Soporte Técnico

**Ruta:** `/pmt/solicitudes-soporte`

#### Descripción
Sistema de tickets internos para reportar y dar seguimiento a incidencias técnicas.

#### Funcionalidades
- **Listado filtrable:** Búsqueda por serie, descripción o creador. Filtro por estado (pendiente, en proceso, resuelto, cerrado) y tipo (técnico, operativo, etc.).
- **Creación de ticket:** Formulario con serie de terminal (opcional), tipo de solicitud y descripción del problema.
- **Detalle del ticket:** Vista con toda la información del ticket, historial de comentarios y cambios de estado.
- **Comentarios:** Sistema de comentarios encadenados para seguimiento de la resolución.
- **Cambio de estado:** Transición entre pendiente → en proceso → resuelto → cerrado.

#### Proceso de Negocio
1. Un usuario detecta un problema y crea un ticket describiendo la situación.
2. El equipo de soporte revisa el ticket y lo pasa a "en proceso".
3. Se agregan comentarios con actualizaciones y diagnóstico.
4. Una vez resuelto, se marca como resuelto y eventualmente se cierra.

---

### 5.15 Gestión de Usuarios

**Ruta:** `/pmt/users`

#### Descripción
Administración de usuarios y roles del sistema de Control POS.

#### Funcionalidades
- **Listado filtrable:** Búsqueda por username, nombre o email. Filtros por rol y estado activo/inactivo.
- **Roles disponibles:** Admin, Inventario, Supervisor, Técnico, Ejecutivo, Consulta.
- **Alta de usuario:** Formulario con username, nombre, email, rol, estado activo y flag de primer inicio de sesión.
- **Edición de usuario:** Modificación de cualquier campo.
- **Activar/Desactivar:** Toggle rápido de estado activo sin necesidad de abrir el formulario.
- **Eliminación:** Con confirmación previa.

---

## 6. Ciclo de Vida de una Terminal POS

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
| `en_bodega` | El equipo está almacenado en la bodega central, listo para ser procesado |
| `en_inyeccion` | El equipo está en proceso de instalación y configuración de software |
| `asignado_supervisor` | El equipo fue asignado a un supervisor para distribución |
| `asignado_tecnico` | El equipo fue entregado a un técnico para instalación en campo |
| `instalado` | El equipo está instalado y operativo en un comercio |
| `en_reparacion` | El equipo fue retirado del campo para diagnóstico y reparación |
| `garantia` | El equipo fue enviado al fabricante bajo garantía |
| `serie_sustituida` | La serie original fue sustituida por el fabricante — equipo nuevo creado |
| `irreparable` | El equipo no puede repararse y se da de baja |
| `obsoleto` | El equipo se retira por antigüedad u obsolescencia tecnológica |
| `retirado` | El equipo fue retirado definitivamente del inventario |

Cada transición de estado genera un evento de **tracking** con: estado anterior, estado nuevo, fecha, usuario que realizó la acción y comentario opcional.

---

## 7. Componentes Compartidos

El sistema incluye componentes reutilizables que mantienen consistencia visual en toda la aplicación:

| Componente | Descripción |
|---|---|
| `StatusBadge` | Badge de color según el estado del dispositivo (verde/amarillo/rojo) |
| `BatteryIndicator` | Indicador visual del nivel de batería con ícono de carga |
| `BusyLoader` | Indicador de carga global con mensaje personalizable y progreso de navegación |
| `EmptyState` | Mensaje y acción sugerida cuando una vista no tiene datos |
| `ConfirmDialog` | Diálogo de confirmación reutilizable para acciones destructivas |

---

*Documento generado automáticamente a partir del código fuente del proyecto.*  
*Última actualización: Julio 2026*
