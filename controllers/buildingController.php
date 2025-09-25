<?php

//Author : Swapnil Kharche

include_once ("BaseController.php");


include_once (__DIR__ . "/../classes/building.php");


class buildingController extends BaseController
{
	public $CLASSES_PATH;
	public function __construct()
	{
		parent::__construct();
		//print_r($this->CONFIG);			//ACCESSIBLE HERE TOO
		$this->CLASSES_PATH = __DIR__ . "/../classes/";
	}

	function getAClassBuildings($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getAClassBuildings($idtmarket);
	}
	
	function getRetailBuildingData()
	{
		$objBuilding = new building();
		return $objBuilding->getRetailBuildingData();
	}
	
	function getNonRetailBuildingData()
	{
		$objBuilding = new building();
		return $objBuilding->getRetailBuildingData(0);
	}
	
	function getFullRetailBuildingMapping()
	{
		$objBuilding = new building();
		return $objBuilding->getFullRetailBuildingMapping();
	}
	
	function getActiveUnitDetails($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getActiveUnitDetails($idtmarket);
	}
	
	function randomCalgaryBuildingHighlight()
	{
		$objBuilding = new building();
		return $objBuilding->randomCalgaryBuildingHighlight();
	}

	function getBuildingSummaryDetails($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getBuildingSummaryDetails($idtmarket);
	}
	
	function getSubmarketDetails($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getSubmarketDetails($idtmarket);
	}
	
	function getBuildingHotelSummary($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getBuildingHotelSummary($idtmarket);
	}
	
	function getDevelopmentBuildingSummary($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getDevelopmentBuildingSummary($idtmarket);
	}
	
	function getAllVisualizationBuildingSummary($idtmarket)
	{
		$objBuilding = new building();
		return $objBuilding->getAllVisualizationBuildingSummary($idtmarket);
	}
	
	function getApp10MarketDetails($userId)
	{
		$objBuilding = new building();
		return $objBuilding->getApp10MarketDetails($userId);
	}
	
	function getMarketBuildingsForAutosuggest($marketId)
	{
		$objBuilding = new building();
		return $objBuilding->getMarketBuildingsForAutosuggest($marketId);
	}
	
	function getApp10CityBuildingCount()
	{
		$objBuilding = new building();
		return $objBuilding->getApp10CityBuildingCount();
	}
	
	function getApp10CityCameraDetails()
	{
		$objBuilding = new building();
		return $objBuilding->getApp10CityCameraDetails();
	}
	
	function getCameraDetails($idtcity, $cameratype)
	{
		$objBuilding = new building();
		return $objBuilding->getCameraDetails($idtcity, $cameratype);
	}
	
	function getBuildingCameraDetails($id)
	{
		$objBuilding = new building();
		return $objBuilding->getBuildingCameraDetails($id);
	}
	function getSubmarketCameraDetails($id)
	{
		$objBuilding = new building();
		return $objBuilding->getSubmarketCameraDetails($id);
	}
	function getCameraFromIdtcamera($id)
	{
		$objBuilding = new building();
		return $objBuilding->getCameraFromIdtcamera($id);
	}
	function buildingFloorUpdates($idtbldg, $buildingBaseHeight, $floorHeight)
	{
		$objBuilding = new building();
		return $objBuilding->buildingFloorUpdates($idtbldg, $buildingBaseHeight, $floorHeight);
	}
	
	function getMarketSalesData($idtcity)
	{
		$objBuilding = new building();
		return $objBuilding->getMarketSalesData($idtcity);
	}
	
	function getMarketSalesDataSummary($idtcity)
	{
		$objBuilding = new building();
		return $objBuilding->getMarketSalesDataSummary($idtcity);
	}
	
	function getSydneyArealyticSuites()
	{
		$objBuilding = new building();
		return $objBuilding->getSydneyArealyticSuites();
	}
	
	function getSydneyArealyticSummary()
	{
		$objBuilding = new building();
		return $objBuilding->getSydneyArealyticSummary();
	}
	
