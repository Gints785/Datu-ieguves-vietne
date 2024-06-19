<?php

require("../connectDB.php");


if (!isset($_GET['dataID']) || !isset($_GET['dataWEB']) || !isset($_GET['dataWEB_2'])) {
    echo "Error: Both dataID and dataWEB parameters are required.";
    exit; 
}


$dataID = $_GET['dataID'];
$dataWEB = $_GET['dataWEB'];
$dataWEB_2 = $_GET['dataWEB_2'];

$columnsToSelect = "datums, cena, akcija"; 
$columnsToSelect_2 = "akcija, url";


switch ($dataWEB) {
    case 'barbora_history':
        $columnsToSelect = "barbora_datums, barbora_cena, barbora_akcija";
        break;
    case 'lats_history':
        $columnsToSelect = "lats_datums, lats_cena, lats_akcija";
        break;
    case 'citro_history':
        $columnsToSelect = "citro_datums, citro_cena, citro_akcija";
        break;        
    case 'rimi_history':
        $columnsToSelect = "rimi_datums, rimi_cena, rimi_akcija";      
        break;
    case 'alkoutlet_history':
        $columnsToSelect = "alkoutlet_datums, alkoutlet_cena, alkoutlet_akcija";      
        break;    
    default:
     
        break;
}

switch ($dataWEB_2) {
    case 'barbora':
        $columnsToSelect_2 = "barbora_nosaukums ,barbora_akcija, barbora_url, barbora_datums, barbora_cena";
        break;
    case 'lats':
        $columnsToSelect_2 = "lats_nosaukums ,lats_akcija, lats_url,lats_datums, lats_cena";
        break;
    case 'citro':
        $columnsToSelect_2 = "citro_nosaukums ,citro_akcija, citro_url,citro_datums, citro_cena";
        break;    
    case 'rimi':
        $columnsToSelect_2 = "rimi_nosaukums ,rimi_akcija, rimi_url, rimi_datums, rimi_cena";
        break;
    case 'alkoutlet':
        $columnsToSelect_2 = "alkoutlet_nosaukums ,alkoutlet_akcija, alkoutlet_url, alkoutlet_datums, alkoutlet_cena";
        break;    
    default:
       
        break;
}


$query = "SELECT $columnsToSelect FROM $dataWEB WHERE artikuls = '$dataID'";
$query2 = "SELECT $columnsToSelect_2 FROM $dataWEB_2 WHERE artikuls = '$dataID'";


$result = pg_query($savienojums, $query);
$result2 = pg_query($savienojums, $query2);

if (!$result || !$result2) {
    echo "Error executing queries.";
    
    exit;
}

$data = array();





if ($result) {
    while ($row = pg_fetch_assoc($result)) {
   
        $formattedData = array();

       
        foreach ($row as $columnName => $columnValue) {
            switch ($columnName) {
                case 'barbora_datums':
                case 'lats_datums':
                case 'citro_datums':
                case 'rimi_datums':
                case 'alkoutlet_datums':
                    $date = new DateTime($columnValue);
                    $formattedData[] = $date->format('Y-m-d H:i:s');
                    break;
                case 'barbora_cena':
                case 'lats_cena':
                case 'citro_cena':
                case 'rimi_cena':
                case 'alkoutlet_cena':

                    $formattedData[] = (float)$columnValue;
                    break;
                case 'barbora_akcija':
                case 'lats_akcija':
                case 'citro_akcija':    
                case 'rimi_akcija':
                case 'alkoutlet_akcija':
                    $formattedData[] = (float)$columnValue;
                    break;    


                default:
                    $formattedData[] = $columnValue;
                    break;
            }
        }

     
        $data[] = $formattedData;
    }
} else {
  
    echo "Error executing query: " . pg_last_error($savienojums);
}

if ($result2) {
  
    while ($row = pg_fetch_assoc($result2)) {
     
        $formattedData_2 = array();
        $specific_name = '';
       
        foreach ($row as $columnName => $columnValue) {
       
            switch ($columnName) {
                case 'barbora_akcija':
                case 'lats_akcija':
                case 'citro_akcija':    
                case 'rimi_akcija':
                case 'alkoutlet_akcija':
                
                    $formattedData_2[] = (float) $columnValue;
                    break;
                case 'barbora_url':
                case 'lats_url':
                case 'citro_url':
                case 'rimi_url':
                case 'alkoutlet_url':
                  
                    $formattedData_2[] = $columnValue;
                    break;
                case 'barbora_nosaukums':
                    $formattedData_2[] = $columnValue;
                    $specific_name = 'Barbora'; 
                    break;
                case 'lats_nosaukums':
                    $formattedData_2[] = $columnValue;
                    $specific_name = 'Lats'; 
                    break;
                case 'citro_nosaukums':
                    $formattedData_2[] = $columnValue;
                    $specific_name = 'Citro'; 
                    break;
                case 'rimi_nosaukums':
                    $formattedData_2[] = $columnValue;
                    $specific_name = 'Rimi'; 
                    break;
                case 'alkoutlet_nosaukums':
                    $formattedData_2[] = $columnValue;
                    $specific_name = 'Alkoutlet'; 
                    break;
                case 'barbora_cena':
                case 'lats_cena':
                case 'citro_cena':       
                case 'rimi_cena':    
                case 'alkoutlet_cena':                         
                    $formattedData_2[] = (float) $columnValue;
                    break;   
                case 'barbora_datums':
                case 'lats_datums':   
                case 'citro_datums':    
                case 'rimi_datums':   
                case 'alkoutlet_datums':      
                    
                    $date2 = new DateTime($columnValue);
                    $formattedData_2[] = $date2->format('d.m.Y');
           
                    break;               
                default:
                
                    $formattedData_2[] = $columnValue;
                    break;
            }
        }
        if (!empty($specific_name)) {
            array_splice($formattedData_2, 5, 0, $specific_name);
        }

       
        $data_info[] = $formattedData_2;
    }
} else {
    echo "Error executing the second query: " . pg_last_error($savienojums);
}
pg_close($savienojums);

$response = array(
    'data' => $data,
    'data_info' => $data_info
);


echo json_encode($response);
?>
