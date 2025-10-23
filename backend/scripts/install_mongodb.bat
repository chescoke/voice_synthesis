@echo off
REM MongoDB Installation Script for Windows
REM Requires Administrator privileges

echo.
echo ========================================
echo   MongoDB Installation Script
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges
    echo.
    echo Please:
    echo   1. Right-click on this file
    echo   2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [OK] Running with Administrator privileges
echo.

REM Check if MongoDB is already installed
where mongod >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MongoDB is already installed!
    mongod --version | findstr "version"
    echo.
    set /p REINSTALL="Do you want to reinstall? (Y/N): "
    if /i not "%REINSTALL%"=="Y" (
        echo Installation cancelled.
        pause
        exit /b 0
    )
)

REM Set MongoDB version
set MONGODB_VERSION=7.0.5
set DOWNLOAD_URL=https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-%MONGODB_VERSION%-signed.msi

echo [INFO] MongoDB version: %MONGODB_VERSION%
echo.

REM Create temp directory
set TEMP_DIR=%TEMP%\mongodb-install
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

echo [1/5] Downloading MongoDB...
echo.

REM Download MongoDB
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TEMP_DIR%\mongodb-installer.msi'}"

if %errorLevel% neq 0 (
    echo [ERROR] Failed to download MongoDB
    echo.
    echo Please download manually from:
    echo https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo [OK] Download complete
echo.

echo [2/5] Installing MongoDB...
echo This may take a few minutes...
echo.

REM Install MongoDB silently
msiexec.exe /i "%TEMP_DIR%\mongodb-installer.msi" ^
    /qn ^
    INSTALLLOCATION="C:\Program Files\MongoDB\Server\7.0\" ^
    ADDLOCAL="ServerService,Client,Router,MongoDBCompass"

if %errorLevel% neq 0 (
    echo [ERROR] Installation failed
    pause
    exit /b 1
)

echo [OK] MongoDB installed
echo.

REM Add MongoDB to PATH
echo [3/5] Adding MongoDB to PATH...
setx /M PATH "%PATH%;C:\Program Files\MongoDB\Server\7.0\bin"
set PATH=%PATH%;C:\Program Files\MongoDB\Server\7.0\bin

echo [OK] PATH updated
echo.

REM Create data directory
echo [4/5] Creating data directory...
if not exist "C:\data\db" mkdir "C:\data\db"
echo [OK] Data directory created
echo.

REM Start MongoDB service
echo [5/5] Starting MongoDB service...
net start MongoDB >nul 2>&1

if %errorLevel% == 0 (
    echo [OK] MongoDB service started
) else (
    echo [WARNING] Could not start MongoDB service
    echo You may need to restart your computer first
)

echo.

REM Test connection
echo Testing MongoDB connection...
timeout /t 2 /nobreak >nul

mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MongoDB is running!
) else (
    echo [WARNING] Could not connect to MongoDB
    echo Try restarting your computer or starting manually with:
    echo   net start MongoDB
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.

echo MongoDB Info:
echo   Install Path: C:\Program Files\MongoDB\Server\7.0
echo   Data Path:    C:\data\db
echo   Config:       C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
echo.

echo Quick Commands:
echo   Start:   net start MongoDB
echo   Stop:    net stop MongoDB
echo   Connect: mongosh
echo   Status:  sc query MongoDB
echo.

echo Next Steps:
echo   1. Restart your computer (recommended)
echo   2. Run: cd backend ^&^& npm run dev:mongodb
echo   3. Your app is ready!
echo.

REM Cleanup
del "%TEMP_DIR%\mongodb-installer.msi" >nul 2>&1

echo Press any key to exit...
pause >nul