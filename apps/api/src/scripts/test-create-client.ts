import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClienteModel } from '../entities/cliente.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error('No MONGODB_URI found');
    return;
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  try {
    const testDoc = new ClienteModel({
      nombre: 'Test Client',
      correo: '',
      telefono: '',
      canalOrigen: 'Llamada',
      estadoLead: 'Nuevo',
      preferencias: {
        tipoInmuebleBuscado: 'Piso',
        zonaInteres: 'San Salvador',
        rangoPrecioMax: 0
      },
      usuarioId: new mongoose.Types.ObjectId(), // Dummy user ID
      grupoTrabajoId: null
    });

    console.log('Document to save:', JSON.stringify(testDoc.toObject(), null, 2));
    await testDoc.save();
    console.log('SUCCESS! Client saved successfully!');
  } catch (err: any) {
    console.error('ERROR SAVING CLIENT:');
    if (err.name === 'ValidationError') {
      console.error('Mongoose ValidationError:', JSON.stringify(err.errors, null, 2));
    } else {
      console.error(err);
      if (err.errInfo) {
        console.error('MongoDB errInfo:', JSON.stringify(err.errInfo, null, 2));
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
