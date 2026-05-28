import React from 'react';
import {
  Building,
  Users,
  Calendar,
  FileText,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';

export type ModuleId = 'inmuebles' | 'crm' | 'visitas' | 'contratos' | 'publicidad' | 'admin' | 'grupo';

export interface UserSession {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  tipoCuenta: string;
  avatarUrl: string | null;
}

interface SidebarProps {
  user: UserSession;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  onLogout: () => void;
  grupoTrabajo?: unknown;
  viewMode?: 'grupo' | 'personal';
  setViewMode?: (mode: 'grupo' | 'personal') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeModule,
  setActiveModule,
  onLogout,
  grupoTrabajo,
  viewMode,
  setViewMode
}) => {
  const modulos = [
    { id: 'inmuebles', label: 'Gestión de Inmuebles', icon: Building, desc: 'Portafolio de propiedades, datos privados y propietarios' },
    { id: 'crm', label: 'Cartera de clientes', icon: Users, desc: 'Gestión y control de información personal de tus clientes' },
    { id: 'visitas', label: 'Agenda de Visitas', icon: Calendar, desc: 'Planificación de citas, estados y calendario interactivo' },
    { id: 'contratos', label: 'Contratos y Plantillas', icon: FileText, desc: 'Generación de documentos PDF y gestión de plantillas WYSIWYG' },
    { id: 'publicidad', label: 'Publicidad y Alertas', icon: Megaphone, desc: 'Campañas de email masivo, WhatsApp marketing y notificaciones' },
    { id: 'admin', label: 'Configuración y Auditoría', icon: Settings, desc: 'Control de accesos (RBAC), identidad de marca y logs de eventos' },
  ] as const;

  return (
    <aside className="db-sidebar">
      {/* Marca / Logo */}
      <div className="db-sidebar-logo">
        <div className="db-logo-cube-animated"></div>
        <span className="db-logo-text">INMOVA</span>
      </div>

      {/* Selector de Espacio de Trabajo (Solo si pertenece a un grupo) */}
      {!!grupoTrabajo && setViewMode && viewMode && (
        <div className="px-4 mb-4">
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 flex gap-1">
            <button
              onClick={() => setViewMode('personal')}
              className={`flex-grow py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                viewMode === 'personal'
                  ? 'bg-slate-800 text-white border border-slate-700/50 shadow-md shadow-slate-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User size={13} />
              Personal
            </button>
            <button
              onClick={() => setViewMode('grupo')}
              className={`flex-grow py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                viewMode === 'grupo'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={13} />
              Grupo
            </button>
          </div>
        </div>
      )}

      {/* Lista de Módulos */}
      <nav className="db-sidebar-nav">
        {modulos.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <div key={mod.id} className="flex flex-col w-full">
              <button
                className={`db-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveModule(mod.id)}
                title={mod.desc}
              >
                <Icon size={20} className="nav-item-icon" />
                <span className="nav-item-label">{mod.label}</span>
                {isActive && <ChevronRight size={14} className="nav-item-chevron" />}
              </button>
              {isActive && mod.id === 'inmuebles' && (
                <div className="pl-8 pr-2 py-1 flex flex-col gap-1 border-l border-emerald-500/20 ml-6 mt-1 animate-fade-in">
                  <button
                    onClick={() => setActiveModule('inmuebles')}
                    className="text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Mis Inmuebles
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Perfil del Usuario al Fondo */}
      <div className="db-sidebar-footer">
        <button
          onClick={() => setActiveModule('grupo')}
          className={`db-user-card ${activeModule === 'grupo' ? 'active' : ''}`}
          title="Mi Cuenta y Grupo"
        >
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=10B981&color=fff&size=100`}
            alt={user.nombre}
            className="db-user-avatar"
          />
          <div className="db-user-meta flex-grow text-left">
            <span className="db-user-name" title={user.nombre}>{user.nombre}</span>
            <span className={`db-role-badge ${user.rol.toLowerCase().replace(/\s+/g, '-')}`}>
              {user.rol}
            </span>
          </div>
          <Settings
            size={18}
            className={`flex-shrink-0 transition-colors ${activeModule === 'grupo' ? 'text-emerald-400' : 'text-slate-500'}`}
          />
        </button>
        <button className="db-logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
