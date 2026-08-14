<?php

// Include PHPMailer files
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'localhost'; // GoDaddy SMTP
    $mail->SMTPAuth   = false;
    //$mail->Username   = 'support@floorplan.city';
    //$mail->Password   = 'gActW82RuHeQ5wR';
    //$mail->SMTPSecure = 'tls'; // or 'ssl'
    $mail->Port       = 25;   // 465 for SSL

    // Sender & recipient
    $mail->setFrom('support@floorplan.city', 'Support');
    $mail->addAddress('swapnil.k00@gmail.com');

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'PHPMailer Test Email';
    $mail->Body    = '<b>Email is working!</b>';
    $mail->AltBody = 'Email is working!';

    $mail->send();
    echo 'Message sent successfully';

} catch (Exception $e) {
    echo "Message could not be sent. Error: {$mail->ErrorInfo}";
}