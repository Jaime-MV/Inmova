import crypto from 'crypto';
import mongoose from 'mongoose';
import { GrupoTrabajoModel, IGrupoTrabajo } from '../entities/grupoTrabajo.entity.js';
import { UsuarioModel } from '../entities/usuario.entity.js';
import { InmuebleModel } from '../entities/inmueble.entity.js';
import { ClienteModel } from '../entities/cliente.entity.js';
import { VisitaModel } from '../entities/visita.entity.js';

// ─────────────────────────────────────────────
// TIPOS DE SALIDA
// ─────────────────────────────────────────────

export interface GrupoPayload {
  id: string;
  nombre: string;
  codigo: string;
  propietarioId: string;
  miembros: string[];
  totalMiembros: number;
  limiteMiembros: number;
}

// ─────────────────────────────────────────────
// UTILIDADES PRIVADAS
// ─────────────────────────────────────────────

/**
 * Genera un código alfanumérico único de 6 caracteres en mayúsculas.
 * Reintenta si el código ya existe en la BD.
 */
async function generarCodigoUnico(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin 0, O, 1, I para evitar confusión
  let intentos = 0;
  while (intentos < 10) {
    const codigo = Array.from({ length: 6 }, () =>
      chars[crypto.randomInt(0, chars.length)]
    ).join('');
    const existe = await GrupoTrabajoModel.findOne({ codigo });
    if (!existe) return codigo;
    intentos++;
  }
  throw new Error('No se pudo generar un código único. Inténtalo de nuevo.');
}

function toPayload(grupo: IGrupoTrabajo): GrupoPayload {
  return {
    id: (grupo._id as mongoose.Types.ObjectId).toString(),
    nombre: grupo.nombre,
    codigo: grupo.codigo,
    propietarioId: grupo.propietarioId.toString(),
    miembros: grupo.miembros.map((m) => m.toString()),
    totalMiembros: grupo.miembros.length,
    limiteMiembros: grupo.limiteMiembros ?? 10
  };
}

// ─────────────────────────────────────────────
// SERVICIO DE GRUPOS DE TRABAJO
// ─────────────────────────────────────────────

/**
 * Crea un nuevo grupo de trabajo.
 * - Solo usuarios con tipoCuenta 'personal' pueden crear grupos.
 * - El creador queda como propietario y primer miembro.
 * - Si ya pertenece a un grupo, lanza error 409.
 */
export async function crearGrupo(
  usuarioId: string,
  nombre: string
): Promise<GrupoPayload> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario) {
    const err = new Error('Usuario no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  if (usuario.tipoCuenta !== 'personal') {
    const err = new Error('Solo los usuarios personales pueden crear grupos de trabajo.');
    (err as any).statusCode = 403;
    throw err;
  }

  if (usuario.grupoTrabajoId) {
    const err = new Error('Ya perteneces a un grupo de trabajo. Sal del grupo actual antes de crear uno nuevo.');
    (err as any).statusCode = 409;
    throw err;
  }

  const codigo = await generarCodigoUnico();
  const uid = new mongoose.Types.ObjectId(usuarioId);

  const nuevoGrupo = new GrupoTrabajoModel({
    nombre: nombre.trim(),
    codigo,
    propietarioId: uid,
    miembros: [uid]
  });

  await nuevoGrupo.save();

  // Vincular al usuario con el grupo y promoverlo a Administrador
  await UsuarioModel.findByIdAndUpdate(usuarioId, {
    grupoTrabajoId: nuevoGrupo._id,
    rol: 'Administrador'
  });

  console.log(`[GrupoService] Grupo creado: "${nombre}" | Código: ${codigo} | Propietario: ${usuarioId}`);

  return toPayload(nuevoGrupo);
}

/**
 * Une a un usuario a un grupo existente mediante el código de invitación.
 * - Valida que el código exista.
 * - Verifica que el usuario no esté ya en el grupo.
 * - Agrega al usuario como miembro y actualiza su grupoTrabajoId.
 */
