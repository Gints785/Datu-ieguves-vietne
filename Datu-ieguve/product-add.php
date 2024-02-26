<?php
require("connectDB.php");

if (isset($_POST['id']) && isset($_POST['artikuls'])) {
    $id = $_POST['id'];
    $p_artikuls = $_POST['artikuls'];
    $p_barbora = isset($_POST['barbora']) ? $_POST['barbora'] : '';
    $p_lats = isset($_POST['lats']) ? $_POST['lats'] : '';
    $p_citro = isset($_POST['citro']) ? $_POST['citro'] : '';
    $p_rimi = isset($_POST['rimi']) ? $_POST['rimi'] : '';
    $p_alkoutlet = isset($_POST['alkoutlet']) ? $_POST['alkoutlet'] : '';


    $select_nosaukums_SQL = "SELECT nosaukums FROM data WHERE artikuls = '$p_artikuls'";
    $select_nosaukums_result = pg_query($savienojums, $select_nosaukums_SQL);

    if ($select_nosaukums_result && pg_num_rows($select_nosaukums_result) > 0) {
        $row = pg_fetch_assoc($select_nosaukums_result);
        $p_nosaukums = $row['nosaukums'];

 
        $log_file = 'debug.log';
        $log_message = "Received POST request with artikuls: $p_artikuls, selected nosaukums: $p_nosaukums\n";
        file_put_contents($log_file, $log_message, FILE_APPEND);

 
        $add_pieteikums_SQL = "INSERT INTO web_preces_db (artikuls, nosaukums, barbora, lats, citro, rimi, alkoutlet) 
                               VALUES ('$p_artikuls', '$p_nosaukums', '$p_barbora', '$p_lats', '$p_citro', '$p_rimi', '$p_alkoutlet')";
        $add_pieteikums_result = pg_query($savienojums, $add_pieteikums_SQL);






        if ($add_pieteikums_result) {
     
            $success_message = "Pietikums pievienots!";
            file_put_contents($log_file, $success_message . "\n", FILE_APPEND);
            echo $success_message;
        } else {
  
            $error_message = "Kļūda! " . pg_last_error($savienojums);
            file_put_contents($log_file, $error_message . "\n", FILE_APPEND);
            die($error_message);
        }
    } else {
   
        $error_message = "Kļūda! Nosaukums nav atrasts atbilstoši artikulam: $p_artikuls";
        file_put_contents($log_file, $error_message . "\n", FILE_APPEND);
        die($error_message);
    }
} else {
    echo "Kļūda! Nepieciešami dati nav saņemti.";
}
?>
