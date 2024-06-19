<?php
require('../connectDB.php');
$log_file = 'debug.log';
$select_preces_SQL = "SELECT * FROM preces WHERE stop_prece = false";
$select_preces_result = pg_query($savienojums, $select_preces_SQL);

if(!$select_preces_result){
    die("Kļūda!".pg_last_error($savienojums));
}

while($row = pg_fetch_assoc($select_preces_result)){
  
    $select_web_preces_SQL = "SELECT * FROM web_preces_db WHERE artikuls = '{$row['artikuls']}'";
    $select_web_preces_result = pg_query($savienojums, $select_web_preces_SQL);

    if(!$select_web_preces_result){
        die("Kļūda!".pg_last_error($savienojums));
    }

   
    if(pg_num_rows($select_web_preces_result) == 0){
        $insert_SQL = "INSERT INTO web_preces_db (artikuls, nosaukums, barbora, lats, citro, rimi, alkoutlet, grupas_id, kateg_id) 
        VALUES ('{$row['artikuls']}', '{$row['nosaukums']}', '', '', '', '', '', '{$row['grupas_id']}', '{$row['kateg_id']}')";
        $insert_result = pg_query($savienojums, $insert_SQL);

        if(!$insert_result){
            die("Insert error: " . pg_last_error($savienojums));
        }
    }
}




    $select_product_SQL = "SELECT * FROM web_preces_db ORDER BY id";
    $select_product_result = pg_query($savienojums, $select_product_SQL);



if(!$select_product_result){
    die("Kļūda!".pg_last_error($savienojums));
}

while($row = pg_fetch_assoc($select_product_result)){
    $json[] = array(
        
        'artikuls' => $row['artikuls'],
        'nosaukums' => $row['nosaukums'],
        'barbora' => $row['barbora'],
        'lats' => $row['lats'],
        'citro' => $row['citro'],
        'rimi' => $row['rimi'],
        'alkoutlet' => $row['alkoutlet'],
        'id' => $row['id'],
        'kateg_id' => $row['kateg_id'],
        'grupas_id' => $row['grupas_id']
       

    );
  
}


$jsonstring = json_encode($json);
echo $jsonstring;


?>