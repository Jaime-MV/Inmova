import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────
// INTERFACES (Tipado TypeScript)
// ─────────────────────────────────────────────

export interface IEmpresaInfo {
  nombreEmpresa: string;
  rfc?: string;
  sitioWeb?: string;
}

export interface IUsuario extends Document {
  nombre: string;
  correo: string;
  password: string;           // Hash SHA-256
  rol: 'Administrador' | 'Asesor Inmobiliario' | 'Captador';
  tipoCuenta: 'personal' | 'empresarial';
  estado: 'activo' | 'inactivo' | 'suspendido';
  avatarUrl?: string | null;
  empresaInfo?: IEmpresaInfo;
  grupoTrabajoId?: mongoose.Types.ObjectId | null; // Grupo de trabajo al que pertenece (solo usuarios personales)
  fechaRegistro: Date;
}

// ─────────────────────────────────────────────
// ESQUEMA MONGOOSE
// ─────────────────────────────────────────────

const UsuarioSchema = new Schema<IUsuario>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true
    },
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.']
    },
    rol: {
      type: String,
      enum: ['Administrador', 'Asesor Inmobiliario', 'Captador'],
      required: [true, 'El rol es obligatorio.']
    },
    tipoCuenta: {
      type: String,
      enum: ['personal', 'empresarial'],
      required: [true, 'El tipo de cuenta es obligatorio.']
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo', 'suspendido'],
      default: 'activo'
    },
    avatarUrl: {
      type: String,
      default: null
    },
    empresaInfo: {
      nombreEmpresa: { type: String },
      rfc: { type: String },
      sitioWeb: { type: String }
    },
    grupoTrabajoId: {
      type: Schema.Types.ObjectId,
      ref: 'GrupoTrabajo',
      default: null
    },
    fechaRegistro: {
      type: Date,
      default: Date.now
    }
  },
  {
    // Agrega automáticamente createdAt y updatedAt
    timestamps: true,
    // Nunca devolver el hash de contraseña en las respuestas JSON
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r['password'];
        return r;
      }
    }
  }
);

// ─────────────────────────────────────────────
// MODELO
// ─────────────────────────────────────────────

export const UsuarioModel: Model<IUsuario> = mongoose.model<IUsuario>(
  'Usuario',
  UsuarioSchema
);
