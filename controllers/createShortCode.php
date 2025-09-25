<?php
header('Content-Type: application/json');

//print_r($_GET);
if (isset($_GET['url'])) {
    
	$mainUrl = $_GET['url'];
	$userId = $_GET['id'];
	$name = $_GET['name'];
	include_once (__DIR__ . "/../classes/tinyURL.php");

	$obj = new tinyURL();
	$shortCode = $obj->createTinyURL($userId, $name, $mainUrl);

	echo json_encode(array("status" => "success", "shortURL" => $shortCode));
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>