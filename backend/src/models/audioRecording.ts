import mongoose, { Schema, Document } from 'mongoose';
import { AudioRecording, VoiceInfo } from '../types';

export interface IAudioRecording extends Document, Omit<AudioRecording, '_id'> {}

const VoiceInfoSchema = new Schema<VoiceInfo>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  languageCode: { type: String, required: true },
  languageName: { type: String, required: true },
  gender: { type: String, required: true },
  engine: { type: String },
}, { _id: false });

const AudioRecordingSchema = new Schema<IAudioRecording>(
  {
    fecha: {
      type: Date,
      required: true,
      default: Date.now,
    },
    audioOriginalUrl: {
      type: String,
      required: true,
    },
    audioConAccentoUrl: {
      type: String,
      required: true,
    },
    transcripcion: {
      type: String,
      required: true,
    },
    idiomaDetectado: {
      type: String,
      required: true,
    },
    vozSeleccionada: {
      type: VoiceInfoSchema,
      required: true,
    },
    duracion: {
      type: Number,
      required: true,
    },
    nombreArchivo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
AudioRecordingSchema.index({ fecha: -1 });
AudioRecordingSchema.index({ idiomaDetectado: 1 });
AudioRecordingSchema.index({ createdAt: -1 });

export const AudioRecordingModel = mongoose.model<IAudioRecording>(
  'AudioRecording',
  AudioRecordingSchema
);