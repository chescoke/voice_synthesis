# 📦 MongoDB Installation Guide

Scripts automáticos para instalar MongoDB en cualquier sistema operativo.

---

## 🚀 Instalación Rápida

### macOS

```bash
./install-mongodb.sh
```

### Linux (Ubuntu/Debian/CentOS/Fedora)

```bash
chmod +x install-mongodb.sh
./install-mongodb.sh
```

### Windows

1. **Click derecho** en `install-mongodb.bat`
2. **Seleccionar** "Ejecutar como administrador"

---

## 📋 Requisitos por Sistema

### macOS
- ✅ macOS 10.14 o superior
- ✅ Homebrew (se instalará automáticamente si no existe)

### Ubuntu/Debian
- ✅ Ubuntu 20.04+ o Debian 10+
- ✅ Permisos sudo

### CentOS/RHEL
- ✅ CentOS 8+ o RHEL 8+
- ✅ Permisos sudo

### Fedora
- ✅ Fedora 34+
- ✅ Permisos sudo

### Windows
- ✅ Windows 10/11 o Windows Server 2016+
- ✅ Permisos de Administrador
- ✅ PowerShell

---

## 🎯 Lo Que Hace el Script

### 1. Verificación
- ✅ Detecta si MongoDB ya está instalado
- ✅ Pregunta si quieres reinstalar
- ✅ Detecta tu sistema operativo

### 2. Instalación
- ✅ Agrega repositorios oficiales de MongoDB
- ✅ Instala MongoDB Community Edition 7.0
- ✅ Instala MongoDB Shell (mongosh)

### 3. Configuración
- ✅ Crea directorios de datos
- ✅ Configura el servicio
- ✅ Inicia MongoDB automáticamente

### 4. Verificación Final
- ✅ Prueba la conexión
- ✅ Muestra información de la instalación
- ✅ Proporciona comandos útiles

---

## 📖 Instrucciones Detalladas

### macOS

#### Paso 1: Descargar o Clonar Proyecto

```bash
cd abi-audio-app
```

#### Paso 2: Ejecutar Script

```bash
./install-mongodb.sh
```

#### Paso 3: Seguir Instrucciones

El script:
1. Verifica/instala Homebrew
2. Agrega el tap de MongoDB
3. Instala MongoDB Community 7.0
4. Instala mongosh
5. Inicia el servicio

**Output esperado:**
```
🍎 Detected macOS

✅ Homebrew is installed

📦 Adding MongoDB tap...
📥 Installing MongoDB Community Edition...
✅ MongoDB installed successfully!

🚀 Starting MongoDB service...
✅ MongoDB is running!

📍 MongoDB Info:
   Config: /usr/local/etc/mongod.conf
   Logs: /usr/local/var/log/mongodb/
   Data: /usr/local/var/mongodb/
```

---

### Linux (Ubuntu/Debian)

#### Paso 1: Hacer Ejecutable

```bash
chmod +x install-mongodb.sh
```

#### Paso 2: Ejecutar (requiere sudo)

```bash
./install-mongodb.sh
```

#### Paso 3: Ingresar Contraseña

El script pedirá tu contraseña sudo para:
- Agregar repositorios
- Instalar paquetes
- Iniciar servicios

**Output esperado:**
```
🐧 Detected Ubuntu/Debian

📦 Updating package list...
📦 Installing prerequisites...
🔑 Importing MongoDB GPG key...
📝 Creating MongoDB repository list...
📥 Installing MongoDB...
✅ MongoDB installed successfully!

🚀 Starting MongoDB service...
✅ MongoDB is running!

📍 MongoDB Info:
   Config: /etc/mongod.conf
   Logs: /var/log/mongodb/
   Data: /var/lib/mongodb/
```

---

### Windows

#### Opción 1: Ejecutar BAT File

1. Ir a la carpeta del proyecto
2. **Click derecho** en `install-mongodb.bat`
3. Seleccionar **"Ejecutar como administrador"**
4. Confirmar UAC prompt
5. Esperar instalación (2-5 minutos)

