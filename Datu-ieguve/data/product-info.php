<?php
require('../connectDB.php');
$log_file = 'debug.log';
$select_preces_SQL = "SELECT * FROM preces WHERE stop_prece = false ORDER BY id";
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
        $insert_SQL = "INSERT INTO web_preces_db (id, artikuls, nosaukums, barbora, lats, citro, rimi, alkoutlet, grupas_id, kateg_id) 
        VALUES (DEFAULT,'{$row['artikuls']}', '{$row['nosaukums']}', '', '', '', '', '', '{$row['grupas_id']}', '{$row['kateg_id']}')";
        $insert_result = pg_query($savienojums, $insert_SQL);

        if(!$insert_result){
            die("Insert error: " . pg_last_error($savienojums));
        }
    }
}






    
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1; 
    $batch_size = isset($_GET['batch_size']) ? intval($_GET['batch_size']) : 20; 

    
    $offset = ($page - 1) * $batch_size;

   
    $select_product_SQL = "SELECT * FROM web_preces_db ORDER BY id LIMIT $batch_size OFFSET $offset";
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