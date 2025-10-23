import {
  PollyClient,
  DescribeVoicesCommand,
  SynthesizeSpeechCommand,
  Voice,
  Engine,
  OutputFormat
} from '@aws-sdk/client-polly';
import { Readable } from 'stream';
import config from '../config';
import { SynthesisResult, VoiceInfo } from '../types';
import s3Service from './s3.service';

export class PollyService {
  private pollyClient: PollyClient;

  constructor() {
    this.pollyClient = new PollyClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  /**
   * Get all available voices from AWS Polly
   */
  async getAvailableVoices(languageCode?: string): Promise<VoiceInfo[]> {
    try {
      const command = new DescribeVoicesCommand({
        Engine: Engine.STANDARD,
        LanguageCode: languageCode as any, // Cast to any to bypass type error, or use LanguageCode type if imported
      });

      const response = await this.pollyClient.send(command);
      const voices = response.Voices || [];

      return voices.map((voice: Voice) => ({
        id: voice.Id || '',
        name: voice.Name || '',
        languageCode: voice.LanguageCode || '',
        languageName: voice.LanguageName || '',
        gender: voice.Gender || '',
        engine: voice.SupportedEngines?.[0],
      }));
    } catch (error) {
      console.error('Error getting Polly voices:', error);
      throw new Error(`Failed to get available voices: ${error}`);
    }
  }

  /**
   * Synthesize speech from text
   */
  async synthesizeSpeech(
    text: string,
    voiceId: string,
    engine: Engine = Engine.STANDARD
  ): Promise<SynthesisResult> {
    try {
      const command = new SynthesizeSpeechCommand({
        Text: text,
        VoiceId: voiceId as any, // Cast to any to bypass type error, or use VoiceId type if imported
        OutputFormat: OutputFormat.MP3,
        Engine: engine,
      });

      const response = await this.pollyClient.send(command);

      if (!response.AudioStream) {
        throw new Error('No audio stream in Polly response');
      }

      // Convert audio stream to buffer
      const audioBuffer = await this.streamToBuffer(
        response.AudioStream as Readable
      );

      // Upload to S3
      const fileName = `synthesized-${voiceId}-${Date.now()}.mp3`;
      const uploadResult = await s3Service.uploadAudio(
        audioBuffer,
        fileName,
        'audio/mpeg'
      );

      return {
        audioUrl: uploadResult.url,
      };
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw new Error(`Failed to synthesize speech: ${error}`);
    }
  }

  /**
   * Get voice information by ID
   */
  async getVoiceById(voiceId: string): Promise<VoiceInfo | null> {
    try {
      const voices = await this.getAvailableVoices();
      return voices.find(voice => voice.id === voiceId) || null;
    } catch (error) {
      console.error('Error getting voice by ID:', error);
      return null;
    }
  }

  /**
   * Filter voices by language
   */
  async getVoicesByLanguage(languageCode: string): Promise<VoiceInfo[]> {
    try {
      return await this.getAvailableVoices(languageCode);
    } catch (error) {
      console.error('Error filtering voices by language:', error);
      throw new Error(`Failed to filter voices by language: ${error}`);
    }
  }

  /**
   * Convert Readable stream to Buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

export default new PollyService();