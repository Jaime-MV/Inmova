import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Building, ArrowRight, Sparkles, Users, Copy, Check, X } from 'lucide-react';
import './Login.css';

const testimonials = [
  {
    text: "La herramienta definitiva para acelerar las ventas y gestionar prospectos con absoluta transparencia y control en tiempo real.",
    author: "Sofía Valenzuela",
    role: "Asesor Inmobiliario Premium",
    company: "Broker Asoc. INMOVA"
  },
  {
    text: "La mejor plataforma digital para captar propiedades exclusivas y gestionar mi portafolio inmobiliario de manera ágil y 100% profesional.",
    author: "Javier Santos",
    role: "Captador de Propiedades Senior",
    company: "División Residencial"
  },
  {
    text: "Excelente control administrativo, reportes de comisiones inmediatos y auditoría de seguridad cifrada para todo nuestro equipo comercial.",
    author: "Elena Rodríguez",
    role: "Directora de Operaciones (Admin)",
    company: "Inmova Global Corporativo"
  }
];

interface LoginProps {
  onLoginSuccess: (user: { id: string; nombre: string; correo: string; rol: string; tipoCuenta: string; avatarUrl: string | null }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Pestaña actual: 'login' | 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Datos comunes y de simulación
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordarme, setRecordarme] = useState(true);

  // ── Estado del modal de grupo de trabajo ──
  const [showGrupoModal, setShowGrupoModal] = useState(false);
  const [grupoStep, setGrupoStep] = useState<'pregunta' | 'unirse' | 'crear' | 'exito'>('pregunta');
  const [grupoNombre, setGrupoNombre] = useState('');
  const [grupoCodigo, setGrupoCodigo] = useState('');
  const [grupoCodigoGenerado, setGrupoCodigoGenerado] = useState('');
  const [grupoNombreGenerado, setGrupoNombreGenerado] = useState('');
  const [grupoLoading, setGrupoLoading] = useState(false);
  const [grupoError, setGrupoError] = useState('');
  const [copiado, setCopiado] = useState(false);
  // Token guardado temporalmente para llamadas al grupo API
  const [authTokenTemp, setAuthTokenTemp] = useState('');
  const [tempSession, setTempSession] = useState<{ id: string; nombre: string; correo: string; rol: string; tipoCuenta: string; avatarUrl: string | null } | null>(null);

  // Registro: Tipo de usuario y empresa
  const [userType, setUserType] = useState<'particular' | 'empresa'>('particular');
  const [empresaInfo, setEmpresaInfo] = useState('');

