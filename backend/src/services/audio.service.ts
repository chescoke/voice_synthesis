import { AudioRecordingModel } from '../models/audioRecording';
import s3Service from './s3.service';
import transcribeService from './transcribe.service';
import pollyService from './polly.service';
import { AudioRecording, VoiceInfo } from '../types';

export class AudioService {
  /**
   * Process audio recording: upload, transcribe, and synthesize
   */
  async processAudioRecording(
    audioBuffer: Buffer,
    fileName: string,
    voiceId: string
  ): Promise<AudioRecording> {
    try {
      // 1. Upload original audio to S3
      console.log('📤 Uploading original audio to S3...');
      const originalUpload = await s3Service.uploadAudio(
        audioBuffer,
        fileName,
        'audio/webm'
      );

      // 2. Transcribe audio
      console.log('🎤 Transcribing audio...');
      const transcription = await transcribeService.transcribeAudio(
        originalUpload.url
      );

      // 3. Get voice information
      console.log('🔍 Getting voice information...');
      const voiceInfo = await pollyService.getVoiceById(voiceId);
      
      if (!voiceInfo) {
        throw new Error(`Voice with ID ${voiceId} not found`);
      }

      // 4. Synthesize speech with selected voice
      console.log('🗣️  Synthesizing speech with new accent...');
      const synthesis = await pollyService.synthesizeSpeech(
        transcription.transcription,
        voiceId
      );

      // 5. Save to database
      console.log('💾 Saving to database...');
      const recording = new AudioRecordingModel({
        fecha: new Date(),
        audioOriginalUrl: originalUpload.url,
        audioConAccentoUrl: synthesis.audioUrl,
        transcripcion: transcription.transcription,
        idiomaDetectado: transcription.languageCode,
        vozSeleccionada: voiceInfo,
        duracion: transcription.duration || 0,
        nombreArchivo: fileName,
      });

      await recording.save();

      console.log('✅ Audio processing completed');

      const result = recording.toObject() as { _id: any } & Omit<AudioRecording, '_id'>;
      return { ...result, _id: result._id.toString() };
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio only (without synthesis)
   */
  async transcribeAudioOnly(
    audioBuffer: Buffer,
    fileName: string
  ): Promise<{ transcription: string; detectedLanguage: string }> {
    try {
      console.log('📤 Uploading audio to S3 for transcription...');
      const upload = await s3Service.uploadAudio(
        audioBuffer,
        fileName,
        'audio/webm'
      );

      console.log('🎤 Starting transcription...');
      const transcriptionResult = await transcribeService.transcribeAudio(
        upload.url
      );

      console.log('✅ Transcription completed');

      return {
        transcription: transcriptionResult.transcription,
        detectedLanguage: transcriptionResult.languageCode,
      };
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      throw error;
    }
  }

  /**
   * Synthesize speech only (without saving to database)
   */
  async synthesizeSpeechOnly(
    text: string,
    voiceId: string
  ): Promise<{ audioUrl: string }> {
    try {
      console.log('🗣️  Synthesizing speech...');
      console.log('   Text length:', text.length);
      console.log('   Voice ID:', voiceId);

      const synthesis = await pollyService.synthesizeSpeech(text, voiceId);

      console.log('✅ Speech synthesis completed');
      console.log('   Audio URL:', synthesis.audioUrl);

      return {
        audioUrl: synthesis.audioUrl,
      };
    } catch (error) {
      console.error('❌ Error synthesizing speech:', error);
      throw error;
    }
  }

  /**
   * Save complete recording to database
   */
  async saveCompleteRecording(
    audioBuffer: Buffer,
    fileName: string,
    voiceId: string,
    transcription: string,
    detectedLanguage: string,
    synthesizedAudioUrl: string
  ): Promise<AudioRecording> {
    try {
      console.log('💾 Saving complete recording...');

      // Generate better filename: timestamp + first 5 letters + voice
      const timestamp = Date.now();
      const cleanTranscription = transcription
        .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters and spaces
        .substring(0, 5) // First 5 letters
        .toLowerCase();
      const betterFileName = `${timestamp}_${cleanTranscription}_${voiceId}.webm`;
      
      console.log('📝 Generated filename:', betterFileName);

      // 1. Upload original audio to S3
      console.log('📤 Uploading original audio to S3...');
      const originalUpload = await s3Service.uploadAudio(
        audioBuffer,
        betterFileName,
        'audio/webm'
      );

      // 2. Get voice information
      console.log('🔍 Getting voice information...');
      const voiceInfo = await pollyService.getVoiceById(voiceId);
      
      if (!voiceInfo) {
        throw new Error(`Voice with ID ${voiceId} not found`);
      }

      // 3. Calculate duration (approximate based on audio buffer size)
      // For more accurate duration, you'd need to parse the audio file
      const approximateDuration = Math.floor(audioBuffer.length / 16000); // Rough estimate

      // 4. Save to database
      console.log('💾 Saving to database...');
      const recording = new AudioRecordingModel({
        fecha: new Date(),
        audioOriginalUrl: originalUpload.url,
        audioConAccentoUrl: synthesizedAudioUrl,
        transcripcion: transcription,
        idiomaDetectado: detectedLanguage,
        vozSeleccionada: voiceInfo,
        duracion: approximateDuration,
        nombreArchivo: betterFileName,
      });

      await recording.save();

      console.log('✅ Recording saved successfully');
      console.log('   ID:', recording._id);
      console.log('   Filename:', betterFileName);
      console.log('   Original URL:', originalUpload.url);
      console.log('   Synthesized URL:', synthesizedAudioUrl);

      const result = recording.toObject() as { _id: any } & Omit<AudioRecording, '_id'>;
      return { ...result, _id: result._id.toString() };
    } catch (error) {
      console.error('❌ Error saving recording:', error);
      throw error;
    }
  }

  /**
   * Regenerate audio with a different voice
   */
  async regenerateWithDifferentVoice(
    recordingId: string,
    newVoiceId: string
  ): Promise<AudioRecording> {
    try {
      // Find existing recording
      const recording = await AudioRecordingModel.findById(recordingId);

      if (!recording) {
        throw new Error('Recording not found');
      }

      // Get new voice information
      const voiceInfo = await pollyService.getVoiceById(newVoiceId);
      
      if (!voiceInfo) {
        throw new Error(`Voice with ID ${newVoiceId} not found`);
      }

      // Synthesize with new voice
      console.log('🗣️  Re-synthesizing with new voice...');
      const synthesis = await pollyService.synthesizeSpeech(
        recording.transcripcion,
        newVoiceId
      );

      // Update recording
      recording.audioConAccentoUrl = synthesis.audioUrl;
      recording.vozSeleccionada = voiceInfo;
      await recording.save();

      console.log('✅ Audio regenerated successfully');

      const result = recording.toObject() as { _id: any } & Omit<AudioRecording, '_id'>;
      return { ...result, _id: result._id.toString() };
    } catch (error) {
      console.error('❌ Error regenerating audio:', error);
      throw error;
    }
  }

  /**
   * Get all recordings
   */
  async getAllRecordings(
    page: number = 1,
    limit: number = 10
  ): Promise<{ recordings: AudioRecording[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [recordings, total] = await Promise.all([
        AudioRecordingModel.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AudioRecordingModel.countDocuments(),
      ]);

      return {
        recordings: recordings.map(r => ({ ...r, _id: r._id.toString() })),
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting recordings:', error);
      throw error;
    }
  }

  /**
   * Get recording by ID
   */
  async getRecordingById(id: string): Promise<AudioRecording | null> {
    try {
      const recording = await AudioRecordingModel.findById(id).lean();
      return recording ? { ...recording, _id: recording._id.toString() } : null;
    } catch (error) {
      console.error('Error getting recording:', error);
      throw error;
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(id: string): Promise<boolean> {
    try {
      const result = await AudioRecordingModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  }

  /**
   * Get available voices (with optional language filter)
   */
  async getAvailableVoices(languageCode?: string): Promise<VoiceInfo[]> {
    try {
      return await pollyService.getAvailableVoices(languageCode);
    } catch (error) {
      console.error('Error getting available voices:', error);
      throw error;
    }
  }
}

export default new AudioService();