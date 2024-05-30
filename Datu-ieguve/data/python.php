<?php
require("../connectDB.php");

$log_file = 'python.txt';
function logMessage($message) {
    global $log_file;
    $log_message = date("Y-m-d H:i:s") . " - " . $message . PHP_EOL;
    file_put_contents($log_file, $log_message, FILE_APPEND);
}

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Check if selectedCheckboxes parameter is set
    if (isset($_POST["selectedCheckboxes"])) {
        // Decode the JSON data received from the JavaScript
        $selectedCheckboxes = json_decode($_POST["selectedCheckboxes"]);

        // Define the mapping of checkbox ids to Python script names
        $pythonScriptMapping = array(
            "Alkoutlet" => "web_scrapeAlkoutlet.py",
            "Barbora" => "web_scrapeBarb.py",
            "Citro" => "web_scrapeCitro.py",
            "Lats" => "web_scrapeLats.py",
            "Rimi" => "web_scrapeRimi.py"
        );
        
        // Initialize an array to hold checkboxes that need to be renamed
        $checkboxesToRename = array();
        
        // Loop through each selected checkbox
        foreach ($selectedCheckboxes as $checkboxId) {
            // Check if the checkbox id exists in the mapping
            if (array_key_exists($checkboxId, $pythonScriptMapping)) {
                // Add a new entry to the array for renaming
                $checkboxesToRename[$checkboxId] = $pythonScriptMapping[$checkboxId];
            }
        }
        
        // Loop through the checkboxes that need to be renamed
        foreach ($checkboxesToRename as $checkboxId => $newName) {
            // Rename the Python script
            $oldName = $checkboxId . ".py";
            rename($oldName, $newName);

            $renamedCheckboxes[$checkboxId] = $newName;
        
            $log_message = "Renamed script: $oldName to $newName\n";
            file_put_contents($log_file, $log_message, FILE_APPEND);
       
        }

        // Define the path to the scripts.py Python script
        $scriptsPath = "C:\\xampp\\htdocs\\Datu-ieguve\\PY-READER\\scripts.py";

        // Prepare the command to execute, passing the list of renamed scripts as arguments
        $command = "python \"$scriptsPath\" " . implode(" ", array_values($renamedCheckboxes));
        $log_message = "script: $command, $output\n";
        file_put_contents($log_file, $log_message, FILE_APPEND);

        
        // Open command prompt and run the script
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
   
        // selectedCheckboxes parameter is not set
        logMessage("No selected checkboxes received.");
    }
} else {
    $sql = "UPDATE statuss SET button_state = false";
    $result = pg_query($savienojums, $sql);
    // Invalid request method
    logMessage("Invalid request method.");
}
file_put_contents($log_file, $log_message, FILE_APPEND);
?>
