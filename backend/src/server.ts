import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { WebSocketHandler } from './websocket/websocket.handler';
import config from './config';

const numCPUs = os.cpus().length;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket handler
    const wsHandler = new WebSocketHandler(httpServer);
    console.log('✅ WebSocket server initialized');

    // Start server
    const server = httpServer.listen(config.server.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎙️  VOICE SYNTHESIS APP - Server Started                     ║
║                                                           ║
║   Environment: ${config.server.env.padEnd(42)}║
║   Port: ${String(config.server.port).padEnd(48)}║
║   Worker PID: ${String(process.pid).padEnd(42)}║
║   MongoDB: Connected ✅                                   ║
║   WebSocket: Connected ✅                                 ║
║                                                           ║
║   Endpoints:                                              ║
║   - Frontend:        http://localhost:${config.server.port}                    ║
║   - API Health:      http://localhost:${config.server.port}/api/health        ║
║   - Audio Upload:    POST /api/audio/upload               ║
║   - Get Recordings:  GET /api/audio                       ║
║   - Get Voices:      GET /api/audio/voices/available      ║
║   - WebSocket:       ws://localhost:${config.server.port}                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n🛑 Received shutdown signal, closing gracefully...');
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ✅ CAMBIO: Deshabilitar clustering cuando se necesitan WebSockets
// El clustering causa problemas con WebSockets porque cada worker
// tiene su propia instancia de Socket.IO sin sincronización
// 
// OPCIONES:
// - useCluster = false → Modo single-process (RECOMENDADO para WebSockets)
// - useCluster = true  → Modo clustering (solo si NO usas WebSockets o tienes Redis Adapter)
const useCluster = false; 

if (useCluster && cluster.isPrimary) {
  const workers = config.server.clusterWorkers === 'auto' 
    ? numCPUs 
    : config.server.clusterWorkers || 1;

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 MASTER PROCESS (Cluster Mode)                       ║
║   PID: ${String(process.pid).padEnd(48)}   ║
║   Workers: ${String(workers).padEnd(45)}   ║
║   CPU Cores: ${String(numCPUs).padEnd(43)} ║
║   ⚠️  WARNING: WebSockets may not work correctly!        ║
║   Consider using Redis Adapter or set useCluster=false   ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Fork workers
  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`
⚠️  Worker ${worker.process.pid} died (${signal || code})
🔄 Starting a new worker...
    `);
    cluster.fork();
  });

  // Handle worker online
  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });

} else {
  // Worker process or single-process mode
  if (!useCluster) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 SINGLE PROCESS MODE                                  ║
║   PID: ${String(process.pid).padEnd(48)}   ║
║   ✅ WebSocket Compatible Mode                           ║
║   Note: Clustering disabled for WebSocket support        ║
╚═══════════════════════════════════════════════════════════╝
    `);
  }
  startServer();
}