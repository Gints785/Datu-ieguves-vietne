<?php
$servera_vards = "localhost";
$lietotajvards = "postgres"; 
$parole = "0000"; 
$db_nosaukums = "postgres"; 
$port = "5432"; 


$savienojums = pg_connect("host=$servera_vards port=$port dbname=$db_nosaukums user=$lietotajvards password=$parole");

//if(!$savienojums){
    //die("Pieslēgties neizdevas: ".pg_last_error());
//}else{
   //echo "Savienojums izveidots!";
//}
?>