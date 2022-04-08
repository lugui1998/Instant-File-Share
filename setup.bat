where node > tmpFile
SET /p node_path= < tmpFile 
DEL tmpFile

SET mypath=%~dp0
set copyPath=%mypath%command\copy.js

reg add "HKEY_CLASSES_ROOT\*\shell\Copy Share URL\command" /f /ve /d "\"%node_path%\" \"%copyPath%\" \"%%1""