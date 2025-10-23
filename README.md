# 🎙️ Voice Synthesis

A complete full-stack application for recording audio, transcribing it to text using AWS Transcribe, and synthesizing speech with different accents using AWS Polly.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [AWS Services Setup](#aws-services-setup)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### Recording
- 🎤 **Browser-based audio recording** using MediaRecorder API
- ⏱️ **Real-time duration tracking** with pause/resume functionality
- 🎧 **Instant playback** of recorded audio
- 📊 **Visual feedback** during recording

### Transcription
- 🗣️ **Automatic speech-to-text** using AWS Transcribe
- 🌍 **Automatic language detection**
- 📝 **Clean, readable transcription output**

### Voice Synthesis
- 🎭 **Multiple voice options** from AWS Polly
- 🗺️ **Different accents and languages** support
- 🔍 **Dynamic voice selection** based on detected language
- 🎨 **Filter voices** by language and gender
- 🔄 **Regenerate audio** with different voices

### Storage & Management
- 💾 **MongoDB storage** for metadata
- ☁️ **AWS S3** for audio files
- 📚 **Complete history** of all recordings
- 🔎 **Search and filter** capabilities
- 📤 **Export recordings** as JSON
- 🗑️ **Delete recordings** with confirmation

### Performance
- ⚡ **Cluster support** for multi-core processing
- 🚀 **Horizontal scaling** capabilities
- 🎯 **Optimized for production** deployment

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Cloud Services**: AWS S3, AWS Transcribe, AWS Polly
- **Process Management**: Node.js Cluster module

### Frontend
- **HTML5** with semantic markup
- **TailwindCSS** for styling
- **Vanilla TypeScript** (no framework)
- **MediaRecorder API** for audio recording

### DevOps
- **Docker & Docker Compose** for containerization
- **Jest & Supertest** for testing
- **ESLint** for code quality

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Recorder   │  │   History    │  │  Voice       │      │
│  │  Interface  │  │   Dashboard  │  │  Selection   │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Express Server                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Audio   │  │  S3      │  │Transcribe│  │  Polly   │   │
│  │Controller│  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                 │
        ▼                ▼                 ▼
    ┌────────┐     ┌─────────┐      ┌─────────┐
    │MongoDB │     │  AWS S3 │      │AWS Polly│
    │        │     │         │      │  & Trans│
    └────────┘     └─────────┘      └─────────┘
```

## 📦 Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **MongoDB** 7.0 or higher (or MongoDB Atlas)
- **Docker** and **Docker Compose** (optional but recommended)
- **AWS Account** with:
  - S3 bucket created
  - IAM user with permissions for S3, Transcribe, and Polly
  - Access Key ID and Secret Access Key

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd abi-audio-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration (see [Configuration](#configuration) section).

### 4. Set up AWS Services

See the [AWS Services Setup](#aws-services-setup) section for detailed instructions.

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
MAX_RECORDING_DURATION=300          # Maximum recording duration in seconds
CLUSTER_WORKERS=auto                 # 'auto' or specific number (e.g., 4)

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/abi-prueba

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=abi-audio-recordings

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Environment Variables Explained

- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment mode (development/production)
- **MAX_RECORDING_DURATION**: Maximum recording length in seconds
- **CLUSTER_WORKERS**: Number of worker processes (`auto` uses all CPU cores)
- **MONGODB_URI**: MongoDB connection string
- **AWS_REGION**: AWS region for services
- **AWS_ACCESS_KEY_ID**: AWS IAM user access key
- **AWS_SECRET_ACCESS_KEY**: AWS IAM user secret key
- **AWS_S3_BUCKET**: S3 bucket name for audio storage
- **CORS_ORIGIN**: Allowed CORS origins (comma-separated for multiple)

## 🏃 Running the Application

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at `http://localhost:3000`

### Option 2: Running Locally

#### Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or use local MongoDB installation
mongod --dbpath /path/to/data
```

#### Start Backend

```bash
cd backend

# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

#### Frontend

The frontend is served automatically by the Express server at `http://localhost:3000`

### Option 3: Development Mode

```bash
# Terminal 1: Start MongoDB
docker-compose up mongodb

# Terminal 2: Start backend in dev mode
cd backend
npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

#### 2. Upload and Process Audio
```http
POST /api/audio/upload
Content-Type: multipart/form-data
```

**Request Body:**
- `audio`: Audio file (multipart/form-data)
- `voiceId`: AWS Polly voice ID (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "fecha": "2025-01-20T10:00:00.000Z",
    "audioOriginalUrl": "https://bucket.s3.amazonaws.com/...",
    "audioConAccentoUrl": "https://bucket.s3.amazonaws.com/...",
    "transcripcion": "Transcribed text...",
    "idiomaDetectado": "es-ES",
    "vozSeleccionada": {
      "id": "Miguel",
      "name": "Miguel",
      "languageCode": "es-ES",
      "languageName": "Spanish (Spain)",
      "gender": "Male"
    },
    "duracion": 5.2,
    "nombreArchivo": "recording.webm"
  }
}
```

#### 3. Get All Recordings
```http
GET /api/audio?page=1&limit=10
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "recordings": [...],
    "total": 25,
    "pages": 3
  }
}
```

#### 4. Get Recording by ID
```http
GET /api/audio/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "audioOriginalUrl": "...",
    ...
  }
}
```

#### 5. Delete Recording
```http
DELETE /api/audio/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

#### 6. Regenerate Audio with Different Voice
```http
POST /api/audio/:id/regenerate
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
    "_id": "65abc123...",
    "audioConAccentoUrl": "https://new-url...",
    "vozSeleccionada": {
      "id": "Conchita",
      "name": "Conchita",
      ...
    }
  }
}
```

#### 7. Get Available Voices
```http
GET /api/audio/voices/available?languageCode=es-ES
```

**Query Parameters:**
- `languageCode`: Filter by language (optional)

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
    ...
  ]
}
```

