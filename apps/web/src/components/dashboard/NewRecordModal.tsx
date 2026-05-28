import React, { useState } from 'react';
import { Sparkles, X, UploadCloud } from 'lucide-react';
import type { ModuleId } from './Sidebar';
import { supabase } from '../../lib/supabase';

export const DEPARTAMENTOS_EL_SALVADOR: Record<string, string[]> = {
  'San Salvador': ['San Salvador', 'Mejicanos', 'Soyapango', 'Ilopango', 'Delgado', 'Apopa', 'San Marcos', 'Panchimalco', 'Cuscatancingo', 'Tonacatepeque', 'Guazapa', 'Aguilares', 'El Paisnal', 'Nejapa', 'Santo Tomás', 'Santiago Texacuangos', 'Rosario de Mora'],
  'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlán', 'Colón', 'La Libertad', 'Lourdes', 'San José Villanueva', 'Zaragoza', 'Nuevo Cuscatlán', 'Quezaltepeque', 'San Juan Opico', 'Ciudad Arce', 'Huizúcar', 'San Matías', 'Sacacoyo', 'Tepecoyo', 'Jayaque', 'Tamanique', 'Chiltiupán', 'Comasagua', 'Talnique', 'Teotepeque', 'Jicalapa'],
  'Santa Ana': ['Santa Ana', 'Chalchuapa', 'Metapán', 'Coatepeque', 'San Sebastián Salitrillo', 'El Congo', 'Texistepeque', 'Candelaria de la Frontera', 'Santiago de la Frontera', 'San Antonio Pajonal', 'Masahuat', 'Santa Rosa Guachipilín', 'El Porvenir'],
  'San Miguel': ['San Miguel', 'El Tránsito', 'Ciudad Barrios', 'Chinameca', 'Lolotique', 'Sesori', 'San Rafael Oriente', 'Quelepa', 'San Gerardo', 'San Luis de la Reina', 'Carolina', 'San Antonio', 'Nuevo Edén de San Juan', 'Uluazapa', 'Comacarán', 'Moncagua', 'Chirilagua', 'Nueva Guadalupe'],
  'Sonsonate': ['Sonsonate', 'Izalco', 'Acajutla', 'Nahuizalco', 'Armenia', 'Juayúa', 'San Julián', 'Sonsonacate', 'Caluco', 'Cuisnahuat', 'Santa Isabel Ishuatán', 'Santo Domingo de Guzmán', 'Salcoatitán', 'San Antonio del Monte', 'Santa Catarina Masahuat'],
  'Usulután': ['Usulután', 'Jiquilisco', 'Santiago de María', 'Puerto El Triunfo', 'Berlín', 'Jucuapa', 'Concepción Batres', 'San Francisco Javier', 'Santa Elena', 'Santa María', 'Ozatlán', 'Tecapán', 'California', 'Ereguayquín', 'San Agustín', 'San Dionisio', 'San Buenaventura', 'Nueva Granada', 'Estanzuelas', 'Mercedes Umaña', 'Jucuaran', 'El Triunfo', 'Alegría'],
  'Ahuachapán': ['Ahuachapán', 'Atiquizaya', 'Turín', 'Tacuba', 'Concepción de Ataco', 'Apaneca', 'Guaymango', 'Jujutla', 'San Francisco Menéndez', 'San Lorenzo', 'San Pedro Puxtla', 'El Refugio'],
  'La Paz': ['Zacatecoluca', 'Olocuilta', 'San Luis Talpa', 'San Juan Nonualco', 'Santiago Nonualco', 'San Pedro Masahuat', 'San Luis La Herradura', 'Rosario de La Paz', 'San Rafael Obrajuelo', 'San Francisco Chinameca', 'San Miguel Tepezontes', 'San Juan Tepezontes', 'San Emigdio', 'Paraíso de Osorio', 'Jerusalén', 'Mercedes La Ceiba', 'Santa María Ostuma', 'Cuyultitán', 'Tapalhuaca', 'San Pedro Nonualco', 'San Antonio Masahuat'],
  'Cabañas': ['Sensuntepeque', 'Ilobasco', 'Tejutepeque', 'Victoria', 'Cinquera', 'Guacotecti', 'San Isidro', 'Jutiapa'],
  'Chalatenango': ['Chalatenango', 'La Palma', 'Tejutla', 'Dulce Nombre de María', 'Nueva Concepción', 'San Ignacio', 'Agua Caliente', 'Arcatao', 'Azacualpa', 'Comalapa', 'Citalá', 'Concepción Quezaltepeque', 'El Carrizal', 'El Paraíso', 'La Laguna', 'Las Vueltas', 'Nombre de Jesús', 'Nueva Trinidad', 'Ojos de Agua', 'Potonico', 'San Antonio de la Cruz', 'San Antonio Los Ranchos', 'San Fernando', 'San Francisco Lempa', 'San Francisco Morazán', 'San Isidro Labrador', 'San Jose Las Flores', 'San José Cancasque', 'San Luis del Carmen', 'San Miguel de Mercedes', 'San Rafael', 'Santa Rita'],
  'Cuscatlán': ['Cojutepeque', 'Suchitoto', 'San Pedro Perulapán', 'Tenancingo', 'San Rafael Cedros', 'Candelaria', 'El Carmen', 'El Rosario', 'Monte San Juan', 'Oratorio de Concepción', 'San Bartolomé Perulapía', 'San Cristóbal', 'San José Guayabal', 'San Lorenzo', 'San Ramón', 'Santa Cruz Analquito', 'Santa Cruz Michapa'],
  'Morazán': ['San Francisco Gotera', 'Corinto', 'Osicala', 'Jocoaitique', 'Perquín', 'Cacaopera', 'Chilanga', 'Delicias de Concepción', 'El Divisadero', 'El Rosario', 'Gualococti', 'Guatajiagua', 'Joateca', 'Jocoro', 'Lolotiquillo', 'Meanguera', 'San Carlos', 'San Fernando', 'San Isidro', 'San Simón', 'Sensembra', 'Sociedad', 'Torola', 'Yamabal', 'Yoloaiquín', 'Arambala'],
  'San Vicente': ['San Vicente', 'Apastepeque', 'Tecoluca', 'San Sebastián', 'Tepetitán', 'Guadalupe', 'San Cayetano Istepeque', 'San Lorenzo', 'San Esteban Catarina', 'Santa Clara', 'Verapaz', 'Chinchontepec', 'San Ildefonso'],
  'La Unión': ['La Unión', 'Conchagua', 'Santa Rosa de Lima', 'Anamorós', 'Pasaquina', 'El Carmen', 'Intipucá', 'San Alejo', 'El Sauce', 'Lislique', 'Nueva Esparta', 'Polorós', 'Concepción de Oriente', 'Meanguera del Golfo', 'San José', 'Yayantique', 'Bolívar', 'Yayatique']
};


