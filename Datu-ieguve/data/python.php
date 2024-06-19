<?php
require("../connectDB.php");

$log_file = 'python.txt';
function logMessage($message) {
    global $log_file;
    $log_message = date("Y-m-d H:i:s") . " - " . $message . PHP_EOL;
    file_put_contents($log_file, $log_message, FILE_APPEND);
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
  
    if (isset($_POST["selectedCheckboxes"])) {
       
        $selectedCheckboxes = json_decode($_POST["selectedCheckboxes"]);

      
        $pythonScriptMapping = array(
            "Alkoutlet" => "web_scrapeAlkoutlet.py",
            "Barbora" => "web_scrapeBarb.py",
            "Citro" => "web_scrapeCitro.py",
            "Lats" => "web_scrapeLats.py",
            "Rimi" => "web_scrapeRimi.py"
        );
        
      
        $checkboxesToRename = array();
        
      
        foreach ($selectedCheckboxes as $checkboxId) {
         
            if (array_key_exists($checkboxId, $pythonScriptMapping)) {
              
                $checkboxesToRename[$checkboxId] = $pythonScriptMapping[$checkboxId];
            }
        }
        
     
        foreach ($checkboxesToRename as $checkboxId => $newName) {
          
            $oldName = $checkboxId . ".py";
            rename($oldName, $newName);

            $renamedCheckboxes[$checkboxId] = $newName;
        
            $log_message = "Renamed script: $oldName to $newName\n";
            file_put_contents($log_file, $log_message, FILE_APPEND);
       
        }


        $scriptsPath = "C:\\xampp\\htdocs\\Datu-ieguve\\PY-READER\\scripts.py";

  
        $command = "python \"$scriptsPath\" " . implode(" ", array_values($renamedCheckboxes));
        $log_message = "script: $command, $output\n";
        file_put_contents($log_file, $log_message, FILE_APPEND);

        
      
        $cmd = "start cmd /c \"$command\"";
        $process = popen($cmd, "r");
        if ($process !== false) {
            pclose($process);
            logMessage("Python scripts executed successfully.");
            $sql = "UPDATE statuss SET button_state = false";
            $result = pg_query($savienojums, $sql);
        } else {
            logMessage("Failed to open command prompt.");
          
        }

      
    } else {
   
     
        logMessage("No selected checkboxes received.");
    }
} else {
    $sql = "UPDATE statuss SET button_state = false";
    $result = pg_query($savienojums, $sql);
   
    logMessage("Invalid request method.");
}
file_put_contents($log_file, $log_message, FILE_APPEND);
?>
