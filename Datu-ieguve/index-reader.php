
<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Datu krātuve</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style-reader.css" />
    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href=" https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />

    <link href="https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet">


    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"defer> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" defer></script>
    <script src="script-reader.js" defer></script>
    <script src="script-sse.js" defer></script>



</head>
<body>
<?php
     
        require("nav.php");
        require("indicator.php");
       
    ?>
     <div class="title-reader"  >

        <div class="ind-container">
        <form action="">
          
            
        </form>

        <button class="btn disabled"  id="new">Palaist datu lasītāju</button>
        
        
        


    </div>

 


        <div class="modal_conform">
            <div class="conform">
              
                <h4 id="productFormHeading">Vai tiešām vēlies palaist datu lāsītāju?</h4>
                <hr>
                <form id="checkGroup">

                    <div class="formElements" id="filter" >
                        <ul class="checkbox">
                            <div class="column">  
                                <li id="BarboraLi"><label for="Barbora"><input type="checkbox" id="Barbora" checked="true"> Barbora</label></li>                   
                                <li id="LatsLi"><label for="Lats"><input type="checkbox" id="Lats" checked="true"> Lats</label></li>
                                <li id="CitroLi"><label for="Citro"><input type="checkbox" id="Citro" checked="true"> Citro</label></li>                            
                                <li id="RimiLi"><label for="Rimi"><input type="checkbox" id="Rimi" checked="true"> Rimi</label></li>
                                <li id="AlkoutletLi"><label for="Alkoutlet"><input type="checkbox" id="Alkoutlet" checked="true"> Alkoutlet</label></li>                                
                            </div>    
                        </ul>                       
                    </div>
                    <div class="buttons">
                        <button class="btn_2" id="launchScripts">Jā</button>
                        <div class="btn_2" id="close_modal" name="cancel">Nē</div>
                    </div>
                </form>
            </div>
        </div>

    

</body>
</html>

