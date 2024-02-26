<header>
    <nav class="navbar">
        <a class="fa1 <?php if(basename($_SERVER['PHP_SELF']) == 'index.php') echo 'current-page'; ?>" href="index.php"><i class="fas fa-tasks"></i><p>Datu krātuve</p></a>
        <a class="fa2 <?php if(basename($_SERVER['PHP_SELF']) == 'index-database.php') echo 'current-page'; ?>" href="index-database.php"><i class="fas fa-database"></i><p>Datu lasīšanas krātuve</p></a>
        <a class="fa3 <?php if(basename($_SERVER['PHP_SELF']) == 'index-reader.php') echo 'current-page'; ?>" href="index-reader.php"><i class="fas fa-cog"></i><p>Datu lasītajs</p></a>
    </nav>
</header>


