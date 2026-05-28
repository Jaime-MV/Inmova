import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{duracion_meses}', '{fecha_firma}', '{fecha_efectiva}',
      '{precio_alquiler}', '{deposito_garantia}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">CONTRATO DE ARRENDAMIENTO DE VIVIENDA</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, departamento de <b>{inmueble_departamento}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">REUNIDOS</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">De una parte, como ARRENDADOR (PROPIETARIO), Don/Doña <b>{nombre_propietario}</b>, con correo de contacto <b>{correo_propietario}</b> y número telefónico <b>{telefono_propietario}</b>, y de otra parte, como ARRENDATARIO, Don/Doña <b>{nombre_cliente}</b>, con correo de contacto <b>{correo_cliente}</b> y número telefónico <b>{telefono_cliente}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">DECLARAN</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">Que el ARRENDADOR es propietario del inmueble tipo <b>{inmueble_tipo}</b>, ubicado en la dirección exacta de <b>{inmueble_direccion}</b>, departamento de <b>{inmueble_departamento}</b>, con una superficie total habitable de <b>{inmueble_superficie} m²</b> y registrado bajo el número de catálogo interno <b>{inmueble_referencia}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">ESTIPULACIONES</h3>
  <ol style="padding-left: 20px; text-align: justify; font-size: 14px; margin-bottom: 25px;">
    <li style="margin-bottom: 12px;"><b>OBJETO Y DESTINO:</b> El arrendador cede en arrendamiento al arrendatario el inmueble residencial descrito anteriormente para su uso exclusivo como vivienda familiar. Queda prohibida la subcontratación o el uso comercial del mismo.</li>
    <li style="margin-bottom: 12px;"><b>PLAZO DE VIGENCIA:</b> El plazo de duración estipulado de este contrato será de <b>{duracion_meses} meses</b> obligatorios, entrando en vigor a partir del <b>{fecha_efectiva}</b>.</li>
    <li style="margin-bottom: 12px;"><b>PRECIO DE ALQUILER Y PAGO:</b> El precio de alquiler mensual pactado es de <b>$ {precio_alquiler} USD</b> netos, los cuales deberán ser depositados en la cuenta bancaria del arrendador dentro de los primeros cinco (5) días hábiles de cada mes.</li>
    <li style="margin-bottom: 12px;"><b>DEPÓSITO DE GARANTÍA:</b> El arrendatario hace entrega formal en este acto de la suma de <b>$ {deposito_garantia} USD</b> en concepto de depósito de garantía para responder de los posibles daños causados al inmueble o por incumplimiento de obligaciones. Dicho monto será devuelto al finalizar el contrato de no existir novedades.</li>
  </ol>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por el Arrendador:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_propietario}</b></p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por el Arrendatario:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_cliente}</b></p>
    </div>
  </div>
