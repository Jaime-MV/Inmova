import React, { useState } from 'react';
import {
  TrendingUp,
  Building,
  Calendar,
  Mail,
  Shield,
  Info,
  Bell
} from 'lucide-react';
import type { ModuleId, UserSession } from './Sidebar';
import { MisInmueblesModule } from './MisInmueblesModule';
import { CarteraClientesModule } from './CarteraClientesModule';
import ContratosModule from './ContratosModule';

interface Inmueble {
  _id: string;
  referenciaInterna: string;
  estado: 'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido';
  tipoInmueble: string;
  precioVenta: number;
  zona: string;
  descripcion: string;
  caracteristicas: {
    dormitorios: number;
    banos: number;
    superficieTotal: number;
  };
}

interface Cliente {
  _id: string;
  nombre: string;
  correo: string;
  telefono: string;
  canalOrigen: string;
  estadoLead: 'Nuevo' | 'Contactado' | 'Interesado' | 'Cerrado' | 'Descartado';
  preferencias: {
    tipoInmuebleBuscado: string;
    zonaInteres: string;
    rangoPrecioMax: number;
  };
}

interface Visita {
  _id: string;
  cliente: Cliente | null;
  inmueble: Inmueble | null;
  fechaHora: string;
  estado: 'Programada' | 'En Proceso' | 'Finalizada' | 'Cancelada';
  observacionesPostVisita: string;
}

interface ModulesProps {
  activeModule: ModuleId;
  inmuebles: Inmueble[];
  crm: Cliente[];
  visitas: Visita[];
  stats: {
    totalInmuebles: number;
    disponibles: number;
    reservados: number;
    vendidos: number;
    totalClientes: number;
    visitasProgramadas: number;
  };
  searchQuery: string;
  user: UserSession;
  refrescarTodo: () => Promise<void>;
  onNewRecordClick?: () => void;
  viewMode: 'grupo' | 'personal';
}

