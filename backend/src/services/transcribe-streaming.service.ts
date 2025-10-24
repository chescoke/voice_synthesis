import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  LanguageCode,
  MediaEncoding,
  TranscriptResultStream,
} from '@aws-sdk/client-transcribe-streaming';
import config from '../config';
import { PassThrough } from 'stream';

export class TranscribeStreamingService {
  private client: TranscribeStreamingClient;

  constructor() {
    this.client = new TranscribeStreamingClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      maxAttempts: 3,
    });
  }

  /**
   * Create a streaming transcription session
   */
  async createStreamingSession(
    languageCode: LanguageCode = 'es-ES',
    sampleRate: number = 16000
  ): Promise<{
    audioStream: PassThrough;
    transcriptStream: AsyncIterable<TranscriptResultStream>;
  }> {
    const audioStream = new PassThrough();

    const audioGenerator = async function* () {
      try {
        for await (const chunk of audioStream) {
          if (chunk && chunk.length > 0) {
            yield { AudioEvent: { AudioChunk: chunk } };
          }
        }
      } catch (error) {
        console.error('Error in audio generator:', error);
        throw error;
      }
    };

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: languageCode,
      MediaEncoding: MediaEncoding.PCM,
      MediaSampleRateHertz: sampleRate,
      AudioStream: audioGenerator(),
      // ✅ CORREGIDO: Eliminar NumberOfChannels y EnableChannelIdentification
      // AWS Transcribe asume mono (1 canal) por defecto cuando no se especifica
    });

    try {
      console.log(`🔄 Starting AWS Transcribe stream for language: ${languageCode}`);
      
      const response = await this.client.send(command);
      
      if (!response.TranscriptResultStream) {
        throw new Error('No transcript stream received from AWS Transcribe');
      }

      console.log('✅ AWS Transcribe stream started successfully');

      return {
        audioStream,
        transcriptStream: response.TranscriptResultStream,
      };
    } catch (error: any) {
      console.error('❌ Error creating streaming session:', error);
      
      if (error.name === 'InvalidArgumentException') {
        throw new Error('Invalid audio format or configuration for AWS Transcribe');
      } else if (error.name === 'LimitExceededException') {
        throw new Error('AWS Transcribe limit exceeded. Please try again later.');
      } else if (error.name === 'BadRequestException') {
        throw new Error('Bad request to AWS Transcribe. Check audio format.');
      } else if (error.name === 'UnrecognizedClientException') {
        throw new Error('Invalid AWS credentials');
      } else {
        throw new Error(`AWS Transcribe error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Process transcript results from the stream
   */
  async *processTranscriptStream(
    transcriptStream: AsyncIterable<TranscriptResultStream>
  ): AsyncGenerator<{
    isPartial: boolean;
    transcript: string;
    confidence?: number;
  }> {
    try {
      for await (const event of transcriptStream) {
        if (event.TranscriptEvent?.Transcript?.Results) {
          for (const result of event.TranscriptEvent.Transcript.Results) {
            if (result.Alternatives && result.Alternatives.length > 0) {
              const alternative = result.Alternatives[0];
              
              const transcript = alternative.Transcript || '';
              
              if (transcript.trim().length > 0) {
                yield {
                  isPartial: result.IsPartial || false,
                  transcript: transcript,
                  confidence: alternative.Items?.[0]?.Confidence,
                };
              }
            }
          }
        }
        
        if (event.BadRequestException) {
          console.error('BadRequestException from AWS:', event.BadRequestException);
          throw new Error('Bad request from AWS Transcribe');
        }
        
        if (event.LimitExceededException) {
          console.error('LimitExceededException from AWS:', event.LimitExceededException);
          throw new Error('AWS Transcribe limit exceeded');
        }
        
        if (event.InternalFailureException) {
          console.error('InternalFailureException from AWS:', event.InternalFailureException);
          throw new Error('AWS Transcribe internal failure');
        }
      }
    } catch (error: any) {
      console.error('❌ Error processing transcript stream:', error);
      
      if (error.message?.includes('stream closed') || 
          error.message?.includes('aborted') ||
          error.name === 'AbortError') {
        console.log('ℹ️  Stream closed normally');
        return;
      }
      
      throw error;
    }
  }

  /**
   * Detect language from audio chunk
   */
  detectLanguage(transcript: string): LanguageCode {
    const spanishWords = ['el', 'la', 'de', 'que', 'en', 'y', 'a', 'los', 'se', 'del'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it'];
    
    const lowerTranscript = transcript.toLowerCase();
    
    let spanishScore = 0;
    let englishScore = 0;
    
    spanishWords.forEach(word => {
      if (lowerTranscript.includes(` ${word} `)) spanishScore++;
    });
    
    englishWords.forEach(word => {
      if (lowerTranscript.includes(` ${word} `)) englishScore++;
    });
    
    return spanishScore > englishScore ? 'es-ES' : 'en-US';
  }
}

export default new TranscribeStreamingService();