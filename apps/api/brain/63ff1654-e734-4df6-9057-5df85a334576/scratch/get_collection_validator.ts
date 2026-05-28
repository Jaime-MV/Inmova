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

  // Get collection information including validators
  const collections = await db.listCollections({ name: 'plantillas' }).toArray();
  console.log('Collection Info for "plantillas":');
  console.log(JSON.stringify(collections, null, 2));

  // Let's also try to insert one and catch the validation error with full details
  try {
    const dp = {
      titulo: 'Contrato de Arrendamiento de Vivienda Estándar',
      tipoContrato: 'Alquiler',
      variablesPermitidas: [
        '{nombre_cliente}', '{correo_cliente}', '{telefono_cliente}'
      ],
      contenidoHTML: '<div>Test</div>',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('plantillas').insertOne(dp);
    console.log('Test insert succeeded');
  } catch (err: any) {
    console.error('Test insert failed with error:');
    if (err.errInfo) {
      console.error(JSON.stringify(err.errInfo, null, 2));
    } else {
      console.error(err);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
