@echo off
echo Connecting to MySQL and inserting test data...

REM Try common MySQL installation paths
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"Bakkiya@1108" bus < create-test-data.sql
    echo Test data inserted successfully!
) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" (
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p"Bakkiya@1108" bus < create-test-data.sql
    echo Test data inserted successfully!
) else (
    echo MySQL not found in common locations. Please run the SQL manually.
    echo File: create-test-data.sql
)

pause
