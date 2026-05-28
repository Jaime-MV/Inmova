import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getInmuebles,
  crearInmueble,
  eliminarInmueble,
  actualizarEstadoInmueble,
  agregarComunicacion,
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  getVisitas,
  crearVisita,
  getStats,
  getPlantillas,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
  getContratos,
  crearContrato
} from '../controllers/dashboard.controller.js';

const router = Router();

// Asegurar autenticación obligatoria para todas las operaciones del dashboard
router.use(requireAuth);

// Rutas de Inmuebles
router.get('/inmuebles', getInmuebles);
router.post('/inmuebles', crearInmueble);
router.delete('/inmuebles/:id', eliminarInmueble);
router.put('/inmuebles/:id/estado', actualizarEstadoInmueble);
router.post('/inmuebles/:id/comunicaciones', agregarComunicacion);

// Rutas de Clientes / CRM
router.get('/crm', getClientes);
router.post('/crm', crearCliente);
router.put('/crm/:id', actualizarCliente);
router.delete('/crm/:id', eliminarCliente);

// Rutas de Visitas / Citas
router.get('/visitas', getVisitas);
router.post('/visitas', crearVisita);

// Rutas de Plantillas de Contrato
router.get('/plantillas', getPlantillas);
router.post('/plantillas', crearPlantilla);
router.put('/plantillas/:id', actualizarPlantilla);
router.delete('/plantillas/:id', eliminarPlantilla);

// Rutas de Contratos de Clientes
router.get('/contratos', getContratos);
router.post('/contratos', crearContrato);

// Rutas de Estadísticas
router.get('/stats', getStats);

export default router;
