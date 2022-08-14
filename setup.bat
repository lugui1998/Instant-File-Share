where node > tmpFile
SET /p node_path= < tmpFile 
DEL tmpFile

SET mypath=%~dp0
SET copyPath=%mypath%command\copy.js

REN %mypath%\server\config.json.example config.json
REN %mypath%\command\config.json.example config.json

::Create context menu reg key
reg add "HKEY_CLASSES_ROOT\*\shell\Copy Share URL\command" /f /ve /d "\"%node_path%\" \"%copyPath%\" \"%%1""

:: Create startup script
echo cd /d "%mypath%" > "C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\ifs.bat"
echo cd server >> "C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\ifs.bat"
echo pm2 start dist/server.js --name instant-file-share --interpreter=node --watch >> "C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\ifs.bat"

npm i -g pm2