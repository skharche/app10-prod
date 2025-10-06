<?php
include 'auth.php';
//updatePassword(92, "123456");
if (isset($_COOKIE['app10LoggedInUserId'])) {
	session_start();
	$row = explode(" ", $_COOKIE['app10LoggedInUserName']);
	$_SESSION['idtuser'] = $row["idtuser"];
	$_SESSION['firstname'] = $row[0];
	$_SESSION['lastname'] = $row[1];
    // If the cookie is not set, redirect to the login page
    header("Location: index.php");
    exit();
}

$error = "";
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	//print_r($_POST);exit;
    $username = $_POST['inputUsername'];
    $password = $_POST['inputPassword'];
	/*
	if(!isset($_POST['rememberMe']))
		$rememberMe = 0;
	else
		$rememberMe = 1;
	*/
	$rememberMe = 1;
		
    
    $checkDetails = login($username, $password, $rememberMe);
	//print_r($checkDetails);exit;
    if ($checkDetails["status"] == false)
	{
        $error = $checkDetails["message"];//die;
    }
	else
	{
		header("Location: index.php");
    }
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">
	<link rel="icon" href="images/floorplan-icon.png">
    <title>Login</title>

    <!-- Custom fonts for this template-->
    <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
        rel="stylesheet">

    <!-- Custom styles for this template-->
    <link href="css/sb-admin-2.min.css" rel="stylesheet">

</head>

