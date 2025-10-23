# 🎯 Getting Started - Voice Synthesis

## 📋 Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (need 20+)
node --version

# Check npm
npm --version

# Check Docker
docker --version
docker-compose --version

# Check AWS CLI (optional but helpful)
aws --version
```

## ⚡ 3-Step Quick Start

### Step 1: Setup Environment (2 minutes)

```bash
# Navigate to project
cd abi-audio-app

# Copy environment file
cp .env.example .env

# Edit with your AWS credentials
nano .env
```

Required variables:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=abi-audio-recordings
```

### Step 2: Create AWS Resources (3 minutes)

```bash
# Login to AWS
aws configure

# Create S3 bucket
aws s3 mb s3://abi-audio-recordings --region us-east-1

# Optional: Create IAM user with programmatic access
# Attach policies: AmazonS3FullAccess, AmazonTranscribeFullAccess, AmazonPollyFullAccess
```

### Step 3: Launch Application (1 minute)

```bash
# Start with Docker
docker-compose up -d

# Wait for services to be healthy
docker-compose ps

# Open browser
open http://localhost:3000
```

## 🎤 First Recording

1. **Click** the red microphone button
2. **Allow** browser microphone access
3. **Speak** your message (try: "Hello, this is a test")
4. **Stop** recording
5. **Wait** for transcription (automatic)
6. **Select** a voice from the dropdown
7. **Click** "Generate Speech"
8. **Listen** to synthesized audio
9. **Save** recording

## 📊 View Your Recordings

1. Click **"History"** in navigation
2. See all your recordings
3. Play original or synthesized audio
4. Try **"Regenerate"** with a different voice
5. **Export** recordings as JSON

## 🧪 Run Tests

```bash
cd backend

# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 📖 Documentation Guide

Read in this order:

1. **PROJECT_SUMMARY.md** ← Start here (overview)
2. **QUICKSTART.md** (detailed setup)
3. **README.md** (complete documentation)
4. **API.md** (API reference)

## 🔧 Development Mode

```bash
# Terminal 1: MongoDB
docker-compose up mongodb

# Terminal 2: Backend with hot-reload
cd backend
npm install
npm run dev

# Backend runs on http://localhost:3000
# Frontend served from backend/src/frontend
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Check status
docker-compose ps

# Clean everything
docker-compose down -v
```

## 🔍 Troubleshooting

### MongoDB won't connect
```bash
docker-compose logs mongodb
docker-compose restart mongodb
```

### Port 3000 in use
```bash
# Change port in .env
PORT=3001
docker-compose down && docker-compose up -d
```

### AWS credentials error
```bash
# Test credentials
aws sts get-caller-identity

# Verify in .env file
cat .env | grep AWS
```

### Can't record audio
- Use Chrome or Firefox (Safari has limitations)
- Ensure HTTPS or localhost
- Check browser permissions
- Allow microphone access

## 📞 API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Get available voices
curl http://localhost:3000/api/audio/voices/available

# Get all recordings
curl http://localhost:3000/api/audio
```

## 🎯 Project Structure

```
abi-audio-app/
├── 📄 Documentation (4 files)
│   ├── README.md
│   ├── QUICKSTART.md
│   ├── API.md
│   └── PROJECT_SUMMARY.md
│
├── ⚙️ Configuration
│   ├── .env.example
│   ├── docker-compose.yml
│   └── .gitignore
│
├── 🔧 Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── config/        (Environment & DB)
│   │   ├── controllers/   (Request handlers)
│   │   ├── services/      (AWS integration)
│   │   ├── models/        (MongoDB schemas)
│   │   ├── routes/        (API endpoints)
│   │   ├── middleware/    (Express middleware)
│   │   ├── types/         (TypeScript types)
│   │   ├── app.ts         (Express app)
│   │   └── server.ts      (Cluster server)
│   ├── tests/
│   └── package.json
│
└── 🎨 Frontend (HTML + TypeScript)
    ├── index.html         (Recording page)
    ├── history.html       (History page)
    └── js/
        ├── recorder.js    (Recording logic)
        └── history.js     (History logic)
```

## ✅ Success Checklist

- [ ] Node.js 20+ installed
- [ ] Docker running
- [ ] AWS account configured
- [ ] S3 bucket created
- [ ] .env file configured
- [ ] docker-compose up successful
- [ ] http://localhost:3000 loads
- [ ] Can record audio
- [ ] Transcription works
- [ ] Voice selection available
- [ ] Audio synthesis works
- [ ] History page shows recordings
- [ ] Tests pass

## 🚀 Next Steps

Once everything works:

1. **Read README.md** for complete documentation
2. **Review code** in backend/src
3. **Try different voices** from AWS Polly
4. **Experiment** with the API
5. **Run tests** to understand test patterns
6. **Deploy to production** (see DEPLOYMENT.md if available)

## 🎓 Key Concepts

### Backend Flow
```
1. Upload audio → S3
2. Transcribe → AWS Transcribe
3. Select voice → AWS Polly
4. Synthesize speech → S3
5. Save metadata → MongoDB
6. Return to client
```

### Frontend Flow
```
1. Record audio → MediaRecorder API
2. Send to backend → Fetch API
3. Display transcription
4. Show voice selector
5. Generate synthesis
6. Play and save
```

### Cluster Architecture
```
Master Process
├── Worker 1 (CPU Core 1)
├── Worker 2 (CPU Core 2)
├── Worker 3 (CPU Core 3)
└── Worker 4 (CPU Core 4)
```

## 💡 Tips

1. **Development**: Use `npm run dev` for hot-reload
2. **Testing**: Run tests before committing code
3. **AWS Costs**: Monitor S3 and Transcribe usage
4. **Performance**: Enable cluster mode in production
5. **Security**: Add authentication before production

## 📚 Learn More

- **Express.js**: https://expressjs.com
- **TypeScript**: https://www.typescriptlang.org
- **MongoDB**: https://docs.mongodb.com
- **AWS S3**: https://aws.amazon.com/s3
- **AWS Transcribe**: https://aws.amazon.com/transcribe
- **AWS Polly**: https://aws.amazon.com/polly
- **Docker**: https://docs.docker.com

## 🤝 Support

Having issues? Check:
1. README.md Troubleshooting section
2. Docker logs: `docker-compose logs`
3. Backend logs in console
4. Browser console for frontend errors

---

**You're all set! Start recording! 🎉**