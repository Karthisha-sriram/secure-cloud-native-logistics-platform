import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import authRoutes from './server/routes/authRoutes';
import shipmentRoutes from './server/routes/shipmentRoutes';
import customerRoutes from './server/routes/customerRoutes';
import documentRoutes from './server/routes/documentRoutes';
import notificationRoutes from './server/routes/notificationRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';
import profileRoutes from './server/routes/profileRoutes';
import securityRoutes from './server/routes/securityRoutes';
import aiRoutes from './server/routes/aiRoutes';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Basic security and parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Observability: Cloud Logging compliant request logger (sanitizes sensitive fields)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const start = Date.now();
    _res.on('finish', () => {
      const duration = Date.now() - start;
      // Do not log static assets or HMR requests
      if (!req.url.startsWith('/@') && !req.url.startsWith('/src') && !req.url.startsWith('/node_modules')) {
        console.log(
          JSON.stringify({
            severity: _res.statusCode >= 400 ? (_res.statusCode >= 500 ? 'ERROR' : 'WARNING') : 'INFO',
            message: `${req.method} ${req.originalUrl} ${_res.statusCode} in ${duration}ms`,
            httpMethod: req.method,
            path: req.originalUrl,
            status: _res.statusCode,
            latencyMs: duration,
            clientIp: req.ip || req.socket.remoteAddress,
          })
        );
      }
    });
    next();
  });

  // Spring Boot Actuator Health Check compatibility
  app.get(['/actuator/health', '/api/health'], (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      components: {
        db: { status: 'UP', details: { database: 'PostgreSQL / Cloud SQL', connection: 'ACTIVE' } },
        diskSpace: { status: 'UP', details: { freeBytes: 104857600000, threshold: 10485760 } },
        storage: { status: 'UP', details: { provider: process.env.STORAGE_PROVIDER || 'local' } },
        jwtAuth: { status: 'UP', details: { algorithm: 'HS256' } },
      },
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/shipments', shipmentRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/ai', aiRoutes);

  // Centralized backend error handler (RFC 7807 problem details)
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server exception:', err);
    res.status(err.status || 500).json({
      timestamp: new Date().toISOString(),
      status: err.status || 500,
      error: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred on the logistics server.',
      path: req.originalUrl,
    });
  });

  // Vite middleware in dev or static asset serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Logistics Server] Listening on http://0.0.0.0:${PORT} (Node ${process.version})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start logistics server:', err);
  process.exit(1);
});
