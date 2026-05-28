import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PlantillaModel } from '../../../src/entities/plantilla.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:Catolica10@ac-sfiydvm-shard-00-00.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-01.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-02.rouit62.mongodb.net:27017/inmova?authSource=admin&tls=true&appName=Inmova';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  try {
    const plantillas = await PlantillaModel.find().sort({ createdAt: -1 });
    console.log(`Mongoose successfully found ${plantillas.length} templates:`);
    plantillas.forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.tipoContrato}] - ${p.titulo}`);
    });
  } catch (err: any) {
    console.error('ERROR during Mongoose PlantillaModel.find():', err);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