export async function unirseAGrupo(
  usuarioId: string,
  codigo: string
): Promise<GrupoPayload> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario) {
    const err = new Error('Usuario no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  if (usuario.grupoTrabajoId) {
    const err = new Error('Ya perteneces a un grupo de trabajo.');
    (err as any).statusCode = 409;
    throw err;
  }

  const grupo = await GrupoTrabajoModel.findOne({ codigo: codigo.toUpperCase().trim() });
  if (!grupo) {
    const err = new Error('El código de invitación no es válido o ha expirado.');
    (err as any).statusCode = 404;
    throw err;
  }

  const uid = new mongoose.Types.ObjectId(usuarioId);
  const yaMiembro = grupo.miembros.some((m) => m.equals(uid));
  if (yaMiembro) {
    const err = new Error('Ya eres miembro de este grupo.');
    (err as any).statusCode = 409;
    throw err;
  }

  // Validar límite de miembros
  const limite = grupo.limiteMiembros ?? 10;
  if (grupo.miembros.length >= limite) {
    const err = new Error(`El grupo de trabajo ha alcanzado su límite máximo permitido de ${limite} miembros.`);
    (err as any).statusCode = 400;
    throw err;
  }

  // Agregar miembro al grupo y vincular al usuario
  grupo.miembros.push(uid);
  await grupo.save();

  await UsuarioModel.findByIdAndUpdate(usuarioId, {
    grupoTrabajoId: grupo._id
  });

  console.log(`[GrupoService] Usuario ${usuarioId} se unió al grupo "${grupo.nombre}" (${codigo})`);

  return toPayload(grupo);
}

/**
 * Obtiene la información del grupo al que pertenece el usuario.
 * Lanza 404 si el usuario no tiene grupo asignado.
 */
export async function obtenerMiGrupo(usuarioId: string): Promise<GrupoPayload> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario || !usuario.grupoTrabajoId) {
    const err = new Error('No perteneces a ningún grupo de trabajo.');
    (err as any).statusCode = 404;
    throw err;
  }

  const grupo = await GrupoTrabajoModel.findById(usuario.grupoTrabajoId);
  if (!grupo) {
    const err = new Error('Grupo de trabajo no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  return toPayload(grupo);
}

// ─────────────────────────────────────────────
// SERVICIOS EXTRA DE MIEMBROS Y GESTIÓN
// ─────────────────────────────────────────────

export interface GrupoMiembroPayload {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

/**
 * Obtiene todos los miembros vinculados a un grupo de trabajo.
 */
export async function obtenerMiembrosGrupo(usuarioId: string): Promise<GrupoMiembroPayload[]> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario || !usuario.grupoTrabajoId) {
    const err = new Error('No perteneces a ningún grupo de trabajo.');
    (err as any).statusCode = 404;
    throw err;
  }

  const miembros = await UsuarioModel.find({ grupoTrabajoId: usuario.grupoTrabajoId })
    .select('_id nombre correo rol estado')
    .lean();

  return miembros.map((m: any) => ({
    id: m._id.toString(),
    nombre: m.nombre,
    correo: m.correo,
    rol: m.rol,
    estado: m.estado
  }));
}

/**
 * Permite a un administrador expulsar, suspender/activar o cambiar roles de miembros de su grupo.
 */
export async function administrarMiembro(
  adminId: string,
  miembroId: string,
  accion: 'rol' | 'estado' | 'expulsar',
  valor?: string
): Promise<any> {
  const admin = await UsuarioModel.findById(adminId);
  if (!admin || !admin.grupoTrabajoId) {
    const err = new Error('No perteneces a ningún grupo de trabajo.');
    (err as any).statusCode = 404;
    throw err;
  }

  // Validar privilegios de Administrador
  if (admin.rol !== 'Administrador') {
    const err = new Error('No tienes privilegios de Administrador para realizar esta acción.');
    (err as any).statusCode = 403;
    throw err;
  }

  // Buscar miembro
  const miembro = await UsuarioModel.findById(miembroId);
  if (!miembro || !miembro.grupoTrabajoId || !miembro.grupoTrabajoId.equals(admin.grupoTrabajoId)) {
    const err = new Error('El usuario no pertenece a tu mismo grupo de trabajo.');
    (err as any).statusCode = 404;
    throw err;
  }

  // Evitar auto-administración
  if (miembroId === adminId) {
    const err = new Error('No puedes realizar esta operación sobre ti mismo.');
    (err as any).statusCode = 400;
    throw err;
  }

  if (accion === 'expulsar') {
    // Quitar miembro del array miembros de GrupoTrabajo
    await GrupoTrabajoModel.findByIdAndUpdate(admin.grupoTrabajoId, {
      $pull: { miembros: miembro._id }
    });

    miembro.grupoTrabajoId = null;
    miembro.rol = 'Captador'; // Vuelve a Captador por defecto (Usuario al no tener grupo)
    await miembro.save();

    return { ok: true, mensaje: 'Miembro expulsado con éxito.' };
  }

  if (accion === 'rol') {
    if (valor !== 'Asesor Inmobiliario' && valor !== 'Captador' && valor !== 'Administrador') {
      const err = new Error('El rol proporcionado no es válido.');
      (err as any).statusCode = 400;
      throw err;
    }
    miembro.rol = valor as any;
    await miembro.save();
    return { ok: true, miembro };
  }

  if (accion === 'estado') {
    if (valor !== 'activo' && valor !== 'suspendido') {
      const err = new Error('El estado proporcionado no es válido.');
      (err as any).statusCode = 400;
      throw err;
    }
    miembro.estado = valor as any;
    await miembro.save();
    return { ok: true, miembro };
  }

  throw new Error('Acción no soportada.');
}

