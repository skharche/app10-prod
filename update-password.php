<?php
header('Content-Type: application/json');
$token = $_POST['token'];
$password = $_POST['password'];
$salt = "33d20ef8a5857a1588489c2adbf3e2c7";
$input_hashed_password = hash('sha256', $salt . $password);
date_default_timezone_set('America/New_York');

	$config = array();
	include_once("configParams.php");
	
	$conn = new mysqli($config["dbhost"], $config["dbuser"], $config["dbpassword"], $config["dbname"]);

	$sql = "SELECT idtuser FROM tuser WHERE reset_token = '".$token."' ";
	$result = $conn->query($sql);
	$row = $result->fetch_assoc();
	
	$sql = "UPDATE tuser SET password = '".$input_hashed_password."', reset_token='' WHERE idtuser = '".$row["idtuser"]."' ";
	$result = $conn->query($sql);

if (isset($row["idtuser"]) && strlen($row["idtuser"]) > 0) { // Simulate valid token
    echo json_encode(['valid' => true]);
} else {
    echo json_encode(['valid' => false]);
}