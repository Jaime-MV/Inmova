import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:Catolica10@ac-sfiydvm-shard-00-00.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-01.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-02.rouit62.mongodb.net:27017/inmova?authSource=admin&tls=true&appName=Inmova';
const JWT_SECRET = process.env.JWT_SECRET || 'inmova_jwt_secret_key_2025_seguro';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database object');
    await mongoose.disconnect();
    return;
  }

  // Find the guest user
  const user = await db.collection('usuarios').findOne({ correo: 'guest@platmod.com' });
  if (!user) {
    console.error('User guest@platmod.com not found!');
    await mongoose.disconnect();
    return;
  }

  console.log('User ID:', user._id);
  console.log('User grupoTrabajoId:', user.grupoTrabajoId);

  // Generate token
  const payload = {
    id: user._id.toString(),
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    tipoCuenta: user.tipoCuenta
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  console.log('Generated JWT Token successfully.');

  await mongoose.disconnect();

  // Now, make HTTP requests to the running backend
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-workspace-mode': 'grupo'
  };

  console.log('\n--- FETCHING /api/dashboard/plantillas ---');
  try {
    const resPl = await fetch('http://localhost:3000/api/dashboard/plantillas', { headers });
    console.log('Status:', resPl.status);
    const dataPl = await resPl.json();
    console.log('Response (sample or length):', Array.isArray(dataPl) ? `Array of length ${dataPl.length}` : dataPl);
    if (Array.isArray(dataPl) && dataPl.length > 0) {
      console.log('First plantilla:', dataPl[0]);
    }
  } catch (err: any) {
    console.error('Fetch plantillas error:', err.message);
  }

  console.log('\n--- FETCHING /api/dashboard/contratos ---');
  try {
    const resCo = await fetch('http://localhost:3000/api/dashboard/contratos', { headers });
    console.log('Status:', resCo.status);
    const dataCo = await resCo.json();
    console.log('Response (sample or length):', Array.isArray(dataCo) ? `Array of length ${dataCo.length}` : dataCo);
    if (Array.isArray(dataCo) && dataCo.length > 0) {
      console.log('First contrato:', dataCo[0]);
    }
  } catch (err: any) {
    console.error('Fetch contratos error:', err.message);
  }
}

run().catch(console.error);