/**
 * Elimina permanentemente un grupo de trabajo.
 * - Solo el propietario del grupo puede realizar la acción.
 * - Desvincula a todos los miembros (establece grupoTrabajoId en null y rol en 'Usuario').
 * - Elimina los inmuebles, clientes y visitas asociados al grupo de trabajo.
 * - Elimina el documento de GrupoTrabajo.
 */
export async function eliminarGrupo(usuarioId: string): Promise<{ ok: boolean; mensaje: string }> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario || !usuario.grupoTrabajoId) {
    const err = new Error('No perteneces a ningún grupo de trabajo.');
    (err as any).statusCode = 404;
    throw err;
  }

  const grupo = await GrupoTrabajoModel.findById(usuario.grupoTrabajoId);
  if (!grupo) {
    const err = new Error('Grupo de trabajo no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  // Validar que el usuario sea el propietario
  if (grupo.propietarioId.toString() !== usuarioId) {
    const err = new Error('Solo el propietario del grupo de trabajo puede eliminarlo.');
    (err as any).statusCode = 403;
    throw err;
  }

  const grupoId = grupo._id;

  // 1. Desvincular a todos los miembros
  await UsuarioModel.updateMany(
    { grupoTrabajoId: grupoId },
    { $set: { grupoTrabajoId: null, rol: 'Usuario' } }
  );

  // 2. Eliminar en cascada los datos colaborativos
  await InmuebleModel.deleteMany({ grupoTrabajoId: grupoId });
  await ClienteModel.deleteMany({ grupoTrabajoId: grupoId });
  await VisitaModel.deleteMany({ grupoTrabajoId: grupoId });

  // 3. Eliminar el grupo
  await GrupoTrabajoModel.findByIdAndDelete(grupoId);

  console.log(`[GrupoService] Grupo "${grupo.nombre}" (${grupo.codigo}) eliminado por propietario ${usuarioId}`);

  return { ok: true, mensaje: 'Grupo de trabajo eliminado con éxito y datos limpiados.' };
}

/**
 * Actualiza la configuración de un grupo de trabajo (Nombre y Límite de miembros).
 * - Solo el propietario del grupo puede realizar esta acción.
 */
export async function actualizarGrupo(
  usuarioId: string,
  nombre: string,
  limiteMiembros: number
): Promise<GrupoPayload> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario || !usuario.grupoTrabajoId) {
    const err = new Error('No perteneces a ningún grupo de trabajo.');
    (err as any).statusCode = 404;
    throw err;
  }

  const grupo = await GrupoTrabajoModel.findById(usuario.grupoTrabajoId);
  if (!grupo) {
    const err = new Error('Grupo de trabajo no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  // Validar propietario
  if (!grupo.propietarioId.equals(usuario._id)) {
    const err = new Error('Solo el propietario del grupo puede realizar esta acción.');
    (err as any).statusCode = 403;
    throw err;
  }

  if (!nombre.trim() || nombre.trim().length < 2) {
    const err = new Error('El nombre del grupo debe tener al menos 2 caracteres.');
    (err as any).statusCode = 400;
    throw err;
  }

  if (limiteMiembros < grupo.miembros.length) {
    const err = new Error(`El límite no puede ser inferior al número de miembros actuales (${grupo.miembros.length}).`);
    (err as any).statusCode = 400;
    throw err;
  }

  grupo.nombre = nombre.trim();
  grupo.limiteMiembros = limiteMiembros;
  await grupo.save();

  console.log(`[GrupoService] Grupo actualizado: "${nombre}" | Límite: ${limiteMiembros} | Propietario: ${usuarioId}`);

  return toPayload(grupo);
}

