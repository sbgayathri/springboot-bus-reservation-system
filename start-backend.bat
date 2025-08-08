@echo off
cd /d "C:\Users\gayat\OneDrive\Desktop\bus\bus"
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
echo Starting Spring Boot application...
mvnw.cmd spring-boot:run
pause
