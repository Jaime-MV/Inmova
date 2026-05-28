import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotaInterna {
  autor: mongoose.Types.ObjectId;
  contenido: string;
  fecha: Date;
}

export interface IPreferencias {
  tipoInmuebleBuscado?: 'Piso' | 'Casa' | 'Local' | 'Solar' | 'Inmueble Singular' | 'Lote' | 'Chalet' | 'Oficina' | 'Loft' | '';
  zonaInteres?: string;
  rangoPrecioMax?: number;
  rangoPrecioMin?: number;
  habitacionesRequeridas?: number;
}

export interface ICliente extends Document {
  nombre: string;
  correo: string;
  telefono: string;
  canalOrigen: 'WhatsApp' | 'Facebook' | 'Email' | 'Manual' | 'Llamada' | 'Web';
  estadoLead: 'Nuevo' | 'Contactado' | 'Interesado' | 'Visita Programada' | 'Oferta' | 'Cerrado' | 'Descartado';
  preferencias: IPreferencias;
  comercialResponsable?: mongoose.Types.ObjectId | null;
  notasInternas?: INotaInterna[];
  grupoTrabajoId?: mongoose.Types.ObjectId | null;
  usuarioId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClienteSchema = new Schema<ICliente>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true
    },
    correo: {
      type: String,
      lowercase: true,
      trim: true
    },
    telefono: {
      type: String,
      trim: true,
      default: ''
    },
    canalOrigen: {
      type: String,
      enum: ['WhatsApp', 'Facebook', 'Email', 'Manual', 'Llamada', 'Web'],
      default: 'Llamada'
    },
    estadoLead: {
      type: String,
      enum: ['Nuevo', 'Contactado', 'Interesado', 'Visita Programada', 'Oferta', 'Cerrado', 'Descartado'],
      default: 'Nuevo'
    },
    preferencias: {
      tipoInmuebleBuscado: { 
        type: String, 
        enum: ['Piso', 'Casa', 'Local', 'Solar', 'Inmueble Singular', 'Lote', 'Chalet', 'Oficina', 'Loft', ''], 
        default: '' 
      },
      zonaInteres: { type: String, default: '' },
      rangoPrecioMax: { type: Number, default: 0 },
      rangoPrecioMin: { type: Number, default: 0 },
      habitacionesRequeridas: { type: Number, default: 0 }
    },
    comercialResponsable: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
    },
    notasInternas: {
      type: [
        {
          autor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
          contenido: { type: String, required: true },
          fecha: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    grupoTrabajoId: {
      type: Schema.Types.ObjectId,
      ref: 'GrupoTrabajo',
      default: null
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El ID de usuario es obligatorio.']
    }
  },
  {
    timestamps: true,
    collection: 'clientes'
  }
);

ClienteSchema.index({ grupoTrabajoId: 1, usuarioId: 1 });
ClienteSchema.index({ correo: 1 }, { unique: true, sparse: true });

export const ClienteModel: Model<ICliente> = mongoose.model<ICliente>(
  'Cliente',
  ClienteSchema
);
