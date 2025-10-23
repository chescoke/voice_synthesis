# 🚀 Quick Start Guide

Get the Voice Synthesis up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] Docker and Docker Compose installed
- [ ] AWS Account with access to S3, Transcribe, and Polly
- [ ] Git installed

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd voice_synthesis
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required AWS Configuration:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_S3_BUCKET=your-bucket-name
```

### 3. Create AWS Resources

#### Create S3 Bucket
```bash
aws s3 mb s3://your-bucket-name --region eu-north-1
```

#### Enable CORS on S3 Bucket
Create `cors.json`:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

### 4. Start the Application

#### Option A: Using Docker (Easiest)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Option B: Local Development

```bash
# Terminal 1: Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Terminal 2: Start Backend
cd backend
npm install
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Verify Installation

### Check Health Endpoint
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-20T10:00:00.000Z"
}
```

### Check Available Voices
```bash
curl http://localhost:3000/api/audio/voices/available
```

## Common First-Time Issues

### Issue 1: MongoDB Connection Failed
**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# If not, start it
docker-compose up mongodb -d
```

### Issue 2: AWS Credentials Invalid
**Solution:**
- Verify credentials in `.env` file
- Test credentials:
```bash
aws sts get-caller-identity
```

### Issue 3: Port 3000 Already in Use
**Solution:**
```bash
# Change port in .env
PORT=3001

# Restart application
docker-compose down && docker-compose up -d
```

## Testing Your Setup

### 1. Test Recording (Manual)
1. Go to http://localhost:3000
2. Click the red microphone button
3. Allow microphone access
4. Speak for a few seconds
5. Click stop

### 2. Test API (Automated)

```bash
cd backend
npm test
```

## Next Steps

✅ **You're all set!** Here's what you can do next:

1. **Record your first audio**: Navigate to the home page and start recording
2. **View history**: Check the History page to see all recordings
3. **Explore voices**: Try different AWS Polly voices
4. **Read the docs**: Check README.md for detailed information
5. **Run tests**: Execute `npm test` in the backend directory

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🐛 Check [Troubleshooting](#troubleshooting) section
- 📧 Contact support

## Development Workflow

```bash
# 1. Make changes to code
vim backend/src/services/audio.service.ts

# 2. Tests run automatically in watch mode
cd backend
npm run test:watch

# 3. Check code quality
npm run lint

# 4. Build for production
npm run build

# 5. Commit changes
git add .
git commit -m "feat: add new feature"
```

## Production Deployment

### Build for Production

```bash
# Build backend
cd backend
npm run build

# Build Docker image
docker build -t abi-audio-app:latest .
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
CLUSTER_WORKERS=auto
MONGODB_URI=mongodb://your-prod-mongodb:27017/abi-prueba
# ... other production settings
```

### Deploy with Docker

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Architecture Overview

```
User Browser
    ↓
  Frontend (HTML + TypeScript)
    ↓
  Express API Server (Clustered)
    ↓
  ┌──────────┬───────────┬──────────┐
  │          │           │          │
MongoDB   AWS S3   AWS Transcribe  AWS Polly
```

## Key Features to Test

- [x] Audio recording with MediaRecorder
- [x] Real-time timer during recording
- [x] Pause/resume functionality
- [x] Audio playback (original)
- [x] Transcription display
- [x] Voice selection by language
- [x] Speech synthesis with different voice
- [x] Audio playback (synthesized)
- [x] Save to database
- [x] View history with pagination
- [x] Delete recordings
- [x] Regenerate with different voice
- [x] Export recordings

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Restart services
docker-compose restart backend

# Stop all services
docker-compose down

# Clean everything (including volumes)
docker-compose down -v

# Check service health
docker-compose ps

# Execute command in container
docker-compose exec backend npm test

# View MongoDB data
docker-compose exec mongodb mongosh abi-prueba
```

## Performance Tips

1. **Cluster Mode**: Set `CLUSTER_WORKERS=auto` to use all CPU cores
2. **MongoDB Indexes**: Automatically created by the application
3. **S3 Optimization**: Use CloudFront CDN for faster audio delivery
4. **Caching**: Implement Redis for API response caching (optional enhancement)

---

**Congratulations! 🎉** You now have a fully functional audio recording, transcription, and synthesis application running!

For more detailed information, please refer to the main [README.md](README.md).