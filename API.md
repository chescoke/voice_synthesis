# 📡 API Documentation

Complete API reference for the Voice Synthesis backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. In production, implement JWT or OAuth2.

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Endpoints

### 1. Health Check

Check if the server is running and healthy.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

### 2. Upload and Process Audio Recording

Upload an audio file, transcribe it, and synthesize speech with a selected voice.

**Endpoint:** `POST /api/audio/upload`

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audio | File | Yes | Audio file (webm, mp3, wav, etc.) |
| voiceId | String | Yes | AWS Polly voice ID (e.g., "Miguel") |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "fecha": "2025-01-20T10:00:00.000Z",
    "audioOriginalUrl": "https://bucket.s3.amazonaws.com/audio/original.webm",
    "audioConAccentoUrl": "https://bucket.s3.amazonaws.com/audio/synthesized.mp3",
    "transcripcion": "Hola, esto es una prueba de audio",
    "idiomaDetectado": "es-ES",
    "vozSeleccionada": {
      "id": "Miguel",
      "name": "Miguel",
      "languageCode": "es-ES",
      "languageName": "Spanish (Spain)",
      "gender": "Male"
    },
    "duracion": 5.2,
    "nombreArchivo": "recording.webm",
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-20T10:00:05.000Z"
  },
  "message": "Audio processed successfully"
}
```

**Error Responses:**

```json
// No file provided
{
  "success": false,
  "error": "No audio file provided"
}

// No voice ID
{
  "success": false,
  "error": "Voice ID is required"
}

// Voice not found
{
  "success": false,
  "error": "Voice with ID Miguel not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/audio/upload \
  -F "audio=@recording.webm" \
  -F "voiceId=Miguel"
```

**Processing Steps:**
1. Upload original audio to S3
2. Transcribe audio using AWS Transcribe
3. Detect language from transcription
4. Get voice information from AWS Polly
5. Synthesize speech with selected voice
6. Upload synthesized audio to S3
7. Save metadata to MongoDB
8. Return complete recording object

---

### 3. Get All Recordings

Retrieve a paginated list of all audio recordings.

**Endpoint:** `GET /api/audio`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page (max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "recordings": [
      {
        "_id": "65abc123def456789",
        "fecha": "2025-01-20T10:00:00.000Z",
        "audioOriginalUrl": "https://...",
        "audioConAccentoUrl": "https://...",
        "transcripcion": "Text...",
        "idiomaDetectado": "es-ES",
        "vozSeleccionada": { ... },
        "duracion": 5.2,
        "nombreArchivo": "recording.webm",
        "createdAt": "2025-01-20T10:00:00.000Z"
      }
    ],
    "total": 25,
    "pages": 3
  }
}
```

**Example:**
```bash
# Get first page with 10 items
curl http://localhost:3000/api/audio

# Get second page with 20 items
curl "http://localhost:3000/api/audio?page=2&limit=20"
```

---

### 4. Get Recording by ID

Retrieve a specific recording by its ID.

**Endpoint:** `GET /api/audio/:id`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | MongoDB ObjectId of the recording |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "fecha": "2025-01-20T10:00:00.000Z",
    "audioOriginalUrl": "https://...",
    "audioConAccentoUrl": "https://...",
    "transcripcion": "Text...",
    "idiomaDetectado": "es-ES",
    "vozSeleccionada": { ... },
    "duracion": 5.2,
    "nombreArchivo": "recording.webm"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Recording not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/audio/65abc123def456789
```

---

### 5. Delete Recording

Delete a recording by its ID.

**Endpoint:** `DELETE /api/audio/:id`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | MongoDB ObjectId of the recording |

**Response:**
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Recording not found"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/audio/65abc123def456789
```

**Note:** This only deletes the MongoDB record. The audio files remain in S3. To also delete S3 files, implement additional logic.

---

### 6. Regenerate Audio with Different Voice

Regenerate the synthesized audio using a different AWS Polly voice.

**Endpoint:** `POST /api/audio/:id/regenerate`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | MongoDB ObjectId of the recording |

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "voiceId": "Conchita"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "audioConAccentoUrl": "https://bucket.s3.amazonaws.com/audio/new-synthesized.mp3",
    "vozSeleccionada": {
      "id": "Conchita",
      "name": "Conchita",
      "languageCode": "es-ES",
      "languageName": "Spanish (Spain)",
      "gender": "Female"
    },
    // ... other fields remain the same
  },
  "message": "Audio regenerated successfully"
}
```

**Error Responses:**
```json
// No voice ID provided
{
  "success": false,
  "error": "Voice ID is required"
}

