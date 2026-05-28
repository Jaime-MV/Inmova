import React, { useState, useEffect } from 'react';
import {
  Shield,
  Copy,
  Plus,
  ChevronRight,
  Sparkles,
  UserMinus,
  UserCheck,
  AlertTriangle,
  User,
  Lock,
  Settings,
  Users,
  ChevronDown,
  ChevronUp,
  Camera
} from 'lucide-react';
import type { UserSession } from './Sidebar';

function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCSV = (val: unknown) => {
    if (val === null || val === undefined) return '';
    let str = String(val).replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      str = `"${str}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface GrupoTrabajo {
  id: string;
  nombre: string;
  codigo: string;
  propietarioId: string;
  miembros: string[];
  totalMiembros: number;
  limiteMiembros?: number;
}

interface Miembro {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

interface Inmueble {
  _id: string;
  referenciaInterna: string;
  estado: 'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido';
  tipoInmueble: string;
  precioVenta: number;
  zona: string;
  descripcion: string;
  caracteristicas: { dormitorios: number; banos: number; superficieTotal: number };
}

interface Cliente {
  _id: string;
  nombre: string;
  correo: string;
  telefono: string;
  canalOrigen: string;
  estadoLead: 'Nuevo' | 'Contactado' | 'Interesado' | 'Cerrado' | 'Descartado';
  preferencias: { tipoInmuebleBuscado: string; zonaInteres: string; rangoPrecioMax: number };
}

interface Visita {
  _id: string;
  cliente: Cliente | null;
  inmueble: Inmueble | null;
  fechaHora: string;
  estado: 'Programada' | 'En Proceso' | 'Finalizada' | 'Cancelada';
  observacionesPostVisita: string;
}

interface GrupoModuleProps {
  user: UserSession;
  grupoTrabajo: GrupoTrabajo | null;
  loadingGrupo: boolean;
  onGrupoCrear: (nombre: string) => Promise<void>;
  onGrupoUnirse: (codigo: string) => Promise<void>;
  grupoError: string;
  setGrupoError: (err: string) => void;
  grupoExito: string;
  setGrupoExito: (success: string) => void;
  grupoLoading: boolean;
  refrescarTodo: () => Promise<void>;
  inmuebles: Inmueble[];
  crm: Cliente[];
  visitas: Visita[];
  onGrupoEliminar: () => Promise<void>;
  onUserUpdate?: (user: UserSession) => void;
}

export const GrupoModule: React.FC<GrupoModuleProps> = ({
  user,
  grupoTrabajo,
  loadingGrupo,
  onGrupoCrear,
  onGrupoUnirse,
  grupoError,
  setGrupoError,
  grupoExito,
  setGrupoExito,
  grupoLoading,
  refrescarTodo,
  inmuebles,
  crm,
  visitas,
  onGrupoEliminar,
  onUserUpdate,
}) => {

  // ─── SUB-TABS ───
  const [activeTab, setActiveTab] = useState<'cuenta' | 'grupo'>('cuenta');

  // ─── MI CUENTA ───
  const [cuentaNombre, setCuentaNombre] = useState(user.nombre);
  const [cuentaPassword, setCuentaPassword] = useState('');
  const [cuentaConfirm, setCuentaConfirm] = useState('');
  const [cuentaLoading, setCuentaLoading] = useState(false);
  const [cuentaError, setCuentaError] = useState('');
  const [cuentaExito, setCuentaExito] = useState('');

  // ─── MI GRUPO (configuración básica) ───
  const [grupoNombreConfig, setGrupoNombreConfig] = useState(grupoTrabajo?.nombre ?? '');
  const [grupoLimiteConfig, setGrupoLimiteConfig] = useState(grupoTrabajo?.limiteMiembros ?? 10);
  const [grupoConfigLoading, setGrupoConfigLoading] = useState(false);
  const [grupoConfigError, setGrupoConfigError] = useState('');
  const [grupoConfigExito, setGrupoConfigExito] = useState('');

  // ─── CREAR / UNIRSE (sin grupo) ───
  const [grupoNombre, setGrupoNombre] = useState('');
  const [grupoCodigo, setGrupoCodigo] = useState('');

  // ─── ADMIN CONSOLE (expandible) ───
  const [showAdmin, setShowAdmin] = useState(false);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loadingMiembros, setLoadingMiembros] = useState(false);
  const [errorMiembros, setErrorMiembros] = useState('');
  const [exitoMiembros, setExitoMiembros] = useState('');

  // ─── MODAL ELIMINAR GRUPO ───
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmNombre, setConfirmNombre] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const token = localStorage.getItem('inmova_token') ?? '';
  const esAdmin = user.rol === 'Administrador';
  const esPropietario = grupoTrabajo?.propietarioId === user.id;

  // Sincronizar campos con props
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCuentaNombre(user.nombre);
  }, [user.nombre]);

  useEffect(() => {
    if (grupoTrabajo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGrupoNombreConfig(grupoTrabajo.nombre);
      setGrupoLimiteConfig(grupoTrabajo.limiteMiembros ?? 10);
    }
  }, [grupoTrabajo]);

  // ─── CARGAR MIEMBROS ───
  const cargarMiembros = async () => {
    if (!grupoTrabajo || !esAdmin) return;
    setLoadingMiembros(true);
    setErrorMiembros('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/miembros', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al cargar los miembros.');
      setMiembros(data.miembros ?? []);
    } catch (err) {
      setErrorMiembros(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setLoadingMiembros(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarMiembros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoTrabajo, user.rol]);

  // ─── HANDLERS ───
  const handleActualizarCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setCuentaError('');
    setCuentaExito('');
    if (!cuentaNombre.trim() || cuentaNombre.trim().length < 2) {
      setCuentaError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (cuentaPassword) {
      if (cuentaPassword.length < 6) {
        setCuentaError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (cuentaPassword !== cuentaConfirm) {
        setCuentaError('Las contraseñas no coinciden.');
        return;
      }
    }
    setCuentaLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: cuentaNombre.trim(), ...(cuentaPassword ? { password: cuentaPassword } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al actualizar el perfil.');
      if (data.token) localStorage.setItem('inmova_token', data.token);
      if (data.session && onUserUpdate) onUserUpdate(data.session);
      setCuentaExito('¡Perfil actualizado correctamente!');
      setCuentaPassword('');
      setCuentaConfirm('');
      setTimeout(() => setCuentaExito(''), 4000);
    } catch (err) {
      setCuentaError(err instanceof Error ? err.message : 'Error al actualizar la cuenta.');
    } finally {
      setCuentaLoading(false);
    }
  };

  const handleActualizarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrupoConfigError('');
    setGrupoConfigExito('');
    if (!grupoNombreConfig.trim() || grupoNombreConfig.trim().length < 2) {
      setGrupoConfigError('El nombre del grupo debe tener al menos 2 caracteres.');
      return;
    }
    const totalActual = grupoTrabajo?.totalMiembros ?? 1;
    if (grupoLimiteConfig < totalActual) {
      setGrupoConfigError(`El límite no puede ser menor al número actual de miembros (${totalActual}).`);
      return;
    }
    setGrupoConfigLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/grupos/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: grupoNombreConfig.trim(), limiteMiembros: grupoLimiteConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al actualizar el grupo.');
      setGrupoConfigExito('¡Configuración del grupo guardada correctamente!');
      await refrescarTodo();
      setTimeout(() => setGrupoConfigExito(''), 4000);
    } catch (err) {
      setGrupoConfigError(err instanceof Error ? err.message : 'Error al actualizar el grupo.');
    } finally {
      setGrupoConfigLoading(false);
    }
  };

  const handleCrearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoNombre.trim() || grupoNombre.trim().length < 2) {
      setGrupoError('El nombre del grupo debe tener al menos 2 caracteres.');
      return;
    }
    await onGrupoCrear(grupoNombre.trim());
    setGrupoNombre('');
  };

  const handleUnirseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoCodigo.trim() || grupoCodigo.trim().length !== 6) {
      setGrupoError('El código de invitación debe tener exactamente 6 caracteres.');
      return;
    }
    await onGrupoUnirse(grupoCodigo.trim().toUpperCase());
    setGrupoCodigo('');
  };

  const handleAdministrar = async (miembroId: string, accion: 'rol' | 'estado' | 'expulsar', valor?: string) => {
    if (miembroId === user.id) { setErrorMiembros('No puedes realizar esta operación sobre ti mismo.'); return; }
    if (accion === 'expulsar' && !window.confirm('¿Deseas expulsar a este miembro del grupo?')) return;
    setErrorMiembros('');
    setExitoMiembros('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/miembros/administrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ miembroId, accion, valor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al administrar miembro.');
      setExitoMiembros(accion === 'expulsar' ? 'Miembro expulsado.' : accion === 'estado' ? `Estado cambiado a: ${valor}.` : `Rol cambiado a: ${valor}.`);
      await cargarMiembros();
      await refrescarTodo();
      setTimeout(() => setExitoMiembros(''), 4000);
    } catch (err) {
      setErrorMiembros(err instanceof Error ? err.message : 'Error al ejecutar la acción.');
    }
  };

  const exportarDatosCSV = () => {
    downloadCSV(`${grupoTrabajo?.nombre ?? 'grupo'}_inmuebles_backup.csv`,
      ['Referencia Interna', 'Tipo', 'Estado', 'Precio', 'Zona', 'Dormitorios', 'Baños', 'Superficie', 'Descripción'],
      inmuebles.map((i) => [i.referenciaInterna, i.tipoInmueble, i.estado, i.precioVenta, i.zona, i.caracteristicas?.dormitorios ?? 0, i.caracteristicas?.banos ?? 0, i.caracteristicas?.superficieTotal ?? 0, i.descripcion])
    );
    downloadCSV(`${grupoTrabajo?.nombre ?? 'grupo'}_crm_backup.csv`,
      ['Nombre', 'Correo', 'Teléfono', 'Canal', 'Estado Lead', 'Tipo Inmueble', 'Zona', 'Precio Máx'],
      crm.map((c) => [c.nombre, c.correo, c.telefono, c.canalOrigen, c.estadoLead, c.preferencias?.tipoInmuebleBuscado ?? '', c.preferencias?.zonaInteres ?? '', c.preferencias?.rangoPrecioMax ?? 0])
    );
    downloadCSV(`${grupoTrabajo?.nombre ?? 'grupo'}_visitas_backup.csv`,
      ['Fecha y Hora', 'Cliente', 'Correo Cliente', 'Inmueble', 'Estado', 'Observaciones'],
      visitas.map((v) => [v.fechaHora ? new Date(v.fechaHora).toLocaleString() : '', v.cliente?.nombre ?? 'N/A', v.cliente?.correo ?? 'N/A', v.inmueble?.referenciaInterna ?? 'N/A', v.estado, v.observacionesPostVisita ?? ''])
    );
  };

  const handleDeleteConfirm = async () => {
    if (!grupoTrabajo || confirmNombre !== grupoTrabajo.nombre) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      exportarDatosCSV();
      await onGrupoEliminar();
      setShowDeleteModal(false);
      setConfirmNombre('');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el grupo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── AVATAR DEL USUARIO ───
  const avatarUrl = user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=10B981&color=fff&size=200&bold=true`;

  if (loadingGrupo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-white w-full">

      {/* ─── CABECERA DE PERFIL ─── */}
      <div className="relative mb-8">
        {/* Fondo degradado de cabecera */}
        <div className="h-28 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute -bottom-1 left-0 right-0 h-10 bg-gradient-to-t from-[#0B0F1A] to-transparent"></div>
        </div>

        {/* Avatar y datos del usuario */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 px-6 -mt-12 relative z-10">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt={user.nombre}
              className="w-24 h-24 rounded-2xl border-4 border-[#0B0F1A] shadow-2xl object-cover"
            />
            <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={18} className="text-white" />
            </div>
          </div>
          <div className="pb-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-white">{user.nombre}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className={`db-role-badge ${user.rol.toLowerCase().replace(/\s+/g, '-')}`}>{user.rol}</span>
              <span className="text-slate-500 text-xs">{user.correo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVEGACIÓN DE SUB-PESTAÑAS ─── */}
      <div className="flex gap-1 mb-8 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 max-w-sm">
        <button
          onClick={() => setActiveTab('cuenta')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === 'cuenta'
              ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={15} />
          Mi Cuenta
        </button>
        <button
          onClick={() => setActiveTab('grupo')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            activeTab === 'grupo'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={15} />
          Mi Grupo
        </button>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* TAB: MI CUENTA                                */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'cuenta' && (
        <div className="max-w-2xl flex flex-col gap-6 animate-fade-in">

          {/* Información Personal */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Información Personal</h3>
                <p className="text-xs text-slate-400">Actualiza tu nombre visible en la plataforma</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
                  placeholder="Tu nombre completo"
                  value={cuentaNombre}
                  onChange={(e) => setCuentaNombre(e.target.value)}
                  disabled={cuentaLoading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                <input
                  type="email"
                  className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl py-3 px-4 text-sm text-slate-500 cursor-not-allowed"
                  value={user.correo}
                  disabled
                />
                <span className="text-xs text-slate-600">El correo electrónico no puede modificarse.</span>
              </div>
            </div>
          </div>

          {/* Seguridad / Contraseña */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Seguridad</h3>
                <p className="text-xs text-slate-400">Cambia tu contraseña de acceso — deja en blanco si no quieres modificarla</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nueva Contraseña</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                    placeholder="Mínimo 6 caracteres"
                    value={cuentaPassword}
                    onChange={(e) => setCuentaPassword(e.target.value)}
                    disabled={cuentaLoading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                    placeholder="Repite la nueva contraseña"
                    value={cuentaConfirm}
                    onChange={(e) => setCuentaConfirm(e.target.value)}
                    disabled={cuentaLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {cuentaError && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/60 text-red-300 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2 animate-fade-in">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              {cuentaError}
            </div>
          )}
          {cuentaExito && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-semibold leading-relaxed animate-fade-in">
              ✓ {cuentaExito}
            </div>
          )}

          {/* Botón guardar */}
          <form onSubmit={handleActualizarCuenta}>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
              disabled={cuentaLoading}
            >
              {cuentaLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Guardar Cambios de Cuenta'
              )}
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* TAB: MI GRUPO DE TRABAJO                      */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === 'grupo' && (
        <div className="max-w-2xl flex flex-col gap-6 animate-fade-in">

          {grupoTrabajo ? (
            <>
              {/* ─── INFORMACIÓN DEL GRUPO ─── */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Espacio Colaborativo</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{grupoTrabajo.nombre}</p>
                  </div>
                </div>
                <div className="p-6">
                  {/* Código de invitación */}
                  <div className="flex flex-col gap-1.5 mb-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código de Invitación</label>
                    <div className="flex items-center gap-3">
                      <span className="flex-1 text-xl font-mono font-bold text-white tracking-widest bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl select-all text-center">
                        {grupoTrabajo.codigo}
                      </span>
                      <button
                        type="button"
                        className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-white transition-all active:scale-95"
                        onClick={() => {
                          navigator.clipboard.writeText(grupoTrabajo.codigo);
                          setGrupoExito('¡Código copiado al portapapeles!');
                          setTimeout(() => setGrupoExito(''), 3000);
                        }}
                        title="Copiar código"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    {grupoExito && <span className="text-emerald-400 text-xs font-semibold">{grupoExito}</span>}
                  </div>

                  {/* Miembros */}
                  <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800/80 rounded-xl">
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Miembros Activos</span>
                      <span className="text-2xl font-extrabold text-white">
                        {grupoTrabajo.totalMiembros}
                        <span className="text-base font-normal text-slate-500 ml-1">/ {grupoTrabajo.limiteMiembros ?? 10}</span>
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Users size={22} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── CONFIGURACIÓN DEL GRUPO (PROPIETARIO) ─── */}
              {esPropietario && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Settings size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Configuración del Grupo</h3>
                      <p className="text-xs text-slate-400">Edita el nombre y el límite máximo de usuarios del grupo</p>
                    </div>
                  </div>
                  <form onSubmit={handleActualizarGrupo} className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre del Grupo de Trabajo</label>
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                        placeholder="Nombre del grupo"
                        value={grupoNombreConfig}
                        onChange={(e) => setGrupoNombreConfig(e.target.value)}
                        required
                        disabled={grupoConfigLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Límite Máximo de Usuarios
                        <span className="ml-2 text-slate-600 font-normal normal-case">(mínimo: {grupoTrabajo.totalMiembros} miembros actuales)</span>
                      </label>
                      <input
                        type="number"
                        min={grupoTrabajo.totalMiembros}
                        max={100}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        value={grupoLimiteConfig}
                        onChange={(e) => setGrupoLimiteConfig(parseInt(e.target.value) || 1)}
                        required
                        disabled={grupoConfigLoading}
                      />
                    </div>

                    {grupoConfigError && (
                      <div className="p-3 bg-red-950/50 border border-red-800/60 text-red-300 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fade-in">
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                        {grupoConfigError}
                      </div>
                    )}
                    {grupoConfigExito && (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in">
                        ✓ {grupoConfigExito}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/10"
                      disabled={grupoConfigLoading}
                    >
                      {grupoConfigLoading
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        : 'Guardar Configuración del Grupo'
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ─── CONSOLA DE ADMINISTRACIÓN (EXPANDIBLE, SOLO ADMIN) ─── */}
              {esAdmin && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setShowAdmin(!showAdmin); if (!showAdmin) cargarMiembros(); }}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-700 flex items-center justify-center text-slate-400">
                        <Users size={16} />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-white block">Consola de Administración</span>
                        <span className="text-xs text-slate-400">Gestiona roles y accesos de los miembros</span>
                      </div>
                    </div>
                    {showAdmin ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>

                  {showAdmin && (
                    <div className="border-t border-slate-800 p-6 animate-fade-in">
                      {errorMiembros && (
                        <div className="p-3 mb-4 bg-red-950/50 border border-red-800/60 text-red-300 rounded-xl text-xs font-semibold animate-fade-in">{errorMiembros}</div>
                      )}
                      {exitoMiembros && (
                        <div className="p-3 mb-4 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in">{exitoMiembros}</div>
                      )}
                      {loadingMiembros ? (
                        <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Cargando miembros...</span>
                        </div>
                      ) : (
                        <div className="db-table-container">
                          <table className="db-table">
                            <thead>
                              <tr>
                                <th>Miembro</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {miembros.map((m) => {
                                const esMismo = m.id === user.id;
                                return (
                                  <tr key={m.id}>
                                    <td>
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-slate-200">
                                          {m.nombre}{esMismo && <span className="text-emerald-400 text-xs ml-1">(Tú)</span>}
                                        </span>
                                        <span className="text-xs text-slate-400">{m.correo}</span>
                                      </div>
                                    </td>
                                    <td>
                                      {esMismo ? (
                                        <span className="db-role-badge administrador">{m.rol}</span>
                                      ) : (
                                        <select value={m.rol} onChange={(e) => handleAdministrar(m.id, 'rol', e.target.value)}
                                          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-emerald-500">
                                          <option value="Administrador">Administrador</option>
                                          <option value="Asesor Inmobiliario">Asesor Inmobiliario</option>
                                          <option value="Captador">Captador</option>
                                        </select>
                                      )}
                                    </td>
                                    <td>
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        m.estado === 'activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${m.estado === 'activo' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                        {m.estado}
                                      </span>
                                    </td>
                                    <td>
                                      {esMismo ? <span className="text-xs text-slate-500 italic">Propietario</span> : (
                                        <div className="flex items-center gap-2">
                                          {m.estado === 'activo' ? (
                                            <button onClick={() => handleAdministrar(m.id, 'estado', 'suspendido')}
                                              className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 hover:text-white transition-all" title="Suspender">
                                              <AlertTriangle size={14} />
                                            </button>
                                          ) : (
                                            <button onClick={() => handleAdministrar(m.id, 'estado', 'activo')}
                                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-white transition-all" title="Activar">
                                              <UserCheck size={14} />
                                            </button>
                                          )}
                                          <button onClick={() => handleAdministrar(m.id, 'expulsar')}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-white transition-all" title="Expulsar">
                                            <UserMinus size={14} />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─── ZONA DE PELIGRO (PROPIETARIO) ─── */}
              {esPropietario && (
                <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-1">
                        <AlertTriangle size={16} />
                        Zona de Peligro
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        Eliminar el grupo es una acción permanente. Se descargará automáticamente un respaldo CSV de todos los datos antes de proceder.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="whitespace-nowrap bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-all active:scale-95 self-start sm:self-center"
                    >
                      Eliminar Grupo
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ─── SIN GRUPO: CREAR O UNIRSE ─── */
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/20">
                  <Sparkles size={12} />
                  Colaboración en Equipo
                </span>
                <h3 className="text-2xl font-extrabold text-white mb-2">Empieza a colaborar</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Crea tu propio grupo de trabajo o únete a uno existente con un código de invitación.
                </p>
              </div>

              {grupoError && (
                <div className="p-3 mb-6 bg-red-950/50 border border-red-800/60 text-red-300 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fade-in">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  {grupoError}
                </div>
              )}
              {grupoExito && (
                <div className="p-3 mb-6 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-semibold animate-fade-in">
                  ✓ {grupoExito}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Crear Grupo */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Crear Grupo</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Define un nombre y obtén un código único para invitar a tu equipo.</p>
                  </div>
                  <form onSubmit={handleCrearSubmit} className="flex flex-col gap-3 mt-auto">
                    <input
                      type="text"
                      placeholder="Nombre del grupo de trabajo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
                      value={grupoNombre}
                      onChange={(e) => setGrupoNombre(e.target.value)}
                      required
                      disabled={grupoLoading}
                    />
                    <button type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      disabled={grupoLoading}>
                      {grupoLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Plus size={15} /> Crear</>}
                    </button>
                  </form>
                </div>

                {/* Unirse a Grupo */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ChevronRight size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Unirse con Código</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">Introduce el código de 6 caracteres que te proporcionó tu administrador.</p>
                  </div>
                  <form onSubmit={handleUnirseSubmit} className="flex flex-col gap-3 mt-auto">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="AB12CD"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white text-center font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                      value={grupoCodigo}
                      onChange={(e) => setGrupoCodigo(e.target.value)}
                      required
                      disabled={grupoLoading}
                    />
                    <button type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      disabled={grupoLoading}>
                      {grupoLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><ChevronRight size={15} /> Unirse</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL CONFIRMAR ELIMINAR GRUPO ─── */}
      {showDeleteModal && grupoTrabajo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-500" size={20} />
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Estás a punto de eliminar <strong>{grupoTrabajo.nombre}</strong>. Esta acción es permanente e irreversible.
            </p>
            <p className="text-xs text-slate-400 bg-slate-950/50 border border-slate-800 rounded-xl p-3 mb-5 leading-relaxed">
              Escribe el nombre exacto del grupo para confirmar. Se descargará automáticamente un respaldo CSV completo.
            </p>
            <input
              type="text"
              placeholder={grupoTrabajo.nombre}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors mb-4"
              value={confirmNombre}
              onChange={(e) => setConfirmNombre(e.target.value)}
            />
            {deleteError && (
              <div className="p-3 mb-4 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs font-semibold">{deleteError}</div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setConfirmNombre(''); setDeleteError(''); }}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                disabled={confirmNombre !== grupoTrabajo.nombre || deleteLoading}
              >
                {deleteLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Eliminar y Descargar CSVs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
