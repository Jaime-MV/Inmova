import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inmova';
if (MONGODB_URI.includes('?') && !MONGODB_URI.split('?')[0].endsWith('/inmova')) {
  const parts = MONGODB_URI.split('?');
  if (parts[0].endsWith('/')) {
    parts[0] = parts[0] + 'inmova';
  } else {
    parts[0] = parts[0] + '/inmova';
  }
  MONGODB_URI = parts.join('?');
}

async function run() {
  console.log('Conectando a:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado con éxito.');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No se pudo obtener el objeto db');
    process.exit(1);
  }

  const collections = await db.listCollections().toArray();
  console.log('Colecciones:', collections.map(c => c.name));

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`Colección ${col.name}: ${count} documentos`);
    if (count > 0) {
      const docs = await db.collection(col.name).find().limit(2).toArray();
      console.log(`Muestras de ${col.name}:`, JSON.stringify(docs, null, 2));
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
