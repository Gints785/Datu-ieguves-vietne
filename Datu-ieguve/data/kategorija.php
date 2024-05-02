<?php
require("../connectDB.php");


$select_data_SQL = 'SELECT * FROM "kategorijas" ORDER BY nosaukums ASC';
$select_data_result = pg_query($savienojums, $select_data_SQL);

if(!$select_data_result){
    die("Kļūda!".pg_last_error($savienojums));
}

$data = array(); 
while($row = pg_fetch_assoc($select_data_result)){
    $data[] = array(
        'id' => $row['id'], 
        'nosaukums' => $row['nosaukums'] 
    );
}


$jsonstring = json_encode($data);
echo $jsonstring;
?>

