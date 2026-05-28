import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditoria extends Document {
  usuario: mongoose.Types.ObjectId;
  accion: string;
  descripcion: string;
  direccionIP: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditoriaSchema = new Schema<IAuditoria>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El ID de usuario es obligatorio.']
    },
    accion: {
      type: String,
      required: [true, 'La acción es obligatoria.'],
      trim: true
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria.'],
      trim: true
    },
    direccionIP: {
      type: String,
      required: [true, 'La dirección IP es obligatoria.'],
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'auditorias'
  }
);

AuditoriaSchema.index({ createdAt: -1 });

export const AuditoriaModel: Model<IAuditoria> = mongoose.model<IAuditoria>(
  'Auditoria',
  AuditoriaSchema
);
