
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
            <option value="1"></option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
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

    
</body>
</html>

