<?php
require('../connectDB.php');


$select_product_SQL = "SELECT * FROM web_preces_db ORDER BY artikuls";
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
        'id' => $row['preceid']
      

    );
}

$jsonstring = json_encode($json);
echo $jsonstring;
?>