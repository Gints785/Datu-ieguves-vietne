

<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Datu lasīšanas krātuve</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <link rel="stylesheet" href="style.css" />
   
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
    ?>
  <div class="title"  >
        <div class="name">
            <i class="fas fa-database"></i> Datu lasīšanas krātuve
        </div>
        <div class="button-container">
        <input class="input_style" type="text"  id="dataArtikuls" placeholder="Artikuls" />
        <button class="btn" id="Price_selection">Atlasīt</button>
        <button class="btn" id="Reset_price_selection">Notīrīt</button>
        <button class="btn" id="new">Pievienot jaunu</button>
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
                <h2 id="productFormHeading">Pievienot produktu</h2>
                <form id="productForma">

                    <div class="fromElements">
                        <label>Artikus <span>*</span>:</label>
                        <input type="text" id="artikuls" required>
                        <label>Barbora :</label>
                        <input type="text" id="barbora"  >
<!--======================================================================================== -->
                        <label>Lats :</label>
                        <input type="text" id="lats"  >
<!--======================================================================================== -->
                        <label>Citro :</label>
                        <input type="text" id="citro"  >
<!--======================================================================================== -->                   
                        <label>Rimi :</label>
                        <input type="text" id="rimi"  >
<!--======================================================================================== -->                   
                        <label>Alkoutlet :</label>
                        <input type="text" id="alkoutlet"  >



                        <input type="hidden" id="productID">
                    </div>
                    <input id="save" type="submit" name="pieteikties" value="Saglabāt" class="btn" >
                   


                </form>
            </div>
    </div>
  
  
    </div>
  
 

</body>
</html>

