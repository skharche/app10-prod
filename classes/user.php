<?php
if(!defined("user"))
{
	define("user",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	class user
	{
		var $status = 1;
		var $active = 1;
		var $collection = 1;
		var $flags = array();
	
		function __CONSTRUCT()
		{
			//Args is used to overload the method. Unused cases should be removed. 
			$args = func_get_args();
			switch(count($args))
			{
				case 0:
					break;
			}
		}
		
		function saveUserAccess()
		{
			$args = func_get_args();
			$userId = 0;
			$appId = 0;
			$apiAccessed = "";
			$appModule = "";
			$isMobile = 0;
			$IPAddress = "";
			switch(count($args))
			{
				case 7:
					$userId = $args[0];
					$appId = $args[1];
					$cesiumKey = $args[2];
					$apiAccessed = $args[3];
					$appModule = $args[4];
					$isMobile = $args[5];
					$IPAddress = $args[6];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "INSERT INTO tuser_access_log (idtuser, idtapp, idtcesiumkeys, api_accessed, app_module, is_mobile, ip_address) values ('".$userId."', '".$appId."', '".$cesiumKey."', '".$apiAccessed."', '".$appModule."', '".$isMobile."', '".$IPAddress."' )  ";
			
			$last_id = 0;
			if($result = mysqli_query($mysqliObj, $q))
			{
				$last_id = mysqli_insert_id($mysqliObj);
			}
			return $last_id;
		}
		
		function destroy()
		{
			//unset($this);
		}
		
		/********************************************************************************************************************/
	}	//end of class definition
	/************************************************************************************************************************/
	
}	//end of ifndef
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DO NOT PUT WHITESPACE AFTER THE PHP CLOSING TAG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
?>