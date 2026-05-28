import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { ModuleId } from './Sidebar';

interface TopbarProps {
  activeModule: ModuleId;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewRecordClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeModule,
  searchQuery,
  setSearchQuery,
  onNewRecordClick
}) => {
  const modulosInfo = {
    inmuebles: { label: 'Gestión de Inmuebles', desc: 'Portafolio de propiedades, datos privados y propietarios' },
    crm: { label: 'Cartera de clientes', desc: 'Gestión y control de información personal de tus clientes' },
    visitas: { label: 'Agenda de Visitas', desc: 'Planificación de citas, estados y calendario interactivo' },
    grupo: { label: 'Mi Cuenta y Grupo de Trabajo', desc: 'Gestiona tu perfil, contraseña y la configuración de tu equipo.' },
    contratos: { label: 'Contratos y Plantillas', desc: 'Generación de documentos PDF y gestión de plantillas WYSIWYG' },
    publicidad: { label: 'Publicidad y Alertas', desc: 'Campañas de email masivo, WhatsApp marketing y notificaciones' },
    admin: { label: 'Configuración y Auditoría', desc: 'Control de accesos (RBAC), identidad de marca y logs de eventos' }
  };

  const current = modulosInfo[activeModule];

  const showSearchAndBtn = activeModule === 'crm' || activeModule === 'visitas';

  return (
    <header className="db-topbar">
      <div className="db-topbar-info">
        <h1 className="db-module-title">{current?.label}</h1>
        <p className="db-module-subtitle">{current?.desc}</p>
      </div>
      <div className="db-topbar-actions">
        {showSearchAndBtn && (
          <div className="db-search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar en este módulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
        {showSearchAndBtn && (
          <button className="db-btn-new" onClick={onNewRecordClick}>
            <Plus size={16} />
            <span>Nuevo Registro</span>
          </button>
        )}
      </div>
    </header>
  );
};
