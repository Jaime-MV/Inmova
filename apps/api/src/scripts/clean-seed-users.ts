/**
 * Script de limpieza: elimina usuarios semilla predefinidos de la base de datos.
 * Ejecutar una sola vez: pnpm --filter api exec tsx src/scripts/clean-seed-users.ts
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inmova';

const SEED_EMAILS = [
  'elena.admin@inmova.com',
  'sofia.sales@inmova.com',
  'javier.captas@inmova.com'
];

async function cleanSeedUsers() {
  console.log('[Cleanup] Conectando a MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('[Cleanup] Conectado.');

  // Eliminar usuarios semilla si existen
  const result = await mongoose.connection.db
    ?.collection('usuarios')
    .deleteMany({ correo: { $in: SEED_EMAILS } });

  if (result && result.deletedCount > 0) {
    console.log(`[Cleanup] ${result.deletedCount} usuario(s) semilla eliminado(s).`);
  } else {
    console.log('[Cleanup] No se encontraron usuarios semilla para eliminar.');
  }

  await mongoose.disconnect();
  console.log('[Cleanup] Listo. Base de datos limpia.');
}

cleanSeedUsers().catch((err) => {
  console.error('[Cleanup] Error:', err.message);
  process.exit(1);
});
