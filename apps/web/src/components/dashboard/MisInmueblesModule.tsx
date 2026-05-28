import React, { useState } from 'react';
import {
  Search,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Lock,
  Phone,
  Mail,
  MessageSquare,
  Share2,
  Building,
  FileText,
  Plus,
  FileCheck,
  Percent,
  History,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import type { UserSession } from './Sidebar';

interface Inmueble {
  _id: string;
  referenciaInterna: string;
  referenciaProveedor?: string;
  estado: 'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido';
  tipoInmueble: string;
  precioVenta: number;
  precioValoracion?: number;
  zona: string;
  descripcion: string;
  caracteristicas: {
    dormitorios: number;
    banos: number;
    superficieTotal: number;
    superficieUtil?: number;
    superficieParcela?: number;
    planta?: string;
    anoConstruccion?: number;
    certificadoEnergetico?: string;
  };
  ubicacionGmapsUrl?: string;
  imagenes?: string[];
  caracteristicasEspeciales?: string[];
  alrededores?: string[];
  datosPrivados: {
    captadorAsignado: {
      _id: string;
      nombre: string;
      correo: string;
    } | string;
    honorariosPactados?: number;
    ultimaAccionEfectuada?: string;
  };
  propietarios: {
    nombre: string;
    correo: string;
    telefono: string;
    esPrincipal?: boolean;
    comunicaciones?: {
      fecha: string | Date;
      tipo: string;
      nota: string;
    }[];
  }[];
  clientesInteresados?: any[];
  contratosGenerados?: any[];
  createdAt?: string;
  updatedAt?: string;
}




interface MisInmueblesModuleProps {
  inmuebles: any[];
  crm: any[];
  user: UserSession;
  refrescarTodo: () => Promise<void>;
  onNewRecordClick?: () => void;
}

export const MisInmueblesModule: React.FC<MisInmueblesModuleProps> = ({
  inmuebles,
  crm,
  user,
  refrescarTodo,
  onNewRecordClick
}) => {
  // --- STATE LISTADO ---
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterPrecioMin, setFilterPrecioMin] = useState<number | ''>('');
  const [filterPrecioMax, setFilterPrecioMax] = useState<number | ''>('');
  const [filterAsesor, setFilterAsesor] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  // Selección Masiva
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkNewEstado, setBulkNewEstado] = useState<'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido'>('Disponible');

  // --- SELECCIÓN DE INMUEBLE DETALLE ---
  const [selectedInmueble, setSelectedInmueble] = useState<Inmueble | null>(null);
  const [activeTabDetail, setActiveTabDetail] = useState<'ficha' | 'privado' | 'publicar' | 'contratos'>('ficha');

  // --- CARROUSEL DE FOTOS DETALLE ---
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Comunicaciones form
  const [nuevaComNote, setNuevaComNote] = useState('');
  const [nuevaComTipo, setNuevaComTipo] = useState('Llamada');

  const token = localStorage.getItem('inmova_token') ?? '';

  // Filtrado de Inmuebles
  const filtered = inmuebles.filter((inm) => {
    const matchSearch =
      inm.referenciaInterna.toLowerCase().includes(search.toLowerCase()) ||
      inm.zona.toLowerCase().includes(search.toLowerCase()) ||
      inm.tipoInmueble.toLowerCase().includes(search.toLowerCase());

    const matchTipo = filterTipo ? inm.tipoInmueble.toLowerCase() === filterTipo.toLowerCase() : true;
    const matchEstado = filterEstado ? inm.estado === filterEstado : true;

    const matchPriceMin = filterPrecioMin !== '' ? inm.precioVenta >= filterPrecioMin : true;
    const matchPriceMax = filterPrecioMax !== '' ? inm.precioVenta <= filterPrecioMax : true;
    
    // Filtro por asesor
    let matchAsesor = true;
    if (filterAsesor) {
      const captador = inm.datosPrivados?.captadorAsignado;
      const captadorNombre = typeof captador === 'object' && captador ? captador.nombre : String(captador || '');
      matchAsesor = captadorNombre.toLowerCase() === user.nombre.toLowerCase();
    }

    return matchSearch && matchTipo && matchEstado && matchPriceMin && matchPriceMax && matchAsesor;
  });

  // Ordenar inmuebles filtrados
  const sortedFiltered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'precio-desc': return b.precioVenta - a.precioVenta;
      case 'precio-asc': return a.precioVenta - b.precioVenta;
      case 'superficie-desc': return (b.caracteristicas?.superficieTotal ?? 0) - (a.caracteristicas?.superficieTotal ?? 0);
      case 'ref-asc': return a.referenciaInterna.localeCompare(b.referenciaInterna);
      default: return 0;
    }
  });

  // Paginación de Inmuebles
  const totalPages = Math.ceil(sortedFiltered.length / itemsPerPage);
  const paginatedInmuebles = sortedFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Fallback a imágenes premium
  const fallbackImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  ];
  
  const currentImages = selectedInmueble?.imagenes && selectedInmueble.imagenes.length > 0
    ? selectedInmueble.imagenes
    : fallbackImages;

  // Selección individual / total
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedInmuebles.map((i) => i._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  // Acciones Masivas e Individuales
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente estas ${selectedIds.length} propiedades seleccionadas?`)) return;

    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      for (const id of selectedIds) {
        await fetch(`http://localhost:3000/api/dashboard/inmuebles/${id}`, {
          method: 'DELETE',
          headers: { 
            Authorization: `Bearer ${token}`,
            'x-workspace-mode': workspaceMode
          }
        });
      }
      setSelectedIds([]);
      await refrescarTodo();
      alert('Propiedades eliminadas correctamente.');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al intentar eliminar las propiedades.');
    }
  };

  const handleBulkEditSubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      for (const id of selectedIds) {
        await fetch(`http://localhost:3000/api/dashboard/inmuebles/${id}/estado`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}`,
            'x-workspace-mode': workspaceMode
          },
          body: JSON.stringify({ estado: bulkNewEstado })
        });
      }
      setSelectedIds([]);
      setShowBulkEditModal(false);
      await refrescarTodo();
      alert('Estados actualizados en lote correctamente.');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al actualizar los estados.');
    }
  };

  const handleExportCSV = () => {
    const listToExport = selectedIds.length > 0 ? filtered.filter((i) => selectedIds.includes(i._id)) : filtered;
    const headers = ['Referencia Interna', 'Tipo de Inmueble', 'Zona', 'Precio de Venta', 'Estado', 'Dormitorios', 'Baños', 'Superficie (m²)'];
    const rows = listToExport.map((i) => [
      i.referenciaInterna,
      i.tipoInmueble,
      i.zona,
      i.precioVenta,
      i.estado,
      i.caracteristicas?.dormitorios ?? 0,
      i.caracteristicas?.banos ?? 0,
      i.caracteristicas?.superficieTotal ?? 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MisInmuebles_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DETALLES DE INMUEBLE SELECCIONADO ---
  const currentPropietarios = selectedInmueble?.propietarios ?? [];
  const currentPrivado = selectedInmueble?.datosPrivados ?? null;
  const currentContratos = selectedInmueble?.contratosGenerados ?? [];

  // CRM Leads matches (Vínculos reales + matches automáticos)
  const crmMatches = selectedInmueble ? [
    ...(selectedInmueble.clientesInteresados || []),
    ...crm.filter((lead) => {
      const isAlreadyLinked = selectedInmueble.clientesInteresados?.some(c => (c._id || c) === lead._id);
      if (isAlreadyLinked) return false;
      const sameTipo = lead.preferencias?.tipoInmuebleBuscado?.toLowerCase() === selectedInmueble.tipoInmueble.toLowerCase();
      const rangePrice = lead.preferencias?.rangoPrecioMax ? lead.preferencias.rangoPrecioMax >= selectedInmueble.precioVenta * 0.9 : true;
      return sameTipo && rangePrice;
    })
  ] : [];

  const handleAgregarComunicacion = async (idx: number) => {
    if (!nuevaComNote.trim() || !selectedInmueble) return;
    
    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      const response = await fetch(`http://localhost:3000/api/dashboard/inmuebles/${selectedInmueble._id}/comunicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-workspace-mode': workspaceMode
        },
        body: JSON.stringify({
          propietarioIndex: idx,
          tipo: nuevaComTipo,
          nota: nuevaComNote.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar comunicación.');
      }

      const actualizado = await response.json();
      setSelectedInmueble(actualizado);
      setNuevaComNote('');
      await refrescarTodo();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Ocurrió un error al registrar la comunicación.');
    }
  };

  return (
    <div className="text-white w-full">

      {/* --- MODO DETALLE INMUEBLE --- */}
      {selectedInmueble ? (
        <div className="animate-fade-in">
          {/* Botón Volver y Cabecera de Ficha */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={() => { setSelectedInmueble(null); setActivePhotoIdx(0); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition-all"
            >
              <ChevronLeft size={16} />
              Volver al Catálogo
            </button>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-950 border border-slate-800 text-slate-400">
                Ref: {selectedInmueble.referenciaInterna}
              </span>
              <span className={`table-badge b-${selectedInmueble.estado.toLowerCase()}`}>
                {selectedInmueble.estado}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Building className="text-emerald-400" size={24} />
                {selectedInmueble.tipoInmueble} en {selectedInmueble.zona}
              </h2>
              <p className="text-emerald-400 font-extrabold text-xl mt-1">{formatPrice(selectedInmueble.precioVenta)}</p>
            </div>
          </div>

          {/* Menú de Pestañas del Detalle */}
          <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 mb-6">
            <button
              onClick={() => setActiveTabDetail('ficha')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTabDetail === 'ficha' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏢 Detalle de la propiedad
            </button>
            <button
              onClick={() => setActiveTabDetail('privado')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTabDetail === 'privado' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔒 Datos Privados
            </button>
            <button
              onClick={() => setActiveTabDetail('publicar')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTabDetail === 'publicar' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📢 Publicar y Compartir
            </button>
            <button
              onClick={() => setActiveTabDetail('contratos')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTabDetail === 'contratos' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✍️ Contratos ({currentContratos.length})
            </button>
          </div>

          {/* CONTENIDO DE PESTAÑAS */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            
            {/* 1. FICHA Y GALERÍA */}
            {activeTabDetail === 'ficha' && (
              <>
                <div className="flex flex-col lg:flex-row gap-8">
                {/* Carrusel de Fotos */}
                <div className="w-full lg:w-1/2 flex flex-col gap-3">
                  <div className="relative h-80 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={currentImages[activePhotoIdx]}
                      alt={`Inmueble ${activePhotoIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Botones carrusel */}
                    <button
                      onClick={() => setActivePhotoIdx((activePhotoIdx - 1 + currentImages.length) % currentImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-all border border-slate-800"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActivePhotoIdx((activePhotoIdx + 1) % currentImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-all border border-slate-800"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/75 text-xs text-slate-300 font-bold border border-slate-800">
                      Foto {activePhotoIdx + 1} de {currentImages.length}
                    </span>
                  </div>
                  {/* Vista de Miniaturas */}
                  <div className="flex gap-2 justify-center overflow-x-auto py-1">
                    {Array.from({ length: Math.min(7, currentImages.length) }).map((_, offset) => {
                      const idx = (activePhotoIdx - 3 + offset + currentImages.length) % currentImages.length;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === activePhotoIdx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={currentImages[idx]} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ficha e Indicadores */}
                <div className="w-full lg:w-1/2 flex flex-col gap-5">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white mb-2">Detalles Estructurados</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                        <span className="text-xs text-slate-400 block mb-1">Dormitorios</span>
                        <span className="text-lg font-extrabold text-white">{selectedInmueble.caracteristicas?.dormitorios ?? 0}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                        <span className="text-xs text-slate-400 block mb-1">Baños</span>
                        <span className="text-lg font-extrabold text-white">{selectedInmueble.caracteristicas?.banos ?? 0}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                        <span className="text-xs text-slate-400 block mb-1">Superficie</span>
                        <span className="text-lg font-extrabold text-white">{selectedInmueble.caracteristicas?.superficieTotal ?? 0} m²</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Características Especiales</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-300">
                        🍃 Energía: {selectedInmueble.caracteristicas?.certificadoEnergetico || 'A++'}
                      </span>
                      {selectedInmueble.caracteristicasEspeciales?.map((esp, eIdx) => (
                        <span key={eIdx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-300">
                          ⭐ {esp}
                        </span>
                      )) || (
                        <>
                          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-300">🌇 Vistas Despejadas</span>
                          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-300">🏊 Piscina Comunitaria</span>
                          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-semibold text-slate-300">🚗 Plaza de Garaje</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-1">Descripción</h4>
                    <p className="text-sm text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-850">
                      {selectedInmueble.descripcion || 'Esta propiedad destaca por su excelente luminosidad natural, amplias estancias y acabados de primera calidad.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divisor Visual */}
              <hr className="border-slate-800/85 my-8" />

              {/* Propietarios e Interesados (CRM Matches) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
                {/* Columna Izquierda: Gestión de Propietarios */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      🤝 Propietarios ({currentPropietarios.length})
                    </h3>
                  </div>
                  
                  {currentPropietarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-850">
                      <User size={32} className="opacity-40 mb-2" />
                      <span className="text-sm">No hay propietarios registrados para este inmueble.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {currentPropietarios.map((prop, idx) => (
                        <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                              <User className="text-emerald-400" size={16} />
                              {prop.nombre}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-xxs font-extrabold uppercase ${
                              prop.esPrincipal ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {prop.esPrincipal ? 'Principal' : 'Cotitular'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 text-sm text-slate-400">
                            <span className="flex items-center gap-2"><Mail size={13} /> {prop.correo}</span>
                            <span className="flex items-center gap-2"><Phone size={13} /> {prop.telefono}</span>
                          </div>

                          {/* Historial de Comunicaciones */}
                          <div>
                            <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <History size={12} /> Historial de Comunicaciones
                            </h5>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                              {!prop.comunicaciones || prop.comunicaciones.length === 0 ? (
                                <span className="text-xs text-slate-600 italic">No hay historial registrado.</span>
                              ) : (
                                prop.comunicaciones.map((com, cIdx) => (
                                  <div key={cIdx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                                    <div className="flex items-center justify-between text-slate-500 mb-1">
                                      <span>{com.fecha ? new Date(com.fecha).toLocaleString() : 'Reciente'}</span>
                                      <span className="font-semibold text-emerald-400 uppercase tracking-wider">{com.tipo}</span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed">{com.nota}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Formulario rápido comunicación */}
                          <div className="border-t border-slate-850 pt-3 flex gap-2">
                            <select
                              value={nuevaComTipo}
                              onChange={(e) => setNuevaComTipo(e.target.value)}
                              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-1.5 focus:outline-none"
                            >
                              <option value="Llamada">📞 Llamada</option>
                              <option value="Email">📧 Email</option>
                              <option value="WhatsApp">💬 WhatsApp</option>
                              <option value="Reunión">🤝 Reunión</option>
                              <option value="Otra">❓ Otra</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Añadir nota rápida..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 text-xs focus:outline-none placeholder-slate-600"
                              value={nuevaComNote}
                              onChange={(e) => setNuevaComNote(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleAgregarComunicacion(idx)}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Leads CRM Compatibles (Interesados) */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-855 pb-2">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      🎯 Interesados ({crmMatches.length})
                    </h3>
                    <span className="text-[10px] text-slate-500">Filtrado inteligente por Tipo y Presupuesto</span>
                  </div>

                  {crmMatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-850">
                      <Users size={32} className="opacity-40 mb-2" />
                      <span className="text-sm">No se encontraron interesados con estas preferencias de compra.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {crmMatches.map((lead) => (
                        <div key={lead._id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-200">{lead.nombre}</h4>
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Alta</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            <p>Preferencia: {lead.preferencias?.tipoInmuebleBuscado || 'N/A'} en {lead.preferencias?.zonaInteres || 'Cualquier zona'}</p>
                            <p>Presupuesto Máx: {formatPrice(lead.preferencias?.rangoPrecioMax ?? 0)}</p>
                          </div>
                          <div className="border-t border-slate-850 pt-2.5 flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/${lead.telefono.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <MessageSquare size={12} /> WhatsApp
                            </a>
                            <a
                              href={`mailto:${lead.correo}?subject=Inmueble de interés: ${selectedInmueble.tipoInmueble} en ${selectedInmueble.zona}`}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95 border border-slate-700"
                            >
                              <Mail size={12} /> Contactar
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

            {/* 3. DATOS PRIVADOS */}
            {activeTabDetail === 'privado' && (
              <div className="animate-fade-in">
                {user.rol === 'Administrador' || user.rol === 'Captador' ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <User size={20} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider block">Captador Responsable</span>
                          <span className="text-base font-bold text-white">
                            {typeof currentPrivado?.captadorAsignado === 'object' && currentPrivado?.captadorAsignado
                              ? (currentPrivado.captadorAsignado as any).nombre
                              : typeof currentPrivado?.captadorAsignado === 'string'
                                ? currentPrivado.captadorAsignado
                                : user.nombre}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <Percent size={20} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase tracking-wider block">Honorarios Pactados</span>
                          <span className="text-base font-bold text-white">{currentPrivado?.honorariosPactados ?? 5}% de Comisión</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <History size={14} className="text-slate-400" />
                        Marcas de Auditoría e Historial de Acciones
                      </h4>
                      <div className="db-table-container">
                        <table className="db-table">
                          <thead>
                            <tr>
                              <th>Acción Realizada</th>
                              <th>Usuario</th>
                              <th>Fecha y Hora</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPrivado && (
                              <tr>
                                <td className="font-semibold text-slate-200">{currentPrivado.ultimaAccionEfectuada || 'Registro inicial'}</td>
                                <td>
                                  {typeof currentPrivado.captadorAsignado === 'object' && currentPrivado.captadorAsignado
                                    ? currentPrivado.captadorAsignado.nombre
                                    : user.nombre}
                                </td>
                                <td className="text-slate-400">
                                  {selectedInmueble.updatedAt ? new Date(selectedInmueble.updatedAt).toLocaleString() : 'Reciente'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center gap-3 bg-red-950/10 border border-red-500/20 rounded-xl">
                    <Lock size={36} className="text-red-400" />
                    <div>
                      <h4 className="text-base font-bold text-red-300">Acceso Denegado</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Los datos privados e históricos de auditoría de este inmueble solo pueden ser consultados por roles de **Administrador** y **Captador**.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* 5. PUBLICAR Y COMPARTIR */}
            {activeTabDetail === 'publicar' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Herramientas de Compartición */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-4">
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <Share2 className="text-emerald-400" size={16} /> Generar y Compartir Enlaces
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Genera fichas técnicas de manera inmediata para enviar a redes sociales o contactos directos.</p>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        onClick={() => {
                          const url = `https://inmova.app/inmuebles/${selectedInmueble.referenciaInterna}`;
                          navigator.clipboard.writeText(url);
                          alert('¡Enlace de WhatsApp copiado al portapapeles!');
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        💬 Generar Ficha para WhatsApp
                      </button>
                      <button
                        onClick={() => alert('Simulación: Ficha técnica PDF generada y lista para descargar.')}
                        className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <FileText size={14} /> Ficha Técnica Descriptiva (PDF)
                      </button>
                    </div>
                  </div>

                  {/* Publicación Redes Sociales y Geolocalización */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-4">
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <ExternalLink className="text-blue-400" size={16} /> Geolocalización y Canales
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Conecta tu propiedad directamente con la API externa o genera vistas precisas geolocalizadas.</p>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        onClick={() => alert('Simulación Graph API: Inmueble publicado correctamente en tu Fanpage vinculada de Facebook.')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        🔗 Publicar en Facebook (Graph API Mock)
                      </button>
                      <a
                        href={selectedInmueble.ubicacionGmapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedInmueble.tipoInmueble} en ${selectedInmueble.zona}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
                      >
                        📍 Ubicación Exacta (Google Maps)
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 6. CONTRATOS ASOCIADOS */}
            {activeTabDetail === 'contratos' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck size={18} className="text-emerald-400" /> Historial de Documentos Contractuales
                  </h3>
                  <button
                    onClick={() => alert('Redirigiendo a Generador de Contratos con datos precargados...')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus size={14} /> Nuevo Contrato
                  </button>
                </div>

                <div className="db-table-container">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Código Contrato</th>
                        <th>Tipo</th>
                        <th>Fecha de Alta</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentContratos.map((c: any) => {
                        const folio = c.folioReferencia || c.id || 'CONT-TEMP';
                        const tipo = c.plantillaOrigen?.nombre || c.tipo || 'Contrato de Arras';
                        const fecha = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : (c.fecha || 'N/A');
                        const estado = c.estado || 'Firmado';
                        const pdfUrl = c.pdfStorageUrl || c.documentoUrl || '#';
                        return (
                          <tr key={c._id || c.id}>
                            <td className="font-mono font-bold text-slate-300">{folio}</td>
                            <td>{tipo}</td>
                            <td>{fecha}</td>
                            <td>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                estado === 'Firmado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : estado === 'Borrador' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {estado}
                              </span>
                            </td>
                            <td>
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                              >
                                <Download size={13} />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- MODO CATÁLOGO / REDISEÑADO CON DOS COLUMNAS --- */
        <div className="animate-fade-in flex flex-col gap-6">
          {/* ── Cabecera: Título + Botón Añadir ── */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              Mis inmuebles
              <span className="text-slate-400 font-light text-xl">{sortedFiltered.length}</span>
            </h2>
            <button
              onClick={() => onNewRecordClick?.()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <Plus size={15} />
              Añadir inmueble
            </button>
          </div>

          {/* Grid Principal de 2 Columnas */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* ──────── COLUMNA IZQUIERDA: SIDEBAR DE FILTROS ──────── */}
            <aside className="w-full lg:w-72 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col gap-6 flex-shrink-0">
              
              {/* FILTROS ACTIVOS */}
              <div className="flex flex-col gap-2">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block">FILTROS</span>
                {(!filterTipo && !filterEstado && filterPrecioMin === '' && filterPrecioMax === '' && !filterAsesor) ? (
                  <span className="text-xs text-slate-650 italic">No hay filtros activos</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {filterTipo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xxs text-slate-300">
                        {filterTipo}
                        <button onClick={() => setFilterTipo('')} className="hover:text-red-400 text-slate-500">×</button>
                      </span>
                    )}
                    {filterEstado && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xxs text-slate-300">
                        {filterEstado}
                        <button onClick={() => setFilterEstado('')} className="hover:text-red-400 text-slate-500">×</button>
                      </span>
                    )}
                    {(filterPrecioMin !== '' || filterPrecioMax !== '') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xxs text-slate-300">
                        $ {filterPrecioMin || '0'} - {filterPrecioMax || '∞'}
                        <button onClick={() => { setFilterPrecioMin(''); setFilterPrecioMax(''); }} className="hover:text-red-400 text-slate-500">×</button>
                      </span>
                    )}
                    {filterAsesor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xxs text-slate-300">
                        Mío
                        <button onClick={() => setFilterAsesor('')} className="hover:text-red-400 text-slate-500">×</button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setFilterTipo('');
                        setFilterEstado('');
                        setFilterPrecioMin('');
                        setFilterPrecioMax('');
                        setFilterAsesor('');
                        setCurrentPage(1);
                      }}
                      className="text-xxs text-emerald-400 hover:text-emerald-300 font-bold block mt-1 hover:underline text-left"
                    >
                      Limpiar todos
                    </button>
                  </div>
                )}
              </div>

              {/* AÑADIR MÁS FILTROS */}
              <div className="flex flex-col gap-4 border-t border-slate-850 pt-4">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block">AÑADIR MÁS FILTROS</span>
                
                {/* Tipo de Inmueble */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400">TIPO DE PROPIEDAD</label>
                  <select
                    value={filterTipo}
                    onChange={(e) => { setFilterTipo(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 cursor-pointer w-full transition-all"
                  >
                    <option value="">Cualquiera</option>
                    <option value="Casa">Casa</option>
                    <option value="Piso">Piso</option>
                    <option value="Local">Local</option>
                    <option value="Solar">Solar</option>
                    <option value="Inmueble Singular">Inmueble Singular</option>
                  </select>
                </div>

                {/* Estado Comercial */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400">ESTADO COMERCIAL</label>
                  <select
                    value={filterEstado}
                    onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 cursor-pointer w-full transition-all"
                  >
                    <option value="">Cualquiera</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Prospecto">Prospecto</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>

                {/* Precios */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400">RANGO DE PRECIO ($)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterPrecioMin}
                      onChange={(e) => { setFilterPrecioMin(e.target.value === '' ? '' : parseInt(e.target.value)); setCurrentPage(1); }}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 placeholder-slate-700"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterPrecioMax}
                      onChange={(e) => { setFilterPrecioMax(e.target.value === '' ? '' : parseInt(e.target.value)); setCurrentPage(1); }}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 placeholder-slate-700"
                    />
                  </div>
                </div>

                {/* Filtro Asesor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold text-slate-400">CAPTURAS DEL ASESOR</label>
                  <select
                    value={filterAsesor}
                    onChange={(e) => { setFilterAsesor(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 cursor-pointer w-full transition-all"
                  >
                    <option value="">Todos los asesores</option>
                    <option value={user.nombre}>Asignados a mí ({user.nombre})</option>
                  </select>
                </div>
              </div>

              {/* ORDENAR */}
              <div className="flex flex-col gap-2 border-t border-slate-850 pt-4">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block">ORDENAR</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 cursor-pointer w-full transition-all"
                >
                  <option value="">Por defecto</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="superficie-desc">Superficie: Mayor a Menor</option>
                  <option value="ref-asc">Referencia Interna</option>
                </select>
              </div>

              {/* ELEMENTOS POR PÁGINA */}
              <div className="flex flex-col gap-2 border-t border-slate-850 pt-4">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block">ELEMENTOS POR PÁGINA</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 cursor-pointer w-full transition-all"
                >
                  <option value="5">Por defecto (5)</option>
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </select>
              </div>

              {/* GUARDAR BÚSQUEDA */}
              <button
                type="button"
                onClick={() => alert('Búsqueda y filtros guardados con éxito para futuras consultas.')}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Download size={14} className="text-slate-500" />
                Guardar búsqueda
              </button>
            </aside>

            {/* ──────── COLUMNA DERECHA: BUSCADOR, PAGINACIÓN Y TARJETAS ──────── */}
            <div className="flex-1 w-full flex flex-col gap-6">
              
              {/* Barra de Búsqueda Integrada con Botón Buscar */}
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por referencia, tipo de inmueble o zona..."
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-650 text-white font-bold text-sm rounded-xl transition-all active:scale-95"
                >
                  Buscar
                </button>
              </div>

              {/* Barra de Control Superior: Checkbox Todo + Paginación Rápida */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/20 p-4 border border-slate-850 rounded-2xl">
                <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer font-medium hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedInmuebles.length && paginatedInmuebles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-850 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  Seleccionar página actual
                </label>

                {/* Paginación Superior del Mockup */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 self-center sm:self-auto">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="px-1 text-slate-600 text-xs">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7.5 h-7.5 rounded-lg font-bold text-xxs transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                              : 'bg-slate-950 border border-slate-800 text-slate-450 hover:text-white'
                          }`}
                          style={{ width: '30px', height: '30px' }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Acciones Masivas Flotantes en Lote */}
              {selectedIds.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                  <span className="text-xs font-bold text-emerald-400">
                    ⭐ {selectedIds.length} propiedades seleccionadas para operaciones en lote:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBulkEditModal(true)}
                      className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Edit2 size={12} /> Editar Estado
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash2 size={12} /> Eliminar Lote
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Download size={12} /> Exportar Lote
                    </button>
                  </div>
                </div>
              )}

              {/* Listado de Inmuebles en Tarjetas Horizontales (Cards) */}
              <div className="flex flex-col gap-4">
                {paginatedInmuebles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-4 text-center bg-slate-900/10 border border-slate-850 rounded-2xl">
                    <Building size={48} className="text-slate-750 opacity-40 animate-pulse" />
                    <div>
                      <h5 className="text-slate-300 font-bold text-base">No se encontraron inmuebles</h5>
                      <p className="text-xs text-slate-500 mt-1">Prueba a ajustar tu búsqueda o los filtros aplicados en el panel izquierdo.</p>
                    </div>
                  </div>
                ) : (
                  paginatedInmuebles.map((inm) => {
                    const isSel = selectedIds.includes(inm._id);
                    const imagesList = inm.imagenes && inm.imagenes.length > 0 ? inm.imagenes : fallbackImages;

                    const superficie = inm.caracteristicas?.superficieTotal || 1;
                    const rateM2 = inm.precioVenta / superficie;
                    const formattedRateM2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(rateM2) + ' $/m²';

                    const captador = inm.datosPrivados?.captadorAsignado;
                    const captadorNombre = typeof captador === 'object' && captador ? captador.nombre : String(captador || user.nombre);
                    const captadorInitials = captadorNombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <div
                        key={inm._id}
                        className={`bg-slate-900/40 border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start relative transition-all hover:border-slate-700/80 shadow-lg shadow-black/25 ${
                          isSel ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="self-center md:self-start pt-1">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => handleSelectItem(inm._id, e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                          />
                        </div>

                        {/* Foto de portada estática (primera imagen) */}
                        <div className="relative w-full md:w-56 h-36 rounded-xl overflow-hidden border border-slate-850 flex-shrink-0 bg-slate-950 group">
                          <img
                            src={imagesList[0]}
                            alt="Portada inmueble"
                            className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          <span className={`absolute bottom-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-md b-${inm.estado.toLowerCase()}`}>
                            {inm.estado}
                          </span>
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
                          
                          <button
                            type="button"
                            onClick={() => { setSelectedInmueble(inm); setActiveTabDetail('ficha'); }}
                            className="text-base font-extrabold text-blue-400 hover:text-blue-300 text-left transition-colors flex items-center gap-1.5 hover:underline focus:outline-none truncate w-full"
                          >
                            {inm.tipoInmueble} en {inm.zona}
                            <ExternalLink size={13} className="opacity-70 flex-shrink-0" />
                          </button>

                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-lg font-black text-white">{formatPrice(inm.precioVenta)}</span>
                            <span className="text-xxs text-slate-450 font-medium">({formattedRateM2})</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-slate-400 text-xs font-semibold mt-0.5">
                            <span>{inm.caracteristicas?.dormitorios ?? 0} hab.</span>
                            <span className="text-slate-700">•</span>
                            <span>{inm.caracteristicas?.banos ?? 0} bañ.</span>
                            <span className="text-slate-700">•</span>
                            <span>{inm.caracteristicas?.superficieTotal ?? 0} m²</span>
                            {inm.caracteristicas?.planta && (
                              <>
                                <span className="text-slate-700">•</span>
                                <span>{inm.caracteristicas.planta}ª planta</span>
                              </>
                            )}
                          </div>

                          <span className="text-xxs font-mono font-bold text-slate-450 uppercase tracking-wider">
                            Ref: {inm.referenciaInterna}
                          </span>

                          <p className="text-xs text-slate-500 leading-relaxed truncate-2-lines mt-1 max-w-2xl">
                            {inm.descripcion || 'Esta elegante propiedad está ubicada estratégicamente y cuenta con excelentes acabados y distribución.'}
                          </p>

                          <div className="flex items-center gap-3 mt-2 border-t border-slate-850 pt-2.5">
                            <button
                              type="button"
                              onClick={() => { setSelectedInmueble(inm); setActiveTabDetail('ficha'); }}
                              className="p-1 rounded text-slate-500 hover:text-white transition-all"
                              title="Más Opciones"
                            >
                              <SlidersHorizontal size={13} />
                            </button>
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-extrabold text-slate-450 select-none cursor-default" title="Filtro XML Portales">
                              XML
                            </span>
                          </div>

                        </div>

                        {/* Extremo Derecho */}
                        <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 w-full md:w-auto h-full self-stretch pt-0.5 border-t md:border-t-0 md:border-l border-slate-850 pl-0 md:pl-4 mt-2 md:mt-0 pt-2 md:pt-0">
                          
                          <div className="flex items-center gap-2 md:flex-col" title={`Responsable: ${captadorNombre}`}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400/25 flex items-center justify-center font-black text-xxs text-white shadow-md shadow-emerald-950/20">
                              {captadorInitials}
                            </div>
                            <span className="text-[10px] text-slate-450 font-bold block md:hidden max-w-[100px] truncate">{captadorNombre}</span>
                          </div>

                          <button
                            onClick={() => { setSelectedInmueble(inm); setActiveTabDetail('ficha'); }}
                            className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-450 hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center active:scale-95"
                            title="Editar Ficha"
                          >
                            <Edit2 size={13} />
                          </button>
                          
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Barra de Control Inferior */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 bg-slate-900/20 p-4 border border-slate-850 rounded-2xl">
                  <span className="text-xs text-slate-500">Página {currentPage} de {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                          currentPage === i + 1
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDICIÓN MASIVA --- */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-3">
              <Edit2 className="text-emerald-400" size={18} />
              Editar Estado en Lote
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Estás modificando el estado de **{selectedIds.length}** propiedades seleccionadas de forma simultánea.
            </p>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nuevo Estado</label>
              <select
                value={bulkNewEstado}
                onChange={(e) => setBulkNewEstado(e.target.value as 'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido')}
                className="bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 w-full"
              >
                <option value="Disponible">Disponible</option>
                <option value="Reservado">Reservado</option>
                <option value="Prospecto">Prospecto</option>
                <option value="Vendido">Vendido</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkEditSubmit}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl transition-all active:scale-95"
              >
                Guardar Lote
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