export const Modules: React.FC<ModulesProps> = ({
  activeModule,
  inmuebles,
  crm,
  visitas,
  stats,
  searchQuery,
  user,
  refrescarTodo,
  onNewRecordClick,
  viewMode
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<'dashboard' | 'mis-inmuebles'>('dashboard');
  return (
    <>
      {/* ──────────────────────────────────────────────────────── */}
      {/* MÓDULO 1: GESTIÓN DE INMUEBLES */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModule === 'inmuebles' && (
        <div className="module-view-inmuebles animate-fade-in">
          {/* Submenu de Gestión de Inmuebles */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-6">
            <button
              onClick={() => setActiveSubMenu('dashboard')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubMenu === 'dashboard' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp size={14} className={activeSubMenu === 'dashboard' ? 'text-emerald-400' : ''} />
              Dashboard Analítico
            </button>
            <button
              onClick={() => setActiveSubMenu('mis-inmuebles')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubMenu === 'mis-inmuebles' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building size={14} className={activeSubMenu === 'mis-inmuebles' ? 'text-emerald-400' : ''} />
              Mis Inmuebles
            </button>
            <button
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed flex items-center gap-2"
              disabled
            >
              📍 Zonas y Sectores (Próximamente)
            </button>
            <button
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed flex items-center gap-2"
              disabled
            >
              📋 Informes de Captación (Próximamente)
            </button>
          </div>

          {activeSubMenu === 'dashboard' && (
            <>
              {/* Tarjetas de Resumen Dinámicas */}
              <div className="db-summary-grid mb-6">
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-label">Total Propiedades</span>
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="card-value">{stats.totalInmuebles}</h3>
                  <p className="card-subtext">Registrados en tu workspace</p>
                </div>
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-label">Disponibles</span>
                    <span className="status-dot dot-disponible"></span>
                  </div>
                  <h3 className="card-value">{stats.disponibles}</h3>
                  <p className="card-subtext">Listos para visitas comerciales</p>
                </div>
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-label">Reservados</span>
                    <span className="status-dot dot-reservado"></span>
                  </div>
                  <h3 className="card-value">{stats.reservados}</h3>
                  <p className="card-subtext">En proceso de negociación</p>
                </div>
                <div className="summary-card">
                  <div className="card-header">
                    <span className="card-label">Vendidos/Alquilados</span>
                    <span className="status-dot dot-vendido"></span>
                  </div>
                  <h3 className="card-value">{stats.vendidos}</h3>
                  <p className="card-subtext">Cierres completados con éxito</p>
                </div>
              </div>

              {/* Sección Analítica Adicional Premium */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl animate-fade-in flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Estado Operativo de la Cartera</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Este panel analítico consolida los KPIs principales de tu portafolio de propiedades en base al aislamiento del workspace actual.
                  Utiliza las pestañas superiores para alternar entre el resumen del negocio y el catálogo interactivo independiente.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <span className="text-xxs text-slate-500 uppercase tracking-widest block mb-1">Tasa de Conversión</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {stats.totalInmuebles > 0 ? ((stats.vendidos / stats.totalInmuebles) * 100).toFixed(1) : '0.0'}%
                    </span>
                    <span className="text-xxs text-slate-650 block mt-0.5">Propiedades vendidas / total</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <span className="text-xxs text-slate-500 uppercase tracking-widest block mb-1">Disponibilidad Inmediata</span>
                    <span className="text-xl font-bold text-blue-400">
                      {stats.totalInmuebles > 0 ? ((stats.disponibles / stats.totalInmuebles) * 100).toFixed(1) : '0.0'}%
                    </span>
                    <span className="text-xxs text-slate-650 block mt-0.5">Listas para visitas comerciales</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <span className="text-xxs text-slate-500 uppercase tracking-widest block mb-1">En Proceso de Reserva</span>
                    <span className="text-xl font-bold text-yellow-400">
                      {stats.totalInmuebles > 0 ? ((stats.reservados / stats.totalInmuebles) * 100).toFixed(1) : '0.0'}%
                    </span>
                    <span className="text-xxs text-slate-650 block mt-0.5">En reserva o arras</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSubMenu === 'mis-inmuebles' && (
            <MisInmueblesModule
              inmuebles={inmuebles}
              crm={crm}
              user={user}
              refrescarTodo={refrescarTodo}
              onNewRecordClick={onNewRecordClick}
            />
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MÓDULO 2: CARTERA DE CLIENTES */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModule === 'crm' && (
        <div className="module-view-crm animate-fade-in w-full">
          <CarteraClientesModule
            crm={crm}
            searchQuery={searchQuery}
            user={user}
            refrescarTodo={refrescarTodo}
            viewMode={viewMode}
            onNewRecordClick={onNewRecordClick}
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MÓDULO 4: AGENDA DE VISITAS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModule === 'visitas' && (
        <div className="module-view-agenda animate-fade-in">
          <div className="agenda-grid">
            <div className="agenda-list">
              <div className="agenda-list-header">
                <h4>Citas y Visitas Programadas (Aislamiento RBAC)</h4>
              </div>

              {visitas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-4 text-center">
                  <Calendar size={48} className="text-slate-600 opacity-60 animate-pulse" />
                  <div>
                    <h5 className="text-slate-300 font-bold text-lg">No hay citas en tu agenda</h5>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm">
                      Planifica una cita asociando tus clientes y propiedades haciendo clic en "+ Nuevo Registro".
                    </p>
                  </div>
                </div>
              ) : (
                visitas.map((vis) => {
                  const dateObj = new Date(vis.fechaHora);
                  const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase();
                  const formattedTime = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={vis._id} className="agenda-item border-l-emerald">
                      <div className="agenda-time-box">
                        <span className="day">{formattedDate}</span>
                        <span className="time">{formattedTime}</span>
                      </div>
                      <div className="agenda-details">
                        <h5>Visita a {vis.inmueble?.tipoInmueble || 'Propiedad'} ({vis.inmueble?.referenciaInterna || 'S/Ref'})</h5>
                        <p>
                          Cliente: <strong>{vis.cliente?.nombre || 'Desconocido'}</strong> • Tel: {vis.cliente?.telefono || 'Sin teléfono'}
                        </p>
                        {vis.observacionesPostVisita && (
                          <p className="text-xs text-slate-400 mt-1">Notas: {vis.observacionesPostVisita}</p>
                        )}
                        <span className="agenda-badge b-programada">{vis.estado}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="agenda-sidebar-stats">
              <div className="stats-box">
                <h5>Citas Activas</h5>
                <div className="radial-progress-dummy" style={{ margin: '1rem 0' }}>
                  <span className="progress-value">{stats.visitasProgramadas}</span>
                </div>
                <p className="stats-desc">Visitas programadas para esta semana en tu espacio de trabajo.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MÓDULO 5: CONTRATOS Y PLANTILLAS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModule === 'contratos' && (
        <div className="module-view-contratos animate-fade-in w-full">
          <ContratosModule 
            usuario={user} 
            token={localStorage.getItem('inmova_token') || ''} 
            refrescarTodo={refrescarTodo} 
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MÓDULO 6: PUBLICIDAD Y ALERTAS */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModule === 'publicidad' && (
        <div className="module-view-publicidad animate-fade-in">
          <div className="alert-layout-grid">
            <div className="alert-card">
              <div className="alert-card-header">
                <Mail size={20} className="text-emerald-400" />
                <h4>Campaña Automatizada (Vacía)</h4>
              </div>
              <p>No se han disparado campañas de marketing en esta cuenta.</p>
              <div className="alert-metrics">
                <div className="metric-sub">
                  <span className="m-val">0%</span>
                  <span className="m-lbl">Entregados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MÓDULO 7: CONFIGURACIÓN Y AUDITORÍA */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeModule === 'admin' && (
        <div className="module-view-admin animate-fade-in">
          <div className="admin-grid-layout">
            {/* Control de Acceso */}
            <div className="admin-block">
              <div className="admin-block-header">
                <Shield size={20} className="text-emerald-400" />
                <h4>Control de Acceso basado en Roles (RBAC)</h4>
              </div>
              <div className="user-list-dummy">
                <div className="user-row">
                  <span>{user.nombre} ({user.correo})</span>
                  <span className="badge-role role-admin">{user.rol}</span>
                </div>
              </div>
              <div className="flex gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-lg mt-2 text-xs text-slate-400 leading-relaxed">
                <Info size={18} className="text-emerald-400 flex-shrink-0" />
                <span>
                  Tu cuenta está configurada bajo el rol <strong>{user.rol}</strong> con aislamiento estricto de base de datos cifrada.
                </span>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="admin-block">
              <div className="admin-block-header">
                <Bell size={20} className="text-blue-400" />
                <h4>logs de Eventos del Espacio (Seguridad)</h4>
              </div>
              <div className="audit-log-list">
                <div className="log-item">
                  <span className="log-time">Ahora</span>
                  <span className="log-action">LOGIN_SUCCESS</span>
                  <p>Usuario {user.nombre} inició sesión con cifrado de sesión JWT.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
