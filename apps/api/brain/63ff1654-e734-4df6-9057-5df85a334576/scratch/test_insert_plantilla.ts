import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:Catolica10@ac-sfiydvm-shard-00-00.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-01.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-02.rouit62.mongodb.net:27017/inmova?authSource=admin&tls=true&appName=Inmova';

const dp = {
  titulo: 'Acuerdo de Encargo de Compra y Honorarios Profesionales',
  tipoContrato: 'Honorarios del Comprador',
  variablesPermitidas: [
    '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
    '{inmueble_precio}', '{inmueble_ciudad}', '{comision_porcentaje}',
    '{fecha_firma}'
  ],
  contenidoHTML: `TEST`
};

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database object');
    await mongoose.disconnect();
    return;
  }

  try {
    await db.collection('plantillas').insertOne(dp);
    console.log('SUCCESS inserting');
  } catch (err: any) {
    console.error('ERROR inserting:', JSON.stringify(err.errInfo || err, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
