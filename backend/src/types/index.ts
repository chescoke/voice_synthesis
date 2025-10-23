export interface AudioRecording {
  _id?: string;
  fecha: Date;
  audioOriginalUrl: string;
  audioConAccentoUrl: string;
  transcripcion: string;
  idiomaDetectado: string;
  vozSeleccionada: VoiceInfo;
  duracion: number;
  nombreArchivo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VoiceInfo {
  id: string;
  name: string;
  languageCode: string;
  languageName: string;
  gender: string;
  engine?: string;
}

export interface PollyVoice {
  Id: string;
  Name: string;
  LanguageCode: string;
  LanguageName: string;
  Gender: string;
  SupportedEngines?: string[];
}

export interface TranscriptionResult {
  transcription: string;
  languageCode: string;
  duration?: number;
}

export interface SynthesisResult {
  audioUrl: string;
  duration?: number;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RecordingRequest {
  audioFile: Express.Multer.File;
  voiceId?: string;
}

export interface RegenerateRequest {
  recordingId: string;
  voiceId: string;
}