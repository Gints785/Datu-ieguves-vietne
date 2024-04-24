

<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Datu lasīšanas krātuve</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="style-reader.css" />
   
    <link rel="stylesheet" href=" https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"defer> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" defer></script>
    <script src="script-modal.js" defer></script>
    <script src="script-database.js" defer></script>
   

</head>

<body>
    
    <?php
        require("connectDB.php");
        require("nav.php");
        require("indicator.php");
    ?>
  <div class="title"  >
        <div class="name">
            <i class="fas fa-database"></i> Datu lasīšanas krātuve
        </div>
        <div class="button-container">
        <select id="kateg" class="kat">
            <option value="1"></option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
        <input class="input_style" type="text"  id="dataArtikuls" placeholder="Artikuls" />
        <button class="btn" id="Price_selection">Atlasīt</button>
        <button class="btn" id="Reset_price_selection">Notīrīt</button>
        <button class="btn" id="new">Pievienot jaunu</button>
        <button class="btn" id="import">Importēt</button>
       
        </div>
    
        


    </div>
    <div class="container">
        <table>
            <tr class="first">
                <th>Artikuls</th>
                <th >Preces nosaukums</th>
                <th>Barbora</th>
                <th>Lats</th>
                <th>Citro</th>
                <th>Rimi</th>
                <th>Alkoutlet</th>
                <th></th>
              
            </tr>
            <tbody id="prod_info"></tbody>
        </table>
    

        <div class="modal">
            <div class="apply">
                <div class="close_modal"><i class="fas fa-times"></i></div>
                <h1 id="productFormHeading">Pievienot produktu</h1>
                <form id="productForma">

                    <div class="fromElements">
                        <label>Artikuls <span>*</span></label>
                        <input type="text" id="artikuls" required>
                        <label>Barbora </label>
                        <input type="text" id="barbora"  >
<!--======================================================================================== -->
                        <label>Lats </label>
                        <input type="text" id="lats"  >
<!--======================================================================================== -->
                        <label>Citro </label>
                        <input type="text" id="citro"  >
<!--======================================================================================== -->                   
                        <label>Rimi </label>
                        <input type="text" id="rimi"  >
<!--======================================================================================== -->                   
                        <label>Alkoutlet </label>
                        <input type="text" id="alkoutlet"  >

                        <input type="hidden" id="productID">
                    </div>
                    <input id="save" type="submit" name="pieteikties" value="Saglabāt" class="btn" >
                </form>
                </div>
            </div>








        <div class="modal_import">
            <div class="apply">
                <div class="close_modal"><i class="fas fa-times"></i></div>
                    <h1 id="productFormHeading">Importē preces</h1>
                    <p>Augšupielādējiet Excel failu, lai importētu datus.</p>
                    <form id="productimport" >

                        <div class="form_import">
                                <label for="input-file" id="drop-area">
                                    <input type="file" accept=".xls,.xlsx" name="file" id="input-file" hidden >
                                    <div id="img-view">
                                        <img src="images\img_1.png" alt="">
                                        <p>Velciet un nometiet vai noklikšķiniet<br> šeit, lai augšupielādētu failu</p>                               
                                    </div>
                                </label>
                        </div>
                        <div class="list-section">
                            <div class="list-title" style="font-size:15px; padding-top:1rem;">Uploaded File</div>
                                <div class="list">
                                    <li class="in-prog">
                                    <!--<div class="col">
                                        <img src="images\img_2.png" alt="" style="width:90%;">
                                    </div>
                                    <div class="col">
                                        <div class="file-name">
                                            <div class="name">File Name Here</div>
                                            
                                        </div>
                                        
                                        <div class="file-size">2.2 MB</div>
                                    </div>
                                    <div class="col">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="cross" height="20" width="20"><path d="m5.979 14.917-.854-.896 4-4.021-4-4.062.854-.896 4.042 4.062 4-4.062.854.896-4 4.062 4 4.021-.854.896-4-4.063Z"/></svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="tick" height="20" width="20"><path d="m8.229 14.438-3.896-3.917 1.438-1.438 2.458 2.459 6-6L15.667 7Z"/></svg>      
                                    </div>-->
                                    </li> 
                                </div>    
                                    
                            </div>  
                            <input id="import_button" type="submit" name="upload" value="Import" class="btn" >                                             
                        </div>
                        
                </form>         
            </div>
        </div>
  



      


       
 

</body>
</html>

