<?php

echo shell_exec('git pull 2>&1');

echo shell_exec('cp offline.appcache.rem offline.appcache');
echo shell_exec('echo "\n#" `git rev-parse HEAD` >> offline.appcache');

?>

