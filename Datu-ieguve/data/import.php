<?php
require("../connectDB.php");
require_once '../vendor/autoload.php'; // Include the Composer autoloader for PhpSpreadsheet
require("../script-database.js");

use PhpOffice\PhpSpreadsheet\IOFactory;

// Log the received parameters to the debug log file
$log_file = 'debug.log';
$log_message = '';

$log_message .= "Contents of \$_FILES array: " . print_r($_FILES, true) . "\n";

if(isset($_FILES["file"])) {
    // Check if file was uploaded without errors
    if($_FILES["file"]["error"] == 0) {
        $file_name = $_FILES["file"]["name"];
        $log_message = "Received file: $file_name\n";

        // Append additional information about the file
        $log_message .= "File size: " . $_FILES["file"]["size"] . " bytes\n";
        $log_message .= "Temporary file path: " . $_FILES["file"]["tmp_name"] . "\n";
        $log_message .= "File type: " . $_FILES["file"]["type"] . "\n";

        // Check file extension
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        if($file_ext == "xls" || $file_ext == "xlsx") {
            // Load the Excel file
            $spreadsheet = IOFactory::load($_FILES["file"]["tmp_name"]);

            // Get the active sheet
            $sheet = $spreadsheet->getActiveSheet();

            // Iterate through each row of the active sheet
            foreach ($sheet->getRowIterator() as $row) {
                // Get cell values for the current row
                $rowData = [];
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false); // Loop through all cells, even if empty

                foreach ($cellIterator as $cell) {
                    $rowData[] = $cell->getValue();
                }

                // Check if there are non-empty cells to update
                $updateColumns = [];
                if (!empty($rowData[2])) {
                    $updateColumns[] = "barbora = '" . $rowData[2] . "'";
                }
                if (!empty($rowData[3])) {
                    $updateColumns[] = "lats = '" . $rowData[3] . "'";
                }
                if (!empty($rowData[4])) {
                    $updateColumns[] = "citro = '" . $rowData[4] . "'";
                }
                if (!empty($rowData[5])) {
                    $updateColumns[] = "rimi = '" . $rowData[5] . "'";
                }
                if (!empty($rowData[6])) {
                    $updateColumns[] = "alkoutlet = '" . $rowData[6] . "'";
                }

                // Construct and execute SQL UPDATE query only if there are non-empty cells to update
                if (!empty($updateColumns)) {
                    // Construct SQL UPDATE query
                    $sql = "UPDATE web_preces_db SET ";
                    $sql .= implode(", ", $updateColumns);
                    $sql .= " WHERE artikuls = '" . $rowData[0] . "'";

                    // Execute SQL query using appropriate method for PgSql
                    $result = pg_query($sql);
                    if (!$result) {
                        $log_message .= "Error updating data: " . pg_last_error() . "\n";
                    }
                }
            }

            // Log success message
            $log_message .= "Data updated successfully!\n";
        } else {
            // Log error message for invalid file extension
            $log_message .= "Error: Only Excel files are allowed!\n";
          
          
        }
    } else {
        // Log error message for file upload error
        $log_message .= "Error uploading file: ";
        
    }
} else {
    // Log error message if 'file' parameter is not set
    $log_message .= "Error: 'file' parameter is not set!\n";
}

// Append the log message to the debug log file
file_put_contents($log_file, $log_message, FILE_APPEND);
?>
