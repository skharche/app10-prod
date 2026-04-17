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
if (!isset($_GET['id'])) {
    die("Invalid request");
}

$decrypted_id = decryptParam($_GET['id']);
if (!$decrypted_id) {
    die("Invalid or expired download link");
}

// Fetch file from database
$stmt = $conn->prepare("SELECT filename, filetype, filedata FROM aos_document WHERE aos_document_id = ?");
$stmt->bind_param("s", $decrypted_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    die("File not found");
}

$stmt->bind_result($filename, $filetype, $filedata);
$stmt->fetch();
$stmt->close();

// Send download headers
header("Content-Type: " . $filetype);
header("Content-Disposition: attachment; filename=\"" . basename($filename) . "\"");
header("Content-Length: " . strlen($filedata));

echo $filedata;
exit;
?>