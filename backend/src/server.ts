import cluster from 'cluster';
import os from 'os';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import config from './config';

const numCPUs = os.cpus().length;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.server.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎙️  VOICE SYNTHESIS APP - Server Started                     ║
║                                                           ║
║   Environment: ${config.server.env.padEnd(42)}║
║   Port: ${String(config.server.port).padEnd(48)}║
║   Worker PID: ${String(process.pid).padEnd(42)}║
║   MongoDB: Connected ✅                                   ║
║                                                           ║
║   Endpoints:                                              ║
║   - Frontend:        http://localhost:${config.server.port}                    ║
║   - API Health:      http://localhost:${config.server.port}/api/health        ║
║   - Audio Upload:    POST /api/audio/upload               ║
║   - Get Recordings:  GET /api/audio                       ║
║   - Get Voices:      GET /api/audio/voices/available      ║
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

// Cluster implementation
if (cluster.isPrimary) {
  const workers = config.server.clusterWorkers === 'auto' 
    ? numCPUs 
    : config.server.clusterWorkers || 1;

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 MASTER PROCESS                                       ║
║   PID: ${String(process.pid).padEnd(48)}   ║
║   Workers: ${String(workers).padEnd(45)}   ║
║   CPU Cores: ${String(numCPUs).padEnd(43)} ║
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
  // Worker process
  startServer();
}