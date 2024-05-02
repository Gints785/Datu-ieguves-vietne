<?php
require('../connectDB.php');

$batch_size = isset($_GET['batch_size']) ? intval($_GET['batch_size']) : 20; // Number of rows per batch

// Fetch total number of products
$total_products_sql = "SELECT COUNT(*) AS total FROM web_preces_db";
$total_products_result = pg_query($savienojums, $total_products_sql);
$total_products_row = pg_fetch_assoc($total_products_result);
$total_products = intval($total_products_row['total']);

// Calculate total number of pages
$total_pages = ceil($total_products / $batch_size);

// Output total pages
echo $total_pages;
?>