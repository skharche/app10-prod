<?php
//echo "<pre>";print_r($_COOKIE);exit;
session_start();

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
if (isset($_GET['id']))
{
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
	exit;
}

if (!isset($_COOKIE['app10LoggedInUserId'])) {
    // If the cookie is not set, redirect to the login page
    header("Location: login.php");
    exit();
}


if(isset($_REQUEST["q"]))
{
	//echo $_REQUEST["q"];
	include_once (__DIR__ . "/classes/tinyURL.php");
	$obj = new tinyURL();
	$originalURL = $obj->getOriginalURL($_REQUEST["q"]);
	header("Location: $originalURL");
	exit;
}

$appId = 2;//$cesiumKeyObject->getAppId("App10");
include_once (__DIR__ . "/classes/cesiumKey.php");
$cesiumKeyObject = new cesiumKey();

$cesiumKey = $cesiumKeyObject->getCesiumKey($appId);
$loggedInUserId = $_COOKIE['app10LoggedInUserId'];
$loggedInUserName = $_COOKIE['app10LoggedInUserName'];

if(!$cesiumKeyObject->verifyAppAccess($loggedInUserId, "app10"))
{
	setcookie("app10LoggedInUserName", "", time() - 10000, "/");
	setcookie("app10LoggedInUserId", "", time() - 10000, "/");
	
	header("Location: login.php");
    exit();
}

$IPAddress = $_SERVER['REMOTE_ADDR'];
$cesiumKeyToUse = "";
$cesiumKeyId = "";
if(isset($cesiumKey["key_value"]))
{
	$cesiumKeyToUse = $cesiumKey["key_value"];
	$cesiumKeyId = $cesiumKey["idtcesiumkey"];
}
//Get Cesium Key
//Also get logged in user id

