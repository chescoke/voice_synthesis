/**
 * History Page - Pure JavaScript
 * Handles displaying, filtering, and managing audio recordings
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔵 DOM loaded, initializing history page...');

// API Configuration
const API_BASE = '/api';

// State
const state = {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
};

let currentRegenerateId = '';

// DOM Elements
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const recordingsList = document.getElementById('recordingsList');
const paginationContainer = document.getElementById('paginationContainer');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const searchInput = document.getElementById('searchInput');
const itemsPerPage = document.getElementById('itemsPerPage');
const regenerateModal = document.getElementById('regenerateModal');
const modalVoiceSelector = document.getElementById('modalVoiceSelector');
const closeModal = document.getElementById('closeModal');
const cancelRegenerate = document.getElementById('cancelRegenerate');
const confirmRegenerate = document.getElementById('confirmRegenerate');

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// API Functions
async function fetchRecordings(page = 1, limit = 10) {
    try {
        const response = await fetch(`${API_BASE}/audio?page=${page}&limit=${limit}`);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch recordings');
        }
    } catch (error) {
        console.error('Error fetching recordings:', error);
        throw error;
    }
}

async function deleteRecording(id) {
    try {
        const response = await fetch(`${API_BASE}/audio/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
            return true;
        } else {
            throw new Error(data.error || 'Failed to delete recording');
        }
    } catch (error) {
        console.error('Error deleting recording:', error);
        throw error;
    }
}

async function regenerateRecording(id, voiceId) {
    try {
        const response = await fetch(`${API_BASE}/audio/${id}/regenerate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voiceId }),
        });
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error || 'Failed to regenerate recording');
        }
    } catch (error) {
        console.error('Error regenerating recording:', error);
        throw error;
    }
}

async function loadVoices() {
    try {
        const response = await fetch(`${API_BASE}/audio/voices/available`);
        const data = await response.json();

        if (data.success) {
            const voices = data.data;
            
            modalVoiceSelector.innerHTML = '<option value="">Select a voice...</option>';
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.id;
                option.textContent = `${voice.name} (${voice.languageName}) - ${voice.gender}`;
                modalVoiceSelector.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading voices:', error);
    }
}

async function exportRecording(recording) {
    try {
        console.log('📤 Exporting synthesized audio for:', recording._id);
        
        // Show loading state
        const exportButton = document.querySelector(`[data-action="export"][data-id="${recording._id}"]`);
        if (exportButton) {
            const originalContent = exportButton.innerHTML;
            exportButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Downloading...';
            exportButton.disabled = true;
        }
        
        // Use backend proxy endpoint to avoid CORS issues
        const downloadUrl = `${API_BASE}/audio/${recording._id}/download`;
        console.log('🔗 Download URL:', downloadUrl);
        
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to download audio: ${response.statusText}`);
        }
        
        // Get the audio blob
        const audioBlob = await response.blob();
        
        // Get filename from Content-Disposition header or generate one
        let filename = 'audio.mp3';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        // Create download URL
        const url = URL.createObjectURL(audioBlob);
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        console.log('✅ Audio exported successfully:', filename);
        
        // Restore button
        if (exportButton) {
            exportButton.innerHTML = '<i class="fas fa-download mr-1"></i> Export';
            exportButton.disabled = false;
        }
        
    } catch (error) {
        console.error('❌ Failed to export audio:', error);
        alert('Failed to export audio file. Please try again.');
        
        // Restore button on error
        const exportButton = document.querySelector(`[data-action="export"][data-id="${recording._id}"]`);
        if (exportButton) {
            exportButton.innerHTML = '<i class="fas fa-download mr-1"></i> Export';
            exportButton.disabled = false;
        }
    }
}

// UI Functions
function createRecordingCard(recording) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow';
    card.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Left Column: Info -->
            <div class="flex-1">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 mb-1">
                            <i class="fas fa-file-audio text-blue-600 mr-2"></i>
                            ${recording.nombreArchivo}
                        </h3>
                        <p class="text-sm text-gray-500">
                            <i class="far fa-calendar mr-1"></i>
                            ${formatDate(recording.createdAt)}
                        </p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            ${formatDuration(recording.duracion)}
                        </span>
                    </div>
                </div>

                <div class="mb-4">
                    <p class="text-sm text-gray-600 mb-1">
                        <i class="fas fa-language text-green-600 mr-2"></i>
                        <strong>Language:</strong> ${recording.idiomaDetectado}
                    </p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-user-alt text-purple-600 mr-2"></i>
                        <strong>Voice:</strong> ${recording.vozSeleccionada.name} (${recording.vozSeleccionada.gender})
                    </p>
                </div>

                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-file-alt text-green-600 mr-2"></i>
                        Transcription
                    </h4>
                    <p class="text-gray-700 text-sm line-clamp-3">${recording.transcripcion}</p>
                </div>
            </div>

            <!-- Right Column: Audio Players -->
            <div class="lg:w-96 space-y-4">
                <!-- Original Audio -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">
                        <i class="fas fa-microphone text-red-600 mr-2"></i>
                        Original Recording
                    </h4>
                    <audio controls class="w-full" src="${recording.audioOriginalUrl}"></audio>
                </div>

                <!-- Synthesized Audio -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-3">
                        <i class="fas fa-volume-up text-indigo-600 mr-2"></i>
                        Synthesized Audio
                    </h4>
                    <audio controls class="w-full" src="${recording.audioConAccentoUrl}"></audio>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-2">
                    <button data-action="regenerate" data-id="${recording._id}"
                            class="action-btn flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm">
                        <i class="fas fa-redo mr-1"></i> Regenerate
                    </button>
                    <button data-action="export" data-id="${recording._id}"
                            class="action-btn flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
                        <i class="fas fa-download mr-1"></i> Export
                    </button>
                    <button data-action="delete" data-id="${recording._id}"
                            class="action-btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm">
                        <i class="fas fa-trash mr-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

function renderPagination(totalPages, currentPage) {
    pageNumbers.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i.toString();
        button.className = `px-4 py-2 rounded-lg ${
            i === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
        }`;
        button.addEventListener('click', () => loadRecordings(i));
        pageNumbers.appendChild(button);
    }

    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
}

async function loadRecordings(page = 1) {
    try {
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        recordingsList.classList.add('hidden');
        paginationContainer.classList.add('hidden');

        const data = await fetchRecordings(page, state.itemsPerPage);

        loadingState.classList.add('hidden');

        // Filter recordings by search term
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredRecordings = data.recordings;
        
        if (searchTerm) {
            console.log('🔍 Filtering with search term:', searchTerm);
            filteredRecordings = data.recordings.filter(recording => {
                const transcription = recording.transcripcion.toLowerCase();
                const filename = recording.nombreArchivo.toLowerCase();
                const voice = recording.vozSeleccionada.name.toLowerCase();
                const language = recording.idiomaDetectado.toLowerCase();
                
                return transcription.includes(searchTerm) || 
                       filename.includes(searchTerm) ||
                       voice.includes(searchTerm) ||
                       language.includes(searchTerm);
            });
            console.log('✅ Filtered:', filteredRecordings.length, 'of', data.recordings.length, 'recordings');
        }

        if (filteredRecordings.length === 0) {
            emptyState.classList.remove('hidden');
            const emptyTitle = emptyState.querySelector('h3');
            const emptyText = emptyState.querySelector('p');
            if (searchTerm) {
                emptyTitle.textContent = 'No recordings match your search';
                emptyText.textContent = `No recordings found for "${searchTerm}"`;
            } else {
                emptyTitle.textContent = 'No recordings found';
                emptyText.textContent = 'Start by creating your first audio recording';
            }
        } else {
            recordingsList.innerHTML = '';
            filteredRecordings.forEach((recording) => {
                const card = createRecordingCard(recording);
                recordingsList.appendChild(card);
            });

            recordingsList.classList.remove('hidden');
            
            if (data.pages > 1) {
                state.currentPage = page;
                state.totalPages = data.pages;
                renderPagination(data.pages, page);
                paginationContainer.classList.remove('hidden');
            }
        }
    } catch (error) {
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
        console.error('Error loading recordings:', error);
    }
}

// Handler Functions (called by event delegation)
function handleDelete(id) {
    if (confirm('Are you sure you want to delete this recording?')) {
        deleteRecording(id)
            .then(() => {
                console.log('✅ Recording deleted');
                loadRecordings(state.currentPage);
            })
            .catch(error => {
                console.error('❌ Failed to delete:', error);
                alert('Failed to delete recording');
            });
    }
}

function handleExport(id) {
    console.log('📤 Exporting recording:', id);
    // Find recording data from the current page
    fetchRecordings(state.currentPage, state.itemsPerPage)
        .then(data => {
            const recording = data.recordings.find(r => r._id === id);
            if (recording) {
                exportRecording(recording);
            } else {
                alert('Recording not found');
            }
        })
        .catch(error => {
            console.error('❌ Failed to export:', error);
            alert('Failed to export recording');
        });
}

function handleRegenerate(id) {
    console.log('🔄 Regenerating recording:', id);
    currentRegenerateId = id;
    regenerateModal.classList.remove('hidden');
    regenerateModal.classList.add('flex');
    loadVoices();
}

// Modal Functions
function closeRegenerateModal() {
    regenerateModal.classList.add('hidden');
    regenerateModal.classList.remove('flex');
    currentRegenerateId = '';
    modalVoiceSelector.value = '';
}

// Event Listeners
prevPage.addEventListener('click', () => {
    if (state.currentPage > 1) {
        loadRecordings(state.currentPage - 1);
    }
});

nextPage.addEventListener('click', () => {
    if (state.currentPage < state.totalPages) {
        loadRecordings(state.currentPage + 1);
    }
});

itemsPerPage.addEventListener('change', (e) => {
    state.itemsPerPage = parseInt(e.target.value);
    loadRecordings(1);
});

let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
        // In production, implement search functionality
        loadRecordings(1);
    }, 500);
});

closeModal.addEventListener('click', closeRegenerateModal);
cancelRegenerate.addEventListener('click', closeRegenerateModal);

confirmRegenerate.addEventListener('click', async () => {
    const voiceId = modalVoiceSelector.value;
    
    if (!voiceId) {
        alert('Please select a voice');
        return;
    }

    try {
        confirmRegenerate.disabled = true;
        await regenerateRecording(currentRegenerateId, voiceId);
        closeRegenerateModal();
        loadRecordings(state.currentPage);
    } catch (error) {
        alert('Failed to regenerate recording');
    } finally {
        confirmRegenerate.disabled = false;
    }
});

// Event delegation for action buttons (regenerate, export, delete)
recordingsList.addEventListener('click', function(e) {
    const button = e.target.closest('.action-btn');
    if (!button) return;

    const action = button.getAttribute('data-action');
    const id = button.getAttribute('data-id');

    console.log('🖱️ Action button clicked:', action, id);

    switch(action) {
        case 'regenerate':
            handleRegenerate(id);
            break;
        case 'export':
            handleExport(id);
            break;
        case 'delete':
            handleDelete(id);
            break;
    }
});

// Initialize
console.log('✅ History page initialized');
loadRecordings();

}); // End of DOMContentLoaded