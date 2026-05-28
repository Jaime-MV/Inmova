import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:Catolica10@ac-sfiydvm-shard-00-00.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-01.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-02.rouit62.mongodb.net:27017/inmova?authSource=admin&tls=true&appName=Inmova';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database object');
    await mongoose.disconnect();
    return;
  }

  // Check plantillas
  const plantillas = await db.collection('plantillas').find().toArray();
  console.log(`\n--- PLANTILLAS (${plantillas.length}) ---`);
  plantillas.forEach((p, idx) => {
    console.log(`${idx + 1}. Title: "${p.titulo}", Type: "${p.tipoContrato}", ID: ${p._id}`);
  });

  // Check contratos
  const contratos = await db.collection('contratos').find().toArray();
  console.log(`\n--- CONTRATOS (${contratos.length}) ---`);
  contratos.forEach((c, idx) => {
    console.log(`${idx + 1}. Folio: "${c.folioReferencia}", Template ID: ${c.plantillaOrigen}, User ID: ${c.usuarioId}, Workgroup ID: ${c.grupoTrabajoId}`);
  });

  // Check collection validator info for plantillas and contratos
  const colls = await db.listCollections().toArray();
  console.log(`\n--- COLLECTIONS & VALIDATORS ---`);
  for (const col of colls) {
    if (col.name === 'plantillas' || col.name === 'contratos') {
      console.log(`Collection: ${col.name}`);
      console.log(`Validator:`, JSON.stringify(col.options?.validator || null, null, 2));
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
