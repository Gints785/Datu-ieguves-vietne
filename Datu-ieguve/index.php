
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
    <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"defer> </script>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" defer></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js" defer></script>
    <script src="script-sse.js" defer></script>
    <script src="script.js" defer></script>

</head>
<body>
<?php
        require("connectDB.php");
        require("nav.php");
        require("indicator.php");
       
     
    ?>
<div class="title">
        <div class="name" >
            <i class="fas fa-tasks" style="display: inline;"></i> Datu krātuve    <div id="rowCount" style="display: inline; padding-left: 1.5rem;;">Skaits: 0</div>
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
                <th style="text-align:center;">Akcija</th>
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
                    <div class="r2" style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
                        <p>Veikals:</p>    
                        <p id="website">Citro</p>
                    </div>
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
                        <div class="formElements">
                        


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
                    <button class="btn3" id="export_history">Eksportēt vēsturi</button>
               
                </div>
            </div>
        </div>


        <div class="modal_export">
            <div class="apply">
                <div class="close_modal"><i class="fas fa-times"></i></div>
                <h1 id="productFormHeading" style="margin-bottom:25px;">Eksportēt cenas</h1>
                <p style="margin-bottom: 2rem;">Varat izvēlēties eksportējamās kolonnas, atzīmējot izvēles rūtiņu blakus kolonnas nosaukumam.
                     Jums ir arī iespēja piešķirt eksportējamo nosaukumu.</p>
                     <hr style="border:solid 3px rgb(171, 171, 171); margin-bottom:1rem; border-radius: 3px; ">
                <h2 style="color:rgba(64,74,181,255);">Eksporta konfigurācija</h2>   
                <p>Faila nosaukums</p>  
                <form id="export_check">

                        <div class="formElements">
                            <input type="text" class="inp" >
                            <p style="margin-bottom:2rem;">Nepievienojiet failu tipu beigās</p>
                                <ul class="checkbox">
                                    <div class="column">
                                        <li><label for="artikuls"><input type="checkbox" id="artikuls" checked="true"> artikuls</label></li>                     
                                        <li><label for="nosaukums"><input type="checkbox"  id="nosaukums" checked="true"> nosaukums</label></li>                              
                                        <li><label for="pard_cena1"><input type="checkbox"id="pard_cena1" checked="true"> pard_cena1</label></li>
                                        <li><label for="papild_info"><input type="checkbox"id="papild_info" checked="true"> akcija</label></li>                                
                                    </div>
                                    <div class="column">
                                        <li><label class="main" for="barbora"><input type="checkbox" id="barbora" checked="true"> barbora</label></li>  
                                        <li><label for="barbora_cena"><input type="checkbox" id="barbora_cena" checked="true"> barbora_cena</label></li>                  
                                        <li><label for="barbora_pilnā_cena"><input type="checkbox" id="barbora_pilnā_cena" checked="true"> barbora_pilnā_cena</label></li> 
                                        <li><label for="barbora_datums"><input type="checkbox" id="barbora_datums" checked="true"> barbora_datums</label></li> 
                                        <li><label for="barbora_datums_7"><input type="checkbox" id="barbora_datums_7" checked="true"> barbora_datums_7</label></li> 
                                    </div>
                                    <div class="column">
                                        <li><label class="main" for="lats"><input type="checkbox" id="lats" checked="true"> lats</label></li>  
                                        <li><label for="lats_cena"><input type="checkbox" id="lats_cena" checked="true"> lats_cena</label></li>                    
                                        <li><label for="lats_pilnā_cena"><input type="checkbox" id="lats_pilnā_cena" checked="true"> lats_pilnā_cena</label></li>
                                        <li><label for="lats_datums"><input type="checkbox" id="lats_datums" checked="true"> lats_datums</label></li>                    
                                        <li><label for="lats_datums_7"><input type="checkbox" id="lats_datums_7" checked="true"> lats_datums_7</label></li>
                                    </div>
                                    <div class="column">     
                                        <li><label class="main" for="citro"><input type="checkbox" id="citro" checked="true"> citro</label></li>                        
                                        <li><label for="citro_cena"><input type="checkbox" id="citro_cena" checked="true"> citro_cena</label></li>         
                                        <li><label for="citro_pilnā_cena"><input type="checkbox"id="citro_pilnā_cena" checked="true"> citro_pilnā_cena</label></li>
                                        <li><label for="citro_datums"><input type="checkbox" id="citro_datums" checked="true"> citro_datums</label></li>         
                                        <li><label for="citro_datums_7"><input type="checkbox"id="citro_datums_7" checked="true"> citro_datums_7</label></li>
                                    </div>
                                    <div class="column"> 
                                        <li><label class="main" for="rimi"><input type="checkbox" id="rimi" checked="true"> rimi</label></li>   
                                        <li><label for="rimi_cena"><input type="checkbox" id="rimi_cena" checked="true"> rimi_cena</label></li>                            
                                        <li><label for="rimi_pilnā_cena"><input type="checkbox" id="rimi_pilnā_cena" checked="true"> rimi_pilnā_cena</label></li>
                                        <li><label for="rimi_datums"><input type="checkbox" id="rimi_datums" checked="true"> rimi_datums</label></li>                            
                                        <li><label for="rimi_datums_7"><input type="checkbox" id="rimi_datums_7" checked="true"> rimi_datums_7</label></li>
                                    </div>
                                    <div class="column">  
                                        <li><label class="main" for="alkoutlet"><input type="checkbox" id="alkoutlet" checked="true"> alkoutlet</label></li>      
                                        <li><label for="alkoutlet_cena"><input type="checkbox" id="alkoutlet_cena" checked="true"> alkoutlet_cena</label></li>                   
                                        <li><label for="alkoutlet_pilnā_cena"><input type="checkbox" id="alkoutlet_pilnā_cena" checked="true"> alkoutlet_pilnā_cena</label></li>
                                        <li><label for="alkoutlet_datums"><input type="checkbox" id="alkoutlet_datums" checked="true"> alkoutlet_datums</label></li>                            
                                        <li><label for="alkoutlet_datums_7"><input type="checkbox" id="alkoutlet_datums_7" checked="true"> alkoutlet_datums_7</label></li>
                                    </div>
                                </ul>
                            
                        </div>
                    <input id="sub_export" type="submit" name="export" value="Eksportēt" class="btn" >
                </form>
                </div>
            </div>

            <div id="loading-screen"></div>









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


    ['alkoutlet', 'rimi', 'citro', 'lats', 'barbora'].forEach(function(brand) {
            var mainCheckbox = document.getElementById(brand);
            var relatedCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="' + brand + '_"]:not(#' + brand + ')');

            mainCheckbox.addEventListener('change', function() {
                // If main checkbox is checked, check all related checkboxes
                if (this.checked) {
                    relatedCheckboxes.forEach(function(checkbox) {
                        checkbox.checked = true;
                    });
                } else {
                    // If main checkbox is unchecked, uncheck all related checkboxes
                    relatedCheckboxes.forEach(function(checkbox) {
                        checkbox.checked = false;
                    });
                }
            });

            // JavaScript code to handle related checkbox deselection
            relatedCheckboxes.forEach(function(checkbox) {
                checkbox.addEventListener('change', function() {
                    // If any related checkbox is unchecked, uncheck the main checkbox
                    if (!this.checked) {
                        mainCheckbox.checked = false;
                    } else {
                        // Check if all related checkboxes are checked, if so, check the main checkbox
                        var allChecked = true;
                        relatedCheckboxes.forEach(function(checkbox) {
                            if (!checkbox.checked) {
                                allChecked = false;
                            }
                        });
                        if (allChecked) {
                            mainCheckbox.checked = true;
                        }
                    }
                });
            });
        });






     
</script>
       
    
</body>
</html>

