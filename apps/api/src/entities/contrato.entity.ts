import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IValoresDinamicos {
  duracionMeses?: number;
  precioAcordado?: number;
  fechaEfectiva?: Date;
}

export interface IContrato extends Document {
  folioReferencia: string;
  plantillaOrigen: mongoose.Types.ObjectId;
  inmueble: mongoose.Types.ObjectId;
  cliente: mongoose.Types.ObjectId;
  comercialFirmante: mongoose.Types.ObjectId;
  valoresDinamicosAplicados?: Record<string, any>;
  pdfStorageUrl: string;
  usuarioId?: mongoose.Types.ObjectId | null;
  grupoTrabajoId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ContratoSchema = new Schema<IContrato>(
  {
    folioReferencia: {
      type: String,
      required: [true, 'El folio de referencia es obligatorio.'],
      unique: true,
      trim: true
    },
    plantillaOrigen: {
      type: Schema.Types.ObjectId,
      ref: 'Plantilla',
      required: [true, 'La plantilla de origen es obligatoria.']
    },
    inmueble: {
      type: Schema.Types.ObjectId,
      ref: 'Inmueble',
      required: [true, 'El inmueble es obligatorio.']
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'El cliente es obligatorio.']
    },
    comercialFirmante: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El comercial firmante es obligatorio.']
    },
    valoresDinamicosAplicados: {
      type: Schema.Types.Mixed,
      default: {}
    },
    pdfStorageUrl: {
      type: String,
      required: [true, 'La URL del PDF es obligatoria.']
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
    },
    grupoTrabajoId: {
      type: Schema.Types.ObjectId,
      ref: 'GrupoTrabajo',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'contratos'
  }
);

ContratoSchema.index({ grupoTrabajoId: 1, usuarioId: 1 });

export const ContratoModel: Model<IContrato> = mongoose.model<IContrato>(
  'Contrato',
  ContratoSchema
);
