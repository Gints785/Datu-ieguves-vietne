<?php
require("../connectDB.php");


$select_data_SQL = 'SELECT * FROM "data" ORDER BY "artikuls"';
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
    $date_barbora = isset($barbora_row['barbora_datums']) ? date('Y-m-d', strtotime($barbora_row['barbora_datums'])) : '';
    $date_barbora_7 = isset($barbora_row['barbora_datums_7']) ? date('Y-m-d', strtotime($barbora_row['barbora_datums_7'])) : '';
    
    $cena_lats = isset($lats_row['lats_cena']) ? $lats_row['lats_cena'] : '';
    $date_lats = isset($lats_row['lats_datums']) ? date('Y-m-d', strtotime($lats_row['lats_datums'])) : '';
    
    $cena_citro = isset($citro_row['citro_cena']) ? $citro_row['citro_cena'] : '';
    $date_citro = isset($citro_row['citro_datums']) ? date('Y-m-d', strtotime($citro_row['citro_datums'])) : '';
    
    $cena_rimi = isset($rimi_row['rimi_cena']) ? $rimi_row['rimi_cena'] : '';
    $date_rimi = isset($rimi_row['rimi_datums']) ? date('Y-m-d', strtotime($rimi_row['rimi_datums'])) : '';
    
    $cena_alkoutlet = isset($alkoutlet_row['alkoutlet_cena']) ? $alkoutlet_row['alkoutlet_cena'] : '';
    $date_alkoutlet = isset($alkoutlet_row['alkoutlet_datums']) ? date('Y-m-d', strtotime($alkoutlet_row['alkoutlet_datums'])) : '';

    
    $data[] = array(
        'artikuls' => $row['artikuls'],
        'nosaukums' => $row['nosaukums'],
        'cena' => $row['price'],

        'cena_barbora' => $cena_barbora, 
        'date_barbora' => $date_barbora,
        'date_barbora_7' => $date_barbora_7,

        'cena_lats' => $cena_lats,
        'date_lats' => $date_lats,

        'cena_citro' => $cena_citro,
        'date_citro' => $date_citro,

        'cena_rimi' => $cena_rimi,
        'date_rimi' => $date_rimi,

        'cena_alkoutlet' => $cena_alkoutlet,
        'date_alkoutlet' => $date_alkoutlet,

    );
}


$jsonstring = json_encode($data);
echo $jsonstring;
?>


