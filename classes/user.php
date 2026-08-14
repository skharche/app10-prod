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
		
		function getLoggedInUserDetails($userId)
		{
			$conn = new dbConnection();
			$mysqliObj = $conn->Connect();
			
			$q = "SELECT * FROM tuser WHERE idtuser = '".$userId."' ";
			
			$row = array();
			if($result = mysqli_query($mysqliObj, $q))
			{
				$row = mysqli_fetch_assoc($result);
			}
			return $row;
		}
		
		function updateAccount()
		{
			$args = func_get_args();
			switch(count($args))
			{
				case 3:
					$userId       = $args[0];
					$email        = $args[1];
					$phoneNumber  = $args[2];
					$profileImage = null;
					break;
				case 4:
					$userId       = $args[0];
					$email        = $args[1];
					$phoneNumber  = $args[2];
					$profileImage = $args[3];
					break;
				default:
					return $this->status = 'INVALID_ACTION';
			}

			$conn      = new dbConnection();
			$mysqliObj = $conn->Connect();

			// Sanitise
			$userId      = mysqli_real_escape_string($mysqliObj, $userId);
			$email       = mysqli_real_escape_string($mysqliObj, $email);
			$phoneNumber = mysqli_real_escape_string($mysqliObj, $phoneNumber);

			// Check email not taken by another user
			$checkQ = "SELECT idtuser FROM tuser 
					   WHERE email = '$email' AND idtuser != '$userId' LIMIT 1";
			$checkR = mysqli_query($mysqliObj, $checkQ);
			if (mysqli_num_rows($checkR) > 0) {
				return 'EMAIL_TAKEN';
			}

			// Build query depending on whether an image was uploaded
			if ($profileImage !== null) {
				$profileImage = mysqli_real_escape_string($mysqliObj, $profileImage);

				// Fetch old image path so we can delete the file
				$oldQ = "SELECT profile_pic FROM tuser WHERE idtuser = '$userId' LIMIT 1";
				$oldR = mysqli_query($mysqliObj, $oldQ);
				$oldRow = mysqli_fetch_assoc($oldR);

				$q = "UPDATE tuser 
					  SET email         = '$email',
						  phone_number  = '$phoneNumber',
						  profile_pic = '$profileImage',
						  date_modified    = NOW()
					  WHERE idtuser = '$userId'";
			} else {
				$oldRow = null;
				$q = "UPDATE tuser 
					  SET email        = '$email',
						  phone_number = '$phoneNumber',
						  date_modified   = NOW()
					  WHERE idtuser = '$userId'";
			}

			if (mysqli_query($mysqliObj, $q)) {
				// Delete old profile image file if replaced
				if ($profileImage !== null && !empty($oldRow['profile_pic'])) {
					$oldPath = __DIR__ . '/../' . $oldRow['profile_pic'];
					if (file_exists($oldPath)) {
						unlink($oldPath);
					}
				}
				return 'SUCCESS';
			}

			return 'QUERY_FAILED';
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