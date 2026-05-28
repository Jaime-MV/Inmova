// Cargar variables de entorno ANTES de cualquier otro import
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDB } from './db/connection.js';
import authRoutes from './routes/auth.routes.js';
import grupoRoutes from './routes/grupo.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// ─────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// MIDDLEWARE GLOBAL
// ─────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json());

// ─────────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────────

// Health check
app.get('/', (_req, res) => {
  res.json({
    message: 'INMOVA API operativa.',
    version: '1.0.0',
    db: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

// Módulo de autenticación
app.use('/api/auth', authRoutes);

// Módulo de grupos de trabajo
app.use('/api/grupos', grupoRoutes);

// Módulo del dashboard principal (Inmuebles, CRM, Citas)
app.use('/api/dashboard', dashboardRoutes);

// ─────────────────────────────────────────────
// ARRANQUE: conectar DB → iniciar servidor
// ─────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[API] Servidor iniciado en http://localhost:${PORT}`);
  });
});
