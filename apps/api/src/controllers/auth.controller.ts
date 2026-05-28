import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getAuthenticatedUser,
  actualizarPerfil,
  RegisterInput
} from '../services/auth.service.js';

// ─────────────────────────────────────────────
// HELPER: Extraer statusCode de un Error custom
// ─────────────────────────────────────────────

function getStatusCode(err: unknown): number {
  if (err && typeof err === 'object' && 'statusCode' in err) {
    return (err as { statusCode: number }).statusCode;
  }
  return 500;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Error interno del servidor. Intenta de nuevo.';
}

// ─────────────────────────────────────────────
// CONTROLADOR: POST /api/auth/register
// ─────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<Response> {
  const { nombre, correo, password, userType, empresaInfo } = req.body as RegisterInput;

  // Validación de campos obligatorios
  if (!nombre || !correo || !password || !userType) {
    return res.status(400).json({
      error: 'Por favor, completa todos los campos requeridos (nombre, correo, contraseña y tipo de cuenta).'
    });
  }

  if (userType === 'empresa' && (!empresaInfo || !empresaInfo.nombreEmpresa)) {
    return res.status(400).json({
      error: 'Por favor, introduce el nombre de tu empresa.'
    });
  }

  try {
    const result = await registerUser({ nombre, correo, password, userType, empresaInfo });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(getStatusCode(err)).json({ error: getErrorMessage(err) });
  }
}

// ─────────────────────────────────────────────
// CONTROLADOR: POST /api/auth/login
// ─────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<Response> {
  const { correo, password } = req.body as { correo: string; password: string };

  if (!correo || !password) {
    return res.status(400).json({
      error: 'Por favor, introduce tu correo electrónico y contraseña.'
    });
  }

  try {
    const result = await loginUser({ correo, password });
    return res.json(result);
  } catch (err) {
    return res.status(getStatusCode(err)).json({ error: getErrorMessage(err) });
  }
}

// ─────────────────────────────────────────────
// CONTROLADOR: GET /api/auth/me
// ─────────────────────────────────────────────

export async function me(req: Request, res: Response): Promise<Response> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const usuario = await getAuthenticatedUser(token);
    const userObj = usuario.toJSON();
    if (userObj.tipoCuenta === 'personal' && !userObj.grupoTrabajoId) {
      userObj.rol = 'Usuario';
    }
    return res.json({ usuario: userObj });
  } catch (err) {
    return res.status(getStatusCode(err)).json({ error: getErrorMessage(err) });
  }
}

/**
 * PUT /api/auth/profile
 * Actualiza el perfil del usuario autenticado (Nombre y/o contraseña).
 */
export async function actualizarPerfilController(req: any, res: Response): Promise<Response> {
  const { nombre, password } = req.body as { nombre?: string; password?: string };

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  try {
    const result = await actualizarPerfil(req.user.id, nombre, password);
    return res.json({ ok: true, ...result });
  } catch (err) {
    return res.status(getStatusCode(err)).json({ error: getErrorMessage(err) });
  }
}
