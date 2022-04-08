SET node_path=%~dp0node.exe
SET mypath=%~dp0
set copyPath=%mypath%command\copy.js

::set command=REG ADD "HKEY_CLASSES_ROOT\*\shell\Copy Share URL\command" /f /ve /d "%node_path%" "%copyPath%" "%%1"
set command=REG ADD "HKEY_CLASSES_ROOT\*\shell\Copy Share URL\command" /f /ve /d "\"%node_path%\" \"%copyPath%\" \"%%1\""


%command%