#### Opción 2: PowerShell

```powershell
# Abrir PowerShell como Administrador
cd path\to\abi-audio-app
.\install-mongodb.bat
```

**Output esperado:**
```
========================================
   MongoDB Installation Script
========================================

[OK] Running with Administrator privileges

[1/5] Downloading MongoDB...
[OK] Download complete

[2/5] Installing MongoDB...
This may take a few minutes...
[OK] MongoDB installed

[3/5] Adding MongoDB to PATH...
[OK] PATH updated

[4/5] Creating data directory...
[OK] Data directory created

[5/5] Starting MongoDB service...
[OK] MongoDB service started

Testing MongoDB connection...
[OK] MongoDB is running!

========================================
   Installation Complete!
========================================
```

#### Reiniciar Computadora

**Importante:** Después de instalar en Windows, reinicia tu computadora para que los cambios de PATH tomen efecto.

---

## 🧪 Verificar Instalación

### Test 1: Verificar Servicio

**macOS:**
```bash
brew services list | grep mongodb
```

**Linux:**
```bash
sudo systemctl status mongod
```

**Windows:**
```batch
sc query MongoDB
```

---

### Test 2: Conectar con mongosh

```bash
mongosh
```

Deberías ver:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.0.5
Using Mongosh: 2.1.1

test>
```

---

### Test 3: Ping Database

```bash
mongosh --eval "db.adminCommand('ping')"
```

Debería retornar:
```json
{ ok: 1 }
```

---

## 🔧 Comandos Útiles

### Iniciar MongoDB

**macOS:**
```bash
brew services start mongodb-community@7.0
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```batch
net start MongoDB
```

---

### Detener MongoDB

**macOS:**
```bash
brew services stop mongodb-community@7.0
```

**Linux:**
```bash
sudo systemctl stop mongod
```

**Windows:**
```batch
net stop MongoDB
```

---

### Reiniciar MongoDB

**macOS:**
```bash
brew services restart mongodb-community@7.0
```

**Linux:**
```bash
sudo systemctl restart mongod
```

**Windows:**
```batch
net stop MongoDB
net start MongoDB
```

---

### Ver Logs

**macOS:**
```bash
tail -f /usr/local/var/log/mongodb/mongo.log
```

**Linux:**
```bash
sudo journalctl -u mongod -f
```

**Windows:**
```batch
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"
```

---

### Ver Status

**macOS:**
```bash
brew services list | grep mongodb
```

**Linux:**
```bash
sudo systemctl status mongod
```

**Windows:**
```batch
sc query MongoDB
```

---

## 🚨 Troubleshooting

### Error: "Homebrew not found" (macOS)

**Solución:**
```bash
# El script instalará Homebrew automáticamente
# O instala manualmente:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### Error: "Permission denied" (Linux)

**Causa:** No tienes permisos sudo

**Solución:**
```bash
# Agregar tu usuario a sudoers (contacta admin)
# O ejecuta cada comando manualmente con sudo
```

---

### Error: "Access Denied" (Windows)

**Causa:** No ejecutaste como Administrador

**Solución:**
1. Click derecho en el archivo
2. "Ejecutar como administrador"
3. Aceptar UAC prompt

---

### Error: "Failed to start service"

**macOS:**
```bash
# Ver error específico
brew services list
tail /usr/local/var/log/mongodb/mongo.log

# Reinstalar
brew services stop mongodb-community@7.0
brew uninstall mongodb-community@7.0
./install-mongodb.sh
```

**Linux:**
```bash
# Ver error específico
sudo systemctl status mongod
sudo journalctl -u mongod --no-pager | tail -50

# Verificar permisos
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

**Windows:**
```batch
REM Ver logs
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

REM Reinstalar servicio
sc delete MongoDB
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --install
net start MongoDB
```

---

### Error: "Port 27017 already in use"

**Causa:** Otra instancia de MongoDB o proceso usando el puerto

**Solución:**