include_once (__DIR__ . "/classes/classcolor.php");
$classColorObj = new tclasscolor();
$classColorDetails = $classColorObj->getClassColorArray();
//echo "<pre>";print_r($classColor);exit;
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<link rel="icon" href="images/floorplan-icon.png">
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
    />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>floorplan.city</title>
    <link
      rel="stylesheet"
      href="./lib/bootstrap-5.1.1-dist/css/bootstrap.min.css"
    />
	<!--
    <link rel="stylesheet" href="./lib/fontawesome/css/all.min.css" />
    <link rel="stylesheet" href="./lib/fontawesome/css/fontawesome.min.css" />
    <link rel="stylesheet" href="./styles/viewer.css" />
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/scss/mixins/_transition.scss" rel="stylesheet">
	-->
	<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
	<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js" integrity="sha256-lSjKY0/srUM9BE3dPm+c4fBo1dky2v27Gdjm2uoZaL0=" crossorigin="anonymous"></script>
    <script src="../measure/CesiumCDN/Cesium-1.130/Build/Cesium/Cesium.js"></script>
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-953HGCEP7T"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());

	  gtag('config', 'G-953HGCEP7T');
	</script>
	<link rel="stylesheet" href="coordsUpdateStyle.css" />
	<link rel="stylesheet" href="coordsUpdateStyleMobile.css" />
	<link rel="stylesheet" href="navtabs.css" />
	<link rel="stylesheet" href="dropdownStyle.css" />
    <link
      rel="stylesheet"
      href="../measure/CesiumCDN/Cesium-1.130/Build/Cesium/Widgets/widgets.css"
    />
	<!--
    <link rel="stylesheet" href="./lib/jquery-ui.css" />
    <script src="./lib/JQuery-1.9.1/jquery-1.9.1-min.js"></script>
    <script src="./lib/jquery-ui.js"></script>
    <script src="./lib/turf.min.js"></script>
    <script src="./lib/bootstrap-5.1.1-dist/js/bootstrap.min.js"></script>
    <script src="./lib/bootstrap-5.1.1-dist/js/bootstrap.bundle.min.js"></script>
	-->
	<?php
		$city = 0;
		$market = "";
		$marketId = "";
		$loadingStatement = "";
		
		$defaultCityName = [];
		$defaultCityName[1] = "Toronto";
		$defaultCityName[2] = "Calgary";
		$defaultCityName[3] = "Chicago";
		$defaultCityName[4] = "New York";
		$defaultCityName[5] = "San Francisco";
		$defaultCityName[6] = "Boston";
		$defaultCityName[8] = "Seattle";
		$defaultCityName[10] ="Montréal";
		$defaultCityName[12] ="Vancouver";
		$defaultCityName[13] ="Miami";
		$defaultCityName[15] ="Edmonton";
		$defaultCityName[19] ="Singapore";
		$defaultCityName[23] ="Sydney";
		$defaultCityName[25] ="London";
		$defaultCityName[31] = "Frankfurt";
		$defaultCityName[34] ="Hong Kong";
		$defaultCityName[35] ="Brisbane";
		$defaultCityName[36] ="Tokyo";
		$defaultCityName[44] ="Buenos Aires";
		$defaultCityName[45] ="Melbourne";
		$defaultCityName[53] ="Halifax";
		$defaultCityName[68] ="Cape Town";
		$defaultCityName[69] ="Johannesburg";
		
		$defaultMarketName = [];
		$defaultMarketName[7] = "Downtown Manhattan";
		$defaultMarketName[8] = "Midtown Manhattan";
		$defaultMarketName[9] = "Midtown Manhattan South";
		
		$cityBuildingCount = [];
		$cityBuildingCount[1] = 1362;
		$cityBuildingCount[2] = 887;
		$cityBuildingCount[3] = 792;
		$cityBuildingCount[4] = 11198;
		$cityBuildingCount[10] = 1961;
		$cityBuildingCount[12] = 1137;
		$cityBuildingCount[15] = 169;
		$cityBuildingCount[23] = 235;
		$cityBuildingCount[31] = 202;
		$cityBuildingCount[34] = 143;
		$cityBuildingCount[53] = 26;
		$cityBuildingCount[68] = 3;
		$cityBuildingCount[69] = 3;
		include_once("cityBuildingCounts.php");
		
		$loadingStatement = "";
		
		if(!isset($_REQUEST["city"]))
		{
			$_REQUEST["city"] = 0;
			$_REQUEST["market"] = "Office";
		}
		if(isset($_REQUEST["city"]) && isset($cityBuildingCount[$_REQUEST["city"]]))
		{
			$city = $_REQUEST["city"];
			$loadingStatement = "Loading ".$cityBuildingCount[$city]." Properties";// in ".$defaultCityName[$city]."...";
		}
		
		if(isset($_REQUEST["market"]))
			$market = $_REQUEST["market"];
		
		$lastBuildingId = "";
		if(isset($_REQUEST["lastId"]))
			$lastBuildingId = $_REQUEST["lastId"];
		
		$lastSuiteId = "";
		if(isset($_REQUEST["lastSuiteId"]))
			$lastSuiteId = $_REQUEST["lastSuiteId"];
		
		$tabYearSelected = "All";
		if(isset($_REQUEST["year"]))
			$tabYearSelected = $_REQUEST["year"];
		$lastSuiteIndex = null;
		if(isset($_REQUEST["lastSuite"]))
			$lastSuiteIndex = $_REQUEST["lastSuite"];
		
		$effects = "";
		if(isset($_REQUEST["effects"]))
			$effects = $_REQUEST["effects"];
		
		$camDetails = "";
		if(isset($_REQUEST["cam"]))
			$camDetails = $_REQUEST["cam"];
		
		$defaultFloorSelected = 0;
		if(isset($_REQUEST["lastFloor"]) && $_REQUEST["lastFloor"] != 0)
			$defaultFloorSelected = $_REQUEST["lastFloor"];
		
		if(isset($_REQUEST["marketId"]))
		{
			$marketId = $_REQUEST["marketId"];
			if($city == 4)
			{
				$loadingStatement = "Loading ".$marketBuildingCount[$marketId]." Properties";//buildings in ".$defaultMarketName[$marketId]."...";
			}
		}
		if($loadingStatement == "Loading  buildings in ...")
			$loadingStatement = "";
		//include_once("arealyticSuiteJSON.php");
	?>
	<style>
	.cesium-viewer-toolbar{
		display:none;
	}
    .copied-tooltip {
      position: absolute;
      background: #eee;
      color: #666;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      z-index: 1000;
    }
    .copied-tooltip.show {
      opacity: 1;
    }
	
	/*City Grid CSS*/
	.market-list {
      list-style: none;
      padding: 0;
      margin: 10px 0 0;
      background: #ffffff;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: none;
      position: absolute;
      /*width: 100%;*/
      z-index: 1000;
    }

    .market-list li {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .market-list li:last-child {
      border-bottom: none;
    }
  </style>
	<script>
		var defaultCity = null;
		var defaultCityName = [];
		var defaultMarket = null;
		var defaultBuilding = null;
		var defaultSuiteId = null;
		var defaultTabYearSelected = "All";
		var DefaultSuiteIndex = null;
		var defaultCamera = null;
		var defaultEffects = [];
		var defaultFloorSelected = 0;
		
		window.loggedInUserId = '<?php echo $loggedInUserId; ?>';
		
		defaultCity = parseInt('<?php echo $city; ?>');
		defaultMarket = '<?php echo $market; ?>';
		defaultMarketId = '<?php echo $marketId; ?>';
		defaultBuilding = '<?php echo $lastBuildingId; ?>';
		defaultSuiteId = '<?php echo $lastSuiteId; ?>';
		defaultTabYearSelected = '<?php echo $tabYearSelected; ?>';
		DefaultSuiteIndex = '<?php echo $lastSuiteIndex; ?>';
		defaultEffects = '<?php echo $effects; ?>';
		defaultCamera = '<?php echo $camDetails; ?>';
		defaultFloorSelected = '<?php echo $defaultFloorSelected; ?>';
		//console.log("defaultCity "+defaultCity);
		//console.log("defaultMarket "+defaultMarket);
		//console.log("defaultMarketId "+defaultMarketId);
		//console.log("defaultBuilding "+defaultBuilding);
		//console.log("defaultSuiteId "+defaultSuiteId);
		//console.log("DefaultSuiteIndex "+DefaultSuiteIndex);
		//console.log("defaultEffects "+defaultEffects);
		//console.log("defaultCamera", defaultCamera);
		//console.log("defaultFloorSelected "+defaultFloorSelected);
		if(defaultBuilding != null)
		{
			lastSelectedBuilding = defaultBuilding;
			devSelectedBuilding = defaultBuilding;
		}
		if(defaultCamera.length > 0 && defaultCamera != "Array")
		{
			defaultCamera = JSON.parse(decodeURIComponent(defaultCamera));
		}
		//console.log("defaultEffects", defaultEffects);
		if(defaultEffects.length > 0 && defaultEffects != "Array")
		{
			defaultEffects = JSON.parse(decodeURIComponent(defaultEffects));
		}
		var cityBuildingCount = $.parseJSON( '<?php echo json_encode($cityBuildingCount); ?>' );
		var marketBuildingCount = $.parseJSON( '<?php echo json_encode($marketBuildingCount); ?>' );
		marketBuildingCount = [];
		var defaultCityName = $.parseJSON( '<?php echo json_encode($defaultCityName); ?>' );
		var defaultMarketName = $.parseJSON( '<?php echo json_encode($defaultMarketName); ?>' );
		var defaultMarketName = $.parseJSON( '<?php echo json_encode($defaultMarketName); ?>' );
		
	</script>
	
	<script>
	var classColor = [];
	var classColorCoding = [];
	var classObject = $.parseJSON( '<?php echo json_encode($classColorDetails); ?>' );
	$.each(classObject, function (index, eachClass){
		classColor[eachClass.class_name] = eachClass.hex_color;
		classColorCoding[eachClass.class_name] = eval('Cesium.Color.fromCssColorString("'+classColor[eachClass.class_name]+'").withAlpha(0.5)');
	});
	
	/*
	classColor["A"] = "#ff0000";
	classColor["AA"] = "#990000";
	classColor["AAA"] = "#ff0000";
	classColor["B"] = "#0087bd";
	classColor["C"] = "#ffd300";
	classColor["APT"] = "#33FF00";//"#80d4ff";
	classColor["Apartments"] = "#33FF00";//"#80d4ff";
	classColor["Condominiums"] = "#339900";//"#35A400";
	classColor["MDU"] = "#339900";
	classColor["SENIOR"] = "#339900";
	classColor["HOTEL"] = "#cc66ff";
	classColor["Retail"] = "#FF9900";
	classColor["RETAIL"] = "#FF9900";
	classColor["Gov"] = "#D35400";
	classColor["Gov"] = "#D35400";
	classColor["GOV"] = "#D35400";

	classColor["EDU"] = "#48C9B0";
	classColor["MED"] = "#FF99CC";

	classColor["Hotel"] = "#cc66ff";
	classColor["Floorplans"] = "#ff0000";

	classColor["Direct"] = "#ff0000";
	classColor["Sublease"] = "#ffff00";
	classColor["Co-Working"] = "#00ff00";

	classColor["Office"] = "#ff0000";
	classColor["OfficeConversion"] = "#0087bd";

	classColor["PROPOSED"] = "#35A400";
	classColor["UNDER CONSTRUCTION"] = "#ff9900";

	classColorCoding["A"] = eval('Cesium.Color.fromCssColorString("'+classColor["A"]+'").withAlpha(0.5)');
	classColorCoding["AA"] = eval('Cesium.Color.fromCssColorString("'+classColor["AA"]+'").withAlpha(0.5)');
	classColorCoding["AAA"] = eval('Cesium.Color.fromCssColorString("'+classColor["A"]+'").withAlpha(0.5)');
	classColorCoding["B"] = eval('Cesium.Color.fromCssColorString("'+classColor["B"]+'").withAlpha(0.5)');
	classColorCoding["C"] = eval('Cesium.Color.fromCssColorString("'+classColor["C"]+'").withAlpha(0.5)');
	classColorCoding["APT"] = eval('Cesium.Color.fromCssColorString("'+classColor["APT"]+'").withAlpha(0.5)');
	classColorCoding["MDU"] = eval('Cesium.Color.fromCssColorString("'+classColor["MDU"]+'").withAlpha(0.5)');
	classColorCoding["SENIOR"] = eval('Cesium.Color.fromCssColorString("'+classColor["SENIOR"]+'").withAlpha(0.5)');
	classColorCoding["HOTEL"] = eval('Cesium.Color.fromCssColorString("'+classColor["HOTEL"]+'").withAlpha(0.5)');
	classColorCoding["Hotel"] = eval('Cesium.Color.fromCssColorString("'+classColor["Hotel"]+'").withAlpha(0.5)');
	classColorCoding["GOV"] = eval('Cesium.Color.fromCssColorString("'+classColor["GOV"]+'").withAlpha(0.5)');
	classColorCoding["Gov"] = eval('Cesium.Color.fromCssColorString("'+classColor["Gov"]+'").withAlpha(0.5)');
	classColorCoding["RETAIL"] = eval('Cesium.Color.fromCssColorString("'+classColor["Retail"]+'").withAlpha(0.5)');
	classColorCoding["Retail"] = eval('Cesium.Color.fromCssColorString("'+classColor["Retail"]+'").withAlpha(0.5)');

	classColorCoding["EDU"] = eval('Cesium.Color.fromCssColorString("'+classColor["EDU"]+'").withAlpha(0.5)');
	classColorCoding["MED"] = eval('Cesium.Color.fromCssColorString("'+classColor["MED"]+'").withAlpha(0.5)');

	classColorCoding["Office"] = eval('Cesium.Color.fromCssColorString("'+classColor["Office"]+'").withAlpha(0.5)');
	classColorCoding["OfficeConversion"] = eval('Cesium.Color.fromCssColorString("'+classColor["OfficeConversion"]+'").withAlpha(0.5)');

	classColorCoding["PROPOSED"] = eval('Cesium.Color.fromCssColorString("'+classColor["PROPOSED"]+'").withAlpha(0.5)');
	classColorCoding["UNDER CONSTRUCTION"] = eval('Cesium.Color.fromCssColorString("'+classColor["UNDER CONSTRUCTION"]+'").withAlpha(0.5)');
	*/

	</script>
	
    <script src="./main.js"></script>
    <script src="./nearestPoint.js"></script>
    <script src="./cameraFunctions.js"></script>
    <script src="./devBuildingCameraFunctions.js"></script> <!-- App15 and App18 functions-->
  </head>
  <body>
		<div id="tooltip" class="copied-tooltip">Copied!</div>
	  <div class="loading-overlay fade-out22">
		<span class="loading-overlay-user" style="display:none;"><span onClick="logoutUser();"><?php echo $_COOKIE["app10LoggedInUserName"];?> <img height="24" width="24" src="images/logout.png"/></a></span></span>
		<div class="loading-overlay-message center-container">
			<div class="loading-message">
			  <?php //echo $loadingStatement;?>
			</div>
		</div>
		<div class="loading-overlay-message center-container">
			<div class="loader2"><img src="images/circle-loader.gif" /></div>
		</div>
		<div class="loading-overlay-city-grid" style="display:none; width: 50%;">
			<div class="container" style="">
				
			</div>
			<div class="loader2 below-grid-loader"><img src="images/circle-loader.gif" /></div>
		</div>
	  </div>
	  
    <div id="baseLayerPickerContainer">
	</div>
	
	<div class="full-screen-arrow arrow-left" onclick="panoCameraMovement(1);" >
		<img src="images/img-left.png" height="78px">
	</div>
    <div class="full-screen-arrow arrow-right" onclick="panoCameraMovement(-1);" >
		<img src="images/img-right.png" height="78px">
	</div>
	
    <div id="cesiumContainer">
    </div>
	<!-- Logo Overlay -->
	<div id="mapLogoOverlay" onclick="moveToCityGrid();" style="cursor:pointer;" class="logoOverlay" style="display: none;">
	  <img src="images/FLOORPLAN-CITY.png" alt="Logo"/>
	</div>
	<?php
	if(isset($_REQUEST["q"]))
	{
		?>
		<div id="tempSearchBox">
			<input type="text" class="form-control" id="tempSearchField" /><button class="btn btn-xs" onClick="flyToBuildingCamera()">Go</button>
		</div>
		<?php
	}
	?>
	<?php
	/*
	if(isset($_REQUEST["dev"]))
	{
		?>
		<div id="tempSearchBox2">
		
			Total Floors: <span id="selectedBuildingFloors"></span><br />
			Total Altitude: <span id="selectedBuildingAltitude"></span><br />
			Calculated Floor height: <span id="calculatedFloorHeight"></span><br />
			Base Height: <input type="text" class="form-control" id="buildingBaseHeight" value="0" />&nbsp;<button type="button" class="btn btn-default" onClick="incrementBuildingBaseHeight();">+</button>&nbsp;&nbsp;<button type="button" class="btn btn-default" onClick="decrementBuildingBaseHeight();">-</button><br />
			Floor Height: <input type="text" class="form-control" id="floorHeight" value="3"/><button type="button" class="btn btn-default" onClick="incrementFloorHeight();">+</button>&nbsp;&nbsp;<button type="button" class="btn btn-default" onClick="decrementFloorHeight();">-</button><br />
			<br />
			<span class="tempSaveBuildingNotification"></span>
			<br />
			<button class="btn" onClick="viewSelectedBuilding()">View Building</button>&nbsp;&nbsp;&nbsp;
			<button class="btn" onClick="saveDevBuildingDetails()">Save</button>&nbsp;&nbsp;&nbsp;
			<button class="btn" onClick="clearSelectedBuilding()">Clear</button>
		</div>
		<?php
	}
	*/
	?>
	<div id="legendPanel" class="calculatedLegendWidth">
		<span class="legendContainer">
			
		</span>
	</div>
	
	<div id="companyLogoContainer"></div>
    <div class="summaryInfoboxContainer">
		<div class="summaryInfoboxHeaderData">
			<a href="javascript:defaultToOfficeMarket();" style="padding-top:2px;"><span class="defaultCityName"></span></a>.<a href="javascript:moveToCityGrid();" style="padding-top:2px;">floorplan.city</a>
			<span class="chevronIconContaier opened" style="cursor:pointer;"><img src="images/Collapse.png" style="margin-bottom: 2px;" width="40px" height="25px" onClick="toggleSummaryInfobox();"/></span>
		</div>
        <div class="summaryInfoboxCityDetails"></div>
		<!--span style='float: right; margin-right: 10px; margin-top: -10px; display:none;' class='marketStatsButtonContainer'>
			<button class='btn btn-sm btn-secondary' onClick='backToSummaryInfobox();'>Overview</button>
		</span-->
        <span class="summaryInfoboxContainerData"></span>
		<div class="infoboxContainer" style="display:none; border-top:1px solid black; padding-top: 7px;">
			
			<span class="infoboxHeaderData"></span>
			<!--span style='float: right; margin-right: 10px; margin-top: -10px; display:none;' class='marketStatsButtonContainer'>
				<button class='btn btn-sm btn-secondary' onClick='backToSummaryInfobox();'>Overview</button>
			</span-->
			<span class="infoboxContainerData"></span>
		</div>
		<div id="infoboxFloorPlanRow"></div>
	</div>
	
	<div id="searchBoxController" style="display:none;">
		<div style="position: relative; width: 300px; height: 300px; margin: 0 auto; display: flex; flex-direction: column-reverse;">
			<input
				type="text"
				id="searchBox"
				autocomplete="off" 
				placeholder="Search"
				style="width: 100%; padding: 10px; font-size: 16px; box-sizing: border-box;"
			/>
			<ul
				id="suggestions"
				style="position: absolute; bottom: 50px; left: 0; width: 100%; background: #fff; border: 1px solid #ccc; list-style: none; margin: 0; padding: 0; max-height: 200px; overflow-y: auto; z-index: 10;"
			></ul>
		</div>
	</div>
	
	<div id="fullScreenModal" class="fullScreenModalWindow">
		<div class="fullscreenmodal-content">
			<span class="fullscreenmodal-title"></span>
			<span id="closeModal" class="close" onClick="closeFullScreenModal();">&times;</span>
			<br />
			<div class="row full-screen-columns" style="display: flex;">
				<div class="modal-left" ></div>
				<div class="modal-center modal-center-desktop"></div>
				<div class="modal-right" ></div>
			</div>
			<div class="row full-screen-columns-mobile" style="display: none;">
				<div class="modal-center modal-center-mobile"></div>
			</div>
			<span class="fullscreen-buildingname"></span>
			<br clear="all">
			<!--span class="fullscreen-innter-content"></span-->
		</div>
    </div>
	
	
	<div id="viewerController">
		<!--div class="image-container">
			<img width="25px" id="autoRotateZoom3" onClick='reloadCityCamera();' data-bs-toggle="tooltip" class="imgIcon" src="images/location_city.png" />
			<span class="tooltip">Skyline</span>
		</div-->
		<div class="dropdown3">
		  <!-- Image trigger for the dropdown -->
			<div class="image-container" style="padding-left: 5px;">
				<img src="images/location_city.png" class="dropdown3-toggle bottomRowIcons" alt="Views" />
				<span class="tooltip">Views</span>
			</div>

		  <!-- Dropdown menu -->
		  <ul class="dropdown3-menu">
			
		  </ul>
		</div>
		
		<div class="dropdownCam">
			<div class="image-container">
				<img id="autoRotateZoom" data-bs-toggle="tooltip" class="dropdownCam-toggle imgIcon bottomRowIcons" src="images/360.png" />
				<span class="tooltip rotateTooltip">Rotate</span>
			</div>
			<!-- Dropdown menu -->
			<ul class="dropdownCam-menu">
				<li><a class="dropdownCam-item" id="city-orbit-li" data-text="City Orbit" href="#">City Orbit</a></li>
				<li><a class="dropdownCam-item" id="point-orbit-li" data-text="Point Orbit" href="#">Point Orbit</a></li>
				<li><a class="dropdownCam-item" id="building-orbit-li" data-text="Building Orbit" href="#">Building Orbit</a></li>
			</ul>
		</div>
		<!--img width="25px" title="Shrink" id="autoRotateZoom2" onClick="toggleShrinkTileset();" class="imgIcon tooltipContainer" src="images/shrink.png" /-->
		
		
		<div class="dropdown2">
		  <!-- Image trigger for the dropdown -->
			<div class="image-container">
				<img src="images/settings.png" class="dropdown2-toggle bottomRowIcons" alt="Dropdown Icon" />
				<span class="tooltip">Settings</span>
			</div>

		  <!-- Dropdown menu -->
		  <ul class="dropdown2-menu">
		    <li><a class="dropdown2-item" id="showLogo-li" data-text="Show Logo" href="#">Show Logos</a></li>
			<li><a class="dropdown2-item" id="hideLogo-li" data-text="Hide Logo" href="#">Hide Logos</a></li>
			<li><a class="dropdown2-item selected" id="white-overlay-li" data-text="White Overlay" href="#">White Overlay</a></li>
			<li><a class="dropdown2-item" id="dark-overlay-li" data-text="Dark Overlay" href="#">Dark Overlay</a></li>
			<li><a class="dropdown2-item" id="shrink-li" data-text="Shrink" href="#">Shrink Mesh</a></li>
			<li><a class="dropdown2-item" id="fps-li" data-text="FPS" href="#">FPS</a></li>
			<li><a class="dropdown2-item" id="reset-li" data-text="Reset" href="#">Reset</a></li>
			<!--li id="pano-view-li"><a class="dropdown2-item" id="pano-li" data-text="Pano-View" href="#">Pano</a></li-->
			<li onClick="logoutUser();"><a class="dropdown2-item" id="user-li" data-text="User" href="#"><?php echo $_COOKIE["app10LoggedInUserName"];?> <img height="24" width="24" src="images/logout.png"/></a></li>
		  </ul>
		</div>
		
		<div class="image-container">
			<img id="searchIconImage" onClick="toggleSearchBox();" data-bs-toggle="tooltip" class="imgIcon bottomRowIcons" src="images/search.png" />
			<span class="tooltip searchTooltip">Search</span>
		</div>
		
		<div class="orbitButton">
			<div class="image-container">
				<img id="autoRotateZoom4" onClick='ToggleCameraRotationForBuilding();' data-bs-toggle="tooltip" class="imgIcon bottomRowIcons" src="images/change_circle.png" />
				<span class="tooltip">Building Orbit</span>
			</div>
		</div>
		<div class="panoButton" style="display: none;" >
			<div class="image-container">
				<img id="panoButtonImageContainer" onClick='TogglePanoRotationForBuilding();' data-bs-toggle="tooltip" class="imgIcon bottomRowIcons" src="images/visibility.png" />
				<span class="tooltip">Floor&nbsp;Views</span>
			</div>
		</div>
		<div id="Transparency" title="Transparency" style="display: none;" >
			<div class="image-container">
				<img id="transparencyImageId" onClick="toggleTransparencyDivDisplay();" class="imgIcon bottomRowIcons" src="images/title.png"/>
				<span class="tooltip searchTooltip">Transparency</span>
			</div>
        </div>
		<div id="transparencyDiv" style="position: absolute; left: 225px; width: 330px;">
          <div id="transparencypanel">
            <span style="color: black;">Transparency&nbsp;(%)</span>&nbsp;&nbsp;<input
              type="range"
              id="opacity"
              value="1"
              min="0.0"
              max="1.0"
              step="0.05"
              onchange="OnChangeOpacity()"
            /><span><input size="3" type="text" value="1" id="opacityText" /></span>&nbsp;&nbsp;
          </div>
        </div>
        <!--div
          class="controller"
          id="rotateSlowly"
          title="Rotate Zoom"
          onclick="ToggleCameraRotationSlowly()"
        >
          <img width="25px" id="autoRotateZoom" class="imgIcon" src="images/360.png" />
        </div>
		<div style="margin-top: 8px !important; position: absolute; left: 50px;">
          <img width="25px" onClick="toggleShrinkTileset();" src="./images/shrink.png"/>
        </div>
		<div class="skylineButton" style="margin-top: 8px !important;">
          <img width="25px" class="skylineButtonSpan" onClick='reloadCityCamera();' src="images/location_city.png" />
        </div>
		<div class="orbitButton" style="margin-top: 8px !important;">
          <img width="25px" class="orbitButtonSpan" onClick='ToggleCameraRotationForBuilding();' src="images/change_circle.png" />
        </div>
		<div id="Transparency" title="Transparency" style="display: none; font-size: large;" onClick="toggleTransparencyDivDisplay();">
		  <button class="btn btn-info">T</button>
        </div>
		<div id="transparencyDiv" style="position: absolute; left: 220px; width: 330px;">
          <div id="transparencypanel">
            <span style="color: black;">Transparency(%)</span>&nbsp;&nbsp;<input
              type="range"
              id="opacity"
              value="1"
              min="0.0"
              max="1.0"
              step="0.05"
              onchange="OnChangeOpacity()"
            /><span><input size="3" type="text" value="1" id="opacityText" /></span>&nbsp;&nbsp;
          </div>
        </div-->
	</div>
	
	<div id="PolygonCOverlay">
		<div style="font-size: 22px; margin-bottom: 10px;"><span id="floorNum"></span></div>
		<div id="FloorViewInInfoBox" onclick="FlyToFloorView()">Floor View</div>
		<div id="FloorViewTravelInInfoBox" onclick="ToggleFloorViewCameraSlowRotation()">Floor View Travel</div>
	</div>

	<?php include_once("./cityCameraDetails.php"); ?>
    <script src="./adminBaseUrl.js"></script>
	<script>
		
		//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTIwM2E3Yi1lYTkwLTRiZTYtYmMxYS02NGRkMGYzYTIzMmIiLCJpZCI6MjY1LCJpYXQiOjE1MjE1NDUzNDR9.XIij-qDaBt2xTi-NrUs_PJkII6uo2v7MsAi9dC0fb30';
		var cityBoundaries = [];
		
		var cityCenterPoint = [];
		cityCenterPoint[1] = [-79.38242, 43.64761, 1133];
		cityCenterPoint[2] = [-114.07252, 51.04805, 1330];
		cityCenterPoint[10] = [-63.566019970280465, 44.65323876778313, 245];//Montreal
		cityCenterPoint[15] = [-113.49613, 53.54474, 1034];
		cityCenterPoint[12] = [-123.11583, 49.28430, 555];
		cityCenterPoint[53] = [-63.566019970280465, 44.65323876778313, 245];
		
		window.reloadingAfterCrash = false;
		
		var cityAltitudeAdjustment = [];
		/*
		cityAltitudeAdjustment[1] = 48;
		cityAltitudeAdjustment[2] = 1029;
		cityAltitudeAdjustment[12] = 3;
		cityAltitudeAdjustment[15] = 650;
		cityAltitudeAdjustment[53] = 0;
		*/
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

		//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDhlODY5YS0zNzU3LTQ2N2EtOTJkNS0wMDcyMDI3YTk4MjYiLCJpZCI6Mjg0NDcsImlhdCI6MTcyMDcyMjEwNH0.NfKnGvHnrJY8mTEr0X-DDZ8oE24md0FnA9SQVYBM3z0';
		Cesium.Ion.defaultAccessToken = '<?php echo $cesiumKeyToUse; ?>';
		window.CesiumKeyId = '<?php echo $cesiumKeyId; ?>';
		
		window.IPAddress = '<?php echo $IPAddress; ?>';
		window.appId = '<?php echo $appId; ?>';
				
		function initCesium(){
	 
			viewer = new Cesium.Viewer("cesiumContainer", {
				timeline: false,
				animation: false,
				imageryProvider: false,  // Disable the default base map
				
				baseLayerPicker: false,
				
				geocoder: false,
				homeButton: false
			});

			// Handle WebGL context loss
			viewer.scene.canvas.addEventListener("webglcontextlost", function (e) {
				e.preventDefault();
				console.warn("WebGL context lost!");
				recoverCesium();
			});
			console.log("Cesium Initiation Complete");
			
		}
		
		// --------------------------------------------------------------------
		// RECOVER FUNCTION
		// --------------------------------------------------------------------
		function recoverCesium() {
			return;
			console.warn("Recovering Cesium...");
			setTimeout(() => initCesium2(), 300);
		}
		window.alreadyInitializedOnce = false;
		function initCesium2(){
			if(window.alreadyInitializedOnce)
				return;
			window.alreadyInitializedOnce = true;
			window.blankProvider = new Cesium.SingleTileImageryProvider({
			  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9Qf8l1EAAAAASUVORK5CYII="
			});
			console.log("Re-Initializing Cesium...");
			/*
			if (viewer) {
				viewer.destroy();
				viewer = null;
			}
			*/
			
			$("#cesiumContainer").html("");
			
			viewer2 = new Cesium.Viewer('cesiumContainer', {
				
				vrButton:false,
				infoBox:false,
				imageryProvider: false,  // Disable the default base map
				baseLayerPicker: false,   // Optional: Hide the base layer picker UI
				fullscreenButton:false,
				navigationHelpButton:false,
				selectionIndicator: false,
				geocoder:false,
				homeButton:false,
				timeline:false,
				animation:false,
				sceneModePicker: false,
				requestRenderMode : false,//Enabling Request Render Mode
				logarithmicDepthBuffer : false,
				scene3DOnly:false,
				orderIndependentTranslucency: false,
			});
			viewer = viewer2;
			//viewer.imageryLayers.removeAll();
			
			
			window.camera = viewer.camera;
			//$(".cesium-widget-credits").html("");
			//setTimeout(function (){ $(".cesium-widget-credits").html(""); }, 2000);
			
			viewer.scene.skyBox.show = false;
			viewer.scene.debugShowFramesPerSecond = false;//for FPS Widget
			
			viewer.scene.globe.depthTestAgainstTerrain = false;//To fix issue with Isolate function showing unnecessary tileset portion
			
			globe = viewer.scene.globe;
			globe.baseColor = Cesium.Color.TRANSPARENT;
			//viewer.scene.globe.depthTestAgainstTerrain = true;
  			viewer.scene.highDynamicRange = false;
  			viewer.scene.globe.enableLighting = false;
  			viewer.scene.fog.enabled = false;
			//const baseLayer = viewer.scene.imageryLayers.get(0);
 			//baseLayer.alpha = 0.0;
  			globe.translucency.enabled = true;
  			globe.undergroundColor = undefined;
			
			viewer.scene.skyBox.show = false;
			
			loadMarket($("#mainCityDropdown").val());
			viewer.scene.renderError.addEventListener(function(error) {
				console.error("Cesium Render Error:", error);
				console.error(window.cameraValues);

				// Prevent Cesium from stopping rendering
				viewer.scene._renderError = false;
				recoverCesium();

				// Show user-friendly message
				showCesiumError("A rendering error occurred. Some features may not display correctly.");	
				window.reloadingAfterCrash = true;
			});
			
			if(window.reloadingAfterCrash == true)
			{
				console.log("Camera Flying To");
				var coords = Cesium.Cartesian3.fromDegrees(window.cameraValues[1], window.cameraValues[0], (window.cameraValues[2] + cameraAltitudeAdjustment), Cesium.Ellipsoid.WGS84);
				var heading = Cesium.Math.toRadians(parseFloat(window.cameraValues[3]));
				//Old Method
				//var tilt = Cesium.Math.toRadians(parseFloat(cityCameraDetails[cityToFlyTo].pitch) - 90);
				var pitch = Cesium.Math.toRadians(parseFloat(window.cameraValues[4]));
				camera_v = viewer.scene.camera;
				
				var options = { 
					destination: coords,
					duration: 0,
					orientation: {
						heading: heading,
						pitch: pitch,
						roll: 0.0
					}
				};
				camera_v.flyTo(options);
			}
			window.camera = viewer.camera;
			ShowGoggleTileset();
			window.reloadingAfterCrash = false;
			
		}
		
		try {
			blankProvider = new Cesium.SingleTileImageryProvider({
			  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9Qf8l1EAAAAASUVORK5CYII="
			});
			
			viewer = new Cesium.Viewer('cesiumContainer', {
				
				vrButton:false,
				infoBox:false,
				imageryProvider: false,  // Disable the default base map
				baseLayerPicker: false,   // Optional: Hide the base layer picker UI
				fullscreenButton:false,
				navigationHelpButton:false,
				selectionIndicator: false,
				geocoder:false,
				homeButton:false,
				timeline:true,
				animation:false,
				sceneModePicker: false,
				requestRenderMode : false,//Enabling Request Render Mode
				logarithmicDepthBuffer : false,
				scene3DOnly:false,
				orderIndependentTranslucency: false,
			});
			viewer.imageryLayers.removeAll();
			// Global render error handler
			viewer.scene.renderError.addEventListener(function(error) {
				console.error("Cesium Render Error:", error);
				console.error(window.cameraValues);

				// Prevent Cesium from stopping rendering
				viewer.scene._renderError = false;
				recoverCesium();

				// Show user-friendly message
				showCesiumError("A rendering error occurred. Some features may not display correctly.");	
				window.reloadingAfterCrash = true;
			});
			
			let arcgisLayer;

			function addArcGISLayer() {
			  if (!arcgisLayer) {
				arcgisLayer = viewer.imageryLayers.addImageryProvider(
				  new Cesium.ArcGisMapServerImageryProvider({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
				  })
				);
			  }
			}

			function removeArcGISLayer() {
			  if (arcgisLayer) {
				viewer.imageryLayers.remove(arcgisLayer, true);
				arcgisLayer = null;
			  }
			}
			window.camera = viewer.camera;
			//$(".cesium-widget-credits").html("");
			//setTimeout(function (){ $(".cesium-widget-credits").html(""); }, 2000);
			
			viewer.scene.skyBox.show = false;
			
			//Fix this entire block
			var cityToFlyTo = null;
			if(defaultCity == null || defaultCity == 0)
			{
				cityToFlyTo = 2;
								//console.log(" cityToFlyTo "+cityToFlyTo);
				cameraAltitudeAdjustment = 0;
				var coords = Cesium.Cartesian3.fromDegrees(-110.58152, 42.02386, 8294534, Cesium.Ellipsoid.WGS84);
				var heading = Cesium.Math.toRadians(0);
				//Old Method
				//var tilt = Cesium.Math.toRadians(parseFloat(cityCameraDetails[cityToFlyTo].pitch) - 90);
				var pitch = Cesium.Math.toRadians(0);
				camera_v = viewer.scene.camera;
				
				var options = { 
					destination: coords,
					duration: 0,
					orientation: {
						heading: heading,
						pitch: pitch,
						roll: 0.0
					}
				};
				camera_v.flyTo(options);

			}
			else
			{
				cityToFlyTo = defaultCity;
				//console.log(" cityToFlyTo "+cityToFlyTo);
				cameraAltitudeAdjustment = cityCameraDetails[cityToFlyTo].cameraAltitudeAdjustment;
				var coords = Cesium.Cartesian3.fromDegrees(cityCameraDetails[cityToFlyTo].longitude, cityCameraDetails[cityToFlyTo].latitude, (cityCameraDetails[cityToFlyTo].altitude + cameraAltitudeAdjustment), Cesium.Ellipsoid.WGS84);
				var heading = Cesium.Math.toRadians(parseFloat(cityCameraDetails[cityToFlyTo].heading));
				//Old Method
				//var tilt = Cesium.Math.toRadians(parseFloat(cityCameraDetails[cityToFlyTo].pitch) - 90);
				var pitch = Cesium.Math.toRadians(parseFloat(cityCameraDetails[cityToFlyTo].pitch));
				camera_v = viewer.scene.camera;
				
				var options = { 
					destination: coords,
					duration: 0,
					orientation: {
						heading: heading,
						pitch: pitch,
						roll: 0.0
					}
				};
				camera_v.flyTo(options);
			}
			
			if(typeof cityBoundaries[22] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[2]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
			
			viewer.scene.debugShowFramesPerSecond = false;//for FPS Widget
			
			viewer.scene.globe.depthTestAgainstTerrain = false;//To fix issue with Isolate function showing unnecessary tileset portion
			
			globe = viewer.scene.globe;
			globe.baseColor = Cesium.Color.TRANSPARENT;
			viewer.scene.globe.depthTestAgainstTerrain = true;
  			viewer.scene.highDynamicRange = false;
  			viewer.scene.globe.enableLighting = false;
  			viewer.scene.fog.enabled = false;
			//const baseLayer = viewer.scene.imageryLayers.get(0);
 			//baseLayer.alpha = 0.0;
  			globe.translucency.enabled = true;
  			globe.undergroundColor = undefined;
		  } catch (error) {
			//console.log(error);
		  }
		  
		  var googleTileset = null;
		  var clipTileset = null;
		  async function ShowGoggleTileset() {
			  //return "";
			  
			  googleTileset = await Cesium.createGooglePhotorealistic3DTileset({
				// Only the Google Geocoder can be used with Google Photorealistic 3D Tiles.  Set the `geocode` property of the viewer constructor options to IonGeocodeProviderType.GOOGLE.
				onlyUsingWithGoogleGeocoder: true,
			  });
			  viewer.scene.primitives.add(googleTileset);
				await googleTileset.allTilesLoaded.addEventListener(() => {
					AllTileLoaded = true;
					//console.log("AllTileLoaded = "+AllTileLoaded);
				});
			  /*
			  googleTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207, {
				//maximumScreenSpaceError: 1,
			  });
			  viewer.scene.primitives.add(googleTileset);
			  setTimeout(function (){showTerrain(), 3000});
			  
			  googleTileset.allTilesLoaded.addEventListener(function() {
				  //console.log("All visible tiles are loaded!");
				  //defaultToOfficeMarket();
				});
			  */
			  
			  
			  /*
			  clipTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207, {
				/*maximumScreenSpaceError: 1,* /
			  });
			  viewer.scene.primitives.add(clipTileset);
			  clipTileset.show = false;
			  */
		  }
		  
		  async function showTerrain()
		  {
			viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
			
			/*
			await googleTileset.allTilesLoaded.addEventListener(function() {
				//console.log("All visible tiles are loaded!");
				//defaultToOfficeMarket();
				console.log("All visible tiles are loaded!");
				if(isCityLoadingInProgress)
				{
					setTimeout(function (){ $(".loading-overlay").fadeOut(); isCityLoadingInProgress = false; }, 50);
				}
			});
			*/
		  }
		  
		  var terrainCreated = false;
		  async function createTerrain()
		  {
			viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
			terrainCreated = true;
			//console.log("Terrain Created!");
		  }
		  async function createStadiaTerrain()
		  {
			  if(!terrainCreated)
			  {
				//viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
				//console.log("Terrain Created 2!");
				/*
				baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
				baseLayerPickerViewModel.selectedImagery =
				baseLayerPickerViewModel.imageryProviderViewModels[10];
				*/
				
				terrainCreated = true;
				//console.log("Terrain Created!");
			  }
		  }
		  function removeTerrain()
		  {
			/*viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider(); 
			terrainCreated = false;
			//console.log("Terrain Removed!");*/
			
			while (viewer.imageryLayers.length > 0) {
				viewer.imageryLayers.remove(viewer.imageryLayers.get(0)); // Keep base layer
			}
 
			//for now to revert that terrain.
			/*
			baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
			baseLayerPickerViewModel.selectedImagery =
			baseLayerPickerViewModel.imageryProviderViewModels[0];
			terrainCreated = true;
			*/
		  }
		  
		  var tileset = null;
		  async function LoadAerometrexMesh() {
			  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZDhlODY5YS0zNzU3LTQ2N2EtOTJkNS0wMDcyMDI3YTk4MjYiLCJpZCI6Mjg0NDcsImlhdCI6MTcyMDcyMjEwNH0.NfKnGvHnrJY8mTEr0X-DDZ8oE24md0FnA9SQVYBM3z0';
			try {
				const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(437161,{
					maximumScreenSpaceError: 1,
				});
			viewer.scene.primitives.add(tileset);
			height = 30;
			////console.log("Now Setting Height: "+height);
			var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
			var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
			var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
			var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
			tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
			tileset.show = true;
			
			} catch (error) {
				console.error(`Error creating tileset: ${error}`);
			}
		  }
		  setTimeout(function(){
			  ShowGoggleTileset();
			  //InitiateClipping();
		  }, 2000);
		  setTimeout(function(){
			  //LoadAerometrexMesh();
		  }, 4000);
		  var userLoggedIn = null;
		  setTimeout(function(){
			if(localStorage.getItem("coords-update-login") == null)
			{
			  $("#openModalBtn").click();
			}
			else
			{
				userLoggedIn = localStorage.getItem("coords-update-login");
				$(".UserLoggedIn").html(userLoggedIn);
			}
		  }, 1000);
		  
		  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		  
		/*POINT SELECTION*/
		var initialPoints = [];

		var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		
		var selectedPrimitive = null;
		var selectedPrimitiveId = null;
		
		var lastSelectedPrimitive = null;
		var lastSelectedPrimitiveId = null;
		
		var selectedBuildingId = null;
		var selectedPrimitiveColor = null;
		var selectedPrimitiveColorAlpha = null;
		var lastFloorSelected = null;
		var lastFloorSelectedColor = null;
		window.SelectedBuildingLat = null;
		window.SelectedBuildingLon = null;
		window.earthPosition = null;
		var myPointString = "";
		handler.setInputAction(function(click) {
			
			var feature2 = viewer.scene.pickPosition(click.position);
			window.earthPosition = viewer.scene.pickPosition(click.position);
			if (typeof feature2 != "undefined") {
			  var cartographic = Cesium.Cartographic.fromCartesian(feature2);
			  ////console.log(cartographic);
			  var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
			  var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
			  
			  var heightString = cartographic.height;
			  window.clickedAltitude = parseInt(heightString);
			  console.log(longitudeString + ", " + latitudeString + " @ " + heightString);
			  myPointString += longitudeString + ", " + latitudeString + " @ ";
			  $("#selectedBuildingAltitude").html(parseFloat(heightString) - cameraAltitudeAdjustment);
			  $("#calculatedFloorHeight").html((parseFloat(heightString) - cameraAltitudeAdjustment) / parseInt($("#selectedBuildingFloors").html()));
			  /*
			  var cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
				if(cartesian)
				{
					
				  viewer.entities.add({
						position: cartesian,
						label: {
							text: 'Location: (' + latitudeString + ', ' + longitudeString + ')',
							font: '18px sans-serif',
							fillColor: Cesium.Color.WHITE,
							outlineColor: Cesium.Color.BLACK,
							outlineWidth: 2,
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							showBackground: true,
							backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
							pixelOffset: new Cesium.Cartesian2(0, -25),  // Offset for the label
						}
					});
				}
				*/
				
			}
			var lonlatObj = CartesianToLatlon(feature2);
			//pointSelected = lonlatObj;
			
			if (typeof IsEnableRotateAroundPoint != "undefined" && IsEnableRotateAroundPoint) {
			  if (unsubscribeSPoint != null) {
				unsubscribeSPoint();
			  }
			  pointSelected = lonlatObj;
			  FlyToPoint(lonlatObj);
			}
			
			var pickedObject = viewer.scene.pick(click.position);
			console.log(pickedObject);
			var starWidgetRemoved = false;
			window.lastFloorAltitude = null;
			if ( typeof pickedObject !== "undefined" && typeof pickedObject.id !== "undefined" && typeof pickedObject.id._id == "undefined" )
			{
				resetLastSelectedPrimitive();
				selectedPrimitive = pickedObject.primitive;
				selectedPrimitiveId = pickedObject.id;
				var check = pickedObject.id.split("-");
				console.log(check);
				if(check[0] == "retailEntity")
				{
					clearSearchAndSettingBox();
					ShowInfobox(check[1], "");
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 179];
						attributes.show = [1];
					}
					if(TempBldgData[check[1]].basefloorheight == null)
						TempBldgData[check[1]].basefloorheight = 0;
					CreateDashedLine(check[1], TempBldgData[check[1]].coords, ( cityAltitudeAdjustment[lastCityLoaded] + parseFloat(TempBldgData[check[1]].basefloorheight) ), null);
					
				}
				else if(check[0] == "officeEntity")
				{
					clearSearchAndSettingBox();
					ShowInfobox(check[1], "");
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 179];
						attributes.show = [1];
					}
					if(TempBldgData[check[1]].basefloorheight == null)
						TempBldgData[check[1]].basefloorheight = 0;
					CreateDashedLine(check[1], TempBldgData[check[1]].coords, ( cityAltitudeAdjustment[lastCityLoaded] + parseFloat(TempBldgData[check[1]].basefloorheight) ), null);
				}
				else if(check[0] == "arealyticSuite")
				{
					clearSearchAndSettingBox();
					ShowInfoboxForSuite(check[2], check[3]);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
						attributes.show = [1];
					}
					
					EnableBottomPanoButton();
					window.lastFloorAltitude = parseInt(heightString);
					window.panoSpinHeight = parseInt(heightString);
					window.lastFloor = check[4];
					
					
					var stData = improvedSuites[check[2]][check[3]];
					//console.log("Selected Coords ", stData.coords);
					var coooordss = stData.coords;
					addPolygonOutlineOnTileset(coooordss, window.arealyticSuiteHeight[check[2]][0], window.arealyticSuiteHeight[check[2]][1], Cesium.Color.WHITE);
					
					const height = parseFloat(heightString);
					const cameraPosition = viewer.scene.camera.positionWC;

					// 1. Direction from feature to camera
					const direction = Cesium.Cartesian3.subtract(cameraPosition, feature2, new Cesium.Cartesian3());
					Cesium.Cartesian3.normalize(direction, direction);

					// 2. Offset toward camera
					const towardCamera = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
					const basePosition = Cesium.Cartesian3.add(feature2, towardCamera, new Cesium.Cartesian3());
					
					const towardCamera2 = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
					const basePosition2 = Cesium.Cartesian3.add(feature2, towardCamera2, new Cesium.Cartesian3());

					// 3. Left vector (direction × up)
					const up = new Cesium.Cartesian3(0, 0, 1);
					const left = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
					Cesium.Cartesian3.normalize(left, left);

					// 4. Positions for image & sqft
					const leftOffset = Cesium.Cartesian3.multiplyByScalar(left, 40, new Cesium.Cartesian3());   // image more left
					const rightOffset = Cesium.Cartesian3.multiplyByScalar(left, -5, new Cesium.Cartesian3()); // sqft more right

					const imagePosition = Cesium.Cartesian3.add(basePosition, leftOffset, new Cesium.Cartesian3());
					const areaPosition = Cesium.Cartesian3.add(basePosition2, rightOffset, new Cesium.Cartesian3());

					// Billboard dimensions in meters (match scale * original image size)
					// Since sizeInMeters=true, this is world space, not pixels
					const billboardHalfWidth = 5;  // adjust until it matches your actual logo width
					// verticalOrigin=BOTTOM means the anchor point is already at bottom center,
					// so we don't need to offset down for the connector.

					// 5. Connector start for logo (bottom-right = anchor + half width to the right)
					const rightOffsetLogo = Cesium.Cartesian3.multiplyByScalar(left, -billboardHalfWidth, new Cesium.Cartesian3());
					const logoConnectorStart = Cesium.Cartesian3.add(imagePosition, rightOffsetLogo, new Cesium.Cartesian3());

					// 6. Connector start for sqft label (bottom-left)
					const leftOffsetSqft = Cesium.Cartesian3.multiplyByScalar(left, billboardHalfWidth, new Cesium.Cartesian3());
					const sqftConnectorStart = Cesium.Cartesian3.add(areaPosition, leftOffsetSqft, new Cesium.Cartesian3());

					// 7. Remove old entities
					viewer.entities.removeById('imageLabel');
					viewer.entities.removeById('areaLabel');
					viewer.entities.removeById('logoConnectorLine');
					viewer.entities.removeById('sqftConnectorLine');

					// 8. Add image billboard
					if(true)
					{
						details = improvedSuites[check[2]][check[3]];
						
						var availableArea = null;
						if(details.SuiteSize != null)
						{
							availableArea = parseInt(details.SuiteSize);
						}
						else
						{
							availableArea = parseInt(details.TotalSuiteSize);
						}
						
						// 9. Add sqft label
						viewer.entities.add({
							id: 'imageLabel',
							position: areaPosition,
							label: {
								text: numberWithCommaWithoutDecimal(availableArea, "", " " + cityAreaMeasurementUnit),
								font: "30px Helvetica",
								horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
								disableDepthTestDistance: Number.POSITIVE_INFINITY,
								fillColor: Cesium.Color.BLACK,
								outlineColor: Cesium.Color.WHITE,
								outlineWidth: 5,
								style: Cesium.LabelStyle.FILL_AND_OUTLINE
							}
						});
						/*
						// 9. Add sqft label
						viewer.entities.add({
							id: 'areaLabel',
							position: areaPosition,
							label: {
								text: numberWithCommaWithoutDecimal(details.PricePerSQM, "$", " /yr"),
								font: "30px Helvetica",
								horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
								disableDepthTestDistance: Number.POSITIVE_INFINITY,
								fillColor: Cesium.Color.BLACK,
								outlineColor: Cesium.Color.WHITE,
								outlineWidth: 5,
								style: Cesium.LabelStyle.FILL_AND_OUTLINE
							}
						});
						*/
					}
				}
				else if(check[0] == "partialUnit")
				{
					clearSearchAndSettingBox();
					prepareResiUnitInfobox(check[1], check[2], activeUnitDetails[parseInt(check[1])][check[3]]);
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
						attributes.show = [1];
					}
				}
				else if(check[0] == "arealyticSuitePriceSQM")
				{
					clearSearchAndSettingBox();
					ShowInfoboxForSuite(check[2], check[3]);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
						attributes.show = [1];
					}
					EnableBottomPanoButton();
					window.panoSpinHeight = parseInt(heightString);
					window.lastFloorAltitude = parseInt(heightString);
					window.lastFloor = check[4];
					
					/*
					*/
					var stData = improvedSuites[check[2]][check[3]];
					////console.log("Selected Coords ", stData.coords);
					var coooordss = stData.coords;
					addPolygonOutlineOnTileset(coooordss, window.arealyticSuiteHeight[check[2]][0], window.arealyticSuiteHeight[check[2]][1], Cesium.Color.WHITE);
					
					const height = parseFloat(heightString);
					const cameraPosition = viewer.scene.camera.positionWC;

					// 1. Direction from feature to camera
					const direction = Cesium.Cartesian3.subtract(cameraPosition, feature2, new Cesium.Cartesian3());
					Cesium.Cartesian3.normalize(direction, direction);

					// 2. Offset toward camera
					const towardCamera = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
					const basePosition = Cesium.Cartesian3.add(feature2, towardCamera, new Cesium.Cartesian3());
					
					const towardCamera2 = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
					const basePosition2 = Cesium.Cartesian3.add(feature2, towardCamera2, new Cesium.Cartesian3());

					// 3. Left vector (direction × up)
					const up = new Cesium.Cartesian3(0, 0, 1);
					const left = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
					Cesium.Cartesian3.normalize(left, left);

					// 4. Positions for image & sqft
					const leftOffset = Cesium.Cartesian3.multiplyByScalar(left, 40, new Cesium.Cartesian3());   // image more left
					const rightOffset = Cesium.Cartesian3.multiplyByScalar(left, -5, new Cesium.Cartesian3()); // sqft more right

					const imagePosition = Cesium.Cartesian3.add(basePosition, leftOffset, new Cesium.Cartesian3());
					const areaPosition = Cesium.Cartesian3.add(basePosition2, rightOffset, new Cesium.Cartesian3());

					// Billboard dimensions in meters (match scale * original image size)
					// Since sizeInMeters=true, this is world space, not pixels
					const billboardHalfWidth = 5;  // adjust until it matches your actual logo width
					// verticalOrigin=BOTTOM means the anchor point is already at bottom center,
					// so we don't need to offset down for the connector.

					// 5. Connector start for logo (bottom-right = anchor + half width to the right)
					const rightOffsetLogo = Cesium.Cartesian3.multiplyByScalar(left, -billboardHalfWidth, new Cesium.Cartesian3());
					const logoConnectorStart = Cesium.Cartesian3.add(imagePosition, rightOffsetLogo, new Cesium.Cartesian3());

					// 6. Connector start for sqft label (bottom-left)
					const leftOffsetSqft = Cesium.Cartesian3.multiplyByScalar(left, billboardHalfWidth, new Cesium.Cartesian3());
					const sqftConnectorStart = Cesium.Cartesian3.add(areaPosition, leftOffsetSqft, new Cesium.Cartesian3());

					// 7. Remove old entities
					viewer.entities.removeById('imageLabel');
					viewer.entities.removeById('areaLabel');
					viewer.entities.removeById('logoConnectorLine');
					viewer.entities.removeById('sqftConnectorLine');

					// 8. Add image billboard
					if(true)
					{
						details = improvedSuites[check[2]][check[3]];
						
						/*
						var availableArea = null;
						if(details.SuiteSize != null)
						{
							availableArea = parseInt(details.SuiteSize);
						}
						else
						{
							availableArea = parseInt(details.TotalSuiteSize);
						}
						// 9. Add sqft label
						viewer.entities.add({
							id: 'imageLabel',
							position: imagePosition,
							label: {
								text: numberWithCommaWithoutDecimal(availableArea, "", " " + cityAreaMeasurementUnit),
								font: "30px Helvetica",
								horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
								disableDepthTestDistance: Number.POSITIVE_INFINITY,
								fillColor: Cesium.Color.BLACK,
								outlineColor: Cesium.Color.WHITE,
								outlineWidth: 5,
								style: Cesium.LabelStyle.FILL_AND_OUTLINE
							}
						});
						*/
						// 9. Add sqft label
						viewer.entities.add({
							id: 'areaLabel',
							position: areaPosition,
							label: {
								text: numberWithCommaWithoutDecimal(details.PricePerSQM, "$", " /yr"),
								font: "30px Helvetica",
								horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
								disableDepthTestDistance: Number.POSITIVE_INFINITY,
								fillColor: Cesium.Color.BLACK, //Cesium.Color.fromCssColorString("#33cc33"),
								outlineColor: Cesium.Color.WHITE,
								outlineWidth: 5,
								style: Cesium.LabelStyle.FILL_AND_OUTLINE
							}
						});
					}
				}
				else if(check[0] == "bldg")
				{
					window.buildingPointSelected = lonlatObj;
					clearSearchAndSettingBox();
					window.currentPoint = findBuilding(TempPointsData, check[1]);
					ShowInfobox(check[1], check[2]);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 179];
						attributes.show = [1];
					}
					/*
					$("#clickStartRatingContainerId").remove();
					if (Cesium.defined(pickedObject) && pickedObject.id && TempBldgData[check[1]].buildingclass == "HOTEL") {
						var pickedEntity = pickedObject.id;

						// Get the click position
						var screenPosition = click.position;

						// Create a small div
						var div = document.createElement('div');
						div.setAttribute("id", "clickStartRatingContainerId");
						div.className = " clickStartRatingContainer ";
						
						// Random HTML content for the div
						div.innerHTML = getHotelStarPattern(parseInt(TempBldgData[check[1]].star_rating));

						// Position the div at the clicked location
						div.style.left = screenPosition.x + 'px';
						div.style.top = screenPosition.y + 'px';

						// Append the div to the body or a container
						document.body.appendChild(div);

						// Optionally remove the div after a delay
						setTimeout(function() {
							document.body.removeChild(div);
						}, 10000);  // Removes the div after 5 seconds
					}
					*/
					if(TempBldgData[check[1]].basefloorheight == null)
						TempBldgData[check[1]].basefloorheight = 0;
					CreateDashedLine(check[1], TempBldgData[check[1]].coords, ( cityAltitudeAdjustment[lastCityLoaded] + parseFloat(TempBldgData[check[1]].basefloorheight) ), null);
					
					viewer.entities.removeById("starRatingBox");
					/*
					if(!isNaN(TempBldgData[check[1]].star_rating) && TempBldgData[check[1]].star_rating != null)
					{
						heightString = (parseInt(TempBldgData[check[1]].floors) * 3) + 20 + cameraAltitudeAdjustment;
						if(parseInt(TempBldgData[check[1]].calculatedMaxHeight) > 0)
						{
							heightString = parseInt(TempBldgData[check[1]].calculatedMaxHeight) + cameraAltitudeAdjustment;
						}
						window.cameraValues[6] = longitudeString;
						window.cameraValues[7] = latitudeString;
						var isCompressed = "";
						//console.log("./images/"+parseInt(TempBldgData[check[1]].star_rating)+"star"+isCompressed+".png"); // default: undefined
						viewer.entities.add({
							id: "starRatingBox",
							position: Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString, heightString),
							billboard: {
							  image: "./images/"+parseInt(TempBldgData[check[1]].star_rating)+"star"+isCompressed+".png", // default: undefined
							  show: true, // default
							  //pixelOffset: new Cesium.Cartesian2(0, -50), // default: (0, 0)
							  //eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
							  horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
							  verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
							  scale: 2.0, // default: 1.0
							  scaleByDistance : new Cesium.NearFarScalar(100, 1.5, 8.0e6, 0.0),
							  disableDepthTestDistance: Number.POSITIVE_INFINITY,
							  //color: Cesium.Color.LIME, // default: WHITE
							  //rotation: Cesium.Math.PI_OVER_FOUR, // default: 0.0
							  alignedAxis: Cesium.Cartesian3.ZERO, // default
							  width: 80, // default: undefined
							  height: 70, // default: undefined
							},
						});
					}
					*/
				}
				else if(check[0] == "calgaryOfficeMarket")
				{
					clearSearchAndSettingBox();
					ShowInfoboxOfficeMarketSales(check[2]);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 179];
						attributes.show = [1];
					}
				}
				/*
				else if(typeof check[0] != "undefined" && check[0] == "fl")
				{
					$(".tempSaveBuildingNotification").html("Clicked Floor "+check[2]);
				}
				*/
				else if(typeof check[0] != "undefined" && check[0] == "floorRow")
				{
					EnableBottomPanoButton();
					window.panoSpinHeight = parseInt(heightString);
					clearSearchAndSettingBox();
					stopRotateIfInProgress();
					if(lastSelectedPrimitive != null)
					{
						var attributes = lastSelectedPrimitive.getGeometryInstanceAttributes(lastSelectedPrimitiveId);
						////console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 127];
							attributes.show = [1];
						}
					}
					$.each(floorLabels, function (jk, tk){
						viewer.entities.getById(tk).show = false;
					});
					viewer.entities.getById("floorLabel-"+devSelectedBuilding+"-"+check[1]).show = true;
					//selectedPrimitive = null;
					//selectedPrimitiveId = null;
					$(".floorNumberRowTR").show();
					$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+check[1]+")</span></b>");
					window.lastFloor = parseInt(check[1]);
					
					selectedPrimitive = pickedObject.primitive;
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
					
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [255, 255, 255, 255];
						attributes.show = [1];
					}
					$(".infoboxContainer").css("display", "block");
				}
				else if(typeof check[0] != "undefined" && check[0] == "floorPlanEntity" )
				{
					clearSearchAndSettingBox();
					stopRotateIfInProgress();
					if(lastSelectedPrimitive != null)
					{
						var attributes = lastSelectedPrimitive.getGeometryInstanceAttributes(lastSelectedPrimitiveId);
						////console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 179];
							attributes.show = [1];
						}
					}
					EnableBottomPanoButton();
					
					var details = window.floorPlanDetails[check[1]][check[2]];
					window.lastFloor = check[2];
					window.lastFloorAltitude = parseInt(heightString);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					
					$("#infoboxFloorPlanRow").show();
					window.lastSuite = 0;
					devSelectedBuilding = parseInt(check[1]);
					prepareFloorPlanInInfobox(check[1], check[2], details);
					
					var coordsTemp = window.availableOfficeSpaceFloorWise[check[1]][check[2]][0].coords;
					addPolygonOutlineOnTileset(coordsTemp, window.suiteHeightValues[check[3]][0] - 0.5, window.suiteHeightValues[check[3]][1], Cesium.Color.WHITE);
					
					$(".floorNumberRowTR").show();
					$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+check[2]+")</span></b>");
					
					selectedPrimitive = pickedObject.primitive;
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
					
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 255];
						attributes.show = [1];
					}
					if(lastSelectedBuildingType != 'Floorplan')
					{
						$(".infoboxContainer").css("display", "block");
					}
					updateURL();
				}
				else if(typeof check[0] != "undefined" && check[0] == "availableOfficeSpace")
				{
					clearSearchAndSettingBox();
					window.buildingPointSelected = lonlatObj;
					//stopRotateIfInProgress();
					if(lastSelectedPrimitive != null)
					{
						var attributes = lastSelectedPrimitive.getGeometryInstanceAttributes(lastSelectedPrimitiveId);
						////console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 179];
							attributes.show = [1];
						}
					}
					EnableBottomPanoButton();
					//debugger;
					var details = window.availableOfficeSpace[check[2]];
					
					parseFloat(details.extruded_height);
					cityAltitudeHeight = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
					if(typeof window.outlinePrimitives == "undefined")
						window.outlinePrimitives = [];
					clearPolygonOutline();
					var coooordss = details.coords;
					if(typeof details.updatedCoords != "undefined")
						coooordss = details.updatedCoords;
					addPolygonOutlineOnTileset(coooordss, window.suiteHeightValues[details.idtsuite][0], window.suiteHeightValues[details.idtsuite][1], Cesium.Color.WHITE);
					allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
					window.lastFloor = check[2];
					window.lastFloor = parseInt(details.floor_number);
					window.lastFloorAltitude = parseInt(heightString);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					
					$("#infoboxFloorPlanRow").show();
					window.lastSuite = check[2];
					window.lastSuiteId = check[3];
					devSelectedBuilding = parseInt(check[1]);
					prepareAvailableOfficeSpaceInfobox(check[1], check[2], details, allSuitesOnFloor);
					
					$(".floorNumberRowTR").show();
					$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+check[2]+")</span></b>");
					
					const height = parseFloat(heightString);
					const cameraPosition = viewer.scene.camera.positionWC;

					// 1. Direction from feature to camera
					const direction = Cesium.Cartesian3.subtract(cameraPosition, feature2, new Cesium.Cartesian3());
					Cesium.Cartesian3.normalize(direction, direction);

					// 2. Offset toward camera
					const towardCamera = Cesium.Cartesian3.multiplyByScalar(direction, 20, new Cesium.Cartesian3());
					const basePosition = Cesium.Cartesian3.add(feature2, towardCamera, new Cesium.Cartesian3());
					
					const towardCamera2 = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
					const basePosition2 = Cesium.Cartesian3.add(feature2, towardCamera2, new Cesium.Cartesian3());

					// 3. Left vector (direction × up)
					const up = new Cesium.Cartesian3(0, 0, 1);
					const left = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
					Cesium.Cartesian3.normalize(left, left);

					// 4. Positions for image & sqft
					const leftOffset = Cesium.Cartesian3.multiplyByScalar(left, 40, new Cesium.Cartesian3());   // image more left
					const rightOffset = Cesium.Cartesian3.multiplyByScalar(left, -5, new Cesium.Cartesian3()); // sqft more right

					const imagePosition = Cesium.Cartesian3.add(basePosition, leftOffset, new Cesium.Cartesian3());
					const areaPosition = Cesium.Cartesian3.add(basePosition2, rightOffset, new Cesium.Cartesian3());

					// Billboard dimensions in meters (match scale * original image size)
					// Since sizeInMeters=true, this is world space, not pixels
					const billboardHalfWidth = 5;  // adjust until it matches your actual logo width
					// verticalOrigin=BOTTOM means the anchor point is already at bottom center,
					// so we don't need to offset down for the connector.

					// 5. Connector start for logo (bottom-right = anchor + half width to the right)
					const rightOffsetLogo = Cesium.Cartesian3.multiplyByScalar(left, -billboardHalfWidth, new Cesium.Cartesian3());
					const logoConnectorStart = Cesium.Cartesian3.add(imagePosition, rightOffsetLogo, new Cesium.Cartesian3());

					// 6. Connector start for sqft label (bottom-left)
					const leftOffsetSqft = Cesium.Cartesian3.multiplyByScalar(left, billboardHalfWidth, new Cesium.Cartesian3());
					const sqftConnectorStart = Cesium.Cartesian3.add(areaPosition, leftOffsetSqft, new Cesium.Cartesian3());

					// 7. Remove old entities
					viewer.entities.removeById('imageLabel');
					viewer.entities.removeById('areaLabel');
					viewer.entities.removeById('logoConnectorLine');
					viewer.entities.removeById('sqftConnectorLine');

					// 8. Add image billboard
					showLogo = false;
					if( isMobile.any() == null && window.desktop_logo_display == 1 )
						showLogo = true;
					if( isMobile.any() != null && window.mobile_logo_display == 1 )
						showLogo = true;
						
					if( showLogo == true )
					{
						window.imageEntity = viewer.entities.add({
							id: 'imageLabel',
							position: imagePosition,
							billboard: {
								image: adminBaseUrl + details.companyimage,
								scale: 0.05,
								sizeInMeters: true,
								verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
								disableDepthTestDistance: Number.POSITIVE_INFINITY,
								scaleByDistance: undefined
							}
						});
						
						// 10. Add connector lines
						viewer.entities.add({
							id: 'logoConnectorLine',
							polyline: {
								positions: [logoConnectorStart, feature2],
								width: 1,
								material: Cesium.Color.WHITE,
								disableDepthTestDistance: Number.POSITIVE_INFINITY // Always on top
							}
						});
					}
					
					/*
					labelListenerCallback = viewer.scene.preUpdate.addEventListener(
						function (scene, time) {
						  ent.label.outlineWidth += outlineDelta;
						  if (ent.label.outlineWidth >= 4.0 || ent.label.outlineWidth <= 0.0) {
							outlineDelta *= -1.0;
						  }

						  fontSize += fontDelta;
						  if (fontSize >= maxFontSize || fontSize <= minFontSize) {
							fontDelta *= -1.0;
						  }
						  ent.label.font = `${fontSize}px Calibri`;
						},
					  );
					*/

					// 9. Add sqft label
					viewer.entities.add({
						id: 'areaLabel',
						position: areaPosition,
						label: {
							text: numberWithCommaWithoutDecimal(getAreaInCityUnits(details.suite_area), "", " " + cityAreaMeasurementUnit),
							font: "30px Helvetica",
							horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
							disableDepthTestDistance: Number.POSITIVE_INFINITY,
							fillColor: Cesium.Color.BLACK,
							outlineColor: Cesium.Color.WHITE,
							outlineWidth: 5,
							style: Cesium.LabelStyle.FILL_AND_OUTLINE
						}
					});

					

					/*
					viewer.entities.add({
						id: 'sqftConnectorLine',
						polyline: {
							positions: [sqftConnectorStart, feature2],
							width: 2,
							material: Cesium.Color.YELLOW
						}
					});
					*/
					/*
					// Billboard entity with image
					viewer.entities.add({
						id: 'imageLabel',
						position: offsetPosition,
						billboard: {
							image: adminBaseUrl+details.companyimage, // your image URL
							scale: 1,
							verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
							disableDepthTestDistance: Number.POSITIVE_INFINITY, // always on top
							scaleByDistance: new Cesium.NearFarScalar(1.5e2, 0.1, 8.0e6, 0.1)
							/*
							pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.0, 1.0e7, 1.0), // keep consistent size
							* /
						}
					});
					*/
					
					/*
					// Polyline connecting clicked point to label
					viewer.entities.add({
						id: 'connectorLine',
						polyline: {
							positions: [feature2, imagePosition],
							width: 2,
							material: Cesium.Color.WHITE
						}
					});
					*/
					
					selectedPrimitive = pickedObject.primitive;
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
					
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 255];
						attributes.show = [1];
					}
					updateURL();
				}
				else if(typeof check[0] != "undefined" && check[0] == "devFloors")
				{
					/*
					window.lastFloor = check[3];
					window.lastFloorAltitude = parseInt(heightString);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					
					$("#infoboxFloorPlanRow").show();
					window.lastSuite = 0;
					*/
					devSelectedBuilding = parseInt(check[1]);
					showDevelopmentInfobox(check[1], check[2]);
					changeColorForDevelopmentBuilding(check[1], check[2]);
					
					selectedPrimitive = pickedObject.primitive;
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
					
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 255];
						attributes.show = [1];
					}
					updateURL();
				}
				else
				{
					
				}
				return;
			}
			else if ( typeof pickedObject !== "undefined" && typeof pickedObject.id !== "undefined" && typeof pickedObject.id._id != "undefined" )
			{
				if(pickedObject.id._id == "starRatingBox")
				{
					viewer.entities.removeById("starRatingBox");
					starWidgetRemoved = true;
				}
				else
				{
					var temp = pickedObject.id._id.split("-");
					if(typeof temp[2] != "undefined" && temp[0] == "devFloors")
					{
						//RESETTING Previous
						if(lastFloorSelected != null && typeof lastFloorSelected != "undefined")
						{
							if(typeof viewer.entities.getById(lastFloorSelected) != "undefined")
							{
								var clr = selectedPrimitiveColor;//viewer.entities.getById(lastFloorSelected).polygon.material.color;
								if(typeof clr != "undefined")
								{
									viewer.entities.getById(lastFloorSelected).polygon.material.color = selectedPrimitiveColor;//viewer.entities.getById(lastFloorSelected).polygon.material.color.withAlpha(selectedPrimitiveColorAlpha);
								}
							}
						}
						clearSearchAndSettingBox();
						selectedPrimitive = pickedObject.primitive;
						selectedPrimitiveId = pickedObject.id;
						lastFloorSelected = selectedPrimitiveId._id;
						
						showDevelopmentInfobox(temp[1], temp[2]);
						
						var clr = viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color;
						selectedPrimitiveColor = clr;
						selectedPrimitiveColorAlpha = clr._value.alpha;
						tempColor = clr;
						tempColor._value.alpha = 0.8;
						
						viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = tempColor;
						
						/*
						var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
						//console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							selectedPrimitiveColor = attributes.color;
							attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
							attributes.show = [1];
						}
						*/
					}
					else if(typeof temp[2] != "undefined" && temp[0] == "partialUnit")
					{
						debugger;
					}
					else if(temp[0] == "dev3FFloors")
					{
						scratch = new Cesium.Cartesian2();
						currentFloorHeight = pickedObject.id.properties._floorHeight._value;
						  currentfloorCoordLL = pickedObject.id.properties._coord._value;
						  currentfloorCoordLL = currentfloorCoordLL.trimEnd();

						  if (currentfloorCoordLL.endsWith(",")) {
							currentfloorCoordLL = currentfloorCoordLL.slice(0, -1);
						  }
						  var perFloorHeight =
							pickedObject.id.properties._baseFloorHeight._value;
						  showDevelopmentInfobox(temp[1], temp[2]);
						  var clr = viewer.entities
							.getById(pickedObject.id._id)
							.polygon.material.color.getValue();
						  var obj = viewer.entities.getById(pickedObject.id._id);
						  currentFloorPositions = obj.polygon.hierarchy.getValue(
							Cesium.JulianDate.now()
						  ).positions;
						  var llObj = CartesianToLatlon(currentFloorPositions[0]);
						  currentFloorCenter = computeCentroidCartesian(currentFloorPositions);
						  currentFloorCoord = llObj;
						  RemoveEntityById("FEntity");
						  RemoveEntityById("solidFloor");
						  var solidEnity = viewer.entities.add({
							id: "solidFloor",
							name: "solidFloor",
							polygon: {
							  hierarchy: Cesium.Cartesian3.fromDegreesArray(
								eval("[" + currentfloorCoordLL + "]")
							  ),
							  extrudedHeight: currentFloorHeight + perFloorHeight,
							  height: currentFloorHeight,
							  material: Cesium.Color.WHITE,
							},
						  });
						  /*  var clickedFloor = viewer.entities.add({
							name: "FEntity",
							position: new Cesium.Cartesian3.fromDegrees(
							  parseFloat(llObj.lon),
							  parseFloat(llObj.lat),
							  parseFloat(lonlatObj.height)
							),
							label: {
							  text: "Floor: " + temp[3],
							  backgroundColor: Cesium.Color.WHITE,
							  fillColor: Cesium.Color.BLACK,
							  showBackground: true,
							  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
							  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
							  disableDepthTestDistance: Number.POSITIVE_INFINITY,
							  pixelOffset: new Cesium.Cartesian2(2, 0),
							},
						  }); */
						  if (
							currentBldgObject.bldgId != null &&
							currentBldgObject.bldgId != temp[1]
						  ) {
							TSEntity = undefined;
							if (unsubscribeLoadSlowModelRotation != null) {
							  unsubscribeLoadSlowModelRotation();
							  unsubscribeLoadSlowModelRotation = null;
							  IsPause = false;
							}
						  }
						  if (currentBldgObject.flrNum != null && currentBldgObject.flrNum != temp[3]) {
							IsBuildingFlrChange = true;
							TSEntity = undefined;
							if (unsubscribeLoadSlowModelRotation != null) {
							  unsubscribeLoadSlowModelRotation();
							  unsubscribeLoadSlowModelRotation = null;
							  IsPause = false;
							}
						  }
						  currentBldgObject.bldgId = temp[1];
						  currentBldgObject.flrNum = temp[3];
						  htmlPolygonCOverlay = document.getElementById("PolygonCOverlay");
						  viewer.scene.preRender.addEventListener(function () {
							const polygonCPosition = viewer.scene.cartesianToCanvasCoordinates(
							  window.earthPosition,
							  scratch
							);
							if (Cesium.defined(polygonCPosition)) {
							  htmlPolygonCOverlay.style.top = `${polygonCPosition.y - 10}px`;
							  htmlPolygonCOverlay.style.left = `${polygonCPosition.x + 20}px`;
							  $("#floorNum").text("Floor: " + temp[3]);
							  $("#PolygonCOverlay").show();
							}
						  });
						//htmlPolygonCOverlay = document.getElementById("PolygonCOverlay");
						//htmlPolygonCOverlay.style.top = `${polygonCPosition.y - 10}px`;
						//htmlPolygonCOverlay.style.left = `${polygonCPosition.x + 20}px`;
						
						$("#floorNum").text( temp[3] );
						$("#PolygonCOverlay").show();
					}
					else if(typeof temp[2] != "undefined" && temp[0] == "floor")
					{
						//RESETTING Previous
						//Not changing transparency
						/*
						if(lastFloorSelected != null && typeof lastFloorSelected != "undefined")
						{
							if(typeof viewer.entities.getById(lastFloorSelected) != "undefined")
							{
								var clr = viewer.entities.getById(lastFloorSelected).polygon.material.color;
								if(typeof clr != "undefined")
								{
									if(clr._value.red == 1 && clr._value.green == 1)
									{
										viewer.entities.getById(lastFloorSelected).polygon.material.color = Cesium.Color.YELLOW.withAlpha(0.15);
									}
									else
									{
										viewer.entities.getById(lastFloorSelected).polygon.material.color = Cesium.Color.RED.withAlpha(0.15);
									}
								}
							}
						}
						*/
						$("#infoboxFloorPlanRow").html("");
						$("#infoboxFloorPlanRow").hide();
						clearSearchAndSettingBox();
						selectedPrimitive = pickedObject.primitive;
						selectedPrimitiveId = pickedObject.id;
						lastFloorSelected = selectedPrimitiveId._id;
						$(".floorNumberRowTR").show();
						$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+temp[2]+")</span></b>");
						
						if(typeof buildingFiles[temp[1]] != "undefined" && typeof buildingFiles[temp[1]][temp[2]] != "undefined")
						{
							prepareInfoboxForFiles(temp[1], temp[2]);
						}
						if(typeof window.lastSelectedPolygonEntityId != "undefined")
						{
							viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outline = false;
						}
						if(typeof buildingAssetHeightvalues[temp[1]][temp[3]] != "undefined")
						{
							/*
							if(temp[1] == 44)
							{
								addPolygonGeometryOnTileV2(buildingAssetHeightvalues[temp[1]][temp[3]][2], parseFloat(buildingAssetHeightvalues[temp[1]][temp[3]][0]), parseFloat(buildingAssetHeightvalues[temp[1]][temp[3]][1]), Cesium.Color.RED);
							}
							else
							{
							}
							*/
							window.lastSelectedPolygonEntityId = "floor-"+temp[1]+"-"+temp[2]+"-"+temp[3];
							viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outline = true;
							viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outlineColor = Cesium.Color.RED;
							viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outlineWidth = 10;
						}
						else
						{
							
							viewer.entities.removeById("bottomRing");
							viewer.entities.removeById("topRing");
						}
						////console.log(viewer.entities(pickedObject.id._id));
						////console.log(viewer.entities(pickedObject.id._id).material);
						//Not changing transparency
						/*
						var clr = viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color;
						
						if(clr._value.red == 1 && clr._value.green == 1)
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.YELLOW;
						}
						else
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.RED;
						}
						*/
						
						$.each(floorLabels, function (jk, tk){
							viewer.entities.getById(tk).show = false;
						});
						viewer.entities.getById("floorLabelAsset-"+devSelectedBuilding+"-"+temp[2]).show = true;
						$(".infoboxContainer").css("display", "block");
						/*
						var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
						//console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							selectedPrimitiveColor = attributes.color;
							attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
							attributes.show = [1];
						}
						*/
					}
					else if(typeof temp[0] != "undefined" && temp[0] == "development")
					{
						showDevelopmentInfobox(temp[1], temp[2]);
					}
				}
			}
			if(!starWidgetRemoved)
			{
				if (( typeof pickedObject !== "undefined" && typeof pickedObject.id == "undefined") || typeof pickedObject == "undefined")
				{
					if(!effectsArray.includes(1))
						closeInfobox();
					//Clear Search an setting box
					if(typeof FloorViewPauseSlowRotation != "undefined")
					{
						FloorViewPauseSlowRotation();
					}
					clearSearchAndSettingBox();
					viewer.entities.removeById("bottomRing");
					viewer.entities.removeById("topRing");
					if(typeof window.lastSelectedPolygonEntityId != "undefined")
					{
						viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outline = false;
					}
					$.each(floorLabels, function (index, eachLabel){
						viewer.entities.getById(eachLabel).show = false;
					});
					
					RemoveEntityById("solidFloor");
					if (typeof htmlPolygonCOverlay != "undefined" && htmlPolygonCOverlay != null) {
						htmlPolygonCOverlay.remove();
						RerenderHtmlOverlay();
					}
					//$(".full-screen-arrow").hide();
				}
				if(typeof pickedObject !== "undefined" && typeof pickedObject.id !== "undefined" && pickedObject.id._id != "starRatingBox" && (pickedObject.id._id == "FogEffectEntity" || pickedObject.id._id == "FogEffectEntityPreload"))
				{
					if(!effectsArray.includes(1))
						closeInfobox();
					//Clear Search an setting box
					clearSearchAndSettingBox();
					if(typeof FloorViewPauseSlowRotation != "undefined")
					{
						FloorViewPauseSlowRotation();
					}
					viewer.entities.removeById("bottomRing");
					viewer.entities.removeById("topRing");
					if(typeof window.lastSelectedPolygonEntityId != "undefined")
					{
						viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outline = false;
					}
					$.each(floorLabels, function (index, eachLabel){
						viewer.entities.getById(eachLabel).show = false;
					});
					
					RemoveEntityById("solidFloor");
					if (typeof htmlPolygonCOverlay != "undefined" && htmlPolygonCOverlay != null) {
						htmlPolygonCOverlay.remove();
						RerenderHtmlOverlay();
					}
					//$(".full-screen-arrow").hide();
				}
			}
			
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		/*
		handler.setInputAction(function(click) {
			var picked = viewer.scene.pick(click.position);

			if (Cesium.defined(picked) && picked.id && picked.id.startsWith("availableOfficeSpace")) {
				// remove old outline if exists
				debugger;
				if(typeof outlineEntities == "undefined")
					outlineEntities = [];
				outlineEntities.forEach(e => viewer.entities.remove(e));
				outlineEntities = [];
				var coords = "-114.07562183657586, 51.04580407841052, -114.07609348958557, 51.045818216328556, -114.0761044439821, 51.04577585680993, -114.07618698660555, 51.04577887094398, -114.07620928073726, 51.04548694656218, -114.0755738103606, 51.04544667354162, -114.07555827522691, 51.04561811672123, -114.07554937748611, 51.04576012787483, -114.0756251616938, 51.04575975552153";
				
				// Polygon footprint positions (degrees → cartesian)
				var footprint = Cesium.Cartesian3.fromDegreesArray(eval("[" + coords + "]"));

				var baseHeight = 1101;
				var topHeight  = 1105;
				
				var footprintBase = footprint.map(p => {
					var carto = Cesium.Cartographic.fromCartesian(p);
					return Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, baseHeight);
				});

				var footprintTop = footprint.map(p => {
					var carto = Cesium.Cartographic.fromCartesian(p);
					return Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, topHeight);
				});

				// Close loop
				footprintBase.push(footprintBase[0]);
				footprintTop.push(footprintTop[0]);


				// Base outline
				outlineEntities.push(viewer.entities.add({
					polyline: {
						positions: footprintBase,
						width: 3,
						material: Cesium.Color.WHITE
					}
				}));

				// Top outline
				outlineEntities.push(viewer.entities.add({
					polyline: {
						positions: footprintTop,
						width: 3,
						material: Cesium.Color.WHITE
					}
				}));
				
				// Vertical edges (optional, for box effect)
				for (let i = 0; i < footprintBase.length - 1; i++) {
					outlineEntities.push(viewer.entities.add({
						polyline: {
							positions: [footprintBase[i], footprintTop[i]],
							width: 2,
							material: Cesium.Color.WHITE
						}
					}));
				}
			}
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		*/
		// ✅ Convenience wrapper: from coords string
		//createVerticalLine(-114.07578465430271, 51.04548371909755, 1101, 1105, Cesium.Color.WHITE);
		var outlinePrimitives = []; // store active lines
		
		//NOT IN USE, But keeping it for record
		function createVerticalLine(lon, lat, baseHeight, topHeight, color, width = 3) {
			//console.log("IN createVerticalLine()");
			//console.log(lon+" <> "+lat+" <> "+baseHeight+" <> "+topHeight);
			removeOutline(); // clear any existing
			const offset = 0.0000005;

			var base = Cesium.Cartesian3.fromDegrees(lon, lat, baseHeight);
			var top  = Cesium.Cartesian3.fromDegrees(lon, lat, topHeight);

			var primitive = new Cesium.Primitive({
				geometryInstances: new Cesium.GeometryInstance({
					geometry: new Cesium.PolylineGeometry({
						positions: [base, top],
						width: width
					}),
					attributes: {
						color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
					}
				}),
				appearance: new Cesium.PolylineColorAppearance()
			});

			viewer.scene.primitives.add(primitive);
			outlinePrimitives.push(primitive);
			return primitive;
		}

		// ✅ Remove any lines
		function removeOutline() {
			if(typeof outlinePrimitives != "undefined")
				outlinePrimitives.forEach(p => viewer.scene.primitives.remove(p));
			outlinePrimitives = [];
		}
		
		//New Function
		verticalLines = [];
		function addVerticalLine(lon, lat, baseHeight, topHeight, color) {
			const offset = 0.000005; // very thin rectangle (adjust for visibility)
			
			const positions = Cesium.Cartesian3.fromDegreesArrayHeights([
				lon, lat, baseHeight,
				lon + offset, lat, baseHeight,
				lon + offset, lat, topHeight,
				lon, lat, topHeight
			]);

			const linePrimitive = new Cesium.ClassificationPrimitive({
				geometryInstances: new Cesium.GeometryInstance({
					geometry: new Cesium.PolygonGeometry({
						polygonHierarchy: new Cesium.PolygonHierarchy(positions),
						perPositionHeight: true
					}),
					attributes: {
						color: Cesium.ColorGeometryInstanceAttribute.fromColor(color || Cesium.Color.RED.withAlpha(1))
					}
				}),
				classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
			});

			viewer.scene.primitives.add(linePrimitive);

			// Store reference for later cleanup
			verticalLines.push(linePrimitive);

			return linePrimitive;
		}

		/**
		 * Removes all vertical lines previously added.
		 */
		function clearVerticalLines() {
			for (let i = 0; i < verticalLines.length; i++) {
				viewer.scene.primitives.remove(verticalLines[i]);
			}
			verticalLines = []; // reset list
		}
		function addPolygonGeometryOnTileV2(coords, baseHeight, topHeight, color) {
			//console.log("IN addPolygonGeometryOnTileV2() @" + baseHeight + " <> " + topHeight);

			try {
				// Convert coordinates to Cesium Cartesian3 positions
				var coordsToUse = Cesium.Cartesian3.fromDegreesArray(eval("[" + coords + "]"));

				// Create polygon entity
				viewer.entities.removeById("bottomRing");
				viewer.entities.removeById("topRing");
				
				var polygonEntity1 = viewer.entities.add({
					id: "bottomRing",
					polygon: {
						hierarchy: coordsToUse,
						height: baseHeight + 0.3,
						extrudedHeight: baseHeight + 0.01,
						material: color.withAlpha(1),
						outline : false, 
						outlineColor : Cesium.Color.RED,
						outlineWidth : 3,
						
					}
				});
				polygonEntity1.polygon.disableDepthTestDistance = Number.POSITIVE_INFINITY;
				
				// Create polygon entity
				var polygonEntity2 = viewer.entities.add({
					id: "topRing",
					polygon: {
						hierarchy: coordsToUse,
						height: topHeight-0.01,
						extrudedHeight: topHeight - 0.3,
						material: color.withAlpha(1),
						outline : false, 
						outlineColor : Cesium.Color.RED,
						outlineWidth : 3,
					}
				});
				polygonEntity2.polygon.disableDepthTestDistance = Number.POSITIVE_INFINITY;

				// Store for later reference/removal
				//outlinePrimitives.push(polygonEntity);

				//return polygonEntity;
			} catch (e) {
				console.error("Error in addPolygonGeometryOnTileV2:", e);
			}
		}

		function addPolygonOutlineOnTileset(coords, baseHeight, topHeight, color) {
			var footprint = Cesium.Cartesian3.fromDegreesArray(eval("[" + coords + "]"));
			console.log("IN addPolygonOutlineOnTileset() @"+baseHeight+" <> "+topHeight);
			// Function to build a polygon band
			function makeBand(positions, height) {
				return new Cesium.ClassificationPrimitive({
					geometryInstances: new Cesium.GeometryInstance({
						geometry: new Cesium.PolygonGeometry({
							polygonHierarchy: new Cesium.PolygonHierarchy(positions),
							height: height,
							extrudedHeight: height + 0.5  // thin band (0.2m thick)
						}),
						attributes: {
							color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
						}
					}),
					classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
				});
			}

			// Base band
			var primitive = makeBand(footprint, baseHeight);
			viewer.scene.groundPrimitives.add(primitive);
			outlinePrimitives.push(primitive);

			// Top band
			primitive = makeBand(footprint, topHeight);
			viewer.scene.groundPrimitives.add(primitive);
			outlinePrimitives.push(primitive);
		}
		
		// Clear function
		function clearPolygonOutline() {
			if(typeof outlinePrimitives != "undefined" && outlinePrimitives.length > 0)
			{
				outlinePrimitives.forEach(p => {
					viewer.scene.groundPrimitives.remove(p);
				});
			}
			outlinePrimitives = [];
		}

		/*
		handler.setInputAction(function(click) {
			var picked = viewer.scene.pick(click.position);

			if (Cesium.defined(picked) && picked.id && picked.id.startsWith("availableOfficeSpace")) {
				// remove old outline if exists
				debugger;
				if(typeof outlineEntities == "undefined")
					outlineEntities = [];
				outlineEntities.forEach(e => viewer.entities.remove(e));
				outlineEntities = [];
				var coords = "-114.07562183657586, 51.04580407841052, -114.07609348958557, 51.045818216328556, -114.0761044439821, 51.04577585680993, -114.07618698660555, 51.04577887094398, -114.07620928073726, 51.04548694656218, -114.0755738103606, 51.04544667354162, -114.07555827522691, 51.04561811672123, -114.07554937748611, 51.04576012787483, -114.0756251616938, 51.04575975552153";
				var baseHeight = 1101;
				var topHeight  = 1105;

				addPolygonOutlineOnTileset(coords, baseHeight, topHeight, Cesium.Color.WHITE);
			}
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		*/
		
		window.billboardListenerCallback = null;
		function initiateCompanyLogoEffect()
		{
			// Animation control vars (same idea as font size)
			let billboardScaleDelta = 0.002;
			let billboardScale = 0.05;
			const minScale = 0.02;
			const maxScale = 0.08;
			if(window.billboardListenerCallback)
			{
				stopCompanyLogoEffect();
				return;
			}

			// Attach to same listener
			window.billboardListenerCallback = viewer.scene.preUpdate.addEventListener(
			  function (scene, time) {
				// Billboard scale animation
				billboardScale += billboardScaleDelta;
				if (billboardScale >= maxScale || billboardScale <= minScale) {
				  billboardScaleDelta *= -1.0;
				}
				imageEntity.billboard.scale = billboardScale;
			  }
			);
		}
		
		window.LogoSpeed = 0.05;
		function initiateCompanyLogoEffectWithSpeed()
		{
			// speed = 1.0 normal, 0.5 slower, 2.0 faster
			let scaleDelta = 0.01 * window.LogoSpeed;
			let scale = imageEntity.billboard.scale.getValue(Cesium.JulianDate.now());
			const maxScale = 0.08;
			const minScale = 0.02;

			if (billboardListenerCallback) {
				stopCompanyLogoEffect();
				return;
			}

			billboardListenerCallback = viewer.scene.preUpdate.addEventListener(function (scene, time) {
			if (!imageEntity || !imageEntity.billboard) return;

			// Animate billboard scale
			scale += scaleDelta;
			if (scale >= maxScale || scale <= minScale) {
				scaleDelta *= -1.0;
			}

			imageEntity.billboard.scale = scale;
			});
		}
		
		function stopCompanyLogoEffect() {
		  if (billboardListenerCallback) {
			billboardListenerCallback();   // removes listener
			billboardListenerCallback = null;
		  }
		}
		// Assume your viewer is called 'viewer'
		
		const handler4 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

		
		
		/*
		viewer.scene.camera.changed.addEventListener(() => {
			updateURL();
		});
		viewer.camera.moveEnd.addEventListener(() => {
			updateURL();
			//console.log("Camera movement stopped");
		});
		*/
		
		handler.setInputAction(function(click) {
			var pickedObject = viewer.scene.pick(click.position);
			//console.log("In Left Double Click!");
			//console.log(pickedObject);
			if(typeof pickedObject !== "undefined" && typeof pickedObject.id !== "undefined" && (pickedObject.id._id == "FogEffectEntity" || pickedObject.id._id == "FogEffectEntityPreload"))
			{
				//closeInfobox();
			}
			if(typeof pickedObject.id != "undefined")
			{
				var temp = pickedObject.id.split("-");
				if(typeof temp[0] != "undefined" && (temp[0] == "floorPlanEntity" || temp[0] == "availableOfficeSpace"))
				{
					flyToBuildingCamera( temp[1] );
				}
			}
			if( typeof pickedObject !== "undefined" && typeof pickedObject.id !== "undefined" && typeof pickedObject.id._id == "undefined" )
			{
				if(pickedObject.id.indexOf("floorRow") == -1)
				{
					var temp = pickedObject.id.split("-");
					//flyToBuildingCamera(temp[1]);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		
		handler.setInputAction(function(click) {
			var pickedObject = viewer.scene.pick(click.position);
			////console.log("In MIDDLE Click!");
			////console.log(pickedObject);
			if(typeof pickedObject !== "undefined")
			{
				pickedObject.primitive.show = false;
			}
		}, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
		
		
		let cameraMoveTimeout = null;

		viewer.camera.moveStart.addEventListener(() => {
			////console.log('Camera started moving');
			if (cameraMoveTimeout) {
				clearTimeout(cameraMoveTimeout);
			}
		});

		viewer.camera.changed.addEventListener(() => {
			if (cameraMoveTimeout) {
				clearTimeout(cameraMoveTimeout);
			}
			// Set a delay (in ms) after last movement to consider as "stopped"
			cameraMoveTimeout = setTimeout(() => {
				////console.log("Camera Stopped Moving... ");
				const camera = viewer.camera;
			  const positionCartographic = Cesium.Cartographic.fromCartesian(camera.position);

			  const lat = Cesium.Math.toDegrees(positionCartographic.latitude);
			  const lon = Cesium.Math.toDegrees(positionCartographic.longitude);
			  const heading = Cesium.Math.toDegrees(camera.heading);
			  const pitch = Cesium.Math.toDegrees(camera.pitch);
			  const roll = Cesium.Math.toDegrees(camera.roll);

			  // Check if anything has changed to avoid unnecessary updates
				updateURL();
				/*
			  if (
				lastCameraView.lat !== lat ||
				lastCameraView.lon !== lon ||
				lastCameraView.heading !== heading ||
				lastCameraView.pitch !== pitch
			  ) {
				lastCameraView = { lat, lon, heading, pitch, roll };
				// You can now use lastCameraView or store it
				//console.log('Camera changed:', lastCameraView);
				updateURL();
			  }
			  else
			  {
				//console.log("Camera Constant... ");
			  }
				*/
				// 👉 Trigger your logic here
			}, 250); // 250ms of no movement = camera has stopped
		});

		window.minimumHeight = 0;
		isCityLoadingInProgress = false;
		
		var lastCameraView = [];
		/*
		viewer.scene.postRender.addEventListener(() => {
			if(!isCityLoadingInProgress)
			{
			  const camera = viewer.camera;
			  const positionCartographic = Cesium.Cartographic.fromCartesian(camera.position);

			  const lat = Cesium.Math.toDegrees(positionCartographic.latitude);
			  const lon = Cesium.Math.toDegrees(positionCartographic.longitude);
			  const heading = Cesium.Math.toDegrees(camera.heading);
			  const pitch = Cesium.Math.toDegrees(camera.pitch);
			  const roll = Cesium.Math.toDegrees(camera.roll);

			  // Check if anything has changed to avoid unnecessary updates
			  if (
				lastCameraView.lat !== lat ||
				lastCameraView.lon !== lon ||
				lastCameraView.heading !== heading ||
				lastCameraView.pitch !== pitch
			  ) {
				lastCameraView = { lat, lon, heading, pitch, roll };
				// You can now use lastCameraView or store it
				//console.log('Camera changed:', lastCameraView);
				updateURL();
			  }
			  else
			  {
				//console.log("Camera Constant... ");
			  }
			}
			else
			{
				////console.log("City loading .... ");
			}
			
		});
		*/

		
		/*
		setTimeout(function() {
		  document.querySelector('.loading-overlay').style.display = 'none';
		}, 5000);
		*/
		
		window.accessedFromMobile = 0;
		if(isMobile.any() != null)
		{
			window.accessedFromMobile = 1;
		}
		$.ajax({
			method: "POST",
			url: "controllers/userController.php",
			data: { param : "saveUserAccessData", "idtuser" : loggedInUserId, "idtapp": appId, "cesiumKey": CesiumKeyId, "apiAccessed": "", "appModule": "default", "isMobile": window.accessedFromMobile, "ipAddress" : IPAddress}
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			////console.log(data);
		});
		
		function saveUserAccessDetails(apiAccessed, appModule = "")
		{
			$.ajax({
				method: "POST",
				url: "controllers/userController.php",
				data: { param : "saveUserAccessData", "idtuser" : loggedInUserId, "idtapp": appId, "cesiumKey": CesiumKeyId, "apiAccessed": apiAccessed, "appModule": appModule, "isMobile": window.accessedFromMobile, "ipAddress" : IPAddress}
			})
			.done(function( data ) {
				data = $.parseJSON( data );
				////console.log(data);
			});
		}
		
		$(document).on("click", "#fullScreenModal", function(e) {
			// check if clicked inside content
			if (!$(e.target).closest(".fullscreenmodal-content").length) {
				// action for outside click
				closeFullScreenModal();
			}
		});
		/*
		$('.city-box').on('click', function (e) {
		  e.stopPropagation(); // prevent closing when clicking inside
		  $('.market-list').not($(this).find('.market-list')).slideUp();
		  $(this).find('.market-list').slideToggle();
		});

		// Close when clicking anywhere else
		$(document).on('click', function () {
		  $('.market-list').slideUp();
		});
		
		*/
		
		
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
	<script src="./tickMenu.js"></script>
	<script src="./spinFunctions.js"></script>
	<script src="./floorplans.js"></script>
	<script src="./autosuggest.js"></script>
	<script src="./panoSpin.js"></script>
	<script src="./pointOrbitSpin.js"></script>
	<script src="./buildingOrbitSpin.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/turf.min.js"></script>
	<script>
		//EnableFogInSelectedCity(); //Removed this effect for now.
	</script>
	
  </body>
</html>
