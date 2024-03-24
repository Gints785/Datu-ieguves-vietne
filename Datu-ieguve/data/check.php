<?php
require("../connectDB.php");

// Check if artikuls exists in web_preces_db
$sql_web_preces_db = "SELECT COUNT(*) FROM web_preces_db WHERE artikuls = $1";
$stmt_web_preces_db = pg_prepare($savienojums, "web_preces_db_check", $sql_web_preces_db);
$result_web_preces_db = pg_execute($savienojums, "web_preces_db_check", [$_POST['artikuls']]);
$count_web_preces_db = pg_fetch_result($result_web_preces_db, 0, 0);

// Check if artikuls exists in data_table
$sql_data_table = "SELECT COUNT(*) FROM data WHERE artikuls = $1";
$stmt_data_table = pg_prepare($savienojums, "data_table_check", $sql_data_table);
$result_data_table = pg_execute($savienojums, "data_table_check", [$_POST['artikuls']]);
$count_data_table = pg_fetch_result($result_data_table, 0, 0);

if ($count_web_preces_db > 0) {
    echo 'eksiste';
} elseif ($count_data_table == 0) {
    echo 'neeksiste';
} else {

    echo 'success';
}
?>