import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PlantillaModel } from '../../../src/entities/plantilla.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:Catolica10@ac-sfiydvm-shard-00-00.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-01.rouit62.mongodb.net:27017,ac-sfiydvm-shard-00-02.rouit62.mongodb.net:27017/inmova?authSource=admin&tls=true&appName=Inmova';

const defaultPlantillas = [
  {
    titulo: 'Contrato de Arrendamiento de Vivienda Estándar',
    tipoContrato: 'Alquiler',
    variablesPermitidas: [
      '{nombre_cliente}', '{correo_cliente}', '{telefono_cliente}',
      '{inmueble_direccion}', '{inmueble_tipo}', '{inmueble_superficie}',
      '{inmueble_referencia}', '{inmueble_ciudad}', '{inmueble_departamento}',
      '{duracion_meses}', '{fecha_firma}', '{fecha_efectiva}',
      '{precio_alquiler}', '{deposito_garantia}'
    ],
    contenidoHTML: '<div>Test 1</div>'
  },
  {
    titulo: 'Contrato de Arras Penitenciales de Compraventa',
    tipoContrato: 'Arras',
    variablesPermitidas: [
      '{nombre_cliente}', '{correo_cliente}', '{telefono_cliente}',
      '{inmueble_direccion}', '{inmueble_referencia}', '{inmueble_ciudad}',
      '{inmueble_departamento}', '{inmueble_precio}', '{cantidad_arras}',
      '{plazo_escritura_meses}', '{fecha_firma}'
    ],
    contenidoHTML: '<div>Test 2</div>'
  },
  {
    titulo: 'Acuerdo de Encargo de Compra y Honorarios Profesionales',
    tipoContrato: 'Honorarios del Comprador',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_precio}', '{inmueble_ciudad}', '{comision_porcentaje}',
      '{fecha_firma}'
    ],
    contenidoHTML: '<div>Test 3</div>'
  },
  {
    titulo: 'Contrato de Mandato de Venta en Exclusiva y Honorarios',
    tipoContrato: 'Honorarios del Vendedor',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_precio}', '{inmueble_ciudad}', '{inmueble_departamento}',
      '{comision_vendedor_porcentaje}', '{plazo_exclusividad_meses}', '{fecha_firma}'
    ],
    contenidoHTML: '<div>Test 4</div>'
  },
  {
    titulo: 'Acta de Entrega de Llaves y Posesión',
    tipoContrato: 'Recibo de llaves',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_ciudad}', '{motivo_entrega}', '{num_llaves_entregadas}',
      '{fecha_firma}'
    ],
    contenidoHTML: '<div>Test 5</div>'
  },
  {
    titulo: 'Acta de Devolución de Llaves y Rescisión',
    tipoContrato: 'Devolución de llaves',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_ciudad}', '{estado_inmueble}', '{fecha_firma}'
    ],
    contenidoHTML: '<div>Test 6</div>'
  }
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB via Mongoose.');

  for (const dp of defaultPlantillas) {
    try {
      console.log(`Checking template: "${dp.titulo}"...`);
      const exists = await PlantillaModel.findOne({ titulo: dp.titulo });
      if (!exists) {
        console.log(`  Not found in DB, attempting to save...`);
        const modelInstance = new PlantillaModel(dp);
        await modelInstance.save();
        console.log(`  Saved successfully!`);
      } else {
        console.log(`  Already exists in DB (ID: ${exists._id})`);
      }
    } catch (err: any) {
      console.error(`  Failed for: "${dp.titulo}"`);
      console.error(err);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