// Recording not found
{
  "success": false,
  "error": "Recording not found"
}

// Voice not found
{
  "success": false,
  "error": "Voice with ID Conchita not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/audio/65abc123def456789/regenerate \
  -H "Content-Type: application/json" \
  -d '{"voiceId":"Conchita"}'
```

---

### 7. Get Available Voices

Retrieve the list of available AWS Polly voices.

**Endpoint:** `GET /api/audio/voices/available`

**Query Parameters:**
| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| languageCode | String | Yes | Filter by language code (e.g., "es-ES") |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "Miguel",
      "name": "Miguel",
      "languageCode": "es-ES",
      "languageName": "Spanish (Spain)",
      "gender": "Male",
      "engine": "neural"
    },
    {
      "id": "Conchita",
      "name": "Conchita",
      "languageCode": "es-ES",
      "languageName": "Spanish (Spain)",
      "gender": "Female",
      "engine": "standard"
    },
    {
      "id": "Mia",
      "name": "Mia",
      "languageCode": "es-MX",
      "languageName": "Spanish (Mexico)",
      "gender": "Female",
      "engine": "neural"
    }
  ]
}
```

**Examples:**
```bash
# Get all voices
curl http://localhost:3000/api/audio/voices/available

# Get only Spanish (Spain) voices
curl "http://localhost:3000/api/audio/voices/available?languageCode=es-ES"

# Get only English (US) voices
curl "http://localhost:3000/api/audio/voices/available?languageCode=en-US"
```

---

## Data Models

### AudioRecording

```typescript
interface AudioRecording {
  _id: string;                    // MongoDB ObjectId
  fecha: Date;                    // Recording date
  audioOriginalUrl: string;       // S3 URL of original audio
  audioConAccentoUrl: string;     // S3 URL of synthesized audio
  transcripcion: string;          // Transcribed text
  idiomaDetectado: string;        // Detected language code
  vozSeleccionada: VoiceInfo;     // Selected voice information
  duracion: number;               // Duration in seconds
  nombreArchivo: string;          // Original filename
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
}
```

### VoiceInfo

```typescript
interface VoiceInfo {
  id: string;                     // Polly voice ID
  name: string;                   // Voice name
  languageCode: string;           // Language code (e.g., "es-ES")
  languageName: string;           // Human-readable language name
  gender: string;                 // "Male" or "Female"
  engine?: string;                // "neural" or "standard"
}
```

## Error Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing required parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

## Rate Limiting

Currently, there are no rate limits. In production, implement rate limiting:

```javascript
// Example configuration
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                     // limit each IP to 100 requests per windowMs
}
```

## CORS

CORS is configured via the `CORS_ORIGIN` environment variable.

**Development:**
```env
CORS_ORIGIN=http://localhost:3000
```

**Production:**
```env
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

## WebSocket Support

Currently not implemented. For real-time features, consider adding Socket.IO:
- Real-time transcription progress
- Live audio streaming
- Recording status updates

## Versioning

API versioning is not currently implemented. For future versions, use URL versioning:

```
/api/v1/audio
/api/v2/audio
```

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Get all recordings
curl http://localhost:3000/api/audio

# Upload audio
curl -X POST http://localhost:3000/api/audio/upload \
  -F "audio=@test.webm" \
  -F "voiceId=Miguel"
```

### Using Postman

1. Import the following collection:
```json
{
  "info": {
    "name": "Abi Audio API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    }
  ]
}
```

### Using HTTPie

```bash
# Install HTTPie
pip install httpie

# Test health endpoint
http GET localhost:3000/api/health

# Upload audio
http POST localhost:3000/api/audio/upload \
  audio@recording.webm \
  voiceId=Miguel
```

## Best Practices

1. **Always check the `success` field** in responses
2. **Handle errors gracefully** on the client side
3. **Implement retry logic** for failed requests
4. **Use pagination** for large datasets
5. **Cache voice list** to reduce API calls
6. **Validate file size** before upload (max 50MB)
7. **Check supported audio formats** before upload

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Rate limiting
- [ ] API versioning
- [ ] WebSocket support for real-time updates
- [ ] Batch operations
- [ ] Search and filter endpoints
- [ ] Audio streaming
- [ ] Webhook notifications
- [ ] API analytics

---

For more information, see the main [README.md](README.md).