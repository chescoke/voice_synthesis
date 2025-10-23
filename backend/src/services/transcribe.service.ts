import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  TranscriptionJob,
  LanguageCode,
} from '@aws-sdk/client-transcribe';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { TranscriptionResult } from '../types';
import axios from 'axios';

export class TranscribeService {
  private transcribeClient: TranscribeClient;

  constructor() {
    this.transcribeClient = new TranscribeClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  /**
   * Transcribe audio file from S3
   */
  async transcribeAudio(s3Uri: string): Promise<TranscriptionResult> {
    try {
      const jobName = `transcription-${uuidv4()}`;

      // Start transcription job
      const startCommand = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: LanguageCode.ES_ES, // Auto-detect or specify
        MediaFormat: 'mp3',
        Media: {
          MediaFileUri: s3Uri,
        },
        Settings: {
          ShowSpeakerLabels: false,
        },
      });

      await this.transcribeClient.send(startCommand);

      // Poll for completion
      const result = await this.pollTranscriptionJob(jobName);

      return result;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error}`);
    }
  }

  /**
   * Poll transcription job until complete
   */
  private async pollTranscriptionJob(
    jobName: string,
    maxAttempts: number = 60,
    delayMs: number = 5000
  ): Promise<TranscriptionResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      });

      const response = await this.transcribeClient.send(command);
      const job = response.TranscriptionJob;

      if (!job) {
        throw new Error('Transcription job not found');
      }

      if (job.TranscriptionJobStatus === 'COMPLETED') {
        return await this.parseTranscriptionResult(job);
      }

      if (job.TranscriptionJobStatus === 'FAILED') {
        throw new Error(
          `Transcription failed: ${job.FailureReason || 'Unknown error'}`
        );
      }

      // Wait before next poll
      await this.delay(delayMs);
    }

    throw new Error('Transcription job timed out');
  }

  /**
   * Parse transcription result from completed job
   */
  private async parseTranscriptionResult(
    job: TranscriptionJob
  ): Promise<TranscriptionResult> {
    if (!job.Transcript?.TranscriptFileUri) {
      throw new Error('No transcript file URI in job result');
    }

    // Download transcript JSON
    const response = await axios.get(job.Transcript.TranscriptFileUri);
    const transcript = response.data;

    return {
      transcription: transcript.results.transcripts[0].transcript,
      languageCode: job.LanguageCode || 'es-ES',
      duration: transcript.results?.audio_segments?.[0]?.end_time,
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TranscribeService();