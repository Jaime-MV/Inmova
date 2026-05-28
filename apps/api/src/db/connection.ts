import mongoose from 'mongoose';

// Importar todos los modelos para asegurar que se registren en Mongoose al iniciar la app
import '../entities/usuario.entity.js';
import '../entities/inmueble.entity.js';
import '../entities/cliente.entity.js';
import '../entities/visita.entity.js';
import '../entities/contrato.entity.js';
import '../entities/plantilla.entity.js';
import '../entities/grupoTrabajo.entity.js';
import '../entities/auditoria.entity.js';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inmova';

/**
 * Establece la conexión a la base de datos MongoDB.
 * Llama a esta función una sola vez al arrancar la aplicación.
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[DB] Conectado a MongoDB: ${MONGODB_URI}`);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[DB] Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}
