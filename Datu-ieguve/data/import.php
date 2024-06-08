<?php
require("../connectDB.php");
require_once '../vendor/autoload.php'; 
require("../script-database.js");

use PhpOffice\PhpSpreadsheet\IOFactory;
$log_file = 'debug.log';
$log_message = '';
$log_message .= "Contents of \$_FILES array: " . print_r($_FILES, true) . "\n";
// Pārbauda, vai fails ir augšupielādēts
if(isset($_FILES["file"])) {
    // Pārbauda, vai nav augšupielādes kļūdas
    if($_FILES["file"]["error"] == 0) {
        $file_name = $_FILES["file"]["name"];
        $log_message = "Received file: $file_name\n";
        $log_message .= "File size: " . $_FILES["file"]["size"] . " bytes\n";
        $log_message .= "Temporary file path: " . $_FILES["file"]["tmp_name"] . "\n";
        $log_message .= "File type: " . $_FILES["file"]["type"] . "\n";

        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        // Pārbauda, vai fails ir Excel
        if($file_ext == "xls" || $file_ext == "xlsx") {
            // Ielādēt Excel izklājlapu
            $spreadsheet = IOFactory::load($_FILES["file"]["tmp_name"]);    
            $sheet = $spreadsheet->getActiveSheet();       
            // Iziet katru izklājlapas rindu
            foreach ($sheet->getRowIterator() as $row) {
                //Izvedo rindu datu masīvu
                $rowData = [];

                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);
                // Iziet katru rindas šūnu
                foreach ($cellIterator as $cell) {
                    // Iegūstiet šūnas vērtību un pievienojiet rindas datu masīvam
                    $rowData[] = $cell->getValue();
                }
                // Izveido masīvu, lai saglabātu atjaunināmās kolonnas
                $updateColumns = [];
                // Pārbauda, vai šūnas dati nav tukši, un izveidojo atjaunināšanas kolonnu masīvu
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
                // Pārbauda, vai ir jāatjaunina kolonnas
                if (!empty($updateColumns)) {     
                    // Izveido SQL vaicājumu  
                    $sql = "UPDATE web_preces_db SET ";
                    $sql .= implode(", ", $updateColumns);
                    $sql .= " WHERE artikuls = '" . $rowData[0] . "'";       
                    // Izpildīta SQL vaicājumu  
                    $result = pg_query($sql);
                    if (!$result) {
                        $log_message .= "Error updating data: " . pg_last_error() . "\n";
                    }
                }
            }
            $log_message .= "Data updated successfully!\n";
        } else {  
            $log_message .= "Error: Only Excel files are allowed!\n"; 
        }
    } else {  
        $log_message .= "Error uploading file: ";     
    }
} else {
    $log_message .= "Error: 'file' parameter is not set!\n";
}
file_put_contents($log_file, $log_message, FILE_APPEND);
?>
