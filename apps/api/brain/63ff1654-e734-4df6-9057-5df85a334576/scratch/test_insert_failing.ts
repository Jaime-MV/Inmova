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

  const failingDoc = {
    titulo: 'Acuerdo de Encargo de Compra y Honorarios Profesionales',
    tipoContrato: 'Honorarios del Comprador',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_precio}', '{inmueble_ciudad}', '{comision_porcentaje}',
      '{fecha_firma}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">ENCARGO DE ASESORÍA Y HONORARIOS DE COMPRA</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">REUNIDOS</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">De una parte, la agencia de servicios inmobiliarios INMOVA, y de otra parte, Don/Doña <b>{nombre_cliente}</b> en su calidad de CLIENTE COMPRADOR.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">ACUERDOS</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">El CLIENTE encomienda formalmente a INMOVA la mediación comercial, consultoría jurídica y acompañamiento de compra sobre la propiedad ubicada en <b>{inmueble_direccion}</b> con número de referencia de catálogo <b>{inmueble_referencia}</b>, cuyo valor oficial de comercialización es de <b>$ {inmueble_precio} USD</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">CLÁUSULAS</h3>
  <ol style="padding-left: 20px; text-align: justify; font-size: 14px; margin-bottom: 25px;">
    <li style="margin-bottom: 12px;"><b>HONORARIOS PROFESIONALES:</b> El CLIENTE se obliga a pagar a la agencia inmobiliaria en concepto de honorarios profesionales de intermediación la cantidad correspondiente al <b>{comision_porcentaje} %</b> calculado sobre el valor final de venta del inmueble.</li>
    <li style="margin-bottom: 12px;"><b>DEVENGAMIENTO:</b> Los honorarios comerciales se considerarán plenamente devengados y exigibles en la fecha de firma del contrato de arras o de la firma de Escritura Pública ante el Notario.</li>
  </ol>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por la Agencia:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;">Asesor de Compra INMOVA</p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por el Cliente Comprador:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_cliente}</b></p>
    </div>
  </div>
</div>`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    await db.collection('plantillas').insertOne(failingDoc);
    console.log('Insert succeeded');
  } catch (err: any) {
    console.error('Insert failed with details:');
    if (err.errInfo) {
      console.error(JSON.stringify(err.errInfo, null, 2));
    } else {
      console.error(err);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
