<?php
require('../connectDB.php');

$batch_size = isset($_GET['batch_size']) ? intval($_GET['batch_size']) : 30; 

$total_products_sql = "
    SELECT COUNT(p.*) 
    AS total
    FROM preces p
    LEFT JOIN web_preces_db w ON p.artikuls = w.artikuls
    WHERE p.stop_prece = false 
    AND (
        (w.barbora IS NOT NULL AND w.barbora <> '') OR
        (w.lats IS NOT NULL AND w.lats <> '') OR
        (w.citro IS NOT NULL AND w.citro <> '') OR
        (w.rimi IS NOT NULL AND w.rimi <> '') OR
        (w.alkoutlet IS NOT NULL AND w.alkoutlet <> '')
    )";
$total_products_result = pg_query($savienojums, $total_products_sql);
$total_products_row = pg_fetch_assoc($total_products_result);
$total_products = intval($total_products_row['total']);


$total_pages = ceil($total_products / $batch_size);

echo $total_pages;
?>