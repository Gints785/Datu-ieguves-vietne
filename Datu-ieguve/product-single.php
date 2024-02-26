<?php

    require("connectDB.php");

    if(isset($_POST['id'])){
        $id = pg_escape_string($savienojums, $_POST['id']);
        $select_pieteikums_SQL = "SELECT * FROM web_preces_db WHERE preceid = $id";
        $select_pieteikums_result = pg_query($savienojums, $select_pieteikums_SQL);

        if(!$select_pieteikums_result){
            die("Kļūda!".pg_last_error($savienojums));
        }
            $json = array();

    while($row = pg_fetch_assoc($select_pieteikums_result)){
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


    $jsonstring = json_encode($json[0]);
    echo $jsonstring;
}
?>