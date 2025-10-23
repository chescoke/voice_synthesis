# 🎙️ Voice Synthesis - Audio Recording & Transcription Platform

<div align="center">

**Una aplicación web completa para grabación de audio, transcripción de voz a texto, y síntesis de voz con diferentes acentos**

[Características](#-características) •
[Instalación](#-instalación-rápida) •
[Configuración](#-configuración) •
[Testing](#-testing)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Objetivos del Proyecto](#-objetivos-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Prerrequisitos](#-prerrequisitos)
- [Instalación Rápida](#-instalación-rápida)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [AWS Setup](#-aws-setup)
- [Troubleshooting](#-troubleshooting)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## 📖 Descripción

**Voice Synthesis** es una aplicación web full-stack que permite grabar audio desde el navegador, transcribirlo a texto utilizando AWS Transcribe, sintetizar el texto con diferentes voces y acentos usando AWS Polly, y almacenar los resultados en una base de datos MongoDB.

La aplicación demuestra la integración completa de:
- 🎤 **Grabación de audio** en el navegador
- 📝 **Transcripción** automática speech-to-text
- 🗣️ **Síntesis de voz** con múltiples acentos
- 💾 **Almacenamiento** en la nube (AWS S3)
- 📊 **Base de datos** NoSQL (MongoDB)
- 📤 **Exportación** de archivos de audio

---

## ✨ Características

### Frontend
- ✅ Grabación de audio desde el micrófono del navegador
- ✅ Visualización de forma de onda en tiempo real
- ✅ Contador de duración de grabación
- ✅ Interfaz responsive con TailwindCSS
- ✅ Selector de voces/acentos disponibles
- ✅ Vista previa del texto transcrito
- ✅ Reproductor de audio sintetizado
- ✅ Historial de grabaciones con paginación
- ✅ Exportación de archivos de audio

### Backend
- ✅ API RESTful con Express + TypeScript
- ✅ Integración con AWS Polly (Text-to-Speech)
- ✅ Integración con AWS Transcribe (Speech-to-Text)
- ✅ Almacenamiento en AWS S3
- ✅ Base de datos MongoDB con Mongoose
- ✅ Validación de entrada con middleware
- ✅ Manejo de errores robusto
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Compresión de respuestas

### Testing
- ✅ Tests unitarios con Jest
- ✅ Tests de integración con AWS
- ✅ Mocks de AWS SDK

---

## 🎯 Objetivos del Proyecto

Esta aplicación fue desarrollada como prueba técnica para evaluar la capacidad de construir una aplicación web completa que integre:

1. **Frontend**: Aplicación web con grabación de audio desde el micrófono
2. **Transcripción**: Conversión de audio a texto en tiempo real
3. **Síntesis de Voz**: Conversión de texto a voz con diferentes acentos
4. **Almacenamiento**: Persistencia de datos en base de datos y nube
5. **Exportación**: Capacidad de descargar archivos de audio generados

---

## 🛠️ Stack Tecnológico

### Frontend
```
- HTML5, CSS3, JavaScript (Vanilla)
- TailwindCSS 3.x
- MediaRecorder API
- Fetch API
```

### Backend
```
- Node.js 18+
- Express 4.x
- TypeScript 5.3
- MongoDB + Mongoose 8.x
```

### AWS Services
```
- AWS Polly (Text-to-Speech)
- AWS Transcribe (Speech-to-Text)
- AWS S3 (Object Storage)
```

### Testing
```
- Jest 29.x
- ts-jest
- aws-sdk-client-mock
- supertest
```

### DevOps
```
- Docker
- Docker Compose
```

---

## 📦 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0 ([Descargar](https://nodejs.org/))
- **MongoDB** >= 6.0 ([Descargar](https://www.mongodb.com/try/download/community))
- **npm** >= 9.0.0 (incluido con Node.js)
- **Cuenta AWS** con acceso a Polly, Transcribe y S3

### Verificar Instalación

```bash
node --version  # v18.0.0 o superior
npm --version   # v9.0.0 o superior
mongo --version # v6.0.0 o superior
```

---

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática

```bash
# Clonar el repositorio
git clone https://github.com/chescoke/voice_synthesis.git
cd voice-synthesis

# Ejecutar script de instalación
./install.sh

# Esto instalará:
# - Dependencias del proyecto
# - Dependencias del backend
# - Dependencias de testing
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias raíz
npm install

# 2. Instalar mongodb
./backend/scripts/install_mongodb.sh

# 3. Instalar dependencias de testing
npm install --save-dev aws-sdk-client-mock aws-sdk-client-mock-jest

```

---

## ⚙️ Configuración

### 1. Configurar Variables de Entorno

Crear archivo `.env` en `backend/`:

```bash
cp .env.example .env
nano .env
```

### 2. Contenido del `.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development
MAX_RECORDING_DURATION=300

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/voice-synthesis

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_S3_BUCKET=tu-bucket-name
AWS_S3_AUDIO_FOLDER=voice-synthesis

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Configurar AWS S3 Bucket

**⚠️ IMPORTANTE**: El bucket S3 debe estar configurado correctamente:

#### A. Crear Bucket

```bash
aws s3 mb s3://tu-bucket-name --region us-east-1
```

#### B. Desbloquear Acceso Público

En AWS Console → S3 → Tu Bucket → Permissions:

1. **Block public access**: Desactivar "Block all public access"
2. **Bucket Policy**: Agregar política de lectura pública

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tu-bucket-name/*"
        }
    ]
}
```

#### C. Configurar CORS

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:5000"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3600
    }
]
```

### 4. Verificar Credenciales AWS

```bash
npm run test:credentials
```

**Output esperado:**
```
✅ AWS credentials are valid
✅ Polly access: OK
✅ S3 access: OK
✅ Transcribe access: OK
```

---

## 🎮 Uso

### Iniciar la Aplicación

#### Con MongoDB Local

```bash
# Terminal 1: Iniciar MongoDB
mongod

# Terminal 2: Iniciar Backend
cd backend
npm run dev:mongodb

# Terminal 3: Iniciar Frontend (con Live Server)
cd frontend
# Abrir index.html con Live Server
```

#### Con Docker Compose

```bash
# Iniciar todo (MongoDB + Backend)
cd backend
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

---

## 🧪 Testing

### Ejecutar Todos los Tests

```bash
npm test
```

### Ejecutar Tests Específicos

```bash
# Solo tests unitarios (no requieren AWS)
npm run test:unit

# Solo tests de integración (requieren AWS)
npm run test:integration

# Watch mode
npm run test:watch

### Tests Incluidos

#### 1. AWS Credentials Integration Test

**Ubicación**: `backend/src/tests/integration/aws-credentials.test.ts`

Verifica que las credenciales AWS estén correctamente configuradas y tengan permisos para:
- AWS Polly
- AWS Transcribe
- AWS S3

```bash
npm run test:integration
```

#### 2. S3 Service Unit Tests

**Ubicación**: `backend/src/tests/unit/services/s3.service.test.ts`

Prueba las operaciones de S3:
- Upload de archivos
- Upload de streams
- Download de archivos
- Generación de URLs

```bash
npm run test:unit
```

### Coverage Esperado

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   85.23 |    83.45 |   86.12 |   85.89 |
 services/
  s3.service.ts             |   92.34 |    90.12 |   93.45 |   93.12 |
----------------------------|---------|----------|---------|---------|
```

**Objetivo**: >82% coverage ✅

---

## 📁 Estructura del Proyecto

```
voice-synthesis/
├── frontend/
│   ├── index.html              # Página principal
│   ├── history.html            # Historial de grabaciones
│   └── js/
│       ├── app.js              # Lógica de grabación
│       ├── history.js          # Lógica de historial
│       └── config.js           # Configuración API
│
├── backend/
│   ├── src/
│   │   ├── config/             # Configuración
│   │   ├── controllers/        # Controladores
│   │   ├── middleware/         # Middleware
│   │   ├── models/             # Modelos MongoDB
│   │   ├── routes/             # Rutas API
│   │   ├── services/           # Servicios (AWS)
│   │   ├── types/              # TypeScript types
│   │   ├── tests/              # Tests
│   │   │   ├── unit/           # Tests unitarios
│   │   │   │   └── services/
│   │   │   │       └── s3.service.test.ts
│   │   │   └── integration/    # Tests de integración
│   │   │       └── aws-credentials.test.ts
│   │   ├── app.ts              # Express app
│   │   └── server.ts           # Server entry point
│   │
│   ├── .env                    # Variables de entorno
│   ├── package.json            # Dependencias backend
│   ├── tsconfig.json           # TypeScript config
│   └── jest.config.js          # Jest config
│
├── package.json                # Dependencias raíz
├── jest.config.js              # Jest config global
├── install.sh                  # Script de instalación
├── TESTING_SETUP.md            # Guía de testing
├── AUDIO_EXPORT_CORS.md        # Guía CORS
└── README.md                   # Este archivo
```

---

## 🔌 API Endpoints

### Audio Endpoints

#### POST `/api/audio/transcribe`
Transcribe audio a texto.

**Request:**
```bash
curl -X POST http://localhost:5000/api/audio/transcribe \
  -F "audio=@recording.webm"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcription": "Hola, esta es una prueba",
    "detectedLanguage": "es-ES"
  }
}
```

---

#### POST `/api/audio/synthesize`
Sintetiza texto a voz.

**Request:**
```bash
curl -X POST http://localhost:5000/api/audio/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola mundo",
    "voiceId": "Miguel"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://bucket.s3.amazonaws.com/audio.mp3"
  }
}
```

---

#### POST `/api/audio/save`
Guarda grabación completa.

**Request:**
```bash
curl -X POST http://localhost:5000/api/audio/save \
  -F "audio=@recording.webm" \
  -F "voiceId=Miguel" \
  -F "transcription=Hola mundo" \
  -F "detectedLanguage=es-ES" \
  -F "synthesizedAudioUrl=https://..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "transcripcion": "Hola mundo",
    "audioConAccentoUrl": "https://...",
    "vozSeleccionada": {
      "id": "Miguel",
      "name": "Miguel",
      "languageCode": "es-ES"
    }
  }
}
```

---

#### GET `/api/audio`
Obtiene lista de grabaciones con paginación.

**Request:**
```bash
curl http://localhost:5000/api/audio?page=1&limit=10
```

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

---

#### GET `/api/audio/:id/download`
Descarga audio sintetizado (proxy para evitar CORS).

**Request:**
```bash
curl http://localhost:5000/api/audio/507f.../download \
  --output audio.mp3
```

---

#### DELETE `/api/audio/:id`
Elimina grabación.

---

#### POST `/api/audio/:id/regenerate`
Regenera audio con diferente voz.

**Request:**
```bash
curl -X POST http://localhost:5000/api/audio/507f.../regenerate \
  -H "Content-Type: application/json" \
  -d '{"voiceId": "Lucia"}'
```

---

### Voice Endpoints

#### GET `/api/voices/available`
Obtiene voces disponibles.

**Request:**
```bash
curl http://localhost:5000/api/voices/available?languageCode=es-ES
```

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
      "engine": "standard"
    }
  ]
}
```

---

## ☁️ AWS Setup

### Permisos IAM Requeridos

Tu usuario IAM necesita estos permisos:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "polly:DescribeVoices",
                "polly:SynthesizeSpeech"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "transcribe:StartTranscriptionJob",
                "transcribe:GetTranscriptionJob",
                "transcribe:ListTranscriptionJobs"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutBucketCORS"
            ],
            "Resource": [
                "arn:aws:s3:::tu-bucket-name",
                "arn:aws:s3:::tu-bucket-name/*"
            ]
        }
    ]
}
```

### Configurar S3 Bucket (Detallado)

#### 1. Crear el Bucket

```bash
aws s3 mb s3://voice-synthesis-audio --region us-east-1
```

#### 2. Desbloquear Acceso Público

```bash
aws s3api put-public-access-block \
    --bucket voice-synthesis-audio \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

#### 3. Agregar Bucket Policy

```bash
aws s3api put-bucket-policy \
    --bucket voice-synthesis-audio \
    --policy file://bucket-policy.json
```

**bucket-policy.json:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::voice-synthesis-audio/*"
        }
    ]
}
```

#### 4. Configurar CORS

```bash
cd backend
./configure-s3-cors.sh
```

O manualmente:

```bash
aws s3api put-bucket-cors \
    --bucket voice-synthesis-audio \
    --cors-configuration file://cors.json
```

**cors.json:**
```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": [
                "http://localhost:3000",
                "http://localhost:5000"
            ],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3600
        }
    ]
}
```

---

## 🔧 Troubleshooting

### MongoDB no conecta

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solución**:
```bash
# Verificar si MongoDB está corriendo
mongod --version

# Iniciar MongoDB
mongod

# O con systemctl
sudo systemctl start mongod
```

---

### Credenciales AWS inválidas

**Error**: `The security token included in the request is invalid`

**Solución**:
```bash
# Verificar credenciales
cd backend
npm run test:credentials

# Si falla, revisar .env
cat .env | grep AWS
```

---

### CORS Error al exportar audio

**Error**: `Access to fetch has been blocked by CORS policy`

**Solución**:
```bash
# Configurar CORS en S3
cd backend
./configure-s3-cors.sh

# O usar el endpoint proxy (ya configurado)
# GET /api/audio/:id/download
```

Ver [AUDIO_EXPORT_CORS.md](./AUDIO_EXPORT_CORS.md) para más detalles.

---

### Tests fallan

**Error**: `Cannot find module 'aws-sdk-client-mock'`

**Solución**:
```bash
cd backend
npm install --save-dev aws-sdk-client-mock aws-sdk-client-mock-jest
```

---

### Puerto ya en uso

**Error**: `EADDRINUSE: address already in use :::5000`

**Solución**:
```bash
# Encontrar proceso
lsof -i :5000

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=5001
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Francisco De La Blanca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Autor

**Francisco De La Blanca**

Desarrollador Full Stack | AWS Solutions Architect

- 📧 Email: francisco@example.com
- 💼 LinkedIn: [Francisco De La Blanca](https://linkedin.com/in/francisco-de-la-blanca)
- 🐙 GitHub: [@francisco-de-la-blanca](https://github.com/francisco-de-la-blanca)

---

## 🙏 Agradecimientos

- AWS por los servicios de cloud computing
- MongoDB por la base de datos NoSQL
- La comunidad open source

---

## 📚 Documentación Adicional

- [Testing Setup](./TESTING_SETUP.md) - Guía completa de testing
- [Audio Export & CORS](./AUDIO_EXPORT_CORS.md) - Solución de problemas CORS

---

<div align="center">

**⭐ Si te gustó este proyecto, dale una estrella en GitHub ⭐**

Made with ❤️ by Francisco De La Blanca | Version 1.0.0

</div>