</div>`
  },
  {
    titulo: 'Contrato de Arras Penitenciales de Compraventa',
    tipoContrato: 'Arras',
    variablesPermitidas: [
      '{nombre_cliente}', '{correo_cliente}', '{telefono_cliente}',
      '{inmueble_direccion}', '{inmueble_referencia}', '{inmueble_ciudad}',
      '{inmueble_departamento}', '{inmueble_precio}', '{cantidad_arras}',
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{plazo_escritura_meses}', '{fecha_firma}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">CONTRATO DE ARRAS PENITENCIALES</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, departamento de <b>{inmueble_departamento}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">REUNIDOS</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">De una parte, Don/Doña <b>{nombre_propietario}</b> con correo electrónico <b>{correo_propietario}</b> y número de teléfono <b>{telefono_propietario}</b> en calidad de PARTE VENDEDORA (PROPIETARIO), y de otra parte, Don/Doña <b>{nombre_cliente}</b> en calidad de PARTE COMPRADORA, con correo electrónico <b>{correo_cliente}</b> y número de teléfono <b>{telefono_cliente}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">CLÁUSULAS</h3>
  <ol style="padding-left: 20px; text-align: justify; font-size: 14px; margin-bottom: 25px;">
    <li style="margin-bottom: 12px;"><b>OBJETO:</b> La PARTE VENDEDORA se compromete a vender a la PARTE COMPRADORA, que acepta, la propiedad ubicada en <b>{inmueble_direccion}</b>, departamento de <b>{inmueble_departamento}</b>, bajo la referencia de inventario <b>{inmueble_referencia}</b>, libre de toda carga, gravamen o arrendatarios.</li>
    <li style="margin-bottom: 12px;"><b>PRECIO DE LA COMPRAVENTA:</b> El precio total acordado por la transmisión del inmueble es de <b>$ {inmueble_precio} USD</b> netos.</li>
    <li style="margin-bottom: 12px;"><b>ARRAS:</b> En concepto de señal y arras penitenciales, la PARTE COMPRADORA entrega en este acto a la PARTE VENDEDORA la cantidad de <b>$ {cantidad_arras} USD</b>. Si la PARTE COMPRADORA desistiere de la compra, perderá dicha cantidad. Si fuere la PARTE VENDEDORA quien incumpliere, deberá devolver el doble de la suma recibida.</li>
    <li style="margin-bottom: 12px;"><b>PLAZO DE ESCRITURACIÓN:</b> Ambas partes fijan un plazo máximo de <b>{plazo_escritura_meses} meses</b> a partir del día de hoy para formalizar la compraventa mediante el otorgamiento de Escritura Pública ante el notario de elección de la PARTE COMPRADORA.</li>
  </ol>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por la Parte Vendedora:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_propietario}</b></p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por la Parte Compradora:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_cliente}</b></p>
    </div>
  </div>
</div>`
  },
  {
    titulo: 'Acuerdo de Encargo de Compra y Honorarios Profesionales',
    tipoContrato: 'Honorarios del Comprador',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_precio}', '{inmueble_ciudad}', '{comision_porcentaje}',
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{fecha_firma}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">ENCARGO DE ASESORÍA Y HONORARIOS DE COMPRA</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">REUNIDOS</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">De una parte, la agencia de servicios inmobiliarios INMOVA, y de otra parte, Don/Doña <b>{nombre_cliente}</b> en su calidad de CLIENTE COMPRADOR.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">ACUERDOS</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">El CLIENTE encomienda formalmente a INMOVA la mediación comercial, consultoría jurídica y acompañamiento de compra sobre la propiedad de Don/Doña <b>{nombre_propietario}</b> ubicada en <b>{inmueble_direccion}</b> con número de referencia de catálogo <b>{inmueble_referencia}</b>, cuyo valor oficial de comercialización es de <b>$ {inmueble_precio} USD</b>.</p>
  
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
</div>`
  },
  {
    titulo: 'Contrato de Mandato de Venta en Exclusiva y Honorarios',
    tipoContrato: 'Honorarios del Vendedor',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_precio}', '{inmueble_ciudad}', '{inmueble_departamento}',
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{comision_vendedor_porcentaje}', '{plazo_exclusividad_meses}', '{fecha_firma}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">CONTRATO DE MANDATO DE VENTA EN EXCLUSIVA</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, departamento de <b>{inmueble_departamento}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">PARTES</h3>
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">De una parte, la corporación INMOVA en calidad de mandataria, y de otra parte, Don/Doña <b>{nombre_propietario}</b> con correo electrónico <b>{correo_propietario}</b> y número de teléfono <b>{telefono_propietario}</b> en calidad de MANDANTE PROPIETARIO, actuando junto al cliente Don/Doña <b>{nombre_cliente}</b>.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">CLÁUSULAS</h3>
  <ol style="padding-left: 20px; text-align: justify; font-size: 14px; margin-bottom: 25px;">
    <li style="margin-bottom: 12px;"><b>ENCARGO DE MEDIACIÓN:</b> El MANDANTE encarga de manera exclusiva a INMOVA la promoción comercial y mediación inmobiliaria para la venta de la propiedad ubicada en <b>{inmueble_direccion}</b>, departamento de <b>{inmueble_departamento}</b>, con referencia <b>{inmueble_referencia}</b>.</li>
    <li style="margin-bottom: 12px;"><b>PRECIO DE PROMOCIÓN:</b> El precio de comercialización oficial del inmueble se fija de mutuo acuerdo en <b>$ {inmueble_precio} USD</b>.</li>
    <li style="margin-bottom: 12px;"><b>HONORARIOS DE MANDATO:</b> Al concretarse la venta, la parte propietaria abonará a la agencia una retribución comercial fija del <b>{comision_vendedor_porcentaje} %</b> sobre el precio definitivo de venta.</li>
    <li style="margin-bottom: 12px;"><b>DURACIÓN AND EXCLUSIVIDAD:</b> Este mandato tiene carácter de exclusividad por un periodo improrrogable de <b>{plazo_exclusividad_meses} meses</b> a partir del día de hoy.</li>
  </ol>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por el Mandatario (INMOVA):</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;">Representante Autorizado</p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Por el Mandante Propietario:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_propietario}</b></p>
    </div>
  </div>
</div>`
  },
  {
    titulo: 'Acta de Entrega de Llaves y Posesión',
    tipoContrato: 'Recibo de llaves',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_ciudad}', '{motivo_entrega}', '{num_llaves_entregadas}',
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{fecha_firma}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">ACTA DE ENTREGA DE LLAVES Y POSESIÓN</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">Con respecto al inmueble catalogado bajo la referencia <b>{inmueble_referencia}</b>, propiedad de Don/Doña <b>{nombre_propietario}</b>, ubicado en la dirección de <b>{inmueble_direccion}</b>, se formaliza el presente acto de entrega de posesión de llaves.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">MANIFESTACIONES</h3>
  <ol style="padding-left: 20px; text-align: justify; font-size: 14px; margin-bottom: 25px;">
    <li style="margin-bottom: 12px;"><b>RECEPTOR AUTORIZADO:</b> Se realiza la entrega a Don/Doña <b>{nombre_cliente}</b> en virtud de: <b>{motivo_entrega}</b>.</li>
    <li style="margin-bottom: 12px;"><b>CANTIDAD DE LLAVES:</b> El receptor recibe a su entera satisfacción un total de <b>{num_llaves_entregadas} juegos de llaves</b> físicas del inmueble.</li>
    <li style="margin-bottom: 12px;"><b>RESPONSABILIDAD Y CUSTODIA:</b> A partir de este momento, el receptor de las llaves se constituye como depositario del inmueble y asume la total responsabilidad de su integridad, así como el pago de suministros si procediere.</li>
  </ol>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Entrega (En nombre del Propietario <b>{nombre_propietario}</b>):</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;">Firma Asesor Responsable</p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Recibe y Acepta:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_cliente}</b></p>
    </div>
  </div>
