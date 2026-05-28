import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../entities/usuario.entity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inmova_jwt_secret_key_2025_seguro';

// Extiende el tipo de Request para incluir el usuario decodificado
export interface AuthRequest extends Request {
  user?: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
    tipoCuenta: string;
  };
}

/**
 * Middleware que verifica el JWT del header Authorization.
 * Adjunta el payload decodificado en req.user.
 * Rechaza con 401 si el token falta o es inválido, y 403 si la cuenta está suspendida.
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido.' });
    return;
  }

  const token = authHeader.slice(7); // Elimina "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      nombre: string;
      correo: string;
      rol: string;
      tipoCuenta: string;
    };

    // Validar el estado del usuario en la base de datos para manejar suspensiones inmediatas
    const usuario = await UsuarioModel.findById(decoded.id).select('estado');
    if (!usuario) {
      res.status(401).json({ error: 'Usuario no encontrado.' });
      return;
    }

    if (usuario.estado !== 'activo') {
      res.status(403).json({ error: `Tu cuenta se encuentra ${usuario.estado}. Contacta al administrador.` });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}
