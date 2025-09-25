<?php
// tile-proxy.php

$z = 10;//$_GET['z'];
$x = 1;//$_GET['x'];
$y = 1;//$_GET['y'];
$scale = isset($_GET['scale']) ? $_GET['scale'] : 2;
$format = isset($_GET['format']) ? $_GET['format'] : 'png';
$map = isset($_GET['map']) ? $_GET['map'] : 'roadmap';
$language = 'en';
$region = 'us';

$apiKey = 'AIzaSyDGzyLnzNtd6F_OHim_OAkD3rob0rocz1c';
$sessionToken = $_GET["session_token"];

// Construct Google Maps Tiles API URL
$url = "https://tile.googleapis.com/v1/2dtiles/$z/$x/$y?session=$sessionToken&key=$apiKey";

// Set appropriate header for PNG
header("Content-Type: image/png");

// Fetch and stream the tile
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$imageData = curl_exec($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Output image or error
if ($httpStatus == 200) {
    echo $imageData;
} else {
    http_response_code($httpStatus);
    echo "Tile not available.";
}
?>
