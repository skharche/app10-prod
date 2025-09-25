<?php

//Author : Swapnil Kharche

include_once ("BaseController.php");


include_once (__DIR__ . "/../classes/user.php");


class userController extends BaseController
{
	public $CLASSES_PATH;
	public function __construct()
	{
		parent::__construct();
		//print_r($this->CONFIG);			//ACCESSIBLE HERE TOO
		$this->CLASSES_PATH = __DIR__ . "/../classes/";
	}

	function saveUserAccessData($idtuser, $idtapp, $cesKey, $apiAccess, $appModule, $isMobile, $IPAddress)
	{
		$objBuilding = new user();
		return $objBuilding->saveUserAccess($idtuser, $idtapp, $cesKey, $apiAccess, $appModule, $isMobile, $IPAddress);
	}
	
	//Misc functions
	function formatDate($date)
	{
		return $date;
	}
}

if (isset($_REQUEST["param"])) {
	$objController = new userController();

	$appName = "app10";
	if (isset($_REQUEST["sourceApp"])) {
		$appName = $_REQUEST["sourceApp"];
	}
	switch ($_REQUEST["param"]) {

//data: { param : "getApp10CityBuildingCount", "idtuser" : loggedInUserId, "idtapp": appId, "api_accessed": "default", is_mobile: isMobile.any(), ip_address : IPAddress}
		case "saveUserAccessData":
			$data = $objController->saveUserAccessData($_POST["idtuser"], $_POST["idtapp"], $_POST["cesiumKey"], $_POST["apiAccessed"], $_POST["appModule"], $_POST["isMobile"], $_POST["ipAddress"] );
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		default:
			//echo json_encode(array("error" => "Invalid Request Received!!!"));
			break;
	}
}

?>