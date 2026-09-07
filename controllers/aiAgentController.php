<?php

//Author : Swapnil Kharche

include_once ("BaseController.php");


include_once (__DIR__ . "/../classes/aiAgent.php");


class aiAgentController extends BaseController
{
	public $CLASSES_PATH;
	public function __construct()
	{
		parent::__construct();
		$this->CLASSES_PATH = __DIR__ . "/../classes/";
	}

	function askQuestion($idtuser, $idtcity, $idtmarket, $idtbuilding, $idtsuite, $question, $contextType = "AOS", $questionId = 0)
	{
		$obj = new aiAgent();
		return $obj->askQuestion($idtuser, $idtcity, $idtmarket, $idtbuilding, $idtsuite, $question, $contextType, $questionId);
	}

	function getExceptions($filters)
	{
		$obj = new aiAgent();
		return $obj->getExceptions($filters);
	}

}

if (isset($_REQUEST["param"])) {
	$objController = new aiAgentController();

	//askQuestion() already catches its own errors internally (see classes/aiAgent.php), but this catch is the
	//last line of defense so the frontend always gets valid JSON back - never a raw PHP warning/fatal mixed
	//into the response, which would break $.parseJSON() and leave the AI Agent tab stuck on "Thinking...".
	try {
		switch ($_REQUEST["param"]) {

			case "askQuestion":
				$contextType = isset($_REQUEST["contextType"]) ? $_REQUEST["contextType"] : "AOS";
				$questionId = isset($_REQUEST["questionId"]) ? $_REQUEST["questionId"] : 0;
				$data = $objController->askQuestion($_REQUEST["idtuser"], $_REQUEST["idtcity"], $_REQUEST["idtmarket"], $_REQUEST["idtbuilding"], $_REQUEST["idtsuite"], $_REQUEST["question"], $contextType, $questionId);
				echo json_encode($data);
				break;
			case "getExceptions":
				//idtuser: exact match. search: matches the user's name/email ("search by user"). dateFrom/dateTo
				//("YYYY-MM-DD"): both default to today server-side when neither is passed.
				$filters = array(
					"idtuser" => isset($_REQUEST["idtuser"]) ? $_REQUEST["idtuser"] : 0,
					"search" => isset($_REQUEST["search"]) ? $_REQUEST["search"] : "",
					"dateFrom" => isset($_REQUEST["dateFrom"]) ? $_REQUEST["dateFrom"] : "",
					"dateTo" => isset($_REQUEST["dateTo"]) ? $_REQUEST["dateTo"] : "",
				);
				$data = $objController->getExceptions($filters);
				echo json_encode($data);
				break;
			default:
				//echo json_encode(array("error" => "Invalid Request Received!!!"));
				break;
		}
	} catch (\Throwable $e) {
		error_log("aiAgentController threw: ".$e->getMessage()." in ".$e->getFile().":".$e->getLine());
		echo json_encode(array("status" => "error", "message" => "The AI Agent hit an unexpected error. Please try again."));
	}
}
else
{
	$objController = new aiAgentController();
	$data = $objController->askQuestion(91, 2, 1, 137, 3877, "is this building popular with tenant?");
	
	echo "<pre>";print_r($data);
}

?>
