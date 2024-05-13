<?php
// Include the file for database connection
require("../connectDB.php");
require_once '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
$log_file = 'debug.log';
$log_message = '';
// Create a new Spreadsheet object
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Database tables to retrieve data from
$tables = array(
    'preces',
    'alkoutlet',
    'barbora',
    'citro',
    'lats',
    'rimi'
);

$all_column_names = array();

// Initialize row index
$rowIndex = 1;

// Loop through each table
foreach ($tables as $table) {
    // Retrieve column names from the database table
    $sql_columns = "SELECT column_name FROM information_schema.columns WHERE table_name='$table'";
    $result_columns = pg_query($savienojums, $sql_columns);

    // Fetch column names and store them in the array
    while ($row = pg_fetch_assoc($result_columns)) {
        // Exclude 'id' column for the 'preces' table
        if ($table !== 'preces' || $row['column_name'] !== 'id') {
            $all_column_names[] = $row['column_name'];
        }
    }
}

// Remove duplicate column names
$all_column_names = array_unique($all_column_names);

// Write all column names to the Excel worksheet
$columnIndex = 1;
foreach ($all_column_names as $column_name) {
    $sheet->setCellValue([$columnIndex++, 1], $column_name);
    $log_message .= "Column: $column_name\n";
}

// Reset row index
$rowIndex = 2;



$all_column_names = array();

// Initialize arrays to store data indexed by artikuls
$table_data = array();
foreach ($tables as $table) {
    $table_data[$table] = array();
}






// Loop through each table
foreach ($tables as $table) {
    // Retrieve column names from the database table
    $sql_columns = "SELECT column_name FROM information_schema.columns WHERE table_name='$table'";
    $result_columns = pg_query($savienojums, $sql_columns);

    // Fetch column names and store them in the array
    while ($row = pg_fetch_assoc($result_columns)) {
        // Exclude 'id' column for the 'preces' table
        if ($table !== 'preces' || $row['column_name'] !== 'id') {
            $all_column_names[] = $row['column_name'];
        }
    }

    // Retrieve data from the database table
    $sql_data = "SELECT * FROM $table";
    $result_data = pg_query($savienojums, $sql_data);

    // Check if there are rows in the result
    if ($result_data) {
        // Output data of each row
        while ($row = pg_fetch_assoc($result_data)) {
            // Store data indexed by artikuls
            $artikuls = isset($row['artikuls']) ? $row['artikuls'] : null;
            if ($artikuls !== null) {
                // Store row data in the corresponding table array
                $table_data[$table][$artikuls] = $row;
            }
        }
    }
}





// Remove duplicate column names
$all_column_names = array_unique($all_column_names);

// Write all column names to the Excel worksheet
$columnIndex = 1;
foreach ($all_column_names as $column_name) {
    $sheet->setCellValue([$columnIndex++, 1], $column_name);
}


$rowIndex = 2;

// Iterate over unique artikuls values
foreach ($table_data['preces'] as $artikuls => $preces_row) {
    // Write data to the Excel worksheet
    $columnIndex = 1;
    foreach ($all_column_names as $column_name) {
        // If column exists in the current row, write its value; otherwise, write null
        $value = isset($preces_row[$column_name]) ? $preces_row[$column_name] : null;
        $sheet->setCellValue([$columnIndex++, $rowIndex], $value);
    }

    // Write corresponding row data from other tables
    foreach ($tables as $table) {
        // Skip 'preces' table as it has already been written
        if ($table === 'preces') {
            continue;
        }

        // Check if the table has data for the current artikuls
        if (isset($table_data[$table][$artikuls])) {
            // Write data from the corresponding table
            $table_row = $table_data[$table][$artikuls];
            foreach ($all_column_names as $column_name) {
                // If column exists in the current row, write its value; otherwise, write null
                $value = isset($table_row[$column_name]) ? $table_row[$column_name] : null;
                $sheet->setCellValue([$columnIndex++, $rowIndex], $value);
            }
        } else {
            // Write null values for columns from the current table
            $columnCount = count($all_column_names);
            for ($i = 0; $i < $columnCount; $i++) {
             
                $sheet->setCellValue([$columnIndex++, $rowIndex], null);
            }
        }
    }

    // Move to the next row
    $rowIndex++;
}






// Append the log message to the debug log file
file_put_contents($log_file, $log_message, FILE_APPEND);

// Save the spreadsheet to a file named "debug.xlsx"
$writer = new Xlsx($spreadsheet);
$writer->save('debug.xlsx');

// Close the database connection

echo "Data from multiple tables has been retrieved and written to debug.xlsx successfully!";
?>