	function getSydneyArealyticPricePerSQMSummary()
	{
		$objBuilding = new building();
		return $objBuilding->getSydneyArealyticPricePerSQMSummary();
	}
	
	function getSydneyArealyticJoins()
	{
		$objBuilding = new building();
		return $objBuilding->getSydneyArealyticJoins();
	}

	function getBuildingFloorDetails($idtbldg)
	{
		$objBuilding = new building();
		return $objBuilding->getBuildingFloorDetails($idtbldg);
	}

	//Misc functions
	function formatDate($date)
	{
		return $date;
	}
}

if (isset($_REQUEST["param"])) {
	$objBuildingController = new buildingController();

	$appName = "app10";
	if (isset($_REQUEST["sourceApp"])) {
		$appName = $_REQUEST["sourceApp"];
	}
	switch ($_REQUEST["param"]) {

		case "randomCalgaryBuildingHighlight":
			$data = $objBuildingController->randomCalgaryBuildingHighlight();
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getAClassBuildings":
			$data = $objBuildingController->getAClassBuildings($_REQUEST["idtmarket"]);
			
			$hotelSummary = $objBuildingController->getBuildingHotelSummary($_REQUEST["idtmarket"]);
			$developmentSummary = $objBuildingController->getDevelopmentBuildingSummary($_REQUEST["idtmarket"]);
			$allBuildingVisualizationSummary = $objBuildingController->getAllVisualizationBuildingSummary($_REQUEST["idtmarket"]);
			$summaryData = $objBuildingController->getBuildingSummaryDetails($_REQUEST["idtmarket"]);
			$submarketData = $objBuildingController->getSubmarketDetails($_REQUEST["idtmarket"]);
			$retailBuildingData = $objBuildingController->getRetailBuildingData();
			$nonRetailBuildingData = $objBuildingController->getNonRetailBuildingData();
			$retailBuildingMap = $objBuildingController->getFullRetailBuildingMapping();
			$activeUnitDetails = $objBuildingController->getActiveUnitDetails($_REQUEST["idtmarket"]);
			
			echo json_encode(array("status" => "success", "data" => $data[0], "developmentBuildings" => $data[1], "developmentBuildingFloors" => $data[2], "hotelSummary" => $hotelSummary, "developmentSummary" => $developmentSummary, "submarketDetails" => $submarketData, "summary" => $summaryData, "allBuildingVisualizationSummary" => $allBuildingVisualizationSummary, "retailBuildingData" => $retailBuildingData, "nonRetailBuildingData" => $nonRetailBuildingData, "retailBuildingMap" => $retailBuildingMap, "activeUnitDetails" => $activeUnitDetails));
			break;
		case "getSubmarketDetails":
			$submarketData = $objBuildingController->getSubmarketDetails($_REQUEST["idtmarket"]);
			
			echo json_encode(array("status" => "success", "data" => $submarketData));
			break;
		case "getApp10MarketDetails":
			$data = $objBuildingController->getApp10MarketDetails($_POST["user_id"]);
			//echo "<pre>";print_r($data);
			echo json_encode(array("status" => "success", "data" => $data["data"], "allCitiesWithCountry" => $data["allCitiesWithCountry"], "citiesCounts" => $data["citiesCounts"], "citiesAccessible" => $data["citiesAccessible"], "disabledMarkets" => $data["disabledMarkets"], "marketCamera" => $data["camera"], "cameraRotation" => $data["cameraRotation"], "cityAltitudeAdjustment" => $data["cityAltitudeAdjustment"]));
			break;
		case "getMarketBuildingsForAutosuggest":
			$data = $objBuildingController->getMarketBuildingsForAutosuggest($_POST["marketId"]);
			//echo "<pre>";print_r($data);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getApp10CityBuildingCount":
			$data = $objBuildingController->getApp10CityBuildingCount();
			$str = " \n ";
			$str .= ' $cityBuildingCount = array();';
			$str .= " \n ";
			foreach($data[0] as $cityId => $cnt)
			{
				$str .= ' $cityBuildingCount['.$cityId.'] = '.$cnt.'; ';
				$str .= " \n ";
			}
			
			$str .= " \n ";
			$str .= ' $marketBuildingCount = array();';
			$str .= " \n ";
			foreach($data[1] as $marketId => $cnt)
			{
				$str .= ' $marketBuildingCount['.$marketId.'] = '.$cnt.'; ';
				$str .= " \n ";
			}
			file_put_contents(__DIR__.'/../cityBuildingCounts.php', '<?php '.$str.'  ?>');
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getApp10CityCameraDetails":
			$data = $objBuildingController->getApp10CityCameraDetails();
			$str = " \n ";
			$str .= ' <script> var cityCameraDetails = []; ';
			$str .= " \n ";
			foreach($data as $eachRow)
			{
				$str .= ' cityCameraDetails['.$eachRow['idtcity'].'] = {cameraAltitudeAdjustment: '.$eachRow['altitudeadjustment'].', longitude: '.$eachRow['longitude'].', latitude: '.$eachRow['latitude'].', altitude: '.$eachRow['altitude'].', heading:'.$eachRow['heading'].', pitch: '.$eachRow['pitch'].', roll: 0 }; ';
				$str .= " \n ";
			}
			$str .= " \n </script> ";
			file_put_contents(__DIR__.'/../cityCameraDetails.php', $str);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getCameraDetails":
			$data = $objBuildingController->getCameraDetails($_REQUEST["idtcity"], $_REQUEST["cameratype"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getBuildingCameraDetails":
			$data = $objBuildingController->getBuildingCameraDetails($_REQUEST["idtbuilding"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getSubmarketCameraDetails":
			$data = $objBuildingController->getSubmarketCameraDetails($_REQUEST["idtsubmarket"], $_REQUEST["cameratype"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getCameraFromIdtcamera":
			$data = $objBuildingController->getCameraFromIdtcamera($_REQUEST["idtcamera"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getBuildingFloorDetails":
			$data = $objBuildingController->getBuildingFloorDetails($_REQUEST["idtbuilding"]);
			echo json_encode(array("status" => "success", "data" => $data[0], "calculatedHeight" => $data[1]));
			break;
		case "buildingFloorUpdates":
			$data = $objBuildingController->buildingFloorUpdates($_REQUEST["idtbuilding"], $_REQUEST["buildingBaseHeight"], $_REQUEST["floorHeight"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "getSydneyArealyticSuites":
			$data = $objBuildingController->getSydneyArealyticSuites();
			$summary = $objBuildingController->getSydneyArealyticSummary();
			$pricePerSQMSummary = $objBuildingController->getSydneyArealyticPricePerSQMSummary();
			
			echo json_encode(array("status" => "success", "data" => $data, "summary" => $summary));
			
			//file_put_contents(__DIR__.'/../arealyticSuiteData.json', json_encode(array("status" => "success", "data" => $data, "summary" => $summary, "pricePerSQMSummary" => $pricePerSQMSummary)));
			break;
		case "getMarketSalesDataCalgary":
			$data = $objBuildingController->getMarketSalesData($_REQUEST["idtcity"]);
			$summary = $objBuildingController->getMarketSalesDataSummary($_REQUEST["idtcity"]);
			echo json_encode(array("status" => "success", "data" => $data, "summary" => $summary));
			break;
		case "getFloorPlansForCity":
			$data = $objBuildingController->getFloorPlansForCity($_REQUEST["idtcity"]);
			$summary = $objBuildingController->getFloorPlansSummaryForCity($_REQUEST["idtcity"]);
			echo json_encode(array("status" => "success", "data" => $data, "summary" => $summary));
			break;
		case "getSydneyArealyticJoins":
			$data = $objBuildingController->getSydneyArealyticJoins();
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		default:
			//echo json_encode(array("error" => "Invalid Request Received!!!"));
			break;
	}
}

?>