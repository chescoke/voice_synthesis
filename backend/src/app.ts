import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import config from './config';
import audioRoutes from './routes/audio.routes';
import { errorHandler, notFoundHandler } from './middleware/error';

export const createApp = (): Application => {
  const app = express();

  // Security middleware with Content Security Policy
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdnjs.cloudflare.com"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com"
        ],
        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "data:"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:"
        ],
        mediaSrc: [
          "'self'",
          "blob:",
          "https://*.amazonaws.com"
        ],
        connectSrc: [
          "'self'",
          "https://*.amazonaws.com"
        ]
      }
    }
  }));
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Compression middleware
  app.use(compression());

  // Serve static files (frontend)
  app.use(express.static(path.join(__dirname, '../../frontend')));

  // API routes
  app.use('/api/audio', audioRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Serve frontend for any other routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return notFoundHandler(req, res, () => {});
    }
    
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};