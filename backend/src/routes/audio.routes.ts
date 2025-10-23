import { Router } from 'express';
import audioController from '../controllers/audio.controller';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @route   POST /api/audio/upload
 * @desc    Upload and process audio recording
 * @access  Public
 */
router.post(
  '/upload',
  upload.single('audio'),
  audioController.uploadRecording
);

/**
 * @route   POST /api/audio/transcribe
 * @desc    Transcribe audio without synthesis
 * @access  Public
 */
router.post(
  '/transcribe',
  upload.single('audio'),
  audioController.transcribeAudio
);

/**
 * @route   POST /api/audio/synthesize
 * @desc    Synthesize speech from text
 * @access  Public
 */
router.post('/synthesize', audioController.synthesizeSpeech);

/**
 * @route   POST /api/audio/save
 * @desc    Save complete recording to database
 * @access  Public
 */
router.post(
  '/save',
  upload.single('audio'),
  audioController.saveRecording
);

/**
 * @route   GET /api/audio
 * @desc    Get all recordings with pagination
 * @access  Public
 */
router.get('/', audioController.getRecordings);

/**
 * @route   GET /api/audio/:id
 * @desc    Get recording by ID
 * @access  Public
 */
router.get('/:id', audioController.getRecordingById);

/**
 * @route   DELETE /api/audio/:id
 * @desc    Delete recording
 * @access  Public
 */
router.delete('/:id', audioController.deleteRecording);

/**
 * @route   POST /api/audio/:id/regenerate
 * @desc    Regenerate audio with different voice
 * @access  Public
 */
router.post('/:id/regenerate', audioController.regenerateAudio);

/**
 * @route   GET /api/audio/:id/download
 * @desc    Download synthesized audio (proxy to avoid CORS)
 * @access  Public
 */
router.get('/:id/download', audioController.downloadAudio);

/**
 * @route   GET /api/voices
 * @desc    Get available Polly voices
 * @access  Public
 */
router.get('/voices/available', audioController.getVoices);

export default router;