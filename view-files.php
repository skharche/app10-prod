<?php
include_once(__DIR__."/classes/connection.php");
$obj = new dbConnection();
$conn = $obj->ConnectPrepare();

// Function to decrypt parameter
function decryptParam($data) {
    $encryption_key = base64_decode("4587854");
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, 'AES-256-CBC', $encryption_key, 0, $iv);
}

// Validate and decrypt ID
if (isset($_GET['floorplan'])) {
	$suiteId = $_GET['id'];
	//$id = intval(base64_decode($_GET['id']));
	$stmt = $conn->prepare("SELECT image_name, image_path FROM tsuiteimages WHERE image_type = 'floor-plan-images' AND idtsuite=?");

	$stmt->bind_param("i", $suiteId);
	$stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($filename, $filepath);
	$stmt->fetch();
	$filedata = file_get_contents("../visgrid-tools/".$filepath.$filename);
	header("Content-Type: image/jpeg");
	header("Content-Disposition: attachment; filename=\"$filename\"");
	echo $filedata;
	return;
}
if (!isset($_GET['id'])) {
    die("Invalid request");
}

$decrypted_id = decryptParam($_GET['id']);
if (!$decrypted_id) {
    die("Invalid or expired download link");
}

//$id = intval(base64_decode($_GET['id']));
$stmt = $conn->prepare("SELECT filename, filetype, filedata FROM aos_document WHERE aos_document_id=?");

$stmt->bind_param("i", $decrypted_id);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($filename, $filetype, $filedata);
$stmt->fetch();

header("Content-Type: $filetype");
header("Content-Disposition: inline; filename=\"$filename\"");
echo $filedata;
?>