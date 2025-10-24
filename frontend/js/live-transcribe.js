// Live Transcription Recorder with WebRTC and WebSocket
class LiveTranscriptionRecorder {
    constructor() {
        this.socket = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.mediaStream = null;
        this.processor = null;
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.partialTranscript = '';
        this.finalTranscript = '';
        this.recordedChunks = [];
        this.audioBlob = null;
        
        this.initializeElements();
        this.initializeSocket();
        this.loadVoices();
        this.setupEventListeners();
    }

    initializeElements() {
        // Buttons
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.synthesizeBtn = document.getElementById('synthesizeBtn');
        this.saveBtn = document.getElementById('saveBtn');
        
        // Displays
        this.timer = document.getElementById('timer');
        this.statusDisplay = document.getElementById('statusDisplay');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.connectionDot = document.getElementById('connectionDot');
        this.connectionText = document.getElementById('connectionText');
        this.recordingPulse = document.getElementById('recordingPulse');
        
        // Sections
        this.liveTranscriptionSection = document.getElementById('liveTranscriptionSection');
        this.voiceSelectionSection = document.getElementById('voiceSelectionSection');
        this.synthesizedSection = document.getElementById('synthesizedSection');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Transcription elements
        this.partialTranscriptEl = document.getElementById('partialTranscript');
        this.finalTranscriptEl = document.getElementById('finalTranscript');
        this.completeTranscription = document.getElementById('completeTranscription');
        this.confidenceText = document.getElementById('confidenceText');
        
        // Voice selection
        this.languageFilter = document.getElementById('languageFilter');
        this.voiceSelector = document.getElementById('voiceSelector');
        
        // Audio elements
        this.synthesizedAudio = document.getElementById('synthesizedAudio');
    }

    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('✅ Connected to WebSocket server');
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket server');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('transcription-started', (data) => {
            console.log('🎤 Transcription started:', data);
            this.showStatus('Transcription started', 'success');
        });
        
        this.socket.on('transcript-update', (data) => {
            console.log('📝 Transcript update:', data);
            this.updateTranscription(data);
        });
        
        this.socket.on('transcription-complete', (data) => {
            console.log('✅ Transcription complete:', data);
            this.handleTranscriptionComplete(data);
        });
        
        this.socket.on('transcription-error', (data) => {
            console.error('❌ Transcription error:', data);
            this.showStatus('Error: ' + data.error, 'error');
            this.stopRecording();
        });
    }

    updateConnectionStatus(isConnected) {
        if (isConnected) {
            this.connectionDot.classList.remove('bg-gray-400', 'bg-red-500');
            this.connectionDot.classList.add('bg-green-500');
            this.connectionText.textContent = 'Connected';
            this.connectionText.classList.remove('text-gray-700', 'text-red-700');
            this.connectionText.classList.add('text-green-700');
            this.recordBtn.disabled = false;
        } else {
            this.connectionDot.classList.remove('bg-green-500', 'bg-gray-400');
            this.connectionDot.classList.add('bg-red-500');
            this.connectionText.textContent = 'Disconnected';
            this.connectionText.classList.remove('text-green-700', 'text-gray-700');
            this.connectionText.classList.add('text-red-700');
            this.recordBtn.disabled = true;
        }
    }

    setupEventListeners() {
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.synthesizeBtn.addEventListener('click', () => this.synthesizeSpeech());
        this.saveBtn.addEventListener('click', () => this.saveRecording());
        this.languageFilter.addEventListener('change', () => this.filterVoices());
    }

    async startRecording() {
        try {
            console.log('🎙️ Starting recording...');
            
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });
            
            // Create AudioContext for processing
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });
            
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            // Create ScriptProcessor for real-time audio processing
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
            
            this.processor.onaudioprocess = (e) => {
                if (this.isRecording) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = this.convertToPCM16(inputData);
                    
                    // Send audio chunk to WebSocket
                    if (this.socket && this.socket.connected) {
                        this.socket.emit('audio-chunk', pcmData);
                    }
                }
            };
            
            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);
            
            // Also record the audio for later playback
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start(100); // Collect data every 100ms
            
            // Start transcription via WebSocket
            this.socket.emit('start-transcription', { languageCode: 'es-ES' });
            
            // Update UI
            this.isRecording = true;
            this.startTime = Date.now();
            this.startTimer();
            this.updateUIForRecording();
            this.liveTranscriptionSection.classList.remove('hidden');
            this.partialTranscript = '';
            this.finalTranscript = '';
            this.partialTranscriptEl.textContent = '';
            this.finalTranscriptEl.textContent = '';
            
            this.showStatus('Recording in progress...', 'recording');
            
        } catch (error) {
            console.error('❌ Error starting recording:', error);
            this.showStatus('Error accessing microphone: ' + error.message, 'error');
        }
    }

    convertToPCM16(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);
        
        for (let i = 0; i < float32Array.length; i++) {
            let sample = Math.max(-1, Math.min(1, float32Array[i]));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(i * 2, sample, true);
        }
        
        return buffer;
    }

    stopRecording() {
        console.log('🛑 Stopping recording...');
        
        if (!this.isRecording) return;
        
        this.isRecording = false;
        
        // Stop media recorder
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        // Stop audio processing
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // Stop media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Stop WebSocket transcription
        if (this.socket && this.socket.connected) {
            this.socket.emit('stop-transcription');
        }
        
        // Stop timer
        this.stopTimer();
        
        // Update UI
        this.updateUIForStopped();
        
        // Create audio blob from recorded chunks
        this.audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        
        this.showStatus('Recording stopped. Processing...', 'info');
    }

    updateTranscription(data) {
        if (data.isPartial) {
            // Update partial transcript
            this.partialTranscriptEl.textContent = data.transcript;
        } else {
            // Add to final transcript
            if (data.transcript) {
                this.finalTranscript += (this.finalTranscript ? ' ' : '') + data.transcript;
                this.finalTranscriptEl.textContent = this.finalTranscript;
                this.partialTranscriptEl.textContent = '';
            }
        }
        
        // Update confidence display
        if (data.confidence) {
            const confidencePercent = (data.confidence * 100).toFixed(1);
            this.confidenceText.textContent = `Confidence: ${confidencePercent}%`;
        }
        
        // Auto-scroll to bottom
        this.finalTranscriptEl.scrollTop = this.finalTranscriptEl.scrollHeight;
    }

    handleTranscriptionComplete(data) {
        console.log('✅ Final transcription:', data.fullTranscript);
        
        this.finalTranscript = data.fullTranscript;
        this.finalTranscriptEl.textContent = this.finalTranscript;
        this.completeTranscription.textContent = this.finalTranscript;
        this.partialTranscriptEl.textContent = '';
        
        // Hide transcription indicator
        document.getElementById('transcriptionIndicator').style.display = 'none';
        
        // Show voice selection section
        this.voiceSelectionSection.classList.remove('hidden');
        
        this.showStatus('Transcription complete! Select a voice to synthesize.', 'success');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            this.timer.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateUIForRecording() {
        this.recordBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.recordingPulse.style.opacity = '0.75';
        this.recordBtn.classList.add('scale-110');
    }

    updateUIForStopped() {
        this.recordBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.recordingPulse.style.opacity = '0';
        this.recordBtn.classList.remove('scale-110');
    }

    showStatus(message, type = 'info') {
        const statusText = this.statusDisplay.querySelector('p');
        statusText.textContent = message;
        
        this.statusDisplay.classList.remove('hidden', 'bg-blue-50', 'border-blue-200', 'bg-green-50', 'border-green-200', 'bg-red-50', 'border-red-200', 'bg-yellow-50', 'border-yellow-200');
        statusText.classList.remove('text-blue-800', 'text-green-800', 'text-red-800', 'text-yellow-800');
        
        switch(type) {
            case 'success':
                this.statusDisplay.classList.add('bg-green-50', 'border-green-200');
                statusText.classList.add('text-green-800');
                break;
            case 'error':
                this.statusDisplay.classList.add('bg-red-50', 'border-red-200');
                statusText.classList.add('text-red-800');
                break;
            case 'recording':
                this.statusDisplay.classList.add('bg-yellow-50', 'border-yellow-200');
                statusText.classList.add('text-yellow-800');
                break;
            default:
                this.statusDisplay.classList.add('bg-blue-50', 'border-blue-200');
                statusText.classList.add('text-blue-800');
        }
        
        setTimeout(() => {
            if (type !== 'recording') {
                this.statusDisplay.classList.add('hidden');
            }
        }, 5000);
    }

    async loadVoices() {
        try {
            const response = await fetch('/api/audio/voices/available');
            const data = await response.json();
            
            if (data.success) {
                this.voices = data.data;
                this.populateLanguageFilter();
                this.populateVoiceSelector();
            }
        } catch (error) {
            console.error('Error loading voices:', error);
            this.showStatus('Error loading voices', 'error');
        }
    }

    populateLanguageFilter() {
        const languages = [...new Set(this.voices.map(v => v.LanguageName))].sort();
        
        this.languageFilter.innerHTML = '<option value="">All Languages</option>';
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            this.languageFilter.appendChild(option);
        });
    }

    populateVoiceSelector(filterLanguage = '') {
        const filteredVoices = filterLanguage 
            ? this.voices.filter(v => v.LanguageName === filterLanguage)
            : this.voices;
        
        this.voiceSelector.innerHTML = '<option value="">Select a voice...</option>';
        
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = JSON.stringify(voice);
            option.textContent = `${voice.name} (${voice.gender}) - ${voice.languageName}`;
            this.voiceSelector.appendChild(option);
        });
    }

    filterVoices() {
        const selectedLanguage = this.languageFilter.value;
        this.populateVoiceSelector(selectedLanguage);
    }

    async synthesizeSpeech() {
        try {
            const selectedVoiceData = this.voiceSelector.value;
            
            if (!selectedVoiceData) {
                this.showStatus('Please select a voice', 'error');
                return;
            }
            
            if (!this.finalTranscript) {
                this.showStatus('No transcription available', 'error');
                return;
            }
            
            const voice = JSON.parse(selectedVoiceData);
            
            this.showLoading('Synthesizing speech...');
            
            const response = await fetch('/api/audio/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: this.finalTranscript,
                    voiceId: voice.id,
                }),
            });
            
            const data = await response.json();
            
            this.hideLoading();
            
            if (data.success) {
                this.synthesizedAudioUrl = data.data.audioUrl;
                this.synthesizedAudio.src = this.synthesizedAudioUrl;
                this.synthesizedSection.classList.remove('hidden');
                this.selectedVoice = voice;
                this.showStatus('Speech synthesized successfully!', 'success');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error synthesizing speech:', error);
            this.hideLoading();
            this.showStatus('Error synthesizing speech: ' + error.message, 'error');
        }
    }

    async saveRecording() {
        try {
            if (!this.audioBlob || !this.finalTranscript || !this.synthesizedAudioUrl) {
                this.showStatus('Missing required data to save', 'error');
                return;
            }
            
            this.showLoading('Saving recording...');
            
            const formData = new FormData();
            formData.append('audio', this.audioBlob, 'recording.webm');
            formData.append('voiceId', this.selectedVoice.id);
            formData.append('transcription', this.finalTranscript);
            formData.append('detectedLanguage', this.selectedVoice.languageCode);
            formData.append('synthesizedAudioUrl', this.synthesizedAudioUrl);
            
            const response = await fetch('/api/audio/save', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            
            this.hideLoading();
            
            if (data.success) {
                this.showStatus('Recording saved successfully!', 'success');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving recording:', error);
            this.hideLoading();
            this.showStatus('Error saving recording: ' + error.message, 'error');
        }
    }

    showLoading(text) {
        document.getElementById('loadingText').textContent = text;
        this.loadingIndicator.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }
}

// Initialize the recorder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LiveTranscriptionRecorder();
});