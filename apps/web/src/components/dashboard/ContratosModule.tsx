import React, { useState, useEffect } from 'react';
import { 
  FileText, FileCheck, Plus, Download, Check, ChevronLeft, ChevronRight, 
  Search, Building, User, Calendar, DollarSign, Settings, BookOpen, 
  Trash2, Edit3, Printer, Eye, Info, Sparkles, Clock, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContratosModuleProps {
  usuario: any;
  token: string;
  refrescarTodo: () => Promise<void>;
}

export default function ContratosModule({ usuario, token, refrescarTodo }: ContratosModuleProps) {
  // Pestañas principales
  const [activeTab, setActiveTab] = useState<'historial' | 'plantillas' | 'guia'>('historial');
  
  // Asistente (Wizard) para Generar Contrato
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Listas de datos
  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [inmuebles, setInmuebles] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del CRUD de Plantillas
  const [showPlantillaModal, setShowPlantillaModal] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<any | null>(null);
  const [plantillaForm, setPlantillaForm] = useState({
    titulo: '',
    tipoContrato: 'Alquiler',
    contenidoHTML: ''
  });

  // Estados de Selección del Wizard
  const [selectedPlantilla, setSelectedPlantilla] = useState<any | null>(null);
  const [selectedInmueble, setSelectedInmueble] = useState<any | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  
  // Buscadores del Wizard
  const [inmuebleSearch, setInmuebleSearch] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [showInmuebleDropdown, setShowInmuebleDropdown] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  // Variables dinámicas manuales extraídas
  const [manualPlaceholders, setManualPlaceholders] = useState<string[]>([]);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [folioReferencia, setFolioReferencia] = useState('');

  // Carga inicial
  useEffect(() => {
    cargarDatos();
  }, [token]);

  // Generar folio sugerido cuando se entra al wizard
  useEffect(() => {
    if (showWizard) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const code = selectedPlantilla ? selectedPlantilla.tipoContrato.substring(0, 3).toUpperCase() : 'CTR';
      setFolioReferencia(`CON-${year}-${code}-${rand}`);
    }
  }, [showWizard, selectedPlantilla]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'x-workspace-mode': workspaceMode
      };

      // 1. Fetch plantillas
      const resPl = await fetch('http://localhost:3000/api/dashboard/plantillas', { headers });
      if (resPl.ok) {
        const dataPl = await resPl.json();
        setPlantillas(dataPl);
      }

      // 2. Fetch contratos
      const resCo = await fetch('http://localhost:3000/api/dashboard/contratos', { headers });
      if (resCo.ok) {
        const dataCo = await resCo.json();
        setContratos(dataCo);
      }

      // 3. Fetch inmuebles
      const resIn = await fetch('http://localhost:3000/api/dashboard/inmuebles', { headers });
      if (resIn.ok) {
        const dataIn = await resIn.json();
        setInmuebles(dataIn);
      }

      // 4. Fetch clientes
      const resCl = await fetch('http://localhost:3000/api/dashboard/crm', { headers });
      if (resCl.ok) {
        const dataCl = await resCl.json();
        setClientes(dataCl);
      }
    } catch (err) {
      console.error("Error cargando datos del modulo de contratos:", err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD de Plantillas
  const handleOpenPlantillaModal = (plantilla?: any) => {
    if (plantilla) {
      setEditingPlantilla(plantilla);
      setPlantillaForm({
        titulo: plantilla.titulo,
        tipoContrato: plantilla.tipoContrato,
        contenidoHTML: plantilla.contenidoHTML
      });
    } else {
      setEditingPlantilla(null);
      setPlantillaForm({
        titulo: '',
        tipoContrato: 'Alquiler',
        contenidoHTML: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h1 style="text-align: center; color: #0f172a; border-bottom: 3px solid #10b981; padding-bottom: 12px;">NUEVO CONTRATO PERSONALIZADO</h1>
  <p>En la ciudad de {inmueble_ciudad}, a la fecha de {fecha_firma}.</p>
  <p>Reunidos por una parte el arrendador/propietario y por otra el cliente Don/Doña <b>{nombre_cliente}</b>...</p>
  <p>El inmueble objeto de la transacción es de tipo {inmueble_tipo} ubicado en {inmueble_direccion} con referencia {inmueble_referencia}.</p>
  <p>Monto de transacción acordado: $ {precio_transaccion} USD (Manual).</p>
</div>`
      });
    }
    setShowPlantillaModal(true);
  };

  const handleSavePlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantillaForm.titulo.trim() || !plantillaForm.contenidoHTML.trim()) {
      alert("Por favor, completa todos los campos de la plantilla.");
      return;
    }

    // Extraer variables permitidas automáticamente buscando patrones {variable}
    const detectedVars = Array.from(new Set(plantillaForm.contenidoHTML.match(/\{[^}]+\}/g) || []));

    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      const method = editingPlantilla ? 'PUT' : 'POST';
      const url = editingPlantilla 
        ? `http://localhost:3000/api/dashboard/plantillas/${editingPlantilla._id}`
        : 'http://localhost:3000/api/dashboard/plantillas';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-workspace-mode': workspaceMode
        },
        body: JSON.stringify({
          ...plantillaForm,
          variablesPermitidas: detectedVars
        })
      });

      if (!response.ok) {
        throw new Error("Error al guardar la plantilla.");
      }

      await cargarDatos();
      setShowPlantillaModal(false);
      alert(editingPlantilla ? "Plantilla actualizada con éxito." : "Plantilla base creada con éxito.");
    } catch (err: any) {
      alert(err.message || "Ocurrió un error al guardar.");
    }
  };

  const handleDeletePlantilla = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta plantilla base permanentemente?")) return;
    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      const response = await fetch(`http://localhost:3000/api/dashboard/plantillas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-workspace-mode': workspaceMode
        }
      });
      if (response.ok) {
        await cargarDatos();
        alert("Plantilla eliminada correctamente.");
      } else {
        alert("Error al eliminar la plantilla.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lógica del Wizard
  const handleSelectPlantillaForContract = (plantilla: any) => {
    setSelectedPlantilla(plantilla);
    setWizardStep(2);
  };

  // Al avanzar al paso 3, extraer las variables manuales
  const handleStep2Next = () => {
    if (!selectedInmueble || !selectedCliente) {
      alert("Por favor, vincula un inmueble y un cliente para continuar.");
      return;
    }

    // Buscar todas las variables en la plantilla
    const allVars = Array.from(new Set(selectedPlantilla.contenidoHTML.match(/\{[^}]+\}/g) || [])) as string[];
    
    // Lista de variables que el sistema autocompleta desde la base de datos
    const autoFilledList = [
      '{nombre_cliente}', '{correo_cliente}', '{telefono_cliente}',
      '{inmueble_direccion}', '{inmueble_tipo}', '{inmueble_superficie}',
      '{inmueble_referencia}', '{inmueble_ciudad}', '{inmueble_departamento}',
      '{inmueble_precio}',
      '{nombre_propietario}', '{correo_propietario}', '{telefono_propietario}',
      '{propietario_nombre}', '{propietario_correo}', '{propietario_telefono}'
    ];

    // Variables que no dependen directamente de las entidades y deben ser manuales
    const manualVars = allVars.filter(v => !autoFilledList.includes(v));
    setManualPlaceholders(manualVars);

    // Inicializar valores manuales
    const initialManuals: Record<string, string> = {};
    manualVars.forEach(v => {
      // Sugerir fechas
      if (v.toLowerCase().includes('fecha')) {
        initialManuals[v] = new Date().toISOString().split('T')[0];
      } else {
        initialManuals[v] = '';
      }
    });
    setManualValues(initialManuals);

    setWizardStep(3);
  };

  const handleManualValueChange = (key: string, value: string) => {
    setManualValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reemplazo final de la plantilla con valores reales
  const getMergedHTML = () => {
    if (!selectedPlantilla || !selectedInmueble || !selectedCliente) return '';
    let html = selectedPlantilla.contenidoHTML;

    // 1. Reemplazar auto-completados
    html = html.replace(/\{nombre_cliente\}/g, selectedCliente.nombre || '');
    html = html.replace(/\{correo_cliente\}/g, selectedCliente.correo || 'N/A');
    html = html.replace(/\{telefono_cliente\}/g, selectedCliente.telefono || 'N/A');
    
    html = html.replace(/\{inmueble_direccion\}/g, selectedInmueble.direccion || 'Dirección no especificada');
    html = html.replace(/\{inmueble_tipo\}/g, selectedInmueble.tipoInmueble || '');
    html = html.replace(/\{inmueble_superficie\}/g, String(selectedInmueble.caracteristicas?.superficieTotal || 0));
    html = html.replace(/\{inmueble_referencia\}/g, selectedInmueble.referenciaInterna || '');
    html = html.replace(/\{inmueble_ciudad\}/g, selectedInmueble.ciudad || '');
    html = html.replace(/\{inmueble_departamento\}/g, selectedInmueble.departamento || '');
    html = html.replace(/\{inmueble_precio\}/g, String(selectedInmueble.precioVenta || 0));

    // Reemplazar propietario(s)
    const primerProp = selectedInmueble.propietarios?.[0] || {};
    html = html.replace(/\{nombre_propietario\}/g, primerProp.nombre || 'Sin propietario');
    html = html.replace(/\{propietario_nombre\}/g, primerProp.nombre || 'Sin propietario');
    html = html.replace(/\{correo_propietario\}/g, primerProp.correo || 'N/A');
    html = html.replace(/\{propietario_correo\}/g, primerProp.correo || 'N/A');
    html = html.replace(/\{telefono_propietario\}/g, primerProp.telefono || 'N/A');
    html = html.replace(/\{propietario_telefono\}/g, primerProp.telefono || 'N/A');

    // 2. Reemplazar valores manuales del Paso 3
    Object.keys(manualValues).forEach(placeholder => {
      const userValue = manualValues[placeholder] || `[Falta: ${placeholder}]`;
      // Escapar caracteres especiales de regex
      const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedPlaceholder, 'g');
      html = html.replace(regex, userValue);
    });

    return html;
  };

  // Generar Contrato (Persistir en MongoDB y subir a Supabase)
  const handleGenerateAndSaveContract = async () => {
    if (!folioReferencia.trim()) {
      alert("Por favor, introduce un código de folio de referencia.");
      return;
    }

    const mergedHTML = getMergedHTML();
    
    // URL en Supabase Storage (Privado por defecto)
    let pdfUrl = `https://tcoevrfhrkyykldqqkym.supabase.co/storage/v1/object/private/contratos/personal/${folioReferencia}.html`;

    try {
      const blob = new Blob([mergedHTML], { type: 'text/html' });
      const filePath = `personal/${folioReferencia}_${Date.now()}.html`;

      // Intentamos subir al bucket privado 'contratos'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(filePath, blob, { contentType: 'text/html', upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('contratos')
          .getPublicUrl(filePath);
        if (urlData) {
          pdfUrl = urlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Supabase contract upload failed, falling back to mock storage url:", err);
    }

    try {
      const workspaceMode = localStorage.getItem('inmova_workspace_mode') || 'grupo';
      
      const response = await fetch('http://localhost:3000/api/dashboard/contratos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-workspace-mode': workspaceMode
        },
        body: JSON.stringify({
          folioReferencia: folioReferencia.trim(),
          plantillaOrigen: selectedPlantilla._id,
          inmueble: selectedInmueble._id,
          cliente: selectedCliente._id,
          valoresDinamicosAplicados: manualValues,
          pdfStorageUrl: pdfUrl
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Ocurrió un error al guardar el contrato en base de datos.");
      }

      // Impresión nativa y limpia del contrato A4
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${folioReferencia} - INMOVA</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  background-color: #ffffff;
                  color: #1e293b;
                  font-family: 'Helvetica Neue', Arial, sans-serif;
                }
                @page {
                  size: A4;
                  margin: 20mm 15mm 20mm 15mm;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                }
              </style>
            </head>
            <body>
              ${mergedHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      await cargarDatos();
      await refrescarTodo();
      
      // Cerrar wizard y limpiar
      setShowWizard(false);
      setWizardStep(1);
      setSelectedPlantilla(null);
      setSelectedInmueble(null);
      setSelectedCliente(null);
      setManualValues({});
      setInmuebleSearch('');
      setClienteSearch('');
      
      alert(`¡Contrato ${folioReferencia} registrado e impreso con éxito!`);
    } catch (err: any) {
      alert(err.message || "Error al persistir el acuerdo.");
    }
  };

  // Buscar inmuebles filtrados
  const filteredInmuebles = inmuebles.filter(i => {
    const search = inmuebleSearch.toLowerCase();
    return (
      i.referenciaInterna?.toLowerCase().includes(search) ||
      i.tipoInmueble?.toLowerCase().includes(search) ||
      i.zona?.toLowerCase().includes(search)
    );
  });

  // Buscar clientes filtrados
  const filteredClientes = clientes.filter(c => {
    const search = clienteSearch.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(search) ||
      c.correo?.toLowerCase().includes(search) ||
      c.telefono?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="w-full text-white">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <FileText className="text-emerald-400" />
            Contratos y Plantillas
          </h2>
          <p className="text-xs text-slate-400 mt-1">Genera documentos jurídicos autocompletados basados en inmuebles y clientes.</p>
        </div>
        {!showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus size={15} /> Generar Nuevo Contrato
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Sincronizando expedientes y plantillas...</span>
        </div>
      ) : showWizard ? (
        /* WIZARD PASO A PASO */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8 animate-fade-in">
          
          {/* BARRA DE PASOS */}
          <div className="flex items-center justify-between max-w-xl mx-auto mb-8 relative">
            <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-1 bg-slate-800/80 rounded-full -translate-y-1/2 z-0 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
              ></div>
            </div>

            {[
              { num: 1, label: 'Base' },
              { num: 2, label: 'Vinculación' },
              { num: 3, label: 'Variables' },
              { num: 4, label: 'Previsualización' }
            ].map(step => (
              <div key={step.num} className="w-1/4 flex flex-col items-center gap-1.5 z-10 relative group">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border relative z-10 cursor-pointer ${
                    wizardStep === step.num 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-110 ring-4 ring-emerald-500/30'
                      : wizardStep > step.num
                        ? 'text-emerald-400 border-emerald-500/40 hover:border-emerald-400/80 font-black shadow-[0_0_10px_rgba(16,185,129,0.15)] group-hover:scale-105'
                        : 'text-slate-500 border-slate-800 hover:border-slate-700 group-hover:text-slate-400'
                  }`}
                  style={wizardStep !== step.num ? { backgroundColor: '#0b0f19' } : undefined}
                >
                  {wizardStep === step.num && (
                    <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping pointer-events-none"></span>
                  )}
                  {wizardStep > step.num ? (
                    <Check size={14} className="stroke-[3] transition-transform duration-350 group-hover:rotate-[360deg]" />
                  ) : (
                    step.num
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-wide transition-all duration-355 ${wizardStep === step.num ? 'text-emerald-400 shadow-emerald-400/10' : 'text-slate-500 group-hover:text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* PASO 1: SELECCIÓN DE BASE */}
          {wizardStep === 1 && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="border-b border-slate-800/80 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" /> Paso 1: Elige una Plantilla Base
                </h3>
                <button 
                  onClick={() => { setShowWizard(false); setWizardStep(1); }} 
                  className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X size={14} /> Cancelar
                </button>
              </div>

              {plantillas.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <p className="text-sm text-slate-400">No hay plantillas base disponibles en el sistema.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plantillas.map(pl => (
                    <div 
                      key={pl._id}
                      onClick={() => handleSelectPlantillaForContract(pl)}
                      className="group border border-slate-800 hover:border-emerald-500/40 bg-slate-950/40 hover:bg-slate-950/80 p-5 rounded-xl transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-bl-lg tracking-wider border-l border-b border-emerald-500/15">
                        {pl.tipoContrato}
                      </div>
                      <h4 className="font-bold text-sm text-slate-100 pr-12 group-hover:text-emerald-400 transition-colors">{pl.titulo}</h4>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-3">Muestra del cuerpo redactado en la plantilla.</p>
                      
                      <div className="flex flex-wrap gap-1 mt-4">
                        {pl.variablesPermitidas?.slice(0, 3).map((v: string) => (
                          <span key={v} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-300">
                            {v}
                          </span>
                        ))}
                        {pl.variablesPermitidas?.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-bold self-center">+{pl.variablesPermitidas.length - 3} más</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: VINCULACIÓN DE ENTIDADES */}
          {wizardStep === 2 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                  <Settings size={14} className="text-emerald-400" /> Paso 2: Vinculación del Inmueble y del Cliente
                </h3>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-emerald-400">
                  Plantilla: {selectedPlantilla?.titulo}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2.1 BUSCADOR INMUEBLES */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Building size={14} className="text-emerald-400" /> Vincular Inmueble Comercial
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={15} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por referencia, tipo, zona..."
                      value={inmuebleSearch}
                      onChange={(e) => {
                        setInmuebleSearch(e.target.value);
                        setShowInmuebleDropdown(true);
                      }}
                      onFocus={() => setShowInmuebleDropdown(true)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    />

                    {showInmuebleDropdown && (
                      <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl shadow-xl">
                        {filteredInmuebles.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">No se encontraron inmuebles</div>
                        ) : (
                          filteredInmuebles.map(i => (
                            <button
                              key={i._id}
                              type="button"
                              onClick={() => {
                                setSelectedInmueble(i);
                                setInmuebleSearch(i.referenciaInterna);
                                setShowInmuebleDropdown(false);
                                
                                // Vincular por defecto el propietario de dicho inmueble en la cartera de clientes
                                const primerPropietario = i.propietarios?.[0];
                                if (primerPropietario) {
                                  const matchingCliente = clientes.find(c => 
                                    (c.correo && primerPropietario.correo && c.correo.trim().toLowerCase() === primerPropietario.correo.trim().toLowerCase()) ||
                                    (c.nombre && primerPropietario.nombre && c.nombre.trim().toLowerCase() === primerPropietario.nombre.trim().toLowerCase())
                                  );
                                  if (matchingCliente) {
                                    setSelectedCliente(matchingCliente);
                                    setClienteSearch(matchingCliente.nombre);
                                  }
                                }
                              }}
                              className="w-full text-left p-3 hover:bg-slate-900 border-b border-slate-900 text-xs flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-slate-200">{i.referenciaInterna}</span>
                                <span className="text-slate-400 ml-2">{i.tipoInmueble} en {i.zona}</span>
                              </div>
                              <span className="font-extrabold text-emerald-400">${i.precioVenta.toLocaleString()}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ficha rápida de Inmueble seleccionado */}
                  {selectedInmueble && (
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 mt-2 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-emerald-400">{selectedInmueble.referenciaInterna}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-400">
                          {selectedInmueble.estado}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-200 text-xs">{selectedInmueble.tipoInmueble} en {selectedInmueble.direccion}</h4>
                      
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                        <div>
                          <span>Ciudad</span>
                          <p className="font-bold text-slate-200">{selectedInmueble.ciudad || 'N/A'}</p>
                        </div>
                        <div>
                          <span>Superficie</span>
                          <p className="font-bold text-slate-200">{selectedInmueble.caracteristicas?.superficieTotal || 0} m²</p>
                        </div>
                        <div>
                          <span>Precio</span>
                          <p className="font-bold text-emerald-400">${selectedInmueble.precioVenta.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Información de Propietario(s) */}
                      <div className="mt-2 pt-2 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-400 block mb-1">Propietario(s):</span>
                        <div className="flex flex-col gap-1">
                          {selectedInmueble.propietarios && selectedInmueble.propietarios.length > 0 ? (
                            selectedInmueble.propietarios.map((prop: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
                                <span className="font-bold text-slate-200">{prop.nombre}</span>
                                <span className="text-slate-400 text-[9px] font-mono">
                                  {prop.correo || 'Sin correo'} • {prop.telefono || 'Sin tel.'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="font-bold text-slate-500 italic">No hay propietarios registrados</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2.2 BUSCADOR CLIENTES */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <User size={14} className="text-emerald-400" /> Vincular Cliente
                  </label>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={15} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar cliente por nombre, correo, DUI..."
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        setShowClienteDropdown(true);
                      }}
                      onFocus={() => setShowClienteDropdown(true)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    />

                    {showClienteDropdown && (
                      <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl shadow-xl">
                        {filteredClientes.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">No se encontraron clientes</div>
                        ) : (
                          filteredClientes.map(c => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => {
                                setSelectedCliente(c);
                                setClienteSearch(c.nombre);
                                setShowClienteDropdown(false);
                              }}
                              className="w-full text-left p-3 hover:bg-slate-900 border-b border-slate-900 text-xs flex flex-col cursor-pointer"
                            >
                              <span className="font-bold text-slate-200">{c.nombre}</span>
                              <span className="text-slate-500 text-[10px] mt-0.5">{c.correo || 'Sin correo'} • {c.telefono || 'Sin teléfono'}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ficha rápida de Cliente seleccionado */}
                  {selectedCliente && (
                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 mt-2 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 text-xs">{selectedCliente.nombre}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedCliente.estadoLead || 'Cliente'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                        <div>
                          <span>Correo Electrónico</span>
                          <p className="font-bold text-slate-200 break-all">{selectedCliente.correo || 'N/A'}</p>
                        </div>
                        <div>
                          <span>Número Telefónico</span>
                          <p className="font-bold text-slate-200">{selectedCliente.telefono || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botonera de Navegación */}
              <div className="flex justify-between mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setWizardStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 hover:bg-slate-850 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Volver a Plantillas
                </button>
                <button
                  onClick={handleStep2Next}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Siguiente Paso <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: VARIABLES DINÁMICAS MANUALES */}
          {wizardStep === 3 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" /> Paso 3: Rellenar Variables Dinámicas
                </h3>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-emerald-400">
                  Folio: {folioReferencia}
                </span>
              </div>

              <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex items-start gap-2.5">
                  <Info size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hemos analizado la plantilla base seleccionada. Los datos correspondientes a Inmuebles y Clientes se han inyectado automáticamente. Por favor digita las variables específicas del acuerdo comercial en los campos autogenerados a continuación:
                  </p>
                </div>

                {/* Entrada del Folio de Referencia sugerido */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Folio Identificador de Contrato</label>
                  <input
                    type="text"
                    value={folioReferencia}
                    onChange={(e) => setFolioReferencia(e.target.value.toUpperCase())}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {manualPlaceholders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-400">Esta plantilla no tiene variables manuales adicionales para completar. Todos los datos necesarios se auto-completarán de las entidades vinculadas.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 mt-2">
                    {manualPlaceholders.map(placeholder => {
                      const cleanLabel = placeholder.replace(/[{}]/g, '').replace(/_/g, ' ').toUpperCase();
                      const isDate = placeholder.toLowerCase().includes('fecha');
                      const isNumber = placeholder.toLowerCase().includes('precio') || 
                                       placeholder.toLowerCase().includes('comision') || 
                                       placeholder.toLowerCase().includes('cantidad') || 
                                       placeholder.toLowerCase().includes('meses') || 
                                       placeholder.toLowerCase().includes('num') ||
                                       placeholder.toLowerCase().includes('deposito') ||
                                       placeholder.toLowerCase().includes('garantia') ||
                                       placeholder.toLowerCase().includes('llaves');
                      
                      return (
                        <div key={placeholder} className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wide">
                            {placeholder.toLowerCase().includes('precio') || placeholder.toLowerCase().includes('deposito') || placeholder.toLowerCase().includes('cantidad') ? <DollarSign size={10} className="text-emerald-400" /> : null}
                            {placeholder.toLowerCase().includes('fecha') ? <Calendar size={10} className="text-emerald-400" /> : null}
                            {cleanLabel}
                          </label>
                          <input
                            type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                            value={manualValues[placeholder] || ''}
                            onChange={(e) => handleManualValueChange(placeholder, e.target.value)}
                            placeholder={`Ingresar ${cleanLabel.toLowerCase()}...`}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60 transition-all font-semibold"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botonera de Navegación */}
              <div className="flex justify-between mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setWizardStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 hover:bg-slate-850 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Volver a Entidades
                </button>
                <button
                  onClick={() => setWizardStep(4)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Ver Previsualización <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: PREVISUALIZACIÓN E IMPRESIÓN */}
          {wizardStep === 4 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                  <Printer size={14} className="text-emerald-400" /> Paso 4: Previsualización de Folio e Impresión Legal
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Documento Completo
                </span>
              </div>

              <div className="flex flex-col xl:flex-row gap-8">
                {/* 4.1 CANVAS DE FOLIO A4 */}
                <div className="w-full xl:w-2/3 flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Eye size={14} className="text-emerald-400" /> Vista previa en Hoja Legal (Formato A4)
                  </label>
                  
                  {/* Contenedor A4 de simulación */}
                  <div className="w-full rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xl p-8 min-h-[600px] select-text">
                    <div 
                      className="preview-contract-rendered"
                      dangerouslySetInnerHTML={{ __html: getMergedHTML() }}
                    />
                  </div>
                </div>

                {/* 4.2 PANEL DE ACCIONES E INFORMACIÓN */}
                <div className="w-full xl:w-1/3 flex flex-col gap-6">
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col gap-4">
                    <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-400" /> Resumen del Acuerdo
                    </h4>
                    
                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-900">
                        <span className="text-slate-400">Folio Referencia</span>
                        <span className="font-mono font-bold text-slate-200">{folioReferencia}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-900">
                        <span className="text-slate-400">Tipo de Documento</span>
                        <span className="font-bold text-emerald-400">{selectedPlantilla?.tipoContrato}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-900">
                        <span className="text-slate-400">Inmueble Vinculado</span>
                        <span className="font-bold text-slate-200 text-right max-w-[180px] truncate">{selectedInmueble?.referenciaInterna} • {selectedInmueble?.tipoInmueble}</span>
                      </div>
                      {selectedInmueble?.propietarios?.[0] && (
                        <div className="flex justify-between py-1.5 border-b border-slate-900">
                          <span className="text-slate-400">Propietario Legítimo</span>
                          <span className="font-bold text-slate-200 text-right max-w-[180px] truncate">{selectedInmueble.propietarios[0].nombre}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 border-b border-slate-900">
                        <span className="text-slate-400">Cliente Firmante</span>
                        <span className="font-bold text-slate-200 text-right max-w-[180px] truncate">{selectedCliente?.nombre}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-900">
                        <span className="text-slate-400">Agente Comercial</span>
                        <span className="font-bold text-slate-200 text-right max-w-[180px] truncate">{usuario?.nombre || 'Comercial Autorizado'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed flex gap-2">
                      <Info size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>Al presionar <b>Generar y Guardar</b>, se creará el registro legal en Inmova, se cargará el documento HTML al storage de Supabase y se abrirá la ventana de impresión nativa del sistema para guardar como PDF o imprimir.</span>
                    </div>

                    <button
                      onClick={handleGenerateAndSaveContract}
                      className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                    >
                      <Printer size={15} /> Generar PDF & Imprimir
                    </button>
                  </div>
                </div>
              </div>

              {/* Botonera de Navegación */}
              <div className="flex justify-between mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setWizardStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 hover:bg-slate-850 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Volver a Variables
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* VISTA PRINCIPAL CON SUB-PESTAÑAS */
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* BOTONERA SUB-PESTAÑAS */}
          <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-850 max-w-md">
            <button
              onClick={() => setActiveTab('historial')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'historial' 
                  ? 'bg-slate-800 text-white border border-slate-700/50 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck size={14} /> Contratos Emitidos ({contratos.length})
            </button>
            <button
              onClick={() => setActiveTab('plantillas')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'plantillas' 
                  ? 'bg-slate-800 text-white border border-slate-700/50 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={14} /> Plantillas Base ({plantillas.length})
            </button>
            <button
              onClick={() => setActiveTab('guia')}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'guia' 
                  ? 'bg-slate-800 text-white border border-slate-700/50 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} /> Guía de Tokens
            </button>
          </div>

          {/* CONTENIDOS DE SUB-PESTAÑAS */}
          
          {/* TAB 1: HISTORIAL DE CONTRATOS */}
          {activeTab === 'historial' && (
            <div className="db-table-container animate-fade-in">
              <div className="table-header-row border-b border-slate-850 pb-3 mb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-300">Historial de Documentos Contractuales</h4>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock size={11} className="text-emerald-400" /> Sincronizado hace un momento
                  </span>
                </div>
              </div>

              {contratos.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-full bg-slate-950/60 border border-slate-850 text-slate-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-300 text-sm">Sin Contratos Registrados</h5>
                    <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-1 leading-relaxed">Aún no has generado ningún contrato utilizando el asistente paso a paso.</p>
                  </div>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="mt-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/20 text-slate-200 font-bold text-xs py-2 px-3 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    Generar el Primer Contrato
                  </button>
                </div>
              ) : (
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Código Contrato</th>
                      <th>Tipo Plantilla</th>
                      <th>Inmueble</th>
                      <th>Cliente</th>
                      <th>Fecha Registro</th>
                      <th>Estado</th>
                      <th className="text-center">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contratos.map(c => {
                      const folio = c.folioReferencia || 'CTR-TEMP';
                      const tipo = c.plantillaOrigen?.tipoContrato || 'Personal';
                      const inmuebleRef = c.inmueble?.referenciaInterna || 'N/A';
                      const clienteNom = c.cliente?.nombre || 'Desconocido';
                      const fecha = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
                      
                      return (
                        <tr key={c._id}>
                          <td className="font-mono font-extrabold text-slate-200">{folio}</td>
                          <td className="font-semibold">{tipo}</td>
                          <td>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] text-slate-300 font-mono">
                              {inmuebleRef}
                            </span>
                          </td>
                          <td className="font-semibold text-slate-300">{clienteNom}</td>
                          <td>{fecha}</td>
                          <td>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Activo / Guardado
                            </span>
                          </td>
                          <td className="text-center">
                            <a
                              href={c.pdfStorageUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex p-1.5 rounded-lg bg-slate-850 hover:bg-slate-750 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                            >
                              <Download size={13} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: GESTIÓN DE PLANTILLAS BASE */}
          {activeTab === 'plantillas' && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="text-sm font-bold text-slate-300">Catálogo de Plantillas WYSIWYG</h4>
                <button
                  onClick={() => handleOpenPlantillaModal()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/20 text-slate-200 hover:text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  <Plus size={13} /> Nueva Plantilla
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plantillas.map(pl => (
                  <div 
                    key={pl._id}
                    className="border border-slate-850 bg-slate-950/40 p-5 rounded-xl transition-all relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                          {pl.tipoContrato}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-100">{pl.titulo}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">Variables mapeadas: {pl.variablesPermitidas?.length || 0}</p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-900/60">
                      <span className="text-[10px] text-slate-500 font-mono">ID: {pl._id?.substring(0, 8)}...</span>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenPlantillaModal(pl)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeletePlantilla(pl._id)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GUÍA DE TOKENS E INSTRUCCIONES */}
          {activeTab === 'guia' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Instrucciones */}
              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col gap-4">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-emerald-400" /> Guía para Diseñar tus Propias Plantillas
                </h4>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  En Inmova puedes registrar cualquier tipo de documento comercial o legal y automatizar su redacción en segundos. El procesador busca marcas exactas rodeadas de llaves <code>{`{token}`}</code> dentro del código HTML o texto de la plantilla.
                </p>

                <div className="flex flex-col gap-2 mt-2">
                  <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Pasos para registrar tu plantilla:</h5>
                  <ol className="list-decimal pl-4 text-xs text-slate-400 flex flex-col gap-2">
                    <li>Redacta tu contrato en formato HTML. Puedes incluir estilos integrados de CSS (como fuentes, márgenes o tablas) para que al imprimirse luzca idéntico a un folio oficial de papel.</li>
                    <li>Sustituye los datos variables por los <b>tokens automáticos</b> correspondientes a Inmuebles o Clientes (ver panel lateral).</li>
                    <li>Si necesitas registrar datos que no están en la base de datos (como la duración, un precio acordado específico o la fecha de firma), inventa tus propios tokens personalizados como <code>{`{fecha_firma}`}</code>, <code>{`{duracion_meses}`}</code> o <code>{`{deposito_garantia}`}</code>.</li>
                    <li>Guarda la plantilla base. Al usarla en el Asistente, el programa detectará las variables manuales automáticamente y te solicitará sus valores antes de generar el documento.</li>
                  </ol>
                </div>
              </div>

              {/* Mapeo de Variables */}
              <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={14} className="text-emerald-400" /> Tokens Automáticos Admitidos
                </h4>

                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Del Cliente / Propietario</span>
                    <ul className="flex flex-col gap-1.5 text-[10px] font-mono text-slate-300">
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{nombre_cliente}`}</span>
                        <span className="text-slate-500 font-sans">Nombre completo</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{correo_cliente}`}</span>
                        <span className="text-slate-500 font-sans">Email de contacto</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{telefono_cliente}`}</span>
                        <span className="text-slate-500 font-sans">Teléfono / DUI</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 mt-1">Del Inmueble Comercial</span>
                    <ul className="flex flex-col gap-1.5 text-[10px] font-mono text-slate-300">
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_referencia}`}</span>
                        <span className="text-slate-500 font-sans">Referencia Interna</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_direccion}`}</span>
                        <span className="text-slate-500 font-sans">Dirección exacta</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_tipo}`}</span>
                        <span className="text-slate-500 font-sans">Tipo de propiedad</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_superficie}`}</span>
                        <span className="text-slate-500 font-sans">M² totales</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_precio}`}</span>
                        <span className="text-slate-500 font-sans">Precio de Venta</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_ciudad}`}</span>
                        <span className="text-slate-500 font-sans">Ciudad</span>
                      </li>
                      <li className="flex justify-between py-1 bg-slate-950 px-2 rounded border border-slate-900">
                        <span>{`{inmueble_departamento}`}</span>
                        <span className="text-slate-500 font-sans">Departamento</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL CREAR / EDITAR PLANTILLA BASE */}
      {showPlantillaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 my-8 animate-scale-in flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200">
                {editingPlantilla ? `Editar Plantilla: ${editingPlantilla.titulo}` : 'Crear Nueva Plantilla Base'}
              </h3>
              <button
                onClick={() => setShowPlantillaModal(false)}
                className="p-1 rounded bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSavePlantilla} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Título Identificador</label>
                  <input
                    type="text"
                    required
                    value={plantillaForm.titulo}
                    onChange={(e) => setPlantillaForm(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ej. Contrato de Alquiler Residencial Corto"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-full sm:w-64">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tipo de Documento</label>
                  <select
                    value={plantillaForm.tipoContrato}
                    onChange={(e) => setPlantillaForm(prev => ({ ...prev, tipoContrato: e.target.value }))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Alquiler">Alquiler</option>
                    <option value="Arras">Arras</option>
                    <option value="Honorarios del Comprador">Honorarios del Comprador</option>
                    <option value="Honorarios del Vendedor">Honorarios del Vendedor</option>
                    <option value="Recibo de llaves">Recibo de llaves</option>
                    <option value="Devolución de llaves">Devolución de llaves</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Código de Cuerpo HTML (Editor Enriquecido / WYSIWYG)</label>
                  <span className="text-[9px] text-slate-500 font-bold">Usa variables como {`{nombre_cliente}`} o {`{duracion_meses}`}</span>
                </div>
                <textarea
                  required
                  rows={14}
                  value={plantillaForm.contenidoHTML}
                  onChange={(e) => setPlantillaForm(prev => ({ ...prev, contenidoHTML: e.target.value }))}
                  placeholder="Redacta o pega el código HTML del acuerdo aquí..."
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-y"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlantillaModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
