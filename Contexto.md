# Contexto del Proyecto: INMOVA (Sistema Web de Gestión Inmobiliaria)

## 1. Introducción y Objetivos
INMOVA es una solución web integral (SPA + API REST) diseñada para centralizar y optimizar las operaciones de agencias y profesionales inmobiliarios. Su objetivo principal es unificar en una sola plataforma la gestión de propiedades, clientes (CRM), agendas de visitas, documentación contractual y canales de comunicación que comúnmente operan de forma dispersa.

---

## 2. Arquitectura Tecnológica y Seguridad
El sistema se rige bajo un patrón cliente-servidor con una separación estricta de capas:
* **Frontend:** React (con Vite), React Router para navegación, Axios para peticiones HTTP y TailwindCSS para el diseño responsivo (Escritorio/Móvil).
* **Backend:** API REST estructurada de forma modular en Node.js y Express.js.
* **Base de Datos:** MongoDB Atlas (NoSQL) gestionada mediante el ODM Mongoose.
* **Autenticación y Almacenamiento:** Supabase Auth (Manejo de JWT) y Supabase Storage (Buckets públicos para imágenes de inmuebles y privados para contratos PDF).
* **Seguridad:** Conexiones cifradas mediante HTTPS, control de acceso basado en roles (RBAC) a nivel de endpoints en la API, validación/saneamiento de entradas y logs de auditoría para acciones críticas.

---

## 3. Roles y Permisos (RBAC)
El sistema valida los siguientes 3 roles definidos en la base de datos antes de permitir cualquier operación en la API:
1.  **Administrador:** Acceso total a todos los módulos, configuraciones globales, gestión de usuarios, comisiones y logs de auditoría.
2.  **Asesor Inmobiliario:** Fusión de las capacidades operativas. Encargado de la gestión de clientes (CRM), bandeja unificada de mensajería, programación y seguimiento de visitas, generación de contratos y visualización de inmuebles a modo consulta.
3.  **Captador:** Gestión directa del portafolio de inmuebles y visualización de datos privados del inmueble (honorarios pactados). Acceso restringido a clientes y visitas.

---

## 4. Desglose de Módulos y Funcionalidades

### 4.1 Módulo de Gestión de Inmuebles (Núcleo)
* **Listado de Inmuebles:** Tabla paginada con motor de búsqueda por texto libre (referencia, nombre, zona) y filtros avanzados (tipo de inmueble, estado, rango de precio, asesor inmobiliario responsable). Permite acciones masivas como edición en masa, eliminación múltiple y exportación a Excel/CSV.
* **Ficha del Inmueble:** Visualización detallada de características estructuradas (dormitorios, baños, superficies, año, etc.), indicadores visuales de estado por color (Prospecto, Disponible, Reservado, Vendido) y galería de hasta 30 fotografías en carrusel. Incluye registro de certificado energético, entorno (alrededores) y características especiales.
* **Gestión de Propietarios:** Vinculación de un inmueble a uno o varios propietarios (titular principal y cotitulares) con sus datos de contacto e historial de comunicaciones.
* **Datos Privados:** Sección restringida solo para Administrador y Captador que almacena el captador asignado, honorarios pactados y marcas de auditoría de la última acción.
* **Gestión de Interesados:** Lista de leads del CRM que encajan con la propiedad, mostrando su nivel de interés y botones de contacto directo por WhatsApp o Email.
* **Publicación y Compartición:** Herramientas para generar enlaces compartibles con imagen para WhatsApp, publicación en Facebook mediante Graph API, generación de ficha técnica descriptiva en PDF y enlace a Google Maps con ubicación exacta.
* **Contratos Asociados:** Acceso directo a la generación de contratos vinculados al inmueble histórico.

### 4.2 Módulo CRM y Clientes
* **Registro y Perfil:** Centralización de fichas de clientes potenciales o arrendatarios con datos de contacto, canal de origen, notas internas del comercial responsable y timeline cronológico de actividad.
* **Preferencias del Cliente:** Almacenamiento de criterios de búsqueda (zonas de interés, tipo de inmueble, rango de presupuesto, habitaciones) para su posterior segmentación.
* **Historial de Conversaciones:** Consolidación en un único flujo de las interacciones mantenidas por WhatsApp, Facebook Messenger, correo y llamadas.
* **Flujo del Lead:** Pipeline de estados progresivos del cliente: *Nuevo -> Contactado -> Interesado -> Visita Programada -> Oferta -> Cerrado -> Descartado*. Los clientes captados por el módulo de mensajería se indexan aquí automáticamente.

