import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  crear,
  unirse,
  miGrupo,
  listarMiembros,
  gestionarMiembro,
  eliminar,
  actualizar
} from '../controllers/grupo.controller.js';

const router = Router();

/**
 * POST /api/grupos/crear
 * Crea un nuevo grupo de trabajo (requiere JWT de usuario personal).
 */
router.post('/crear', requireAuth, crear);

/**
 * POST /api/grupos/unirse
 * Vincula al usuario a un grupo existente mediante código de 6 caracteres.
 */
router.post('/unirse', requireAuth, unirse);

/**
 * GET /api/grupos/mi-grupo
 * Retorna el grupo al que pertenece el usuario autenticado.
 */
router.get('/mi-grupo', requireAuth, miGrupo);

/**
 * GET /api/grupos/miembros
 * Obtiene todos los miembros del grupo de trabajo.
 */
router.get('/miembros', requireAuth, listarMiembros);

/**
 * POST /api/grupos/miembros/administrar
 * Administra el rol, estado o expulsa a un miembro del grupo.
 */
router.post('/miembros/administrar', requireAuth, gestionarMiembro);

/**
 * DELETE /api/grupos/eliminar
 * Elimina de manera permanente el grupo de trabajo (solo para el propietario).
 */
router.delete('/eliminar', requireAuth, eliminar);

/**
 * PUT /api/grupos/actualizar
 * Actualiza el nombre y límite de miembros de un grupo de trabajo.
 */
router.put('/actualizar', requireAuth, actualizar);

export default router;
