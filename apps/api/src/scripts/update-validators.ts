import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('Connected successfully!');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  // 1. UPDATE CLIENTES VALIDATOR
  console.log('Updating "clientes" collection validator...');
  try {
    const collInfo = await db.listCollections({ name: 'clientes' }).next();
    if (!collInfo) {
      console.log('Collection "clientes" does not exist. Creating it...');
      await db.createCollection('clientes');
    }

    const result = await db.command({
      collMod: 'clientes',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['nombre', 'canalOrigen', 'estadoLead'], // relaxed required fields (removed correo and telefono)
          properties: {
            _id: { bsonType: 'objectId' },
            nombre: {
              bsonType: 'string',
              description: 'Nombre completo del cliente prospecto (Requerido)'
            },
            correo: {
              bsonType: 'string',
              pattern: '^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', // allow empty string or valid email
              description: 'Correo electrónico de contacto (Opcional, debe ser válido si se provee)'
            },
            telefono: {
              bsonType: 'string',
              description: 'Teléfono de contacto (Opcional)'
            },
            canalOrigen: {
              bsonType: 'string',
              enum: ['WhatsApp', 'Facebook', 'Email', 'Manual', 'Llamada', 'Web'], // expanded to match entity schema
              description: 'Canal por el cual ingresó el lead'
            },
            estadoLead: {
              bsonType: 'string',
              enum: ['Nuevo', 'Contactado', 'Interesado', 'Visita Programada', 'Oferta', 'Cerrado', 'Descartado'],
              description: 'Fase actual en el pipeline CRM (Requerido)'
            },
            preferencias: {
              bsonType: 'object',
              properties: {
                tipoInmuebleBuscado: {
                  bsonType: 'string',
                  enum: ['Piso', 'Casa', 'Local', 'Solar', 'Inmueble Singular', 'Lote', 'Chalet', 'Oficina', 'Loft', ''] // expanded
                },
                zonaInteres: { bsonType: 'string' },
                rangoPrecioMax: { type: 'number', minimum: 0 },
                rangoPrecioMin: { type: 'number', minimum: 0 },
                habitacionesRequeridas: { type: 'number', minimum: 0 }
              }
            },
            comercialResponsable: {
              bsonType: ['objectId', 'null'],
              description: 'Referencia al comercial asignado para seguimiento'
            },
            notasInternas: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['autor', 'contenido', 'fecha'],
                properties: {
                  autor: { bsonType: 'objectId', description: 'Comercial que escribe la nota' },
                  contenido: { bsonType: 'string', description: 'Texto de la nota' },
                  fecha: { bsonType: 'date' }
                }
              }
            },
            usuarioId: {
              bsonType: 'objectId',
              description: 'Referencia al usuario creador (Requerido)'
            },
            grupoTrabajoId: {
              bsonType: ['objectId', 'null'],
              description: 'Referencia al grupo de trabajo'
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('"clientes" validator updated successfully:', result);
  } catch (err: any) {
    console.error('Error updating "clientes" validator:', err);
  }

  // 2. UPDATE INMUEBLES VALIDATOR
  console.log('Updating "inmuebles" collection validator...');
  try {
    const collInfo = await db.listCollections({ name: 'inmuebles' }).next();
    if (!collInfo) {
      console.log('Collection "inmuebles" does not exist. Creating it...');
      await db.createCollection('inmuebles');
    }

    const result = await db.command({
      collMod: 'inmuebles',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'referenciaInterna',
            'tipoInmueble',
            'estado',
            'precioVenta',
            'caracteristicas',
            'descripcion',
            'direccion',
            'ciudad',
            'departamento',
            'datosPrivados',
            'propietarios'
          ],
          properties: {
            _id: { bsonType: 'objectId' },
            referenciaInterna: {
              bsonType: 'string',
              description: 'Código de referencia interno único y en mayúsculas (Requerido)'
            },
            referenciaProveedor: {
              bsonType: 'string',
              description: 'Código de referencia del portal o proveedor externo'
            },
            estado: {
              bsonType: 'string',
              enum: ['Prospecto', 'Disponible', 'Reservado', 'Vendido'],
              description: 'Estado en el embudo del inmueble (Requerido)'
            },
            tipoInmueble: {
              bsonType: 'string',
              enum: ['Piso', 'Casa', 'Local', 'Solar', 'Inmueble Singular', 'Lote', 'Chalet', 'Oficina', 'Loft'], // expanded to match entity schema
              description: 'Tipo de propiedad inmobiliaria (Requerido)'
            },
            precioVenta: {
              type: 'number',
              minimum: 0,
              description: 'Precio actual de venta (Requerido y >= 0)'
            },
            precioValoracion: {
              type: 'number',
              minimum: 0,
              description: 'Precio de valoración inicial estimado'
            },
            caracteristicas: {
              bsonType: 'object',
              required: ['superficieTotal'],
              properties: {
                dormitorios: { type: 'number', minimum: 0 },
                banos: { type: 'number', minimum: 0 },
                superficieTotal: { type: 'number', minimum: 0, description: 'Superficie total construida (Requerido)' },
                superficieUtil: { type: 'number', minimum: 0 },
                superficieParcela: { type: 'number', minimum: 0 },
                planta: { bsonType: 'string' },
                anoConstruccion: { type: 'number' },
                certificadoEnergetico: { bsonType: 'string' }
              }
            },
            descripcion: {
              bsonType: 'string',
              description: 'Descripción comercial detallada (Requerido)'
            },
            direccion: {
              bsonType: 'string',
              description: 'Dirección física del inmueble (Requerido)'
            },
            ciudad: {
              bsonType: 'string',
              description: 'Ciudad (Requerido)'
            },
            departamento: {
              bsonType: 'string',
              description: 'Departamento o provincia (Requerido)'
            },
            zona: {
              bsonType: 'string',
              description: 'Zona o barrio donde se localiza el inmueble (Opcional)'
            },
            ubicacionGmapsUrl: {
              bsonType: 'string',
              description: 'Enlace a la ubicación geográfica en Google Maps'
            },
            imagenes: {
              bsonType: 'array',
              maxItems: 30,
              items: { bsonType: 'string' },
              description: 'Lista de URLs de imágenes en Supabase Storage (Máx 30)'
            },
            caracteristicasEspeciales: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
                enum: ['Jardín', 'Obra Nueva', 'Inmueble Singular', 'Solar', 'Vistas al Monte', 'Zona Verde', 'Piscina', 'Garaje']
              }
            },
            alrededores: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            datosPrivados: {
              bsonType: 'object',
              required: ['captadorAsignado'],
              properties: {
                captadorAsignado: {
                  bsonType: 'objectId',
                  description: 'Referencia al usuario captador asignado (Requerido)'
                },
                honorariosPactados: {
                  type: 'number',
                  minimum: 0,
                  description: 'Monto de honorarios o comisión acordada'
                },
                ultimaAccionEfectuada: {
                  bsonType: 'string',
                  description: 'Último cambio o acción registrada por auditoría interna'
                }
              }
            },
            propietarios: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['nombre', 'correo', 'telefono'],
                properties: {
                  nombre: { bsonType: 'string' },
                  correo: { bsonType: 'string', pattern: '^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }, // allow empty string or valid email
                  telefono: { bsonType: 'string' },
                  esPrincipal: { bsonType: 'bool' }
                }
              },
              description: 'Lista de propietarios vinculados al inmueble (Requerido)'
            },
            clientesInteresados: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
              description: 'Clientes del CRM que han mostrado interés en esta propiedad'
            },
            contratosGenerados: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
              description: 'Historial de contratos asociados a este inmueble'
            },
            usuarioId: {
              bsonType: 'objectId',
              description: 'Referencia al usuario creador (Requerido)'
            },
            grupoTrabajoId: {
              bsonType: ['objectId', 'null'],
              description: 'Referencia al grupo de trabajo'
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('"inmuebles" validator updated successfully:', result);
  } catch (err: any) {
    console.error('Error updating "inmuebles" validator:', err);
  }

  // 3. UPDATE VISITAS VALIDATOR
  console.log('Updating "visitas" collection validator...');
  try {
    const collInfo = await db.listCollections({ name: 'visitas' }).next();
    if (!collInfo) {
      console.log('Collection "visitas" does not exist. Creating it...');
      await db.createCollection('visitas');
    }

    const result = await db.command({
      collMod: 'visitas',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['cliente', 'inmueble', 'fechaHora', 'estado'], // Removed 'comercialAsignado' from strictly required if it is missing, or keep it if handled. But we noticed in controller it wasn't specified in creation!
          properties: {
            _id: { bsonType: 'objectId' },
            cliente: {
              bsonType: 'objectId',
              description: 'ObjectId del cliente que realiza la visita (Requerido)'
            },
            inmueble: {
              bsonType: 'objectId',
              description: 'ObjectId del inmueble visitado (Requerido)'
            },
            comercialAsignado: {
              bsonType: ['objectId', 'null'], // Relaxed to optional or null
              description: 'Comercial que acompaña y gestiona la visita'
            },
            fechaHora: {
              bsonType: 'date',
              description: 'Fecha y hora programada para el encuentro (Requerido)'
            },
            estado: {
              bsonType: 'string',
              enum: ['Programada', 'En Proceso', 'Finalizada', 'Cancelada', 'Suspendida', 'No Presentado'],
              description: 'Estado de la agenda de la visita (Requerido)'
            },
            observacionesPostVisita: {
              bsonType: 'string',
              description: 'Feedback brindado por el comercial o el cliente después del recorrido'
            },
            usuarioId: {
              bsonType: 'objectId',
              description: 'Referencia al usuario creador (Requerido)'
            },
            grupoTrabajoId: {
              bsonType: ['objectId', 'null'],
              description: 'Referencia al grupo de trabajo'
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    });
    console.log('"visitas" validator updated successfully:', result);
  } catch (err: any) {
    console.error('Error updating "visitas" validator:', err);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch((err) => {
  console.error('Fatal error running update-validators:', err);
  process.exit(1);
});
