<?php

//Author : Swapnil Kharche

include_once ("BaseController.php");


include_once (__DIR__ . "/../classes/suite.php");


class suiteController extends BaseController
{
	public $CLASSES_PATH;
	public function __construct()
	{
		parent::__construct();
		//print_r($this->CONFIG);			//ACCESSIBLE HERE TOO
		$this->CLASSES_PATH = __DIR__ . "/../classes/";
	}

	function getBuildingFloorplanDetails($id)
	{
		$obj = new suite();
		return $obj->getBuildingFloorplanDetails($id);
	}
	
	function getCityFloorplanDetails($cityId)
	{
		$obj = new suite();
		return $obj->getCityFloorplanDetails($cityId);
	}
	
	function getAvailableOfficeSpaceDetails($idtmarket)
	{
		$obj = new suite();
		return $obj->getAvailableOfficeSpaceDetails($idtmarket);
	}
	
}

if (isset($_REQUEST["param"])) {
	$objController = new suiteController();

	$appName = "app10";
	if (isset($_REQUEST["sourceApp"])) {
		$appName = $_REQUEST["sourceApp"];
	}
	switch ($_REQUEST["param"]) {

		case "getBuildingFloorplanDetails":
			$data = $objController->getBuildingFloorplanDetails($_REQUEST["idtbuilding"]);
			echo json_encode(array("status" => "success", "floorplanDetails" => $data[0], "suiteOtherDetails" => $data[1]));
			break;
		case "getCityFloorplanDetails":
			$data = $objController->getCityFloorplanDetails($_REQUEST["idtcity"]);
			echo json_encode(array("status" => "success", "floorplanDetails" => $data[0], "floorDetails" => $data[1], "summaryDetails" => $data[2], "suiteOtherImages" => $data[3] ));
			break;
		case "getAvailableOfficeSpaceDetails":
			$marketData = $objController->getAvailableOfficeSpaceDetails($_REQUEST["idtmarket"]);
			echo json_encode(array("status" => "success", "summaryDetails" => $marketData[0], "data" => $marketData[1], "suiteOtherImages" => $marketData[2], "totalOfficeArea" => $marketData[3]));
			break;
		default:
			//echo json_encode(array("error" => "Invalid Request Received!!!"));
			break;
	}
}

?>