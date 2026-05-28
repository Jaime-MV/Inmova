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

  const result = await db.collection('plantillas').deleteMany({
    titulo: { $in: ['Contrato de Arras Penitenciales Estándar', 'Contrato de alquiler'] }
  });

  console.log(`Deleted ${result.deletedCount} old templates.`);

  const remaining = await db.collection('plantillas').find().toArray();
  console.log(`Remaining templates count: ${remaining.length}`);
  remaining.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.tipoContrato}] - ${p.titulo}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
