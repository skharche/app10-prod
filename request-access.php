<?php
// ✅ use statements MUST be at the top of the file
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

$firstname = trim($_POST['firstname'] ?? '');
$lastname  = trim($_POST['lastname']  ?? '');
$company   = trim($_POST['company']   ?? '');
$city      = trim($_POST['city']      ?? '');
$email     = trim($_POST['email']     ?? '');


// Basic server-side validation
if (!$firstname || !$lastname || !$company || !$city || !$email) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
    exit;
}

	$config = array();
	include_once("configParams.php");

	$conn = new mysqli($config["dbhost"], $config["dbuser"], $config["dbpassword"], $config["dbname"]);

	if ($conn->connect_error) {
		echo json_encode(['valid' => false, 'message' => 'DB connection failed']);
		exit;
	}
	
	$sql  = "INSERT INTO tuserrequest (firstname, lastname, email, city, company, date_created)
         VALUES (?, ?, ?, ?, ?, NOW())";
	 
	$stmt = $conn->prepare($sql);
	if (!$stmt) {
		echo json_encode(['status' => 'error', 'message' => 'DB prepare failed: ' . $conn->error]);
		exit;
	}
	 
	$stmt->bind_param('sssss', $firstname, $lastname, $email, $city, $company);
	 $stmt->execute();
	 
	// Send email
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host     = 'localhost';
        $mail->SMTPAuth = false;
        $mail->Port     = 25;

        $mail->setFrom('support@visgrid.com', 'Support');
        $mail->addAddress("support@floorplan.city"); // ✅ Send to the actual user, not hardcoded address

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
						  A new access request was submitted:
						</td>
					  </tr>

					  <tr>
						<td align="center" style="padding:20px;">
						  <table width="400" >
							<tr>
								<td align="left" style="font-weight:bold;">Name</td>
								<td>'.$firstname.' '.$lastname.'</td>
							</tr>
							<tr>
								<td align="left" style="font-weight:bold;">Company</td>
								<td>'.$company.'</td>
							</tr>
							<tr>
								<td align="left" style="font-weight:bold;">City</td>
								<td>'.$city.'</td>
							</tr>
							<tr>
								<td align="left" style="font-weight:bold;">Email</td>
								<td>'.$email.'</td>
							</tr>
						  </table>
					  </tr>
					</table>
				  </td>
				</tr>
			  </table>
			</body>
			</html>
			';
        $mail->Subject = 'New Request received';
        $mail->Body    = $emailBody;
        $mail->AltBody = "New Request Received by {$firstname} {$lastname} - {$email}, {$company}, {$city}";

        $mail->send();
    } catch (Exception $e) {
        // Log but don't expose internal error to client
        error_log("Mailer Error: " . $mail->ErrorInfo);
    }