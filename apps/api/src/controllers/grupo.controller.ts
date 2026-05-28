import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  crearGrupo,
  unirseAGrupo,
  obtenerMiGrupo,
  obtenerMiembrosGrupo,
  administrarMiembro,
  eliminarGrupo,
  actualizarGrupo
} from '../services/grupo.service.js';

// ─────────────────────────────────────────────
// HANDLERS DE GRUPOS DE TRABAJO
// ─────────────────────────────────────────────

/**
 * POST /api/grupos/crear
 * Crea un nuevo grupo de trabajo para el usuario autenticado.
 * Body: { nombre: string }
 */
export async function crear(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nombre } = req.body as { nombre?: string };

    if (!nombre || nombre.trim().length < 2) {
      res.status(400).json({ error: 'El nombre del grupo debe tener al menos 2 caracteres.' });
      return;
    }

    const grupo = await crearGrupo(req.user!.id, nombre);
    res.status(201).json({ ok: true, grupo });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al crear el grupo.' });
  }
}

/**
 * POST /api/grupos/unirse
 * Vincula al usuario autenticado a un grupo existente mediante código.
 * Body: { codigo: string }
 */
export async function unirse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { codigo } = req.body as { codigo?: string };

    if (!codigo || codigo.trim().length !== 6) {
      res.status(400).json({ error: 'El código de invitación debe tener exactamente 6 caracteres.' });
      return;
    }

    const grupo = await unirseAGrupo(req.user!.id, codigo);
    res.status(200).json({ ok: true, grupo });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al unirse al grupo.' });
  }
}

/**
 * GET /api/grupos/mi-grupo
 * Retorna la información del grupo al que pertenece el usuario autenticado.
 */
export async function miGrupo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const grupo = await obtenerMiGrupo(req.user!.id);
    res.status(200).json({ ok: true, grupo });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al obtener el grupo.' });
  }
}

/**
 * GET /api/grupos/miembros
 * Retorna la lista de miembros del grupo de trabajo.
 */
export async function listarMiembros(req: AuthRequest, res: Response): Promise<void> {
  try {
    const miembros = await obtenerMiembrosGrupo(req.user!.id);
    res.status(200).json({ ok: true, miembros });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al listar los miembros.' });
  }
}

/**
 * POST /api/grupos/miembros/administrar
 * Permite al administrador expulsar, suspender o cambiar el rol de un miembro.
 * Body: { miembroId: string, accion: 'rol' | 'estado' | 'expulsar', valor?: string }
 */
export async function gestionarMiembro(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { miembroId, accion, valor } = req.body as {
      miembroId?: string;
      accion?: 'rol' | 'estado' | 'expulsar';
      valor?: string;
    };

    if (!miembroId || !accion) {
      res.status(400).json({ error: 'Faltan parámetros obligatorios (miembroId, accion).' });
      return;
    }

    const resultado = await administrarMiembro(req.user!.id, miembroId, accion, valor);
    res.status(200).json({ ok: true, ...resultado });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al gestionar miembro.' });
  }
}

/**
 * DELETE /api/grupos/eliminar
 * Elimina un grupo de trabajo. Solo accesible por el propietario.
 */
export async function eliminar(req: AuthRequest, res: Response): Promise<void> {
  try {
    const resultado = await eliminarGrupo(req.user!.id);
    res.status(200).json(resultado);
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al eliminar el grupo de trabajo.' });
  }
}

/**
 * PUT /api/grupos/actualizar
 * Actualiza la información del grupo (Nombre y Límite de miembros).
 * Body: { nombre: string, limiteMiembros: number }
 */
export async function actualizar(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { nombre, limiteMiembros } = req.body as { nombre?: string; limiteMiembros?: number };

    if (!nombre || nombre.trim().length < 2) {
      res.status(400).json({ error: 'El nombre del grupo debe tener al menos 2 caracteres.' });
      return;
    }

    if (limiteMiembros === undefined || limiteMiembros < 1) {
      res.status(400).json({ error: 'El límite de miembros debe ser un número entero mayor o igual a 1.' });
      return;
    }

    const grupo = await actualizarGrupo(req.user!.id, nombre, Math.floor(limiteMiembros));
    res.status(200).json({ ok: true, grupo });
  } catch (err: any) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Error al actualizar el grupo de trabajo.' });
  }
}

