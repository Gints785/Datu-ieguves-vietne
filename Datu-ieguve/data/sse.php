<?php
require("../connectDB.php");

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');


$log_file = 'sse_log.txt';


function logMessage($message) {
    global $log_file;
    $log_message = date("Y-m-d H:i:s") . " - " . $message . PHP_EOL;
    file_put_contents($log_file, $log_message, FILE_APPEND);
}

function customErrorHandler($errno, $errstr, $errfile, $errline) {
    $error_message = "[$errno] $errstr in $errfile at line $errline";
    logError($error_message);
}

set_error_handler("customErrorHandler");


function fetchStatuses() {
    global $savienojums;
    $query = "SELECT barbora, lats, citro, rimi, alkoutlet FROM statuss";
    $result = pg_query($savienojums, $query);
    
    if ($result) {
        $statuses = [];
        while ($row = pg_fetch_assoc($result)) {
            $statuses[] = $row;
        }
        return $statuses;
    } else {
        logMessage("Error fetching statuses from database: " . pg_last_error($savienojums));
        return [];
    }
}

function fetchButtonState() {
    global $savienojums;
    $query = "SELECT button_state FROM statuss";
    $result = pg_query($savienojums, $query);

    if ($result) {
        $row = pg_fetch_assoc($result);
        $buttonState = ($row['button_state'] === 't') ? true : false;
        logMessage("Button state fetched: " . ($buttonState ? 'true' : 'false'));
    } else {
        logMessage("Error fetching button state from database: " . pg_last_error($savienojums));
        return false;
    }

   
    $buttonData = json_encode(['button_state' => $buttonState]);
    logMessage($buttonData);
 
    echo "data: $buttonData\n\n";
    ob_flush();
    flush();

    return $buttonState; 
}


$currentStatuses = fetchStatuses();

if (empty($currentStatuses)) {
    logMessage("No statuses found in the database.");
    echo "data: {\"error\": \"No statuses found\"}\n\n";
    ob_flush();
    flush();
    exit();
}


logMessage("Initial statuses: " . json_encode($currentStatuses));


foreach ($currentStatuses as $currentStatus) {
    foreach ($currentStatus as $column => $status) {
       
        $data = json_encode(['column' => $column, 'status' => $status]);
        
     
        logMessage("Sending data: $data");

        
        echo "data: $data\n\n";
        ob_flush();
        flush();
    }
}


while (true) {
   
    $currentStatuses = fetchStatuses();
    

    $buttonState = fetchButtonState();

    if (!empty($currentStatuses)) {
    
      
        if ($currentStatuses != $lastStatuses) {
            foreach ($currentStatuses as $currentStatus) {
                foreach ($currentStatus as $column => $status) {
       
                    $data = json_encode(['column' => $column, 'status' => $status]);
                    
               
                    logMessage("Sending data: $data");
                    $buttonData = json_encode(['button_state' => $buttonState]);
                    logMessage("Sending button state: $buttonData");

                 
                    echo "data: $data\n\n";

                    ob_flush();
                    flush();
                }
            }
        
            $lastStatuses = $currentStatuses;
        }
       
     
     
    } else {
        logMessage("No statuses found in the database.");       
        ob_flush();
        flush();
        exit();
    }

   
    sleep(1);
}
?>
