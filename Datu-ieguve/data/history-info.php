<?php
// Include the file that establishes the PostgreSQL connection
require("../connectDB.php");

// Check if dataID and dataWEB parameters are present
if (!isset($_GET['dataID']) || !isset($_GET['dataWEB']) || !isset($_GET['dataWEB_2'])) {
    echo "Error: Both dataID and dataWEB parameters are required.";
    exit; // Stop further execution
}

// Get the values of dataID and dataWEB from the AJAX request
$dataID = $_GET['dataID'];
$dataWEB = $_GET['dataWEB'];
$dataWEB_2 = $_GET['dataWEB_2'];

$columnsToSelect = "datums, cena"; // Default columns
$columnsToSelect_2 = "akcija, url";

// Adjust columns based on the table name if needed
switch ($dataWEB) {
    case 'barbora_history':
        $columnsToSelect = "barbora_datums, barbora_cena";
        break;
    case 'lats_history':
        $columnsToSelect = "lats_datums, lats_cena";
        break;
    case 'rim':
        // Assuming default columns are already set for 'rim'
        break;
    default:
        // Handle default case or error condition
        break;
}

switch ($dataWEB_2) {
    case 'barbora':
        $columnsToSelect_2 = "barbora_akcija, barbora_url";
        break;
    case 'lats':
        $columnsToSelect_2 = "lats_akcija, lats_url";
        break;
    case 'rim':
        // Assuming default columns are already set for 'rim'
        break;
    default:
        // Handle default case or error condition
        break;
}

// Prepare the SQL query based on the received data
$query = "SELECT $columnsToSelect FROM $dataWEB WHERE artikuls = '$dataID'";
$query2 = "SELECT $columnsToSelect_2 FROM $dataWEB_2 WHERE artikuls = '$dataID'";

// Execute the query
$result = pg_query($savienojums, $query);
$result2 = pg_query($savienojums, $query2);

if (!$result || !$result2) {
    echo "Error executing queries.";
    
    exit;
}
// Create an array to hold the data
$data = array();




// Create an array to hold the data

// Fetch data from the PostgreSQL database
if ($result) {
    while ($row = pg_fetch_assoc($result)) {
        // Create an array to hold the formatted data for this row
        $formattedData = array();

        // Iterate over each column in the row
        foreach ($row as $columnName => $columnValue) {
            switch ($columnName) {
                case 'barbora_datums':
                case 'lats_datums':
                case 'citro_datums':
                    // Convert the timestamp to a PHP date object
                    $date = new DateTime($columnValue);
                    // Format the date as needed and add it to the formatted data array
                    $formattedData[] = $date->format('Y-m-d H:i:s');
                    break;
                case 'barbora_cena':
                case 'lats_cena':
                case 'citro_cena':
                    // Convert to float and add it to the formatted data array
                    $formattedData[] = (float)$columnValue;
                    break;
                default:
                    // For other columns, just add the value as it is
                    $formattedData[] = $columnValue;
                    break;
            }
        }

        // Add the formatted data for this row to the main data array
        $data[] = $formattedData;
    }
} else {
    // Handle error if query fails
    echo "Error executing query: " . pg_last_error($savienojums);
}

if ($result2) {
    while ($row = pg_fetch_assoc($result2)) {
        // Create an array to hold the formatted data for this row
        $formattedData = array();

        // Iterate over each column in the row
        foreach ($row as $columnName => $columnValue) {
            // You may need to adjust the column names based on your second query
            switch ($columnName) {
                case 'barbora_akcija':
                case 'lats_akcija':
                    // Format or process data as needed and add it to the formatted data array
                    $formattedData[] = (float) $columnValue;
                    break;
                case 'barbora_url':
                case 'lats_url':
                    // Assuming URLs are directly usable
                    $formattedData[] = $columnValue;
                    break;
                default:
                    // For other columns, just add the value as it is
                    $formattedData[] = $columnValue;
                    break;
            }
        }

        // Add the formatted data for this row to the main data array
        $data[] = $formattedData;
    }
} else {
    // Handle error if query fails
    echo "Error executing the second query: " . pg_last_error($savienojums);
}
// Close the PostgreSQL connection
pg_close($savienojums);

// Return data as JSON
echo json_encode($data);
?>