## 🧪 Testing

### Run All Tests
```bash
cd backend
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Unit Tests Only
```bash
npm test -- tests/unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Test Structure

```
backend/tests/
├── setup.ts                    # Test configuration
├── unit/
│   └── audio.service.test.ts   # Unit tests for services
└── integration/
    └── audio.api.test.ts       # Integration tests for API
```

## 📁 Project Structure

```
abi-audio-app/
├── backend/
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── index.ts         # Environment configuration
│   │   │   └── database.ts      # Database connection
│   │   ├── controllers/         # Request handlers
│   │   │   └── audio.controller.ts
│   │   ├── services/            # Business logic
│   │   │   ├── s3.service.ts
│   │   │   ├── transcribe.service.ts
│   │   │   ├── polly.service.ts
│   │   │   └── audio.service.ts
│   │   ├── models/              # Database models
│   │   │   └── AudioRecording.ts
│   │   ├── routes/              # API routes
│   │   │   └── audio.routes.ts
│   │   ├── middleware/          # Express middleware
│   │   │   ├── upload.ts
│   │   │   └── error.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── app.ts               # Express app setup
│   │   └── server.ts            # Server with cluster
│   ├── tests/                   # Test files
│   │   ├── setup.ts
│   │   ├── unit/
│   │   └── integration/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/
│   ├── index.html               # Recording page
│   ├── history.html             # History page
│   └── js/
│       ├── recorder.js          # Recording logic
│       └── history.js           # History page logic
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## ☁️ AWS Services Setup

### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://abi-audio-recordings --region us-east-1

# Set bucket policy for access
aws s3api put-bucket-cors --bucket abi-audio-recordings --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 2. Create IAM User

1. Go to AWS IAM Console
2. Create a new user: `abi-audio-app`
3. Attach the following policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::abi-audio-recordings/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech",
        "polly:DescribeVoices"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Generate Access Keys
5. Save the Access Key ID and Secret Access Key

### 3. Configure Services

Add the credentials to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtn...
AWS_S3_BUCKET=abi-audio-recordings
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

**Solution**:
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs abi-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### AWS Credentials Issues

**Problem**: AWS authentication errors

**Solution**:
1. Verify credentials in `.env` file
2. Check IAM user permissions
3. Ensure S3 bucket exists and is accessible
4. Verify AWS region is correct

```bash
# Test AWS credentials
aws sts get-caller-identity
```

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Audio Recording Not Working

**Problem**: Browser doesn't allow audio recording

**Solution**:
- Ensure you're using HTTPS (or localhost)
- Grant microphone permissions in browser
- Check browser console for errors
- Test with different browser

### Transcription Timeout

**Problem**: Transcription job times out

**Solution**:
- Check AWS Transcribe service status
- Verify audio file format is supported
- Ensure audio file is uploaded to S3 successfully
- Check network connectivity to AWS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint for code linting
- Write tests for new features
- Update documentation

### Testing Guidelines

- Write unit tests for services
- Write integration tests for API endpoints
- Maintain test coverage above 80%
- Test edge cases and error scenarios

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Abi Group** - *Initial work*

## 🙏 Acknowledgments

- AWS for cloud services
- MongoDB for database
- Node.js community
- Express.js team
- TypeScript team

---

Made with ❤️ by Abi Group