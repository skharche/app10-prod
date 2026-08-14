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
	
	function getLoggedInUserDetails($idtuser)
	{
		$objBuilding = new user();
		return $objBuilding->getLoggedInUserDetails($idtuser);
	}
	
	function updateAccount($admin_url, $userId, $email, $phoneNumber, $imageFile = null)
    {
        // Validate email
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return array("status" => "error", "message" => "A valid email address is required.");
        }

        // Validate phone (optional field)
        if (!empty($phoneNumber) && !preg_match('/^\+?[\d\s\-().]{7,20}$/', $phoneNumber)) {
            return array("status" => "error", "message" => "Invalid phone number format.");
        }

        // Handle profile image upload
        $profileImagePath = null;
        if (!empty($imageFile['tmp_name'])) {
            $maxBytes = 2 * 1024 * 1024; // 2 MB
            $allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

            if ($imageFile['size'] > $maxBytes) {
                return array("status" => "error", "message" => "Image must be under 2 MB.");
            }

            $finfo    = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($imageFile['tmp_name']);
            if (!in_array($mimeType, $allowed, true)) {
                return array("status" => "error", "message" => "Only JPG, PNG, WebP and GIF images are allowed.");
            }

            $ext       = strtolower(pathinfo($imageFile['name'], PATHINFO_EXTENSION));
            $filename  = 'user_' . $userId . '_' . time() . '.' . $ext;
            $uploadDir2 = './uploads/profile_images/';
            $uploadDir = "../".$admin_url.'/uploads/profile_images/';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            if (!move_uploaded_file($imageFile['tmp_name'], $uploadDir . $filename)) {
                return array("status" => "error", "message" => "Failed to save image. Please try again.");
            }

            $profileImagePath = $uploadDir2 . $filename;
        }

        // Call class method
        $objUser = new user();
        $result  = ($profileImagePath !== null)
            ? $objUser->updateAccount($userId, $email, $phoneNumber, $profileImagePath)
            : $objUser->updateAccount($userId, $email, $phoneNumber);

        switch ($result) {
            case 'SUCCESS':
                $data = array("email" => $email, "phone_number" => $phoneNumber);
                if ($profileImagePath !== null) {
                    $data['profile_image'] = $profileImagePath;
                }
                return array("status" => "success", "message" => "Account updated successfully.", "data" => $data);

            case 'EMAIL_TAKEN':
                return array("status" => "error", "message" => "This email is already in use.");

            case 'INVALID_ACTION':
                return array("status" => "error", "message" => "Invalid parameters passed.");

            default:
                return array("status" => "error", "message" => "Failed to update account. Please try again.");
        }
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
		case "updateAccount":
            if (empty($_POST["idtuser"])) {
                echo json_encode(array("status" => "error", "message" => "Unauthorised."));
                break;
            }
            $imageFile = isset($_FILES["image"]) ? $_FILES["image"] : null;
            $result    = $objController->updateAccount(
                $_POST["admin_url"],
                $_POST["idtuser"],
                $_POST["email"]        ?? '',
                $_POST["phone_number"] ?? '',
                $imageFile
            );
            echo json_encode($result);
		break;
		case "getLoggedInUserDetails":
			$data = $objController->getLoggedInUserDetails($_REQUEST["user_id"]);
			echo json_encode(array("status" => "success", "data" => $data));
			
		break;
		case "saveUserAccessData":
			if(!isset($_POST["isMobile"]))
				$_POST["isMobile"] = 0;
			$data = $objController->saveUserAccessData($_POST["idtuser"], $_POST["idtapp"], $_POST["cesiumKey"], $_POST["apiAccessed"], $_POST["appModule"], $_POST["isMobile"], $_POST["ipAddress"] );
			echo json_encode(array("status" => "success", "data" => $data));
			break;
		default:
			//echo json_encode(array("error" => "Invalid Request Received!!!"));
			break;
	}
}

?>