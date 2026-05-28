import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IUsuario, IEmpresaInfo, UsuarioModel } from '../entities/usuario.entity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inmova_jwt_secret_key_2025_seguro';
const JWT_EXPIRES_IN = '7d';

// ─────────────────────────────────────────────
// TIPOS DE ENTRADA Y SALIDA
// ─────────────────────────────────────────────

export interface RegisterInput {
  nombre: string;
  correo: string;
  password: string;
  userType: 'particular' | 'empresa';
  empresaInfo?: IEmpresaInfo;
}

export interface LoginInput {
  correo: string;
  password: string;
}

export interface SessionPayload {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  tipoCuenta: string;
  avatarUrl: string | null;
}

export interface AuthResult {
  token: string;
  session: SessionPayload;
}

// ─────────────────────────────────────────────
// UTILIDADES PRIVADAS
// ─────────────────────────────────────────────

function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}

function buildToken(usuario: IUsuario): string {
  let rol: string = usuario.rol;
  if (usuario.tipoCuenta === 'personal' && !usuario.grupoTrabajoId) {
    rol = 'Usuario';
  }
  const payload = {
    id: (usuario._id as mongoose.Types.ObjectId).toString(),
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: rol,
    tipoCuenta: usuario.tipoCuenta
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function buildSession(usuario: IUsuario): SessionPayload {
  let rol: string = usuario.rol;
  if (usuario.tipoCuenta === 'personal' && !usuario.grupoTrabajoId) {
    rol = 'Usuario';
  }
  return {
    id: (usuario._id as mongoose.Types.ObjectId).toString(),
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: rol,
    tipoCuenta: usuario.tipoCuenta,
    avatarUrl: usuario.avatarUrl ?? null
  };
}

// ─────────────────────────────────────────────
// SERVICIO DE AUTENTICACIÓN
// ─────────────────────────────────────────────

/**
 * Registra un nuevo usuario en la base de datos.
 * - Verifica duplicidad de correo.
 * - Asigna rol y tipoCuenta según userType.
 * - Hashea la contraseña antes de persistir.
 * - Retorna un JWT firmado y la sesión del usuario.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const correoNormalizado = input.correo.toLowerCase().trim();

  // Verificar correo duplicado
  const existente = await UsuarioModel.findOne({ correo: correoNormalizado });
  if (existente) {
    const err = new Error('El correo electrónico ya se encuentra registrado. Por favor inicia sesión.');
    (err as any).statusCode = 409;
    throw err;
  }

  // Regla de negocio: rol y tipo de cuenta según userType
  const tipoCuenta: 'personal' | 'empresarial' =
    input.userType === 'empresa' ? 'empresarial' : 'personal';
  const rol: 'Asesor Inmobiliario' | 'Captador' =
    input.userType === 'empresa' ? 'Asesor Inmobiliario' : 'Captador';

  const nuevoUsuario = new UsuarioModel({
    nombre: input.nombre.trim(),
    correo: correoNormalizado,
    password: hashPassword(input.password),
    rol,
    tipoCuenta,
    estado: 'activo',
    avatarUrl: null,
    empresaInfo: input.userType === 'empresa' ? input.empresaInfo : undefined
  });

  await nuevoUsuario.save();

  console.log(`[AuthService] Registro: ${correoNormalizado} | Rol: ${rol} | Cuenta: ${tipoCuenta}`);

  return {
    token: buildToken(nuevoUsuario),
    session: buildSession(nuevoUsuario)
  };
}

/**
 * Autentica a un usuario existente.
 * - Busca por correo en la base de datos.
 * - Verifica el hash SHA-256 de la contraseña.
 * - Comprueba que la cuenta esté activa.
 * - Retorna un JWT firmado y la sesión del usuario.
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const correoNormalizado = input.correo.toLowerCase().trim();

  const usuario = await UsuarioModel.findOne({ correo: correoNormalizado });
  if (!usuario) {
    const err = new Error('Credenciales inválidas. Verifica tu correo electrónico y contraseña.');
    (err as any).statusCode = 401;
    throw err;
  }

  if (!verifyPassword(input.password, usuario.password)) {
    const err = new Error('Credenciales inválidas. Verifica tu correo electrónico y contraseña.');
    (err as any).statusCode = 401;
    throw err;
  }

  if (usuario.estado !== 'activo') {
    const err = new Error(`Tu cuenta se encuentra ${usuario.estado}. Contacta al administrador.`);
    (err as any).statusCode = 403;
    throw err;
  }

  console.log(`[AuthService] Login: ${correoNormalizado} | Rol: ${usuario.rol}`);

  return {
    token: buildToken(usuario),
    session: buildSession(usuario)
  };
}

/**
 * Obtiene el perfil del usuario autenticado a partir del token JWT.
 * Lanza un error 401 si el token no es válido o el usuario no existe.
 */
export async function getAuthenticatedUser(token: string): Promise<IUsuario> {
  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    const err = new Error('Token inválido o expirado.');
    (err as any).statusCode = 401;
    throw err;
  }

  const usuario = await UsuarioModel.findById(decoded.id).select('-password');
  if (!usuario) {
    const err = new Error('Usuario no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  return usuario;
}

/**
 * Actualiza el perfil de un usuario (Nombre y/o contraseña).
 */
export async function actualizarPerfil(
  usuarioId: string,
  nombre?: string,
  password?: string
): Promise<AuthResult> {
  const usuario = await UsuarioModel.findById(usuarioId);
  if (!usuario) {
    const err = new Error('Usuario no encontrado.');
    (err as any).statusCode = 404;
    throw err;
  }

  if (nombre !== undefined) {
    if (!nombre.trim() || nombre.trim().length < 2) {
      const err = new Error('El nombre de usuario debe tener al menos 2 caracteres.');
      (err as any).statusCode = 400;
      throw err;
    }
    usuario.nombre = nombre.trim();
  }

  if (password !== undefined) {
    if (!password || password.trim().length < 6) {
      const err = new Error('La contraseña debe tener al menos 6 caracteres.');
      (err as any).statusCode = 400;
      throw err;
    }
    usuario.password = crypto.createHash('sha256').update(password).digest('hex');
  }

  await usuario.save();

  console.log(`[AuthService] Perfil actualizado para el usuario: ${usuario.correo}`);

  return {
    token: buildToken(usuario),
    session: buildSession(usuario)
  };
}
