# Diseño de Base de Datos y Modelos (Mongoose / MongoDB)

Este archivo contiene la especificación formal de las colecciones de la base de datos de INMOVA implementada mediante Mongoose para Node.js. El diseño equilibra el uso de subdocumentos incrustados (para datos altamente acoplados y de baja variabilidad como Propietarios) y referencias mediante ObjectIds (para relaciones dinámicas y entidades nucleares).

---

## 1. Conexión e Inicialización (Mongoose)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UsuarioSchema = new Schema({
  supabaseAuthId: { type: String, required: true, unique: true }, // ID retornado por Supabase Auth
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  rol: { 
    type: String, 
    required: true, 
    enum: ['Administrador', 'Supervisor', 'Comercial', 'Captador', 'Solo Lectura'],
    default: 'Solo Lectura'
  },
  estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  avatarUrl: { type: String, default: '' },
  firmaCorreo: { type: String, default: '' }
}, { timestamps: true });

// Índices para búsquedas rápidas de perfiles
UsuarioSchema.index({ correo: 1 });

const Usuario = mongoose.model('Usuario', UsuarioSchema);

const PropietarioSubSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, lowercase: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  esPrincipal: { type: Boolean, default: false }
});

const InmuebleSchema = new Schema({
  referenciaInterna: { type: String, required: true, unique: true, uppercase: true, trim: true },
  referenciaProveedor: { type: String, trim: true, default: '' },
  estado: { 
    type: String, 
    required: true, 
    enum: ['Prospecto', 'Disponible', 'Reservado', 'Vendido'], 
    default: 'Prospecto' 
  },
  tipoInmueble: { 
    type: String, 
    required: true, 
    enum: ['Piso', 'Casa', 'Local', 'Solar', 'Inmueble Singular'] 
  },
  precioVenta: { type: Number, required: true, min: 0 },
  precioValoracion: { type: Number, min: 0, default: 0 },
  caracteristicas: {
    dormitorios: { type: Number, default: 0 },
    banos: { type: Number, default: 0 },
    superficieTotal: { type: Number, required: true },
    superficieUtil: { type: Number, default: 0 },
    superficieParcela: { type: Number, default: 0 },
    planta: { type: String, default: '' },
    anoConstruccion: { type: Number },
    certificadoEnergetico: { type: String, default: 'No disponible' }
  },
  descripcion: { type: String, required: true },
  zona: { type: String, required: true, trim: true },
  ubicacionGmapsUrl: { type: String, default: '' },
  imagenes: [{ type: String }], // URLs de Supabase Storage (Máx 30)
  caracteristicasEspeciales: [{ 
    type: String, 
    enum: ['Jardín', 'Obra Nueva', 'Inmueble Singular', 'Solar', 'Vistas al Monte', 'Zona Verde', 'Piscina', 'Garaje'] 
  }],
  alrededores: [{ type: String }], // ['Transporte', 'Comercios', 'Escuelas']
  
  // Datos Privados (Restringidos a Administrador y Captador)
  datosPrivados: {
    captadorAsignado: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    honorariosPactados: { type: Number, default: 0 },
    ultimaAccionEfectuada: { type: String, default: 'Registro inicial' }
  },
  
  // Relaciones por referencias
  propietarios: [PropietarioSubSchema], // Subdocumentos incrustados
  clientesInteresados: [{ type: Schema.Types.ObjectId, ref: 'Cliente' }],
  contratosGenerados: [{ type: Schema.Types.ObjectId, ref: 'Contrato' }]
}, { timestamps: true });

// Índices optimizados para motores de búsqueda y filtros masivos
InmuebleSchema.index({ referenciaInterna: 1 });
InmuebleSchema.index({ estado: 1, tipoInmueble: 1, precioVenta: 1 });
InmuebleSchema.index({ zona: 'text', descripcion: 'text' }); // Búsqueda de texto libre

const Inmueble = mongoose.model('Inmueble', InmuebleSchema);

const ClienteSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  canalOrigen: { 
    type: String, 
    enum: ['WhatsApp', 'Facebook', 'Email', 'Manual'], 
    default: 'Manual' 
  },
  estadoLead: { 
    type: String, 
    required: true, 
    enum: ['Nuevo', 'Contactado', 'Interesado', 'Visita Programada', 'Oferta', 'Cerrado', 'Descartado'],
    default: 'Nuevo'
  },
  preferencias: {
    tipoInmuebleBuscado: { type: String, enum: ['Piso', 'Casa', 'Local', 'Solar', 'Inmueble Singular'] },
    zonaInteres: { type: String, default: '' },
    rangoPrecioMax: { type: Number, default: 0 },
    rangoPrecioMin: { type: Number, default: 0 },
    habitacionesRequeridas: { type: Number, default: 0 }
  },
  comercialResponsable: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  notasInternas: [{
    autor: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    contenido: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

ClienteSchema.index({ correo: 1, estadoLead: 1 });

const Cliente = mongoose.model('Cliente', ClienteSchema);

const VisitaSchema = new Schema({
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  inmueble: { type: Schema.Types.ObjectId, ref: 'Inmueble', required: true },
  comercialAsignado: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaHora: { type: Date, required: true },
  estado: { 
    type: String, 
    required: true, 
    enum: ['Programada', 'En Proceso', 'Finalizada', 'Cancelada', 'Suspendida', 'No Presentado'],
    default: 'Programada'
  },
  observacionesPostVisita: { type: String, default: '' }
}, { timestamps: true });

VisitaSchema.index({ fechaHora: 1, comercialAsignado: 1 });

const Visita = mongoose.model('Visita', VisitaSchema);

const PlantillaSchema = new Schema({
  titulo: { type: String, required: true, trim: true },
  tipoContrato: { 
    type: String, 
    required: true, 
    enum: ['Alquiler', 'Arras', 'Honorarios del comprador', 'Honorarios del vendedor', 'Recibo de llaves', 'Devolución de llaves'] 
  },
  contenidoHTML: { type: String, required: true }, // Almacena el cuerpo WYSIWYG con las {variables}
  variablesPermitidas: [{ type: String }] // ['{nombre_cliente}', '{inmueble}', '{precio}', '{fecha}']
}, { timestamps: true });

const Plantilla = mongoose.model('Plantilla', PlantillaSchema);

const ContratoSchema = new Schema({
  folioReferencia: { type: String, required: true, unique: true, uppercase: true },
  plantillaOrigen: { type: Schema.Types.ObjectId, ref: 'Plantilla', required: true },
  inmueble: { type: Schema.Types.ObjectId, ref: 'Inmueble', required: true },
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  comercialFirmante: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  valoresDinamicos Aplicados: {
    duracionMeses: { type: Number },
    precioAcordado: { type: Number },
    fechaEfectiva: { type: Date }
  },
  pdfStorageUrl: { type: String, required: true } // Enlace al bucket privado de Supabase Storage
}, { timestamps: true });

const Contrato = mongoose.model('Contrato', ContratoSchema);

const MensajeSchema = new Schema({
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  canal: { type: String, enum: ['WhatsApp', 'Facebook Messenger'], required: true },
  direccion: { type: String, enum: ['Entrante', 'Saliente'], required: true },
  contenido: { type: String, required: true },
  fueRespondidoPorBot: { type: Boolean, default: false },
  comercialInterventor: { type: Schema.Types.ObjectId, ref: 'Usuario' }, // Si se transfirió a un humano
  timestampDispositivo: { type: Date, default: Date.now }
}, { timestamps: true });

MensajeSchema.index({ cliente: 1, createdAt: -1 });

const Mensaje = mongoose.model('Mensaje', MensajeSchema);

const CampanaSchema = new Schema({
  nombre: { type: String, required: true },
  tipoCanal: { type: String, enum: ['Email', 'WhatsApp Masivo'], required: true },
  segmentoFiltros: {
    zonaGeografica: { type: String },
    presupuestoMax: { type: Number }
  },
  fechaEnvio: { type: Date, default: Date.now },
  metricas: {
    totalEnviados: { type: Number, default: 0 },
    tasaApertura: { type: Number, default: 0 }, // Guardado en porcentaje
    tasaClics: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Campana = mongoose.model('Campana', CampanaSchema);

const AuditoriaSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion: { type: String, required: true }, // Ejemplo: 'ELIMINACION_INMUEBLE', 'LOGIN_EXITOSO'
  descripcion: { type: String, required: true }, // Detalles de los cambios o del recurso alterado
  direccionIP: { type: String, default: '0.0.0.0' }
}, { timestamps: true }); // createdAt actúa como el timestamp de la acción

// Índice TTL (Time-To-Live) opcional para que los logs expiren automáticamente tras un periodo si se desea.
AuditoriaSchema.index({ createdAt: -1 });

const Auditoria = mongoose.model('Auditoria', AuditoriaSchema);

//Resumen de Relaciones (Diagrama de Referencias Lógicas)inmuebles.datosPrivados.captadorAsignado $\rightarrow$ usuarios._idinmuebles.clientesInteresados $\rightarrow$ Array de clientes._idinmuebles.contratosGenerados $\rightarrow$ Array de contratos._idclientes.comercialResponsable $\rightarrow$ usuarios._idvisitas.cliente $\rightarrow$ clientes._idvisitas.inmueble $\rightarrow$ inmuebles._idvisitas.comercialAsignado $\rightarrow$ usuarios._idcontratos.plantillaOrigen $\rightarrow$ plantillas._idcontratos.inmueble $\rightarrow$ inmuebles._idcontratos.cliente $\rightarrow$ clientes._idmensajes.cliente $\rightarrow$ clientes._idauditoria.usuario $\rightarrow$ usuarios._id