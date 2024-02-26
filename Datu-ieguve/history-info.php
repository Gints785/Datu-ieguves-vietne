<?php
// Include the file that establishes the PostgreSQL connection
require("connectDB.php");

// Check if dataID and dataWEB parameters are present
if (!isset($_GET['dataID']) || !isset($_GET['dataWEB'])) {
    echo "Error: Both dataID and dataWEB parameters are required.";
    exit; // Stop further execution
}

// Get the values of dataID and dataWEB from the AJAX request
$dataID = $_GET['dataID'];
$dataWEB = $_GET['dataWEB'];

// Prepare the SQL query based on the received data
$query = "SELECT barbora_datums, barbora_cena FROM $dataWEB WHERE artikuls = '$dataID'";

// Execute the query
$result = pg_query($savienojums, $query);

// Create an array to hold the data
$data = array();

// Fetch data from the PostgreSQL database
if ($result) {
    while ($row = pg_fetch_assoc($result)) {
        // Convert the timestamp to a PHP date object
        $date = new DateTime($row["barbora_datums"]);

        // Add data to the array
        $data[] = array(
            $date->format('Y-m-d H:i:s'), // Format the date as needed
            (float)$row["barbora_cena"]
        );
    }
} else {
    // Handle error if query fails
    echo "Error executing query: " . pg_last_error($savienojums);
}

// Close the PostgreSQL connection
pg_close($savienojums);

// Return data as JSON
echo json_encode($data);
?>
