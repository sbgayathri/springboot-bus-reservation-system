@echo off
setlocal

rem Set JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%

rem Change to project directory
cd /d "C:\Users\gayat\OneDrive\Desktop\bus\bus"

rem Remove any conda interference
set CONDA_DEFAULT_ENV=
set CONDA_PREFIX=
set CONDA_PYTHON_EXE=
set CONDA_EXE=

echo Starting Spring Boot application...
echo Java version:
java -version

echo.
echo Building and running the application...
mvnw.cmd spring-boot:run

pause
