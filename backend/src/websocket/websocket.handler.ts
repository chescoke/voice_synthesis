import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import transcribeStreamingService from '../services/transcribe-streaming.service';
import { PassThrough } from 'stream';
import { LanguageCode } from '@aws-sdk/client-transcribe-streaming';

interface AudioStreamSession {
  audioStream: PassThrough;
  fullTranscript: string;
  isActive: boolean;
}

export class WebSocketHandler {
  private io: SocketIOServer;
  private sessions: Map<string, AudioStreamSession> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      maxHttpBufferSize: 1e8, // 100 MB
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      socket.on('start-transcription', async (data: { languageCode?: LanguageCode }) => {
        await this.handleStartTranscription(socket, data);
      });

      socket.on('audio-chunk', (audioChunk: ArrayBuffer) => {
        this.handleAudioChunk(socket, audioChunk);
      });

      socket.on('stop-transcription', () => {
        this.handleStopTranscription(socket);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        this.handleStopTranscription(socket);
      });

      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
        this.handleStopTranscription(socket);
      });
    });
  }

  private async handleStartTranscription(
    socket: Socket,
    data: { languageCode?: LanguageCode }
  ): Promise<void> {
    try {
      console.log(`🎤 Starting transcription for ${socket.id}`);
      
      const languageCode = data.languageCode || 'es-ES';
      
      // Create AWS Transcribe streaming session
      const { audioStream, transcriptStream } = 
        await transcribeStreamingService.createStreamingSession(languageCode);

      // Store session
      this.sessions.set(socket.id, {
        audioStream,
        fullTranscript: '',
        isActive: true,
      });

      // Process transcript stream
      this.processTranscriptStream(socket, transcriptStream);

      socket.emit('transcription-started', { 
        success: true,
        languageCode 
      });

      console.log(`✅ Transcription started for ${socket.id}`);
    } catch (error) {
      console.error(`❌ Error starting transcription for ${socket.id}:`, error);
      socket.emit('transcription-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async processTranscriptStream(
    socket: Socket,
    transcriptStream: AsyncIterable<any>
  ): Promise<void> {
    try {
      const session = this.sessions.get(socket.id);
      if (!session) return;

      for await (const result of transcribeStreamingService.processTranscriptStream(transcriptStream)) {
        if (!session.isActive) break;

        // Send transcript to client
        socket.emit('transcript-update', {
          transcript: result.transcript,
          isPartial: result.isPartial,
          confidence: result.confidence,
        });

        // Update full transcript only for final results
        if (!result.isPartial) {
          session.fullTranscript += (session.fullTranscript ? ' ' : '') + result.transcript;
        }

        console.log(`📝 Transcript (${result.isPartial ? 'partial' : 'final'}): ${result.transcript}`);
      }
    } catch (error) {
      console.error(`❌ Error processing transcript stream for ${socket.id}:`, error);
      socket.emit('transcription-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private handleAudioChunk(socket: Socket, audioChunk: ArrayBuffer): void {
    try {
      const session = this.sessions.get(socket.id);
      
      if (!session || !session.isActive) {
        console.warn(`⚠️  No active session for ${socket.id}`);
        return;
      }

      // Convert ArrayBuffer to Buffer and write to stream
      const buffer = Buffer.from(audioChunk);
      session.audioStream.write(buffer);

    } catch (error) {
      console.error(`❌ Error handling audio chunk for ${socket.id}:`, error);
      socket.emit('transcription-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private handleStopTranscription(socket: Socket): void {
    try {
      const session = this.sessions.get(socket.id);
      
      if (!session) {
        return;
      }

      console.log(`🛑 Stopping transcription for ${socket.id}`);
      
      // Mark session as inactive
      session.isActive = false;

      // End the audio stream
      session.audioStream.end();

      // Send final transcript to client
      socket.emit('transcription-complete', {
        fullTranscript: session.fullTranscript,
      });

      // Clean up session
      this.sessions.delete(socket.id);

      console.log(`✅ Transcription stopped for ${socket.id}`);
    } catch (error) {
      console.error(`❌ Error stopping transcription for ${socket.id}:`, error);
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}