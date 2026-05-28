import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import './App.css';

interface UserSession {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  tipoCuenta: string;
  avatarUrl: string | null;
}

function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('inmova_token');
    if (!token) {
      setLoadingSession(false);
      return;
    }

    fetch('http://localhost:3000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Sesión expirada');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.usuario) {
          setUser({
            id: data.usuario._id,
            nombre: data.usuario.nombre,
            correo: data.usuario.correo,
            rol: data.usuario.rol,
            tipoCuenta: data.usuario.tipoCuenta,
            avatarUrl: data.usuario.avatarUrl || null
          });
        } else {
          localStorage.removeItem('inmova_token');
        }
      })
      .catch((err) => {
        console.error('Error al recuperar sesión:', err);
        localStorage.removeItem('inmova_token');
      })
      .finally(() => {
        setLoadingSession(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('inmova_token');
    setUser(null);
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white gap-4 relative overflow-hidden">
        {/* Fondo decorativo premium con degradados */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0A0F1D] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] z-0"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 4L21 9.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold tracking-wider text-slate-300 uppercase">Iniciando Inmova...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fondo radial de alta gama de INMOVA */}
      <div className="app-bg-gradient"></div>

      {!user ? (
        // Pantalla de Login interactiva
        <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      ) : (
        // Panel de bienvenida e interactivo de Alta Fidelidad
        <Dashboard user={user} onLogout={handleLogout} onUserUpdate={(updatedUser) => setUser(updatedUser)} />
      )}
    </>
  );
}

export default App;
