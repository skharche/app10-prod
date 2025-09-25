<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, Methods, Content-Type");
  
/* if (!defined('BASE_URL'))
	define("BASE_URL", "http://localhost/Rana/MCP");
 */
 
class BaseController {
	// load autoload files first
	// initialize global constants if any
	
	public $CONFIG;
	function __construct() {
		return;
		$this->setConfigValues();
		if($this->CONFIG['DEBUG_MODE']) {
			ini_set('display_errors', 1);
			ini_set('display_startup_errors', 1);
			error_reporting(E_ALL);
		}
		$autoload_files = include dirname(dirname(__FILE__)).'/libraries/autoload.php';
		foreach ($autoload_files as $fileinfo) {
			include dirname(dirname(__FILE__)).'/'.$fileinfo;
		}
		//$caller = $this->get_caller_info();
		//print_r($caller); exit;
	}
	
	function setConfigValues() {
		//$this->CONFIG = parse_ini_file(dirname(dirname(__FILE__)).'/libraries/config.ini');
	}
	
	function redirect($url, $statusCode = 303)
	{
	  header('Location: ' . $url, true, $statusCode);
	   die();
	}
	
	function unauthorisedAccess()
	{
	   //include_once($this->CONFIG['BASE_URL']."pages/user/500.php");
	   header('Location: ' . $this->CONFIG['BASE_URL']."pages/user/500.php", true, 303);
	   die();
	}
	
	function updateAttachmentId($randomId, $refId)
	{
		$objAttachment = new attachments();
		$objAttachment->updateAttachmentRefId($randomId, $refId);
	}
	
	/* function getDocuments($id, $type)
	{
		$objAttachment = new attachments();
		$allDocs = $objAttachment->find($id, $type);
	} */
	
	
	function validateACL()
	{
		return "";
		$whitelistedArr = array('register', 'login', 'logout', 'confirmAuthCode', 'forgotPassword', 'setPassword', 'updateProfilePic', 'UPDATE_DETAILS', 'ADD_UPDATE_DETAILS', 'DELETE_USER', 'ADD_USER');
		if(isset($_GET['param']) && (in_array($_GET['param'], $whitelistedArr) ||	in_array($_GET['param'], $_SESSION['user_permissions']))) {
			//continue and user has access to it.
			return true;
		} else {
			// redirect to "access denied page"
		}
	}
	
	//Useful for each page
	function verifyAccess($module, $action, $roleId)
	{
		include_once(__DIR__."/../classes/roles_permissions.php");
		$objRolePermissions = new roles_permissions();
		$listData = $objRolePermissions->findAccess($module, $action, $roleId);
		if(count($listData) > 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	
	//Usefull for Menu
	function getModulesAccesWith($roleId)
	{
		include_once(__DIR__."/../classes/roles_permissions.php");
		$objRolePermissions = new roles_permissions();
		$listData = $objRolePermissions->findAccess("", "", $roleId);
		$moduleArray = array();
		foreach($listData as $eachPermission)
		{
			array_push($moduleArray, strtolower($eachPermission["moduleName"]));
		}
		return $moduleArray;
	}
	
	function get_caller_info()
	{
		$c = '';
		$file = '';
		$func = '';
		$class = '';
		$trace = debug_backtrace();
		print_r($_SESSION);
		print_r($trace);
		if (isset($trace[2])) {
			$file = $trace[1]['file'];
			$func = $trace[2]['function'];
			if ((substr($func, 0, 7) == 'include') || (substr($func, 0, 7) == 'require')) {
				$func = '';
			}
		} else if (isset($trace[1])) {
			$file = $trace[1]['file'];
			$func = '';
		}
		if (isset($trace[3]['class'])) {
			$class = $trace[3]['class'];
			$func = $trace[3]['function'];
			$file = $trace[2]['file'];
		} else if (isset($trace[2]['class'])) {
			$class = $trace[2]['class'];
			$func = $trace[2]['function'];
			$file = $trace[1]['file'];
		}
		if ($file != '') $file = basename($file);
		$c = $file . ": ";
		$c .= ($class != '') ? ":" . $class . "->" : "";
		$c .= ($func != '') ? $func . "(): " : "";
		return($c);
	}
	
	//Residential & Office floor plans
	
	
	function getAspectRatio($file)
	{
		if(file_exists(__DIR__."/../".$file))
		{
			$imageSizes = getimagesize(__DIR__."/../".$file);
			$fileSizes = filesize(__DIR__."/../".$file);
			//print_r($fileSizes);
			//echo "<pre>";print_r($imageSizes);
			$requiredWidth = 400;
			//$aspectRatio = round($imageSizes[0]/$imageSizes[1], 2);
			if($imageSizes[0] > $imageSizes[1])//Width > Height
			{
				$aspectRatio = round($imageSizes[0]/$imageSizes[1], 2);
				return array(400, round(400/$aspectRatio, 2), $imageSizes[0], $imageSizes[1], $fileSizes);
			}
			else if($imageSizes[0] < $imageSizes[1])//Width < Height
			{
				$aspectRatio = round($imageSizes[1]/$imageSizes[0], 2);
				return array( round(400/$aspectRatio, 2), 400, $imageSizes[0], $imageSizes[1], $fileSizes);
			}
			else if($imageSizes[0] == $imageSizes[1])//Width = Height
			{
				return array(400, 400, $imageSizes[0], $imageSizes[1], $fileSizes);
			}
		}
		else
		{
			return array(0, 0, 0, 0, 0);
		}
	}
	
	function formatSizeUnits($bytes)
    {
        if ($bytes >= 1073741824)
        {
            $bytes = number_format($bytes / 1073741824, 2) . ' GB';
        }
        elseif ($bytes >= 1048576)
        {
            $bytes = number_format($bytes / 1048576, 2) . ' MB';
        }
        elseif ($bytes >= 1024)
        {
            $bytes = number_format($bytes / 1024, 0) . ' KB';
        }
        elseif ($bytes > 1)
        {
            $bytes = round($bytes, 0) . ' bytes';
        }
        elseif ($bytes == 1)
        {
            $bytes = $bytes . ' byte';
        }
        else
        {
            $bytes = '0 bytes';
        }

        return $bytes;
	}
	
	
	
}
