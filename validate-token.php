<?php
// ✅ use statements MUST be at the top of the file
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

$token = $_POST['token'] ?? '';
$email = $_POST['email'] ?? '';

$config = array();
include_once("configParams.php");

$conn = new mysqli($config["dbhost"], $config["dbuser"], $config["dbpassword"], $config["dbname"]);

if ($conn->connect_error) {
    echo json_encode(['valid' => false, 'message' => 'DB connection failed']);
    exit;
}

$row = [];

if (strlen($token) > 0) {
    // ✅ Use prepared statements to prevent SQL injection
    $stmt = $conn->prepare("SELECT idtuser FROM tuser WHERE reset_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

if (strlen($email) > 0) {
    date_default_timezone_set('America/New_York');

    $stmt = $conn->prepare("SELECT idtuser FROM tuser WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) {
        echo json_encode(['valid' => false, 'message' => 'Email not found!']);
        exit;
    }

    $token   = bin2hex(random_bytes(32));
    $now     = date("Y-m-d H:i:s");

    $stmt = $conn->prepare("UPDATE tuser SET reset_token = ?, date_modified = ? WHERE idtuser = ?");
    $stmt->bind_param("ssi", $token, $now, $row["idtuser"]);
    $stmt->execute();
    $stmt->close();

    // Send email
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host     = 'localhost';
        $mail->SMTPAuth = false;
        $mail->Port     = 25;

        $mail->setFrom('support@floorplan.city', 'Support');
        $mail->addAddress($email); // ✅ Send to the actual user, not hardcoded address

        $resetLink = "http://floorplan.city/reset-password.php?token=" . $token;

        $mail->isHTML(true);
		$emailBody = '
			<!DOCTYPE html>
			<html>
			<head>
			<meta charset="UTF-8">
			<title>Password Reset</title>
			</head>
			<body style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
			  <table width="100%" cellpadding="0" cellspacing="0">
				<tr>
				  <td align="center">
					<table width="600" style="background:#ffffff; padding:20px; border-radius:8px;">
					  
					  <tr>
						<td align="center" style="font-size:24px; font-weight:bold; padding-bottom:10px;">
						  Reset Your Password
						</td>
					  </tr>

					  <tr>
						<td style="font-size:14px; color:#555;">
						  We received a request to reset your password. Click the button below to set a new password.
						</td>
					  </tr>

					  <tr>
						<td align="center" style="padding:20px;">
						  <a href="'.$resetLink.'" 
							 style="background:#007BFF; color:#ffffff; padding:12px 20px; text-decoration:none; border-radius:5px;">
							 Reset Password
						  </a>
						</td>
					  </tr>

					  <tr>
						<td style="font-size:12px; color:#999;">
						  This link will expire in 1 hour.<br><br>
						  If you did not request this, please ignore this email.
						</td>
					  </tr>

					</table>
				  </td>
				</tr>
			  </table>
			</body>
			</html>
			';
        $mail->Subject = 'Password Reset Request';
        $mail->Body    = $emailBody;//"Click here to reset your password: <a href='{$resetLink}'>{$resetLink}</a>";
        $mail->AltBody = "Reset your password: {$resetLink}";

        $mail->send();
    } catch (Exception $e) {
        // Log but don't expose internal error to client
        error_log("Mailer Error: " . $mail->ErrorInfo);
    }
}

if (!empty($row["idtuser"])) {
    echo json_encode(['valid' => true, 'message' => 'Reset email sent!']);
} else {
    echo json_encode(['valid' => false, 'message' => 'Email not found!']);
}
?>