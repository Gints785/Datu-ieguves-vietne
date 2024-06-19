<?php
require("../connectDB.php");

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

$log_file = 'sse_log.txt';

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
    
    } else {
     
        return false;
    }
    $buttonData = json_encode(['button_state' => $buttonState]);
  
    echo "data: $buttonData\n\n";
    ob_flush();
    flush();

    return $buttonState; 
}

$currentStatuses = fetchStatuses();

if (empty($currentStatuses)) {
 
    echo "data: {\"error\": \"No statuses found\"}\n\n";
    ob_flush();
    flush();
    exit();
}

foreach ($currentStatuses as $currentStatus) {
    foreach ($currentStatus as $column => $status) {
       
        $data = json_encode(['column' => $column, 'status' => $status]);
               
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
                          
                    $buttonData = json_encode(['button_state' => $buttonState]);
                     
                    echo "data: $data\n\n";

                    ob_flush();
                    flush();
                }
            }
        
            $lastStatuses = $currentStatuses;
        }

    } else {
            
        ob_flush();
        flush();
        exit();
    } 
    sleep(1);
}
?>
