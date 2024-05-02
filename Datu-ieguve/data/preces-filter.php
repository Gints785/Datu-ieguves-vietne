<?php
require("../connectDB.php");

$select_data_SQL = "
    SELECT p.* 
    FROM preces p
    LEFT JOIN web_preces_db w ON p.artikuls = w.artikuls
    WHERE p.stop_prece = false 
    AND (
        (w.barbora IS NOT NULL AND w.barbora <> '') OR
        (w.lats IS NOT NULL AND w.lats <> '') OR
        (w.citro IS NOT NULL AND w.citro <> '') OR
        (w.rimi IS NOT NULL AND w.rimi <> '') OR
        (w.alkoutlet IS NOT NULL AND w.alkoutlet <> '')
    )
    ORDER BY p.artikuls";
$select_data_result = pg_query($savienojums, $select_data_SQL);

if(!$select_data_result){
    die("Kļūda!".pg_last_error($savienojums));
}

$data = array(); 
while($row = pg_fetch_assoc($select_data_result)){
 
    //=========================================================================================================
    $select_barbora_SQL = 'SELECT * FROM "barbora" WHERE artikuls = \'' . $row['artikuls'] . '\'';
    $select_barbora_result = pg_query($savienojums, $select_barbora_SQL);
    $barbora_row = pg_fetch_assoc($select_barbora_result);
    
    $select_lats_SQL = 'SELECT * FROM "lats" WHERE artikuls = \'' . $row['artikuls'] . '\'';
    $select_lats_result = pg_query($savienojums, $select_lats_SQL);
    $lats_row = pg_fetch_assoc($select_lats_result);

    $select_citro_SQL = 'SELECT * FROM "citro" WHERE artikuls = \'' . $row['artikuls'] . '\'';
    $select_citro_result = pg_query($savienojums, $select_citro_SQL);
    $citro_row = pg_fetch_assoc($select_citro_result);

    $select_rimi_SQL = 'SELECT * FROM "rimi" WHERE artikuls = \'' . $row['artikuls'] . '\'';
    $select_rimi_result = pg_query($savienojums, $select_rimi_SQL);
    $rimi_row = pg_fetch_assoc($select_rimi_result);

    $select_alkoutlet_SQL = 'SELECT * FROM "alkoutlet" WHERE artikuls = \'' . $row['artikuls'] . '\'';
    $select_alkoutlet_result = pg_query($savienojums, $select_alkoutlet_SQL);
    $alkoutlet_row = pg_fetch_assoc($select_alkoutlet_result);
    //=========================================================================================================

    $cena_barbora = isset($barbora_row['barbora_cena']) ? $barbora_row['barbora_cena'] : '';
    $barbora_akcija = isset($barbora_row['barbora_akcija']) ? $barbora_row['barbora_akcija'] : '';
    $date_barbora = isset($barbora_row['barbora_datums']) ? date('Y-m-d', strtotime($barbora_row['barbora_datums'])) : '';
    $date_barbora_7 = isset($barbora_row['barbora_datums_7']) ? date('Y-m-d', strtotime($barbora_row['barbora_datums_7'])) : '';
    
    $cena_lats = isset($lats_row['lats_cena']) ? $lats_row['lats_cena'] : '';
    $lats_akcija = isset($lats_row['lats_akcija']) ? $lats_row['lats_akcija'] : '';
    $date_lats = isset($lats_row['lats_datums']) ? date('Y-m-d', strtotime($lats_row['lats_datums'])) : '';
    $date_lats_7 = isset($lats_row['lats_datums_7']) ? date('Y-m-d', strtotime($lats_row['lats_datums_7'])) : '';
    
    $cena_citro = isset($citro_row['citro_cena']) ? $citro_row['citro_cena'] : '';
    $citro_akcija = isset($citro_row['citro_akcija']) ? $citro_row['citro_akcija'] : '';
    $date_citro = isset($citro_row['citro_datums']) ? date('Y-m-d', strtotime($citro_row['citro_datums'])) : '';
    $date_citro_7 = isset($citro_row['citro_datums_7']) ? date('Y-m-d', strtotime($citro_row['citro_datums_7'])) : '';

    
    $cena_rimi = isset($rimi_row['rimi_cena']) ? $rimi_row['rimi_cena'] : '';
    $rimi_akcija = isset($rimi_row['rimi_akcija']) ? $rimi_row['rimi_akcija'] : '';
    $date_rimi = isset($rimi_row['rimi_datums']) ? date('Y-m-d', strtotime($rimi_row['rimi_datums'])) : '';
    $date_rimi_7 = isset($rimi_row['rimi_datums_7']) ? date('Y-m-d', strtotime($rimi_row['rimi_datums_7'])) : '';


    $cena_alkoutlet = isset($alkoutlet_row['alkoutlet_cena']) ? $alkoutlet_row['alkoutlet_cena'] : '';
    $alkoutlet_akcija = isset($alkoutlet_row['alkoutlet_akcija']) ? $alkoutlet_row['alkoutlet_akcija'] : '';
    $date_alkoutlet = isset($alkoutlet_row['alkoutlet_datums']) ? date('Y-m-d', strtotime($alkoutlet_row['alkoutlet_datums'])) : '';
    $date_alkoutlet_7 = isset($alkoutlet_row['alkoutlet_datums_7']) ? date('Y-m-d', strtotime($alkoutlet_row['alkoutlet_datums_7'])) : '';
    

    
    $data[] = array(
        'artikuls' => $row['artikuls'],
        'nosaukums' => $row['nosaukums'],
        'cena' => number_format($row['pard_cena1'], 2, '.', ','),
        'kateg_id' => $row['kateg_id'],
        'grupas_id' => $row['grupas_id'],

        'cena_barbora' => $cena_barbora, 
        'barbora_akcija' => $barbora_akcija, 
        'date_barbora' => $date_barbora,
        'date_barbora_7' => $date_barbora_7,

        'cena_lats' => $cena_lats,
        'lats_akcija' => $lats_akcija, 
        'date_lats' => $date_lats,
        'date_lats_7' => $date_lats_7,

        'cena_citro' => $cena_citro,
        'citro_akcija' => $citro_akcija, 
        'date_citro' => $date_citro,
        'date_citro_7' => $date_citro_7,

        'cena_rimi' => $cena_rimi,
        'rimi_akcija' => $rimi_akcija, 
        'date_rimi' => $date_rimi,
        'date_rimi_7' => $date_rimi_7,


        'cena_alkoutlet' => $cena_alkoutlet,
        'alkoutlet_akcija' => $alkoutlet_akcija, 
        'date_alkoutlet' => $date_alkoutlet,
        'date_alkoutlet_7' => $date_alkoutlet_7,

    );
}


$jsonstring = json_encode($data);
echo $jsonstring;
?>


