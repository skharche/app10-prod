<?php

	setcookie("app10LoggedInUserName", "", time() - 10000, "/");
	setcookie("app10LoggedInUserId", "", time() - 10000, "/");

	header("Location: login.php");

?>