### 4.3 Módulo de Mensajería (Versión de Prueba Local)
* **Bandeja Unificada:** Simulación local de una interfaz de chat para conversaciones provenientes de WhatsApp y Facebook Messenger.
* **Bot de Bienvenida:** Flujo automatizado local para saludar, capturar datos básicos (nombre, correo, inmueble buscado) y dar de alta de forma automática al cliente en el CRM.
* **Respuestas Rápidas:** Selector de plantillas de texto predefinidas para optimizar el tiempo de respuesta de los asesores.
* **Transferencia Humana:** Mecanismo para derivar de forma manual la conversación al asesor asignado cuando el bot no puede solventar la consulta.
* **Nota de Integración Futura:** Diseñado estructuralmente para reemplazar el simulador local por integraciones reales con Meta Cloud API (WhatsApp/Facebook) y Telegram API usando n8n en fases posteriores.

### 4.4 Módulo de Agenda de Visitas y Citas
* **Programación:** Formulario para agendar citas vinculando obligatoriamente un cliente, un inmueble, fecha/hora y un asesor responsable.
* **Estados de Cita:** Ciclo de vida dinámico con estados (*Programada, En Proceso, Finalizada, Cancelada, Suspendida, No Presentado*).
* **Vista de Calendario:** Calendario interactivo (diario, semanal, mensual) con código de colores basado en el estado de la cita.
* **Notificaciones y Recordatorios:** Envío automático de confirmación de la cita al cliente por Email o WhatsApp, con recordatorios automatizados 24 horas antes del evento.
* **Seguimiento Post-Visita:** Formulario para que el comercial digite observaciones y feedback tras la cita, alimentando las métricas de conversión.

### 4.5 Módulo de Contratos y Plantillas
* **Gestor de Plantillas:** CRUD de plantillas de documentos manejadas por el Administrador a través de un editor de texto enriquecido (WYSIWYG). Soporta variables dinámicas como `{nombre_cliente}`, `{inmueble}`, `{precio}`, `{fecha}`, `{duracion}` y `{asesor}`.
* **Tipos de Documento:** Soporte para tipologías estandarizadas: Alquiler, Arras, Honorarios del Comprador, Honorarios del Vendedor, Recibo de llaves y Devolución de llaves.
* **Generación de PDF:** Motor que renderiza los datos reales del CRM e Inmuebles sobre la plantilla elegida, mostrando una previsualización interactiva antes de compilar y descargar/imprimir el archivo PDF final.

### 4.6 Módulo de Publicidad y Notificaciones
* **Campañas de Email Marketing:** Herramienta de envío masivo de correos electrónicos filtrando destinatarios por sus preferencias del CRM (zona, presupuesto, tipo de inmueble), utilizando plantillas predefinidas (bajada de precio, novedades).
* **Mensajería Masiva:** Envío de WhatsApp masivo a listas de interesados mediante plantillas previamente aprobadas por Meta.
* **Métricas de Impacto:** Registro y visualización de tasas de apertura y clics de las campañas enviadas.
* **Notificaciones Internas:** Sistema de alertas Push en tiempo real dentro de la plataforma para notificar al equipo sobre leads nuevos, contratos generados o citas programadas.

### 4.7 Módulo de Administración y Configuración
* **Control de Accesos:** Panel de gestión de usuarios (Crear, editar, desactivar cuentas y asignación de los 3 roles del sistema).
* **Identidad Corporativa:** Configuración de datos fiscales, carga de logotipo de la agencia, firmas de correo electrónico estandarizadas y gestión de la estructura de comisiones y honorarios.
* **Exportación y Dashboards:** Herramientas de exportación global (Excel, CSV, JSON) de las colecciones principales. Visualización de KPIs de negocio (inmuebles por estado, leads por canal, tasas de conversión visita-oferta y rendimiento de los asesores).
* **Auditoría y Conexiones:** Mantenimiento de credenciales de servicios externos (SMTP, Meta, etc.) y acceso exclusivo al Log de Auditoría (*timestamps*, usuario, acción, IP/Naturaleza) de eventos críticos.