<?php
//echo "<pre>";print_r($_COOKIE);exit;
session_start();

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
		DefaultSuiteIndex = '<?php echo $lastSuiteIndex; ?>';
		defaultEffects = '<?php echo $effects; ?>';
		defaultCamera = '<?php echo $camDetails; ?>';
		defaultFloorSelected = '<?php echo $defaultFloorSelected; ?>';
		console.log("defaultCity "+defaultCity);
		console.log("defaultMarket "+defaultMarket);
		console.log("defaultMarketId "+defaultMarketId);
		console.log("defaultBuilding "+defaultBuilding);
		console.log("defaultSuiteId "+defaultSuiteId);
		console.log("DefaultSuiteIndex "+DefaultSuiteIndex);
		console.log("defaultEffects "+defaultEffects);
		console.log("defaultCamera", defaultCamera);
		console.log("defaultFloorSelected "+defaultFloorSelected);
		if(defaultBuilding != null)
		{
			lastSelectedBuilding = defaultBuilding;
			devSelectedBuilding = defaultBuilding;
		}
		if(defaultCamera.length > 0 && defaultCamera != "Array")
		{
			defaultCamera = JSON.parse(decodeURIComponent(defaultCamera));
		}
		console.log("defaultEffects", defaultEffects);
		if(defaultEffects.length > 0 && defaultEffects != "Array")
		{
			defaultEffects = JSON.parse(decodeURIComponent(defaultEffects));
		}
		var cityBuildingCount = $.parseJSON( '<?php echo json_encode($cityBuildingCount); ?>' );
		var marketBuildingCount = $.parseJSON( '<?php echo json_encode($marketBuildingCount); ?>' );
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
    <script src="./cameraFunctions.js"></script>
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
	<?php include_once("./cityCameraDetails.php"); ?>
    <script src="./adminBaseUrl.js"></script>
	<script>
		
		//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTIwM2E3Yi1lYTkwLTRiZTYtYmMxYS02NGRkMGYzYTIzMmIiLCJpZCI6MjY1LCJpYXQiOjE1MjE1NDUzNDR9.XIij-qDaBt2xTi-NrUs_PJkII6uo2v7MsAi9dC0fb30';
		var cityBoundaries = [];
		cityBoundaries[1] = "[ -80.31700441111985, 44.152084347566685,-78.40579583919764, 44.131817797312245,-78.43333935283853, 43.1480702601011,-80.31019390765188, 43.11468603762364 ]";//Calgary
		cityBoundaries[2] = "[ -115.12718507518237, 51.6465075732174, -112.30411126888515, 51.700531187733326, -112.71617626690103, 50.21468176272549, -114.99952496233941, 50.23110295909895, ]";//Calgary
		
		cityBoundaries[3] = "[ -88.91380616893235, 42.24419984801453,-86.83780267513514, 42.24159233076186,-86.76372265361978, 41.396362471822194,-88.89051617327688, 41.40531352370432 ]";//Chicago
		
		cityBoundaries[4] = "[ -74.49425050486985, 41.087035997755265,-73.20926263607264, 41.05124939154566,-73.22856640361978, 40.416610029246634,-74.52039898577688, 40.42778549971898 ]";//New York
		cityBoundaries[5] = "[ -126.34971925486985, 40.954414001983544, -117.81375482357264, 40.81885954118537, -118.31645702861978, 35.46400122786496, -126.06825054827684, 35.69039328026246, -126.34971925486985, 40.954414001983544 ]";//San Francisco
		cityBoundaries[13] = "[ -80.88829347361985, 26.568169144707035,-79.19681146419764, 26.57484485464191,-79.16118359111978, 24.680686209327373,-82.56239117327684, 24.564195295856617,-82.56920167674485, 26.381319422902695 ]";//Miami
		
		cityBoundaries[6] = "[ -68.59130859375, 43.831208689264614,-74.28466796874997, 43.813919567555885,-74.30664062499997, 40.90689048063042,-68.54736328124999, 40.85189135537943 ]";//Boston
		cityBoundaries[8] = "[ -121.2158203125, 48.51355736620233,-124.06372070312497, 48.497680657009546,-124.06372070312497, 46.52260587562054,-121.116943359375, 46.51791053713829 ]";//Seattle
		
		cityBoundaries[10] = "[ -76.52122804393235, 46.590413045127015,-71.12735345638514 , 47.62177076840231,-70.177113766901, 44.83540041509041,-75.49268902483938, 43.800507005488484 ]";//Montreal
		cityBoundaries[12] = "[ -124.46205526314873, 49.55031594093109,-122.76980146595942, 50.126974190111405,-121.75232163096538, 49.15439387536904,-123.47855111597701, 48.41705954757115, ]";//Vancouver
		cityBoundaries[15] = "[ -115.81581502877373, 52.71314721330159,-115.65066084095942, 54.271050142256605,-110.49133530284035, 54.208709673372425,-110.65750619410201, 52.59193495466338 ]";//Edmonton
		
		cityBoundaries[19] = "[ 102.47901609669263, 2.484087224637197, 104.69784185611482, 2.439407530403443, 104.71424365497398, 0.07000793085333089, 102.4748402720356, 0.07370130441273215 ]";//Singapore
		cityBoundaries[23] = "[ 146.7649047685676, -31.969144896208284,154.79549810611485, -32.11880171729366,154.86683154559898, -35.75210920548038,146.78270160016066, -35.48117323802041 ]";//Sydney
		cityBoundaries[24] = "[ 0.7346313310675967, 49.54073806450024,4.238857481114859, 49.4831679980088,4.354136233098989, 47.719905199114926,0.8842641001606566, 47.70760626141749,0.7346313310675967, 49.54073806450024 ]";//Paris
		cityBoundaries[35] = "[ 150.9836547685676, -26.16354363070229,154.88338873111485, -26.1740999926773,154.80091357684898, -28.378136617579827,150.93553363141066, -28.37488702438196 ]";//Brisbane
		cityBoundaries[45] = "[ 142.3703735185676, -36.71970629980352,147.47860357486485, -36.77314730445665,147.39612842059898, -38.896400337427565,142.25633441266066, -38.80796618561732 ]";//Melbourne
		cityBoundaries[25] = "[ -1.8801147626823433, 52.32310621523462,1.4043848248648594, 52.3494839845426,1.5855815455989486, 50.6067552223196,-1.8183726185894034, 50.56724847089709 ]";//London
		//Frankfurt
		cityBoundaries[31] = "[ 10.675048828125012, 50.1739522590782,10.684814453124991, 50.97220075991172,7.135009765625009, 51.00269531469658,7.069091796875009, 49.36235992954021,10.609130859375012, 49.37222507839129 ]";//Frankfrut
		//Hong Kong
		cityBoundaries[34] = "[ 114.59472656250001, 22.264507285868824,114.59350585937499, 22.542906905632726,113.812255859375, 22.56228012349747,113.7957763671875, 21.990957184548428,114.60021972656251, 22.020281457536896 ]";//Hong Kong
		cityBoundaries[36] = "[ 135.4052734375, 37.65528074808703,135.55419921875, 32.95825387367005,143.3056640625, 33.089106579225856,143.4912109375, 37.56825099364926 ]";//Tokyo
		cityBoundaries[44] = "[ -59.33288574218752, -34.14165115251331,-59.42016601562495, -35.19598675886735,-57.49145507812506, -35.265934874182236,-57.41577148437504, -34.137104598902006 ]";//Buenos Aires
		cityBoundaries[53] = "[ -65.83702394236987, 45.47691158849848,-61.47586419857264, 46.176843905305155,-60.70140575908853, 43.88896412885449,-65.18202007952688, 43.226861320621374 ]";//Halifax
		cityBoundaries[68] = "[ 13.412853987317597, -30.48486554378558,23.59676763736486, -30.39081246956317,22.877085451848988, -36.77961628567581,13.496568787660657, -36.86460529326955 ]";//Cape Town
		cityBoundaries[69] = "[ 25.607678206067597, -24.345314891019896,30.56209966861486, -24.26592154640387,30.545542483098988, -28.116831433031717,25.405748475160657, -28.132952334747706 ]";//Johannesberg
		
		var cityCenterPoint = [];
		cityCenterPoint[1] = [-79.38242, 43.64761, 1133];
		cityCenterPoint[2] = [-114.07252, 51.04805, 1330];
		cityCenterPoint[10] = [-63.566019970280465, 44.65323876778313, 245];//Montreal
		cityCenterPoint[15] = [-113.49613, 53.54474, 1034];
		cityCenterPoint[12] = [-123.11583, 49.28430, 555];
		cityCenterPoint[53] = [-63.566019970280465, 44.65323876778313, 245];
		
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
		try {
			
			/*
			viewer = new Cesium.Viewer("cesiumContainer", {
			  selectionIndicator: false,
			  fullscreenButton: false,
			  navigationHelpButton: false,
			  selectionIndicator: false,
			  geocoder: false,
			  sceneModePicker: false,
			  requestRenderMode: false,
			  logarithmicDepthBuffer: false,
			  scene3DOnly: true,
			  infoBox: false,
			});
			*/
			
			const blankProvider = new Cesium.SingleTileImageryProvider({
			  url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9Qf8l1EAAAAASUVORK5CYII="
			});
			
			viewer = new Cesium.Viewer('cesiumContainer', {
				
				vrButton:false,
				infoBox:false,
				imageryProvider: blankProvider,  // Disable the default base map
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
			viewer.imageryLayers.removeAll();

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
			if(defaultCity == null || defaultCity == 0 || defaultCity == 2)
			{
				cityToFlyTo = 2;
			}
			else
			{
				cityToFlyTo = defaultCity;
			}
			console.log(" cityToFlyTo "+cityToFlyTo);
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
			console.log(error);
		  }
		  
		  var googleTileset = null;
		  var clipTileset = null;
		  async function ShowGoggleTileset() {
			  //return "";
			  googleTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207, {
				/*maximumScreenSpaceError: 1,*/
			  });
			  viewer.scene.primitives.add(googleTileset);
			  /*
			  clipTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207, {
				/*maximumScreenSpaceError: 1,* /
			  });
			  viewer.scene.primitives.add(clipTileset);
			  clipTileset.show = false;
			  */
			  setTimeout(function (){showTerrain(), 3000});
		  }
		  
		  async function showTerrain()
		  {
			viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
		  }
		  
		  var terrainCreated = false;
		  async function createTerrain()
		  {
			viewer.scene.terrainProvider = await Cesium.createWorldTerrainAsync();
			terrainCreated = true;
			console.log("Terrain Created!");
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
				console.log("Terrain Created!");
			  }
		  }
		  function removeTerrain()
		  {
			/*viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider(); 
			terrainCreated = false;
			console.log("Terrain Removed!");*/
			
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
			//console.log("Now Setting Height: "+height);
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
		handler.setInputAction(function(click) {
			
			var feature2 = viewer.scene.pickPosition(click.position);
			window.earthPosition = viewer.scene.pickPosition(click.position);
			if (typeof feature2 != "undefined") {
			  var cartographic = Cesium.Cartographic.fromCartesian(feature2);
			  //console.log(cartographic);
			  var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
			  var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
			  
			  var heightString = cartographic.height;
			  window.clickedAltitude = parseInt(heightString);
			  console.log(
				longitudeString + ", " + latitudeString + " @ " + heightString
			  );
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
					console.log(attributes.color);
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
					console.log(attributes.color);
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
					console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
						attributes.show = [1];
					}
				}
				else if(check[0] == "partialUnit")
				{
					clearSearchAndSettingBox();
					prepareResiUnitInfobox(check[1], check[2], activeUnitDetails[parseInt(check[1])][check[3]]);
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					console.log(attributes.color);
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
					console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
						attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 255];
						attributes.show = [1];
					}
				}
				else if(check[0] == "bldg")
				{
					window.buildingPointSelected = lonlatObj;
					clearSearchAndSettingBox();
					ShowInfobox(check[1], check[2]);
					window.SelectedBuildingLat = latitudeString;
					window.SelectedBuildingLon = longitudeString;
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					console.log(attributes.color);
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
						console.log("./images/"+parseInt(TempBldgData[check[1]].star_rating)+"star"+isCompressed+".png"); // default: undefined
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
					console.log(attributes.color);
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
						//console.log(attributes.color);
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
					
					selectedPrimitive = pickedObject.primitive;
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
					
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					console.log(attributes.color);
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
						//console.log(attributes.color);
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
					
					$(".floorNumberRowTR").show();
					$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+check[2]+")</span></b>");
					
					selectedPrimitive = pickedObject.primitive;
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
					
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					console.log(attributes.color);
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
						//console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 179];
							attributes.show = [1];
						}
					}
					EnableBottomPanoButton();
					
					var details = window.availableOfficeSpace[check[2]];
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
					if(isMobile.any() == null)
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
							text: numberWithCommaWithoutDecimal(details.suite_area, "", " " + cityAreaMeasurementUnit),
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
					console.log(attributes.color);
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
					console.log(attributes.color);
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
						console.log(attributes.color);
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
					else if(typeof temp[2] != "undefined" && temp[0] == "floor")
					{
						//RESETTING Previous
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
						clearSearchAndSettingBox();
						selectedPrimitive = pickedObject.primitive;
						selectedPrimitiveId = pickedObject.id;
						lastFloorSelected = selectedPrimitiveId._id;
						$(".floorNumberRowTR").show();
						$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+temp[2]+")</span></b>");
						//console.log(viewer.entities(pickedObject.id._id));
						//console.log(viewer.entities(pickedObject.id._id).material);
						var clr = viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color;
						
						if(clr._value.red == 1 && clr._value.green == 1)
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.YELLOW;
						}
						else
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.RED;
						}
						
						$.each(floorLabels, function (jk, tk){
							viewer.entities.getById(tk).show = false;
						});
						viewer.entities.getById("floorLabelAsset-"+devSelectedBuilding+"-"+temp[2]).show = true;
						$(".infoboxContainer").css("display", "block");
						/*
						var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
						console.log(attributes.color);
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
					clearSearchAndSettingBox();
					//$(".full-screen-arrow").hide();
				}
				if(typeof pickedObject !== "undefined" && typeof pickedObject.id !== "undefined" && pickedObject.id._id != "starRatingBox" && (pickedObject.id._id == "FogEffectEntity" || pickedObject.id._id == "FogEffectEntityPreload"))
				{
					if(!effectsArray.includes(1))
						closeInfobox();
					//Clear Search an setting box
					clearSearchAndSettingBox();
					//$(".full-screen-arrow").hide();
				}
			}
			
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
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
			console.log("Camera movement stopped");
		});
		*/
		
		handler.setInputAction(function(click) {
			var pickedObject = viewer.scene.pick(click.position);
			console.log("In Left Double Click!");
			console.log(pickedObject);
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
			console.log("In MIDDLE Click!");
			console.log(pickedObject);
			if(typeof pickedObject !== "undefined")
			{
				pickedObject.primitive.show = false;
			}
		}, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);
		
		
		let cameraMoveTimeout = null;

		viewer.camera.moveStart.addEventListener(() => {
			console.log('Camera started moving');
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
				console.log("Camera Stopped Moving... ");
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
				console.log('Camera changed:', lastCameraView);
				updateURL();
			  }
			  else
			  {
				console.log("Camera Constant... ");
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
				console.log('Camera changed:', lastCameraView);
				updateURL();
			  }
			  else
			  {
				console.log("Camera Constant... ");
			  }
			}
			else
			{
				//console.log("City loading .... ");
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
			//console.log(data);
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
				//console.log(data);
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
