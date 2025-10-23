/**
 * Audio Recorder - Pure JavaScript
 * Handles audio recording, transcription, and voice synthesis
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔵 DOM loaded, initializing recorder...');

// API Configuration
const API_BASE = '/api';

// State
const state = {
    mediaRecorder: null,
    audioChunks: [],
    startTime: 0,
    timerInterval: null,
    isPaused: false,
    recordedBlob: null,
    transcription: '',
    detectedLanguage: '',
    selectedVoiceId: '',
    synthesizedAudioUrl: '',
};

// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const timer = document.getElementById('timer');
const audioPlayback = document.getElementById('audioPlayback');
const audioPlaybackSection = document.getElementById('audioPlaybackSection');
const statusDisplay = document.getElementById('statusDisplay');
const transcriptionSection = document.getElementById('transcriptionSection');
const transcriptionText = document.getElementById('transcriptionText');
const voiceSelectionSection = document.getElementById('voiceSelectionSection');
const voiceSelector = document.getElementById('voiceSelector');
const languageFilter = document.getElementById('languageFilter');
const synthesizeBtn = document.getElementById('synthesizeBtn');
const synthesizedSection = document.getElementById('synthesizedSection');
const synthesizedAudio = document.getElementById('synthesizedAudio');
const saveBtn = document.getElementById('saveBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadingText = document.getElementById('loadingText');
const recordingPulse = document.getElementById('recordingPulse');

// Utility Functions
function showStatus(message, type = 'info') {
    const statusText = statusDisplay.querySelector('p');
    statusText.textContent = message;
    statusDisplay.classList.remove('hidden', 'bg-blue-50', 'border-blue-200', 'bg-green-50', 'border-green-200', 'bg-red-50', 'border-red-200');
    statusDisplay.classList.add(
        type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50',
        type === 'success' ? 'border-green-200' : type === 'error' ? 'border-red-200' : 'border-blue-200'
    );
    statusText.classList.remove('text-blue-800', 'text-green-800', 'text-red-800');
    statusText.classList.add(
        type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800'
    );
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function showLoading(message) {
    loadingText.textContent = message;
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Timer Functions
function startTimer() {
    state.startTime = Date.now();
    state.timerInterval = window.setInterval(() => {
        if (!state.isPaused) {
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            timer.textContent = formatTime(elapsed);
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function resetTimer() {
    timer.textContent = '00:00';
}

// Recording Functions
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        state.mediaRecorder = new MediaRecorder(stream);
        state.audioChunks = [];

        state.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                state.audioChunks.push(event.data);
            }
        };

        state.mediaRecorder.onstop = () => {
            console.log('🎬 MediaRecorder stopped, creating blob...');
            const blob = new Blob(state.audioChunks, { type: 'audio/webm' });
            state.recordedBlob = blob;
            console.log('✅ Blob created:', blob.size, 'bytes');
            
            const url = URL.createObjectURL(blob);
            audioPlayback.src = url;
            audioPlaybackSection.classList.remove('hidden');

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            // Process the recording now that blob is ready
            console.log('🔄 Processing recording...');
            processRecording();
        };

        state.mediaRecorder.start();
        startTimer();

        // UI Updates
        recordBtn.innerHTML = '<i class="fas fa-microphone-slash text-5xl"></i>';
        recordBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        recordBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
        recordingPulse.classList.remove('opacity-0');
        recordingPulse.classList.add('opacity-75');

        showStatus('Recording in progress...', 'info');
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showStatus('Failed to access microphone. Please check permissions.', 'error');
    }
}

function stopRecording() {
    console.log('🛑 Stop button pressed');
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
        console.log('🎬 Stopping MediaRecorder...');
        state.mediaRecorder.stop();
        stopTimer();

        // UI Updates
        recordBtn.innerHTML = '<i class="fas fa-microphone text-5xl"></i>';
        recordBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        recordBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        stopBtn.disabled = true;
        pauseBtn.disabled = true;
        recordingPulse.classList.remove('opacity-75');
        recordingPulse.classList.add('opacity-0');

        showStatus('Recording stopped. Processing audio...', 'success');
        
        // Note: processRecording() is now called in onstop event handler
    }
}

function pauseRecording() {
    if (state.mediaRecorder) {
        if (state.isPaused) {
            state.mediaRecorder.resume();
            state.isPaused = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause';
            showStatus('Recording resumed', 'info');
        } else {
            state.mediaRecorder.pause();
            state.isPaused = true;
            pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Resume';
            showStatus('Recording paused', 'info');
        }
    }
}

async function processRecording() {
    console.log('📝 processRecording called');
    console.log('📝 state.recordedBlob:', state.recordedBlob);
    console.log('📝 blob size:', state.recordedBlob?.size);
    
    if (!state.recordedBlob) {
        console.error('❌ No recording blob found!');
        showStatus('No recording found', 'error');
        return;
    }

    try {
        console.log('✅ Recording blob exists, uploading for transcription...');
        showLoading('Uploading and transcribing audio...');

        // Upload audio for transcription
        const formData = new FormData();
        formData.append('audio', state.recordedBlob, 'recording.webm');
        
        console.log('📤 Uploading audio to /api/audio/transcribe...');
        const transcribeResponse = await fetch(`${API_BASE}/audio/transcribe`, {
            method: 'POST',
            body: formData,
        });

        console.log('📥 Response status:', transcribeResponse.status);
        const transcribeData = await transcribeResponse.json();
        console.log('📥 Response data:', transcribeData);

        if (transcribeData.success && transcribeData.data) {
            console.log('✅ Transcription successful!');
            state.transcription = transcribeData.data.transcription;
            state.detectedLanguage = transcribeData.data.detectedLanguage;
            
            console.log('📝 Transcription:', state.transcription);
            console.log('🌐 Detected language:', state.detectedLanguage);
            
            transcriptionText.textContent = state.transcription;
            transcriptionSection.classList.remove('hidden');
            
            // Load voices for the detected language
            console.log('🎤 Loading voices for language:', state.detectedLanguage);
            await loadVoices(state.detectedLanguage);
            voiceSelectionSection.classList.remove('hidden');
            
            hideLoading();
            showStatus('Audio transcribed successfully!', 'success');
        } else {
            console.error('❌ Transcription failed:', transcribeData.error);
            hideLoading();
            showStatus(transcribeData.error || 'Failed to transcribe audio', 'error');
        }

    } catch (error) {
        hideLoading();
        console.error('❌ Error processing recording:', error);
        showStatus('Failed to process recording: ' + error.message, 'error');
    }
}

async function loadVoices(languageCode) {
    try {
        console.log('🔍 Loading voices for language:', languageCode);
        const url = languageCode 
            ? `${API_BASE}/audio/voices/available?languageCode=${languageCode}`
            : `${API_BASE}/audio/voices/available`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            const voices = data.data;
            console.log('✅ Loaded', voices.length, 'voices');
            
            // Populate language filter (only if loading all languages)
            if (!languageCode) {
                const languages = [...new Set(voices.map(v => v.languageCode))];
                languageFilter.innerHTML = '<option value="">All Languages</option>';
                languages.forEach(lang => {
                    const option = document.createElement('option');
                    option.value = lang;
                    const voice = voices.find(v => v.languageCode === lang);
                    option.textContent = voice?.languageName || lang;
                    languageFilter.appendChild(option);
                });
            } else {
                // Set the filter to the selected language
                languageFilter.value = languageCode;
            }

            // Populate voice selector
            voiceSelector.innerHTML = '<option value="">Select a voice...</option>';
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.id;
                option.textContent = `${voice.name} (${voice.languageName}) - ${voice.gender}`;
                voiceSelector.appendChild(option);
            });

            console.log('✅ Voice selector populated with', voices.length, 'voices');
            synthesizeBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error loading voices:', error);
        showStatus('Failed to load voices', 'error');
    }
}

async function synthesizeSpeech() {
    const voiceId = voiceSelector.value;
    
    if (!voiceId) {
        showStatus('Please select a voice', 'error');
        return;
    }

    if (!state.transcription) {
        showStatus('No transcription available', 'error');
        return;
    }

    try {
        console.log('🎤 Synthesizing speech...');
        console.log('   Voice ID:', voiceId);
        console.log('   Transcription:', state.transcription.substring(0, 50) + '...');
        
        showLoading('Synthesizing speech with selected voice...');
        state.selectedVoiceId = voiceId;

        const response = await fetch(`${API_BASE}/audio/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: state.transcription,
                voiceId: voiceId,
            }),
        });

        console.log('📥 Synthesis response status:', response.status);
        const data = await response.json();
        console.log('📥 Synthesis response data:', data);

        if (data.success) {
            hideLoading();
            state.synthesizedAudioUrl = data.data.audioUrl;
            synthesizedAudio.src = state.synthesizedAudioUrl;
            synthesizedSection.classList.remove('hidden');
            showStatus('Speech synthesized successfully!', 'success');
            console.log('✅ Synthesis successful! Audio URL:', state.synthesizedAudioUrl);
            
            // Now save the complete recording
            saveCompleteRecording(voiceId, data.data.audioUrl);
        } else {
            hideLoading();
            console.error('❌ Synthesis failed:', data.error);
            showStatus(data.error || 'Failed to synthesize speech', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('❌ Error synthesizing speech:', error);
        showStatus('Failed to synthesize speech: ' + error.message, 'error');
    }
}

async function saveCompleteRecording(voiceId, synthesizedAudioUrl) {
    try {
        console.log('💾 Saving complete recording...');
        
        const formData = new FormData();
        formData.append('audio', state.recordedBlob, 'recording.webm');
        formData.append('voiceId', voiceId);
        formData.append('transcription', state.transcription);
        formData.append('detectedLanguage', state.detectedLanguage);
        formData.append('synthesizedAudioUrl', synthesizedAudioUrl);

        const response = await fetch(`${API_BASE}/audio/save`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Recording saved to database');
            showStatus('Recording saved successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/history.html';
            }, 2000);
        } else {
            console.error('❌ Failed to save recording:', data.error);
            showStatus('Speech synthesized but failed to save', 'error');
        }
    } catch (error) {
        console.error('❌ Error saving recording:', error);
        showStatus('Speech synthesized but failed to save', 'error');
    }
}

// Event Listeners
console.log('🔧 Setting up event listeners...');
console.log('🔧 recordBtn element:', recordBtn);
console.log('🔧 stopBtn element:', stopBtn);
console.log('🔧 pauseBtn element:', pauseBtn);

recordBtn.addEventListener('click', () => {
    console.log('🖱️ Record button clicked!');
    console.log('🎤 Current state:', state.mediaRecorder?.state);
    
    if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
        console.log('🛑 Stopping recording...');
        stopRecording();
    } else {
        console.log('▶️ Starting new recording...');
        // Reset state for new recording
        state.audioChunks = [];
        state.recordedBlob = null;
        resetTimer();
        audioPlaybackSection.classList.add('hidden');
        transcriptionSection.classList.add('hidden');
        voiceSelectionSection.classList.add('hidden');
        synthesizedSection.classList.add('hidden');
        startRecording();
    }
});

console.log('✅ Record button listener attached');

stopBtn.addEventListener('click', stopRecording);
pauseBtn.addEventListener('click', pauseRecording);
synthesizeBtn.addEventListener('click', synthesizeSpeech);

languageFilter.addEventListener('change', (e) => {
    const languageCode = e.target.value;
    loadVoices(languageCode || undefined);
});

saveBtn.addEventListener('click', () => {
    showStatus('Recording already saved!', 'success');
    setTimeout(() => {
        window.location.href = '/history.html';
    }, 1500);
});

// Initialize
console.log('✅ Audio Recorder initialized');
console.log('✅ recordBtn:', recordBtn);
console.log('✅ Event listeners attached');

}); // End of DOMContentLoaded