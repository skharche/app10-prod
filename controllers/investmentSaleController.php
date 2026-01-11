<?php

//Author : Swapnil Kharche

include_once ("BaseController.php");


include_once (__DIR__ . "/../classes/tinvestmentsales.php");


class investmentSaleController extends BaseController
{
	public $CLASSES_PATH;
	public function __construct()
	{
		parent::__construct();
		//print_r($this->CONFIG);			//ACCESSIBLE HERE TOO
		$this->CLASSES_PATH = __DIR__ . "/../classes/";
	}

	function addInvestmentSale($idtcity, $idtbuilding, $sale_id, $property_name, $coverage, $sale_date, $listed_price, $sold_price, $cap_rate, $vendor, $vendor_broker, $purchaser, $purchaser_broker, $office_conversion, $shares_sold, $conveyed, $userId = 0)
	{
		$obj = new tinvestmentsales();
		return $obj->addInvestmentSale($idtcity, $idtbuilding, $sale_id, $property_name, $coverage, $sale_date, $listed_price, $sold_price, $cap_rate, $vendor, $vendor_broker, $purchaser, $purchaser_broker, $office_conversion, $shares_sold, $conveyed, $userId);
	}
	
	function updateInvestmentSale($id, $idtcity, $idtbuilding, $sale_id, $property_name, $coverage, $sale_date, $listed_price, $sold_price, $cap_rate, $vendor, $vendor_broker, $purchaser, $purchaser_broker, $office_conversion, $shares_sold, $conveyed, $userId = 0)
	{
		$obj = new tinvestmentsales();
		return $obj->updateInvestmentSale($id, $idtcity, $idtbuilding, $sale_id, $property_name, $coverage, $sale_date, $listed_price, $sold_price, $cap_rate, $vendor, $vendor_broker, $purchaser, $purchaser_broker, $office_conversion, $shares_sold, $conveyed, $userId);
	}
	
	function getInvestmentSaleDetails($idtinvestmentsales)
	{
		$obj = new tinvestmentsales();
		return $obj->getInvestmentSaleDetails($idtinvestmentsales);
	}
	
	function getAllInvestmentSaleDetails($sortBy, $sortType, $nextSortType, $start, $limit)
	{
		$obj = new tinvestmentsales();
		return $obj->getAllInvestmentSaleDetails($sortBy, $sortType, $nextSortType, $start, $limit);
	}
	
	function updateInvestmentSaleStatus($idtinvestmentsales, $status)
	{
		$obj = new tinvestmentsales();
		return $obj->updateInvestmentSaleStatus($idtinvestmentsales, $status);
	}
	
	function deleteInvestmentSale($idtinvestmentsales)
	{
		$obj = new tinvestmentsales();
		return $obj->deleteInvestmentSale($idtinvestmentsales);
	}
}

if (isset($_REQUEST["param"])) {
	$objController = new investmentSaleController();

	$appName = "app10";
	if (isset($_REQUEST["sourceApp"])) {
		$appName = $_REQUEST["sourceApp"];
	}
	switch ($_REQUEST["param"]) {

		case "saveInvestmentSale":
			$investmentSaleId = null;
			if(isset($_REQUEST["idtinvestmentsales"]) && strlen($_REQUEST["idtinvestmentsales"]) > 0)
			{
				$objController->updateInvestmentSale($_REQUEST["idtinvestmentsales"], $_REQUEST["idtcity"], $_REQUEST["idtbuilding"], $_REQUEST["sale_id"], $_REQUEST["property_name"], $_REQUEST["coverage"], $_REQUEST["sale_date"], $_REQUEST["listed_price"], $_REQUEST["sold_price"], $_REQUEST["cap_rate"], $_REQUEST["vendor"], $_REQUEST["vendor_broker"], $_REQUEST["purchaser"], $_REQUEST["purchaser_broker"], $_REQUEST["office_conversion"], $_REQUEST["shares_sold"], $_REQUEST["conveyed"], $_REQUEST["user_id"]);
				$investmentSaleId = $_REQUEST["idtinvestmentsales"];
			}
			else
			{
				$investmentSaleId = $objController->addInvestmentSale($_REQUEST["idtcity"], $_REQUEST["idtbuilding"], $_REQUEST["sale_id"], $_REQUEST["property_name"], $_REQUEST["coverage"], $_REQUEST["sale_date"], $_REQUEST["listed_price"], $_REQUEST["sold_price"], $_REQUEST["cap_rate"], $_REQUEST["vendor"], $_REQUEST["vendor_broker"], $_REQUEST["purchaser"], $_REQUEST["purchaser_broker"], $_REQUEST["office_conversion"], $_REQUEST["shares_sold"], $_REQUEST["conveyed"], $_REQUEST["user_id"]);
			}
			$saleData = $objController->getInvestmentSaleDetails($investmentSaleId);
			echo json_encode(array("status" => "success", "data" => $investmentSaleId, "saleData" => $saleData));
			break;
		case "getInvestmentSaleDetails":
			$data = $objController->getInvestmentSaleDetails($_REQUEST["idtinvestmentsales"]);
			echo json_encode(array("status" => "success", "details" => $data));
			break;
		case "getAllInvestmentSaleDetails":
			$data = $objController->getAllInvestmentSaleDetails($_REQUEST["sortBy"], $_REQUEST["sortType"], $_REQUEST["nextSortType"], $_REQUEST["start"], $_REQUEST["limit"]);
			echo json_encode(array("status" => "success", "details" => $data[0], "totalRows" => $data[1]));
			break;
		case "updateInvestmentSaleStatus":
			$data = $objController->updateInvestmentSaleStatus($_REQUEST["idtinvestmentsales"], $_REQUEST["isChecked"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		case "deleteInvestmentSale":
			$data = $objController->deleteInvestmentSale($_REQUEST["idtinvestmentsales"]);
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		default:
			//echo json_encode(array("error" => "Invalid Request Received!!!"));
			break;
	}
}

?>