<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>IT kursi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" href="style.css" />
   
    <link rel="stylesheet" href=" https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
    <script src="script.js" defer></script>
</head>
<body>
    <p class="login-kluda"></p>
    <?php
        require("connectDB.php")
    ?>
       <div class="modal modalActive">
        <div class="apply">
            <p>
                <?php
                    if (isset($_POST["ielogoties"])) {
                        session_start();
                    

                        $query = 'SELECT * FROM users WHERE username = $1';
                        $result = pg_prepare($savienojums, "find_user", $query);
                    
   
                        $result = pg_execute($savienojums, "find_user", array($_POST["lietotajs"]));
                    
                        if (pg_num_rows($result) == 1) {
                            $ieraksts = pg_fetch_assoc($result);
                    
                            // Verify the password
                            if (password_verify($_POST["parole"], $ieraksts["password"])) {
                                // Password is correct, set the session variable
                                $_SESSION["lietotajvards_RCG"] = $ieraksts["username"];
                    
                          
                                header("location:./");
                            } else {
                                echo "Nepareizs lietotajs vai parole";
                            }
                        } else {
                            echo "Nepareizs lietotajs vai parole!";
                        }
                    }

                ?>

            </p>
        
            <h2>Ielogoties sistēmā</h2>
            <form action="" method="post">
                <label>Lietotājvārds:</label>
                <input type="text" name="lietotajs" required>
                <label>Parole:</label>
                <input type="password" name="parole" required>
                <input type="submit" name="ielogoties" value="Ielogoties" class="btn">
            </form>
        </div>
    </div>


    
        
    </body>
</html>