<?php
require("../connectDB.php");

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

// Log file
$log_file = 'sse_log.txt';

// Function to log messages
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

// Function to fetch statuses from the PostgreSQL table
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

    // Create the button data object
    $buttonData = json_encode(['button_state' => $buttonState]);
    logMessage($buttonData);
    // Send the button state using SSE protocol
    echo "data: $buttonData\n\n";
    ob_flush();
    flush();

    return $buttonState; // Return the button state as well
}

// Fetch current statuses
$currentStatuses = fetchStatuses();

if (empty($currentStatuses)) {
    logMessage("No statuses found in the database.");
    echo "data: {\"error\": \"No statuses found\"}\n\n";
    ob_flush();
    flush();
    exit();
}

// Log initial statuses
logMessage("Initial statuses: " . json_encode($currentStatuses));

// Send initial statuses
foreach ($currentStatuses as $currentStatus) {
    foreach ($currentStatus as $column => $status) {
        // Create a JSON object with the column name and status
        $data = json_encode(['column' => $column, 'status' => $status]);
        
        // Log the data before sending
        logMessage("Sending data: $data");

        // Send the JSON object
        echo "data: $data\n\n";
        ob_flush();
        flush();
    }
}

// Main SSE loop
while (true) {
    // Fetch current statuses
    $currentStatuses = fetchStatuses();
    
    // Fetch button state
    $buttonState = fetchButtonState();

    if (!empty($currentStatuses)) {
    
        // Check if there's any change compared to the previous read
        if ($currentStatuses != $lastStatuses) {
            foreach ($currentStatuses as $currentStatus) {
                foreach ($currentStatus as $column => $status) {
                    // Create a JSON object with the column name and status
                    $data = json_encode(['column' => $column, 'status' => $status]);
                    
                    // Log the data before sending
                    logMessage("Sending data: $data");
                    $buttonData = json_encode(['button_state' => $buttonState]);
                    logMessage("Sending button state: $buttonData");

                    // Send the JSON object
                    echo "data: $data\n\n";

                    ob_flush();
                    flush();
                }
            }
            // Update last read statuses
            $lastStatuses = $currentStatuses;
        }
       
        // Send button state
     
    } else {
        logMessage("No statuses found in the database.");       
        ob_flush();
        flush();
        exit();
    }

    // Wait for 1 second before checking again
    sleep(1);
}
?>
