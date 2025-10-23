import { Request, Response } from 'express';
import audioService from '../services/audio.service';
import { ApiResponse } from '../types';

export class AudioController {
  /**
   * Upload and process audio recording
   */
  async uploadRecording(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No audio file provided',
        } as ApiResponse);
        return;
      }

      const { voiceId } = req.body;

      if (!voiceId) {
        res.status(400).json({
          success: false,
          error: 'Voice ID is required',
        } as ApiResponse);
        return;
      }

      const recording = await audioService.processAudioRecording(
        req.file.buffer,
        req.file.originalname,
        voiceId
      );

      res.status(201).json({
        success: true,
        data: recording,
        message: 'Audio processed successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error in uploadRecording:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Transcribe audio without synthesis
   */
  async transcribeAudio(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎤 transcribeAudio endpoint called');
      
      if (!req.file) {
        console.error('❌ No audio file provided');
        res.status(400).json({
          success: false,
          error: 'No audio file provided',
        } as ApiResponse);
        return;
      }

      console.log('📁 File received:', {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      console.log('🔄 Calling transcription service...');
      const result = await audioService.transcribeAudioOnly(
        req.file.buffer,
        req.file.originalname
      );

      console.log('✅ Transcription successful:', {
        transcription: result.transcription.substring(0, 50) + '...',
        language: result.detectedLanguage
      });

      res.status(200).json({
        success: true,
        data: {
          transcription: result.transcription,
          detectedLanguage: result.detectedLanguage,
        },
        message: 'Audio transcribed successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error in transcribeAudio:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(req: Request, res: Response): Promise<void> {
    try {
      console.log('🗣️  synthesizeSpeech endpoint called');
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      
      const { text, voiceId } = req.body;

      if (!text) {
        console.error('❌ No text provided');
        res.status(400).json({
          success: false,
          error: 'Text is required',
        } as ApiResponse);
        return;
      }

      if (!voiceId) {
        console.error('❌ No voiceId provided');
        res.status(400).json({
          success: false,
          error: 'Voice ID is required',
        } as ApiResponse);
        return;
      }

      console.log('📝 Text length:', text.length);
      console.log('🎤 Voice ID:', voiceId);
      console.log('🔄 Calling synthesis service...');

      const result = await audioService.synthesizeSpeechOnly(text, voiceId);

      console.log('✅ Synthesis successful:', {
        audioUrl: result.audioUrl,
      });

      res.status(200).json({
        success: true,
        data: {
          audioUrl: result.audioUrl,
        },
        message: 'Speech synthesized successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error in synthesizeSpeech:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Save complete recording to database
   */
  async saveRecording(req: Request, res: Response): Promise<void> {
    try {
      console.log('💾 saveRecording endpoint called');
      
      if (!req.file) {
        console.error('❌ No audio file provided');
        res.status(400).json({
          success: false,
          error: 'No audio file provided',
        } as ApiResponse);
        return;
      }

      const { voiceId, transcription, detectedLanguage, synthesizedAudioUrl } = req.body;

      console.log('📦 Request data:', {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        voiceId,
        transcriptionLength: transcription?.length,
        detectedLanguage,
        synthesizedAudioUrl: synthesizedAudioUrl?.substring(0, 50) + '...',
      });

      if (!voiceId || !transcription || !detectedLanguage || !synthesizedAudioUrl) {
        console.error('❌ Missing required fields');
        res.status(400).json({
          success: false,
          error: 'Missing required fields: voiceId, transcription, detectedLanguage, synthesizedAudioUrl',
        } as ApiResponse);
        return;
      }

      console.log('🔄 Calling save service...');
      const recording = await audioService.saveCompleteRecording(
        req.file.buffer,
        req.file.originalname,
        voiceId,
        transcription,
        detectedLanguage,
        synthesizedAudioUrl
      );

      console.log('✅ Recording saved successfully:', recording._id);

      res.status(201).json({
        success: true,
        data: recording,
        message: 'Recording saved successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error in saveRecording:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Get all recordings with pagination
   */
  async getRecordings(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await audioService.getAllRecordings(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      console.error('Error in getRecordings:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Get recording by ID
   */
  async getRecordingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const recording = await audioService.getRecordingById(id);

      if (!recording) {
        res.status(404).json({
          success: false,
          error: 'Recording not found',
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: recording,
      } as ApiResponse);
    } catch (error) {
      console.error('Error in getRecordingById:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await audioService.deleteRecording(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Recording not found',
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Recording deleted successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error in deleteRecording:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Regenerate audio with different voice
   */
  async regenerateAudio(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { voiceId } = req.body;

      if (!voiceId) {
        res.status(400).json({
          success: false,
          error: 'Voice ID is required',
        } as ApiResponse);
        return;
      }

      const recording = await audioService.regenerateWithDifferentVoice(
        id,
        voiceId
      );

      res.status(200).json({
        success: true,
        data: recording,
        message: 'Audio regenerated successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Error in regenerateAudio:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Download synthesized audio (proxy to avoid CORS)
   */
  async downloadAudio(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('📥 Download request for recording:', id);

      const recording = await audioService.getRecordingById(id);

      if (!recording) {
        res.status(404).json({
          success: false,
          error: 'Recording not found',
        } as ApiResponse);
        return;
      }

      console.log('🔗 Fetching audio from S3:', recording.audioConAccentoUrl);

      // Fetch audio from S3
      const response = await fetch(recording.audioConAccentoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio from S3: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      // Generate filename
      const timestamp = new Date(recording.fecha).getTime();
      const textSnippet = recording.transcripcion
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 10)
        .toLowerCase();
      const voiceName = recording.vozSeleccionada.name.toLowerCase();
      const filename = `${timestamp}_${textSnippet}_${voiceName}.mp3`;

      console.log('✅ Sending audio file:', filename);

      // Set headers for download
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', audioBuffer.byteLength);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Send buffer
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error('❌ Error in downloadAudio:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }

  /**
   * Get available voices
   */
  async getVoices(req: Request, res: Response): Promise<void> {
    try {
      const languageCode = req.query.languageCode as string | undefined;

      const voices = await audioService.getAvailableVoices(languageCode);

      res.status(200).json({
        success: true,
        data: voices,
      } as ApiResponse);
    } catch (error) {
      console.error('Error in getVoices:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ApiResponse);
    }
  }
}

export default new AudioController();