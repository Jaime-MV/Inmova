import React, { useState, useMemo } from 'react';
import {
  Users,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  MessageSquare,
  Building,
  DollarSign,
  MapPin,
  Check,
  ExternalLink,
  TrendingUp,
  UserCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import type { UserSession } from './Sidebar';
import { DEPARTAMENTOS_EL_SALVADOR } from './NewRecordModal';

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

interface CarteraClientesModuleProps {
  crm: Cliente[];
  searchQuery: string;
  user: UserSession;
  refrescarTodo: () => Promise<void>;
  viewMode: 'grupo' | 'personal';
  onNewRecordClick?: () => void;
}

export const CarteraClientesModule: React.FC<CarteraClientesModuleProps> = ({
  crm,
  searchQuery: externalSearchQuery,
  refrescarTodo,
  viewMode,
  onNewRecordClick
}) => {
  // Estados de filtros internos
  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('nombre-asc');

  // Estados de modales y operaciones
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [deletingClient, setDeletingClient] = useState<Cliente | null>(null);
  const [selectedDetailClient, setSelectedDetailClient] = useState<Cliente | null>(null);

  // Formulario de edición
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editCanal, setEditCanal] = useState('WhatsApp');
  const [editEstado, setEditEstado] = useState<'Nuevo' | 'Contactado' | 'Interesado' | 'Cerrado' | 'Descartado'>('Nuevo');
  const [editPrefTipo, setEditPrefTipo] = useState('Piso');
  const [editPrefDeps, setEditPrefDeps] = useState<string[]>([]);
  const [editPrefCity, setEditPrefCity] = useState('');
  const [editPrefPrecio, setEditPrefPrecio] = useState('');

  // Estados de carga y mensajes
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const token = localStorage.getItem('inmova_token') || '';

  // 1. Calcular KPIs dinámicos
  const kpis = useMemo(() => {
    const total = crm.length;
    const nuevos = crm.filter(c => c.estadoLead === 'Nuevo').length;
    
    // Encontrar canal principal
    const canalesCount: Record<string, number> = {};
    crm.forEach(c => {
      canalesCount[c.canalOrigen] = (canalesCount[c.canalOrigen] || 0) + 1;
    });
    let maxCanal = 'Ninguno';
    let maxCount = 0;
    Object.entries(canalesCount).forEach(([canal, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCanal = canal;
      }
    });

    // Presupuesto promedio de clientes interesados
    const presupuestos = crm
      .map(c => c.preferencias?.rangoPrecioMax || 0)
      .filter(p => p > 0);
    const promPresupuesto = presupuestos.length > 0 
      ? presupuestos.reduce((acc, p) => acc + p, 0) / presupuestos.length 
      : 0;

    return {
      total,
      nuevos,
      canalPrincipal: maxCanal === 'Ninguno' ? 'Sin datos' : `${maxCanal} (${maxCount})`,
      promPresupuesto
    };
  }, [crm]);

  // 2. Filtrado y ordenación de la lista de clientes
  const filteredClients = useMemo(() => {
    return crm
      .filter(c => {
        // Búsqueda por término local y externo (Topbar)
        const term = (localSearch || externalSearchQuery).toLowerCase();
        const matchesSearch = 
          c.nombre.toLowerCase().includes(term) ||
          c.correo.toLowerCase().includes(term) ||
          c.telefono.includes(term) ||
          (c.preferencias?.zonaInteres || '').toLowerCase().includes(term);

        const matchesStatus = selectedStatus === 'Todos' || c.estadoLead === selectedStatus;
        const matchesOrigin = selectedOrigin === 'Todos' || c.canalOrigen === selectedOrigin;

        return matchesSearch && matchesStatus && matchesOrigin;
      })
      .sort((a, b) => {
        if (sortBy === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
        if (sortBy === 'nombre-desc') return b.nombre.localeCompare(a.nombre);
        if (sortBy === 'presupuesto-desc') {
          return (b.preferencias?.rangoPrecioMax || 0) - (a.preferencias?.rangoPrecioMax || 0);
        }
        if (sortBy === 'presupuesto-asc') {
          return (a.preferencias?.rangoPrecioMax || 0) - (b.preferencias?.rangoPrecioMax || 0);
        }
        return 0;
      });
  }, [crm, localSearch, externalSearchQuery, selectedStatus, selectedOrigin, sortBy]);

  // 3. Manejar Refresco Manual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refrescarTodo();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 4. Iniciar Edición
  const startEdit = (cliente: Cliente) => {
    setEditingClient(cliente);
    setEditNombre(cliente.nombre);
    setEditCorreo(cliente.correo || '');
    setEditTelefono(cliente.telefono || '');
    setEditCanal(cliente.canalOrigen || 'WhatsApp');
    setEditEstado(cliente.estadoLead || 'Nuevo');
    setEditPrefTipo(cliente.preferencias?.tipoInmuebleBuscado || 'Piso');
    
    // Parser para zonas e intereses de El Salvador
    const rawZona = cliente.preferencias?.zonaInteres || '';
    const parts = rawZona.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 2 && DEPARTAMENTOS_EL_SALVADOR[parts[0]]?.includes(parts[1])) {
      setEditPrefDeps([parts[0]]);
      setEditPrefCity(parts[1]);
    } else {
      const deps = parts.filter(p => Object.keys(DEPARTAMENTOS_EL_SALVADOR).includes(p));
      setEditPrefDeps(deps);
      setEditPrefCity('');
    }

    setEditPrefPrecio(cliente.preferencias?.rangoPrecioMax ? String(cliente.preferencias.rangoPrecioMax) : '');
    setApiError('');
    setApiSuccess('');
  };

  // 5. Enviar Actualización
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editNombre.trim()) {
      setApiError('El nombre del cliente es obligatorio.');
      return;
    }

    let zonaStr = '';
    if (editPrefDeps.length > 0) {
      if (editPrefDeps.length === 1) {
        const dep = editPrefDeps[0];
        zonaStr = editPrefCity ? `${dep}, ${editPrefCity}` : dep;
      } else {
        zonaStr = editPrefDeps.join(', ');
      }
    }

    try {
      const res = await fetch(`http://localhost:3000/api/dashboard/crm/${editingClient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': viewMode
        },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          correo: editCorreo.trim(),
          telefono: editTelefono.trim(),
          canalOrigen: editCanal,
          estadoLead: editEstado,
          preferencias: {
            tipoInmuebleBuscado: editPrefTipo,
            zonaInteres: zonaStr,
            rangoPrecioMax: editPrefPrecio ? Number(editPrefPrecio) : 0
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar el cliente.');
      }

      setApiSuccess('Cliente actualizado correctamente.');
      await refrescarTodo();
      
      // Cerrar modal tras delay
      setTimeout(() => {
        setEditingClient(null);
        setApiSuccess('');
      }, 800);
    } catch (err: any) {
      setApiError(err.message || 'Error de red al actualizar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Iniciar Eliminación
  const startDelete = (cliente: Cliente) => {
    setDeletingClient(cliente);
    setApiError('');
    setApiSuccess('');
  };

  // 7. Enviar Eliminación
  const handleDeleteConfirm = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);
    setApiError('');
    setApiSuccess('');

    try {
      const res = await fetch(`http://localhost:3000/api/dashboard/crm/${deletingClient._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-workspace-mode': viewMode
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar el cliente.');
      }

      setApiSuccess('Cliente eliminado con éxito de tu cartera.');
      await refrescarTodo();
      
      setTimeout(() => {
        setDeletingClient(null);
        setApiSuccess('');
      }, 800);
    } catch (err: any) {
      setApiError(err.message || 'Error al eliminar cliente.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Formateador de moneda USD
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Generador de link de WhatsApp con mensaje personalizado
  const getWhatsAppLink = (phone: string, nombre: string) => {
    // Limpiar caracteres del teléfono para el enlace
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const message = `¡Hola ${nombre}! Te contacto desde Inmova. He estado revisando tu perfil de interés inmobiliario y me gustaría saber si dispones de unos minutos para hablar sobre algunas propiedades disponibles.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="flex flex-col gap-6 text-slate-300 w-full">
      {/* ──────────────────────────────────────────────────────── */}
      {/* SECCIÓN 1: KPIS Y MÉTRICAS PREMIUM */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/20 hover:border-slate-700/60 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Cartera Total</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{kpis.total}</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">Clientes registrados</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/20 hover:border-slate-700/60 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Nuevos Clientes</span>
            <h3 className="text-3xl font-extrabold text-blue-400 tracking-tight">{kpis.nuevos}</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">En primera etapa del pipeline</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <UserCheck size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/20 hover:border-slate-700/60 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Canal Principal</span>
            <h3 className="text-lg font-bold text-amber-400 tracking-tight mt-1 truncate max-w-[150px]">{kpis.canalPrincipal}</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">Origen de captación mayoritario</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-950/20 hover:border-slate-700/60 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider">Presupuesto Promedio</span>
            <h3 className="text-xl font-extrabold text-emerald-400 tracking-tight mt-1">{formatPrice(kpis.promPresupuesto)}</h3>
            <span className="text-[10px] text-slate-400 mt-0.5">De los interesados activos</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* SECCIÓN 2: CONTROL DE FILTROS Y BÚSQUEDA */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row flex-wrap items-center justify-between gap-4">
        
        {/* Barra de búsqueda interna */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, zona..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/80 placeholder-slate-500"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filtro Estado */}
          <div className="flex items-center gap-1.5 bg-[#1e293b]/40 border border-slate-850 px-2 py-1 rounded-xl">
            <Filter size={12} className="text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none text-slate-300 text-xxs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Nuevo">Nuevos</option>
              <option value="Contactado">Contactados</option>
              <option value="Interesado">Interesados</option>
              <option value="Cerrado">Cerrados</option>
              <option value="Descartado">Descartados</option>
            </select>
          </div>

          {/* Filtro Canal */}
          <div className="flex items-center gap-1.5 bg-[#1e293b]/40 border border-slate-850 px-2 py-1 rounded-xl">
            <MessageSquare size={12} className="text-slate-500" />
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-transparent border-none text-slate-300 text-xxs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los Canales</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
              <option value="Web">Web Portal</option>
              <option value="Llamada">Llamadas</option>
            </select>
          </div>

          {/* Ordenar */}
          <div className="flex items-center gap-1.5 bg-[#1e293b]/40 border border-slate-850 px-2 py-1 rounded-xl">
            <TrendingUp size={12} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-slate-300 text-xxs font-bold focus:outline-none cursor-pointer"
            >
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
              <option value="presupuesto-desc">Presupuesto Max</option>
              <option value="presupuesto-asc">Presupuesto Min</option>
            </select>
          </div>

          {/* Recargar */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#1e293b]/40 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200 disabled:opacity-50"
            title="Refrescar lista"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Botón rápido "+ Nuevo Cliente" */}
          {onNewRecordClick && (
            <button
              onClick={onNewRecordClick}
              className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xxs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
            >
              <Plus size={12} />
              Agregar Cliente
            </button>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* SECCIÓN 3: LISTADO DE CLIENTES (GRID GLASSMORPHISM) */}
      {/* ──────────────────────────────────────────────────────── */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#1e293b]/10 border border-dashed border-slate-800 rounded-3xl text-center">
          <Users size={48} className="text-slate-700 mb-3 opacity-40 animate-pulse" />
          <h4 className="text-white font-bold text-base">No se encontraron clientes</h4>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            Intenta cambiar los parámetros de búsqueda o de filtros, o agrega un nuevo cliente a este workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((cliente) => {
            // Clases de badge para estado
            let badgeStatusClass = '';
            if (cliente.estadoLead === 'Nuevo') badgeStatusClass = 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
            else if (cliente.estadoLead === 'Contactado') badgeStatusClass = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
            else if (cliente.estadoLead === 'Interesado') badgeStatusClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            else if (cliente.estadoLead === 'Cerrado') badgeStatusClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            else badgeStatusClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';

            // Clases de badge para canal
            let badgeCanalClass = '';
            if (cliente.canalOrigen === 'WhatsApp') badgeCanalClass = 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20';
            else if (cliente.canalOrigen === 'Email') badgeCanalClass = 'bg-blue-600/10 text-blue-400 border border-blue-500/20';
            else if (cliente.canalOrigen === 'Web') badgeCanalClass = 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20';
            else badgeCanalClass = 'bg-teal-650/10 text-teal-400 border border-teal-500/20';

            return (
              <div
                key={cliente._id}
                className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-slate-950/20 hover:shadow-emerald-500/5 transition-all duration-300 group"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeStatusClass}`}>
                        {cliente.estadoLead}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badgeCanalClass}`}>
                        {cliente.canalOrigen}
                      </span>
                    </div>

                    {/* Acciones de gestión */}
                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cliente)}
                        className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-[#1e293b] rounded-lg transition-all"
                        title="Editar cliente"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => startDelete(cliente)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#1e293b] rounded-lg transition-all"
                        title="Eliminar cliente"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Nombre */}
                  <h4 
                    onClick={() => setSelectedDetailClient(cliente)}
                    className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors cursor-pointer mt-1 flex items-center gap-1.5"
                  >
                    {cliente.nombre}
                  </h4>

                  {/* Datos de contacto */}
                  <div className="flex flex-col gap-1.5 mt-2 border-b border-slate-800/50 pb-3">
                    {cliente.telefono && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Phone size={12} className="text-slate-500" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.correo && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs truncate" title={cliente.correo}>
                        <Mail size={12} className="text-slate-500" />
                        <span className="truncate">{cliente.correo}</span>
                      </div>
                    )}
                  </div>

                  {/* Preferencias de búsqueda */}
                  <div className="mt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Preferencias</span>
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                      
                      {/* Tipo Inmueble */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-500 flex items-center gap-1"><Building size={8} /> Tipo</span>
                        <span className="text-xxs font-bold text-slate-300">
                          {cliente.preferencias?.tipoInmuebleBuscado || 'Cualquiera'}
                        </span>
                      </div>

                      {/* Presupuesto */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-500 flex items-center gap-1"><DollarSign size={8} /> Presupuesto</span>
                        <span className="text-xxs font-bold text-emerald-400">
                          {cliente.preferencias?.rangoPrecioMax 
                            ? formatPrice(cliente.preferencias.rangoPrecioMax)
                            : 'Sin límite'}
                        </span>
                      </div>

                      {/* Zona */}
                      <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-800/60 pt-1.5 mt-1">
                        <span className="text-[9px] text-slate-500 flex items-center gap-1"><MapPin size={8} /> Zona de interés</span>
                        <span className="text-xxs font-bold text-slate-300 truncate">
                          {cliente.preferencias?.zonaInteres || 'Cualquier zona'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas de Contacto */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/50">
                  {/* WhatsApp */}
                  {cliente.telefono ? (
                    <a
                      href={getWhatsAppLink(cliente.telefono, cliente.nombre)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 text-xxs font-bold flex items-center justify-center gap-1.5 transition-all duration-300"
                    >
                      <MessageSquare size={13} />
                      WhatsApp
                      <ExternalLink size={10} className="opacity-60" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-grow py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 text-xxs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      WhatsApp (Sin Tel)
                    </button>
                  )}

                  {/* Correo */}
                  {cliente.correo ? (
                    <a
                      href={`mailto:${cliente.correo}?subject=Inmova - Asesoramiento Inmobiliario`}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all duration-300"
                      title="Enviar Email"
                    >
                      <Mail size={13} />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                      title="Sin Email"
                    >
                      <Mail size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL 1: EDICIÓN DE CLIENTE (DARK GLASSMORPHISM) */}
      {/* ──────────────────────────────────────────────────────── */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-white">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#0f172a] border-b border-slate-700/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-emerald-400" />
                <h3 className="font-bold text-white text-lg">Editar Información del Cliente</h3>
              </div>
              <button
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => setEditingClient(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              
              {/* Avisos de API */}
              {apiError && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-lg text-xs font-semibold leading-relaxed">
                  {apiError}
                </div>
              )}
              {apiSuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  {apiSuccess}
                </div>
              )}

              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="ej: Alejandro Gómez"
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                />
              </div>

              {/* Correo y Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="ej: alejandro@correo.com"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={editCorreo}
                    onChange={(e) => setEditCorreo(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="ej: +34 600 000 000"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                  />
                </div>
              </div>

              {/* Canal y Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Canal de Origen</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    value={editCanal}
                    onChange={(e) => setEditCanal(e.target.value)}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Web">Web Portal</option>
                    <option value="Llamada">Llamada</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Estado en Pipeline</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as any)}
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Interesado">Interesado</option>
                    <option value="Cerrado">Cerrado</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </div>
              </div>

              {/* Preferencias */}
              <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-emerald-400">Preferencias del Cliente</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Tipo de Inmueble</label>
                    <select
                      className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none cursor-pointer"
                      value={editPrefTipo}
                      onChange={(e) => setEditPrefTipo(e.target.value)}
                    >
                      <option value="Piso">Piso</option>
                      <option value="Casa">Casa</option>
                      <option value="Chalet">Chalet</option>
                      <option value="Oficina">Oficina</option>
                      <option value="Lote">Lote</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Presupuesto Máx ($)</label>
                    <input
                      type="number"
                      placeholder="ej: 300000"
                      className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                      value={editPrefPrecio}
                      onChange={(e) => setEditPrefPrecio(e.target.value)}
                    />
                  </div>
                </div>
                {/* Departamento y Ciudad con reglas de El Salvador */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Departamento(s) * (Multiselección)</label>
                    <div className="bg-slate-950 border border-slate-750 rounded-lg p-2 h-28 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                      {Object.keys(DEPARTAMENTOS_EL_SALVADOR).map((dep) => {
                        const isChecked = editPrefDeps.includes(dep);
                        return (
                          <label key={dep} className="flex items-center gap-2 hover:bg-slate-900/60 p-0.5 rounded cursor-pointer text-[10px] text-slate-350 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              onChange={() => {
                                if (isChecked) {
                                  const updated = editPrefDeps.filter(d => d !== dep);
                                  setEditPrefDeps(updated);
                                  if (updated.length !== 1) {
                                    setEditPrefCity('');
                                  }
                                } else {
                                  const updated = [...editPrefDeps, dep];
                                  setEditPrefDeps(updated);
                                  if (updated.length !== 1) {
                                    setEditPrefCity('');
                                  }
                                }
                              }}
                            />
                            <span className={isChecked ? 'text-white font-bold' : ''}>{dep}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 justify-between">
                    <div>
                      <label className="text-[10px] text-slate-400">Ciudad</label>
                      <select
                        disabled={editPrefDeps.length !== 1}
                        value={editPrefCity}
                        onChange={(e) => setEditPrefCity(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full mt-1"
                      >
                        {editPrefDeps.length !== 1 ? (
                          <option value="">
                            {editPrefDeps.length > 1 
                              ? '❌ Deshabilitado (Múltiples Deptos)' 
                              : '⚠️ Selecciona 1 Depto'}
                          </option>
                        ) : (
                          <>
                            <option value="">Cualquier ciudad</option>
                            {DEPARTAMENTOS_EL_SALVADOR[editPrefDeps[0]]?.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    {editPrefDeps.length > 1 && (
                      <span className="text-[9px] text-emerald-400 leading-tight block bg-emerald-950/20 border border-emerald-900/30 p-1.5 rounded-lg">
                        Buscando en {editPrefDeps.length} departamentos de El Salvador
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de Guardado */}
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white/25 border-t-white rounded-full"></div>
                    Guardando Cambios...
                  </>
                ) : (
                  'Guardar Cambios del Cliente'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL 2: CONFIRMACIÓN DE ELIMINACIÓN ANIMADA */}
      {/* ──────────────────────────────────────────────────────── */}
      {deletingClient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1e293b] border border-red-900/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-white">
            
            {/* Header / Alerta */}
            <div className="px-6 py-5 bg-[#0f172a] border-b border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-base">¿Eliminar Cliente?</h3>
                <span className="text-xxs text-slate-500 uppercase tracking-widest">Confirmación Obligatoria</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 flex flex-col gap-4">
              {apiError && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-lg text-xs font-semibold leading-relaxed">
                  {apiError}
                </div>
              )}
              {apiSuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold">
                  {apiSuccess}
                </div>
              )}

              <p className="text-xs text-slate-350 leading-relaxed">
                Estás a punto de eliminar a <strong>{deletingClient.nombre}</strong> de tu cartera comercial. Esta acción removerá su ficha personal, historial de contacto y preferencias de búsqueda de forma irreversible.
              </p>
              
              <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl flex items-start gap-2.5">
                <Clock size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="text-[10px] text-red-300 leading-relaxed font-semibold">
                  Aislamiento Multi-workspace: La eliminación respetará estrictamente el filtro de tu espacio de trabajo y no afectará otros registros.
                </span>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setDeletingClient(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-650 text-white text-xs font-bold transition-all shadow-lg shadow-red-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white/25 border-t-white rounded-full"></div>
                      Eliminando...
                    </>
                  ) : (
                    'Sí, Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* DETALLES DESPLEGABLES DEL CLIENTE */}
      {/* ──────────────────────────────────────────────────────── */}
      {selectedDetailClient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in text-white">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#0f172a] border-b border-slate-700/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <h3 className="font-bold text-white text-lg">Ficha del Cliente</h3>
              </div>
              <button
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => setSelectedDetailClient(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 flex flex-col gap-5">
              {/* Información General */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-extrabold text-white">{selectedDetailClient.nombre}</h4>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    ID: {selectedDetailClient._id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Workspace: {viewMode === 'grupo' ? 'Grupal' : 'Personal'}
                  </span>
                </div>
              </div>

              {/* Datos de contacto */}
              <div className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Información de Contacto</h5>
                
                <div className="flex items-center gap-3 text-slate-300 text-xs">
                  <Phone size={14} className="text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Teléfono / Celular</span>
                    <span className="font-bold">{selectedDetailClient.telefono || 'Sin registrar'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 text-xs border-t border-slate-900 pt-2.5 mt-1">
                  <Mail size={14} className="text-slate-500 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block">Correo Electrónico</span>
                    <span className="font-bold truncate">{selectedDetailClient.correo || 'Sin registrar'}</span>
                  </div>
                </div>
              </div>

              {/* Preferencias */}
              <div className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preferencias de Búsqueda</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tipo Buscado</span>
                    <span className="font-bold text-slate-200 text-xs">{selectedDetailClient.preferencias?.tipoInmuebleBuscado || 'No definido'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Presupuesto Máximo</span>
                    <span className="font-bold text-emerald-400 text-xs">
                      {selectedDetailClient.preferencias?.rangoPrecioMax 
                        ? formatPrice(selectedDetailClient.preferencias.rangoPrecioMax)
                        : 'Sin límite'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-2.5 mt-1">
                  <span className="text-[10px] text-slate-500 block">Zona de Interés</span>
                  <span className="font-bold text-slate-200 text-xs">{selectedDetailClient.preferencias?.zonaInteres || 'No definida'}</span>
                </div>
              </div>

              {/* Acciones directas */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setSelectedDetailClient(null);
                    startEdit(selectedDetailClient);
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={13} />
                  Editar Ficha
                </button>
                <button
                  onClick={() => setSelectedDetailClient(null)}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
