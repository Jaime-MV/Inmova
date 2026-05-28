import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICaracteristicas {
  dormitorios: number;
  banos: number;
  superficieTotal: number;
  superficieUtil?: number;
  superficieParcela?: number;
  planta?: string;
  anoConstruccion?: number;
  certificadoEnergetico?: string;
}

export interface IDatosPrivados {
  captadorAsignado: mongoose.Types.ObjectId;
  honorariosPactados?: number;
  ultimaAccionEfectuada?: string;
}

export interface IComunicacionPropietario {
  fecha: Date;
  tipo: 'Llamada' | 'Email' | 'WhatsApp' | 'Reunión' | 'Otra';
  nota: string;
}

export interface IPropietario {
  nombre: string;
  correo: string;
  telefono: string;
  esPrincipal?: boolean;
  comunicaciones?: IComunicacionPropietario[];
}

export interface IInmueble extends Document {
  referenciaInterna: string;
  referenciaProveedor?: string;
  estado: 'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido';
  tipoInmueble: 'Piso' | 'Casa' | 'Local' | 'Solar' | 'Inmueble Singular' | 'Lote' | 'Chalet' | 'Oficina' | 'Loft';
  precioVenta: number;
  precioValoracion?: number;
  caracteristicas: ICaracteristicas;
  descripcion: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  zona?: string;
  ubicacionGmapsUrl?: string;
  imagenes?: string[];
  caracteristicasEspeciales?: ('Jardín' | 'Obra Nueva' | 'Inmueble Singular' | 'Solar' | 'Vistas al Monte' | 'Zona Verde' | 'Piscina' | 'Garaje')[];
  alrededores?: string[];
  datosPrivados: IDatosPrivados;
  propietarios: IPropietario[];
  clientesInteresados?: mongoose.Types.ObjectId[];
  contratosGenerados?: mongoose.Types.ObjectId[];
  grupoTrabajoId?: mongoose.Types.ObjectId | null;
  usuarioId: mongoose.Types.ObjectId; // Creador del registro en la app
  createdAt: Date;
  updatedAt: Date;
}

const InmuebleSchema = new Schema<IInmueble>(
  {
    referenciaInterna: {
      type: String,
      required: [true, 'La referencia interna es obligatoria.'],
      unique: true,
      trim: true
    },
    referenciaProveedor: {
      type: String,
      trim: true,
      default: ''
    },
    estado: {
      type: String,
      enum: ['Disponible', 'Reservado', 'Prospecto', 'Vendido'],
      default: 'Disponible'
    },
    tipoInmueble: {
      type: String,
      enum: ['Piso', 'Casa', 'Local', 'Solar', 'Inmueble Singular', 'Lote', 'Chalet', 'Oficina', 'Loft'],
      required: [true, 'El tipo de inmueble es obligatorio.']
    },
    precioVenta: {
      type: Number,
      required: [true, 'El precio de venta es obligatorio.'],
      min: [0, 'El precio de venta no puede ser negativo.']
    },
    precioValoracion: {
      type: Number,
      min: [0, 'El precio de valoración no puede ser negativo.'],
      default: 0
    },
    caracteristicas: {
      dormitorios: { type: Number, default: 0, min: 0 },
      banos: { type: Number, default: 0, min: 0 },
      superficieTotal: { type: Number, required: [true, 'La superficie total es obligatoria.'], min: 0 },
      superficieUtil: { type: Number, default: 0, min: 0 },
      superficieParcela: { type: Number, default: 0, min: 0 },
      planta: { type: String, default: '' },
      anoConstruccion: { type: Number, default: 0 },
      certificadoEnergetico: { type: String, default: '' }
    },
    descripcion: {
      type: String,
      trim: true,
      required: [true, 'La descripción es obligatoria.']
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria.'],
      trim: true
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es obligatoria.'],
      trim: true
    },
    departamento: {
      type: String,
      required: [true, 'El departamento es obligatorio.'],
      trim: true
    },
    zona: {
      type: String,
      trim: true,
      default: ''
    },
    ubicacionGmapsUrl: {
      type: String,
      trim: true,
      default: ''
    },
    imagenes: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 30;
        },
        message: 'No puedes añadir más de 30 fotos.'
      },
      default: []
    },
    caracteristicasEspeciales: {
      type: [String],
      enum: ['Jardín', 'Obra Nueva', 'Inmueble Singular', 'Solar', 'Vistas al Monte', 'Zona Verde', 'Piscina', 'Garaje'],
      default: []
    },
    alrededores: {
      type: [String],
      default: []
    },
    datosPrivados: {
      captadorAsignado: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El captador asignado es obligatorio.']
      },
      honorariosPactados: {
        type: Number,
        min: 0,
        default: 0
      },
      ultimaAccionEfectuada: {
        type: String,
        default: 'Registro inicial'
      }
    },
    propietarios: {
      type: [
        new Schema({
          nombre: { type: String, required: true },
          correo: { type: String, required: true, trim: true },
          telefono: { type: String, required: true },
          esPrincipal: { type: Boolean, default: false },
          comunicaciones: {
            type: [
              {
                fecha: { type: Date, default: Date.now },
                tipo: { type: String, enum: ['Llamada', 'Email', 'WhatsApp', 'Reunión', 'Otra'], default: 'Llamada' },
                nota: { type: String, required: true }
              }
            ],
            default: []
          }
        }, { _id: false })
      ],
      required: [true, 'Debe haber al menos un propietario vinculado.'],
      validate: {
        validator: function (v: any[]) {
          return v.length > 0;
        },
        message: 'Debe haber al menos un propietario.'
      }
    },
    clientesInteresados: {
      type: [Schema.Types.ObjectId],
      ref: 'Cliente',
      default: []
    },
    contratosGenerados: {
      type: [Schema.Types.ObjectId],
      ref: 'Contrato',
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
    collection: 'inmuebles'
  }
);

// Índices optimizados
InmuebleSchema.index({ grupoTrabajoId: 1, usuarioId: 1 });
InmuebleSchema.index({ estado: 1, tipoInmueble: 1, precioVenta: 1 });

export const InmuebleModel: Model<IInmueble> = mongoose.model<IInmueble>(
  'Inmueble',
  InmuebleSchema
);
