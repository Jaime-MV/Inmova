import React, { useState, useEffect, useRef } from 'react';
import { DashboardPersonal } from './DashboardPersonal';
import { DashboardPrincipal } from './DashboardPrincipal';
import type { ModuleId, UserSession } from './dashboard/Sidebar';
import './Dashboard.css';

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

export interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
  onUserUpdate?: (user: UserSession) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUserUpdate }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('inmuebles');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── ESTADOS DE DATOS ───
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [crm, setCrm] = useState<Cliente[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [stats, setStats] = useState({
    totalInmuebles: 0,
    disponibles: 0,
    reservados: 0,
    vendidos: 0,
    totalClientes: 0,
    visitasProgramadas: 0
  });

  const [loading, setLoading] = useState(true);

  // ─── ESTADOS DE GRUPO DE TRABAJO ───
  const [grupoTrabajo, setGrupoTrabajo] = useState<GrupoTrabajo | null>(null);
  const [loadingGrupo, setLoadingGrupo] = useState(false);
  const [grupoError, setGrupoError] = useState('');
  const [grupoExito, setGrupoExito] = useState('');
  const [grupoLoading, setGrupoLoading] = useState(false);

  // Modo de vista actual: 'grupo' (Espacio Grupal) o 'personal' (Espacio Personal)
  const [viewMode, setViewMode] = useState<'grupo' | 'personal'>('grupo');

  // ─── ESTADOS DE MODAL "+ NUEVO REGISTRO" ───
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const token = localStorage.getItem('inmova_token') || '';

  // ─── CARGA DE DATOS DE LA API ───

  const cargarStats = async (mode = viewMode) => {
    try {
      const res = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': mode
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data);
    } catch (err) {
      console.error('Error al cargar stats:', err);
    }
  };

  const cargarInmuebles = async (mode = viewMode) => {
    try {
      const res = await fetch('http://localhost:3000/api/dashboard/inmuebles', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': mode
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInmuebles(data);
    } catch (err) {
      console.error('Error al cargar inmuebles:', err);
    }
  };

  const cargarCRM = async (mode = viewMode) => {
    try {
      const res = await fetch('http://localhost:3000/api/dashboard/crm', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': mode
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCrm(data);
    } catch (err) {
      console.error('Error al cargar crm:', err);
    }
  };

  const cargarVisitas = async (mode = viewMode) => {
    try {
      const res = await fetch('http://localhost:3000/api/dashboard/visitas', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': mode
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVisitas(data);
    } catch (err) {
      console.error('Error al cargar visitas:', err);
    }
  };

  const cargarGrupoTrabajo = async (syncViewMode = false): Promise<boolean> => {
    setLoadingGrupo(true);
    setGrupoError('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/mi-grupo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok && data.grupo) {
        setGrupoTrabajo(data.grupo);
        if (syncViewMode) setViewMode('grupo');
        return true;
      } else {
        setGrupoTrabajo(null);
        if (syncViewMode) setViewMode('personal');
        return false;
      }
    } catch (err) {
      console.error('Error al cargar grupo:', err);
      setGrupoTrabajo(null);
      if (syncViewMode) setViewMode('personal');
      return false;
    } finally {
      setLoadingGrupo(false);
    }
  };

  const refrescarSesionUsuario = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.usuario && onUserUpdate) {
        onUserUpdate({
          id: data.usuario._id,
          nombre: data.usuario.nombre,
          correo: data.usuario.correo,
          rol: data.usuario.rol,
          tipoCuenta: data.usuario.tipoCuenta,
          avatarUrl: data.usuario.avatarUrl
        });
      }
    } catch (err) {
      console.error('Error al refrescar sesión del usuario:', err);
    }
  };

  const handleCrearGrupo = async (nombre: string) => {
    setGrupoLoading(true);
    setGrupoError('');
    setGrupoExito('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el grupo.');

      setGrupoTrabajo(data.grupo);
      setViewMode('grupo');
      setGrupoExito('¡Grupo creado con éxito! Tu portafolio ahora es colaborativo.');
      
      await refrescarSesionUsuario();
      await cargarTodo('grupo');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear el grupo.';
      setGrupoError(errorMsg);
    } finally {
      setGrupoLoading(false);
    }
  };

  const handleUnirseGrupo = async (codigo: string) => {
    setGrupoLoading(true);
    setGrupoError('');
    setGrupoExito('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/unirse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ codigo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al unirse al grupo.');

      setGrupoTrabajo(data.grupo);
      setViewMode('grupo');
      setGrupoExito('¡Te has unido al grupo de trabajo con éxito!');

      await refrescarSesionUsuario();
      await cargarTodo('grupo');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al unirse al grupo.';
      setGrupoError(errorMsg);
    } finally {
      setGrupoLoading(false);
    }
  };

  const handleEliminarGrupo = async () => {
    setGrupoLoading(true);
    setGrupoError('');
    setGrupoExito('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/eliminar', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar el grupo de trabajo.');

      setGrupoTrabajo(null);
      setViewMode('personal');
      setGrupoExito('¡El grupo de trabajo ha sido eliminado con éxito!');

      await refrescarSesionUsuario();
      await cargarTodo('personal');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el grupo.';
      setGrupoError(errorMsg);
      throw err;
    } finally {
      setGrupoLoading(false);
    }
  };

  const cargarTodo = async (mode = viewMode) => {
    setLoading(true);
    await Promise.all([cargarStats(mode), cargarInmuebles(mode), cargarCRM(mode), cargarVisitas(mode)]);
    setLoading(false);
  };

  const isMounted = useRef(false);

  // Inicialización (solo al montar)
  useEffect(() => {
    let active = true;
    const inicializar = async () => {
      setLoading(true);
      const hasGroup = await cargarGrupoTrabajo(true);

      const modoInicial = hasGroup ? 'grupo' : 'personal';
      await Promise.all([
        cargarStats(modoInicial),
        cargarInmuebles(modoInicial),
        cargarCRM(modoInicial),
        cargarVisitas(modoInicial)
      ]);

      if (active) {
        setLoading(false);
        isMounted.current = true;
      }
    };
    inicializar();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga de datos operacionales cuando cambia el modo de vista (viewMode)
  useEffect(() => {
    if (!isMounted.current) return;
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const onNewRecordSubmit = async (type: 'inmueble' | 'crm' | 'visita', formData: Record<string, unknown>): Promise<boolean> => {
    setModalLoading(true);
    setModalError('');
    try {
      let endpoint = '';
      if (type === 'inmueble') endpoint = 'http://localhost:3000/api/dashboard/inmuebles';
      else if (type === 'crm') endpoint = 'http://localhost:3000/api/dashboard/crm';
      else if (type === 'visita') endpoint = 'http://localhost:3000/api/dashboard/visitas';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': viewMode
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar el registro.');

      await cargarTodo();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la solicitud.';
      setModalError(errorMsg);
      return false;
    } finally {
      setModalLoading(false);
    }
  };

  // Enrutador inteligente basado en si pertenece a un grupo y el modo seleccionado
  if (grupoTrabajo !== null && viewMode === 'grupo') {
    return (
      <DashboardPrincipal
        user={user}
        onLogout={onLogout}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        inmuebles={inmuebles}
        crm={crm}
        visitas={visitas}
        stats={stats}
        loading={loading}
        grupoTrabajo={grupoTrabajo}
        loadingGrupo={loadingGrupo}
        grupoError={grupoError}
        setGrupoError={setGrupoError}
        grupoExito={grupoExito}
        setGrupoExito={setGrupoExito}
        grupoLoading={grupoLoading}
        onGrupoCrear={handleCrearGrupo}
        onGrupoUnirse={handleUnirseGrupo}
        showNewModal={showNewModal}
        setShowNewModal={setShowNewModal}
        modalLoading={modalLoading}
        modalError={modalError}
        setModalError={setModalError}
        onNewRecordSubmit={onNewRecordSubmit}
        refrescarTodo={cargarTodo}
        onGrupoEliminar={handleEliminarGrupo}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUserUpdate={onUserUpdate}
      />
    );
  }

  return (
    <DashboardPersonal
      user={user}
      onLogout={onLogout}
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      inmuebles={inmuebles}
      crm={crm}
      visitas={visitas}
      stats={stats}
      loading={loading}
      grupoTrabajo={grupoTrabajo}
      loadingGrupo={loadingGrupo}
      grupoError={grupoError}
      setGrupoError={setGrupoError}
      grupoExito={grupoExito}
      setGrupoExito={setGrupoExito}
      grupoLoading={grupoLoading}
      onGrupoCrear={handleCrearGrupo}
      onGrupoUnirse={handleUnirseGrupo}
      onGrupoEliminar={handleEliminarGrupo}
      showNewModal={showNewModal}
      setShowNewModal={setShowNewModal}
      modalLoading={modalLoading}
      modalError={modalError}
      setModalError={setModalError}
      onNewRecordSubmit={onNewRecordSubmit}
      refrescarTodo={cargarTodo}
      viewMode={viewMode}
      setViewMode={setViewMode}
      onUserUpdate={onUserUpdate}
    />
  );
};
export default Dashboard;