**macOS/Linux:**
```bash
# Ver qué está usando el puerto
sudo lsof -i :27017

# Matar proceso si es necesario
sudo kill -9 <PID>
```

**Windows:**
```batch
REM Ver qué está usando el puerto
netstat -ano | findstr :27017

REM Matar proceso
taskkill /PID <PID> /F
```

---

### Error: "mongosh: command not found"

**Solución:**

**macOS:**
```bash
brew install mongosh
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-mongosh

# CentOS/RHEL/Fedora
sudo yum install mongodb-mongosh
```

**Windows:**
```batch
REM Descargar de: https://www.mongodb.com/try/download/shell
REM O agregar a PATH:
setx PATH "%PATH%;C:\Program Files\MongoDB\Server\7.0\bin"
```

---

## 📊 Ubicaciones de Archivos

### macOS (Homebrew)

```
Config:  /usr/local/etc/mongod.conf
Data:    /usr/local/var/mongodb/
Logs:    /usr/local/var/log/mongodb/
Binary:  /usr/local/bin/mongod
```

### Linux

```
Config:  /etc/mongod.conf
Data:    /var/lib/mongodb/
Logs:    /var/log/mongodb/
Binary:  /usr/bin/mongod
```

### Windows

```
Install: C:\Program Files\MongoDB\Server\7.0\
Config:  C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
Data:    C:\data\db\
Logs:    C:\data\db\log\
Binary:  C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
```

---

## 🔄 Desinstalar MongoDB

### macOS

```bash
brew services stop mongodb-community@7.0
brew uninstall mongodb-community@7.0
brew untap mongodb/brew

# Opcional: borrar datos
rm -rf /usr/local/var/mongodb
rm -rf /usr/local/var/log/mongodb
```

### Linux (Ubuntu/Debian)

```bash
sudo systemctl stop mongod
sudo apt-get purge mongodb-org*
sudo rm -rf /var/log/mongodb
sudo rm -rf /var/lib/mongodb
sudo rm /etc/apt/sources.list.d/mongodb-org-7.0.list
```

### Windows

```batch
REM Detener servicio
net stop MongoDB

REM Desinstalar desde Panel de Control
REM O usar:
msiexec.exe /x {GUID} /qn

REM Borrar datos (opcional)
rmdir /s /q "C:\data\db"
rmdir /s /q "C:\Program Files\MongoDB"
```

---

## ✅ Checklist Post-Instalación

- [ ] MongoDB instalado correctamente
- [ ] Servicio iniciado
- [ ] `mongosh` funciona
- [ ] Ping test exitoso
- [ ] PATH configurado (Windows)
- [ ] Verificar con: `npm run dev:mongodb`
- [ ] Backend conecta a MongoDB
- [ ] No hay errores en logs

---

## 🎓 Recursos Adicionales

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)
- [mongosh Documentation](https://docs.mongodb.com/mongodb-shell/)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (GUI)

---

## 💡 Tips

### Instalar MongoDB Compass (GUI)

**macOS:**
```bash
brew install --cask mongodb-compass
```

**Linux/Windows:**
Descargar de: https://www.mongodb.com/try/download/compass

---

### Configurar MongoDB para Auto-Start

**macOS:**
```bash
# Ya configurado por Homebrew
brew services list
```

**Linux:**
```bash
sudo systemctl enable mongod
```

**Windows:**
```batch
sc config MongoDB start= auto
```

---

### Conexión Remota (Opcional)

**Editar config:**

**macOS:** `/usr/local/etc/mongod.conf`  
**Linux:** `/etc/mongod.conf`  
**Windows:** `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

```yaml
net:
  bindIp: 0.0.0.0  # Escuchar en todas las interfaces
  port: 27017
```

**⚠️ Advertencia:** Solo para desarrollo. En producción usa firewall y autenticación.

---

¡MongoDB instalado y listo! 🎉

Ahora ejecuta:
```bash
cd backend
npm run dev:mongodb
```

---

[📂 Back to project](./README.md)