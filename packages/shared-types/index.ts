// packages/shared-types/index.ts

export interface Usuario {
    id: string;
    nombre: string;
    correo: string;
    rol: 'administrador' | 'agente' | 'cliente';
}

export interface Inmueble {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    tipo: 'casa' | 'apartamento' | 'terreno';
    ubicacion: string;
    disponible: boolean;
    creadoEn: string;
}

export interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    historialInteres: string[]; // IDs de Inmuebles
}