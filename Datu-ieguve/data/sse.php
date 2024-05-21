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

// Function to fetch statuses from the PostgreSQL table
function fetchStatuses() {
    global $savienojums;
    $query = "SELECT barbora, lats, citro, rimi, alkoutlet FROM statuss";
    $result = pg_query($savienojums, $query);
    logMessage("Checking.");
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

    if (!empty($currentStatuses)) {
        // Check if there's any change compared to the previous read
        if ($currentStatuses != $lastStatuses) {
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
            // Update last read statuses
            $lastStatuses = $currentStatuses;
        }
    } else {
        logMessage("No statuses found in the database.");
        echo "data: {\"error\": \"No statuses found\"}\n\n";
        ob_flush();
        flush();
        exit();
    }

    // Wait for 1 second before checking again
    sleep(1);
}
?>
