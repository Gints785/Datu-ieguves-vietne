
<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Datu krātuve</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="style-reader.css" />
    <link rel="stylesheet" href=" https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"defer> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" defer></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js" defer></script>
    
    <script src="script.js" defer></script>

</head>
<body>
<?php
        require("connectDB.php");
        require("nav.php");
        require("indicator.php");
    ?>
<div class="title">
        <div class="name">
            <i class="fas fa-tasks"></i> Datu krātuve 
        </div>
        <div class="button-container">
        <select id="kateg" class="kat">
           
        </select>
        <select id="precgroup" class="pgr">
           
        </select>
        <input class="input_style" type="text" id="artikuls" placeholder="Artikuls" />
        <button class="btn" id="Price_selection">Atlasīt</button>
        <button class="btn" id="Reset_price_selection">Notīrīt</button>
        <button class="btn2" id="export">Eksportēt</button>
        </div>
      
       
   
      
        
            
    </div>



    <div class="container">
   
        <table>
            <tr class="first" >
                <th>Artikuls</th>
                <th >Preces nosaukums</th>
                <th style="text-align:center;">Cena datubāze</th>
                <th style="text-align:center;">Barbora</th>
                <th style="text-align:center;">Lats</th>
                <th style="text-align:center;">Citro</th>
                <th style="text-align:center;">Rimi</th>
                <th style="text-align:center;">Alkoutlet</th>
            </tr>
            <tbody id="preces_info"></tbody>
        </table>
        <div id="pagination" style="margin-bottom:3rem;">
            <button id="prevPage" class="material-symbols-outlined" style="border-right: solid 1px grey; padding-left:7px;">arrow_back_ios</button>
            <div class="" style="display: inline-block;">
            <input type="number" id="pageNumInput" min="1" value="1"  style="width: 25px;  0.3rem; display: inline-block;   color: grey;  font-weight: bold;  background: none;  " oninput="checkInputLength(this)">
            <p style="display: inline-block; font-size: 13px;">OF &nbsp&nbsp</p>
            <span id="totalPages" style="font-size: 13px;"></span>
            </div>
            <button id="nextPage" class="material-symbols-outlined" style="border-left: solid 1px grey; padding-left:7px;">arrow_forward_ios</button>
        
        </div>

    </div>
      


        <div class="modal" style="">
            <div class="apply_chart" >
                <div class="close_modal"><i class="fas fa-times"></i></div>
                <div class="r1">
                    <div class="r2">
                        <p>Nosaukums:</p>    
                        <p id="productFormHeading">Produkts</p>
                    </div>
                    <div class="r2">
                        <p>Cena:</p>   
                        <p id="priceContainer"></p>
                    </div>
                    <div class="r2">
                        <p>Pilnā cena:</p>   
                        <p id="akcijaContainer"></p>
                    </div>
                    <div class="r2">
                        <p>Datums:</p>   
                        <p id="dateContainer"></p>
                    </div>
                    <div class="r2">
                        <p>URL:</p>   
                        <p id="urlContainer" style="max-width: 190px;  overflow: hidden; text-overflow: ellipsis;white-space: nowrap;"></p>
                    </div>
                </div>
                    <form id="dataForma">
                        <div class="fromElements">
                        


                        <div class="chart-wrapper" style=" border-radius: 10px; overflow: hidden; width: 1200px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);  padding-bottom:1rem;">
                        <div id="dashboard_div" >
                            
                            <div id="chart_div"  style="  height: 500px; "></div>
                            <div id="control_div" style=" height: 50px;"></div>
                        </div>
                            </div>
                            <input type="hidden" id="data_ID">

                            <input type="hidden" id="data_WEB">

                            <input type="hidden" id="data_WEB_2">
                            
                        </div>
                   
                      
                    </form>
                </div>
            </div>
        </div>
        <script>
    
    function checkInputLength(input) {
        if (input.value.length > 4) {
            input.value = input.value.slice(0, 4);
        }
        var value = parseInt(input.value);
        var max = parseInt(input.getAttribute('max'));

        if (value > max) {
            input.value = max;
        }
    }
</script>
       
    
</body>
</html>

