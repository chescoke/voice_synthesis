import { AudioRecordingModel } from '../../src/models/AudioRecording';
import audioService from '../../src/services/audio.service';
import s3Service from '../../src/services/s3.service';
import transcribeService from '../../src/services/transcribe.service';
import pollyService from '../../src/services/polly.service';
import { SynthesisResult } from '../../src/types/index';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock the services
jest.mock('../../src/services/s3.service');
jest.mock('../../src/services/transcribe.service');
jest.mock('../../src/services/polly.service');

describe('AudioService', () => {
  const mockAudioBuffer = Buffer.from('fake audio data');
  const mockFileName = 'test-audio.webm';
  const mockVoiceId = 'Miguel';

  const mockVoiceInfo = {
    id: 'Miguel',
    name: 'Miguel',
    languageCode: 'es-ES',
    languageName: 'Spanish (Spain)',
    gender: 'Male',
  };

  const mockTranscription = {
    transcription: 'Hola, esta es una prueba de audio',
    languageCode: 'es-ES',
    duration: 5.2,
  };

  const mockS3Upload = {
    url: 'https://test-bucket.s3.amazonaws.com/audio/test.webm',
    key: 'audio/test.webm',
  };

  const mockSynthesis = {
    audioUrl: 'https://test-bucket.s3.amazonaws.com/audio/synthesized.mp3',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processAudioRecording', () => {
    it('should process audio recording successfully', async () => {
      // Setup mocks
      (s3Service.uploadAudio as jest.Mock).mockResolvedValue(mockS3Upload);
      (transcribeService.transcribeAudio as jest.Mock).mockResolvedValue(mockTranscription);
      (pollyService.getVoiceById as jest.Mock).mockResolvedValue(mockVoiceInfo);
      (pollyService.synthesizeSpeech as jest.Mock).mockResolvedValue(mockSynthesis);

      // Execute
      const result = await audioService.processAudioRecording(
        mockAudioBuffer,
        mockFileName,
        mockVoiceId
      );

      // Assertions
      expect(s3Service.uploadAudio).toHaveBeenCalledWith(
        mockAudioBuffer,
        mockFileName,
        'audio/webm'
      );
      expect(transcribeService.transcribeAudio).toHaveBeenCalledWith(mockS3Upload.url);
      expect(pollyService.getVoiceById).toHaveBeenCalledWith(mockVoiceId);
      expect(pollyService.synthesizeSpeech).toHaveBeenCalledWith(
        mockTranscription.transcription,
        mockVoiceId
      );

      expect(result).toMatchObject({
        audioOriginalUrl: mockS3Upload.url,
        audioConAccentoUrl: mockSynthesis.audioUrl,
        transcripcion: mockTranscription.transcription,
        idiomaDetectado: mockTranscription.languageCode,
        duracion: mockTranscription.duration,
        nombreArchivo: mockFileName,
      });
    });

    it('should throw error if voice not found', async () => {
      (s3Service.uploadAudio as jest.Mock).mockResolvedValue(mockS3Upload);
      (transcribeService.transcribeAudio as jest.Mock).mockResolvedValue(mockTranscription);
      (pollyService.getVoiceById as jest.Mock).mockResolvedValue(null);

      await expect(
        audioService.processAudioRecording(mockAudioBuffer, mockFileName, mockVoiceId)
      ).rejects.toThrow('Voice with ID Miguel not found');
    });
  });

  describe('getAllRecordings', () => {
    it('should return paginated recordings', async () => {
      // Create test recordings
      await AudioRecordingModel.create({
        fecha: new Date(),
        audioOriginalUrl: 'https://test.com/original.mp3',
        audioConAccentoUrl: 'https://test.com/accent.mp3',
        transcripcion: 'Test transcription',
        idiomaDetectado: 'es-ES',
        vozSeleccionada: mockVoiceInfo,
        duracion: 5,
        nombreArchivo: 'test.webm',
      });

      const result = await audioService.getAllRecordings(1, 10);

      expect(result.recordings).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
    });
  });

  describe('regenerateWithDifferentVoice', () => {
    it('should regenerate audio with new voice', async () => {
      // Create a recording
      const recording = await AudioRecordingModel.create({
        fecha: new Date(),
        audioOriginalUrl: 'https://test.com/original.mp3',
        audioConAccentoUrl: 'https://test.com/accent.mp3',
        transcripcion: 'Test transcription',
        idiomaDetectado: 'es-ES',
        vozSeleccionada: mockVoiceInfo,
        duracion: 5,
        nombreArchivo: 'test.webm',
      });

      const newVoiceId = 'Conchita';
      const newVoiceInfo = {
        id: 'Conchita',
        name: 'Conchita',
        languageCode: 'es-ES',
        languageName: 'Spanish (Spain)',
        gender: 'Female',
      };

      (pollyService.getVoiceById as jest.Mock).mockResolvedValue(newVoiceInfo);
      (pollyService.synthesizeSpeech as jest.Mock).mockResolvedValue({
        audioUrl: 'https://test.com/new-accent.mp3',
      });

      const result = await audioService.regenerateWithDifferentVoice(
        recording._id.toString(),
        newVoiceId
      );

      expect(result.vozSeleccionada.id).toBe(newVoiceId);
      expect(result.audioConAccentoUrl).toBe('https://test.com/new-accent.mp3');
    });
  });
});

// Type the mock
const mockSynthesis: SynthesisResult = {
  audioUrl: 'https://test.com/new-accent.mp3',
};

(pollyService.synthesizeSpeech as jest.Mock<Promise<SynthesisResult>>).mockResolvedValue(mockSynthesis);