interface Inmueble {
  _id: string;
  referenciaInterna: string;
  estado: 'Disponible' | 'Reservado' | 'Prospecto' | 'Vendido';
  tipoInmueble: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  zona: string;
  precioVenta: number;
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

interface NewRecordModalProps {
  activeModule: ModuleId;
  isOpen: boolean;
  onClose: () => void;
  inmueblesList: Inmueble[];
  crmList: Cliente[];
  onSubmit: (type: 'inmueble' | 'crm' | 'visita', data: Record<string, unknown>) => Promise<boolean>;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
  workspaceType: 'personal' | 'grupo';
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  activeModule,
  isOpen,
  onClose,
  inmueblesList,
  crmList,
  onSubmit,
  loading,
  error,
  setError,
  workspaceType
}) => {
  // Inputs para Inmueble nuevo
  const [infRef, setInfRef] = useState('');
  const [infTipo, setInfTipo] = useState('Piso');
  const [infEstado, setInfEstado] = useState('Disponible');
  const [infPrecio, setInfPrecio] = useState('');
  const [infDireccion, setInfDireccion] = useState('');
  const [infCiudad, setInfCiudad] = useState('');
  const [infDepartamento, setInfDepartamento] = useState('');
  const [infDesc, setInfDesc] = useState('');
  const [infDorms, setInfDorms] = useState('2');
  const [infBanos, setInfBanos] = useState('1');
  const [infSuperficie, setInfSuperficie] = useState('80');
  const [infDoblePlanta, setInfDoblePlanta] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Inputs para Propietario (Requerido)
  const [propNombre, setPropNombre] = useState('');
  const [propCorreo, setPropCorreo] = useState('');
  const [propTelefono, setPropTelefono] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  // Inputs para Cliente nuevo
  const [crmNombre, setCrmNombre] = useState('');
  const [crmCorreo, setCrmCorreo] = useState('');
  const [crmTelefono, setCrmTelefono] = useState('');
  const [crmCanal, setCrmCanal] = useState('WhatsApp');
  const [crmEstado, setCrmEstado] = useState('Nuevo');
  const [crmPrefTipo, setCrmPrefTipo] = useState('Piso');
  const [crmPrefDeps, setCrmPrefDeps] = useState<string[]>([]);
  const [crmPrefCity, setCrmPrefCity] = useState('');
  const [crmPrefPrecio, setCrmPrefPrecio] = useState('');

  // Inputs para Visita nueva
  const [visCliente, setVisCliente] = useState('');
  const [visInmueble, setVisInmueble] = useState('');
  const [visFechaHora, setVisFechaHora] = useState('');
  const [visEstado, setVisEstado] = useState('Programada');
  const [visObs, setVisObs] = useState('');

  if (!isOpen) return null;

  const handleInmuebleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infRef.trim() || !infPrecio || !infDireccion.trim() || !infCiudad.trim() || !infDepartamento.trim() || !propNombre.trim() || !propCorreo.trim() || !propTelefono.trim()) {
      setError('Por favor introduce referencia, precio, dirección, ciudad, departamento y los datos del propietario.');
      return;
    }

    setIsUploading(true);
    const uploadedImageUrls: string[] = [];
    let coverUrl = '';

    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `inmueble/${workspaceType}/${fileName}`;

        // Intentamos subir al bucket 'Img_inmuebles'
        const { error: uploadError, data } = await supabase.storage
          .from('Img_inmuebles')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error("Error subiendo imagen:", uploadError);
          setError(`Error subiendo la imagen ${file.name}: Asegúrate de haber creado el bucket "Img_inmuebles" y configurado sus políticas.`);
          setIsUploading(false);
          return;
        }

        if (data) {
          const { data: publicUrlData } = supabase.storage
            .from('Img_inmuebles')
            .getPublicUrl(filePath);
          
          if (i === coverIndex) {
            coverUrl = publicUrlData.publicUrl;
          } else {
            uploadedImageUrls.push(publicUrlData.publicUrl);
          }
        }
      }
    }

    // Asegurarse de que la imagen de portada esté en la posición 0
    if (coverUrl) {
      uploadedImageUrls.unshift(coverUrl);
    }

    const success = await onSubmit('inmueble', {
      referenciaInterna: infRef.trim(),
      tipoInmueble: infTipo,
      estado: infEstado,
      precioVenta: Number(infPrecio),
      direccion: infDireccion.trim(),
      ciudad: infCiudad.trim(),
      departamento: infDepartamento.trim(),
      zona: infCiudad.trim(), // Para retrocompatibilidad
      descripcion: infDesc.trim(),
      caracteristicas: {
        dormitorios: infTipo === 'Lote' ? 0 : Number(infDorms),
        banos: infTipo === 'Lote' ? 0 : Number(infBanos),
        superficieTotal: Number(infSuperficie),
        planta: infDoblePlanta ? 'Doble Planta' : ''
      },
      imagenes: uploadedImageUrls,
      propietarios: [
        {
          nombre: propNombre.trim(),
          correo: propCorreo.trim(),
          telefono: propTelefono.trim(),
          esPrincipal: true,
          comunicaciones: []
        }
      ]
    });
    
    setIsUploading(false);

    if (success) {
      setInfRef('');
      setInfPrecio('');
      setInfDireccion('');
      setInfCiudad('');
      setInfDepartamento('');
      setInfDesc('');
      setInfDoblePlanta(false);
      setSelectedFiles([]);
      setCoverIndex(0);
      setPropNombre('');
      setPropCorreo('');
      setPropTelefono('');
      onClose();
    }
  };

  const handleClienteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmNombre.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }
    
    let zonaStr = '';
    if (crmPrefDeps.length > 0) {
      if (crmPrefDeps.length === 1) {
        const dep = crmPrefDeps[0];
        zonaStr = crmPrefCity ? `${dep}, ${crmPrefCity}` : dep;
      } else {
        zonaStr = crmPrefDeps.join(', ');
      }
    }

    const success = await onSubmit('crm', {
      nombre: crmNombre.trim(),
      correo: crmCorreo.trim(),
      telefono: crmTelefono.trim(),
      canalOrigen: crmCanal,
      estadoLead: crmEstado,
      preferencias: {
        tipoInmuebleBuscado: crmPrefTipo,
        zonaInteres: zonaStr,
        rangoPrecioMax: crmPrefPrecio ? Number(crmPrefPrecio) : 0
      }
    });
    if (success) {
      setCrmNombre('');
      setCrmCorreo('');
      setCrmTelefono('');
      setCrmPrefDeps([]);
      setCrmPrefCity('');
      setCrmPrefPrecio('');
      onClose();
    }
  };

  const handleVisitaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visCliente || !visInmueble || !visFechaHora) {
      setError('Por favor selecciona un cliente, inmueble y una fecha/hora válida.');
      return;
    }
    const success = await onSubmit('visita', {
      cliente: visCliente,
      inmueble: visInmueble,
      fechaHora: visFechaHora,
      estado: visEstado,
      observacionesPostVisita: visObs.trim()
    });
    if (success) {
      setVisCliente('');
      setVisInmueble('');
      setVisFechaHora('');
      setVisObs('');
      onClose();
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-filter backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className={`bg-[#1e293b] border border-slate-700/60 rounded-2xl w-full ${activeModule === 'inmuebles' ? 'max-w-4xl' : 'max-w-lg'} overflow-hidden shadow-2xl animate-fade-in text-white`}>
        {/* Cabecera del modal */}
        <div className="px-6 py-4 bg-[#0f172a] border-b border-slate-700/60 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white text-lg">
              {activeModule === 'inmuebles' && 'Añadir Propiedad'}
              {activeModule === 'crm' && 'Registrar Nuevo Cliente'}
              {activeModule === 'visitas' && 'Agendar Nueva Cita'}
            </h3>
          </div>
          <button
            className="text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo / Formulario */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 bg-red-950/50 border border-red-800 text-red-300 rounded-lg text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {/* FORMULARIO INMUEBLES */}
          {activeModule === 'inmuebles' && (
            <form onSubmit={handleInmuebleSubmit} className="flex flex-col gap-6 text-slate-300">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Columna Izquierda: Datos Generales */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Referencia Interna *</label>
                  <input
                    type="text"
                    placeholder="ej: INV-2026A"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={infRef}
                    onChange={(e) => setInfRef(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Tipo de Inmueble *</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={infTipo}
                    onChange={(e) => setInfTipo(e.target.value)}
                  >
                    <option value="Piso">Piso</option>
                    <option value="Casa">Casa</option>
                    <option value="Chalet">Chalet</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Loft">Loft</option>
                    <option value="Lote">Lote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Precio Venta ($) *</label>
                  <input
                    type="number"
                    placeholder="ej: 250000"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={infPrecio}
                    onChange={(e) => setInfPrecio(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Departamento *</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    value={infDepartamento}
                    onChange={(e) => {
                      setInfDepartamento(e.target.value);
                      setInfCiudad('');
                    }}
                    required
                  >
                    <option value="">-- Elige Departamento --</option>
                    {Object.keys(DEPARTAMENTOS_EL_SALVADOR).map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Ciudad *</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    value={infCiudad}
                    onChange={(e) => setInfCiudad(e.target.value)}
                    required
                    disabled={!infDepartamento}
                  >
                    <option value="">-- Elige Ciudad --</option>
                    {infDepartamento &&
                      DEPARTAMENTOS_EL_SALVADOR[infDepartamento]?.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Dirección *</label>
                  <input
                    type="text"
                    placeholder="ej: Pasaje Los Almendros #14"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={infDireccion}
                    onChange={(e) => setInfDireccion(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {infTipo !== 'Lote' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Dormitorios</label>
                      <input
                        type="number"
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        value={infDorms}
                        onChange={(e) => setInfDorms(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Baños</label>
                      <input
                        type="number"
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                        value={infBanos}
                        onChange={(e) => setInfBanos(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className={`flex flex-col gap-1 ${infTipo === 'Lote' ? 'col-span-3' : ''}`}>
                  <label className="text-xs font-bold text-slate-300">Superficie (m²)</label>
                  <input
                    type="number"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={infSuperficie}
                    onChange={(e) => setInfSuperficie(e.target.value)}
                  />
                </div>
              </div>

              {infTipo !== 'Lote' && (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="checkbox" 
                    id="doblePlanta" 
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    checked={infDoblePlanta}
                    onChange={(e) => setInfDoblePlanta(e.target.checked)}
                  />
                  <label htmlFor="doblePlanta" className="text-sm font-semibold text-slate-300 select-none cursor-pointer">
                    ¿Es de doble planta?
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Estado</label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={infEstado}
                  onChange={(e) => setInfEstado(e.target.value)}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Prospecto">Prospecto</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Descripción / Detalles adicionales</label>
                <textarea
                  placeholder="Características, vistas, terraza, etc..."
                  rows={2}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                  value={infDesc}
                  onChange={(e) => setInfDesc(e.target.value)}
                />
              </div>

              {/* Sección de Propietario Requerido */}
              <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-xl flex flex-col gap-3 mt-2">
                <span className="text-xs font-bold text-emerald-400">Datos del Propietario *</span>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Nombre Completo *</label>
                    <input
                      type="text"
                      placeholder="ej: Juan Pérez"
                      className="bg-slate-950 border border-slate-750 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      value={propNombre}
                      onChange={(e) => setPropNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Correo Electrónico *</label>
                      <input
                        type="email"
                        placeholder="ej: juan@correo.com"
                        className="bg-slate-950 border border-slate-750 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        value={propCorreo}
                        onChange={(e) => setPropCorreo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Teléfono / Celular *</label>
                      <input
                        type="text"
                        placeholder="ej: +34 600 111 222"
                        className="bg-slate-950 border border-slate-750 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        value={propTelefono}
                        onChange={(e) => setPropTelefono(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Imágenes */}
            <div className="w-full md:w-[400px] shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <UploadCloud size={14} className="text-emerald-400" />
                  Imágenes del Inmueble
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
                />
                
                {selectedFiles.length > 0 ? (
                  <div className="mt-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-4">
                    {/* Vista Previa Principal (Portada) */}
                    {selectedFiles[coverIndex] && (
                      <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-slate-700 shadow-inner group bg-black/50">
                        <img 
                          src={URL.createObjectURL(selectedFiles[coverIndex])} 
                          alt="Portada" 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                          Imagen Principal (Portada)
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] text-slate-400 mb-2 font-semibold">Galería ({selectedFiles.length}) - <span className="text-emerald-400">Haz clic para cambiar la portada</span></p>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {selectedFiles.map((f, idx) => (
                          <div 
                            key={idx} 
                            className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all ${coverIndex === idx ? 'border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] opacity-100 scale-105' : 'border border-slate-700 opacity-50 hover:opacity-100'}`} 
                            onClick={() => setCoverIndex(idx)}
                          >
                            <img src={URL.createObjectURL(f)} alt="preview" className="object-cover w-full h-full" />
                            <button 
                              type="button" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedFiles(prev => prev.filter((_, i) => i !== idx)); 
                                if(coverIndex === idx) setCoverIndex(0); 
                                else if(coverIndex > idx) setCoverIndex(prev => prev - 1);
                              }} 
                              className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/90 rounded-full p-1 transition-colors text-white"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 mt-1">Selecciona una o varias imágenes (JPG, PNG). La primera que elijas como portada será la principal en el catálogo.</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading || isUploading}
          >
                {(loading || isUploading) ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></div>
                    {isUploading ? 'Subiendo imágenes...' : 'Guardando en base de datos...'}
                  </>
                ) : (
                  'Crear Propiedad en tu Workspace'
                )}
              </button>
            </form>
          )}

          {/* FORMULARIO CLIENTES / CRM */}
          {activeModule === 'crm' && (
            <form onSubmit={handleClienteSubmit} className="flex flex-col gap-4 text-slate-300">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Nombre del Cliente *</label>
                <input
                  type="text"
                  placeholder="ej: Alejandro Gómez"
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={crmNombre}
                  onChange={(e) => setCrmNombre(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="ej: alejandro@correo.com"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={crmCorreo}
                    onChange={(e) => setCrmCorreo(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="ej: +34 600 000 000"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={crmTelefono}
                    onChange={(e) => setCrmTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Canal de Origen</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={crmCanal}
                    onChange={(e) => setCrmCanal(e.target.value)}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Web">Web Portal</option>
                    <option value="Llamada">Llamada</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Estado del Cliente</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    value={crmEstado}
                    onChange={(e) => setCrmEstado(e.target.value)}
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Interesado">Interesado</option>
                    <option value="Cerrado">Cerrado</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-emerald-400">Preferencias del Cliente</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Tipo de Inmueble</label>
                    <select
                      className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                      value={crmPrefTipo}
                      onChange={(e) => setCrmPrefTipo(e.target.value)}
                    >
                      <option value="Piso">Piso</option>
                      <option value="Casa">Casa</option>
                      <option value="Chalet">Chalet</option>
                      <option value="Oficina">Oficina</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Presupuesto Máx ($)</label>
                    <input
                      type="number"
                      placeholder="ej: 300000"
                      className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                      value={crmPrefPrecio}
                      onChange={(e) => setCrmPrefPrecio(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Departamento y Ciudad con reglas de El Salvador */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Departamento(s) * (Multiselección)</label>
                    <div className="bg-slate-950 border border-slate-750 rounded-lg p-2 h-28 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                      {Object.keys(DEPARTAMENTOS_EL_SALVADOR).map((dep) => {
                        const isChecked = crmPrefDeps.includes(dep);
                        return (
                          <label key={dep} className="flex items-center gap-2 hover:bg-slate-900/60 p-0.5 rounded cursor-pointer text-[10px] text-slate-350 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              onChange={() => {
                                if (isChecked) {
                                  const updated = crmPrefDeps.filter(d => d !== dep);
                                  setCrmPrefDeps(updated);
                                  if (updated.length !== 1) {
                                    setCrmPrefCity('');
                                  }
                                } else {
                                  const updated = [...crmPrefDeps, dep];
                                  setCrmPrefDeps(updated);
                                  if (updated.length !== 1) {
                                    setCrmPrefCity('');
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
                        disabled={crmPrefDeps.length !== 1}
                        value={crmPrefCity}
                        onChange={(e) => setCrmPrefCity(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full mt-1"
                      >
                        {crmPrefDeps.length !== 1 ? (
                          <option value="">
                            {crmPrefDeps.length > 1 
                              ? '❌ Deshabilitado (Múltiples Deptos)' 
                              : '⚠️ Selecciona 1 Depto'}
                          </option>
                        ) : (
                          <>
                            <option value="">Cualquier ciudad</option>
                            {DEPARTAMENTOS_EL_SALVADOR[crmPrefDeps[0]]?.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    {crmPrefDeps.length > 1 && (
                      <span className="text-[9px] text-emerald-400 leading-tight block bg-emerald-950/20 border border-emerald-900/30 p-1.5 rounded-lg">
                        Buscando en {crmPrefDeps.length} departamentos de El Salvador
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
                disabled={loading}
              >
                {loading ? 'Registrando Cliente...' : 'Registrar Cliente Aislado'}
              </button>
            </form>
          )}

          {/* FORMULARIO VISITAS */}
          {activeModule === 'visitas' && (
            <form onSubmit={handleVisitaSubmit} className="flex flex-col gap-4 text-slate-300">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Seleccionar Cliente *</label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={visCliente}
                  onChange={(e) => setVisCliente(e.target.value)}
                  required
                >
                  <option value="">-- Elige un Cliente de tu Cartera --</option>
                  {crmList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre} ({c.estadoLead})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Propiedad de Interés *</label>
                <select
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={visInmueble}
                  onChange={(e) => setVisInmueble(e.target.value)}
                  required
                >
                  <option value="">-- Elige un Inmueble de tu Portafolio --</option>
                  {inmueblesList.map((inm) => (
                    <option key={inm._id} value={inm._id}>
                      {inm.referenciaInterna} - {inm.tipoInmueble} en {inm.zona} ({formatPrice(inm.precioVenta)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Fecha y Hora *</label>
                  <input
                    type="datetime-local"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={visFechaHora}
                    onChange={(e) => setVisFechaHora(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-300">Estado de la Cita</label>
                  <select
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={visEstado}
                    onChange={(e) => setVisEstado(e.target.value)}
                  >
                    <option value="Programada">Programada</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Finalizada">Finalizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Observaciones iniciales / Notas</label>
                <textarea
                  placeholder="Detalles sobre el interés del cliente, condiciones de la visita..."
                  rows={2}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                  value={visObs}
                  onChange={(e) => setVisObs(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
                disabled={loading}
              >
                {loading ? 'Agendando cita...' : 'Agendar Cita en Calendario'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