</div>`
  },
  {
    titulo: 'Acta de Devolución de Llaves y Rescisión',
    tipoContrato: 'Devolución de llaves',
    variablesPermitidas: [
      '{nombre_cliente}', '{inmueble_direccion}', '{inmueble_referencia}',
      '{inmueble_ciudad}', '{estado_inmueble}',
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{fecha_firma}'
    ],
    contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px; font-size: 22px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px;">ACTA DE DEVOLUCIÓN DE LLAVES Y RESCISIÓN</h1>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">En la ciudad de <b>{inmueble_ciudad}</b>, a la fecha de <b>{fecha_firma}</b>.</p>
  
  <p style="text-align: justify; font-size: 14px; margin-bottom: 15px;">Con respecto a la finalización definitiva de la relación contractual vinculada al inmueble en <b>{inmueble_direccion}</b>, propiedad de Don/Doña <b>{nombre_propietario}</b>, referencia de catálogo <b>{inmueble_referencia}</b>, se efectúa formalmente el retorno del inmueble.</p>
  
  <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; font-size: 16px; font-weight: 700; text-transform: uppercase;">DECLARACIONES Y RETORNO</h3>
  <ol style="padding-left: 20px; text-align: justify; font-size: 14px; margin-bottom: 25px;">
    <li style="margin-bottom: 12px;"><b>ENTREGA Y DESOCUPACIÓN:</b> Don/Doña <b>{nombre_cliente}</b> hace entrega formal a la agencia INMOVA de todas las llaves en su posesión, dejando la propiedad completamente desocupada y libre de pertenencias personales.</li>
    <li style="margin-bottom: 12px;"><b>INSPECCIÓN DE LA PROPIEDAD:</b> Se inspecciona físicamente el inmueble y se califica su estado de conservación actual como: <b>{estado_inmueble}</b>.</li>
    <li style="margin-bottom: 12px;"><b>CONFORMIDAD Y PAZ Y SALVO:</b> Ambas partes acuerdan dar por extinguido y resuelto de mutuo acuerdo el vínculo anterior, declarándose recíprocamente a paz y salvo por cualquier concepto, sin más obligaciones pendientes.</li>
  </ol>
  
  <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Devuelve las Llaves:</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;"><b>{nombre_cliente}</b></p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 45px;">Recibe a Conformidad (En nombre del Propietario <b>{nombre_propietario}</b>):</p>
      <p style="margin-bottom: 5px;">___________________________________</p>
      <p style="font-weight: 700; color: #475569;">Firma Asesor Receptor</p>
    </div>
  </div>
</div>`
  }
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No database object');
    await mongoose.disconnect();
    return;
  }

  let seededCount = 0;
  for (const dp of defaultPlantillas) {
    // Delete existing one with the same title to force re-seeding the improved version!
    await db.collection('plantillas').deleteOne({ titulo: dp.titulo });
    
    const doc = {
      ...dp,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('plantillas').insertOne(doc);
    console.log(`Successfully seeded: "${dp.titulo}"`);
    seededCount++;
  }

  console.log(`Seeding complete. Seeded ${seededCount} templates.`);

  await mongoose.disconnect();
}

run().catch(console.error);
