<?php
include_once("controllers/tinyURLController.php");
$obj = new tinyURLController();
$shortCode = $_GET['code'];
$originalURL = $obj->getOriginalURL($shortCode);

if ($originalURL) {
    header("Location: $originalURL");
    exit();
} else {
    echo "Invalid URL.";
}

?>