<body class="bg-gradient-primary">

    <div class="container">

        <!-- Outer Row -->
        <div class="row justify-content-center">

            <div class="col-xl-10 col-lg-12 col-md-9">

                <div class="card o-hidden border-0 shadow-lg my-5">
                    <div class="card-body p-0">
                        <!-- Nested Row within Card Body -->
                        <div class="row">
                            
                            <div class="col-lg-6 bg-login-image" >
								<img id="loginImage" src="" class="img-fluid">
							</div>
							
							<div class="col-lg-6 position-relative">
								<div class="p-5">
									<div class="text-center loginHeader">
										<img src="images/FLOORPLAN-CITY.png" class="loginLogo">
										<h1 class="h4 text-gray-900 mb-4">Welcome to Floorplan City!</h1>
									</div>
									<form class="user" action="" method="POST">
										<div class="form-group">
											<input type="text" class="form-control form-control-user" id="inputUsername" name="inputUsername" aria-describedby="emailHelp" placeholder="Enter Email Address...">
										</div>
										<div class="form-group">
											<input type="password" class="form-control form-control-user" id="inputPassword" name="inputPassword" placeholder="Password">
										</div>
										<div class="form-group">
											<div class="custom-control custom-checkbox small">
												<input type="checkbox" class="custom-control-input" id="rememberMe" name="rememberMe">
												<label class="custom-control-label" for="rememberMe">Remember Me</label>
											</div>
										</div>
										<div align="center" id="errorMessage" class="error-message"></div>
										<button class="btn btn-primary btn-user btn-block">
											Login
										</button>
									</form>
									<hr>
									<div class="text-center">
										<a class="small" href="forgot-password.php">Forgot Password?</a>
									</div>
									<!--div class="text-center">
										<a class="small" href="register.php">Create an Account!</a>
									</div-->
								</div>

								<!-- Version Label -->
								<div class="version-label">version 1.0</div>
							</div>

							<style>
							.version-label {
								position: absolute;
								bottom: 10px;
								right: 20px;
								font-size: 12px;
								color: #6c757d;
								opacity: 0.8;
							}
							</style>

                            <!--div class="col-lg-6">
                                <div class="p-5">
                                    <div class="text-center loginHeader">
										<img src="images/FLOORPLAN-CITY.png" class="loginLogo" >
                                        <h1 class="h4 text-gray-900 mb-4">Welcome to Floorplan City!</h1>
                                    </div>
                                    <form class="user" action="" method="POST">
                                        <div class="form-group">
                                            <input type="text" class="form-control form-control-user"
                                                id="inputUsername" name="inputUsername" aria-describedby="emailHelp"
                                                placeholder="Enter Email Address...">
                                        </div>
                                        <div class="form-group">
                                            <input type="password" class="form-control form-control-user"
                                                id="inputPassword" name="inputPassword" placeholder="Password">
                                        </div>
                                        <div class="form-group">
                                            <div class="custom-control custom-checkbox small">
                                                <input type="checkbox" class="custom-control-input" id="rememberMe" name="rememberMe">
                                                <label class="custom-control-label" for="rememberMe">Remember
                                                    Me</label>
                                            </div>
                                        </div>
										<div align="center" id="errorMessage" class="error-message"><?php if(strlen($error) > 0) { echo $error;}?></div>
                                        <button  class="btn btn-primary btn-user btn-block">
                                            Login
                                        </button>
                                    </form>
                                    <hr>
                                    <div class="text-center">
                                        <a class="small" href="forgot-password.php">Forgot Password?</a>
                                    </div>
                                </div>
                            </div-->
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </div>
	<style>
	.error-message {
	  color: red;
	  margin-top: 10px;
	}
	body
	{
		font-family: Helvetica !important;
	}
	
	.loginLogo {
	  display: block;
	  max-width: 640px;   /* limit width */
	  max-height: 80px;   /* limit height */
	  width: 100%;        /* responsive scaling */
	  height: auto;       /* preserve aspect ratio */
	  margin: 0 auto;     /* center horizontally */
	  object-fit: contain; /* make sure it never stretches */
	  padding-bottom: 20px;
	}
	.loginHeader h1{
		font-size: 1.2rem;
	}
	
	.p-5-width{
		padding-top: 1.5rem !important;
	}
	</style>
	
    <!-- Bootstrap core JavaScript-->
    <script src="vendor/jquery/jquery.min.js"></script>
    <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

    <!-- Core plugin JavaScript-->
    <script src="vendor/jquery-easing/jquery.easing.min.js"></script>

    <!-- Custom scripts for all pages-->
    <script src="js/sb-admin-2.min.js"></script>
	<script>
	var isMobile = {
			Android: function() {
				return navigator.userAgent.match(/Android/i);
			},
			BlackBerry: function() {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			iOS: function() {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			Opera: function() {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: function() {
				return navigator.userAgent.match(/IEMobile/i);
			},
			any: function() {
				return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
			}
		};
		if(isMobile.any() != null)
		{
			$("#loginImage").attr("src", "images/login_graphic2.jpg");
			$(".bg-login-image").addClass('onlyMobileHeader');   // ✅ add class
			$(".p-5").addClass('p-5-width');   // ✅ add class
			$("#loginImage").removeClass('desktopImageStyle');
		}
		
		// vanilla JS with debounce
		// debounce helper to avoid firing too often
function debounce(fn, delay){ 
  let t; 
  return function(){ 
    clearTimeout(t); 
    t = setTimeout(fn, delay); 
  }; 
}

function updateLoginImageBasedOnLayout() {
  const img = document.getElementById('loginImage');
  const imgCol = document.querySelector('.bg-login-image');
  const cols = document.querySelectorAll('.col-lg-6');
  const otherCol = Array.from(cols).find(el => el !== imgCol);
  if (!img || !imgCol || !otherCol) return;

  const imgTop = Math.round(imgCol.getBoundingClientRect().top);
  const otherTop = Math.round(otherCol.getBoundingClientRect().top);
  const stacked = imgTop !== otherTop; // stacked if tops differ
	console.log(stacked);
  if (stacked && window.innerWidth < 992) {
    img.setAttribute('src', 'images/login_graphic2.jpg');
    $(".bg-login-image").addClass('onlyMobileHeader');   // ✅ add class
    $("#loginImage").removeClass('desktopImageStyle');
	$(".p-5").addClass('p-5-width');
  } else {
    img.setAttribute('src', 'images/login_graphic.jpg');
    $(".bg-login-image").removeClass('onlyMobileHeader'); // ✅ remove class
    $("#loginImage").addClass('desktopImageStyle');
	$(".p-5").removeClass('p-5-width');
  }
}

const updateDebounced = debounce(updateLoginImageBasedOnLayout, 20);
window.addEventListener('load', updateDebounced);
window.addEventListener('resize', updateDebounced);
	</script>

<script>
	document.addEventListener("DOMContentLoaded", function () {
	  const modalContent = document.querySelector(".fullscreenmodal-content");

	  function adjustModalPosition() {
		if (!modalContent) return;

		modalContent.style.margin = "20px auto 40px"; // top, horizontal center, bottom
		modalContent.style.position = "relative";     // keep inside modal
	  }

	  // Run once on load
	  adjustModalPosition();

	  // Run on window resize
	  window.addEventListener("resize", adjustModalPosition);
	});
</script>


	<style>
	.onlyMobileHeader{
		/*display: block;*/
		margin-top: 10px;
		margin-left: 10px;
		margin-right: 10px;
	}
	.desktopImageStyle{
		width: 100%; margin-top: 35px; margin-left: 20px;
	}																 
	</style>
</body>

</html>