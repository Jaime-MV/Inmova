import React from 'react';
import { Sidebar } from './dashboard/Sidebar';
import type { ModuleId, UserSession } from './dashboard/Sidebar';
import { Topbar } from './dashboard/Topbar';
import { Modules } from './dashboard/Modules';
import { GrupoModule } from './dashboard/GrupoModule';
import { NewRecordModal } from './dashboard/NewRecordModal';

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

interface GrupoTrabajo {
  id: string;
  nombre: string;
  codigo: string;
  propietarioId: string;
  miembros: string[];
  totalMiembros: number;
}

interface DashboardPrincipalProps {
  user: UserSession;
  onLogout: () => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  loading: boolean;
  grupoTrabajo: GrupoTrabajo | null;
  loadingGrupo: boolean;
  grupoError: string;
  setGrupoError: (err: string) => void;
  grupoExito: string;
  setGrupoExito: (success: string) => void;
  grupoLoading: boolean;
  onGrupoCrear: (nombre: string) => Promise<void>;
  onGrupoUnirse: (codigo: string) => Promise<void>;
  showNewModal: boolean;
  setShowNewModal: (show: boolean) => void;
  modalLoading: boolean;
  modalError: string;
  setModalError: (err: string) => void;
  onNewRecordSubmit: (type: 'inmueble' | 'crm' | 'visita', data: Record<string, unknown>) => Promise<boolean>;
  refrescarTodo: () => Promise<void>;
  onGrupoEliminar: () => Promise<void>;
  viewMode: 'grupo' | 'personal';
  setViewMode: (mode: 'grupo' | 'personal') => void;
  onUserUpdate?: (user: UserSession) => void;
}

export const DashboardPrincipal: React.FC<DashboardPrincipalProps> = ({
  user,
  onLogout,
  activeModule,
  setActiveModule,
  searchQuery,
  setSearchQuery,
  inmuebles,
  crm,
  visitas,
  stats,
  loading,
  grupoTrabajo,
  loadingGrupo,
  grupoError,
  setGrupoError,
  grupoExito,
  setGrupoExito,
  grupoLoading,
  onGrupoCrear,
  onGrupoUnirse,
  showNewModal,
  setShowNewModal,
  modalLoading,
  modalError,
  setModalError,
  onNewRecordSubmit,
  refrescarTodo,
  onGrupoEliminar,
  viewMode,
  setViewMode,
  onUserUpdate
}) => {
  return (
    <div className="db-layout">
      {/* Sidebar Colaborativo */}
      <Sidebar
        user={user}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onLogout={onLogout}
        grupoTrabajo={grupoTrabajo}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Contenido Principal */}
      <main className="db-main-content">
        <Topbar
          activeModule={activeModule}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewRecordClick={() => {
            setShowNewModal(true);
            setModalError('');
          }}
        />

        <div className="db-module-body animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Sincronizando con base de datos en tiempo real...</span>
            </div>
          ) : (
            <>
              {activeModule === 'grupo' ? (
                <GrupoModule
                  user={user}
                  grupoTrabajo={grupoTrabajo}
                  loadingGrupo={loadingGrupo}
                  onGrupoCrear={onGrupoCrear}
                  onGrupoUnirse={onGrupoUnirse}
                  grupoError={grupoError}
                  setGrupoError={setGrupoError}
                  grupoExito={grupoExito}
                  setGrupoExito={setGrupoExito}
                  grupoLoading={grupoLoading}
                  refrescarTodo={refrescarTodo}
                  inmuebles={inmuebles}
                  crm={crm}
                  visitas={visitas}
                  onGrupoEliminar={onGrupoEliminar}
                  onUserUpdate={onUserUpdate}
                />
              ) : (
                <Modules
                  activeModule={activeModule}
                  inmuebles={inmuebles}
                  crm={crm}
                  visitas={visitas}
                  stats={stats}
                  searchQuery={searchQuery}
                  user={user}
                  refrescarTodo={refrescarTodo}
                  onNewRecordClick={() => {
                    setShowNewModal(true);
                    setModalError('');
                  }}
                  viewMode={viewMode}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal Modular de Nuevo Registro */}
      <NewRecordModal
        activeModule={activeModule}
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        inmueblesList={inmuebles}
        crmList={crm}
        onSubmit={onNewRecordSubmit}
        loading={modalLoading}
        error={modalError}
        setError={setModalError}
        workspaceType="grupo"
      />
    </div>
  );
};
export default DashboardPrincipal;
