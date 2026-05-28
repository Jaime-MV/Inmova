import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlantilla extends Document {
  titulo: string;
  tipoContrato: 'Alquiler' | 'Arras' | 'Honorarios del Comprador' | 'Honorarios del Vendedor' | 'Recibo de llaves' | 'Devolución de llaves';
  contenidoHTML: string;
  variablesPermitidas?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlantillaSchema = new Schema<IPlantilla>(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio.'],
      trim: true
    },
    tipoContrato: {
      type: String,
      enum: ['Alquiler', 'Arras', 'Honorarios del Comprador', 'Honorarios del Vendedor', 'Recibo de llaves', 'Devolución de llaves'],
      required: [true, 'El tipo de contrato es obligatorio.']
    },
    contenidoHTML: {
      type: String,
      required: [true, 'El contenido HTML es obligatorio.']
    },
    variablesPermitidas: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'plantillas'
  }
);

export const PlantillaModel: Model<IPlantilla> = mongoose.model<IPlantilla>(
  'Plantilla',
  PlantillaSchema
);
