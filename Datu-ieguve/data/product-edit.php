<?php
require("../connectDB.php");

if (isset($_POST['id'])) {
    $id = $_POST['id'];
    $p_artikuls = $_POST['artikuls'];
    $p_barbora = isset($_POST['barbora']) ? $_POST['barbora'] : '';
    $p_lats = isset($_POST['lats']) ? $_POST['lats'] : '';
    $p_citro = isset($_POST['citro']) ? $_POST['citro'] : '';
    $p_rimi = isset($_POST['rimi']) ? $_POST['rimi'] : '';
    $p_alkoutlet = isset($_POST['alkoutlet']) ? $_POST['alkoutlet'] : '';

    $update_web_SQL = "UPDATE web_preces_db SET 
        barbora = '$p_barbora',
        lats = '$p_lats',
        citro = '$p_citro',
        rimi = '$p_rimi',
        alkoutlet = '$p_alkoutlet' 
        WHERE preceid = $id";
    $update_web_result = pg_query($savienojums, $update_web_SQL);

    if (!$update_web_result) {
        $error_message = "Kļūda! " . pg_last_error($savienojums);
        error_log($error_message, 3, "debug.log");
        die($error_message);
    }

    echo "Web rediģēts!";
}
?>