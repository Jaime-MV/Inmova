import { Router } from 'express';
import { register, login, me, actualizarPerfilController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/auth/register
 * Registra un nuevo usuario (particular o empresa).
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Autentica un usuario existente y devuelve un JWT.
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Devuelve el perfil del usuario autenticado (Bearer token requerido).
 */
router.get('/me', me);

/**
 * PUT /api/auth/profile
 * Actualiza el nombre o la contraseña del usuario (Bearer token requerido).
 */
router.put('/profile', requireAuth, actualizarPerfilController);

export default router;
