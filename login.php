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
		header("Location: index.php?".$_POST['returnURL']);
    }
}

$returnURL = "";
foreach($_GET as $key => $v)
{
	$returnURL .= $key."=".$v."&";
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
    <title>FLOORPLAN.CITY</title>

    <!-- Custom fonts for this template-->
    <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
	<link href="myaccount.css" rel="stylesheet" type="text/css">
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
                            
                            <div class="col-lg-6 bg-login-image">
								<img id="loginImage" src="" class="img-fluid">
								<div id="cityNames"></div>
							</div>
							
							<div class="col-lg-6 position-relative">
								<div class="p-5">
									<div class="text-center loginHeader">
										<img src="images/FLOORPLAN-CITY.png" class="loginLogo">
										<h1 class="h4 text-gray-900 mb-2">Welcome to Floorplan City!</h1>
										<p class="mb-4" style="font-size:13px;color:#888;">
											Don't have an account?
											<a href="javascript:void(0)" onclick="openRequestAccessModal()" style="color:#4e73df;font-weight:600;text-decoration:none;">New Account</a>
										</p>
									</div>
									<form class="user" action="" method="POST">
										<div class="form-group">
											<input type="hidden" id="returnURL" name="returnURL" value="<?=$returnURL?>" />
											<input type="text" class="form-control form-control-user" id="inputUsername" name="inputUsername" aria-describedby="emailHelp" placeholder="Username">
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
										<a class="small" href="javascript: $('#forgotPasswordModal').modal('show'); ">Reset Password</a>
									</div>
									<!--div class="text-center">
										<a class="small" href="register.php">Create an Account!</a>
									</div-->
								</div>

								<!-- Version Label -->
								<div class="version-label">version 1.4</div>
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
							.url-label {
								position: absolute;
								bottom: 10px;
								left: 20px;
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
	
	
		<!-- Request Access Modal -->
	<div id="requestAccessModal" class="fullScreenModalWindow">
	  <div class="myAccountModal-content" style="max-width:520px;">

		<!-- Header -->
		<div class="mac-header">
			<div class="mac-header-left">
				<img src="images/FLOORPLAN-CITY.png" class="loginLogo2" alt="Logo">
				<span class="mac-title">New Account</span>
			</div>

			<span class="mac-close" onclick="closeRequestAccessModal()" style="font-size: 60px;
    font-weight: bold;
    color: #aaa;
    cursor: pointer;">&times;</span>
		</div>

		<!-- Body -->
		<div class="mac-body" style="display:block;">

		  <!-- Default form view -->
		  <div id="raForm" class="mac-form-panel">
			<p class="mac-section-label">Your Details</p>
			<div class="mac-field-row">
			  <div class="mac-field">
				<label for="ra_firstname">First Name</label>
				<input type="text" id="ra_firstname" placeholder="">
			  </div>
			  <div class="mac-field">
				<label for="ra_lastname">Last Name</label>
				<input type="text" id="ra_lastname" placeholder="">
			  </div>
			</div>
			<div class="mac-field full-width" style="margin-bottom:14px;">
			  <label for="ra_company">Company</label>
			  <input type="text" id="ra_company" placeholder="">
			</div>
			<div class="mac-field-row">
			  <div class="mac-field">
				<label for="ra_city">City</label>
				<input type="text" id="ra_city" placeholder="">
			  </div>
			  <div class="mac-field">
				<label for="ra_email">Email Address</label>
				<input type="email" id="ra_email" placeholder="">
			  </div>
			</div>
			<div id="raError" style="color:#dc2626;font-size:13px;margin-top:4px;display:none;"></div>
		  </div>

		  <!-- Success view (hidden by default) -->
		  <div id="raSuccess" style="display:none;text-align:center;padding:40px 24px;">
			<div style="font-size:48px;margin-bottom:12px;">✅</div>
			<p style="font-size:16px;font-weight:600;color:#111;margin-bottom:6px;">Request Sent!</p>
			<p style="font-size:13px;color:#888;">Thanks! We'll be in touch shortly.</p>
		  </div>

		</div>

		<!-- Footer -->
		<div class="mac-footer" id="raFooter">
		  <span></span><!-- spacer to keep save button right-aligned -->
		  <div class="mac-footer-actions">
			<button class="mac-btn-cancel" onclick="closeRequestAccessModal()">Cancel</button>
			<button class="mac-btn-save" id="raSaveBtn" onclick="submitRequestAccess()">Send Request</button>
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
	.mac-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 20px 24px;
		border-bottom: 1px solid #e5e5e5;
	}

	.mac-header-left {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.loginLogo2 {
		display: block;
		max-width: 253px;
		max-height: 46px;
		width: auto;
		height: auto;
		object-fit: contain;
		margin-bottom: 12px;
		padding-bottom: 0;
	}

	.mac-title {
		font-size: 15px;
		font-weight: 600;
		color: #222;
	}

	.mac-close {
		font-size: 60px;
		font-weight: bold;
		color: #aaa;
		cursor: pointer;
		line-height: 0.8;
	}

	.mac-close:hover {
		color: #333;
	}
	.loginLogo2 {
	  display: block;
	  max-width: 391px;   /* limit width */
	  max-height: 46px;   /* limit height */
	  width: 100%;        /* responsive scaling */
	  height: auto;       /* preserve aspect ratio */
	  margin: 0 auto;     /* center horizontally */
	  object-fit: contain; /* make sure it never stretches */
	  padding-bottom: 20px;
	}
	.loginLogo {
	  display: block;
	  max-width: 760px;   /* limit width */
	  max-height: 100px;   /* limit height */
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
	var desktopImages = {
										   
		'Toronto'   : 'images/Toronto_large.jpg',
		'Vancouver' : 'images/Vancouver_large.jpg',
		'Calgary'   : 'images/Calgary_large.jpg',
		'Edmonton'  : 'images/Edmonton_large.jpg'
	};
	var mobileImages = {
										   
		'Toronto'   : 'images/Toronto_small.jpg',
		'Vancouver' : 'images/Vancouver_small.jpg',
		'Calgary'   : 'images/Calgary_small.jpg',
		'Edmonton'  : 'images/Edmonton_mobile.jpg'
	};

	var currentImageSet = desktopImages;
	var cityKeys        = Object.keys(currentImageSet);
	var currentIndex    = 0;
	var rotateInterval  = null;

	function renderCityNames() {
		var container = document.getElementById('cityNames');
		container.innerHTML = cityKeys.map(function(city, i) {
			return '<span class="city-label' + (i === currentIndex ? ' active' : '') + '" data-index="' + i + '">' + city + '</span>';
		}).join('<span class="city-sep"> | </span>');

		container.querySelectorAll('.city-label').forEach(function(el) {
			el.addEventListener('click', function() {
				currentIndex = parseInt(this.getAttribute('data-index'));
				showImage(currentIndex);
				// restart timer from this point
				if (rotateInterval) clearInterval(rotateInterval);
				rotateInterval = setInterval(autoAdvance, 4000);
			});
		});
	}

	function showImage(index) {
		var img = document.getElementById('loginImage');
		img.style.opacity = '0';
		setTimeout(function() {
			img.src = cityKeys[index] ? currentImageSet[cityKeys[index]] : '';
			img.style.opacity = '1';
		}, 400);
		// update city labels
		document.querySelectorAll('.city-label').forEach(function(el, i) {
			el.classList.toggle('active', i === index);
		});
	}

	function autoAdvance() {
		currentIndex = (currentIndex + 1) % cityKeys.length;
		showImage(currentIndex);
	}

	function startRotation() {
		if (rotateInterval) clearInterval(rotateInterval);
		showImage(currentIndex);
		rotateInterval = setInterval(autoAdvance, 4000);
	}

	// debounce helper to avoid firing too often
	function debounce(fn, delay) {
		let t;
		return function() {
			clearTimeout(t);
			t = setTimeout(fn, delay);
		};
	}

	function updateLoginImageBasedOnLayout() {
		const imgCol   = document.querySelector('.bg-login-image');
		const cols     = document.querySelectorAll('.col-lg-6');
		const otherCol = Array.from(cols).find(el => el !== imgCol);
		if (!imgCol || !otherCol) return;

		const imgTop   = Math.round(imgCol.getBoundingClientRect().top);
		const otherTop = Math.round(otherCol.getBoundingClientRect().top);
		const stacked  = imgTop !== otherTop;

		if (stacked && window.innerWidth < 992) {
			currentImageSet = mobileImages;
			$('.bg-login-image').addClass('onlyMobileHeader');
			$('.p-5').addClass('p-5-width');
			$('#loginImage').removeClass('desktopImageStyle');
		} else {
			currentImageSet = desktopImages;
			$('.bg-login-image').removeClass('onlyMobileHeader');
			$('#loginImage').addClass('desktopImageStyle');
			$('.p-5').removeClass('p-5-width');
		}
		cityKeys = Object.keys(currentImageSet);
		renderCityNames();
		startRotation();
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
	#loginImage {
		transition: opacity 0.4s ease-in-out;
	}
	#cityNames {
		text-align: center;
		padding: 8px 4px 4px;
		font-size: 12px;
		letter-spacing: 0.03em;
	}
	.city-label {
		color: #222;
		cursor: pointer;
		transition: color 0.4s ease-in-out;
		font-weight: 500;
	}
	.city-label.active {
		color: #4e73df;
		font-weight: 700;
	}
	.city-label:hover {
		color: #4e73df;
	}
	.city-sep {
		color: #aaa;
	}
	</style>
	<?php include_once("forgot-password-modal.php");?>

	<script>
	function openRequestAccessModal() {
		// Reset to form state each time it opens
		document.getElementById('raForm').style.display    = 'block';
		document.getElementById('raSuccess').style.display = 'none';
		document.getElementById('raFooter').style.display  = 'flex';
		document.getElementById('raError').style.display   = 'none';
		document.getElementById('raError').textContent     = '';
		['ra_firstname','ra_lastname','ra_company','ra_city','ra_email'].forEach(function(id) {
			document.getElementById(id).value = '';
		});
		document.getElementById('requestAccessModal').classList.add('open');
	}

	function closeRequestAccessModal() {
		document.getElementById('requestAccessModal').classList.remove('open');
	}

	async function submitRequestAccess() {
		var btn = document.getElementById('raSaveBtn');
		var errBox = document.getElementById('raError');

		var fields = {
			firstname : document.getElementById('ra_firstname').value.trim(),
			lastname  : document.getElementById('ra_lastname').value.trim(),
			company   : document.getElementById('ra_company').value.trim(),
			city      : document.getElementById('ra_city').value.trim(),
			email     : document.getElementById('ra_email').value.trim()
		};

		// Basic validation
		for (var key in fields) {
			if (!fields[key]) {
				errBox.textContent = 'Please fill in all fields.';
				errBox.style.display = 'block';
				return;
			}
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
			errBox.textContent = 'Please enter a valid email address.';
			errBox.style.display = 'block';
			return;
		}
		errBox.style.display = 'none';

		btn.textContent = 'Sending…';
		btn.disabled = true;

		try {
			var formData = new FormData();
			Object.keys(fields).forEach(function(k) { formData.append(k, fields[k]); });

			var response = await fetch('request-access.php', { method: 'POST', body: formData });
			var result   = await response.json();

			if (result.status === 'success') {
				document.getElementById('raForm').style.display    = 'none';
				document.getElementById('raFooter').style.display  = 'none';
				document.getElementById('raSuccess').style.display = 'block';
			} else {
				errBox.textContent = result.message || 'Something went wrong. Please try again.';
				errBox.style.display = 'block';
			}
		} catch (err) {
			errBox.textContent = 'Network error. Please try again.';
			errBox.style.display = 'block';
		} finally {
			btn.textContent = 'Send Request';
			btn.disabled = false;
		}
	}

	// Close modal on overlay click
	document.getElementById('requestAccessModal').addEventListener('click', function(e) {
		if (e.target === this) closeRequestAccessModal();
	});
	</script>
</body>

</html>