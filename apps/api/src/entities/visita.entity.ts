import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVisita extends Document {
  cliente: mongoose.Types.ObjectId;
  inmueble: mongoose.Types.ObjectId;
  comercialAsignado: mongoose.Types.ObjectId;
  fechaHora: Date;
  estado: 'Programada' | 'En Proceso' | 'Finalizada' | 'Cancelada' | 'Suspendida' | 'No Presentado';
  observacionesPostVisita: string;
  grupoTrabajoId?: mongoose.Types.ObjectId | null;
  usuarioId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VisitaSchema = new Schema<IVisita>(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio.']
    },
    inmueble: {
      type: Schema.Types.ObjectId,
      ref: 'Inmueble',
      required: [true, 'El inmueble es obligatorio.']
    },
    comercialAsignado: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El comercial asignado es obligatorio.']
    },
    fechaHora: {
      type: Date,
      required: [true, 'La fecha y hora son obligatorias.']
    },
    estado: {
      type: String,
      enum: ['Programada', 'En Proceso', 'Finalizada', 'Cancelada', 'Suspendida', 'No Presentado'],
      default: 'Programada'
    },
    observacionesPostVisita: {
      type: String,
      trim: true,
      default: ''
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
    collection: 'visitas'
  }
);

VisitaSchema.index({ grupoTrabajoId: 1, usuarioId: 1 });
VisitaSchema.index({ fechaHora: 1, comercialAsignado: 1 });

export const VisitaModel: Model<IVisita> = mongoose.model<IVisita>(
  'Visita',
  VisitaSchema
);
