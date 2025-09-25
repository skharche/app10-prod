<?php
date_default_timezone_set('America/New_York');

	$config = array();
	
	include_once("configParams.php");
	/*
	$config["dbhost"] = "visgrid.com";
	$config["dbport"] = "3306";
	$config["dbname"] = "visgrid02";
	$config["dbuser"] = "visgrid02";
	$config["dbpassword"] = "visgrid1000!";
	
	*/
	$conn = new mysqli($config["dbhost"], $config["dbuser"], $config["dbpassword"], $config["dbname"]);

	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
	
	$salt = "33d20ef8a5857a1588489c2adbf3e2c7";


//include 'login-functions.php';

function login($username, $password, $rememberMe) {
    global $conn;
    global $salt;
	//$hashed_password = password_hash($password, PASSWORD_DEFAULT);
	$input_hashed_password = hash('sha256', $salt . $password);
	$sql = "SELECT idtuser, firstname, password, lastname, email, company, active FROM tuser WHERE active = 1 AND username = '".$username."' AND password = '".$input_hashed_password."' ";
	$result = $conn->query($sql);
	$row = $result->fetch_assoc();
	$returnArray = array("status" => false, "message" => "");
	if(isset($row["idtuser"]))
	{
		$sql = "SELECT idtuser_app, tuser_app.idtuser, tuser_app.idtapp, tapp.app_name FROM 
			tuser_app
			JOIN tapp ON tapp.idtapp = tuser_app.idtapp
			WHERE tuser_app.idtuser = '".$row["idtuser"]."' AND LOWER(tapp.app_name) = 'app10' ";
		$result = $conn->query($sql);
		$accessRow = $result->fetch_assoc();
		//print_r($accessRow);exit;
		if(isset($accessRow["idtuser_app"]))
		{
			$q = "INSERT INTO tuser_access_log (idtuser, idtapp, idtcesiumkeys, app_module, is_mobile, ip_address, date_created) VALUES ('".$accessRow["idtuser"]."', '".$accessRow["idtapp"]."', 0, 'Login', 0, '".$_SERVER['REMOTE_ADDR']."', '".date("Y-m-d h:i:s")."'); ";
			$conn->query($q);
			
			session_start();
			$_SESSION = $row;
			$_SESSION['idtuser'] = $row["idtuser"];
			if($rememberMe)
			{
				$cookieTime = 7 * 24 * 3600;
				setcookie("app10LoggedInUserName", $row["firstname"], time() + $cookieTime, "/");
				setcookie("app10LoggedInUserId", $row["idtuser"], time() + $cookieTime, "/");
			}
			$returnArray["status"] = true;
			$returnArray["message"] = "Success";
			return $returnArray;
		}
		else
		{
			$returnArray["status"] = false;
			$returnArray["message"] = "You do not have access to App10!";
			return $returnArray;
		}
	}
	else
	{
		$returnArray["status"] = false;
		$returnArray["message"] = "Invalid Credentials!";
		return $returnArray;
	}
}

function verifyAppAccess($userId, $appName) {
    global $conn;

	
}

?>