  // Carrusel de testimonios / beneficios
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Efecto para auto-reproducir testimonios cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo || !password) {
      setError('Por favor, introduce correo electrónico y contraseña.');
      return;
    }

    if (tab === 'register' && !nombre) {
      setError('Por favor, introduce tu nombre completo.');
      return;
    }

    if (tab === 'register' && userType === 'empresa' && !empresaInfo) {
      setError('Por favor, introduce el nombre de la empresa o código.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const url = `http://localhost:3000${endpoint}`;
      const payload = tab === 'login'
        ? { correo, password }
        : {
            nombre,
            correo,
            password,
            userType,
            empresaInfo: userType === 'empresa' ? { nombreEmpresa: empresaInfo } : undefined
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal. Inténtalo de nuevo más tarde.');
      }

      // Guardar JWT en localStorage
      if (data.token) {
        localStorage.setItem('inmova_token', data.token);
        setAuthTokenTemp(data.token);
      }

      if (data.session) {
        setTempSession(data.session);
      }

      // Si es cuenta personal y no tiene grupo → mostrar modal
      if (data.session?.tipoCuenta === 'personal') {
        // Verificar si ya tiene grupo
        const grupoRes = await fetch('http://localhost:3000/api/grupos/mi-grupo', {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        if (grupoRes.status === 404) {
          // No tiene grupo → mostrar modal
          setShowGrupoModal(true);
          setGrupoStep('pregunta');
          return; // No llamar onLoginSuccess todavía
        }
      }

      onLoginSuccess(data.session);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión con el servidor. Por favor verifica que la API esté activa.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // HANDLERS DEL MODAL DE GRUPO DE TRABAJO
  // ─────────────────────────────────────────────

  const handleCrearGrupo = async () => {
    if (!grupoNombre.trim() || grupoNombre.trim().length < 2) {
      setGrupoError('El nombre del grupo debe tener al menos 2 caracteres.');
      return;
    }
    setGrupoLoading(true);
    setGrupoError('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authTokenTemp}` },
        body: JSON.stringify({ nombre: grupoNombre.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el grupo.');
      setGrupoCodigoGenerado(data.grupo.codigo);
      setGrupoNombreGenerado(data.grupo.nombre);
      setGrupoStep('exito');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear el grupo.';
      setGrupoError(errorMsg);
    } finally {
      setGrupoLoading(false);
    }
  };

  const handleUnirseGrupo = async () => {
    if (!grupoCodigo.trim() || grupoCodigo.trim().length !== 6) {
      setGrupoError('Introduce el código de 6 caracteres.');
      return;
    }
    setGrupoLoading(true);
    setGrupoError('');
    try {
      const res = await fetch('http://localhost:3000/api/grupos/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authTokenTemp}` },
        body: JSON.stringify({ codigo: grupoCodigo.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código inválido.');
      setGrupoCodigoGenerado(data.grupo.codigo);
      setGrupoNombreGenerado(data.grupo.nombre);
      setGrupoStep('exito');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Código inválido.';
      setGrupoError(errorMsg);
    } finally {
      setGrupoLoading(false);
    }
  };

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(grupoCodigoGenerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSaltarGrupo = () => {
    setShowGrupoModal(false);
    if (tempSession) {
      onLoginSuccess(tempSession);
    } else {
      // Recuperar sesión del token guardado y continuar
      const token = authTokenTemp || localStorage.getItem('inmova_token') || '';
      if (!token) return;
      fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { 
          if (data && data.usuario) {
            onLoginSuccess({
              id: data.usuario._id,
              nombre: data.usuario.nombre,
              correo: data.usuario.correo,
              rol: data.usuario.rol,
              tipoCuenta: data.usuario.tipoCuenta,
              avatarUrl: data.usuario.avatarUrl
            });
          }
        })
        .catch(() => {});
    }
  };

  const handleFinalizarGrupo = () => {
    setShowGrupoModal(false);
    handleSaltarGrupo();
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 font-sans select-none antialiased">
      {/* Columna Izquierda: Inspiracional / Corporativo (Visible solo en Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-[#0F172A] flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Capa de fondo elegante con degradado y red geométrica */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0A0F1D] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] z-0"></div>
        
        {/* Patrón de Rejilla sutil en SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-5 z-0" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>

        {/* Círculos decorativos premium */}
        <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-[#1E3A8A]/30 blur-[150px] pointer-events-none"></div>

        {/* Encabezado: Logotipo INMOVA */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 4L21 9.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider bg-clip-text bg-gradient-to-r from-white to-gray-200">INMOVA</span>
        </div>

        {/* Centro: Eslogan corporativo e información */}
        <div className="my-auto max-w-lg relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 border border-emerald-500/20">
            <Sparkles size={12} />
            Plataforma Profesional de Gestión
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-6">
            El futuro de la gestión inmobiliaria, hoy.
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Centraliza la captación de inmuebles, automatiza el pipeline de tus clientes y administra roles corporativos en un entorno seguro y rápido.
          </p>
        </div>

        {/* Pie de columna: Testimoniales interactivos */}
        <div className="relative z-10 border-t border-white/10 pt-8 mt-auto">
          {/* Contenido del testimonio activo */}
          <div className="min-h-[110px] transition-all duration-500 ease-in-out">
            <p className="text-gray-300 text-sm italic font-medium leading-relaxed mb-4">
              "{testimonials[activeTestimonial].text}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white text-sm">{testimonials[activeTestimonial].author}</h4>
                <p className="text-emerald-400 text-xs font-medium">{testimonials[activeTestimonial].role}</p>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {testimonials[activeTestimonial].company}
              </span>
            </div>
          </div>

          {/* Dots de control del Carrusel */}
          <div className="flex items-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeTestimonial === index ? 'w-6 bg-emerald-500' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                aria-label={`Ir al testimonio ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Login / Registro Híbrido */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Cabecera del logo para versión móvil */}
        <div className="flex md:hidden items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 text-white">
            <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 4L21 9.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wider text-slate-900">INMOVA</span>
        </div>

        {/* Tarjeta del Formulario Principal */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 sm:p-10 relative">
          
          {/* Pestañas Superiores Modernas */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-8">
            <button
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`w-1/2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`w-1/2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Textos descriptivos de la pestaña */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {tab === 'login' ? 'Bienvenido de nuevo' : 'Regístrate en la plataforma'}
            </h2>
            <p className="text-slate-400 text-xs mt-1.5">
              {tab === 'login' ? 'Ingresa tus credenciales para acceder a tu panel de control.' : 'Empieza hoy mismo y lleva tu gestión al siguiente nivel.'}
            </p>
          </div>

          {/* Formulario Principal */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Input: Nombre Completo (Solo Registro) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${tab === 'register' ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="relative">
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setError('');
                  }}
                  className="peer w-full px-4 py-3 pt-6 pb-2 border border-gray-200 rounded-xl text-slate-950 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-transparent"
                  placeholder="Nombre Completo"
                  required={tab === 'register'}
                />
                <label
                  htmlFor="nombre"
                  className="absolute left-4 top-2 text-xs font-semibold text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#1E3A8A]"
                >
                  Nombre Completo
                </label>
              </div>
            </div>

            {/* Input: Correo Electrónico */}
            <div className="relative">
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setError('');
                }}
                className="peer w-full px-4 py-3 pt-6 pb-2 border border-gray-200 rounded-xl text-slate-950 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-transparent"
                placeholder="correo@ejemplo.com"
                required
              />
              <label
                htmlFor="correo"
                className="absolute left-4 top-2 text-xs font-semibold text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#1E3A8A]"
              >
                Correo Electrónico
              </label>
            </div>

            {/* Input: Contraseña */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="peer w-full px-4 py-3 pt-6 pb-2 pr-12 border border-gray-200 rounded-xl text-slate-950 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-transparent"
                placeholder="Contraseña"
                required
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-xs font-semibold text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#1E3A8A]"
              >
                Contraseña
              </label>
              
              {/* Toggle de visibilidad */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Selector de Tipo de Usuario (Radio Cards) - SOLO EN REGISTRO */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${tab === 'register' ? 'max-h-[160px] opacity-100 mb-2 mt-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tipo de Usuario
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Opción 1: Particular */}
                <div
                  onClick={() => setUserType('particular')}
                  className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 ${userType === 'particular' ? 'border-[#1E3A8A] bg-blue-50/20 text-[#1E3A8A]' : 'border-gray-200 hover:border-gray-300 text-slate-500'}`}
                >
                  <User size={18} className={userType === 'particular' ? 'text-[#1E3A8A]' : 'text-slate-400'} />
                  <span className="font-semibold text-xs text-center leading-none">Soy Particular</span>
                  <span className="text-[9px] text-slate-400 text-center">Para vender o buscar</span>
                </div>

                {/* Opción 2: Agencia */}
                <div
                  onClick={() => setUserType('empresa')}
                  className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5 ${userType === 'empresa' ? 'border-[#1E3A8A] bg-blue-50/20 text-[#1E3A8A]' : 'border-gray-200 hover:border-gray-300 text-slate-500'}`}
                >
                  <Building size={18} className={userType === 'empresa' ? 'text-[#1E3A8A]' : 'text-slate-400'} />
                  <span className="font-semibold text-xs text-center leading-none">Soy Agencia</span>
                  <span className="text-[9px] text-slate-400 text-center">Herramientas equipo</span>
                </div>
              </div>
            </div>

            {/* Input adicional animado (Solo cuando es Agencia/Empresa y Pestaña Registro) */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${tab === 'register' && userType === 'empresa' ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="relative mt-2">
                <input
                  id="empresa"
                  type="text"
                  value={empresaInfo}
                  onChange={(e) => {
                    setEmpresaInfo(e.target.value);
                    setError('');
                  }}
                  className="peer w-full px-4 py-3 pt-6 pb-2 border border-gray-200 rounded-xl text-slate-950 focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 transition-all text-sm placeholder-transparent"
                  placeholder="Nombre de Empresa / Código"
                  required={tab === 'register' && userType === 'empresa'}
                />
                <label
                  htmlFor="empresa"
                  className="absolute left-4 top-2 text-xs font-semibold text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#1E3A8A]"
                >
                  Nombre de la Empresa o Código
                </label>
              </div>
            </div>

            {/* Checkbox "Recordarme" y "Olvidé contraseña" (Solo en Login) */}
            {tab === 'login' && (
              <div className="flex items-center justify-between mt-3 text-xs sm:text-sm select-none">
                <label className="flex items-center gap-2 text-slate-500 hover:text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded border-gray-300 cursor-pointer"
                  />
                  Recordarme
                </label>
                <a
                  href="#olvide-contrasena"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Simulador: Flujo de recuperación de contraseña enviado al correo.');
                  }}
                  className="text-[#1E3A8A] hover:underline font-semibold"
                >
                  ¿Olvidé mi contraseña?
                </a>
              </div>
            )}

            {/* Mensaje de Error */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium leading-normal animate-pulse">
                {error}
              </div>
            )}

            {/* Botón CTA Principal (Verde Esmeralda) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] hover:bg-emerald-500 active:bg-emerald-600 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-75 disabled:pointer-events-none cursor-pointer mt-4"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  {tab === 'login' ? 'Iniciar Sesión' : 'Registrar Cuenta'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Nota informativa para nuevos usuarios */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400">
              {tab === 'login'
                ? '¿Aún no tienes cuenta? '
                : '¿Ya tienes una cuenta? '}
              <button
                type="button"
                onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-[#1E3A8A] font-semibold hover:underline cursor-pointer"
              >
                {tab === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
              </button>
            </p>
          </div>

        </div>

        {/* Footer de Derechos de Autor */}
        <div className="mt-8 text-center text-[10px] text-slate-400 font-semibold tracking-wide">
          © {new Date().getFullYear()} INMOVA S.L. Conexión Cifrada SSL de Alta Seguridad.
        </div>
      </div>
    </div>

    {/* ─── MODAL: GRUPO DE TRABAJO ─── */}
    {showGrupoModal && (
      <div className="grupo-modal-overlay">
        <div className="grupo-modal-card">

          {/* Botón cerrar */}
          {grupoStep !== 'exito' && (
            <button className="grupo-modal-close" onClick={handleSaltarGrupo} aria-label="Cerrar">
              <X size={18} />
            </button>
          )}

          {/* PASO 1: Pregunta inicial */}
          {grupoStep === 'pregunta' && (
            <>
              <div className="grupo-modal-icon-wrap">
                <Users size={28} className="text-emerald-400" />
              </div>
              <h3 className="grupo-modal-title">¿Tienes un grupo de trabajo?</h3>
              <p className="grupo-modal-subtitle">
                Conecta con tu equipo usando el código que tu líder compartió,
                o crea tu propio espacio de trabajo y comparte el código con tus colaboradores.
              </p>
              <div className="grupo-modal-actions">
                <button
                  className="grupo-btn-primary"
                  onClick={() => { setGrupoStep('unirse'); setGrupoError(''); }}
                >
                  Tengo un código
                </button>
                <button
                  className="grupo-btn-secondary"
                  onClick={() => { setGrupoStep('crear'); setGrupoError(''); }}
                >
                  Crear mi grupo
                </button>
                <button className="grupo-btn-skip" onClick={handleSaltarGrupo}>
                  Ahora no
                </button>
              </div>
            </>
          )}

          {/* PASO 2a: Unirse con código */}
          {grupoStep === 'unirse' && (
            <>
              <div className="grupo-modal-icon-wrap">
                <Users size={28} className="text-blue-400" />
              </div>
              <h3 className="grupo-modal-title">Unirse a un grupo</h3>
              <p className="grupo-modal-subtitle">Introduce el código de 6 caracteres que te compartió tu líder de equipo.</p>
              <input
                className="grupo-input"
                type="text"
                placeholder="Ej: AB12CD"
                maxLength={6}
                value={grupoCodigo}
                onChange={e => { setGrupoCodigo(e.target.value.toUpperCase()); setGrupoError(''); }}
                autoFocus
              />
              {grupoError && <p className="grupo-error">{grupoError}</p>}
              <div className="grupo-modal-actions">
                <button className="grupo-btn-primary" onClick={handleUnirseGrupo} disabled={grupoLoading}>
                  {grupoLoading ? 'Verificando...' : 'Unirme al grupo'}
                </button>
                <button className="grupo-btn-skip" onClick={() => { setGrupoStep('pregunta'); setGrupoError(''); setGrupoCodigo(''); }}>
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* PASO 2b: Crear grupo */}
          {grupoStep === 'crear' && (
            <>
              <div className="grupo-modal-icon-wrap">
                <Users size={28} className="text-emerald-400" />
              </div>
              <h3 className="grupo-modal-title">Crear grupo de trabajo</h3>
              <p className="grupo-modal-subtitle">Ponle un nombre a tu equipo. Recibirás un código único para invitar a tus colaboradores.</p>
              <input
                className="grupo-input"
                type="text"
                placeholder="Ej: Equipo Chamberí"
                maxLength={60}
                value={grupoNombre}
                onChange={e => { setGrupoNombre(e.target.value); setGrupoError(''); }}
                autoFocus
              />
              {grupoError && <p className="grupo-error">{grupoError}</p>}
              <div className="grupo-modal-actions">
                <button className="grupo-btn-primary" onClick={handleCrearGrupo} disabled={grupoLoading}>
                  {grupoLoading ? 'Creando...' : 'Crear grupo'}
                </button>
                <button className="grupo-btn-skip" onClick={() => { setGrupoStep('pregunta'); setGrupoError(''); setGrupoNombre(''); }}>
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* PASO 3: Éxito — mostrar código */}
          {grupoStep === 'exito' && (
            <>
              <div className="grupo-modal-icon-wrap success">
                <Check size={28} className="text-white" />
              </div>
              <h3 className="grupo-modal-title">¡Todo listo! 🎉</h3>
              <p className="grupo-modal-subtitle">
                {grupoStep === 'exito' && grupoCodigo
                  ? `Te has unido al grupo "${grupoNombreGenerado}" correctamente.`
                  : `Tu grupo "${grupoNombreGenerado}" ha sido creado. Comparte este código con tu equipo:`
                }
              </p>
              {grupoCodigoGenerado && (
                <div className="grupo-codigo-box">
                  <span className="grupo-codigo-text">{grupoCodigoGenerado}</span>
                  <button className="grupo-codigo-copy" onClick={handleCopiarCodigo} title="Copiar código">
                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
              <div className="grupo-modal-actions">
                <button className="grupo-btn-primary" onClick={handleFinalizarGrupo}>
                  Ir al panel de control <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    )}
    </>
  );
};
