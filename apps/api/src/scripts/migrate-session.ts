import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error('[Migration] MONGODB_URI no definida');
    return;
  }
  
  console.log('[Migration] Conectando a la base de datos de origen:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('[Migration] Conectado.');

  const dbTest = mongoose.connection.db;
  if (!dbTest) {
    console.error('[Migration] No se pudo obtener el objeto db');
    return;
  }

  // Obtener colecciones origen
  const collections = await dbTest.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log('[Migration] Colecciones en origen:', collectionNames);

  // Buscar usuario guest
  let guestUser = null;
  if (collectionNames.includes('usuarios')) {
    guestUser = await dbTest.collection('usuarios').findOne({ correo: /guest/i });
    if (!guestUser) {
      guestUser = await dbTest.collection('usuarios').findOne();
    }
  }

  console.log('[Migration] Usuario guest encontrado:', guestUser ? guestUser.nombre : 'Ninguno');

  // Buscar grupo de trabajo
  let grupoTrabajo = null;
  if (collectionNames.includes('grupotrabajos')) {
    grupoTrabajo = await dbTest.collection('grupotrabajos').findOne();
  } else if (collectionNames.includes('grupos_trabajo')) {
    grupoTrabajo = await dbTest.collection('grupos_trabajo').findOne();
  }
  console.log('[Migration] Grupo de trabajo encontrado:', grupoTrabajo ? grupoTrabajo.nombre : 'Ninguno');

  // Cambiar a la base de datos 'inmova'
  const dbInmova = mongoose.connection.useDb('inmova');
  console.log('[Migration] Cambiado al contexto de la base de datos "inmova"');

  if (guestUser) {
    const existing = await dbInmova.collection('usuarios').findOne({ _id: guestUser._id });
    if (!existing) {
      await dbInmova.collection('usuarios').insertOne(guestUser);
      console.log(`[Migration] Usuario ${guestUser.nombre} insertado en "inmova"`);
    } else {
      console.log(`[Migration] Usuario ${guestUser.nombre} ya existe en "inmova"`);
    }
  }

  if (grupoTrabajo) {
    const existing = await dbInmova.collection('grupos_trabajo').findOne({ _id: grupoTrabajo._id });
    if (!existing) {
      await dbInmova.collection('grupos_trabajo').insertOne(grupoTrabajo);
      console.log(`[Migration] Grupo de trabajo ${grupoTrabajo.nombre} insertado en "inmova.grupos_trabajo"`);
    } else {
      console.log(`[Migration] Grupo de trabajo ${grupoTrabajo.nombre} ya existe en "inmova.grupos_trabajo"`);
    }
  }

  // Vincular datos semilla de inmova al usuario guest y su grupo
  if (guestUser) {
    const userId = guestUser._id;
    const grupoId = guestUser.grupoTrabajoId || null;

    console.log(`[Migration] Vinculando datos semilla de "inmova" a usuarioId: ${userId} y grupoTrabajoId: ${grupoId}`);

    // Inmuebles
    const rInm = await dbInmova.collection('inmuebles').updateMany(
      {},
      { 
        $set: { 
          usuarioId: userId, 
          grupoTrabajoId: grupoId,
          "datosPrivados.captadorAsignado": userId 
        } 
      }
    );
    console.log(`[Migration] Inmuebles vinculados: ${rInm.modifiedCount}`);

    // Clientes
    const rCli = await dbInmova.collection('clientes').updateMany(
      {},
      { 
        $set: { 
          usuarioId: userId, 
          grupoTrabajoId: grupoId,
          comercialResponsable: userId 
        } 
      }
    );
    console.log(`[Migration] Clientes vinculados: ${rCli.modifiedCount}`);

    // Visitas
    const rVis = await dbInmova.collection('visitas').updateMany(
      {},
      { 
        $set: { 
          usuarioId: userId, 
          grupoTrabajoId: grupoId,
          comercialAsignado: userId 
        } 
      }
    );
    console.log(`[Migration] Visitas vinculadas: ${rVis.modifiedCount}`);

    // Contratos
    const rCon = await dbInmova.collection('contratos').updateMany(
      {},
      { 
        $set: { 
          usuarioId: userId, 
          grupoTrabajoId: grupoId,
          comercialFirmante: userId 
        } 
      }
    );
    console.log(`[Migration] Contratos vinculados: ${rCon.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log('[Migration] Proceso finalizado.');
}

run().catch((err) => {
  console.error('[Migration] Error:', err);
  process.exit(1);
});
