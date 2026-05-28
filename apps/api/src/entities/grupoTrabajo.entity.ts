import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────
// INTERFACES (Tipado TypeScript)
// ─────────────────────────────────────────────

export interface IGrupoTrabajo extends Document {
  nombre: string;
  codigo: string;                         // Código único de 6 caracteres (e.g. "AB12CD")
  propietarioId: mongoose.Types.ObjectId; // Usuario personal que creó el grupo
  miembros: mongoose.Types.ObjectId[];    // Todos los usuarios vinculados (incluye propietario)
  limiteMiembros: number;                 // Límite máximo de miembros
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// ESQUEMA MONGOOSE
// ─────────────────────────────────────────────

const GrupoTrabajoSchema = new Schema<IGrupoTrabajo>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del grupo es obligatorio.'],
      trim: true,
      maxlength: [80, 'El nombre del grupo no puede superar 80 caracteres.']
    },
    codigo: {
      type: String,
      required: [true, 'El código de invitación es obligatorio.'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 6
    },
    propietarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El propietario del grupo es obligatorio.']
    },
    miembros: {
      type: [Schema.Types.ObjectId],
      ref: 'Usuario',
      default: []
    },
    limiteMiembros: {
      type: Number,
      default: 10,
      min: [1, 'El límite de miembros debe ser al menos 1.']
    }
  },
  {
    timestamps: true,
    collection: 'grupos_trabajo'
  }
);


// ─────────────────────────────────────────────
// MODELO
// ─────────────────────────────────────────────

export const GrupoTrabajoModel: Model<IGrupoTrabajo> = mongoose.model<IGrupoTrabajo>(
  'GrupoTrabajo',
  GrupoTrabajoSchema
);
