import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

interface Config {
  server: {
    port: number;
    env: string;
    maxRecordingDuration: number;
    clusterWorkers: number | 'auto';
  };
  database: {
    uri: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
    s3AudioFolder: string;
  };
  cors: {
    origin: string | string[];
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    maxRecordingDuration: parseInt(process.env.MAX_RECORDING_DURATION || '300', 10),
    clusterWorkers: process.env.CLUSTER_WORKERS === 'auto' 
      ? 'auto' 
      : parseInt(process.env.CLUSTER_WORKERS || '0', 10),
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/voice_synthesis',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || 'amzon-voice-synthesis',
    s3AudioFolder: process.env.AWS_S3_AUDIO_FOLDER || 'audio',
  },
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:3000'],
  },
};

// Validate required environment variables
const validateConfig = (): void => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && config.server.env === 'production') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

validateConfig();

export default config;