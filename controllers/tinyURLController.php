<?php

//Author : Swapnil Kharche

include_once ("BaseController.php");


include_once (__DIR__ . "/../classes/tinyURL.php");


class tinyURLController extends BaseController
{
	public $CLASSES_PATH;
	public function __construct()
	{
		parent::__construct();
		//print_r($this->CONFIG);			//ACCESSIBLE HERE TOO
		$this->CLASSES_PATH = __DIR__ . "/../classes/";
	}

	function createTinyURL($url)
	{
		$obj = new tinyURL();
		return $obj->createTinyURL($url);
	}
	
}

echo "<pre>";
print_r($_GET);

if (isset($_REQUEST["param"])) {
	$objController = new tinyURLController();

	$appName = "app10";
	if (isset($_REQUEST["sourceApp"])) {
		$appName = $_REQUEST["sourceApp"];
	}
	switch ($_REQUEST["param"]) {

		case "createTinyURL":
			echo "HERE";
			$data = $objController->createTinyURL($_REQUEST["URL"]);
			echo json_encode(array("status" => "success", "shortURL" => $data));
			break;
		default:
			//echo json_encode(array("error" => "Invalid Request Received!!!"));
			break;
	}
}

?>