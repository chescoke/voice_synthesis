import request from 'supertest';
import { createApp } from '../../src/app';
import { AudioRecordingModel } from '../../src/models/AudioRecording';

const app = createApp();

describe('Audio API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('GET /api/audio', () => {
    it('should return empty array when no recordings', async () => {
      const response = await request(app)
        .get('/api/audio')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recordings).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    it('should return recordings with pagination', async () => {
      // Create test recordings
      await AudioRecordingModel.create({
        fecha: new Date(),
        audioOriginalUrl: 'https://test.com/original.mp3',
        audioConAccentoUrl: 'https://test.com/accent.mp3',
        transcripcion: 'Test transcription',
        idiomaDetectado: 'es-ES',
        vozSeleccionada: {
          id: 'Miguel',
          name: 'Miguel',
          languageCode: 'es-ES',
          languageName: 'Spanish (Spain)',
          gender: 'Male',
        },
        duracion: 5,
        nombreArchivo: 'test.webm',
      });

      const response = await request(app)
        .get('/api/audio')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recordings).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
    });
  });

  describe('GET /api/audio/:id', () => {
    it('should return 404 for non-existent recording', async () => {
      const response = await request(app)
        .get('/api/audio/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Recording not found');
    });

    it('should return recording by ID', async () => {
      const recording = await AudioRecordingModel.create({
        fecha: new Date(),
        audioOriginalUrl: 'https://test.com/original.mp3',
        audioConAccentoUrl: 'https://test.com/accent.mp3',
        transcripcion: 'Test transcription',
        idiomaDetectado: 'es-ES',
        vozSeleccionada: {
          id: 'Miguel',
          name: 'Miguel',
          languageCode: 'es-ES',
          languageName: 'Spanish (Spain)',
          gender: 'Male',
        },
        duracion: 5,
        nombreArchivo: 'test.webm',
      });

      const response = await request(app)
        .get(`/api/audio/${recording._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transcripcion).toBe('Test transcription');
    });
  });

  describe('DELETE /api/audio/:id', () => {
    it('should delete recording successfully', async () => {
      const recording = await AudioRecordingModel.create({
        fecha: new Date(),
        audioOriginalUrl: 'https://test.com/original.mp3',
        audioConAccentoUrl: 'https://test.com/accent.mp3',
        transcripcion: 'Test transcription',
        idiomaDetectado: 'es-ES',
        vozSeleccionada: {
          id: 'Miguel',
          name: 'Miguel',
          languageCode: 'es-ES',
          languageName: 'Spanish (Spain)',
          gender: 'Male',
        },
        duracion: 5,
        nombreArchivo: 'test.webm',
      });

      const response = await request(app)
        .delete(`/api/audio/${recording._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recording deleted successfully');

      // Verify deletion
      const deletedRecording = await AudioRecordingModel.findById(recording._id);
      expect(deletedRecording).toBeNull();
    });
  });

  describe('POST /api/audio/upload', () => {
    it('should return 400 if no file provided', async () => {
      const response = await request(app)
        .post('/api/audio/upload')
        .field('voiceId', 'Miguel')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No audio file provided');
    });

    it('should return 400 if no voiceId provided', async () => {
      const response = await request(app)
        .post('/api/audio/upload')
        .attach('audio', Buffer.from('fake audio'), 'test.webm')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Voice ID is required');
    });
  });
});