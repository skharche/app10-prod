<?php
if(!defined("cesiumKey"))
{
	define("cesiumKey",1);
	/************************************************************************************************************************/
	/*		Included files																									*/
	/************************************************************************************************************************/
	include_once(__DIR__."/connection.php");
	/************************************************************************************************************************/	
	
	class cesiumKey
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
		
		function getCesiumKey()
		{
			$args = func_get_args();
			$appId = 0;
			switch(count($args))
			{
				case 1:
					$appId = $args[0];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT tcesiumkey.* FROM tcesiumkey, tappkeys WHERE 
				tappkeys.idtapp = '".$appId."' AND tcesiumkey.is_active = 1 AND tappkeys.is_active = 1 AND tappkeys.idtcesiumkey = tcesiumkey.idtcesiumkey LIMIT 0, 1 ";
			
			$details = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				$details = mysqli_fetch_assoc($result);
			}
			return $details;
		}
		
		function verifyAppAccess()
		{
			$args = func_get_args();
			$userId = 0;
			$appName = "";
			switch(count($args))
			{
				case 2:
					$userId = $args[0];
					$appName = $args[1];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}
			
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT idtuser_app, tapp.app_name FROM 
			tuser_app
			JOIN tapp ON tapp.idtapp = tuser_app.idtapp
			WHERE tuser_app.idtuser = '".$userId."' AND LOWER(tapp.app_name) = '".$appName."' ";
			
			$response = false;
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
				if(isset($row["idtuser_app"]))
				{
					return true;
				}
			}
			return $response;
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