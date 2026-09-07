
function getDarkOverlayColor()
{
	if(typeof window.darkOverlayEffectColor == "undefined")
	{
		window.darkOverlayEffectColor = 'WHITE';
	}
	return window.darkOverlayEffectColor;
}

const officeClasses = ["A", "AA", "AAA", "B", "C"];
const residentialClasses = ["APT", "MDU", "SENIOR", "Apartments", "Condominiums"];
const hotelClasses = ["HOTEL"];
const hotelClassesLower = ["hotel"];
const govClassLower = ["gov"];
const retailClass = ["Retail"];
const retailClassLower = ["retail"];

const educationalClass = ["EDU"];
const educationalClassLower = ["edu"];
const emsClassLower = ["ems"];
const parkadesClass = ["PRKS"];
const parkadesClassLower = ["prks"];

const healthcareClass = ["MED"];
const healthcareClassLower = ["med"];

let marketBuildingDetails = [];
let developmentBuildingDetails = [];
let developmentBuildingFloors = [];
let developmentBuildingSummary  = [];
let allBuildingVisualizationSummary  = [];
let summaryDetails = [];
let submarketDetails = [];
let hotelSummaryDetails = [];
let submarketSummaryDetails = [];
let companySummaryDetails = [];
let marketOrbitDetails = [];

function ToggleGoogleTileset()
{
	googleTileset.show = !googleTileset.show;
}
/* if(typeof viewer != "undefined")
{
	//loadFogPreload(2);
	if(typeof cityBoundaries[2] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[2]+") }, material: Cesium.Color."+get	OverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
} */

//setTimeout(function (){ getApp10MarketDetails(); }, 4000);
getApp10MarketDetails();

let marketDetails = [];
let marketDetailsV2 = [];
let marketCameraDetails = [];
let marketCameraRotationDetails = [];
function loadFogPreload(id)
{
	////console.log("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[id]+") }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	/*
	if(typeof cityBoundaries[id] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[id]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	*/
}

function loadFogPreloadV2(id)
{
	////console.log("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[id]+") }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	if(typeof marketBoundaries[lastMarketLoaded] != "undefined")
	{
		//eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray(["+marketBoundaries[lastMarketLoaded]+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	}
	else if(typeof cityBoundaries[id] != "undefined")
	{
		//eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[id]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	}
}
window.PageLoadDefaultGridDisplayed = false;
window.citiesToShow = [];
window.allCitiesWithCountry = [];
window.countryWithProperties = [];
window.allRemainingCitiesWithCountry = [];
window.citiesCounts = [];
window.cityMarketRelationship = [];
window.submarketWithMaxBuilding = [];
window.citiesWithMultipleMarket = [];
async function getApp10MarketDetails() {
	try {
		const resp = await fetch('controllers/buildingController.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ param: 'getApp10MarketDetails', user_id: window.loggedInUserId }),
		});
		const text = await resp.text();
		const data = JSON.parse(text);

		if (data.status === 'success' && typeof data.data !== 'undefined') {
			marketDetails = data.data;
			$.each(marketDetails, function (i2, row2) {
				marketDetailsV2[parseInt(row2.idtmarket)] = row2;
				marketFloorplanCounts[parseInt(row2.idtmarket)] = row2.floorplans;
				if (typeof window.cityMarketRelationship[parseInt(row2.idtcity)] === 'undefined') {
					window.cityMarketRelationship[parseInt(row2.idtcity)] = [];
				}
				window.cityMarketRelationship[parseInt(row2.idtcity)].push(row2);
			});

			disabledMarkets = data.disabledMarkets;
			window.citiesToShow = data.citiesAccessible;
			window.marketBoundaries = data.marketBoundaries;
			window.cityBoundaries = data.cityBoundaries;
			window.cityCameras = data.cityCameras;
			window.allCitiesWithCountry = data.allCitiesWithCountry;
			window.countryWithProperties = data.countryWithProperties;
			window.allRemainingCitiesWithCountry = data.allRemainingCitiesWithCountry;
			window.citiesCounts = data.citiesCounts;
			window.submarketWithMaxBuilding = data.submarketWithMaxBuilding;
			window.citiesWithMultipleMarket = data.citiesWithMultipleMarket;

			$.each(marketDetails, function (index, eachRow) {
				if (typeof window.cityLabels === 'undefined') window.cityLabels = [];
				window.cityLabels[eachRow.idtcity] = eachRow.scityname;
			});
			marketCameraDetails = data.marketCamera;
			marketCameraRotationDetails = data.cameraRotation;
			cityAltitudeAdjustment = data.cityAltitudeAdjustment;
			marketOrbitDetails = data.marketOrbit;

			if (defaultCity != null && defaultCity !== '') {
				$('#viewerController').css('display', 'flex');
				lastSelectedBuildingType = defaultMarket;
				lastMarketLoaded = defaultMarketId;
				const market = marketDetailsV2[defaultMarketId];
				if (market != null && typeof market.idtcity !== 'undefined') {
					lastToLastCity = market.idtcity;
					loadSubmarketDropdownFromMarketId(market.idtcity, market.idtmarket);
					loadBuildingForAutoSuggest(market.idtmarket);
				}
				if (window.PageLoadDefaultGridDisplayed === false && (isNaN(defaultCity) || defaultCity == null || defaultCity == 0)) {
					$('.loading-overlay').show();
					$('.loading-overlay-message').hide();
					window.PageLoadDefaultGridDisplayed = false;
					prepareCityGridStructure(data.citiesAccessible);
				} else {
					window.PageLoadDefaultGridDisplayed = false;
					if (defaultCity == 2 || defaultCity == 0) {
						defaultCity = 2;
						getBuildingData(market, false);
					} else {
						getBuildingData(market);
					}
				}
			} else if (defaultCity == 0) {
				$('.loading-overlay').show();
				$('.loading-overlay-message').hide();
				window.PageLoadDefaultGridDisplayed = false;
				prepareCityGridStructure(data.citiesAccessible);
			} else {
				getBuildingData(marketDetails[0], false);
			}
		}
		getApp10Counts();
	} catch (err) {
		console.error('getApp10MarketDetails error', err);
		alert('Failed to load market details.');
	}
}

/* ============================================================
   Custom confirm dialog — replaces native confirm().
   Shows as a bar pinned to the TOP of the screen (not a centered
   modal), with a dimmed backdrop behind it so map clicks can't
   slip through underneath while it's open. Mobile-friendly:
   stacks message/buttons on narrow screens, large tap targets.

   Usage (replaces confirm("...")):

     showCustomConfirm("Return to City Grid?", function () {
       // ...code that used to run after the user clicked OK
     });

   Optional third arg runs if the user clicks No / dismisses it:

     showCustomConfirm("Discard changes?", onYes, onNo);
   ============================================================ */

function ensureCustomConfirmMarkup() {
	if (document.getElementById('customConfirmBar')) return;

	var backdrop = document.createElement('div');
	backdrop.id = 'customConfirmBackdrop';
	backdrop.className = 'custom-confirm-backdrop';

	var bar = document.createElement('div');
	bar.id = 'customConfirmBar';
	bar.className = 'custom-confirm-bar';
	bar.setAttribute('role', 'alertdialog');
	bar.setAttribute('aria-live', 'assertive');
	bar.setAttribute('aria-modal', 'true');
	bar.innerHTML =
		"<span class='custom-confirm-message' id='customConfirmMessage'></span>" +
		"<div class='custom-confirm-actions'>" +
		"  <button type='button' class='custom-confirm-btn custom-confirm-yes' id='customConfirmYes'>Yes</button>" +
		"  <button type='button' class='custom-confirm-btn custom-confirm-no' id='customConfirmNo'>No</button>" +
		"</div>";

	document.body.appendChild(backdrop);
	document.body.appendChild(bar);
}

function showCustomConfirm(message, onYes, onNo) {
	ensureCustomConfirmMarkup();

	var backdrop = document.getElementById('customConfirmBackdrop');
	var bar = document.getElementById('customConfirmBar');
	var yesBtn = document.getElementById('customConfirmYes');
	var noBtn = document.getElementById('customConfirmNo');

	document.getElementById('customConfirmMessage').textContent = message;

	function close() {
		bar.classList.remove('show');
		backdrop.classList.remove('show');
		yesBtn.removeEventListener('click', handleYes);
		noBtn.removeEventListener('click', handleNo);
		backdrop.removeEventListener('click', handleNo);
		document.removeEventListener('keydown', handleKey);
	}
	function handleYes() { close(); if (typeof onYes === 'function') onYes(); }
	function handleNo() { close(); if (typeof onNo === 'function') onNo(); }
	function handleKey(e) {
		if (e.key === 'Escape') handleNo();
		if (e.key === 'Enter') handleYes();
	}

	yesBtn.addEventListener('click', handleYes);
	noBtn.addEventListener('click', handleNo);
	backdrop.addEventListener('click', handleNo);
	document.addEventListener('keydown', handleKey);

	backdrop.classList.add('show');
	bar.classList.add('show');
	yesBtn.focus();
}

/* ============================================================
   moveToCityGrid() — rewired to use the div-based confirm instead
   of the native confirm(). All original reset logic is unchanged,
   it just now runs inside the "Yes" callback.
   ============================================================ */
function moveToCityGrid() {
	showCustomConfirm("Return to City Grid?", function () {
		// Reset parameters
		lastCityLoaded = null;
		lastMarketLoaded = null;
		devSelectedBuilding = null;
		lastSelectedSuite = null;
		lastSelectedPrimitive = null;
		lastSelectedPrimitiveId = null;
		lastSelectedMarket = null;
		lastSelectedSuite = null;
		lastFloor = null;
		lastFloorSelected = null;
		lastFloorSelectedColor = null;
		lastBuildingSolidFloorHighlighted = null;
		clearAllEffects();
		viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");

		initiateEffectsArray();

		clearSearchAndSettingBox();

		$(".loading-overlay").show();
		$(".loading-overlay-message").hide();
		$(".mapLogoOverlay").hide();
		$(".logoOverlay").hide();
		if (typeof htmlPolygonCOverlay != "undefined")
			htmlPolygonCOverlay.remove();
		lastSelectedBuildingType = "Office";
		prepareCityGridStructure(window.citiesToShow);
		stopRotateIfInProgress();
		setTimeout(function () { clearPrimitives(); }, 500);
		if (window.fixedOrbitInProgress)
		{
			StopFixedPointOrbit();
			window.fixedOrbitInProgress = false;
			return;
		}
		
	});
}

function cityGridSortToggle() {
  /* if (window.cityGridSortOrder == "alphabetical") {
    window.cityGridSortOrder = "properties";
  } else {
    window.cityGridSortOrder = "alphabetical";
  } */
  //console.log("window.cityGridSortOrder: "+window.cityGridSortOrder);
  prepareCityGridStructure("", false);
}

window.cityGridSortOrder = "floorplans";
window.cityCounts = [];
window.cityFloorplanCounts = window.cityFloorplanCounts || [];
window.marketFloorplanCounts = window.marketFloorplanCounts || [];
function parseCityOfficeArea(value)
{
	if(typeof value == "undefined" || value == null)
		return 0;
	return parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
}
function getCountryOfficeAreaTotal(countryName)
{
	var cityRows = allCitiesWithCountry[countryName] || [];
	var total = 0;
	$.each(cityRows, function (index, eachCity){
		total += parseCityOfficeArea(eachCity.officearea);
	});
	return total;
}
function prepareCityGridStructure(citiesGrid, dontSkipHeader = true)
{
	cameraAltitudeAdjustment = 0;
	triedAfterRetry = 0;
	window.expectedAltitude = 0;
	window.currentURL = window.location.origin+window.location.pathname
	window.history.pushState("page","app10", window.currentURL);
	$("#viewerController").hide();
	$(".loading-overlay-city-grid").show();
	$(".loading-overlay-user").show();
	/*
	const cities = [
	  "New York", "Tokyo", "London", "Paris", 
	  "Berlin", "Sydney", "Moscow", "Beijing", 
	  "Mumbai", "Toronto"
	];
	*/
	if(dontSkipHeader)
	{
		let headerContent = '<div class="gridLogoOverlay" style="width: 100%"><img src="images/FLOORPLAN-CITY-GRID.png" alt="Logo">';
			//headerContent += '<span class="citygridelement">City Grid</span>';
			headerContent += '<hr />';
			headerContent += '<div class="cityGridFilterBar">';
				headerContent += '<div class="cityGridLegendRow">';// style="overflow: hidden;">';
					headerContent += '<span class="cityGridLegendBadges" style="">';
						headerContent += '<span class="badge cityGridLegendBadge" style="background-color: '+classColor['Office']+'">Office</span><span class="badge cityGridLegendBadge" style="background-color: '+classColor['Apartments']+'">Residential</span><span class="badge cityGridLegendBadge" style="background-color: '+classColor['Retail']+'">Retail</span><span class="badge cityGridLegendBadge" style="background-color: '+classColor['Hotel']+'">Hotels</span><span class="badge cityGridLegendBadge" style="background-color: white;">Other</span>';
					headerContent += '</span>';
					/*
					headerContent += '<span style="float:right; ">';
					txt = "";
					if(window.cityGridSort == "alphabetical")
						headerContent += '<span id="sortContainer" onClick="cityGridSortToggle();" class="badge sort-btn badge-button-style pull-right">Sort by total properties</span>';
					if(window.cityGridSort == "properties")
						headerContent += '<span id="sortContainer" onClick="cityGridSortToggle();" class="badge sort-btn badge-button-style pull-right">Sort Alphabetically</span>';
					headerContent += '</span>';
					*/
					// ─── Header HTML ──────────────────────────────────────────────────────────
					headerContent += '<span class="cityGridSortWrap">';// style="float:right;margin-top: -10px;">';
					headerContent += '  <span class="gfc-tag" style="display: none;">Global Financial Centres</span>';
					headerContent += '  <button id="sortToggleBtn" onclick="openSortDropdown(this)" class="badge sort-btn badge-button-style pull-right" style="font-size: 1.05em !important;">';
					headerContent += '    <span class="sortBtnLabel">Sort / Filter</span> ';
					headerContent += '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;">';
					headerContent += '      <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/>';
					headerContent += '    </svg>';
					headerContent += '  </button>';
					headerContent += '</span>';
					headerContent += '</span>';
				headerContent += '</div>';
			
			
				// NEW: bottom row with autosuggest box aligned right -->
				
				headerContent += '<div class="buildingSearchRow">';
					headerContent += '<div class="buildingAutosuggestWrapper">';
						headerContent += '<input type="text" id="buildingSearchInput" class="buildingSearchInput" placeholder="Search building name, address..." autocomplete="off" >';
						headerContent += '<ul id="buildingSuggestList" class="buildingSuggestList" style="display:none;"></ul>';
					headerContent += '</div>';
				headerContent += '</div><br />';
				//headerContent += '<span class="citygridelement">City Grid</span>';
			
			headerContent += '</div>';
		headerContent += '</div>';
		
		$(".container").html(headerContent+"<div class='newContainer'></div>");
		
		InitiateCityGridBuildingAutoSuggest();
	}
	else
	{
		txt = "";
		if(window.cityGridSortOrder == "alphabetical")
			txt = 'Sort by total properties';
		if(window.cityGridSortOrder == "properties")
			txt = 'Sort Alphabetically';
		$("#sortContainer").html(txt);
		$(".newContainer").html("");
	}
	$(".below-grid-loader").html("");
	const container = document.querySelector('.newContainer');
	const allClickableCities = [];
	$.each(window.citiesToShow, function (index, eachCity){
		allClickableCities.push(eachCity.idtcity);
	});
	
	/*
	var totalCountryBuildings = [];
	var countryMaxCounter = [];
	$.each(allCitiesWithCountry, function (country, cityRows){
		totalCountryBuildings[country] = 0;
		countryMaxCounter[country] = 0;
		$.each(cityRows, function (index, eachCity){
			if(countryMaxCounter[country] == 0 || countryMaxCounter[country] < parseInt(eachCity.cnt))
				countryMaxCounter[country] = parseInt(eachCity.cnt);
			totalCountryBuildings[country] += parseInt(eachCity.cnt);
		});
	});
	//console.log(totalCountryBuildings);
	//console.log(countryMaxCounter);
	*/
	let onlyGlobalFinCenter = false;
	if(window.cityGridSortOrder == "properties")
	{
		countryWithProperties.sort((a, b) => b.total - a.total);
	}
	else if(window.cityGridSortOrder == "alphabetical")
	{
		countryWithProperties.sort((a, b) => a.name.localeCompare(b.name));
	}
	else if(window.cityGridSortOrder == "floorplans")
	{
		countryWithProperties.sort((a, b) => b.floorplans - a.floorplans);
	}
	else if(window.cityGridSortOrder == "marketsize")
	{
		countryWithProperties.sort((a, b) => getCountryOfficeAreaTotal(b.name) - getCountryOfficeAreaTotal(a.name));
	}

	$(".gfc-tag").css("display", "none");
	if(window.cityGridGfcFilter == "global_fin_centre")
	{
		onlyGlobalFinCenter = true;
		$(".gfc-tag").css("display", "block");
		if(window.cityGridSortOrder == "Custom")
		{
			countryWithProperties.sort((a, b) => b.globalfincentre - a.globalfincentre);
		}
	}
	else if(window.cityGridSortOrder == "Custom")
	{
		window.cityGridSortOrder = "floorplans";
		countryWithProperties.sort((a, b) => b.floorplans - a.floorplans);
	}

	$.each(countryWithProperties, function (iir, eachRow){
		if((onlyGlobalFinCenter == true && eachRow.globalfincentre > 0) || onlyGlobalFinCenter == false)
		{
			country = eachRow.name;
			cityRows = allCitiesWithCountry[eachRow.name];
			if(window.cityGridSortOrder == "floorplans")
			{
				cityRows.sort((a, b) => b.floorplans - a.floorplans);
			}
			else if(window.cityGridSortOrder == "marketsize")
			{
				cityRows.sort((a, b) => parseCityOfficeArea(b.officearea) - parseCityOfficeArea(a.officearea));
			}
			else if(window.cityGridSortOrder == "properties")
			{
				cityRows.sort((a, b) => b.cnt - a.cnt);
			}
			else if(window.cityGridSortOrder == "alphabetical")
			{
				cityRows.sort((a, b) => a.scityname.localeCompare(b.scityname));
			}
			const countryGroup = document.createElement('div');
			countryGroup.className = 'country-group';

			// Add country title
			const countryTitle = document.createElement('div');
			countryTitle.className = 'country-title grey-color-title';
			countryTitle.textContent = country;
			countryGroup.appendChild(countryTitle);
			
			// Create a grid for cities
		  const grid = document.createElement('div');
		  grid.className = 'grid';
			$.each(cityRows, function (index, eachCity){
				if((onlyGlobalFinCenter == true && eachCity.global_fin_centre == 'Yes') || onlyGlobalFinCenter == false)
				{
					if (!allClickableCities.includes(eachCity.idtcity)) {
						if(typeof allRemainingCitiesWithCountry[country] == "undefined")
							allRemainingCitiesWithCountry[country] = [];
						allRemainingCitiesWithCountry[country].push(eachCity);
						return;
					}

					//var randomCounter = countryMaxCounter[country];
					cityCounts[eachCity.idtcity] = eachCity.cnt;
					let randomCounter  = parseInt(eachCity.cnt);
					if(parseInt(eachCity.cnt) > 3000)
					{
						randomCounter = 3000;
					}
					//const randomCounter = eachCity.cnt;//Math.floor(Math.random() * 100) + 1;
					const height = Math.max(50, randomCounter / 10); // Minimum height 50, proportional scaling for larger heights
					
					const cityWrapper = document.createElement('div');
					cityWrapper.className = 'city-wrapper'; // a container for both cityBox and the new row

					const cityBox = document.createElement('div');
					cityBox.className = 'city-box city-box-'+eachCity.idtcity;
					cityBox.style.height = `${height}px`;
					cityBox.innerHTML = getCityGridBars(citiesCounts[eachCity.idtcity], 3000);
					//City-grid tile shows the whole-city property count. (The per-market count is what
					//the loading overlay shows once you click into a market - see setLoadingMessage().)
					let buildingCnt = numberWithCommaWithoutDecimal2(eachCity.cnt);
					let vacancy = "-";
					if(eachCity.vacancy != null)
					{
						vacancy = eachCity.vacancy.toFixed(1);
						if(vacancy > 0)	
						{
							vacancy = vacancy + "%";
						}
					}
					let floorplansCnt = numberWithCommaWithoutDecimal2(eachCity.floorplans);
					cityFloorplanCounts[eachCity.idtcity] = eachCity.floorplans;
					let activeSpacesCnt = numberWithCommaWithoutDecimal2(eachCity.activespaces);
					
					let calculatedOfficeArea = eachCity.officearea;
					if(calculatedOfficeArea == "0")
						calculatedOfficeArea = "";
					/*
					if(eachCity.floorplans == '')
						eachCity.floorplans = 0;
					if(eachCity.cnt == '')
						eachCity.cnt = 0;
					*/
					cityBox.innerHTML += `
					  <span class="city-box-name">${eachCity.scityname}</span>
					  <!--br /-->
					  <div class="city-box-count" style="margin-top: 15px !important;"><span class='city-box-count-label'></span>${calculatedOfficeArea}</div>
					  <div class="city-box-count"><span class='city-box-count-label'>Properties:</span> ${buildingCnt}</div>
					  <div class="city-box-count"><span class='city-box-count-label'>Office Vacancy:</span> ${vacancy}</div>
					  <div class="city-box-count"><span class='city-box-count-label'>Floorplans:</span> ${floorplansCnt}</div>
					  <div class="city-box-count"><span class='city-box-count-label'>Active Spaces:</span> ${activeSpacesCnt}</div>
					`;
					  //<div class="city-box-count"><span class='city-box-count-label'>Available Office Spaces:</span> ${floorplansCnt}</div>
					cityBox.addEventListener('click', () => {
						$(".city-box-"+eachCity.idtcity).css("border", "2px solid black");
						setTimeout(function (){
							openVisualizationForCity(eachCity);
						}, 700);
					});

					// Create the new row below the city box
					const extraRow = document.createElement('div');
					extraRow.className = 'city-extra-row';
					extraRow.innerHTML = `
					  <div class="extra-item">${getMarketAvailableDropdown(eachCity.idtcity)}</div>
					  <div class="extra-item extra-item-with-space">${getVisualizationDropdown(eachCity.idtcity)}</div>
					`;

					// Append both elements into the wrapper
					cityWrapper.appendChild(cityBox);
					cityWrapper.appendChild(extraRow);

					grid.appendChild(cityWrapper);
				}
				
			});
			
			/*
			extraRow = null;
			if(typeof allRemainingCitiesWithCountry[country] != "undefined" && allRemainingCitiesWithCountry[country].length > 0)
			{
				extraRow = document.createElement('div');
				extraRow.className = 'country-block';
				extraRow.innerHTML = `<div class="country-name">Other Cities</div>`;
				$.each(allRemainingCitiesWithCountry[country], function (ksks, cityName){
					extraRow.innerHTML += '<div class="city">'+cityName.scityname+'</div>';
				});
				//grid.appendChild(extraRow);
			}
			*/
			
			countryGroup.appendChild(grid);

			/*
			if(extraRow != null)
				countryGroup.appendChild(extraRow);
			*/

			if(grid.children.length > 0)
			{
				container.appendChild(countryGroup);
			}
		}
	});
	
	let remainingCities = "<p>Other Cities</p>";
	$.each(allRemainingCitiesWithCountry, function (countryName, cityList){
		if(!["China", "Israel", "Turkey", "Russia", "UAE"].includes(countryName))
		{
			remainingCities += '<div class="country-block"><div class="country-name smallCountryName">'+countryName+'</div>';
			$.each(cityList, function (ij, cityName){
				if(cityName.scityname != "Chandigarh")
					remainingCities += '<div class="city smallCityName">'+cityName.scityname+'</div>';
			});
			remainingCities += '</div></div>';
		}
	});
	
	$(".newContainer").append("<br />"+remainingCities+"<br clear='all'><hr /><a href='http://www.floorplan.city' style='float:left;'>http://www.floorplan.city</a><br /><br />");
}

// ─── JS — add once on page, outside your render loop ─────────────────────
function openSortDropdown(btn) {
    let existing = document.getElementById('cityGridSortDropdown');
    if (existing) { existing.remove(); return; }

    const rect = btn.getBoundingClientRect();
    const ul = document.createElement('ul');
    ul.id = 'cityGridSortDropdown';
    ul.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    ul.style.left = (rect.right  + window.scrollX - 210) + 'px';

    const sortOptions = [
        { key: 'alphabetical', label: 'Sort alphabetically' },
        //{ key: 'properties',   label: 'Sort by total properties' },
        { key: 'floorplans',   label: 'Sort by total floorplans' },
		{ key: 'marketsize',   label: 'Sort by market size' },
    ];

    const filterOptions = [
        { key: 'global_fin_centre', label: 'Global Financial Centres' }
    ];

    // --- Sort options ---
    sortOptions.forEach(function(opt) {
        const li = document.createElement('li');
        if (opt.key === window.cityGridSortOrder) li.className = 'active';
        li.innerHTML = '<span class="check">✓</span>' + opt.label;
        li.addEventListener('click', function() {
            cityGridSort(opt.key);         // ← sort handler
        });
        ul.appendChild(li);
    });

    // --- Divider ---
    const hr = document.createElement('hr');
    hr.className = 'sort-divider';
    ul.appendChild(hr);

    // --- Filter options ---
    filterOptions.forEach(function(opt) {
        var li = document.createElement('li');
        if (window.cityGridGfcFilter === opt.key) li.className = 'active'; // ← own flag
        li.innerHTML = '<span class="check filter-'+opt.key+'">✓</span>' + opt.label;
        li.addEventListener('click', function() {
            cityGridSort(opt.key);  // ← separate filter handler
        });
        ul.appendChild(li);
    });

    document.body.appendChild(ul);
}

function openSortDropdown_OLD(btn) {
    // If already open, close it (toggle)
    var existing = document.getElementById('cityGridSortDropdown');
    if (existing) { existing.remove(); return; }

    var rect = btn.getBoundingClientRect();

    var ul = document.createElement('ul');
    ul.id = 'cityGridSortDropdown';
    ul.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
    ul.style.left = (rect.right  + window.scrollX - 210) + 'px'; // right-align to button

    var options = [
        { key: 'alphabetical', label: 'Sort alphabetically' },
        { key: 'properties',   label: 'Sort by total properties' },
        { key: 'floorplans',   label: 'Sort by total floorplans' },

        null, // 👈 this will render <hr>

        { key: 'global_fin_centre', label: 'Global Financial Centres' }
    ];

    options.forEach(function(opt) {
        if (!opt) {
            var hr = document.createElement('hr');
            hr.className = 'sort-divider';
            ul.appendChild(hr);
            return;
        }

        var li = document.createElement('li');
        if (opt.key === window.cityGridSortOrder) li.className = 'active';

        li.innerHTML = '<span class="check">✓</span>' + opt.label;
        li.addEventListener('click', function() { cityGridSort(opt.key); });

        ul.appendChild(li);
    });

    document.body.appendChild(ul);
}

// AFTER (fixed — separate names):
window.cityGridSortOrder = 'floorplans'; // state variable
window.cityGridGfcFilter  = ''; // state variable

function cityGridSort(sortType) {
	if(sortType == "global_fin_centre")
	{
		window.cityGridGfcFilter = (window.cityGridGfcFilter === sortType) ? null : sortType;
		if(window.cityGridGfcFilter == null)
		{
			$("filter-global_fin_centre").removeClass("active");
		}
		else
		{
			window.cityGridSortOrder = "Custom";
		}
	}
	else
	{
		window.cityGridSortOrder = sortType;   // ← safe, different name
	}
    var dd = document.getElementById('cityGridSortDropdown');
    if (dd) dd.remove();
    //renderCityGrid();
	cityGridSortToggle();
}
/* 
function openSortDropdown(btn) {
    ...
    options.forEach(function(opt) {
        ...
        if (opt.key === window.cityGridSortOrder) li.className = 'active'; // ← updated ref
        ...
    });
    ...
} */

// Close on outside click
$(document).on('click.cityGridSort', function(e) {
    var dd = document.getElementById('cityGridSortDropdown');
    if (!dd) return;
    if (!$(e.target).closest('#sortToggleBtn, #cityGridSortDropdown').length) {
        dd.remove();
    }
});

function getCityGridBars(rows, total = 0)
{
	if(typeof rows.Office == "undefined")
		rows.Office = 0;
	if(typeof rows.Residential == "undefined")
		rows.Residential = 0;
	if(typeof rows.Retail == "undefined")
		rows.Retail = 0;
	if(typeof rows.Other == "undefined")
		rows.Other = 0;
	if(typeof rows.Hotel == "undefined")
		rows.Hotel = 0;

	//if(total == 0)
	total = parseInt(rows.Office) + parseInt(rows.Residential) + parseInt(rows.Retail) + parseInt(rows.Other) + parseInt(rows.Hotel);
	
	str = '<div class="city-bars">';
      str += '<div class="bar" style="background-color: '+classColor['Office']+'; height: '+(parseInt(rows.Office) / parseInt(total) * 100)+'%;"></div>';
      str += '<div class="bar" style="background-color: '+classColor['Apartments']+'; height: '+(parseInt(rows.Residential) / parseInt(total) * 100)+'%;"></div>';
      str += '<div class="bar" style="background-color: '+classColor['Retail']+'; height: '+(parseInt(rows.Retail) / parseInt(total) * 100)+'%;"></div>';
      str += '<div class="bar" style="background-color: '+classColor['Hotel']+'; height: '+(parseInt(rows.Hotel) / parseInt(total) * 100)+'%;"></div>';
      str += '<div class="bar" style="background-color: white; height: '+(parseInt(rows.Other) / parseInt(total) * 100)+'%;"></div>';
    str += '</div>';
	return str;
}

function getVisualizationDropdown(idtcity)
{
	//return "";
	var itemsHtml = "";
	var selectedValue = "";
	var selectedLabel = "";

	$.each(buildingTypeDropdown, function (index, eachType){
		var dropdownClass = "";
		var dText = eachType+" Market";
		if(eachType == "Floorplan")
			dText = "Available Office Space";
		if(eachType == "Development")
			dText = "Development Activity";
		if(eachType == "Residential")
			dText = "Multifamily Market";
		if(eachType == "All")
		{
			dropdownClass = " allPropertiesTextStyle";
			dText = "All Properties";
		}

		var activeClass = "";
		if(selectedValue == "")
		{
			selectedValue = eachType;
			selectedLabel = dText;
			activeClass = " active";
		}

		itemsHtml += "<li><a class='dropdown-item"+dropdownClass+activeClass+"' href='#' onclick=\"return selectDropdownItem(this,'cityVis"+idtcity+"','cityVisLabel"+idtcity+"','"+eachType+"','')\">"+dText+"</a></li>";

		if(idtcity == 23 && eachType == "All")
		{
			itemsHtml += "<li><hr class='dropdown-divider'></li>";
			itemsHtml += "<li><a class='dropdown-item' href='#' onclick=\"return selectDropdownItem(this,'cityVis"+idtcity+"','cityVisLabel"+idtcity+"','AvailableOfficeSpace','')\">Example Market Vacancy</a></li>";
			itemsHtml += "<li><a class='dropdown-item' href='#' onclick=\"return selectDropdownItem(this,'cityVis"+idtcity+"','cityVisLabel"+idtcity+"','OfficeRentalRates','')\">Example Market Rates</a></li>";
		}

		if(window.citiesEnabledForInvestmentSales.includes(parseInt(idtcity)) && eachType == "Office")
		{
			itemsHtml += "<li><a class='dropdown-item' href='#' onclick=\"return selectDropdownItem(this,'cityVis"+idtcity+"','cityVisLabel"+idtcity+"','InvestmentSalesMarket','')\">Investment Sales Market</a></li>";
		}
	});

	var str = "<div class='dropdown nested-dropdown city-extra-dropdown' style='width:100%;'>";
	str += "<button class='btn dropdown-toggle w-100' type='button' id='cityVisBtn"+idtcity+"' aria-haspopup='true' aria-expanded='false'><span id='cityVisLabel"+idtcity+"'>"+selectedLabel+"</span></button>";
	str += "<ul class='dropdown-menu nested-dropdown-menu' aria-labelledby='cityVisBtn"+idtcity+"'>";
	str += itemsHtml;
	str += "</ul>";
	str += "<input type='hidden' id='cityVis"+idtcity+"' value='"+selectedValue+"'>";
	str += "</div>";
	return str;
}

function getMarketAvailableDropdown(idtcity)
{
	var str = "";
	idtcity = parseInt(idtcity);
	if(typeof window.cityMarketRelationship[idtcity] != "undefined")
	{
		var itemsHtml = "";
		var selectedValue = "";
		var selectedLabel = "";

		$.each(window.cityMarketRelationship[idtcity], function (row, eachMarket){
			var activeClass = "";
			if(selectedValue == "")
			{
				selectedValue = eachMarket.idtmarket;
				selectedLabel = eachMarket.smarketname;
				activeClass = " active";
			}

			itemsHtml += "<li><a class='dropdown-item"+activeClass+"' href='#' onclick=\"return selectDropdownItem(this,'cityMkt"+idtcity+"','cityMktLabel"+idtcity+"','"+eachMarket.idtmarket+"','')\">"+eachMarket.smarketname+"</a></li>";
		});

		str = "<div class='dropdown nested-dropdown city-extra-dropdown' style='width:100%;'>";
		str += "<button class='btn dropdown-toggle w-100' type='button' id='cityMktBtn"+idtcity+"' aria-haspopup='true' aria-expanded='false'><span id='cityMktLabel"+idtcity+"'>"+selectedLabel+"</span></button>";
		str += "<ul class='dropdown-menu nested-dropdown-menu' aria-labelledby='cityMktBtn"+idtcity+"'>";
		str += itemsHtml;
		str += "</ul>";
		str += "<input type='hidden' id='cityMkt"+idtcity+"' value='"+selectedValue+"'>";
		str += "</div>";
	}
	return str;
}

//Per-market property (building) count from marketDetailsV2 (tmarket row, .propertycount added
//server-side in getApp10MarketDetails). Returns null when there's no usable number so callers
//can fall back to the city-wide count. Used by setLoadingMessage() for the loading overlay.
function getMarketPropertyCount(idtmarket)
{
	if(idtmarket == null || typeof idtmarket == "undefined")
		return null;
	var m = marketDetailsV2[parseInt(idtmarket)];
	if(!m)
		return null;
	var c = parseInt(m.propertycount);
	return (!isNaN(c) && c > 0) ? c : null;
}

function setCookie(name, value, days = 7) {
	return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

function prepareCityGridStructureNew(citiesGrid)
{
	window.currentURL = window.location.origin+window.location.pathname
	window.history.pushState("page","app10", window.currentURL);
	$("#viewerController").hide();
	$(".loading-overlay-city-grid").show();
	$(".loading-overlay-user").show();
	/*
	const cities = [
	  "New York", "Tokyo", "London", "Paris", 
	  "Berlin", "Sydney", "Moscow", "Beijing", 
	  "Mumbai", "Toronto"
	];
	*/
	$(".container").html('<div class="gridLogoOverlay"><img src="images/FLOORPLAN-CITY.png" alt="Logo"></div>');
	$(".below-grid-loader").html("");
	const container = document.querySelector('.container');
	var allClickableCities = [];
	$.each(window.citiesToShow, function (index, eachCity){
		allClickableCities.push(eachCity.idtcity);
	});
	$.each(allCitiesWithCountry, function (country, cityRows){
		const countryGroup = document.createElement('div');
		countryGroup.className = 'country-group';

		// Add country title
		const countryTitle = document.createElement('div');
		countryTitle.className = 'country-title';
		countryTitle.textContent = country;
		countryGroup.appendChild(countryTitle);
		
		// Create a grid for cities
      const grid = document.createElement('div');
      grid.className = 'grid';
		$.each(cityRows, function (index, eachCity){
			var randomCounter = eachCity.cnt;
			if(parseInt(eachCity.cnt) > 3000)
			{
				randomCounter = 3000;
			}
			//const randomCounter = eachCity.cnt;//Math.floor(Math.random() * 100) + 1;
			const height = Math.max(50, randomCounter / 10); // Minimum height 50, proportional scaling for larger heights
			/*
			const cityBox = document.createElement('div');
			cityBox.className = 'city-box';
			cityBox.style.height = `${height}px`;
			cityBox.innerHTML = '<span class="city-box-name">'+eachCity.scityname+'</span><div>('+eachCity.cnt+')</div>';
			//cityBox.innerHTML += '<ul class="market-list"><li>Market 1</li><li>Market 2</li><li>Market 3</li></ul>';
			
			if(!allClickableCities.includes(eachCity.idtcity))
			{
				cityBox.className = 'disabled-city-box city-disabled ';
			}
			else
			{
				cityBox.addEventListener('click', () => {
					openVisualizationForCity(eachCity);
				});
			}
			grid.appendChild(cityBox);
			*/
			
			cityBox = '<div class="city-box">';
				cityBox += eachCity.scityname+' ('+eachCity.cnt+')';
				/*
				cityBox += '<!-- Dropdown 1 -->';
				  cityBox += '<div class="dropdown d-inline me-3">';
					cityBox += '<button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">Market Type';
					cityBox += '</button>';
					cityBox += '<ul class="dropdown-menu">';
					  cityBox += '<li><a class="dropdown-item active" href="#">Retail <span class="checkmark">✔</span></a></li>';
					  cityBox += '<li><a class="dropdown-item" href="#">Office <span class="checkmark">✔</span></a></li>';
					  cityBox += '<li><a class="dropdown-item" href="#">Industrial <span class="checkmark">✔</span></a></li>';
					cityBox += '</ul>';
				  cityBox += '</div>';

				  cityBox += '<div class="dropdown d-inline">';
					cityBox += '<button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">Submarket';
					cityBox += '</button>';
					cityBox += '<ul class="dropdown-menu">';
					  cityBox += '<li><a class="dropdown-item active" href="#">Downtown <span class="checkmark">✔</span></a></li>';
					  cityBox += '<li><a class="dropdown-item" href="#">Midtown <span class="checkmark">✔</span></a></li>';
					  cityBox += '<li><a class="dropdown-item" href="#">Uptown <span class="checkmark">✔</span></a></li>';
					cityBox += '</ul>';
				  cityBox += '</div>';
				  */
				  cityBox += '<div class="hover-arrow">&gt;</div>';
			cityBox += '</div>';
		grid.innerHTML += cityBox;
			
		});
		countryGroup.appendChild(grid);
      container.appendChild(countryGroup);
	});
}

function prepareCityGridStructure_WRT_Cities(citiesGrid)
{
	$("#viewerController").hide();
	$(".loading-overlay-city-grid").show();
	/*
	const cities = [
	  "New York", "Tokyo", "London", "Paris", 
	  "Berlin", "Sydney", "Moscow", "Beijing", 
	  "Mumbai", "Toronto"
	];
	*/
	
	$(".grid").html("");
	$(".below-grid-loader").html("");
	const grid = document.querySelector('.grid');
	
	$.each(citiesGrid, function (index, eachCity){
		var randomCounter = eachCity.cnt;
		if(parseInt(eachCity.cnt) > 3000)
		{
			randomCounter = 3000;
		}
		//const randomCounter = eachCity.cnt;//Math.floor(Math.random() * 100) + 1;
		const height = Math.max(50, randomCounter / 10); // Minimum height 50, proportional scaling for larger heights
		
		const cityBox = document.createElement('div');
		cityBox.className = 'city-box';
		cityBox.style.height = `${height}px`;
		cityBox.innerHTML = `${eachCity.scityname} (${eachCity.cnt})`;
		cityBox.addEventListener('click', () => {
			openVisualizationForCity(eachCity);
		});
		grid.appendChild(cityBox);
	
	});
}
let flyToBuildingAfterSearch = null;
function openVisualizationForCity(cityDetails, idtbuilding = null)
{
	flyToBuildingAfterSearch = idtbuilding;
	if(flyToBuildingAfterSearch != null)
	{
		defaultBuilding = flyToBuildingAfterSearch;
		lastSelectedBuilding = defaultBuilding;
		devSelectedBuilding = defaultBuilding;
	}
	triedAfterRetry = 0;
	lastSelectedBuildingType = $("#cityVis"+cityDetails.idtcity).val();
	lastMarketLoaded = parseInt($("#cityMkt"+cityDetails.idtcity).val());
	lastCityLoaded = parseInt(cityDetails.idtcity);
	
	flyToCitySkyline(cityDetails.idtcity);
	console.log("1. City Loaded "+lastCityLoaded);
	if(isNaN(lastMarketLoaded))
		return;
	isCityLoadingInProgress = true;
	//setTimeout(function (){ isCityLoadingInProgress = false; }, 5000);
	//$("#viewerController").show();
	$("#viewerController").css("display", "flex");
	$(".loading-overlay-message").show();
	$(".mapLogoOverlay").show();
	//marketDetailsV2[lastMarketLoaded]
	if(typeof marketDetailsV2[lastMarketLoaded].skylinealtitude != "undefined")
	{
		window.expectedAltitude = marketDetailsV2[lastMarketLoaded].skylinealtitude;
	}
	
	setLoadingMessage(cityDetails.idtcity, marketDetailsV2[lastMarketLoaded].smarketname, lastMarketLoaded);
			
	$(".loading-overlay-message").show();
	$(".loading-overlay-city-grid").hide();
	$(".loading-overlay-user").hide();
	loadSubmarketDropdownFromMarketId(marketDetailsV2[lastMarketLoaded].idtcity, marketDetailsV2[lastMarketLoaded].idtmarket);
	setTimeout(function (){ getBuildingData(marketDetailsV2[lastMarketLoaded]); }, 200);
	
	/*
	var foundMatch = false;
	
	$.each(marketDetails, function (index, eachMarket){
		if( eachMarket.idtcity == cityDetails.idtcity && eachMarket.idtmarket == parseInt(lastMarketLoaded) && !foundMatch)
		{
			foundMatch = true;
			setLoadingMessage(cityDetails.cnt, cityDetails.smarketname);
			
			$(".loading-overlay-message").show();
			$(".loading-overlay-city-grid").hide();
			$(".loading-overlay-user").hide();
			loadSubmarketDropdownFromMarketId(eachMarket.idtcity, eachMarket.idtmarket);
			setTimeout(function (){ getBuildingData(eachMarket); }, 200);
		}
	});
	*/
}

function setLoadingMessage(idtcity, cityName, idtmarket)
{
	var cnt = 0;
	//The loading overlay shows the count for the market being opened (the city-grid tile itself
	//shows the whole-city count); fall back to the city-wide counts when there's no per-market number.
	var marketPropCnt = getMarketPropertyCount(idtmarket);
	if(marketPropCnt != null)
	{
		cnt = marketPropCnt;
	}
	else if(typeof cityCounts[idtcity] != "undefined")
	{
		cnt = cityCounts[idtcity];
	}
	else if(typeof cityBuildingCount[idtcity] != "undefined")
	{
		cnt = cityBuildingCount[idtcity];
	}
	//debugger;
	//console.log("setLoadingMessage("+cnt+", "+cityName);
	if(typeof cityName != "undefined" && cityName != "" && cnt > 0 && cnt != "")
		$(".loading-message").html("Loading "+cityName+"...<br /><br />"+numberWithCommaWithoutDecimal2(cnt)+" Properties<div style='margin-top:10px;'>"+numberWithCommaWithoutDecimal2(marketFloorplanCounts[idtmarket])+" Floorplans</div>");
}

async function getApp10Counts() {
	try {
		const resp1 = await fetch('controllers/buildingController.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ param: 'getApp10CityBuildingCount' }),
		});
		const text1 = await resp1.text();
		try { const data1 = JSON.parse(text1); /* console.debug(data1); */ } catch (e) { console.debug('getApp10CityBuildingCount parse error', e); }

		const resp2 = await fetch('controllers/buildingController.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ param: 'getApp10CityCameraDetails' }),
		});
		const text2 = await resp2.text();
		try { const data2 = JSON.parse(text2); /* console.debug(data2); */ } catch (e) { console.debug('getApp10CityCameraDetails parse error', e); }
	} catch (err) {
		console.error('getApp10Counts fetch error', err);
	}
}

function clearSearchAndSettingBox()
{
	toggleSearchBox(true);
	if($(".dropdown2-toggle").attr("src") == 'images/settings-active.png')
	{
		$(".dropdown2-toggle").attr("src", "images/settings.png");
		$('.dropdown2').removeClass('active');	
	}
	if($(".dropdown3-toggle").attr("src") == 'images/location_city-active.png')
	{
		$(".dropdown3-toggle").attr("src", "images/location_city.png");
		$('.dropdown3').removeClass('active');	
	}
	/*
	if($(".dropdownCam-toggle").attr("src") == 'images/pause-active.png')
	{
		$(".dropdownCam-toggle").attr("src", "images/360.png");
		$('.dropdownCam').removeClass('active');
	}
	*/
	/*
	if($("#panoButtonImageContainer").attr("src") == 'images/visibility-active.png')
	{
		TogglePanoRotationForBuilding();
	}
	*/
}

window.autoLoadCityCamera = false;
window.changingMarketWithinCity = false;
let lastToLastCity = null;
function loadMarket(val)
{
	devSelectedBuilding = '';
	$(".infoboxHeaderData").html("");
	$(".infoboxContainerData").html("");
	$(".company-logo-image").html("");
	listingCompanyFiltered = null;
	listingAgentFiltered = null;
	window.filterWithBuildingClassActive = false;
	window.buildingClassFiltered = null;

	window.changingVisualization = false;
	window.changingMarketWithinCity = false;

	clearAllEffects();
	//Different market = different submarkets, so drop any boundary outlines + name labels
	//left on the map from the previous market.
	if(typeof clearSubmarketBoundary == "function")
		clearSubmarketBoundary();
	marketBuildingDetails = [];
	if(window.reloadingAfterCrash == true)
	{
		initCesium2();
	}
	var previousMarketLoaded = lastMarketLoaded;
	lastMarketLoaded = val;
	triedAfterRetry = 0;
	setDropdownWidthClass();
		
	isCityLoadingInProgress = true;
	setTimeout(function (){ isCityLoadingInProgress = false; }, 5000);
	
	if (window.fixedOrbitInProgress)
	{
		StopFixedPointOrbit();
		window.fixedOrbitInProgress = false;
		//return;
	}
	
	window.lastFloor = null;
	$("#pano-view-li").hide();
	$(".full-screen-arrow").hide();
	if(window.limitUserArray.includes(parseInt(loggedInUserId)))
	{
		if([6, 7, 8].includes(lastMarketLoaded))
		{
			$("#NYCitymanagementDiv").css("display", "block");
		}
		else
		{
			$("#NYCitymanagementDiv").css("display", "none");
		}
	}
	else
	{
		$("#NYCitymanagementDiv").css("display", "none");
	}
	
	//Stop if Rotation is in progress.
	/* if (autoRotateSlow)//City Orbit
	{
		ToggleCameraRotationSlowly();
	} */
	if (IsEnableRotateAroundPoint)//Point Orbit
	{
		unsubscribeSPoint();
		camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		IsEnableRotateAroundPoint = false;
	}
	if (IsEnableRotateAroundBuilding)//Building Orbit
	{
		ToggleRotateAroundBuilding();
	}

	$.each(marketDetails, function (index, row){
		if(row.idtmarket == val)
		{
			mktDetail = row;
		}
	});
	//lastCityLoaded = mktDetail.idtcity;
	if(lastCityLoaded != mktDetail.idtcity)
	{
		showLoadingMessage(mktDetail.idtcity);
	}
	else
	{
		window.changingMarketWithinCity = true;
	}
	
	lastCityLoaded = mktDetail.idtcity;
	console.log("mktDetail.idtcity: "+mktDetail.idtcity);
	
	if(typeof citiesWithMultipleMarket[parseInt(mktDetail.idtcity)] != "undefined")
	{
		if(citiesWithMultipleMarket[parseInt(mktDetail.idtcity)].includes(parseInt(previousMarketLoaded)) && citiesWithMultipleMarket[parseInt(mktDetail.idtcity)].includes(parseInt(mktDetail.idtmarket)))
			window.changingMarketWithinCity = true;
		// Same market re-selected (e.g. clicked again from within the same
		// city) - leave the camera where it already is.
		if(parseInt(previousMarketLoaded) != parseInt(val) && (parseInt(lastToLastCity) != parseInt(mktDetail.idtcity) || lastToLastCity == null))
			flyToIdtcamera(mktDetail.marketcamera);
	}
	else if(parseInt(previousMarketLoaded) != parseInt(val))
	{
		flyToCitySkyline(mktDetail.idtcity)
	}
	
	lastToLastCity = parseInt(mktDetail.idtcity);
	/*
	if([1, 6].includes(parseInt(lastMarketLoaded)) && [1, 6].includes(parseInt(mktDetail.idtmarket)))
		window.changingMarketWithinCity = true;
	
	if([3, 5].includes(parseInt(lastMarketLoaded)) && [3, 5].includes(parseInt(mktDetail.idtmarket)))
		window.changingMarketWithinCity = true;
	*/
	
	if(window.changingMarketWithinCity)
	{
		clearPrimitives(false, true);
	}
	else
	{
		clearPrimitives();
		clearFogAndPrimitives();
	}
	
	if(typeof marketCameraDetails[mktDetail.marketcamera] != "undefined")
	{
		cameraAltitudeAdjustment = parseInt(mktDetail.altitudeadjustment);
	}
	//console.log("cameraAltitudeAdjustment: "+cameraAltitudeAdjustment);
	saveUserAccessDetails("",  $("#mainCityDropdown option:selected").text() + " - " + $("#marketDropdown option:selected").text());
	clearSearchAndSettingBox();
	var timeoutvalue = 0;
	if(stopRotateIfInProgress())
	{
		timeoutvalue = 1000;
	}
	setTimeout(function (){
		//console.log("Loading Market "+val);
		if(lastSelectedBuildingType == "AvailableOfficeSpace" || lastSelectedBuildingType == "OfficeRentalRates" )
		{
			lastSelectedBuildingType = "Office";
		}
		else if(lastSelectedBuildingType == "InvestmentSalesMarket")
		{
			if(marketsEnabledForInvestmentSales.includes(parseInt(val)))
			{
				lastSelectedBuildingType = "InvestmentSalesMarket";
			}
			else
			{
				lastSelectedBuildingType = "Office";
			}
		}
		
		if(parseInt(val) == 36 || parseInt(val) == 1 )//This is market
		{
			loadSydneyMarketDropdown("", parseInt(val), true);
		}
		else
		{
			loadSydneyMarketDropdown("", parseInt(val), false);
		}
		lastMarketLoaded = val;
		removeTerrain();
		//EnableFogInSelectedCity();//Removed this effect for now
		clearLastSelectedFunctions();
		$.each(marketDetails, function (index, eachMarket){
			if(eachMarket.idtmarket == val)
			{
				if(lastCityLoaded == eachMarket.idtcity)
				{
					//console.log("non Eed of Fog");
				}
				loadSubmarketDropdownFromMarketId(eachMarket.idtcity, eachMarket.idtmarket);
				setTimeout(function (){ getBuildingData(eachMarket); }, 200);
			}
		});
		/*
		if(val == "ArealyticSuites")
		{
			flyToCitySkyline(23);
			getSydneyArealyticsSuites();
		}
		else
		{
			clearSydneyArealyticsSuites();
		}
		*/
	}, timeoutvalue);
	
}

function setDropdownWidthClass()
{
	$(".dropdown3-menu").removeClass("dropdown3-menu-big-box");
	if([1, 4, 5, 6, 8, 31, 32, 37, 68, 69].includes(parseInt(lastCityLoaded)))
	{
		$(".dropdown3-menu").addClass("dropdown3-menu-big-box");
	}
}

var cityAreaMeasurementUnit = null;
var cityOfficeAARename = null;
var cityAreaMeasurementMultiplier = null;

function showLoadingMessage(cityLoaded)
{
	console.log("CITY LABEL: "+cityLabels[cityLoaded]);
	$(".defaultCityName").html(cityLabels[cityLoaded]);
	/*
	if(marketDetails.idtcity == 4)
	{
		if(typeof marketBuildingCount[lastMarketLoaded] != "undefined")
		{
			setLoadingMessage(marketBuildingCount[lastMarketLoaded], defaultMarketName[lastMarketLoaded]);
		}
	}
	else
	{
	}
	*/
	setLoadingMessage(cityLoaded, marketDetailsV2[lastMarketLoaded].smarketname, lastMarketLoaded);
	$(".loading-overlay").show();
}
window.startCountingMatchedToo = false;
window.limitUser = false;
window.limitUserArray = [93];
function getBuildingData(marketDetails, cameraChange = true)
{
	viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
	setTimeout(() => {
		viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
	}, 10000);
	isCityLoadingInProgress = true;
	setDropdownWidthClass();
	//$("#viewerController").show();
	$("#viewerController").css("display", "flex");
	$(".logoOverlay").show();
	if(typeof viewer == "undefined")
		return;
	if(lastToLastCity == null)
		lastToLastCity = marketDetails.idtcity;
	if(lastCityLoaded != marketDetails.idtcity)
	{
		console.log("CITY LABEL: "+cityLabels[marketDetails.idtcity]);
		$(".defaultCityName").html(cityLabels[marketDetails.idtcity]);
		/*
		if(marketDetails.idtcity == 4)
		{
			if(typeof marketBuildingCount[lastMarketLoaded] != "undefined")
			{
				setLoadingMessage(marketBuildingCount[lastMarketLoaded], defaultMarketName[lastMarketLoaded]);
			}
		}
		else
		{
			setLoadingMessage(cityBuildingCount[marketDetails.idtcity], marketDetailsV2[lastMarketLoaded].smarketname);
		}
		*/
		setLoadingMessage(marketDetails.idtcity, marketDetailsV2[lastMarketLoaded].smarketname, lastMarketLoaded);
		lastCityLoaded = marketDetails.idtcity;
		$(".loading-overlay").show();
		//$(".loading-overlay").fadeIn();
	}
	else
	{
		if([1, 6].includes(lastMarketLoaded) && [1, 6].includes(marketDetails.idtmarket))
		{
			cameraChange = true;
		}
		else
		{
			cameraChange = false;
		}
	}
	loadBuildingForAutoSuggest(marketDetails.idtmarket);
	window.startCountingMatchedToo = true;
	setTimeout(function (){ $(".loading-overlay").fadeOut(); console.log("Closing Overlay");}, 5000);
	/*
	//10/01
	if(typeof defaultCamera == "undefined" && typeof defaultCamera[0] == "undefined")
	{
		setTimeout(function (){ flyToCitySkyline(lastCityLoaded, 10); }, 4000);
	}
	*/
	//setTimeout(function (){ console.log("Timer Over!"); triedAfterRetry = 11; window.startCountingMatchedToo = false; }, 8000);
	$(".infoboxContainer").hide();  $("#infoboxFloorPlanRow").hide();
	window.lastSuite = null;
	viewer.entities.removeById("starRatingBox");
	cityAreaMeasurementUnit = "Sq Ft";
	cityAreaMeasurementMultiplier = 1;
	if(typeof marketDetails.areaunits != "undefined" && marketDetails.areaunits != null)
	{
		cityAreaMeasurementUnit = marketDetails.areaunits;
		if(marketDetails.areaunits == "sqm")
			cityAreaMeasurementMultiplier = 0.092903;
	}
	
	//Not for highlight, just load data.
	getAvailableOfficeSpace(false);
	
	console.log("CITY LABEL: "+cityLabels[parseInt(lastCityLoaded)]);
	$(".defaultCityName").html(cityLabels[parseInt(lastCityLoaded)]);
	if(typeof marketBuildingDetails[marketDetails.idtmarket] == "undefined" || lastSelectedBuildingType == "Floorplan")
	{
		//viewer.entities.removeById("FogEffectEntityPreload");
		/*
		if(typeof cityBoundaries[marketDetails.idtcity] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[marketDetails.idtcity]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		*/
		ShowSummaryInfobox();
		if(lastSelectedBuildingType == "InvestmentSalesMarket")//Calgary office sales data
		{
			//10/01
			//flyToCitySkyline(lastCityLoaded);
			lastCityLoaded = marketDetails.idtcity;
			lastMarketLoaded = marketDetails.idtmarket;
			getMarketSalesDataCalgary();
			ShowLegend();
		}
		else if(lastSelectedBuildingType == "AvailableOfficeSpace")//Sydney 
		{
			lastCityLoaded = marketDetails.idtcity;
			lastMarketLoaded = marketDetails.idtmarket;
			getSydneyArealyticsSuites("LeaseType");
			//createSummaryInfoboxForAvailableSpace();
			ShowLegend();
			//10/01
			//flyToCitySkyline(lastCityLoaded);
		}
		else if(lastSelectedBuildingType == "OfficeRentalRates")
		{
			lastCityLoaded = marketDetails.idtcity;
			lastMarketLoaded = marketDetails.idtmarket;
			getSydneyArealyticsSuites("OfficeRentalRates");
			ShowLegend();
			//10/01
			//flyToCitySkyline(lastCityLoaded);
			//createSummaryInfoboxForAvailableSpace();
		}
		else if(lastSelectedBuildingType == "Floorplan")
		{
			lastCityLoaded = marketDetails.idtcity;
			lastMarketLoaded = marketDetails.idtmarket;
			//10/01
			/*
			if(cameraChange)
				flyToCitySkyline(lastCityLoaded);
			*/
			/*
			getFloorPlansForCity(lastCityLoaded);
			EnableBottomPanoButton();
			*/
			getAvailableOfficeSpace();
			ShowLegend();
			//createSummaryInfoboxForAvailableSpace();
		}
		else
		{
			//Added this to solve issue with Vancouver altitude, But generic change.
			//10/01
			//flyToCitySkyline(lastCityLoaded);
			ShowSummaryInfobox();
			
			window.limitUser = false;
			$("#NYCitymanagementDiv").css("display", "none");
			if(window.limitUserArray.includes(parseInt(loggedInUserId)))
			{
				if(marketDetails.idtmarket == 7)
				{
					window.userSpecificSubmarketId.push(212);
					window.limitUser = true;
				}
				else if(marketDetails.idtmarket == 8)
				{
					window.userSpecificSubmarketId.push(29);
					window.limitUser = true;
				}
				else if(marketDetails.idtmarket == 9)
				{
					window.userSpecificSubmarketId.push(33);
					window.limitUser = true;
				}
				if(userSpecificSubmarketId.length > 0)
				{
					$(".temp-submarket").css("font-weight", "");
					$.each(window.userSpecificSubmarketId, function (innerLoop, ABC){
						$(".submarket-"+ABC).css("font-weight", "bold");
					})
					$("#NYCitymanagementDiv").css("display", "block");
				}
			}
			
			$.ajax({
				method: "POST",
				url: "controllers/buildingController.php",
				data: { param : "getAClassBuildings", idtmarket : marketDetails.idtmarket}
			})
			.done(function( data ) {
				////console.log(data);
				//console.log("Loading for Market : "+marketDetails.idtmarket);
				data = $.parseJSON( data );
				if(data.status == "success")
				{
					if(typeof data.data != "undefined")
					{
						marketBuildingDetails = [];
						marketBuildingDetails[marketDetails.idtmarket] = data.data;
						buildingFiles = data.buildingFiles;
						buildingClasses = data.buildingClasses;
						developmentBuildingDetails[marketDetails.idtmarket] = data.developmentBuildings;
						developmentBuildingFloors = data.developmentBuildingFloors;
						developmentBuildingSummary[marketDetails.idtmarket] = data.developmentSummary;
						allBuildingVisualizationSummary[marketDetails.idtmarket] = data.allBuildingVisualizationSummary;
						submarketDetails = data.submarketDetails;
						//console.log("submarketDetails", submarketDetails);
						summaryDetails[marketDetails.idtmarket] = data.summary;
						hotelSummaryDetails[marketDetails.idtmarket] = data.hotelSummary;
						if(typeof submarketSummaryDetails[marketDetails.idtcity] == "undefined")
							submarketSummaryDetails[marketDetails.idtcity] = {};
						submarketSummaryDetails[marketDetails.idtcity]["Office"] = data.submarketSummary;
						window.retailBuildingData = data.retailBuildingData;
						window.nonRetailBuildingData = data.nonRetailBuildingData;
						window.retailBuildingMap = data.retailBuildingMap;
						activeUnitDetails = data.activeUnitDetails;
						highlightAllBuildings(marketDetails.idtcity, marketDetails.idtmarket, cameraChange);
						loadSubmarketDropdown(marketDetails.idtcity);
					}
				}
				else
				{
					alert("Something went wrong");
				}
			});
		}
	}
	else
	{
		//10/01
		//flyToCitySkyline(lastCityLoaded);
		highlightAllBuildings(marketDetails.idtcity, marketDetails.idtmarket);
	}
}

window.activeUnitsEntities = [];
function highlightResiUnitsInBuilding(idtbldg)
{
	if($("#vacancyButton").hasClass("btn-secondary"))
	{
		//continue with highlight.
	}
	else
	{
		clearBuildingUnitsHighlighted();
		return;
	}
	
	$("#vacancyButton").removeClass("btn-secondary");
	$("#vacancyButton").addClass("btn-primary");
	
	effectsArray[8] = 1;
	if(typeof activeUnitDetails[idtbldg] != "undefined" )
	{
		clr = Cesium.Color.GREEN;
		lastFloorHeight = parseFloat(cameraAltitudeAdjustment);
		var calculatedFloorHeight = Math.round(parseInt(activeUnitDetails[idtbldg][0].altitude) / parseInt(activeUnitDetails[idtbldg][0].floors), 2);
		if(calculatedFloorHeight > 4 || calculatedFloorHeight < 2)
			calculatedFloorHeight = 4;
		$.each(activeUnitDetails[idtbldg], function (index, eachUnit){
			var extrudedHt = parseFloat(cameraAltitudeAdjustment) + parseFloat(calculatedFloorHeight * (eachUnit.floor_number-1));
			if(typeof eachUnit.floor_height != "undefined" && eachUnit.floor_height != null)
				calculatedFloorHeight = eachUnit.floor_height;
						const unitNums = parseCoords(eachUnit.coords);
						const unitCart = safeFromDegreesArray(unitNums);
						if (!unitCart) return;
						var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
								geometryInstances : new Cesium.GeometryInstance({
										geometry : new Cesium.PolygonGeometry({
											polygonHierarchy : new Cesium.PolygonHierarchy(
												unitCart
											),
											extrudedHeight: extrudedHt,
												height: extrudedHt + parseFloat(calculatedFloorHeight),
										}),
										attributes : {
												color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
												show : new Cesium.ShowGeometryInstanceAttribute(true)
										},
										id: "partialUnit-"+idtbldg+"-"+eachUnit.floor_number+"-"+index
								}),
								classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
						}));
			window.activeUnitsEntities.push(ent);
		});
	}
}

function clearBuildingUnitsHighlighted()
{
	$("#infoboxFloorPlanRow").html("");
	$("#vacancyButton").addClass("btn-secondary");
	$("#vacancyButton").removeClass("btn-primary");
	effectsArray[8] = 0;//ResiUnitsHighlight
	$.each(window.activeUnitsEntities, function (index, eachUnit){
		eachUnit.destroy();
	});
	window.activeUnitsEntities = [];
}

function loadSubmarketDropdownFromMarketId(idtcity, marketId)
{
	//console.log("in loadSubmarketDropdownFromMarketId() ");
	$.ajax({
		method: "POST",
		url: "controllers/buildingController.php",
		data: { param : "getSubmarketDetails", idtmarket : marketId}
	})
	.done(function( data ) {
		
		data = $.parseJSON( data );
		//console.log("response ", data);
		if(data.status == "success")
		{
			if(typeof data.data != "undefined")
			{
				window.submarketDetails = data.data;
				//console.log("submarketDetails", window.submarketDetails);
				loadSubmarketDropdown(idtcity);
			}
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function loadSubmarketDropdown(idtcity)
{
	////console.log(" in loadSubmarketDropdown() ");
	$(".dropdown3-menu").html("");
	$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="city-skyline-li" data-text="city-skyline" data-id="'+idtcity+'" href="#">City skyline</a></li>');
	$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="city-skyline2-li" data-text="city-skyline2" data-id="'+idtcity+'" href="#">City skyline 2</a></li>');
	if(typeof window.cityMarketRelationship[parseInt(idtcity)] != "undefined")
	{
		//Same markets, same order as the mainCityDropdownLabel dropdown for this city
		$.each(window.cityMarketRelationship[parseInt(idtcity)], function (index, eachMarket) {
			$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="market-view-'+eachMarket.idtmarket+'-li" data-text="market-view" data-id="'+eachMarket.marketcamera+'" href="#">'+eachMarket.smarketname+'</a></li>');
		});
	}

	//$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="city-submarket-tour-li" data-text="Submarket Max Building" data-id="'+submarketWithMaxBuilding[parseInt(lastMarketLoaded)].idtsubmarket+'" href="#">'+submarketWithMaxBuilding[parseInt(lastMarketLoaded)].ssubname+' Tour*</a></li>');
	if(typeof window.submarketDetails != "undefined" && window.submarketDetails.length > 0)
	{
		$.each(window.submarketDetails, function (index, eachRow) {
			$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="'+eachRow.ssubname.replace(' ', '-')+'-li" data-text="'+eachRow.ssubname.replace(' ', '-')+'" data-id="'+eachRow.idtsubmarket+'" href="#">'+eachRow.ssubname+'</a></li>');
		});
		//$(".dropdown3-menu").html(str);
	}
	////console.log("Dropdown created");
	window.skylineDropdownInitiated = false;
	initiateSkylineDropdown();
	setTimeout(function() { initiateSkylineDropdown() }, 1000);
}

function eventsToExecuteAfterLoadingData()
{
	if(flyToBuildingAfterSearch != null)
	{
		flyToBuildingCamera(flyToBuildingAfterSearch);
		ShowInfobox(flyToBuildingAfterSearch);
		flyToBuildingAfterSearch = null;
		setTimeout(function (){ 
			$(".summaryInfoboxContainerData").hide();
			$(".chevronIconContaier").removeClass("opened");
			$(".chevronIconContaier").addClass("closed");
			$(".chevronIconContaier").html('<img src="./images/Expand.png" style="margin-bottom: 2px;" width="40px" height="25px" onClick="toggleSummaryInfobox();"/>'); 
			
			if(typeof TempBldgData[devSelectedBuilding] != "undefined" && typeof TempBldgData[devSelectedBuilding].coords != "undefined")
				CreateDashedLine(devSelectedBuilding, TempBldgData[devSelectedBuilding].coords, ( cityAltitudeAdjustment[lastCityLoaded] + parseFloat(TempBldgData[devSelectedBuilding].basefloorheight) ), null);
	
			}, 2000);
		
	}
	if(window.autoLoadCityCamera)
	{
		window.autoLoadCityCamera = false;
		setTimeout(function (){ ToggleCameraRotationSlowly(); }, 2000);
	}
}

var distortionIndex = 1;
window.distortionIndexStep = 5;
function debugDistortion()
{
	window.lastHolesArray = [];
	viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");
	$.each(marketBuildingDetails[lastMarketLoaded], function (index, EachBuilding) {
		if(index <= distortionIndex && index > 100)
		{
			if(typeof EachBuilding != "undefined")
			{
				var proceedWithBuilding = false;
				if(lastSelectedBuildingType == "Office" && officeClasses.includes(EachBuilding.buildingclass))
				{
					proceedWithBuilding = true;
				}
				else if(lastSelectedBuildingType == "Residential" && residentialClasses.includes(EachBuilding.buildingclass))
				{
					proceedWithBuilding = true;
				}
				else if(lastSelectedBuildingType == "Hotel" && hotelClassesLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				if(proceedWithBuilding)
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					
					if(distortionIndex - index <= 5)
					{
						////console.log("id: "+EachBuilding.idtbuilding);
					}
					////console.log("Bldg " + EachBuilding.idtbuilding);
					const nums = parseCoords(EachBuilding.coords);
					const cart = safeFromDegreesArray(nums);
					if (cart) {
						window.lastHolesArray.push({ positions: cart });
					}
				}
			}
		}
	});
	distortionIndex = distortionIndex + window.distortionIndexStep;
	////console.log(window.lastHolesString);
	if (typeof cityBoundaries[parseInt(lastCityLoaded)] !== 'undefined') {
		const cityNums = parseCoords(cityBoundaries[parseInt(lastCityLoaded)]);
		const cityCart = safeFromDegreesArray(cityNums);
		const holes = window.lastHolesArray.map(h => ({ positions: h.positions }));
		viewer.entities.add({
			id: 'FogEffectEntity',
			polygon: {
				hierarchy: { positions: cityCart, holes: holes },
				material: Cesium.Color[getDarkOverlayColor()]?.withAlpha(0.5),
				classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
			},
		});
	}
}

var primitiveCollection = [];
var devBuildingFloorPrimitives = [];
var lastCityLoaded = null;
var lastMarketLoaded = null;
var TempBldgData = [];
var TempPointsData = [];
var searchBuildingData = [];

window.buildingToSkipForHoles = [];//[748, 1087, 4550, 4551, 1281];
window.buildingToHighlight = [2306, 2307, 2308];

function tryClosingPolygon(coordsToClose)
{
	const nums = parseCoords(coordsToClose);
	if (!nums) return coordsToClose;
	const len = nums.length;
	if (nums[0] !== nums[len - 2] || nums[1] !== nums[len - 1]) {
		return coordsToClose + ', ' + nums[0] + ', ' + nums[1];
	}
	return coordsToClose;
}

function addBuildingToSkip()
{
	buildingToSkipForHoles.push(parseInt(devSelectedBuilding));
	loadNewBuildingTypeView("Office");
}

function keepPolygonOpen(coordsToClose)
{
	const nums = parseCoords(coordsToClose);
	if (!nums) return coordsToClose;
	const len = nums.length;
	if (nums[0] === nums[len - 2] && nums[1] === nums[len - 1]) {
		nums.pop();
		nums.pop();
		return nums.toString();
	}
	return coordsToClose;
}

function newLogicCheckForFogSkip(id)
{
	var goForFog = false;
	$.each(window.retailBuildingMap, function (index, allRows){
		if(typeof allRows != "undefined" && typeof allRows != "undefined")
		{
			$.each(allRows.buildings, function (i2, j2){
				if(goForFog == false)
				{
					/////console.log(parseInt(j2.idtbuilding)+" == "+id+" || "+parseInt(allRows.idtbuilding)+" == "+id);
					if(parseInt(j2.idtbuilding) == id || parseInt(allRows.idtbuilding) == id)
					{
						////console.log(allRows.class+" != "+j2.class);
						if(allRows.class != j2.class)
							goForFog = true;
						
					}
				}
			});
		}
	});
	return goForFog;
}

window.retailEntities = [];
window.developmentBuildingFloorEntity = [];
window.devBuildingHighlightEntity = [];
window.TempPointsData = [];
window.TempBuildingPrimitives = [];
developmentBuildingFloorEntityForDev3 = [];
buildingMask = [];
scaledPolygonList = [];

window.limitStart = 0;
window.limitLength = 500;
window.currentLimit = 0;
window.userSpecificSubmarketId = [];
function reloadHighlight(id)
{
	if(window.userSpecificSubmarketId.includes(id))
	{
		temp = [];
		$.each(userSpecificSubmarketId, function (eachRow, id2){
			if(id2 != id)
				temp.push(id2);
		});
		window.userSpecificSubmarketId  = temp;
	}
	else
	{
		window.userSpecificSubmarketId.push(id);
	}
	$(".temp-submarket").css("font-weight", "");
	highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
	$.each(userSpecificSubmarketId, function (eachRow, id){
		$(".submarket-"+id).css("font-weight", "bold");
	});
}

window.marketCoords = [];
/* 
//Torronto
window.marketCoords[3] = '[-79.49093338571947, 43.54247201205126, -79.57558858683318, 43.69630340096864, -79.34519665349166, 43.74993201419262, -79.25176307439135, 43.626815236211684]';
//Midtown Manhattan
window.marketCoords[8] = '[-73.96121315967382, 40.69288041117762, -74.07280131021427, 40.748462388511726, -74.00149316845521, 40.844691927026545, -73.847207027215, 40.77688906675466]';
window.marketCoords[9] = '[-74.05413754217595, 40.806809511398335, -73.88350135921611, 40.731298976602055, -73.96121931450696, 40.63320816636364, -74.16635250682663, 40.695608057821694]'; */
window.debuggingMarketCoords = false;
window.changingVisualization = false;

function highlightAllBuildings_BAK(idtcity, marketId, cameraChange = true, retainBuildingInfobox = false)
{
	cameraAltitudeAdjustment = cityAltitudeAdjustment[idtcity];
	//viewer.scene.screenSpaceCameraController.minimumZoomDistance = cameraAltitudeAdjustment;
	//console.log("setting new cameraAltitudeAdjustment "+cameraAltitudeAdjustment);
	clearPrimitives();
	//$(".infoboxContainer").hide();  $("#infoboxFloorPlanRow").hide();
	if(window.changingVisualization)
	{
		if(typeof marketBoundaries[lastMarketLoaded] != "undefined")
		{
			updateFogHoles([]);
		}
		/*
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		*/
	}
		
	lastMarketLoaded = marketId;
	lastCityLoaded = idtcity;
	
	updateURL();
	ShowLegend();
	if(!retainBuildingInfobox)
		ShowSummaryInfobox();
	else
		ShowInfobox(devSelectedBuilding);
	//highlight
	window.lastHolesString = "";
	window.lastHolesArray  = [];
	// *** FIX 3: accumulate into an array, join once at the end ***
	const holesFragments = [];

	TempBldgData = [];
	if( lastSelectedBuildingType == "Development" )
	{
		$.each(developmentBuildingDetails[marketId], function (index, EachBuilding) {
			console.log(EachBuilding);
			var clr = classColorCoding[EachBuilding.tstatus];
			var borderClr = classColorCoding[EachBuilding.tstatus];
			clr.alpha = 0.5;
			borderClr.alpha = 0.1;
			if (lastCityLoaded == "53") {
			  lastFloorHeight = -2;
			  groundHeight = 3;
			} else if (lastCityLoaded == "12") {
			  lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
			  groundHeight = cityAltitudeAdjustment[lastCityLoaded];
			  if (EachBuilding.idtbuilding == 11283) {
				groundHeight += 20;
				lastFloorHeight += 20;
			  }
			  if (EachBuilding.idtbuilding == 17928) {
				groundHeight -= 8;
				lastFloorHeight -= 8;
			  }
			} else {
			  lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded] + 5;
			  groundHeight = cityAltitudeAdjustment[lastCityLoaded] + 5;
			}
			if (
			  EachBuilding.buildingfloorheight != null &&
			  parseFloat(EachBuilding.buildingfloorheight) > 0
			) {
			  floorHeight = parseFloat(EachBuilding.buildingfloorheight);
			} else if (
			  EachBuilding.floor_height != null &&
			  parseFloat(EachBuilding.floor_height) > 0
			) {
			  floorHeight = parseFloat(EachBuilding.floor_height);
			}
			var floorCoord;
			var topEntityId;
			var baseFloorHeight;
			$.each(
			  developmentBuildingFloors[[EachBuilding.idtbuilding]],
			  function (i2, eachFloor) {
				clr.alpha = 0.5;
				var loopFloorHt = floorHeight;
				baseFloorHeight = floorHeight;

				if (loopFloorHt > 0) {
				  var entityId =
					"dev3Floors-" +
					EachBuilding.idtbuilding +
					"-" +
					index +
					"-" +
					eachFloor.number;
				  var entityFId =
					"dev3FFloors-" +
					EachBuilding.idtbuilding +
					"-" +
					index +
					"-" +
					eachFloor.number;
				  topEntityId =
					"dev3TopFloors-" +
					EachBuilding.idtbuilding +
					"-" +
					index +
					"-" +
					EachBuilding.sbuildingname;
				  floorCoord = EachBuilding.coords;
				  var ent2 = viewer.entities.add({
					id: entityFId,
					polygon: {
						hierarchy: safeFromDegreesArray(parseCoords(EachBuilding.coords)),
					  extrudedHeight: lastFloorHeight + loopFloorHt,
					  height: lastFloorHeight,
											material: borderClr,
					  //closeTop: false,
					  //closeBottom: false,
					},
					properties: {
					  coord: EachBuilding.coords,
					  floorHeight: lastFloorHeight,
					  clr: borderClr,
					  baseFloorHeight: baseFloorHeight,
					},
				  });
				  developmentBuildingFloorEntityForDev3.push(entityFId);
				  lastFloorHeight = lastFloorHeight + loopFloorHt;
				}
			  }
			);
			clr.alpha = 1;
			var ent = viewer.entities.add({
			  id: topEntityId,
						polygon: {
								hierarchy: safeFromDegreesArray(parseCoords(floorCoord)),
				//extrudedHeight: lastFloorHeight + baseFloorHeight + 1,
				height: lastFloorHeight,
								material: clr,
			  },
			  properties: {
				coord: floorCoord,
				floorHeight: lastFloorHeight,
			  },
			});
			developmentBuildingFloorEntityForDev3.push(topEntityId);
			var coordArr = floorCoord.split(",");
			var originalPositions = [];
			var topFloorMask = [];
			for (var i = 0; i < coordArr.length - 1; i = i + 2) {
			  originalPositions.push(
				Cesium.Cartesian3.fromDegrees(
				  parseFloat(coordArr[i]),
				  parseFloat(coordArr[i + 1])
				)
			  );
			  topFloorMask.push(parseFloat(coordArr[i]));
			  topFloorMask.push(parseFloat(coordArr[i + 1]));
			  topFloorMask.push(lastFloorHeight);
			  var mask = viewer.entities.add({
				name: "maskLine",
				polyline: {
				  positions: Cesium.Cartesian3.fromDegreesArrayHeights([
					parseFloat(coordArr[i]),
					parseFloat(coordArr[i + 1]),
					groundHeight,
					parseFloat(coordArr[i]),
					parseFloat(coordArr[i + 1]),
					lastFloorHeight, // point 2
				  ]),
				  width: 5,
				  material: eval(clr),
				},
			  });
			  buildingMask.push(mask);
			}
			topFloorMask.push(parseFloat(coordArr[0]));
			topFloorMask.push(parseFloat(coordArr[1]));
			topFloorMask.push(lastFloorHeight);
			/* var mask = viewer.entities.add({
			  name: "maskLine",
			  polyline: {
				positions: Cesium.Cartesian3.fromDegreesArrayHeights(topFloorMask),
				width: 5,
				material: eval(clr),
			  },
			});
			buildingMask.push(mask); */
			const scaleFactor = Math.sqrt(0.2);
			applyScale(
			  scaleFactor,
			  originalPositions,
			  groundHeight,
			  lastFloorHeight + 1,
			  clr
			);
		  });
		  
	}
	else if( lastSelectedBuildingType == "Development_OLD" )
	{
		$.each(developmentBuildingDetails[marketId], function (index, EachBuilding) {
			
			var clr = classColorCoding[EachBuilding.tstatus];
			clr.alpha = 0.5;
			lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
			if(EachBuilding.buildingfloorheight != null && parseFloat(EachBuilding.buildingfloorheight) > 0)
			{
				floorHeight = parseFloat(EachBuilding.buildingfloorheight);
			}
			else if(EachBuilding.floor_height != null && parseFloat(EachBuilding.floor_height) > 0)
			{
				floorHeight = parseFloat(EachBuilding.floor_height);
			}
			$.each(developmentBuildingFloors[EachBuilding.idtbuilding], function (i2, eachFloor) {
				if(clr.alpha == 0.6)
					clr.alpha = 0.4;
				else
					clr.alpha = 0.6;
				clr.alpha = 1;
				var loopFloorHt = floorHeight;
				
				/*
				if(eachFloor.floor_height != null && parseFloat(eachFloor.floor_height) > 0)
				{
					loopFloorHt = parseFloat(eachFloor.floor_height);
				}
				*/
				if(loopFloorHt > 0)
				{
					var entityId = "devFloors-"+EachBuilding.idtbuilding+"-"+index+"-"+eachFloor.number;
					if(typeof window.devBuildingHighlightEntity[EachBuilding.idtbuilding] == "undefined")
					{
						window.devBuildingHighlightEntity[EachBuilding.idtbuilding] = [];
					}
					window.devBuildingHighlightEntity[EachBuilding.idtbuilding].push(entityId);
					//console.log(entityId+" => "+lastFloorHeight+"  ====> "+loopFloorHt);
					var ent = viewer.entities.add({
					  id: entityId,
					  polygon: {
						hierarchy: safeFromDegreesArray(parseCoords(EachBuilding.coords)),
						extrudedHeight: lastFloorHeight + loopFloorHt,
						height: lastFloorHeight,
						material: clr,
					  },
					});
					
					/*
					lastFloorHeight = lastFloorHeight + loopFloorHt;
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + loopFloorHt,
							}),
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: "devFloors-"+EachBuilding.idtbuilding+"-"+index+"-"+eachFloor.number
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					*/
					window.developmentBuildingFloorEntity.push(entityId);
					lastFloorHeight = lastFloorHeight + loopFloorHt;
				}
			});
			
			/*
			devBuildingFloorPrimitives.push(viewer.entities.add({
			  id: "development-"+EachBuilding.idtbuilding+"-"+index,
			  polygon: {
				hierarchy: safeFromDegreesArray(parseCoords(EachBuilding.coords)),
				extrudedHeight: cityAltitudeAdjustment[lastCityLoaded],
				height: (parseInt(EachBuilding.floors) * 4) + parseInt(cityAltitudeAdjustment[lastCityLoaded]),
				material: clr,
				closeTop: true,
				outline: true,
				closeBottom: true,
			  },
			}));
			*/
		});
	}
	else
	{
		$.each(marketBuildingDetails[parseInt(marketId)], function (index, EachBuilding) {
			if(typeof EachBuilding != "undefined")// && index > 100 && index < 110)
			{
				var proceedWithBuilding = false;
				if((lastSelectedBuildingType == "Office" || lastSelectedBuildingType == "All") && officeClasses.includes(EachBuilding.buildingclass))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Residential" || lastSelectedBuildingType == "All") && residentialClasses.includes(EachBuilding.buildingclass))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Hotel" || lastSelectedBuildingType == "All") && hotelClassesLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Gov" || lastSelectedBuildingType == "All") && govClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Retail" || lastSelectedBuildingType == "All") && retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				else if(lastSelectedBuildingType == "All" && (emsClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || educationalClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || healthcareClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || parkadesClassLower.includes(EachBuilding.buildingclass.toLowerCase())))
				{
					proceedWithBuilding = true;
				}
				
				if(window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding)))
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					proceedWithBuilding = false;
				}
				
				if(limitUser == true && !userSpecificSubmarketId.includes(parseInt(EachBuilding.idtsubmarket)))
					proceedWithBuilding = false;
				//if(window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding)))
				//	proceedWithBuilding = false;
				
				if(proceedWithBuilding && typeof window.retailBuildingData[EachBuilding.idtbuilding] != "undefined" && lastSelectedBuildingType == "All" && !retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					////console.log("Not Retail", EachBuilding);
					//searchBuildingData.push({id: EachBuilding.idtbuilding, name: EachBuilding.sbuildingname, address: EachBuilding.address, index: index, entityIndex : primitiveCollection.length});
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					//var tt = EachBuilding.coords.split(",");
					//TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					if(lastSelectedBuildingType == "All" && window.retailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: parseCoords(EachBuilding.coords) });
					var clr = classColorCoding[EachBuilding.buildingclass];
					var lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
					if(EachBuilding.basefloorheight != null)
						lastFloorHeight += parseFloat(EachBuilding.basefloorheight);
					
					var floorHt = 0;
					if(EachBuilding.floor_height != null)
					{
						floorHt = EachBuilding.floor_height;
					}
					else if(EachBuilding.buildingfloorheight)
					{
						floorHt = EachBuilding.buildingfloorheight;
					}
					
					var skipFromBottom = parseInt(window.retailBuildingData[EachBuilding.idtbuilding].max_retail_floor_number) * parseFloat(floorHt);
					lastFloorHeight += skipFromBottom;
					
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
									safeFromDegreesArray(parseCoords(EachBuilding.coords))
								),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + 1000,
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: "officeEntity-"+EachBuilding.idtbuilding
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					window.retailEntities.push(ent);
				}
				else if(proceedWithBuilding && typeof window.retailBuildingData[EachBuilding.idtbuilding] != "undefined" && retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					////console.log( "Retail Builing Data ", EachBuilding );
					//searchBuildingData.push({id: EachBuilding.idtbuilding, name: EachBuilding.sbuildingname, address: EachBuilding.address, index: index, entityIndex : primitiveCollection.length});
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					//var tt = EachBuilding.coords.split(",");
					//TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					if(lastSelectedBuildingType == "All" && window.retailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: parseCoords(EachBuilding.coords) });
					var clr = classColorCoding[EachBuilding.buildingclass];
					var lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
					if(EachBuilding.basefloorheight != null)
						lastFloorHeight += parseFloat(EachBuilding.basefloorheight);
					
					var floorHt = 0;
					if(EachBuilding.floor_height != null)
					{
						floorHt = EachBuilding.floor_height;
					}
					else if(EachBuilding.buildingfloorheight)
					{
						floorHt = EachBuilding.buildingfloorheight;
					}
					
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
								polygonHierarchy : new Cesium.PolygonHierarchy(
								safeFromDegreesArray(parseCoords(EachBuilding.coords))
							),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + ( parseInt(EachBuilding.floors) * parseFloat(floorHt) ),
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: "retailEntity-"+EachBuilding.idtbuilding
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					window.retailEntities.push(ent);
				}
				else if(proceedWithBuilding && typeof window.nonRetailBuildingData[EachBuilding.idtbuilding] != "undefined")
				{
					////console.log( "Non Retail Builing Data ", EachBuilding );
					//searchBuildingData.push({id: EachBuilding.idtbuilding, name: EachBuilding.sbuildingname, address: EachBuilding.address, index: index, entityIndex : primitiveCollection.length});
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					//var tt = EachBuilding.coords.split(",");
					//TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					if(lastSelectedBuildingType == "All" && window.nonRetailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					if(newLogicCheckForFogSkip(EachBuilding.idtbuilding) && lastSelectedBuildingType != "All")
					{
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					}
					window.lastHolesArray.push({"id": EachBuilding.idtbuilding, "coords": eval("["+EachBuilding.coords+"]")});
					var clr = classColorCoding[EachBuilding.buildingclass];
					var lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
					if(EachBuilding.basefloorheight != null)
						lastFloorHeight += parseFloat(EachBuilding.basefloorheight);
					
					var floorHt = 0;
					if(EachBuilding.floor_height != null)
					{
						floorHt = EachBuilding.floor_height;
					}
					else if(EachBuilding.buildingfloorheight)
					{
						floorHt = EachBuilding.buildingfloorheight;
					}
					
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + ( parseInt(EachBuilding.floors) * parseFloat(floorHt) ),
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: "retailEntity-"+EachBuilding.idtbuilding
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					window.retailEntities.push(ent);
				}
				else if(proceedWithBuilding )
				{
					////console.log(EachBuilding.idtbuilding);
					//searchBuildingData.push({id: EachBuilding.idtbuilding, name: EachBuilding.sbuildingname, address: EachBuilding.address, index: index, entityIndex : primitiveCollection.length});
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					//var tt = EachBuilding.coords.split(",");
					//TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					////console.log("Bldg " + EachBuilding.idtbuilding+" => "+tryClosingPolygon(EachBuilding.coords));
					window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					window.lastHolesArray.push({"id": EachBuilding.idtbuilding, "coords": eval("["+EachBuilding.coords+"]")});
					
					var clr = classColorCoding[EachBuilding.buildingclass];
					if( typeof devSelectedBuilding != "undefined" && parseInt(devSelectedBuilding) == parseInt(EachBuilding.idtbuilding) )
					{
						clr.alpha = 0.7;
					}
					else
					{
						clr.alpha = 0.5;
					}
					
					if(window.debuggingMarketCoords)
					{
						var t = eval("["+EachBuilding.coords+"]");
						viewer.entities.add({
						  id: "green-cylinder-"+EachBuilding.idtbuilding,
						  position: Cesium.Cartesian3.fromDegrees(t[0], t[1], 1000.0),
						  cylinder: {
							length: 400000.0,
							topRadius: 20.0,
							bottomRadius: 20.0,
							material: Cesium.Color.GREEN,
						  },
						});	
					}
					////console.log(EachBuilding.idtbuilding);//console.log(EachBuilding.coords);
					var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  height : -100,
                              extrudedHeight : 3000
							}),
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id : "bldg-"+EachBuilding.idtbuilding+"-"+index,
						}),
						asynchronous: false,
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
					}));
					
					if( typeof devSelectedBuilding != "undefined" && parseInt(devSelectedBuilding) == parseInt(EachBuilding.idtbuilding) )
					{
						selectedPrimitive = ent;
						selectedPrimitiveId = "bldg-"+EachBuilding.idtbuilding+"-"+index;
						/*
						var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
						//console.log(attributes.color);
						if(typeof attributes != "undefined")
						{
							selectedPrimitiveColor = attributes.color;
						}
						*/
						ShowInfobox(parseInt(devSelectedBuilding), index);
						if(lastSelectedBuildingType == 'Hotel')
						{
							createStarRatingIcon(EachBuilding.idtbuilding);
						}
					}
					
					primitiveCollection.push(ent);
					
					if(lastBuildingSolidFloorHighlighted == EachBuilding.idtbuilding)
					{
						ShowInfobox(lastBuildingSolidFloorHighlighted, index);
						lastBuildingSolidFloorHighlighted = null;
					}
				}
			
				//window.TempBuildingPrimitives.push(ent);
			}
		});
	}
		setTimeout(function (){ setPrimitiveColorLogic(); }, 500);
	
	
	////console.log("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[idtcity]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	
	//console.log(" window.lastHolesArray ");
	//console.log(window.lastHolesArray);
	handleFogAfterHighlight();
		///CHANGE HERE
		//console.log(window.lastHolesString);
	//viewer.entities.removeById("FogEffectEntityPreload");
	//10/01
	/*
	if(cameraChange)
		flyToCitySkyline(idtcity);
	*/
	
	eventsToExecuteAfterLoadingData();
	//console.log("All Finished!");
}

function highlightAllBuildings(idtcity, marketId, cameraChange = true, retainBuildingInfobox = false)
{
	cameraAltitudeAdjustment = cityAltitudeAdjustment[idtcity];
																						   
																				 
	clearPrimitives();
																	
	if(window.changingVisualization)
	{
		if(typeof marketBoundaries[lastMarketLoaded] != "undefined")
		{
			updateFogHoles([]);
		}
	}
		
	lastMarketLoaded = marketId;
	lastCityLoaded = idtcity;
	
	updateURL();
	ShowLegend();
	if(!retainBuildingInfobox)
		ShowSummaryInfobox();
	else
		ShowInfobox(devSelectedBuilding);

	window.lastHolesString = "";
	window.lastHolesArray  = [];
	const holesFragments = [];   // ← accumulate here, join once at end

	const retailHighlightedBuildingsTill = [];

	TempBldgData = [];
	if( lastSelectedBuildingType == "Development" )
	{
		$.each(developmentBuildingDetails[marketId], function (index, EachBuilding) {
			console.log(EachBuilding);
			var clr = classColorCoding[EachBuilding.tstatus];
			var borderClr = classColorCoding[EachBuilding.tstatus];
			clr.alpha = 0.5;
			borderClr.alpha = 0.1;
			if (lastCityLoaded == "53") {
			  lastFloorHeight = -2;
			  groundHeight = 3;
			} else if (lastCityLoaded == "12") {
			  lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
			  groundHeight = cityAltitudeAdjustment[lastCityLoaded];
			  if (EachBuilding.idtbuilding == 11283) {
				groundHeight += 20;
				lastFloorHeight += 20;
			  }
			  if (EachBuilding.idtbuilding == 17928) {
				groundHeight -= 8;
				lastFloorHeight -= 8;
			  }
			} else {
				lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded] ;
				if(EachBuilding.basefloorheight != null)
					lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded] + parseFloat(EachBuilding.basefloorheight);
			  groundHeight = cityAltitudeAdjustment[lastCityLoaded] + 5;
			}
			if (
			  EachBuilding.buildingfloorheight != null &&
			  parseFloat(EachBuilding.buildingfloorheight) > 0
			) {
			  floorHeight = parseFloat(EachBuilding.buildingfloorheight);
			} else if (
			  EachBuilding.floor_height != null &&
			  parseFloat(EachBuilding.floor_height) > 0
			) {
			  floorHeight = parseFloat(EachBuilding.floor_height);
			}
			var floorCoord;
			var topEntityId;
			var baseFloorHeight;
			$.each(
			  developmentBuildingFloors[EachBuilding.idtbuilding],
			  function (i2, eachFloor) {
				clr.alpha = 0.5;
				var loopFloorHt = floorHeight;
				baseFloorHeight = floorHeight;

				if (loopFloorHt > 0) {
				  var entityId =
					"dev3Floors-" +
					EachBuilding.idtbuilding +
					"-" +
					index +
					"-" +
					eachFloor.number;
				  var entityFId =
					"dev3FFloors-" +
					EachBuilding.idtbuilding +
					"-" +
					index +
					"-" +
					eachFloor.number;
				  topEntityId =
					"dev3TopFloors-" +
					EachBuilding.idtbuilding +
					"-" +
					index +
					"-" +
					EachBuilding.sbuildingname;
				  floorCoord = EachBuilding.coords;
				  var ent2 = viewer.entities.add({
					id: entityFId,
					polygon: {
						hierarchy: safeFromDegreesArray(parseCoords(EachBuilding.coords)),
					  extrudedHeight: lastFloorHeight + loopFloorHt,
					  height: lastFloorHeight,
											material: borderClr,
					  //closeTop: false,
					  //closeBottom: false,
					},
					properties: {
					  coord: EachBuilding.coords,
					  floorHeight: lastFloorHeight,
					  clr: borderClr,
					  baseFloorHeight: baseFloorHeight,
					},
				  });
				  developmentBuildingFloorEntityForDev3.push(entityFId);
				  lastFloorHeight = lastFloorHeight + loopFloorHt;
				}
			  }
			);
			clr.alpha = 1;
			var ent = viewer.entities.add({
			  id: topEntityId,
						polygon: {
								hierarchy: safeFromDegreesArray(parseCoords(floorCoord)),
				//extrudedHeight: lastFloorHeight + baseFloorHeight + 1,
				height: lastFloorHeight,
								material: clr,
			  },
			  properties: {
				coord: floorCoord,
				floorHeight: lastFloorHeight,
			  },
			});
			developmentBuildingFloorEntityForDev3.push(topEntityId);
			var coordArr = floorCoord.split(",");
			var originalPositions = [];
			var topFloorMask = [];
			for (var i = 0; i < coordArr.length - 1; i = i + 2) {
			  originalPositions.push(
				Cesium.Cartesian3.fromDegrees(
				  parseFloat(coordArr[i]),
				  parseFloat(coordArr[i + 1])
				)
			  );
			  topFloorMask.push(parseFloat(coordArr[i]));
			  topFloorMask.push(parseFloat(coordArr[i + 1]));
			  topFloorMask.push(lastFloorHeight);
			  var mask = viewer.entities.add({
				name: "maskLine",
				polyline: {
				  positions: Cesium.Cartesian3.fromDegreesArrayHeights([
					parseFloat(coordArr[i]),
					parseFloat(coordArr[i + 1]),
					groundHeight,
					parseFloat(coordArr[i]),
					parseFloat(coordArr[i + 1]),
					lastFloorHeight, // point 2
				  ]),
				  width: 5,
				  material: eval(clr),
				},
			  });
			  buildingMask.push(mask);
			}
			topFloorMask.push(parseFloat(coordArr[0]));
			topFloorMask.push(parseFloat(coordArr[1]));
			topFloorMask.push(lastFloorHeight);
			/* var mask = viewer.entities.add({
			  name: "maskLine",
			  polyline: {
				positions: Cesium.Cartesian3.fromDegreesArrayHeights(topFloorMask),
				width: 5,
				material: eval(clr),
			  },
			});
			buildingMask.push(mask); */
			const scaleFactor = Math.sqrt(0.2);
			applyScale(
			  scaleFactor,
			  originalPositions,
			  groundHeight,
			  lastFloorHeight + 1,
			  clr
			);
		  });
		  
	}
	else if( lastSelectedBuildingType == "Development_OLD" )
	{
		$.each(developmentBuildingDetails[marketId], function (index, EachBuilding) {
			
			var clr = classColorCoding[EachBuilding.tstatus];
			clr.alpha = 0.5;
			lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
			if(EachBuilding.buildingfloorheight != null && parseFloat(EachBuilding.buildingfloorheight) > 0)
			{
				floorHeight = parseFloat(EachBuilding.buildingfloorheight);
			}
			else if(EachBuilding.floor_height != null && parseFloat(EachBuilding.floor_height) > 0)
			{
				floorHeight = parseFloat(EachBuilding.floor_height);
			}
			$.each(developmentBuildingFloors[EachBuilding.idtbuilding], function (i2, eachFloor) {
				if(clr.alpha == 0.6)
					clr.alpha = 0.4;
				else
					clr.alpha = 0.6;
				clr.alpha = 1;
				var loopFloorHt = floorHeight;
				
				/*
				if(eachFloor.floor_height != null && parseFloat(eachFloor.floor_height) > 0)
				{
					loopFloorHt = parseFloat(eachFloor.floor_height);
				}
				*/
				if(loopFloorHt > 0)
				{
					var entityId = "devFloors-"+EachBuilding.idtbuilding+"-"+index+"-"+eachFloor.number;
					if(typeof window.devBuildingHighlightEntity[EachBuilding.idtbuilding] == "undefined")
					{
						window.devBuildingHighlightEntity[EachBuilding.idtbuilding] = [];
					}
					window.devBuildingHighlightEntity[EachBuilding.idtbuilding].push(entityId);
					//console.log(entityId+" => "+lastFloorHeight+"  ====> "+loopFloorHt);
					var ent = viewer.entities.add({
					  id: entityId,
					  polygon: {
						hierarchy: safeFromDegreesArray(parseCoords(EachBuilding.coords)),
						extrudedHeight: lastFloorHeight + loopFloorHt,
						height: lastFloorHeight,
						material: clr,
					  },
					});
					
					/*
					lastFloorHeight = lastFloorHeight + loopFloorHt;
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + loopFloorHt,
							}),
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: "devFloors-"+EachBuilding.idtbuilding+"-"+index+"-"+eachFloor.number
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					*/
					window.developmentBuildingFloorEntity.push(entityId);
					lastFloorHeight = lastFloorHeight + loopFloorHt;
				}
			});
			
			/*
			devBuildingFloorPrimitives.push(viewer.entities.add({
			  id: "development-"+EachBuilding.idtbuilding+"-"+index,
			  polygon: {
				hierarchy: safeFromDegreesArray(parseCoords(EachBuilding.coords)),
				extrudedHeight: cityAltitudeAdjustment[lastCityLoaded],
				height: (parseInt(EachBuilding.floors) * 4) + parseInt(cityAltitudeAdjustment[lastCityLoaded]),
				material: clr,
				closeTop: true,
				outline: true,
				closeBottom: true,
			  },
			}));
			*/
		});
	}
	else
	{
		$.each(marketBuildingDetails[parseInt(marketId)], function (index, EachBuilding) {
			if(typeof EachBuilding != "undefined")
			{
				var proceedWithBuilding = false;
				if((lastSelectedBuildingType == "Office" || lastSelectedBuildingType == "All") && officeClasses.includes(EachBuilding.buildingclass))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Residential" || lastSelectedBuildingType == "All") && residentialClasses.includes(EachBuilding.buildingclass))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Hotel" || lastSelectedBuildingType == "All") && hotelClassesLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Gov" || lastSelectedBuildingType == "All") && govClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				else if((lastSelectedBuildingType == "Retail" || lastSelectedBuildingType == "All") && retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				else if(lastSelectedBuildingType == "All" && (emsClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || educationalClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || healthcareClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || parkadesClassLower.includes(EachBuilding.buildingclass.toLowerCase())))
				{
					proceedWithBuilding = true;
				}
				
				if(window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding)))
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					proceedWithBuilding = false;
				}
				
				if(limitUser == true && !userSpecificSubmarketId.includes(parseInt(EachBuilding.idtsubmarket)))
					proceedWithBuilding = false;
				//if(window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding)))
				//	proceedWithBuilding = false;
	
				var clr = classColorCoding[EachBuilding.buildingclass];
				if( typeof devSelectedBuilding != "undefined" && parseInt(devSelectedBuilding) == parseInt(EachBuilding.idtbuilding) )
				{
					clr.alpha = 0.7;
				}
				else
				{
					clr.alpha = 0.5;
				}
				var dimmedByPropertyManagerFilter = (window.filterWithPropertyManagerActive == true && parseInt(EachBuilding.idtpropertymanager) != parseInt(window.propertyManagerFiltered));
				//Class filter (clicking the Class badge in the infobox) dims every non-matching building the
				//same way the property-manager filter does. Folded into the same variable so the four
				//!dimmedByPropertyManagerFilter fog-hole guards below cover it too.
				if(window.filterWithBuildingClassActive == true && !buildingMatchesClassFilter(EachBuilding.buildingclass, window.buildingClassFiltered))
					dimmedByPropertyManagerFilter = true;
				if(dimmedByPropertyManagerFilter)
				{
					clr.alpha = 0.05;
				}
				entityIdNew = "";
				if(proceedWithBuilding && typeof window.retailBuildingData[EachBuilding.idtbuilding] != "undefined" && lastSelectedBuildingType == "All" && !retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					if(!dimmedByPropertyManagerFilter)
					{
						if(lastSelectedBuildingType == "All" && window.retailBuildingData[
						EachBuilding.idtbuilding].skip_fog != 1)
							holesFragments.push('{ positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]) }');
						window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: parseCoords(EachBuilding.coords) });
					}
					var lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
					if(EachBuilding.basefloorheight != null)
						lastFloorHeight += parseFloat(EachBuilding.basefloorheight);
					
					var floorHt = 0;
					if(EachBuilding.floor_height != null)
					{
						floorHt = EachBuilding.floor_height;
					}
					else if(EachBuilding.buildingfloorheight)
					{
						floorHt = EachBuilding.buildingfloorheight;
					}
					
					var skipFromBottom = parseInt(window.retailBuildingData[EachBuilding.idtbuilding].max_retail_floor_number) * parseFloat(floorHt);
					lastFloorHeight += skipFromBottom;
					entityIdNew = "officeEntity-"+EachBuilding.idtbuilding;
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
									safeFromDegreesArray(parseCoords(EachBuilding.coords))
								),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + 1000,
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: entityIdNew
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					window.retailEntities.push(ent);
				}
				else if(proceedWithBuilding && typeof window.retailBuildingData[EachBuilding.idtbuilding] != "undefined" && retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					if(!dimmedByPropertyManagerFilter)
					{
						if(lastSelectedBuildingType == "All" && window.retailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
							holesFragments.push('{ positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]) }');
						window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: parseCoords(EachBuilding.coords) });
					}
					var lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
					if(EachBuilding.basefloorheight != null)
						lastFloorHeight += parseFloat(EachBuilding.basefloorheight);
					
					var floorHt = 0;
					if(EachBuilding.floor_height != null)
					{
						floorHt = EachBuilding.floor_height;
					}
					else if(EachBuilding.buildingfloorheight)
					{
						floorHt = EachBuilding.buildingfloorheight;
					}
					//retailHighlightedBuildingsTill
					entityIdNew = "retailEntity-"+EachBuilding.idtbuilding;
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
								polygonHierarchy : new Cesium.PolygonHierarchy(
								safeFromDegreesArray(parseCoords(EachBuilding.coords))
							),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + ( parseInt(EachBuilding.floors) * parseFloat(floorHt) ),
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: entityIdNew
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					window.retailEntities.push(ent);
				}
				else if(proceedWithBuilding && typeof window.nonRetailBuildingData[EachBuilding.idtbuilding] != "undefined")
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					if(!dimmedByPropertyManagerFilter)
					{
						if(lastSelectedBuildingType == "All" && window.nonRetailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
							holesFragments.push('{ positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]) }');
						if(newLogicCheckForFogSkip(EachBuilding.idtbuilding) && lastSelectedBuildingType != "All")
						{

							holesFragments.push('{ positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]) }');
						}
						window.lastHolesArray.push({"id": EachBuilding.idtbuilding, "coords": eval("["+EachBuilding.coords+"]")});
					}
					var lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
					if(EachBuilding.basefloorheight != null)
						lastFloorHeight += parseFloat(EachBuilding.basefloorheight);
					
					var floorHt = 0;
					if(EachBuilding.floor_height != null)
					{
						floorHt = EachBuilding.floor_height;
					}
					else if(EachBuilding.buildingfloorheight)
					{
						floorHt = EachBuilding.buildingfloorheight;
					}
					
					entityIdNew = "retailEntity-"+EachBuilding.idtbuilding;
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + ( parseInt(EachBuilding.floors) * parseFloat(floorHt) ),
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id: entityIdNew
						}),
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
					}));
					window.retailEntities.push(ent);
				}
				else if(proceedWithBuilding)
				{
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					if(!dimmedByPropertyManagerFilter)
					{
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
						holesFragments.push('{ positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]) }');
						window.lastHolesArray.push({"id": EachBuilding.idtbuilding, "coords": eval("["+EachBuilding.coords+"]")});
					}
					
					if(window.debuggingMarketCoords)
					{
						var t = eval("["+EachBuilding.coords+"]");
						viewer.entities.add({
						  id: "green-cylinder-"+EachBuilding.idtbuilding,
						  position: Cesium.Cartesian3.fromDegrees(t[0], t[1], 1000.0),
						  cylinder: {
							length: 400000.0,
							topRadius: 20.0,
							bottomRadius: 20.0,
							material: Cesium.Color.GREEN,
						  },
						});	
					}
					////console.log(EachBuilding.idtbuilding);//console.log(EachBuilding.coords);
					entityIdNew = "bldg-"+EachBuilding.idtbuilding+"-"+index;
					var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  height : -100,
                              extrudedHeight : 3000
							}),
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id : entityIdNew
						}),
						asynchronous: false,
						classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
					}));
					
					primitiveCollection.push(ent);
					
					if(lastBuildingSolidFloorHighlighted == EachBuilding.idtbuilding)
					{
						ShowInfobox(lastBuildingSolidFloorHighlighted, index);
						lastBuildingSolidFloorHighlighted = null;
					}
				}
				
				
				if( typeof devSelectedBuilding != "undefined" && parseInt(devSelectedBuilding) == parseInt(EachBuilding.idtbuilding) )
				{
					selectedPrimitive = ent;
					selectedPrimitiveId = entityIdNew;
					/*
					var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
					//console.log(attributes.color);
					if(typeof attributes != "undefined")
					{
						selectedPrimitiveColor = attributes.color;
					}
					*/
					ShowInfobox(parseInt(devSelectedBuilding), index);
					if(lastSelectedBuildingType == 'Hotel')
					{
						createStarRatingIcon(EachBuilding.idtbuilding);
					}
				}
				if(typeof defaultBuilding != "undefined" && defaultBuilding != null && defaultBuilding == EachBuilding.idtbuilding)
				{
					defaultBuilding = null;
				}
			}
		});
	}

	// *** FIX 3: join all fragments once here instead of concatenating per building ***
 
	window.lastHolesString = holesFragments.join(', ');
	//console.log(holesFragments);
	window.backupHolesString = window.lastHolesString;

	setTimeout(function (){ setPrimitiveColorLogic(); }, 500);
									  
	handleFogAfterHighlight();
	eventsToExecuteAfterLoadingData();
								
}

/**
 * PERFORMANCE OPTIMIZATIONS APPLIED:
 *
 * 1. Replaced all eval() with safe alternatives (JSON.parse / coord parsers)
 * 2. Batched ClassificationPrimitive geometry into GeometryInstance arrays —
 *    one primitive.add() per type instead of one per building (biggest win)
 * 3. Replaced window.lastHolesString concatenation with an array + single join
 * 4. Cloned color objects before mutating alpha (fixes shared-state bug too)
 * 5. Cached repeated lookups (cityAltitudeAdjustment, classColorCoding) outside loops
 * 6. Moved coord parsing into a single utility (parseCoords) — no repeated splits
 * 7. Used a single GeometryInstance batch for groundPrimitives (standard buildings)
 * 8. Development floors: kept per-entity model but eliminated redundant re-parses
 */

// ---------------------------------------------------------------------------
// Utility: parse a flat "lon,lat,lon,lat,..." coord string without eval()
// Returns null if the string is unusable (odd count, NaN, < 6 values).
// ---------------------------------------------------------------------------
function parseCoords(coordStr) {
  if (!coordStr || typeof coordStr !== "string") return null;
  // Strip any trailing comma/whitespace so split doesn't produce an empty
  // last element that maps to NaN
  const nums = coordStr.trim().replace(/,\s*$/, "").split(",").map(Number);
  // Must have an even number of values and at least 3 pairs (a triangle)
  if (nums.length < 6 || nums.length % 2 !== 0) return null;
  // Reject any NaN — a single bad token would crash fromDegreesArray
  if (nums.some(isNaN)) return null;
  return nums;
}

// ---------------------------------------------------------------------------
// Utility: safe wrapper around Cesium.Cartesian3.fromDegreesArray
// Returns null instead of throwing on bad input.
// ---------------------------------------------------------------------------
function safeFromDegreesArray(nums) {
  if (!nums) return null;
  try {
    return Cesium.Cartesian3.fromDegreesArray(nums);
  } catch (e) {
    console.warn("safeFromDegreesArray failed:", e, nums);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Utility: clone a Cesium Color so mutations don't affect the shared cache
// ---------------------------------------------------------------------------
function cloneColor(clr) {
  return new Cesium.Color(clr.red, clr.green, clr.blue, clr.alpha);
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------
function highlightAllBuildings_IMPROVED(idtcity, marketId, cameraChange = true, retainBuildingInfobox = false) {
  const altAdj = cityAltitudeAdjustment[idtcity];

  clearPrimitives();

  if (window.changingVisualization) {
    if (typeof marketBoundaries[lastMarketLoaded] !== "undefined") {
      updateFogHoles([]);
    }
  }

  lastMarketLoaded = marketId;
  lastCityLoaded   = idtcity;

  updateURL();
  ShowLegend();
  if (!retainBuildingInfobox) {
    ShowSummaryInfobox();
  } else {
    ShowInfobox(devSelectedBuilding);
  }

  window.lastHolesString = "";
  // *** FIX 3: accumulate into an array, join once at the end ***
  const holesFragments = [];
  TempBldgData = [];

  // =========================================================================
  // BRANCH: Development (new "Dev3" rendering)
  // =========================================================================
  if (lastSelectedBuildingType === "Development") {
    $.each(developmentBuildingDetails[marketId], function (index, EachBuilding) {
      // *** FIX 4: clone colors — never mutate the shared cache ***
      const clr       = cloneColor(classColorCoding[EachBuilding.tstatus]);
      const borderClr = cloneColor(classColorCoding[EachBuilding.tstatus]);
      clr.alpha       = 0.5;
      borderClr.alpha = 0.1;

      // Determine ground / floor heights for this city
	  // NOTE: loose == is deliberate here - lastCityLoaded/idtbuilding come from mysqli (strings) in some
      // code paths and from parseInt() (numbers) in others, so a strict === silently never matched and
      // these per-city/per-building corrections never applied, leaving those buildings' floors floating.
      let lastFloorHeight, groundHeight;
      if (lastCityLoaded == "53") {
        lastFloorHeight = -2;
        groundHeight    = 3;
      } else if (lastCityLoaded == "12") {
        lastFloorHeight = altAdj;
        groundHeight    = altAdj;
        if (EachBuilding.idtbuilding == 11283) { groundHeight += 20; lastFloorHeight += 20; }
        if (EachBuilding.idtbuilding == 17928) { groundHeight -= 8;  lastFloorHeight -= 8;  }
      } else {
        lastFloorHeight = altAdj + 5;
        groundHeight    = altAdj + 5;
      }

      // Resolve per-building floor height
      let floorHeight = 0;
      if (EachBuilding.buildingfloorheight != null && parseFloat(EachBuilding.buildingfloorheight) > 0) {
        floorHeight = parseFloat(EachBuilding.buildingfloorheight);
      } else if (EachBuilding.floor_height != null && parseFloat(EachBuilding.floor_height) > 0) {
        floorHeight = parseFloat(EachBuilding.floor_height);
      }

      // *** FIX 1: parse coords once, reuse — skip building if coords are bad ***
      const coordNums  = parseCoords(EachBuilding.coords);
      const coordCart3 = safeFromDegreesArray(coordNums);
      if (!coordCart3) {
        console.warn("Dev3: skipping building with bad coords", EachBuilding.idtbuilding, EachBuilding.coords);
        return; // $.each callback — continues to next building
      }

      let floorCoord   = EachBuilding.coords;
      let topEntityId;
      let baseFloorHeight;

      $.each(developmentBuildingFloors[EachBuilding.idtbuilding], function (i2, eachFloor) {
        const loopFloorHt = floorHeight;
        baseFloorHeight   = floorHeight;
        clr.alpha = 0.5;

        if (loopFloorHt > 0) {
          const entityId  = `dev3Floors-${EachBuilding.idtbuilding}-${index}-${eachFloor.number}`;
          const entityFId = `dev3FFloors-${EachBuilding.idtbuilding}-${index}-${eachFloor.number}`;
          topEntityId = `dev3TopFloors-${EachBuilding.idtbuilding}-${index}-${EachBuilding.sbuildingname}`;

          viewer.entities.add({
            id: entityFId,
            polygon: {
              hierarchy:      coordCart3,
              extrudedHeight: lastFloorHeight + loopFloorHt,
              height:         lastFloorHeight,
              material:       borderClr.clone(), // clone so Cesium doesn't share the ref
            },
            properties: {
              coord:           EachBuilding.coords,
              floorHeight:     lastFloorHeight,
              clr:             borderClr,
              baseFloorHeight: baseFloorHeight,
            },
          });
          developmentBuildingFloorEntityForDev3.push(entityFId);
          lastFloorHeight += loopFloorHt;
        }
      });

      clr.alpha = 1;
      viewer.entities.add({
        id: topEntityId,
        polygon: {
          hierarchy: coordCart3,
          height:    lastFloorHeight,
          material:  clr.clone(),
        },
        properties: {
          coord:       floorCoord,
          floorHeight: lastFloorHeight,
        },
      });
      developmentBuildingFloorEntityForDev3.push(topEntityId);

      // Build mask lines
      const coordArr         = floorCoord.split(",");
      const originalPositions = [];
      const topFloorMask     = [];

      for (let i = 0; i < coordArr.length - 1; i += 2) {
        const lon = parseFloat(coordArr[i]);
        const lat = parseFloat(coordArr[i + 1]);
        originalPositions.push(Cesium.Cartesian3.fromDegrees(lon, lat));
        topFloorMask.push(lon, lat, lastFloorHeight);

        const mask = viewer.entities.add({
          name: "maskLine",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              lon, lat, groundHeight,
              lon, lat, lastFloorHeight,
            ]),
            width:    5,
            material: clr.clone(),
          },
        });
        buildingMask.push(mask);
      }
      topFloorMask.push(parseFloat(coordArr[0]), parseFloat(coordArr[1]), lastFloorHeight);

      applyScale(Math.sqrt(0.2), originalPositions, groundHeight, lastFloorHeight + 1, clr);
    });

  // =========================================================================
  // BRANCH: Development_OLD
  // =========================================================================
  } else if (lastSelectedBuildingType === "Development_OLD") {
    $.each(developmentBuildingDetails[marketId], function (index, EachBuilding) {
      // *** FIX 4: clone color ***
      const clr = cloneColor(classColorCoding[EachBuilding.tstatus]);

      let lastFloorHeight = altAdj;
      let floorHeight = 0;
      if (EachBuilding.buildingfloorheight != null && parseFloat(EachBuilding.buildingfloorheight) > 0) {
        floorHeight = parseFloat(EachBuilding.buildingfloorheight);
      } else if (EachBuilding.floor_height != null && parseFloat(EachBuilding.floor_height) > 0) {
        floorHeight = parseFloat(EachBuilding.floor_height);
      }

      // *** FIX 1: parse once — skip if bad ***
      const coordNumsOld  = parseCoords(EachBuilding.coords);
      const coordCart3    = safeFromDegreesArray(coordNumsOld);
      if (!coordCart3) {
        console.warn("Dev_OLD: skipping building with bad coords", EachBuilding.idtbuilding, EachBuilding.coords);
        return;
      }

      $.each(developmentBuildingFloors[EachBuilding.idtbuilding], function (i2, eachFloor) {
        clr.alpha = 1;
        const loopFloorHt = floorHeight;
        if (loopFloorHt > 0) {
          const entityId = `devFloors-${EachBuilding.idtbuilding}-${index}-${eachFloor.number}`;
          if (typeof window.devBuildingHighlightEntity[EachBuilding.idtbuilding] === "undefined") {
            window.devBuildingHighlightEntity[EachBuilding.idtbuilding] = [];
          }
          window.devBuildingHighlightEntity[EachBuilding.idtbuilding].push(entityId);

          viewer.entities.add({
            id: entityId,
            polygon: {
              hierarchy:      coordCart3,
              extrudedHeight: lastFloorHeight + loopFloorHt,
              height:         lastFloorHeight,
              material:       clr.clone(),
            },
          });

          window.developmentBuildingFloorEntity.push(entityId);
          lastFloorHeight += loopFloorHt;
        }
      });
    });

  // =========================================================================
  // BRANCH: Standard buildings (Office / Residential / Hotel / Retail / etc.)
  // =========================================================================
  } else {
    // Batch geometry instances by color key so every ClassificationPrimitive
    // receives instances that share the same color (Cesium requirement).
    // Key format:  "r,g,b,a"  — typically ~5-10 unique keys across all buildings.
    const groundByColor = new Map(); // colorKey → [{instance, buildingId, index, isSelected}]
    const retailByColor = new Map(); // colorKey → [GeometryInstance]

    
    const buildings = marketBuildingDetails[parseInt(marketId)];

    for (let index = 0; index < buildings.length; index++) {
      const EachBuilding = buildings[index];
      if (typeof EachBuilding === "undefined") continue;

      // --- filter by type ---
      let proceedWithBuilding = false;
      const bClass    = EachBuilding.buildingclass;
      const bClassLow = bClass.toLowerCase();

      if ((lastSelectedBuildingType === "Office"      || lastSelectedBuildingType === "All") && officeClasses.includes(bClass))           proceedWithBuilding = true;
      if ((lastSelectedBuildingType === "Residential" || lastSelectedBuildingType === "All") && residentialClasses.includes(bClass))      proceedWithBuilding = true;
      if ((lastSelectedBuildingType === "Hotel"       || lastSelectedBuildingType === "All") && hotelClassesLower.includes(bClassLow))    proceedWithBuilding = true;
      if ((lastSelectedBuildingType === "Gov"         || lastSelectedBuildingType === "All") && govClassLower.includes(bClassLow))        proceedWithBuilding = true;
      if ((lastSelectedBuildingType === "Retail"      || lastSelectedBuildingType === "All") && retailClassLower.includes(bClassLow))     proceedWithBuilding = true;
      if (lastSelectedBuildingType === "All" && (
        emsClassLower.includes(bClassLow)         ||
        educationalClassLower.includes(bClassLow) ||
        healthcareClassLower.includes(bClassLow)  ||
        parkadesClassLower.includes(bClassLow)
      )) proceedWithBuilding = true;

      if (window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding))) {
        TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
        proceedWithBuilding = false;
      }

      if (limitUser && !userSpecificSubmarketId.includes(parseInt(EachBuilding.idtsubmarket))) {
        proceedWithBuilding = false;
      }

      if (!proceedWithBuilding) continue;

      // *** FIX 1: parse coords once per building — skip if bad ***
      const coordNums  = parseCoords(EachBuilding.coords);
      const coordCart3 = safeFromDegreesArray(coordNums);
      if (!coordCart3) {
        console.warn("Standard: skipping building with bad coords", EachBuilding.idtbuilding, EachBuilding.coords);
        continue;
      }

      // *** FIX 4: clone color ***
      const clr = cloneColor(classColorCoding[bClass]);

      // Shared floor height setup
      let lastFloorHeight = altAdj;
      if (EachBuilding.basefloorheight != null) lastFloorHeight += parseFloat(EachBuilding.basefloorheight);

      let floorHt = 0;
      if (EachBuilding.floor_height != null)          floorHt = parseFloat(EachBuilding.floor_height);
      else if (EachBuilding.buildingfloorheight)       floorHt = parseFloat(EachBuilding.buildingfloorheight);

      // --- Retail / non-retail with special per-floor data ---
      const hasRetailData    = typeof window.retailBuildingData[EachBuilding.idtbuilding]    !== "undefined";
      const hasNonRetailData = typeof window.nonRetailBuildingData[EachBuilding.idtbuilding] !== "undefined";

      if (hasRetailData && lastSelectedBuildingType === "All" && !retailClassLower.includes(bClassLow)) {
        // Mixed-use: colour only above the retail floors
        TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
        if (window.retailBuildingData[EachBuilding.idtbuilding].skip_fog !== 1) {
          holesFragments.push(`{ positions: Cesium.Cartesian3.fromDegreesArray([ ${tryClosingPolygon(EachBuilding.coords)} ]), }`);
        }
        window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: coordNums });

        const skipFromBottom = parseInt(window.retailBuildingData[EachBuilding.idtbuilding].max_retail_floor_number) * floorHt;
        lastFloorHeight += skipFromBottom;

        pushToMap(retailByColor, colorKey(clr), new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(coordCart3),
            height:           lastFloorHeight,
            extrudedHeight:   lastFloorHeight + 1000,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
            show:  new Cesium.ShowGeometryInstanceAttribute(true),
          },
          id: `officeEntity-${EachBuilding.idtbuilding}`,
        }));

      } else if (hasRetailData && retailClassLower.includes(bClassLow)) {
        TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
        if (window.retailBuildingData[EachBuilding.idtbuilding].skip_fog !== 1) {
          holesFragments.push(`{ positions: Cesium.Cartesian3.fromDegreesArray([ ${tryClosingPolygon(EachBuilding.coords)} ]), }`);
        }
        window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: coordNums });

        pushToMap(retailByColor, colorKey(clr), new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(coordCart3),
            extrudedHeight:   lastFloorHeight,
            height:           lastFloorHeight + parseInt(EachBuilding.floors) * floorHt,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
            show:  new Cesium.ShowGeometryInstanceAttribute(true),
          },
          id: `retailEntity-${EachBuilding.idtbuilding}`,
        }));

      } else if (hasNonRetailData) {
        TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
        if (window.nonRetailBuildingData[EachBuilding.idtbuilding].skip_fog !== 1) {
          holesFragments.push(`{ positions: Cesium.Cartesian3.fromDegreesArray([ ${tryClosingPolygon(EachBuilding.coords)} ]), }`);
        }
        if (newLogicCheckForFogSkip(EachBuilding.idtbuilding) && lastSelectedBuildingType !== "All") {
          holesFragments.push(`{ positions: Cesium.Cartesian3.fromDegreesArray([ ${tryClosingPolygon(EachBuilding.coords)} ]), }`);
        }
        window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: coordNums });

        pushToMap(retailByColor, colorKey(clr), new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(coordCart3),
            extrudedHeight:   lastFloorHeight,
            height:           lastFloorHeight + parseInt(EachBuilding.floors) * floorHt,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
            show:  new Cesium.ShowGeometryInstanceAttribute(true),
          },
          id: `retailEntity-${EachBuilding.idtbuilding}`,
        }));

      } else {
        // Standard building → ground primitive (batched)
        TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
        holesFragments.push(`{ positions: Cesium.Cartesian3.fromDegreesArray([ ${tryClosingPolygon(EachBuilding.coords)} ]), }`);
        window.lastHolesArray.push({ id: EachBuilding.idtbuilding, coords: coordNums });

        // Selected building gets slightly higher alpha
        const isSelected = typeof devSelectedBuilding !== "undefined" &&
                           parseInt(devSelectedBuilding) === parseInt(EachBuilding.idtbuilding);
        const instanceClr = clr.clone();
        instanceClr.alpha = isSelected ? 0.7 : 0.5;

        if (window.debuggingMarketCoords) {
          viewer.entities.add({
            id:       `green-cylinder-${EachBuilding.idtbuilding}`,
            position: Cesium.Cartesian3.fromDegrees(coordNums[0], coordNums[1], 1000.0),
            cylinder: {
              length:       400000.0,
              topRadius:    20.0,
              bottomRadius: 20.0,
              material:     Cesium.Color.GREEN,
            },
          });
        }

        const instanceId = `bldg-${EachBuilding.idtbuilding}-${index}`;
        const ck = colorKey(instanceClr);
        pushToMap(groundByColor, ck, {
          instance: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(coordCart3),
              height:           -100,
              extrudedHeight:   3000,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(instanceClr),
              show:  new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: instanceId,
          }),
          buildingId: EachBuilding.idtbuilding,
          index:      index,
          isSelected: isSelected,
        });

        if (lastBuildingSolidFloorHighlighted === EachBuilding.idtbuilding) {
          ShowInfobox(lastBuildingSolidFloorHighlighted, index);
          lastBuildingSolidFloorHighlighted = null;
        }
      }
    } // end for

    // Flush ground primitives — one ClassificationPrimitive per unique color.
    // Each batch shares a single color so Cesium's constraint is satisfied.
    for (const [, group] of groundByColor) {
      const batchedPrimitive = viewer.scene.groundPrimitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances:  group.map(g => g.instance),
          asynchronous:       false,
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
      );
      primitiveCollection.push(batchedPrimitive);

      for (const g of group) {
        if (g.isSelected) {
          selectedPrimitive   = batchedPrimitive;
          selectedPrimitiveId = `bldg-${g.buildingId}-${g.index}`;
          ShowInfobox(parseInt(devSelectedBuilding), g.index);
          if (lastSelectedBuildingType === "Hotel") {
            createStarRatingIcon(g.buildingId);
          }
        }
      }
    }

    // Flush retail/non-retail scene primitives — one ClassificationPrimitive per unique color.
    for (const [, group] of retailByColor) {
      const batchedRetail = viewer.scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances:  group,
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
      );
      window.retailEntities.push(batchedRetail);
    }

    // *** FIX 3: join once instead of O(n²) concatenation ***
    window.lastHolesString = holesFragments.join(" ");
  }

  setTimeout(() => setPrimitiveColorLogic(), 500);

  handleFogAfterHighlight();
  eventsToExecuteAfterLoadingData();
}

function colorKey(clr) {
  // Round to 3 dp to avoid float noise creating spurious unique keys
  return `${clr.red.toFixed(3)},${clr.green.toFixed(3)},${clr.blue.toFixed(3)},${clr.alpha.toFixed(3)}`;
}
function pushToMap(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function updateFogHoles(newHoles = []) {
  const entity = viewer.entities.getById('FogEffectEntity');
  if (!entity?.polygon) return;

  const currentHierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());

  entity.polygon.hierarchy = new Cesium.PolygonHierarchy(
    currentHierarchy.positions,
    newHoles  // empty array = no holes, renders as solid fog polygon
  );
  console.log("Done!!");
}

function addInstancesToGroundPrimitives(instances)
{
	/*
	for (var i = 0; i < polygons.length; i++) {

		instances.push(
			new Cesium.GeometryInstance({
				id: polygons[i].id,   // your custom ID
				geometry: new Cesium.PolygonGeometry({
					polygonHierarchy: polygons[i].hierarchy,
					perPositionHeight: false
				}),
				attributes: {
					color: Cesium.ColorGeometryInstanceAttribute.fromColor(
						Cesium.Color.RED
					)
				}
			})
		);

	}
	*/

	viewer.scene.groundPrimitives.add(
		new Cesium.GroundPrimitive({
			geometryInstances: instances
		})
	);
}

function applyScale(scaleFactor, positions, gHeight, exHeight, clr) {
  var bldgHeight = exHeight - gHeight;
  clr.alpha = 1.0;
  const scaled = scalePolygon(positions, scaleFactor);
  var scaledPolygon = viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(scaled),
      material: eval(clr),
      extrudedHeight: exHeight,
      height: gHeight,
    },
  });
  scaledPolygonList.push(scaledPolygon);
}

function RemoveEntitiesByType(entities) {
  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    viewer.entities.remove(entity);
  }
}

function RemoveEntitiesByID(entities) {
  for (var i = 0; i < entities.length; i++) {
    viewer.entities.remove(entities[i]);
  }
}

function scalePolygon(positions, scaleFactor) {
  if (positions.length < 3) return positions;

  //Stable centroid with no drift
  const bs = Cesium.BoundingSphere.fromPoints(positions);
  const centroid = bs.center;

  // Local ENU coordinate frame
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(centroid);
  const inv = Cesium.Matrix4.inverse(transform, new Cesium.Matrix4());

  // Convert to ENU coordinates
  const localPositions = positions.map((pos) =>
    Cesium.Matrix4.multiplyByPoint(inv, pos, new Cesium.Cartesian3())
  );

  // Scale X/Y only (Z unchanged → stable altitude)
  const scaledLocal = localPositions.map(
    (lp) =>
      new Cesium.Cartesian3(
        lp.x * scaleFactor,
        lp.y * scaleFactor,
        lp.z // do NOT scale z!
      )
  );

  // Convert back to world coordinates
  return scaledLocal.map((lp) =>
    Cesium.Matrix4.multiplyByPoint(transform, lp, new Cesium.Cartesian3())
  );
}

function computeCentroid(cartesians) {
  let sumLat = 0,
    sumLon = 0,
    sumHeight = 0;

  cartesians.forEach((cart) => {
    const c = Cesium.Cartographic.fromCartesian(cart);
    sumLat += c.latitude;
    sumLon += c.longitude;
    sumHeight += c.height;
  });

  // Cesium.Cartographic(longitude, latitude, height) - longitude comes first.
  return new Cesium.Cartographic(
    sumLon / cartesians.length,
    sumLat / cartesians.length,
    sumHeight / cartesians.length
  );
}

function createStarRatingIcon(idtbldg)
{
	return ;
	viewer.entities.removeById("starRatingBox");
	if(!isNaN(TempBldgData[idtbldg].star_rating) && TempBldgData[idtbldg].star_rating != null)
	{
		heightString = (parseInt(TempBldgData[idtbldg].floors) * 3) + 20 + cameraAltitudeAdjustment;
		if(parseInt(TempBldgData[idtbldg].calculatedMaxHeight) > 0)
		{
			heightString = parseInt(TempBldgData[idtbldg].calculatedMaxHeight) + cameraAltitudeAdjustment;
		}
		
		var lonString = TempBldgData[idtbldg].longitude;
		var latString = TempBldgData[idtbldg].latitude;
		if(typeof defaultCamera[6] != "undefined")
		{
			lonString = defaultCamera[6];
			latString = defaultCamera[7];
		}
		
		var useCompressed = "";
		//console.log("./images/"+parseInt(TempBldgData[idtbldg].star_rating)+"star"+useCompressed+".png"); // default: undefined
		viewer.entities.add({
			id: "starRatingBox",
			position: Cesium.Cartesian3.fromDegrees(lonString, latString, heightString),
			billboard: {
			  image: "./images/"+parseInt(TempBldgData[idtbldg].star_rating)+"star"+useCompressed+".png", // default: undefined
			  show: true, // default
			  //pixelOffset: new Cesium.Cartesian2(0, -50), // default: (0, 0)
			  //eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
			  horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
			  verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
			  scale: 2.0, // default: 1.0
			  /*HeightReference : RELATIVE_TO_3D_TILE,*/
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
}

function setPrimitiveColorLogic()
{
	if(selectedPrimitive != null && selectedPrimitiveId != null)
	{
		var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
		if(typeof attributes != "undefined")
		{
			//console.log(attributes.color);
			selectedPrimitiveColor = attributes.color;
			selectedPrimitiveColor[3] = 127;
		}
	}
	executeDefaultEffectsAndCamera();
	checkEffectsClass();
	updateURL();
}

function executeDefaultEffectsAndCamera()
{
	//Check for Effects
	/*
	window.effectsArray[0] = 0;//Isolate
	window.effectsArray[1] = 0;//Spotlight
	window.effectsArray[2] = 0;//Highlight
	window.effectsArray[3] = 0;//Suites
	window.effectsArray[4] = 0;//Floors
	window.effectsArray[5] = 0;//Assets
	*/
	var delay = 1000;
	if(googleTileset == null)
	{
		delay = 3000;
	}
	
	console.log("In executeDefaultEffectsAndCamera();");
	console.log(defaultEffects);
	
	setTimeout(function () {
		if(typeof defaultEffects != "undefined")
		{
			var atleastOneEffectActive = false;
			$.each(defaultEffects, function (index, effectValue){
				if(effectValue == true || effectValue == 1 )
				{
					switch(index)
					{
						case 0://Isolate Dark
							handleEffectClick("IsolateOnDark");
							//createIsolateOnDarkEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("isolateWithDarkButton", true);
						break;
						case 1://Spotlight
							handleEffectClick("Spotlight");
							//createSpotlightEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("spotlightButton2", true);
						break;
						case 2://Highlight
							handleEffectClick("Highlight");
							//createApp6HighlightEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("newHighlightButton2", true);
						break;
						case 3://Suites
						
						break;
						case 4://Floors
							handleEffectClick("Floors");
							//createFloorsEffect(devSelectedBuilding);
							//$("#highlightButton").addClass("btn-primary");
							//$("#highlightButton").removeClass("btn-secondary");
						break;
						case 5://FloorPlans
							handleEffectClick("Files");
							//createBuildingAssets(devSelectedBuilding);
							//$("#assetButton").addClass("btn-primary");
							//$("#assetButton").removeClass("btn-secondary");
						break;
						case 6://Isolate Satellite
							handleEffectClick("Isolate");
							//createIsolateSatelliteEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("isolateSatelliteButton2", true);
						break;
						case 7://Floor Plan
							handleEffectClick("Floorplans");
							//getDataForFloorPlan(devSelectedBuilding);
							setResetTickForEffectsButtons("floorplanButton", true);
						break;
						case 8://Clip Effect
							clipEffectActive = true;
							var timeToWait = 1000;
							if(typeof googleTileset != "undefined")
							{
								timeToWait = 0;
							}
							setTimeout(function (){
								//createClipEffect(devSelectedBuilding);
								handleEffectClick("Clear");
								setResetTickForEffectsButtons("clipEffectButton2", true);
							}, timeToWait);
							
						break;
						case 9://Isolate With Labels
							handleEffectClick("IsolateWithLabels");
							//createIsolateWithLabelsEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("isolateButtonWithLabel", true);
						break;
						case 10://Isolate on White
							handleEffectClick("IsolateOnWhite");
							//createIsolateWithWhiteEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("isolateButtonWhiteEffect", true);
						break;
						case 11://3DGS Asset
							handleEffectClick("3DGS");
							//createIsolateWithWhiteEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("3DGSButton", true);
						break;
					}
				}
			});
			
			var isVisible = $('.dropdown-menu li').find('span.tick').filter(function() {
				return $(this).css('visibility') === 'visible';
			  }).length > 0;

			  if (isVisible) {
				  $("#newEffectsButton").addClass("btn-primary");
			  } else {
				  $("#newEffectsButton").removeClass("btn-primary");
				//console.log("No span with class 'tick' is visible.");
			  }
			  
			defaultEffects = [];
		}
		if(true)// Add condition here for any one effect active
		{
			//Go to Default Camera
			flyToDefaultCameraWithDelay();
		}
		restoreUrlViewState();
	}, 3000);
}

// One-shot restore of the bits of view state we persist in the URL that aren't
// handled elsewhere: the white/dark map overlay, and (Office only) whether the
// submarket boundaries were toggled on.
window.urlViewStateRestored = false;
function restoreUrlViewState()
{
	if(window.urlViewStateRestored)
		return;
	window.urlViewStateRestored = true;

	if(typeof applyOverlayMode == "function" && (window.defaultOverlay == "w" || window.defaultOverlay == "d"))
		applyOverlayMode(window.defaultOverlay == "d" ? "dark" : "white");

	if(window.defaultSubmarketBoundary && lastSelectedBuildingType == "Office"
		&& !window.allSubmarketBoundariesShown && typeof toggleAllSubmarketBoundaries == "function")
	{
		toggleAllSubmarketBoundaries();
	}
}

function loadImageUrl(offset, imageUrl)
{
	viewer.entities.add({
		id: 'imageLabel',
		position: offset,
		billboard: {
			image: imageUrl, // your image URL
			scale: 0.05,
			sizeInMeters: true,
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			disableDepthTestDistance: Number.POSITIVE_INFINITY, // always on top
			scaleByDistance: undefined
			/*
			pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.0, 1.0e7, 1.0), // keep consistent size
			*/
		}
	});
}
function loadAOSSqFt(offset, val)
{
	viewer.entities.add({
		id: 'areaLabel',
		position: offset,
		label: {
			text: val, // or any static text
			font: "30px Helvetica",
			/*heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,*/
			horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
			fillColor: Cesium.Color.BLACK,
			outlineColor: Cesium.Color.WHITE,
			outlineWidth: 5,
			style: Cesium.LabelStyle.FILL_AND_OUTLINE,
		}
	});
}

function RemoveEntityById(id)
{
	viewer.entities.removeById(id);
}

function RerenderHtmlOverlay() {
  var div = document.createElement("div");
  div.id = "PolygonCOverlay";
  div.innerHTML =
    '<div style="font-size: 22px;margin-bottom: 10px;"><span id="floorNum"></span></div><div id="FloorViewInInfoBox" onclick="FlyToFloorView()">Floor View</div><div id="FloorViewTravelInInfoBox" onclick="ToggleFloorViewCameraSlowRotation()">Floor View Tour</div>';
  document.body.appendChild(div);
  $("#PolygonCOverlay").css("left", "-999px");
}

function clearFogAndPrimitives()
{
	viewer.entities.removeById("FogEffectEntity");debugger;
	viewer.entities.removeById("NewFogEffectEntity");
}

window.primitivesCleared = null;
function clearPrimitives( clearFog = true, retainMainFog = false, retainAOSData = false )
{
	window.backupHolesString = "";
	window.primitivesCleared = true;
	updateFogHoles([]);
	window.lastHolesArray = [];
	window.officeSalesInfoboxLabel = [];
	window.tabYearSelected = null;
	if(typeof RemoveEntitiesByType != "undefined" && typeof dashedEntityList != "undefined")
		RemoveEntitiesByType(dashedEntityList);
	
	if(typeof viewer != "undefined")
	{
		if (viewer.entities.getById('imageLabel')) viewer.entities.removeById('imageLabel');
		if (viewer.entities.getById('logoConnectorLine')) viewer.entities.removeById('logoConnectorLine');
		if (viewer.entities.getById('sqftConnectorLine')) viewer.entities.removeById('sqftConnectorLine');
		if (viewer.entities.getById('areaLabel')) viewer.entities.removeById('areaLabel');
	}
	
	if(typeof htmlPolygonCOverlay != "undefined")
		htmlPolygonCOverlay.remove();
	
	$("#companyLogoContainer").hide();
	clearPolygonOutline();
	removeOutline();
	
	RemoveEntityById("FEntity");
	RemoveEntityById("solidFloor");
	
	window.marketAutosuggestBuildings = null;
	/*
	if(!retainMainFog)
	{
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
	}
	if(clearFog)
	{
		//viewer.entities.removeById("FogEffectEntityPreload");
	}
	*/
	viewer.entities.removeById("starRatingBox");
	
	if(typeof window.primitiveCollection != "undefined" && window.primitiveCollection != null)
	for(var i = 0; i < primitiveCollection.length; i++)
	{
		primitiveCollection[i].destroy();
	}
	primitiveCollection = [];
	
	ClearDA3Entity();
	RemoveEntitiesByType(buildingMask);
	buildingMask = [];
	RemoveEntitiesByType(scaledPolygonList);
	scaledPolygonList = [];
	
	if(typeof effectsArray != "undefined" && typeof effectsArray[7] == "undefined" && effectsArray[7] != 1)
	{
		if(typeof window.floorPlanPrimitives != "undefined" && window.floorPlanPrimitives != null)
		for(var i = 0; i < floorPlanPrimitives.length; i++)
		{
			floorPlanPrimitives[i].destroy();
		}
		floorPlanPrimitives = [];
	}
	
	if(typeof window.developmentBuildingFloorEntity != "undefined" && window.developmentBuildingFloorEntity != null)
	for(var i = 0; i < developmentBuildingFloorEntity.length; i++)
	{
		viewer.entities.removeById(developmentBuildingFloorEntity[i]);
	}
	developmentBuildingFloorEntity = [];
	
	
	if(typeof window.retailEntities != "undefined" && window.retailEntities != null)
	for(var i = 0; i < window.retailEntities.length; i++)
	{
		window.retailEntities[i].destroy();
	}
	window.retailEntities = [];
	
	if(typeof window.calgaryOfficeSalePrimitives != "undefined" && window.calgaryOfficeSalePrimitives != null)
	{
		for(var i = 0; i < window.calgaryOfficeSalePrimitives.length; i++)
		{
			if(typeof window.calgaryOfficeSalePrimitives[i] != "undefined")
				window.calgaryOfficeSalePrimitives[i].destroy();
		}
	}
	window.calgaryOfficeSalePrimitives = [];
	if(typeof window.calgaryOfficeSalePrimitivesLabels != "undefined" && window.calgaryOfficeSalePrimitivesLabels != null)
	{
		for(var i = 0; i < window.calgaryOfficeSalePrimitivesLabels.length; i++)
		{
			viewer.entities.removeById(window.calgaryOfficeSalePrimitivesLabels[i]);
		}
		//window.calgaryOfficeSalePrimitivesLabels.destroy();
	}
	
	window.calgaryOfficeSale = [];
	
	window.calgaryOfficeSalePrimitivesLabels = [];//viewer.scene.primitives.add(new Cesium.LabelCollection());
	
	//marketBuildingDetails = [];
	clearSydneyArealyticsSuites();
	
	clearAvailableOfficeSpaceEntities();
	
	if(!retainAOSData)
	{
		window.availableOfficeSpace = null;
		window.availableOfficeSpaceSummary = null;
		window.availableOfficeSpacePrimitives = [];
		filterWithListingCompanyActive = false;
		filterWithListingAgentActive = false;
	}
	
}

function ClearDA3Entity() {
  if (
    typeof developmentBuildingFloorEntityForDev3 != "undefined" &&
    developmentBuildingFloorEntityForDev3 != null
  )
    for (var i = 0; i < developmentBuildingFloorEntityForDev3.length; i++) {
      viewer.entities.removeById(developmentBuildingFloorEntityForDev3[i]);
    }
  developmentBuildingFloorEntityForDev3 = [];
}

/*
function flyToMarket(idtcity)
{
	//TODO find a better way to do...
	var marketRow = null;
	$.each(marketDetails, function (index, eachMarket){
		if(marketId == eachMarket.idtmarket)
			marketRow = eachMarket;
	});
	
	//console.log("Skyline CamId: "+marketRow.skylineidtcamera);
	var camView = marketCameraDetails[marketRow.skylineidtcamera];
	flyToCitySkyline(idtcity);
	*/
	/*
	if(marketId == 1)
	{
		camView = marketCameraDetails[marketRow.skylineidtcamera];
	}
	////console.log("camView: ", camView);
	//flyToCameraView(camView, 0);
}
*/

function flyToCitySkyline(id, timer = 2000)
{
	viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
	console.log("enable Collision False");
	setTimeout(() => {
		console.log("enable Collision True");
		viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
	}, 10000);
	
	if(id == null)
		return;
	console.log("IN flyToCitySkyline("+id+") "+lastCityLoaded);
	////console.log("Altitude Check before flying: ",getCameraValues().altitude);
	if(parseInt(id) == 4)
	{
		$.each(marketDetails, function (index, row){
			if(row.idtcity == id && row.idtmarket == lastMarketLoaded)
			{
				mktDetail = row;
			}
		});
		if(typeof marketCameraDetails[mktDetail.marketcamera] != "undefined")
		{
			cameraAltitudeAdjustment = parseInt(mktDetail.altitudeadjustment);
			cam = marketCameraDetails[mktDetail.marketcamera];
			setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
			setTimeout(function (){
				console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
				setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
				setTimeout(function (){
					console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
					setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
					if(timer != 10)
						triedAfterRetry = 0;
				}, timer);
			}, timer);
		}
	}
	else if(parseInt(id) == 2 && parseInt(lastMarketLoaded) == 6)
	{
		$.each(marketDetails, function (index, row){
			if(row.idtcity == id && row.idtmarket == lastMarketLoaded)
			{
				mktDetail = row;
			}
		});
		if(typeof marketCameraDetails[mktDetail.marketcamera] != "undefined")
		{
			cameraAltitudeAdjustment = parseInt(mktDetail.altitudeadjustment);
			cam = marketCameraDetails[mktDetail.marketcamera];
			setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
			setTimeout(function (){
				console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
				setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
				setTimeout(function (){
					console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
					setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
					if(timer != 10)
						triedAfterRetry = 0;
				}, timer);
			}, timer);
		}
	}
	else
	{
		if(typeof cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"] != "undefined")
		{
			cameraAltitudeAdjustment = parseInt(cityCameras[parseInt(lastCityLoaded)]["altitudeadjustment"]);
			cam = marketCameraDetails[cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]];
			console.log(cam);
			//setTimeout(setCameraViewV2,10000,cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
			setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
			setTimeout(function (){
				console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
				setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
				setTimeout(function (){
				console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
				setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
					setTimeout(function (){
						console.log("Delayed Camera: "+cityCameras[parseInt(lastCityLoaded)]["skylineidtcamera"]);
						setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
						console.log(triedAfterRetry+":> "+window.expectedAltitude+" != "+getCameraValues().altitude+" => Altitude Difference");
						/*
						if(window.expectedAltitude != getCameraValues().altitude && parseInt(lastCityLoaded) == 1);
						setTimeout(function (){
							setCameraViewV2(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll);
						}, 200);
						*/
							
						if(timer != 10)
							triedAfterRetry = 0;
					}, timer);
				}, timer);
			}, timer);
			//flyToCameraView(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll, 0);
			//setCameraView(marketCameraDetails[mktDetail.skylineidtcamera]);
		}
	}
}

function flyToCitySkylineSlow(id)
{
	stopRotateIfInProgress();
	
	//console.log("Altitude Check before flying: ",getCameraValues().altitude);
	var mktDetail = [];
	$.each(marketDetails, function (index, row){
		if(row.idtcity == id)
		{
			mktDetail = row;
		}
	});
	if(typeof marketCameraDetails[mktDetail.skylineidtcamera] != "undefined")
	{
		cameraAltitudeAdjustment = parseInt(mktDetail.altitudeadjustment);
		cam = marketCameraDetails[mktDetail.skylineidtcamera];
		flyToCameraView(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll, 4);
		//setCameraView(marketCameraDetails[mktDetail.skylineidtcamera]);
	}
}

function flyToCitySkyline2Slow(id)
{
	stopRotateIfInProgress();
	
	//console.log("Altitude Check before flying: ",getCameraValues().altitude);
	var mktDetail = [];
	$.each(marketDetails, function (index, row){
		if(row.idtcity == id)
		{
			mktDetail = row;
		}
	});
	
	if(typeof mktDetail.skylineidtcamera2 != "undefined" && mktDetail.skylineidtcamera2 != null)
	{
		if(typeof marketCameraDetails[mktDetail.skylineidtcamera2] != "undefined" && typeof marketCameraDetails[mktDetail.skylineidtcamera2] != "undefined")
		{
			cameraAltitudeAdjustment = parseInt(mktDetail.altitudeadjustment);
			cam = marketCameraDetails[mktDetail.skylineidtcamera2];
			flyToCameraView(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll, 4);
			//setCameraView(marketCameraDetails[mktDetail.skylineidtcamera]);
		}
	}
}

function flyToSubmarketCamera(id, type = 'idtcamera', isTour = false)
{
	if (IsEnableSubmarketCameraRotation && isTour == true) {
		IsEnableSubmarketCameraRotation = false;
		SubmarketCameraRotationBtn = false;
		StopSubmarketCameraRotation();
		isTour = false;
		setResetSettingFlags("city-submarket-tour-li", false);
		return;
	}
	stopRotateIfInProgress();
	  
	$.ajax({
	  method: "POST",
	  url: "controllers/buildingController.php",
	  data: { param : "getSubmarketCameraDetails", "cameratype": type, "idtsubmarket" : id}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			//console.log("City Camera Values: ",data.data);
			cam = data.data;
			if( typeof cam.latitude != "undefined")
			{
				flyToCameraView(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll, 4);
				if(isTour)
				{
					/*
					setTimeout(function (){
						ToggleRotateAroundSubmarket(cam.longitude, cam.latitude, (cameraAltitudeAdjustment + parseInt(cam.altitude)));
					}, 4000);
					*/
					
					setTimeout(function (){
						FlyToSubmarketPoint(cam.longitude, cam.latitude, (cameraAltitudeAdjustment + parseInt(cam.altitude)), cam.heading, cam.pitch);
					}, 4000);
					
				}
			}
			else
			{
				//alert("Camera not available");
			}
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

async function FlyToSubmarketPoint(lon, lat, alt, heading, pitch) {
  RemoveEntityByName("tempMarkerPin");
  entity = viewer.entities.add({
    name: "tempMarkerPin",
    position: Cesium.Cartesian3.fromDegrees(
      parseFloat(lon),
      parseFloat(lat),
      parseFloat(cameraAltitudeAdjustment),
    ),
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
    },
  });
  var options = {
    maximumHeight: -30,
    offset: new Cesium.HeadingPitchRange(heading, -0.7853981633974483, 700),
  };
  viewer.flyTo(entity, options);
  setTimeout(SubmarketCameraRotationV2, 3100, lon, lat, alt);
}

function SubmarketCameraRotationV2(lon, lat, alt) {
  var currentPosition = Cesium.Cartesian3.fromDegrees(
    parseFloat(lon),
    parseFloat(lat),
    parseFloat(cameraAltitudeAdjustment),
  );
  var pitch = viewer.camera.pitch;
  var heading = camera.heading;
  var unsubscribeRotation = viewer.clock.onTick.addEventListener(() => {
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    elevation = Cesium.Cartesian3.distance(currentPosition, camera.positionWC);
    //viewer.scene.screenSpaceCameraController.enableZoom = false;
    const SMOOTHNESS = 1400; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation),
    );
  });
}

function flyToIdtcamera(id)
{
	$.ajax({
	  method: "POST",
	  url: "controllers/buildingController.php",
	  data: { param : "getCameraFromIdtcamera", "idtcamera" : id}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			//console.log("City Camera Values: ",data.data);
			cam = data.data;
			if( typeof cam.latitude != "undefined")
			{
				flyToCameraView(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll, 4);
			}
			else
			{
				//alert("Camera not available");
			}
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function flyToCitySkylineOld(id)
{
	$.ajax({
	  method: "POST",
	  url: "controllers/buildingController.php",
	  data: { param : "getCameraDetails", "cameratype": "skyline1", "idtcity" : id}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			//console.log("City Camera Values: ",data.data);
			if( typeof data.data.latitude != "undefined")
			{
				var latLon = getMapCenterV2();
				//data.data.altitude = latLon[2];
				//flyToCameraView(data.data, 2);
				setCameraView(data.data);
			}
			else
			{
				//alert("Camera not available");
			}
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

/**
 * Compare two camera positions with tolerance
 */
function isCameraAtPosition(targetLat, targetLon, targetAlt, tolerance = CAMERA_TOLERANCE) {
    const currentPos = getCurrentCameraPosition();
    
    const latDiff = Math.abs(currentPos.latitude - targetLat);
    const lonDiff = Math.abs(currentPos.longitude - targetLon);
    const altDiff = Math.abs(currentPos.altitude - targetAlt);
    
    const isAtPosition = 
        latDiff <= tolerance.latitude &&
        lonDiff <= tolerance.longitude &&
        altDiff <= tolerance.altitude;
    
    console.log(`Camera comparison - Lat: ${latDiff.toFixed(6)} (${isAtPosition ? '✓' : '✗'}), Lon: ${lonDiff.toFixed(6)}, Alt: ${altDiff.toFixed(0)}m`);
    
    return isAtPosition;
}
let buildingCameraAltitudeValue = null;
let buildingCameraLonValue = null;
let buildingCameraLatValue = null;
let buildingCameraDataLogged = [];
function flyToBuildingCamera(id)
{
	stopRotateIfInProgress();
	
	if(typeof $("#tempSearchField").val() != "undefined" && $("#tempSearchField").val() != "")
		id = $("#tempSearchField").val();
	
	$.ajax({
	  method: "POST",
	  url: "controllers/buildingController.php",
	  data: { param : "getBuildingCameraDetails", "idtbuilding" : id}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			//console.log(data);
			if( data.data.length == 0)
			{
				if(typeof TempBldgData[id].coords != "undefined")
				{
					var t = TempBldgData[id].coords.split(",");
					var camValues = getCameraValues();
					flyToCameraView(t[1], t[0], camValues.altitude, 0, -90, camValues.roll, 4);
				}
				else if(typeof floorPlanDetails[id] != "undefined")
				{
					var firstItem = null;
					$.each(floorPlanDetails[id], function (j1, row1){
						if(typeof j1 != "undefined" && typeof row1 != "undefined" && firstItem == null)
						{
							firstItem = floorPlanDetails[id][j1][0].coords;
						}
					});
					if(firstItem != null)
					{
						var t = firstItem.coords.split(",");
						var camValues = getCameraValues();
						flyToCameraView(t[1], t[0], camValues.altitude, 0, -90, camValues.roll, 4);
					}
				}
			}
			else
			{
				if( typeof data.data.latitude != "undefined")
				{
					cam = data.data;
					buildingCameraDataLogged[id] = cam;
					buildingCameraAltitudeValue = cam.altitude;
					buildingCameraLatValue = cam.latitude;
					buildingCameraLonValue = cam.longitude;
					flyToCameraView(cam.latitude, cam.longitude, cam.altitude, cam.heading, cam.pitch, cam.roll, 4);
				}
				else
				{
					//alert("Camera not available");
				}
			}
		}
		else
		{
			//alert("Something went wrong");
		}
	});
}

function getBuildingFloorDetails(id)
{
	if(id == null)
		return;
	if(typeof TempBldgData[id] != "undefined" && typeof TempBldgData[id].floorDetails == "undefined")
	{
		$.ajax({
		  method: "POST",
		  url: "controllers/buildingController.php",
		  data: { param : "getBuildingFloorDetails", "idtbuilding" : id}
		})
		.done(function( data ) {
			////console.log(data);
			data = $.parseJSON( data );
			if(data.status == "success")
			{
				//console.log(data);
				TempBldgData[id].floorDetails = data.data;
				TempBldgData[id].calculatedMaxHeight = data.calculatedHeight;
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
}

closeInfobox();
function resetLastSelectedPrimitive()
{
	if(typeof viewer != "undefined")
	{
		if (viewer.entities.getById('imageLabel')) viewer.entities.removeById('imageLabel');
		if (viewer.entities.getById('logoConnectorLine')) viewer.entities.removeById('logoConnectorLine');
		if (viewer.entities.getById('sqftConnectorLine')) viewer.entities.removeById('sqftConnectorLine');
		if (viewer.entities.getById('areaLabel')) viewer.entities.removeById('areaLabel');
	}
	$("#companyLogoContainer").hide();
	
	try{
		clearPolygonOutline();
		if(typeof selectedPrimitive != "undefined" && selectedPrimitive != null )
		{
			var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
			if(typeof attributes != "undefined")
			{
				//floorPlanEntity is always red - reset it straight back to the RED.withAlpha(0.7) base
				//rather than whatever selectedPrimitiveColor happens to hold.
				if(String(selectedPrimitiveId).indexOf("floorPlanEntity-") === 0)
					attributes.color = [255, 0, 0, 179];
				else if(selectedPrimitiveColor != null)
					attributes.color = selectedPrimitiveColor;
				attributes.show = [1];
			}
		}
	}
	catch(err){
		
	}
}

function getHotelStarPattern(rating)
{
	var starRatingText = '';
	starRatingText += '<div class="star-rating">';
	var isFull = [];
	isFull[1] = ""; isFull[2] = ""; isFull[3] = ""; isFull[4] = ""; isFull[5] = "";
	if(rating >= 1)
		isFull[1] = "full";
	if(rating >= 2)
		isFull[2] = "full";
	if(rating >= 3)
		isFull[3] = "full";
	if(rating>= 4)
		isFull[4] = "full";
	if(rating >= 5)
		isFull[5] = "full";
	
		starRatingText += '<span class="star '+isFull[1]+'" data-value="1">&#9733;</span>';
		starRatingText += '<span class="star '+isFull[2]+'" data-value="2">&#9733;</span>';
		starRatingText += '<span class="star '+isFull[3]+'" data-value="3">&#9733;</span>';
		starRatingText += '<span class="star '+isFull[4]+'" data-value="4">&#9733;</span>';
		starRatingText += '<span class="star '+isFull[5]+'" data-value="5">&#9733;</span>';
	
	starRatingText += '</div>';
	return starRatingText;
}

//The "Floorplans (N)" button in the building infobox. N comes from the Available Office
//Space data (window.availableOfficeSpaceImproved), which loads asynchronously - so when the
//infobox is opened straight after a text search / "load visualization" the count can still
//be 0 at render time. refreshInfoboxFloorplanButton() re-renders it once that data arrives.
function floorplanButtonHtml(idtbl)
{
	idtbl = parseInt(idtbl);
	var floorplanCount = (typeof window.availableOfficeSpaceImproved != "undefined" && typeof window.availableOfficeSpaceImproved[idtbl] != "undefined") ? window.availableOfficeSpaceImproved[idtbl].length : 0;
	var floorplancnttext = floorplanCount > 0 ? "("+floorplanCount+")" : "";
	if(floorplanCount > 0)
		return "<button class='btn btn-sm btn-secondary actionButtons' id='floorplanButton' onClick=\"handleEffectClick('Floorplans');\">Floorplans "+floorplancnttext+"</button>";
	return "<button style='color:grey;' class='btn btn-sm btn-secondary actionButtons' id='floorplanButton' >Floorplans "+floorplancnttext+"</button>";
}

function refreshInfoboxFloorplanButton()
{
	if(!$(".infoboxContainer").is(":visible") || typeof devSelectedBuilding == "undefined" || !devSelectedBuilding)
		return;
	var $btn = $(".infoboxContainerData .pull-left button").filter(function (){ return $(this).text().indexOf("Floorplans") === 0; }).first();
	if($btn.length == 0)
		return;
	$btn.replaceWith(floorplanButtonHtml(devSelectedBuilding));
}

function ShowInfobox(idtbl, id)
{
	if(idtbl == null)
	{
		return;
	}
	//If the AI Agent panel was open for the previous building, keep it open for the newly selected one but
	//re-rendered fresh (empty question input + answer section) - see the reopen block at the end of ShowInfobox.
	var reopenAIAgentPanel = window.buildingAIAgentPanelActive === true;
	window.buildingAIAgentPanelActive = false;
	if(typeof TempBldgData[idtbl] == "undefined" || typeof TempBldgData[idtbl].idtbuilding == "undefined")
	{
		return;
	}
	
	$("#3DGSButton").addClass("disabledEffectsLI");
	if(TempBldgData[idtbl].dgs_asset != null && TempBldgData[idtbl].dgs_asset > 0)
	{
		$("#3DGSButton").removeClass("disabledEffectsLI");
	}
	
	idtbl = parseInt(idtbl);
	
	window.lastSelectedSuite = null;
	//$(".orbitButton").show();
	
	createStadiaTerrain();
	$(".marketStatsButtonContainer").show();
	//console.log("Bldg "+idtbl);
	devSelectedBuilding = idtbl;
	lastSelectedBuilding = idtbl;
	recordBuildingSelectionForBackAndForth(idtbl);
	//console.log(TempBldgData[idtbl]);
	prepareBuilding(TempBldgData[idtbl]);
	getBuildingFloorDetails(idtbl);
	var marketData = null;
	$.each(marketDetails, function (index, eachRow){
		if(eachRow.idtmarket == lastMarketLoaded)
			marketData = eachRow;
	});
	var st = "<span></span><a href='javascript:void(0)' class='buildingNameOnInfobox buildingNameOnInfoboxBOLD' onClick=\"flyToBuildingCamera("+TempBldgData[idtbl].idtbuilding+");\">"+TempBldgData[idtbl].sbuildingname+"</a>";
	/*
	if(typeof marketCameraRotationDetails[TempBldgData[idtbl].idtcamera] != "undefined")
		st += "<span style='position: absolute; right: 15px;font-size: 12px; font-weight: none !important;'><a href='javascript:ToggleCameraRotationForBuilding();'>Orbit</a></span>";
	*/
	//st += "<span style='position: absolute; right: 5px; font-weight: none !important;'>"+TempBldgData[idtbl].idtbuilding+"</span>";
	st += "<span style='position: absolute; right: 2%; font-weight: none !important;'>id: <span id='buildingIdToCopy'>"+TempBldgData[idtbl].idtbuilding+"</span></span>";
	//&nbsp;&nbsp;<a href='javascript:prepareForPanoView("+TempBldgData[idtbl].idtbuilding+")'>Pano</a>
	st += "";
	$(".infoboxHeaderData").html(st);
	
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
	str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
	
	if(TempBldgData[idtbl].buildingclass == "HOTEL" || (lastSelectedBuildingType == "All" && TempBldgData[idtbl].buildingclass == "HOTEL"))
	{
		//str += "<tr><td>Rating</td><td>"+getHotelStarPattern(parseInt(TempBldgData[idtbl].star_rating))+"</td><td colspan=2></td></tr>";
	}

	str += "<tr><td style='width: 20% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+printIfNotNull(TempBldgData[idtbl].class_long_name)+"</span>";
	if(TempBldgData[idtbl].buildingclass == "HOTEL" || (lastSelectedBuildingType == "All" && TempBldgData[idtbl].buildingclass == "HOTEL"))
	{
		//str += "&nbsp;"+;
	}
	str += "</td><td style='width: 30% !important;'><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td style='width: 32% !important;'>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td></tr>";
	
	var lastreno = "";
	if(TempBldgData[idtbl].lastreno != "" && TempBldgData[idtbl].lastreno != null)
		lastreno = " ("+TempBldgData[idtbl].lastreno+")";
	
	var showAmenitiesButton = false;
	//The "Amenities" button becomes the building-level AI Agent panel on the Office, Hotel and Multifamily
	//(Residential) visualisations - see the button render below. aiAgentContextType picks which question set
	//the panel pulls (tai_agent_questions.type, bridged as window.aiAgentQuestionsByType) and which context
	//classes/aiAgent.php answers under.
	var amenitiesButtonIsAIAgent = false;
	var aiAgentContextType = "Office Market";

	if(lastSelectedBuildingType == "Hotel" || (lastSelectedBuildingType == "All" && hotelClasses.includes(TempBldgData[idtbl].buildingclass)))
	{
		showAmenitiesButton = true;
		amenitiesButtonIsAIAgent = true;
		aiAgentContextType = "Hotel";
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";

		str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";

		str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+printIfNotNull(TempBldgData[idtbl].class_long_name)+"</span>";
		if(TempBldgData[idtbl].buildingclass == "HOTEL" || (lastSelectedBuildingType == "All" && TempBldgData[idtbl].buildingclass == "HOTEL"))
		{
			//str += "&nbsp;"+;
		}
		str += "</td>"+fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt, " style='width: 26% !important;'")+"<td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";

		str += "<tr><td><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		str += fieldLabelTd("Doors", TempBldgData[idtbl].hoteldoors)+"<td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].hoteldoors)+"</td></tr>";

		str += "<tr><td></td><td></td>"+fieldLabelTd("Rating", TempBldgData[idtbl].star_rating)+"<td>"+getHotelStarPattern(parseInt(TempBldgData[idtbl].star_rating))+"</td></tr>";
		str += "<tr>"+fieldLabelTd("Developer", TempBldgData[idtbl].developer, " colspan=2")+"<td colspan=2>"+TempBldgData[idtbl].developer+"</td></tr>";
		str += "<tr>"+fieldLabelTd("Property&nbsp;Manager", TempBldgData[idtbl].propertymanager, " colspan=2")+"<td colspan=2"+(TempBldgData[idtbl].propertymanager ? " class='propertyManagerRow propertyManagerRow-"+TempBldgData[idtbl].idtpropertymanager+(window.filterWithPropertyManagerActive && parseInt(window.propertyManagerFiltered) == parseInt(TempBldgData[idtbl].idtpropertymanager) ? " highlight-property-manager-name" : "")+"' style='cursor:pointer;' onClick='filterBuildingsWithPropertyManager("+TempBldgData[idtbl].idtpropertymanager+");'" : "")+">"+TempBldgData[idtbl].propertymanager+"</td></tr>";
		/*
		str += "<tr><td>Rating</td><td>"+getHotelStarPattern(parseInt(TempBldgData[idtbl].star_rating))+"</td>";
		$("#newSuiteButton").html("Rooms");
		newButtonText = "Rooms";
		str += "<td>Doors</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].hoteldoors)+"</td></tr>";
		str += "<tr><td>Built</td><td>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td><td></td><td></td></tr>";
		*/
	}
	else if(lastSelectedBuildingType == "Residential" || (lastSelectedBuildingType == "All" && residentialClasses.includes(TempBldgData[idtbl].buildingclass)))
	{
		showAmenitiesButton = true;
		amenitiesButtonIsAIAgent = true;
		aiAgentContextType = "Multifamily";
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
		//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
		str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
		
		
		str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+printIfNotNull(TempBldgData[idtbl].class_long_name)+"</span>";

		str += fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt)+"<td>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";
		
		//str += "<tr><td style='width: 23% !important;'>Floors</td><td style='width: 18% !important;'>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		str += "<tr><td><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		$("#newSuiteButton").html("Units");
		newButtonText = "Units";
		str += fieldLabelTd("Units", TempBldgData[idtbl].units, " style='width: 26% !important;'")+"<td style='width: 31% !important;'>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].units)+"</td></tr>";
		str += "<tr>"+fieldLabelTd("Property&nbsp;Manager", TempBldgData[idtbl].propertymanager, " colspan=2")+"<td colspan=2"+(TempBldgData[idtbl].propertymanager ? " class='propertyManagerRow propertyManagerRow-"+TempBldgData[idtbl].idtpropertymanager+(window.filterWithPropertyManagerActive && parseInt(window.propertyManagerFiltered) == parseInt(TempBldgData[idtbl].idtpropertymanager) ? " highlight-property-manager-name" : "")+"' style='cursor:pointer;' onClick='filterBuildingsWithPropertyManager("+TempBldgData[idtbl].idtpropertymanager+");'" : "")+">"+TempBldgData[idtbl].propertymanager+"</td></tr>";
		str += "<tr>"+fieldLabelTd("Developer", TempBldgData[idtbl].developer, " colspan=2")+"<td colspan=2>"+TempBldgData[idtbl].developer+"</td></tr>";
		
	}
	else if(lastSelectedBuildingType == "Office" || (lastSelectedBuildingType == "All" && officeClasses.includes(TempBldgData[idtbl].buildingclass)))
	{
		showAmenitiesButton = true;
		amenitiesButtonIsAIAgent = true;
		aiAgentContextType = "Office Market";
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
		//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
		str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
		
		var classToPrint = printIfNotNull(TempBldgData[idtbl].class_long_name);
		if(classToPrint == "AA")
		{
			 classToPrint = marketDetailsV2[lastMarketLoaded].class_aa_rename.replace(" Office", "");
		}
		//classToPrint = "Prime";
		str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+classToPrint+"</span>";

		str += "</td>"+fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt, " style='width: 26% !important;'")+"<td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";

		str += "<tr><td><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		str += fieldLabelTd("Office", TempBldgData[idtbl].grossofficearea)+"<td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossofficearea)))+"</td></tr>";

		str += "<tr>"+fieldLabelTd("Total&nbsp;Parking&nbsp;", TempBldgData[idtbl].parkingstalls)+"<td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].parkingstalls, "")+"</td>";
			if(parseInt(TempBldgData[idtbl].total_available_office_area) > 0)
				str += "<td>Available Space</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(parseInt(TempBldgData[idtbl].total_available_office_area)), " ", " "+cityAreaMeasurementUnit)+"</td>";
			else
				str += "<td class='mutedFieldLabel'>Available Space</td><td></td>";
		str += "</tr>";

		if(parseInt(TempBldgData[idtbl].total_available_office_area) > 0)
		{
			var calcPercentage = Math.round((parseInt(TempBldgData[idtbl].total_available_office_area) / parseInt(TempBldgData[idtbl].grossofficearea))*100);
			str += "<tr><td>Vacancy</td><td>"+calcPercentage+"%</td><td>Additional&nbsp;Rent&nbsp;</td><td>"+numberWithCommaWithTwoDecimal(TempBldgData[idtbl].total_additional_rent, "$", " /psf")+"</td></tr>";
		}
		else
		{
			str += "<tr><td>Vacancy</td><td>0%</td><td class='mutedFieldLabel'>Additional&nbsp;Rent&nbsp;</td><td></td></tr>";
		}
		str += "<tr>"+fieldLabelTd("Developer", TempBldgData[idtbl].developer, " colspan=2")+"<td colspan=2>"+TempBldgData[idtbl].developer+"</td></tr>";
		str += "<tr>"+fieldLabelTd("Property&nbsp;Manager", TempBldgData[idtbl].propertymanager, " colspan=2")+"<td colspan=2"+(TempBldgData[idtbl].propertymanager ? " class='propertyManagerRow propertyManagerRow-"+TempBldgData[idtbl].idtpropertymanager+(window.filterWithPropertyManagerActive && parseInt(window.propertyManagerFiltered) == parseInt(TempBldgData[idtbl].idtpropertymanager) ? " highlight-property-manager-name" : "")+"' style='cursor:pointer;' onClick='filterBuildingsWithPropertyManager("+TempBldgData[idtbl].idtpropertymanager+");'" : "")+">"+TempBldgData[idtbl].propertymanager+"</td></tr>";
		
		$("#newSuiteButton").html("Suites");
		newButtonText = "Suites";
	}
	else
	{
		str += "<tr>"+fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt)+"<td>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td>";
		//str += "<tr><td>Year Built</td><td>"+TempBldgData[idtbl].units+"</td>";
		
		var newButtonText = "";
		if(lastSelectedBuildingType == "Retail" || (lastSelectedBuildingType == "All" && retailClass.includes(TempBldgData[idtbl].buildingclass)))
		{
			newButtonText = "Rooms";
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
			//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
			str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
			
			var classToPrint = printIfNotNull(TempBldgData[idtbl].class_long_name);
			if(classToPrint == "AA")
			{
				 classToPrint = marketDetailsV2[lastMarketLoaded].class_aa_rename.replace(" Office", "");
			}
			//classToPrint = "Prime";
			str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+classToPrint+"</span>";
			
			str += "</td>"+fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt, " style='width: 26% !important;'")+"<td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";

			str += "<tr><td><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
			str += fieldLabelTd("Retail", TempBldgData[idtbl].grossretailarea)+"<td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea || 0)))+"</td></tr>";
			
			//str += "<td>Retail</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea || 0)))+"</td></tr>";
		}
		else if(["EDU", "MED", "GOV"].includes(TempBldgData[idtbl].buildingclass))
		{
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
			//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
			str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
			
			var classToPrint = printIfNotNull(TempBldgData[idtbl].class_long_name);
			if(classToPrint == "AA")
			{
				 classToPrint = marketDetailsV2[lastMarketLoaded].class_aa_rename.replace(" Office", "");
			}
			//classToPrint = "Prime";
			str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+classToPrint+"</span>";
			
			str += "</td>"+fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt, " style='width: 26% !important;'")+"<td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";

			str += "<tr><td><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
			str += fieldLabelTd("Area", TempBldgData[idtbl].grossretailarea)+"<td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea || 0)))+"</td></tr>";
			
			//str += "<td>Area</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea || 0)))+"</td></tr>";
		}
		else if(lastSelectedBuildingType == "All" && parkadesClass.includes(TempBldgData[idtbl].buildingclass))
		{
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
			//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
			str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
			
			var classToPrint = printIfNotNull(TempBldgData[idtbl].class_long_name);
			//classToPrint = "Prime";
			str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+classToPrint+"</span>";
			
			str += "</td>"+fieldLabelTd("Built", TempBldgData[idtbl].yearbuilt, " style='width: 26% !important;'")+"<td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";

			str += "<tr><td><span id='highlightButton' class='floorsToggleLabel' onclick=\"handleEffectClick('Floors');\">Floors</span></td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
			str += fieldLabelTd("Stalls", TempBldgData[idtbl].parkingstalls)+"<td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].parkingstalls)+"</td></tr>";
			
			//str += "<td>Area</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea || 0)))+"</td></tr>";
		}
		else if(lastSelectedBuildingType == "All" || (lastSelectedBuildingType == "All" && parkadesClassLower.includes(TempBldgData[idtbl].buildingclass)))
		{
			//$("#newSuiteButton").html("Rooms");
			//newButtonText = "Rooms";
			if(TempBldgData[idtbl].buildingclass.toLowerCase() != "gov")
				str += fieldLabelTd("Stalls", TempBldgData[idtbl].parkingstalls)+"<td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].parkingstalls)+"</td></tr>";
			else
				str += "<td></td><td></td></tr>";
		}
	}
	
	/*
	if(lastSelectedBuildingType == "Office" || (lastSelectedBuildingType == "All" && officeClasses.includes(TempBldgData[idtbl].buildingclass)))
	{
		/*
		str += "<tr><td>Office Area</td><td>"+printSqFt(TempBldgData[idtbl].grossofficearea)+"</td>";
			if(TempBldgData[idtbl].grossretailarea != null && TempBldgData[idtbl].grossretailarea != "" && TempBldgData[idtbl].grossretailarea != "0")
				str += "<td>Retail Area</td><td>"+printSqFt(TempBldgData[idtbl].grossretailarea)+"</td>";
			else
				str += "<td></td><td></td>";
		str += "</tr>";
		* /
		//str += "<tr class='floorNumberRowTR' style='display:none;'><td>Floor</td><td class='floorNumberRowTD'></td><td colspan='2'></td></tr>";
	}
	else if(lastSelectedBuildingType == "Residential" || lastSelectedBuildingType == "All")
	{
		//str += "<tr class='floorNumberRowTR' style='display:none;'><td>Floor</td><td class='floorNumberRowTD' ></td><td colspan='2'></td></tr>";
	}
	else if(lastSelectedBuildingType == "Hotel" || lastSelectedBuildingType == "All")
	{
		//str += "<tr class='floorNumberRowTR' style='display:none;'><td>Floor</td><td class='floorNumberRowTD'></td><td colspan='2'></td></tr>";
	}
	*/
	
	str += "</table>";
	
	str += "<span class='pull-left'>" + floorplanButtonHtml(idtbl);
	
	str += '<div class="dropdown" ><button id="newEffectsButton" class="dropdown-toggle btn btn-sm btn-secondary actionButtons" >Effects</button>';
	str += '<ul class="dropdown-menu">';
       dgsClass = "disabledEffectsLI";
	   if(TempBldgData[idtbl].dgs_asset != null && TempBldgData[idtbl].dgs_asset > 0)
	   {
		   dgsClass = "";
	   }
    str += '<li style="margin-right: 10px;" class="'+dgsClass+'" id="3DGSButton"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option2" onClick=\'handleEffectClick("3DGS");\'><span class="tick">&#x2714;</span> 3DGS</a></li>';
    str += '<li style="margin-right: 10px;" id="isolateSatelliteButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option1" onClick=\'handleEffectClick("Isolate");\'><span class="tick">&#x2714;</span>Isolate</a></li>';
    str += '<li style="margin-right: 10px;" id="isolateButtonWithLabel"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option1" onClick=\'handleEffectClick("IsolateWithLabels");\'><span class="tick">&#x2714;</span> Isolate with labels</a></li>';
    str += '<li style="margin-right: 10px;" id="isolateButtonWhiteEffect"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option1" onClick=\'handleEffectClick("IsolateOnWhite");\'><span class="tick">&#x2714;</span> Isolate on white</a></li>';
    str += '<li style="margin-right: 10px;" id="isolateWithDarkButton"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option1" onClick=\'handleEffectClick("IsolateOnDark");\'><span class="tick">&#x2714;</span> Isolate on dark</a></li>';
    str += '<li style="margin-right: 10px;" id="spotlightButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option2" onClick=\'handleEffectClick("Spotlight");\'><span class="tick">&#x2714;</span> Spotlight</a></li>';
    str += '<li style="margin-right: 10px;" id="newHighlightButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option3" onClick=\'handleEffectClick("Highlight");\'><span class="tick">&#x2714;</span> Highlight</a></li>';
    str += '<li style="margin-right: 10px;" id="clipEffectButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option4" onClick=\'handleEffectClick("Clear");\'><span class="tick">&#x2714;</span> Clear selected</a></li>';
    //str += '<li style="margin-right: 10px;" id="darkOverlayButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option4" onClick=\'createDarkOverlayEffect('+idtbl+');\'><span class="tick">&#x2714;</span> Dark Overlay</a></li>';

    str += '</ul></div>';
    

    //Isolate, Spotlight, Highlight
    //<button class='btn btn-sm btn-secondary actionButtons' id='isolateButton' onClick=\"createIsolateOnDarkEffect("+idtbl+");\">Isolate</button><button class='btn btn-sm btn-secondary actionButtons' id='spotlightButton' onClick=\"createSpotlightEffect("+idtbl+");\">Spotlight</button><button class='btn btn-sm btn-secondary actionButtons' id='newHighlightButton' onClick=\"createApp6HighlightEffect("+idtbl+");\">Highlight</button>
	
	//Removed Suites button
	//<button class='btn btn-sm btn-secondary actionButtons' id='newSuiteButton'>"+newButtonText+"</button>
	isUnitsAvailable = ' disabled';
	if(typeof window.activeUnitDetails[parseInt(idtbl)] != "undefined")
	{
		isUnitsAvailable = '';
	}
	str += "<button class='btn btn-sm btn-secondary actionButtons ' id='assetButton' onClick=\"handleEffectClick('Files');\">Files</button>";
	if(showAmenitiesButton)
	{
		if(amenitiesButtonIsAIAgent)
			str += "<button class='btn btn-sm btn-secondary actionButtons' id='aiAgentBuildingButton' onClick=\"toggleBuildingAIAgentPanel("+idtbl+", this, '"+aiAgentContextType+"');\">AI Agent</button>";
		else
			str += "<button style='color:grey;' class='btn btn-sm btn-secondary actionButtons' id='floorplanButton' onClick=\"handleEffectClick('Amenities');\">Amenities</button>";
	}
	str += "<button class='btn btn-sm btn-secondary actionButtons ' style='display:none;' id='cameraRotation2' onClick=\"ToggleCameraRotationForPoint2();\">Cam2</button></span>";
	//Vacancy button in Office infobox, Hiding it for now
	//<button class='btn btn-sm btn-secondary actionButtons' id='vacancyButton' onClick=\"highlightResiUnitsInBuilding("+idtbl+");\" "+isUnitsAvailable+">Vacancy</button>
	str += "<span class='pull-right' style='cursor:pointer; float: right; margin-top: 10px; '><img height='22px' width='22px' id='rotateCamera180ImgContainer' src='images/redo-24.png' onClick=\"start180CameraRotation();\" />&nbsp;&nbsp;<img height='20px' width='20px' src='images/explore.png' onClick=\"flyToBuildingNADIRView("+TempBldgData[idtbl].idtbuilding+");\" />&nbsp;&nbsp;<span  id='copyURLButton' ><img src='images/link_24.png' height='24px;' width='24px;' /></span></span>";
	$(".infoboxContainerData").html(str);
	$(".infoboxContainer").show();

	//Carry the AI Agent panel's open state across a building switch, but with fresh markup so the question
	//input and answer section are cleared for the newly selected building.
	if(reopenAIAgentPanel && $("#aiAgentBuildingButton").length > 0)
	{
		$("#infoboxFloorPlanRow").html(buildAIAgentPanel(idtbl, idtbl, 0, aiAgentContextType));
		$("#infoboxFloorPlanRow").show();
		$("#aiAgentBuildingButton").removeClass("btn-secondary").addClass("btn-primary");
		window.buildingAIAgentPanelActive = true;
	}

	updateURL();
	initiateDropdownToggle();
	initiateCopyButton();
	initEffectsDropdown();
}

function changeColorForDevelopmentBuilding(idtbl, id)
{
	return;
	$.each(devBuildingHighlightEntity, function (index, eachEntity){
		eachEntity.material.color = Cesium.Color.RED;
	});
}
function resetColorForDevelopmentBuilding(idtbl, id)
{
	return;
	$.each(devBuildingHighlightEntity, function (index, eachEntity){
		
	});
}

function showDevelopmentInfobox(idtbl, id)
{
	devSelectedBuilding = idtbl;
	lastSelectedBuilding = idtbl;
	var row = developmentBuildingDetails[parseInt(lastMarketLoaded)][id];
	
	var str = "<a href='javascript:void(0)' class='buildingNameOnInfobox buildingNameOnInfoboxBOLD' onClick='flyToBuildingCamera("+row.idtbuilding+");'>"+row.sbuildingname+"</a>";
	
	str += "<span style='position: absolute; right: 2%; font-weight: none !important;'>id: <span id='buildingIdToCopy'>"+row.idtbuilding+"</span></span>";
	str += "";
	$(".infoboxHeaderData").html(str);
	developerRow = "<tr>"+fieldLabelTd("Developer", row.developer)+"<td colspan='3'>";
	if(row.developer != null)
	{
		developerRow += row.developer;
	}
	developerRow += "</td></tr>";
	
	var st = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	if(officeClasses.includes(row.buildingclass))
	{
		st += "<tr><td width='80px'>Class</td><td><span class='customBadge' style='background-color: "+classColor[row.buildingclass]+";'>"+printIfNotNull(row.buildingclass)+"</span></td>"+fieldLabelTd("Completed", row.yearbuilt)+"<td>"+row.yearbuilt+"</td></tr>";
		st += "<tr><td>Floors</td><td>"+row.floors+"</td>"+fieldLabelTd("Office", row.grossofficearea, " width='80px'")+"<td>"+numberWithCommaWithoutDecimal(parseInt(row.grossofficearea), " ", " "+cityAreaMeasurementUnit)+"</td></tr>";

		st += "<tr>"+fieldLabelTd("Status", row.tstatus)+"<td>"+row.tstatus+"</td>"+fieldLabelTd("Conversion", row.conversion)+"<td>"+PrintIfNotNull(row.conversion)+"</td></tr>";
		st += developerRow;
	}
	else if(residentialClasses.includes(row.buildingclass))
	{
		st += "<tr><td width='80px'>Class</td><td><span class='customBadge' style='background-color: "+classColor[row.buildingclass]+";'>"+printIfNotNull(row.buildingclass)+"</span></td>"+fieldLabelTd("Completed", row.yearbuilt)+"<td>"+row.yearbuilt+"</td></tr>";
		st += "<tr><td>Floors</td><td>"+row.floors+"</td>"+fieldLabelTd("Units", row.units, " width='80px'")+"<td>"+printIfNotNull(row.units)+"</td></tr>";

		st += "<tr>"+fieldLabelTd("Status", row.tstatus)+"<td>"+row.tstatus+"</td>"+fieldLabelTd("Conversion", row.conversion)+"<td>"+PrintIfNotNull(row.conversion)+"</td></tr>";
		st += developerRow;

	}
	else if(row.buildingclass.toLowerCase() == "hotel")
	{
		//getHotelStarPattern(parseInt(eachRow.star_rating))
		st += "<tr><td width='80px'>Class</td><td><span class='customBadge' style='background-color: "+classColor[row.buildingclass]+";'>"+printIfNotNull(row.buildingclass)+"</span>";
		/*if(row.star_rating != null)
		{
			st += getHotelStarPattern(parseInt(row.star_rating));
		}*/
		st += "</td>"+fieldLabelTd("Completed", row.yearbuilt)+"<td>"+row.yearbuilt+"</td></tr>";
		st += "<tr><td>Floors</td><td>"+row.floors+"</td>"+fieldLabelTd("Doors", row.hoteldoors, " width='80px'")+"<td>"+row.hoteldoors+"</td></tr>";

		st += "<tr>";
			st += fieldLabelTd("Resi Units", row.units)+"<td>"+printIfNotNull(row.units)+"</td><td></td><td></td></tr>";
		st += developerRow;

	}
	
	
	//&nbsp;&nbsp;<a href='javascript:prepareForPanoView("+TempBldgData[idtbl].idtbuilding+")'>Pano</a>
	st += "</table>";
	//$(".infoboxHeaderData").html(st);
	
	$(".infoboxContainerData").html(st);
	$(".infoboxContainer").show();
	initiateCopyButton();
	
	updateURL();
}

window.officeSalesInfoboxLabel = [];
//idtbl = building. saleIndex (optional) picks which sale record to show for a building that has
//several - it's passed only when the user clicks one of the sale-date tabs; a fresh building
//selection leaves it undefined and shows the newest sale (index 0).
function ShowInfoboxOfficeMarketSales(idtbl, saleIndex)
{
	var sales = (window.officeSalesByBuilding && window.officeSalesByBuilding[idtbl]) ? window.officeSalesByBuilding[idtbl] : null;
	var isTabSwitch = (typeof saleIndex != "undefined" && saleIndex !== null);
	saleIndex = parseInt(saleIndex);
	if(isNaN(saleIndex))
		saleIndex = 0;
	var s = (sales && sales[saleIndex]) ? sales[saleIndex] : TempBldgData[idtbl];
	if(typeof s == "undefined" || s == null)
		return;

	//Keep the on-map price/PSF labels in sync with whichever sale is currently shown in the
	//infobox (the newest by default; a tab click can pick an older one) - whichever of the two
	//is the active display mode for this building is updated, so clicking a tab shows that
	//sale's own Sale Price or Price PSF, not the newest sale's value.
	var mapPriceLabel = viewer.entities.getById("label-"+idtbl);
	if(typeof mapPriceLabel != "undefined" && mapPriceLabel != null && mapPriceLabel.label)
		mapPriceLabel.label.text = numberWithCommaWithoutDecimal(s.sold_price, "$");
	var mapPsfLabel = viewer.entities.getById("label-psf-"+idtbl);
	if(typeof mapPsfLabel != "undefined" && mapPsfLabel != null && mapPsfLabel.label)
	{
		var mapPsfValue = parseFloat(s.sold_price) / parseFloat(s.grossofficearea);
		mapPsfLabel.label.text = numberWithCommaWithTwoDecimal(mapPsfValue, "$", " psf");
	}

	//Cycle the on-map label (price -> psf -> off) only when a building is first opened,
	//not when the user is flipping between that building's sale tabs.
	if(!isTabSwitch)
	{
		if(typeof viewer.entities.getById("label-"+idtbl) != "undefined")
				viewer.entities.getById("label-"+idtbl).show = false;
		if(typeof viewer.entities.getById("label-psf-"+idtbl) != "undefined")
			viewer.entities.getById("label-psf-"+idtbl).show = false;

		if(window.officeSalesInfoboxLabel[idtbl] == "undefined" || window.officeSalesInfoboxLabel[idtbl] == null)
		{
			if(typeof viewer.entities.getById("label-"+idtbl) != "undefined")
				viewer.entities.getById("label-"+idtbl).show = true;
			window.officeSalesInfoboxLabel[idtbl] = "price";
		}
		else if(window.officeSalesInfoboxLabel[idtbl] == "price")
		{
			if(typeof viewer.entities.getById("label-psf-"+idtbl) != "undefined")
				viewer.entities.getById("label-psf-"+idtbl).show = true;
			window.officeSalesInfoboxLabel[idtbl] = "psf";
		}
		else if(window.officeSalesInfoboxLabel[idtbl] == "psf")
		{
			window.officeSalesInfoboxLabel[idtbl] = null;
		}
	}

	devSelectedBuilding = idtbl;
	lastSelectedBuilding = idtbl;
	getBuildingFloorDetails(idtbl);

	var st = "<a href='javascript:void(0)' class='buildingNameOnInfobox buildingNameOnInfoboxBOLD' onClick='flyToBuildingCamera("+s.idtbuilding+");'>"+s.sbuildingname+"</a>";
	st += "<span style='position: absolute; right: 2%; font-weight: none !important;'>id: <span id='buildingIdToCopy'>"+idtbl+"</span></span>";
	$(".infoboxHeaderData").html(st);

	var str = "";
	if(sales && sales.length > 1)
	{
		str += "<div class='officeSaleTabBar'>";
		for(var t = 0; t < sales.length; t++)
			str += "<span class='officeSaleTab"+(t === saleIndex ? " active" : "")+"' onclick='ShowInfoboxOfficeMarketSales("+idtbl+","+t+")'>"+officeSaleDateLabel(sales[t])+"</span>";
		str += "</div>";
	}
	str += buildOfficeSaleDetailTable(idtbl, s);

	$(".infoboxContainerData").html(str);
	$(".infoboxContainer").show();

	initiateCopyButton();
	updateURL();
}

//The per-sale detail table for the Investment Sales infobox. s is one sale record (each carries
//its building's joined columns too), so this works whether or not the building has multiple sales.
function buildOfficeSaleDetailTable(idtbl, s)
{
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	str += "<tr><td colspan=2>"+s.address+"</td><td></td><td class='alignRight'><a href=\"javascript:flyToSubmarketCamera("+s.idtsubmarket+");\">"+s.ssubname+"</a></td></tr>";

	if(s.sale_year == 0)
		s.sale_year = "";
	var dt = officeSaleDateLabel(s);
	str += "<tr>";
		str += fieldLabelTd("Sale Date", dt)+"<td>"+printIfNotNull(dt)+"</td>";
		str += fieldLabelTd("GLA", s.grossofficearea)+"<td>"+numberWithCommaWithoutDecimal(s.grossofficearea)+" Sq Ft</td>";
	str += "</tr>";

	str += "<tr>";
		str += fieldLabelTd("Class", s.buildingclass)+"<td>"+printIfNotNull(s.buildingclass)+"</td>";
		if(parseFloat(s.sold_price) == 0 || s.sold_price == null)
		{
			str += "<td class='mutedFieldLabel'>Sale Price</td><td style='background-color:"+getInvestmentSaleColor(0, 0, true)+"'>Undisclosed</td>";
		}
		else
		{
			str += "<td><a href='javascript:void(0);' onclick='toggleAllSalePriceLabels();'>Sale Price</a></td><td><a href='javascript:void(0);' onclick='toggleAllSalePriceLabels();'>"+numberWithCommaWithoutDecimal(s.sold_price, "$")+"</a></td>";
		}
	str += "</tr>";
	str += "<tr>";
		str += fieldLabelTd("Built", s.year_built)+"<td>"+printIfNotNull(s.year_built)+"</td>";
		var psf = s.sold_price / parseInt(s.grossofficearea);
		if(psf > 0)
			str += "<td><a href='javascript:void(0);' onclick='toggleAllPricePsfLabels();'>Price PSF</a></td><td><a href='javascript:void(0);' onclick='toggleAllPricePsfLabels();'><span class='customBadge' style='background-color:"+getInvestmentSaleColor(parseFloat(s.sold_price), psf, true)+"'>$"+psf.toFixed(2)+"</span></a></td>";
		else
			str += "<td class='mutedFieldLabel'>Price PSF</td><td></td>";
	str += "</tr>";
	str += "<tr>";
		str += fieldLabelTd("Conveyed", s.conveyed)+"<td>"+(s.conveyed != null && s.conveyed !== "" ? s.conveyed+"" : "")+"</td>";
		str += "<td></td><td></td>";
	str += "</tr>";
	str += "<tr>"+fieldLabelTd("Vendor", s.vendor_company_name)+"<td colspan='3'><b>"+printIfNotNull(s.vendor_company_name)+"</b></td></tr>";
	str += "<tr>"+fieldLabelTd("Purchaser", s.purchaser_company_name)+"<td colspan='3'><b>"+printIfNotNull(s.purchaser_company_name)+"</b></td></tr>";
	if(s.description != null && s.description != "")
	{
		str += "<tr><td>Note</td><td colspan='3'>"+printIfNotNull(s.description)+"</td></tr>";
	}
	str += "</table>";
	return str;
}

//Functions for Print 
function PrintOnlyDate(val) {
  if (val == null) return "";
  var temp = val.split(" ");
  return temp[0];
}
function PrintIfNotNull(val) {
  if (val == null) return "";
  return val;
}
function printIfNotNullAndDatenotEmpty(val) {
  if (val == null) return "";
  if (val == "0000-00-00") return "";
  return val;
}
function isEmptyFieldValue(val) {
  return val == null || val === "" || val === "0" || val === 0 || val === "0000-00-00";
}
function fieldLabelTd(label, val, extraAttrs = "") {
  var cls = isEmptyFieldValue(val) ? " class='mutedFieldLabel'" : "";
  return "<td"+extraAttrs+cls+">"+label+"</td>";
}
function PrintWithUnitIfNotNull(val, suffix, prefix = "") {
  if (val == null) return "";
  return prefix + val + suffix;
}

function PrintOneDecimalPoint(val, suffix) {
  if (val == null) return "";
  return parseFloat(val).toFixed(1) + suffix;
}

function PrintWithoutDecimalPoint(val, suffix) {
  if (val == null) return "";
  return parseFloat(val).toFixed(0) + suffix;
}

function numberWithComma(x, prefix = "") {
  if (x != null) {
    x = parseFloat(x).toFixed(1);
    return prefix + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else return "";
}
function numberWithCommaWithoutDecimal2(value, prefix = "", suffix = "") {
  if (value != null && !isNaN(value) && value !== "") {
    let num = parseFloat(value); // local copy
    let rounded = Math.round(num); // integer
    return prefix + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
  }
  return "0";
}
function numberWithCommaWithoutDecimal(x, prefix = "", suffix = "") {
  if (x != null && !isNaN(x) && x != "" && x != "0") {
    x = parseFloat(x).toFixed(0);
    return prefix + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
  } else return "";
}
function numberWithCommaWithTwoDecimal(x, prefix = "", suffix = "") {
  if (x != null && !isNaN(x) && x != "") {
    x = parseFloat(x).toFixed(2);
    return prefix + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
  } else return "";
}
function thousandsNumberWithCommaWithoutDecimal(x, prefix = "", suffix = "") {
  if (x != null) {
    x = convertToThousands(parseFloat(x).toFixed(0));
    return prefix + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
  } else return "";
}

function GetSuiteColor(leaseType, onlyHash = false, alphaOverride = null){
	var Clr = "";
	if(leaseType == "Direct")
	{
		Clr = "#ff0000";
	}
	if(leaseType == "Sublease")
	{
		Clr = "#ffff00";
	}
	if(leaseType == "Co-Working")
	{
		Clr = "#00ff00";
	}
	if(onlyHash)
		return Clr;
	if(alphaOverride != null)
		return Cesium.Color.fromCssColorString(Clr).withAlpha(alphaOverride);
	else
		return Cesium.Color.fromCssColorString(Clr).withAlpha(DefaultAlpha);
}

//function ShowInfoboxForSuite(idtbl, id)
window.devSelectedBuildingCoord = null;
window.lastSelectedSuite = null;
function ShowInfoboxForSuite(indexes, cntr)
{
	//$("#viewerController").css("width", "180px");
	//$(".orbitButton").show();
	//var id = improvedSuites[improvedSuitesIndexes[indexes]][cntr];
	//console.log(improvedSuitesIndexes[indexes]);
	//console.log(improvedSuites[indexes][cntr]);
	
	var stData = improvedSuites[indexes][cntr];
	//console.log("Selected Coords ", stData.coords);
	devSelectedBuilding = stData.idtbuilding;
	lastSelectedBuilding = stData.idtbuilding;
	window.lastSelectedSuite = stData.SuiteId;
	window.devSelectedBuildingCoord = stData.coords;
	
	var st = "<a href='javascript:void(0)' class='buildingNameOnInfobox buildingNameOnInfoboxBOLD' onClick='flyToBuildingCamera("+stData.idtbuilding+");'>"+stData.address+"</a>";
	st += "<span style='position: absolute; right: 2%; font-weight: none !important;'>"+stData.idtbuilding+"-"+stData.SuiteId+"</span>";
	st += "";
	$(".infoboxHeaderData").html(st);
	
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		//str +="<tr><td width='170px'>Address</td><td>" +PrintIfNotNull(stData.address) +"</td></tr>";
		//str += "<tr><td>Property Use</td><td>" + PrintIfNotNull(stData.PropertyUse) + "</td></tr>";
		//str += "<tr><td>Property Class</td><td>" + PrintIfNotNull(stData.PropertyClass) + "</td></tr>";
		str += "<tr><td>Suite</td><td>" + PrintIfNotNull(stData.SuiteNumber) + "</td>";
		var availableArea = null;
		if(stData.SuiteSize != null)
		{
			availableArea = parseInt(stData.SuiteSize);
			str += "<td>Available Area</td><td>" +numberWithCommaWithoutDecimal(stData.SuiteSize, "", " sqm") + "</td></tr>";
		}
		else
		{
			availableArea = parseInt(stData.TotalSuiteSize);
			str += "<td>Available Area</td><td>" +numberWithCommaWithoutDecimal(stData.TotalSuiteSize, "", " sqm") + "</td></tr>";
		}
		
		str += "<tr><td>Floor</td><td>" + PrintIfNotNull(stData.FloorNumber) + "</td>";
		str += "<td>Currently Vacant</td><td>" + PrintYesNo(stData.IsVacant) + "</td></tr>";
		var clr = '';
		if(lastSelectedBuildingType == "OfficeRentalRates")
		{
			clr = getColorForPricePerSQM(stData.PricePerSQM, true);
		}
		str += "<tr><td>Class</td><td>" + PrintIfNotNull(stData.PropertyClass) + "</td><td><a href=\"javascript:ToggleToPricePerSQMVisualization();\">Price per SQM</a></td><td style='background-color:"+clr+"'>" + PrintWithUnitIfNotNull(stData.PricePerSQM, " /yr", "$") + "</td><td></td></tr>";
		str += "<tr><td>Created</td><td>" +  PrintOnlyDate(PrintIfNotNull(stData.ListingCreateDate)) + "</td><td>Total Monthly Rate</td><td><b>" + numberWithCommaWithoutDecimal(Math.round(stData.totalmonthlyrate, 0), "$") + "<b></td></tr>";
		clr = '';
		if(lastSelectedBuildingType == "AvailableOfficeSpace")
		{
			clr = GetSuiteColor(stData.LeaseType, true);
		}
		str += "<tr><td>Status</td><td>" + PrintIfNotNull(stData.ListingStatusName) + "</td>";
		str += "<td><a href=\"javascript:ToggleToLeaseTypeVisualization();\">Lease Type</a></td><td style='background-color:" + clr + "'>" + PrintIfNotNull(stData.LeaseType) + "</td>";
		//
		str += "</tr>";
		
		str += "<tr><td colspan='2'>Listing Company</td><td colspan='2' onClick='initiateCompanyLogoEffectWithSpeed();'><strong>" + PrintIfNotNull(stData.ListingCompanyName) + "</strong></td></tr>";
		str += "<tr><td colspan='2'>Listing Agent</td><td colspan='2'>" + PrintIfNotNull(stData.ListingBroker1) + "</td></tr>";
		
		
		//str += "<tr><td>Asking Rate High</td><td>"+numberWithComma(stData.Askingratehigh)+"</td></tr>";
		//str += "<tr><td>Asking Rate Low</td><td>"+numberWithComma(stData.askingratelow)+"</td></tr>";
		//str += "<tr><td></td><td></td></tr>";
		//str += "<tr><td></td><td></td></tr>";
		//str += "<tr><td>Arealytics Building ID</td><td>" + PrintIfNotNull(stData.PropertyId) + "</td></tr>";
		//str += "<tr><td>Arealytics Suite ID</td><td>" + PrintIfNotNull(stData.SuiteId) + "</td></tr>";
		//str += "<tr><td>Join ID</td><td>" + PrintIfNotNull(stData.idtbuilding) + "</td></tr>";

	str += "</table>";
	
	$(".infoboxContainerData").html(str);
	$(".infoboxContainer").show();
	updateURL();
}

//Not In Use
function convertToThousands(value) {
    if (value > 1000) {
        return (value / 1000).toFixed(1) + "K"; // Convert to thousands and format to 1 decimal place
    }
    return value.toString(); // Return the value as a string
}

function getPrimeOfficeChange()
{
	return marketDetailsV2[lastMarketLoaded].class_aa_rename;
	/*
	if(citiesWithPrimeChange.includes(parseInt(lastCityLoaded)))
	{
		return "Prime Office";
	}
	else
	{
		return "AA Office";
	}
	*/
}

function ShowLegend()
{
	if(isMobile.any() == null)//Desktop
	{
		var str = '';
		if(lastSelectedBuildingType == "Office")
		{
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["AA"]+';">'+getPrimeOfficeChange()+'</div>';
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["A"]+';">'+buildingClasses["A"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["B"]+';">'+buildingClasses["B"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["C"]+';">'+buildingClasses["C"]+'</div>';
		}
		else if(lastSelectedBuildingType == "Residential")
		{
			str = '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["MDU"]+';">'+buildingClasses["MDU"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["APT"]+';">'+buildingClasses["APT"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["SENIOR"]+';">'+buildingClasses["SENIOR"]+'</div>';
		}
		else if(lastSelectedBuildingType == "Hotel")
		{
			str = '<div class="colorLegend2 " style="width: 55px; background-color: '+classColor["HOTEL"]+';">'+buildingClasses["HOTEL"]+'</div>';
		}
		else if(lastSelectedBuildingType == "All")
		{
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["AA"]+';">'+getPrimeOfficeChange()+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["A"]+';">'+buildingClasses["A"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["B"]+';">'+buildingClasses["B"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["C"]+';">'+buildingClasses["C"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["Retail"]+';">'+buildingClasses["Retail"]+'</div>';
		
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["MDU"]+';">'+buildingClasses["MDU"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["APT"]+';">'+buildingClasses["APT"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["HOTEL"]+';">'+buildingClasses["HOTEL"]+'</div>';
		
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["SENIOR"]+';">'+buildingClasses["SENIOR"]+'</div>';
			
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["EDU"]+';">'+buildingClasses["EDU"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["MED"]+';">'+buildingClasses["MED"]+'</div>';
			
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["EMS"]+';">'+buildingClasses["EMS"]+'</div>';
			
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["GOV"]+';">'+buildingClasses["GOV"]+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["PRKS"]+';">'+buildingClasses["PRKS"]+'</div>';
		}
		else if(lastSelectedBuildingType == "Floorplan")
		{
			//str = '<div class="colorLegend2 " style="width: 100px; background-color: '+classColor["Floorplans"]+';">Floorplans</div>';
			//str += '<div class="colorLegend2 " style="width: 100px; background-color: '+classColor["MDU"]+';">Residential</div>';
			//str += '<div class="colorLegend2 " style="width: 100px; background-color: '+classColor["Hotel"]+';">Hotels</div>';
			/*
			//Commenting this now
			str = '<div class="colorLegend2 " style="width: 100px; background-color: '+classColor["Office"]+';">Office</div>';
			str += '<div class="colorLegend2 " style="width: 100px; background-color: '+classColor["Retail"]+';">Retail</div>';
			*/
			
			str += '<div class="colorLegend2 " style="width: 90px; background-color: '+classColor["Direct"]+';">Direct</div>';
			str += '<div class="colorLegend2 " style="width: 90px; background-color: '+classColor["Sublease"]+';">Sublease</div>';
			str += '<div class="colorLegend2 " style="width: 90px; background-color: '+classColor["Co-Working"]+';">Co-Working</div>';
			
		}
		else if(lastSelectedBuildingType == "AvailableOfficeSpace")
		{
			str += '<div class="colorLegend2 " style="width: 90px; background-color: '+classColor["Direct"]+';">Direct</div>';
			str += '<div class="colorLegend2 " style="width: 90px; background-color: '+classColor["Sublease"]+';">Sublease</div>';
			str += '<div class="colorLegend2 " style="width: 90px; background-color: '+classColor["Co-Working"]+';">Co-Working</div>';
		}
		else if(lastSelectedBuildingType == "Development")
		{
			str += '<div class="colorLegend2 " style="width: 150px; background-color: '+classColor["UNDER CONSTRUCTION"]+';">Under Construction</div>';
			str += '<div class="colorLegend2 " style="width: 150px; background-color: '+classColor["PROPOSED"]+';">Proposed</div>';
		}
		else if(lastSelectedBuildingType == "OfficeRentalRates")
		{
			$.each(window.priceSQMRange, function (index, eachColor){
				var low = eachColor.low;
				if(low != 0)
					low = numberWithCommaWithoutDecimal(low, "$");
				var high = numberWithCommaWithoutDecimal(eachColor.high, "$");
				var displayText = low+' - '+high;
				if(eachColor.low == 0)
					displayText = '< '+high;
				if(eachColor.high == 120000)
					displayText = '> '+numberWithCommaWithoutDecimal(eachColor.low, "$");
				str += '<div class="colorLegend2 " style="width: 120px; background-color: '+eachColor.color+';">'+displayText+'</div>';
			});
		}
		else if(lastSelectedBuildingType == "InvestmentSalesMarket")
		{
			//str += '<div class="colorLegend2 " style="width: 170px; background-color: '+classColor["Office"]+';">Office</div>';
			//str += '<div class="colorLegend2 " style="width: 170px; background-color: '+classColor["OfficeConversion"]+';">Office Conversion</div>';
			$.each(window.investmentSalesColors, function (i, eachColor){
				if(eachColor.range_start == 0 && eachColor.range_end == 0)
				{
					str += '<div class="colorLegend2 " style="width: 105px; background-color: '+eachColor.hex_color+';">'+eachColor.range_text+'</div>';
				}
				else if(i == 0 && eachColor.range_start == 0)
				{
					//Start
					str += '<div class="colorLegend2 " style="width: 105px; background-color: '+eachColor.hex_color+';">< $'+eachColor.range_end+' psf</div>';
				}
				else if( eachColor.range_end == 0)
				{
					//End
					str += '<div class="colorLegend2 " style="width: 105px; background-color: '+eachColor.hex_color+';">> $'+eachColor.range_start+'</div>';
				}
				else
				{
					//All Inbetween
					str += '<div class="colorLegend2 " style="width: 105px; background-color: '+eachColor.hex_color+';">$'+eachColor.range_start+' - $'+eachColor.range_end+'</div>';
				}
			});
		}
		$(".legendContainer").html(str);
		$("#legendPanel").show();
	}
}

window.isolateEffectActive = false;
function backToSummaryInfobox()
{
	devSelectedBuilding = '';
	if(buildingAssetEffectActive)
	{
		$(".floorNumberRowTR").hide();
		clearBuildingAssets();
		buildingAssetEffectActive = false;
	}
	if(spotlightEffectActive)
	{
		clearSpotlightEffect();
		spotlightEffectActive = false;
	}
	if(isolateEffectActive)
	{
		clearIsolateOnDarkEffect();
		isolateEffectActive = false;
	}
	if(highlightEffectActive)
	{
		clearHighlightEffect();
		highlightEffectActive = false;
	}
	if(typeof googleTileset.clippingPolygons != "undefined")
		googleTileset.clippingPolygons.enabled = false;
	if(clipTileset != null && typeof clipTileset.clippingPolygons != "undefined")
		clipTileset.clippingPolygons.enabled = false;
	if(clipTileset != null && typeof clipTileset != "undefined")
		clipTileset.show = false;
	resetLastSelectedPrimitive();
	highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false);
	ShowSummaryInfobox();
}

function clearLastSelectedFunctions()
{
	//removeTerrain();
	$("#clickStartRatingContainerId").remove();
	viewer.entities.removeById("starRatingBox");
	devSelectedBuilding = '';
	if(window.buildingRotationInProgress)
	{
		stopCameraRotation2();
		window.buildingRotationInProgress = false;
	}
	if(buildingAssetEffectActive)
	{
		$(".floorNumberRowTR").hide();
		clearBuildingAssets();
		buildingAssetEffectActive = false;
	}
	if(spotlightEffectActive)
	{
		clearSpotlightEffect();
		spotlightEffectActive = false;
	}
	if(highlightEffectActive)
	{
		clearHighlightEffect();
		highlightEffectActive = false;
	}
	if(isolateEffectActive)
	{
		viewer.scene.globe.depthTestAgainstTerrain = false;
		//removeTerrain();
		if(clipTileset != null && typeof clipTileset.clippingPolygons != "undefined")
		{
			clipTileset.clippingPolygons.enabled = false;
			clipTileset.clippingPolygons.inverse = false;
			clipTileset.show = false;
		}
		
		if(typeof googleTileset.clippingPolygons != "undefined" & googleTileset.clippingPolygons != null)
		{
			googleTileset.clippingPolygons.enabled = false;
		}
		clearIsolateOnDarkEffect();
		isolateEffectActive = false;
	}
	
	clearCityFloorplans();
	
	if(googleTileset != null && typeof googleTileset.clippingPolygons != "undefined")
		googleTileset.clippingPolygons.enabled = false;
	if(clipTileset != null && typeof clipTileset.clippingPolygons != "undefined")
		clipTileset.clippingPolygons.enabled = false;
	if(clipTileset != null && typeof clipTileset != "undefined")
		clipTileset.show = false;
}

/* ============================================================
   Plain Bootstrap 5 dropdowns — no plugin required. Just needs
   Bootstrap's CSS + JS bundle (bootstrap.bundle.min.js, which
   includes Popper) loaded on the page for data-bs-toggle to work.
 
   Markup matches the sample exactly:
     <div class="dropdown">
       <button class="btn ... dropdown-toggle" data-bs-toggle="dropdown">...</button>
       <ul class="dropdown-menu">
         <li><a class="dropdown-item" href="#">...</a></li>
       </ul>
     </div>
 
   Both dropdowns keep the original variable names
   (cityDropdownOption, buildingTypeOption) and a hidden input with
   the original element ID (#mainCityDropdown / #marketDropdown) so
   other code reading $('#mainCityDropdown').val() still works.
   ============================================================ */
 
// ── Shared click handler for every dropdown-item (define once, not per-loop) ──
function selectDropdownItem(triggerEl, hiddenInputId, labelId, value, callbackFnName) {
	if (triggerEl.classList.contains('disabled')) return false;
 
	var hiddenInput = document.getElementById(hiddenInputId);
	if (hiddenInput) hiddenInput.value = value;
 
	var label = document.getElementById(labelId);
	if (label) label.textContent = triggerEl.textContent.trim();
 
	var menu = triggerEl.closest('.dropdown-menu');
	if (menu) {
		menu.querySelectorAll('.dropdown-item.active').forEach(function (el) {
			el.classList.remove('active');
		});
	}
	triggerEl.classList.add('active');

	// close the menu after picking an item
	var dd = triggerEl.closest('.nested-dropdown');
	if (dd) {
		dd.classList.remove('open');
		var toggleBtn = dd.querySelector('.dropdown-toggle');
		if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
	}

	if (typeof window[callbackFnName] === 'function') {
		window[callbackFnName](value);
	}
	return false; // cancel the href="#" jump
}

var buildingTypeDropdown = ["Floorplan", "Office", "Hotel", "Residential", "Development", "All"];

// Pressing 1 switches to the first visualization, 2 to the second, and so on.
// Rather than indexing into the static buildingTypeDropdown array, this reads
// the actual rendered dropdown items at keypress time, so it always matches
// what's really on screen - including conditional entries (e.g. "Investment
// Sales Market", "Example Market Vacancy") that aren't in the static list.
// Ctrl+1 etc. is reserved by the browser for tab-switching, so this uses the
// plain number keys instead - but only when the search box isn't open/being
// typed into, since search takes priority over these shortcuts.
document.addEventListener("keydown", function (e) {
	if (e.ctrlKey || e.metaKey || e.altKey)
		return;
	if (typeof searchActive != "undefined" && searchActive)
		return;
	var target = e.target;
	if (target && (target.tagName == "INPUT" || target.tagName == "TEXTAREA" || target.isContentEditable))
		return;
	var index = parseInt(e.key, 10) - 1;
	if (isNaN(index) || index < 0)
		return;
	var menuItems = document.querySelectorAll("ul[aria-labelledby='marketDropdownBtn'] li a.dropdown-item");
	if (index >= menuItems.length)
		return;
	e.preventDefault();
	menuItems[index].click();
});
var lastSelectedBuildingType = "Office";
var lastSelectedMarket = null;
window.cityLabels = [];
var disabledMarkets = [];
disabledMarkets = [7, 8, 9, 45, 48, 3, 78];//Move to DB
window.marketsEnabledForInvestmentSales = [1, 3, 6, 18, 26, 7, 8, 9];//Downtown Calgary, Downtown Toronto, Suburban Calgary, Downtown Vancouver, Downtown Edmonton, NY markets
window.citiesEnabledForInvestmentSales = [1, 2, 12, 15, 4];//Calgary, Toronto, Vancouver, Edmonton, NY
function ShowSummaryInfobox()
{
	//console.log("Inside Summary => "+lastSelectedBuildingType);
	$(".logoOverlay").show();
	$(".marketStatsButtonContainer").hide();
	// ══════════════════════════════════════════════════════════════
	// CITY / MARKET DROPDOWN  (Country > City > Market)
	// ══════════════════════════════════════════════════════════════
	var cityDropdownOption = "<div class='dropdown nested-dropdown' style='width: 49% !important;'>";
	cityDropdownOption += "<button class='btn dropdown-toggle w-100' type='button' id='mainCityDropdownBtn' aria-haspopup='true' aria-expanded='false' style='font-size:16px;'><span id='mainCityDropdownLabel'>Select Market</span></button>";
	cityDropdownOption += "<ul class='dropdown-menu nested-dropdown-menu' aria-labelledby='mainCityDropdownBtn'>";
	 
	var selectedCityLabel = "Select Market";
	var country = null;
	var city = null;
	 
	var cityDropdownDetails = [];
	$.each(marketDetails, function (index, eachMarket) {
		if (typeof cityDropdownDetails[eachMarket.country] == "undefined")
			cityDropdownDetails[eachMarket.country] = [];
	 
		if (typeof cityDropdownDetails[eachMarket.country][eachMarket.scityname] == "undefined")
			cityDropdownDetails[eachMarket.country][eachMarket.scityname] = [];
	 
		cityDropdownDetails[eachMarket.country][eachMarket.scityname].push(eachMarket);
	});
	 
	//console.log(cityDropdownDetails);
	isDisabled = "";
	 
	for (const country in cityDropdownDetails) {
		// Country — level 0 (bold header, no indent)
		cityDropdownOption += "<li><h6 class='dropdown-header nested-level-0'>" + country + "</h6></li>";
	 
		const cities = cityDropdownDetails[country];
		for (const city in cities) {
			if (cities[city].length > 1) {
				// City — level 1 header (multiple markets underneath)
				cityDropdownOption += "<li><h6 class='dropdown-header nested-level-1'>" + city + "</h6></li>";
	 
				const markets = cities[city];
				markets.forEach((market, index) => {
					var isSelected = (lastMarketLoaded == market.idtmarket);
					var activeClass = isSelected ? " active" : "";
					var disabledClass = isDisabled ? " disabled" : "";
					if (isSelected) selectedCityLabel = market.smarketname;
	 
					cityDropdownOption += "<li><a class='dropdown-item nested-level-2" + activeClass + disabledClass + "' href='#' onclick=\"return selectDropdownItem(this,'mainCityDropdown','mainCityDropdownLabel','" + market.idtmarket + "','loadMarket')\">" + market.smarketname + "</a></li>";
				});
			} else {
				// City — level 1, acting as the leaf item itself (single market)
				var mkt = cities[city][0];
				var isSelected = (lastMarketLoaded == mkt.idtmarket);
				var activeClass = isSelected ? " active" : "";
				var disabledClass = isDisabled ? " disabled" : "";
				if (isSelected) selectedCityLabel = mkt.scityname;
	 
				cityDropdownOption += "<li><a class='dropdown-item nested-level-1" + activeClass + disabledClass + "' href='#' onclick=\"return selectDropdownItem(this,'mainCityDropdown','mainCityDropdownLabel','" + mkt.idtmarket + "','loadMarket')\">" + mkt.scityname + "</a></li>";
			}
		}
	}
	
	cityDropdownOption += "</ul>";
	cityDropdownOption += "<input type='hidden' id='mainCityDropdown' value='" + (lastMarketLoaded || '') + "'>";
	cityDropdownOption += "</div>";
	 
	//console.log(cityDropdownOption);
	 
	// ══════════════════════════════════════════════════════════════
	// BUILDING TYPE DROPDOWN
	// ══════════════════════════════════════════════════════════════
	var buildingTypeOption = "<div class='dropdown nested-dropdown' style='width: 49% !important;'>";
	buildingTypeOption += "<button class='btn dropdown-toggle w-100' type='button' id='marketDropdownBtn' aria-haspopup='true' aria-expanded='false' style='font-size:16px;'><span id='marketDropdownLabel'>Select Type</span></button>";
	buildingTypeOption += "<ul class='dropdown-menu nested-dropdown-menu' aria-labelledby='marketDropdownBtn'>";
	 
	var selectedBuildingTypeLabel = "Select Type";
	 
	$.each(buildingTypeDropdown, function (index, eachType) {
		var dropdownClass = " ";
		var dText = eachType + " Market";
		if (eachType == "Floorplan") dText = "Available Office Space";
		if (eachType == "Development") dText = "Development Activity";
		if (eachType == "Residential") dText = "Multifamily Market";
		if (eachType == "All") {
			dText = "All Properties";
			dropdownClass = " allPropertiesTextStyle ";
		}
	 
		var isSelected = (lastSelectedBuildingType == eachType);
		var activeClass = isSelected ? " active" : "";
		if (isSelected) selectedBuildingTypeLabel = dText;
	 
		buildingTypeOption += "<li><a class='dropdown-item" + dropdownClass + activeClass + "' href='#' onclick=\"return selectDropdownItem(this,'marketDropdown','marketDropdownLabel','" + eachType + "','loadNewBuildingTypeView')\">" + dText + "</a></li>";
	 
		if (lastMarketLoaded == 36 && eachType == "All") {
			buildingTypeOption += "<li><hr class='dropdown-divider'></li>";
	 
			var vacancySelected = (lastSelectedBuildingType == "AvailableOfficeSpace");
			if (vacancySelected) selectedBuildingTypeLabel = "Example Market Vacancy";
			buildingTypeOption += "<li><a class='dropdown-item" + (vacancySelected ? " active" : "") + "' href='#' onclick=\"return selectDropdownItem(this,'marketDropdown','marketDropdownLabel','AvailableOfficeSpace','loadNewBuildingTypeView')\">Example Market Vacancy</a></li>";
	 
			var ratesSelected = (lastSelectedBuildingType == "OfficeRentalRates");
			if (ratesSelected) selectedBuildingTypeLabel = "Example Market Rates";
			buildingTypeOption += "<li><a class='dropdown-item" + (ratesSelected ? " active" : "") + "' href='#' onclick=\"return selectDropdownItem(this,'marketDropdown','marketDropdownLabel','OfficeRentalRates','loadNewBuildingTypeView')\">Example Market Rates</a></li>";
		}
	 
		if (window.marketsEnabledForInvestmentSales.includes(parseInt(lastMarketLoaded)) && eachType == "Office") {
			var invSelected = (lastSelectedBuildingType == "InvestmentSalesMarket");
			if (invSelected) selectedBuildingTypeLabel = "Investment Sales Market";
			buildingTypeOption += "<li><a class='dropdown-item" + (invSelected ? " active" : "") + "' href='#' onclick=\"return selectDropdownItem(this,'marketDropdown','marketDropdownLabel','InvestmentSalesMarket','loadNewBuildingTypeView')\">Investment Sales Market</a></li>";
		}
	});
	 
	buildingTypeOption += "</ul>";
	buildingTypeOption += "<input type='hidden' id='marketDropdown' value='" + (lastSelectedBuildingType || '') + "'>";
	buildingTypeOption += "</div>";
	 
	/* ============================================================
	   After inserting cityDropdownOption / buildingTypeOption into the
	   DOM, set each button's initial label to match the pre-selected
	   item (Bootstrap dropdowns don't do this automatically, unlike a
	   native <select>):
	 
		 document.getElementById('mainCityDropdownLabel').textContent = selectedCityLabel;
		 document.getElementById('marketDropdownLabel').textContent = selectedBuildingTypeLabel;
	 
	   No other JS initialization call is needed — Bootstrap's bundle
	   auto-wires any element with data-bs-toggle="dropdown" as soon as
	   it's clicked, even if it was just inserted into the DOM.
	   ============================================================ */
	   
	//$(".summaryInfoboxCityDetails").html("<b>Downtown</b> "+cityDropdownOption+" "+buildingTypeOption+" <b>Market</b>&nbsp;&nbsp; <span style='position: absolute; right: 15px;font-size: 12px;'><a href='javascript:reloadCityCamera();' >Skyline</a></span>");
	//<span style='position: absolute; right: 15px;font-size: 12px;'><a href='javascript:reloadCityCamera();' >Skyline</a></span>
	$(".summaryInfoboxCityDetails").html(""+cityDropdownOption+" "+buildingTypeOption+"");
	
	document.getElementById('mainCityDropdownLabel').textContent = selectedCityLabel;
	document.getElementById('marketDropdownLabel').textContent = selectedBuildingTypeLabel;
	 
	//Need to do something for this. Hardcoded
	loadSydneyMarketDropdown(parseInt(lastCityLoaded), "", false);
	var str = '';
	showAdditionalSummaryInfobox = false;
	var submarketSummaryBuildingType = "Office";
	if(lastSelectedBuildingType == "AvailableOfficeSpace" && window.ArealyticsSuiteSummary != null)
	{
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		//Do not display incomplete table yet.
		/*
		str += "<tr><td colspan='5'></td></tr>";
		str += "<tr><td>Type</td><td class='alignCenter'>Properties</td>";
		str += "<td class='alignCenter'>Units</td>";
		str += "<td>Available (sqm)</td><td>Vacancy</td></tr>";
		
		var availability = summaryDetails[36]["A"].officeArea + summaryDetails[36]["B"].officeArea + summaryDetails[36]["C"].officeArea;
		availability = parseFloat(availability  * cityAreaMeasurementMultiplier);
		//var totalArea = parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea);
		str += "<tr>";
			str += "<td style='background-color:"+classColor["Direct"]+"'><b>Direct</b></td>";
			str += "<td class='alignRight'>"+window.ArealyticsSuiteSummary["Direct"].buildings+"</td>";
			str += "<td class='alignRight'>"+window.ArealyticsSuiteSummary["Direct"].units+"</td>";
			str += "<td>"+printNumberFormat(Math.round(parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea)))+"</td>";
			var directVacancy = ((parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea)/availability) * 100).toFixed(2);
			str += "<td>"+directVacancy+"</td>";
		str += "</tr>";
		
		str += "<tr>";
			str += "<td style='background-color:"+classColor["Sublease"]+"'><b>Sublease</b></td>";
			str += "<td class='alignRight'>"+window.ArealyticsSuiteSummary["Sublease"].buildings+"</td>";
			str += "<td class='alignRight'>"+window.ArealyticsSuiteSummary["Sublease"].units+"</td>";
			str += "<td>"+printNumberFormat(Math.round(parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea)))+"</td>";
			var subLeaseVacancy = ((parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea)/availability) * 100).toFixed(2);
			str += "<td>"+subLeaseVacancy+"</td>";
		str += "</tr>";
		
		str += "<tr>";
			str += "<td style='background-color:"+classColor["Co-Working"]+"' width='80px'><b>Co-Working</b></td>";
			str += "<td class='alignRight'>"+window.ArealyticsSuiteSummary["Co-Working"].buildings+"</td>";
			str += "<td class='alignRight'>"+window.ArealyticsSuiteSummary["Co-Working"].units+"</td>";
			str += "<td>"+printNumberFormat(Math.round(parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea)))+"</td>";
			var coWorkingVacancy = ((parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea)/availability) * 100).toFixed(2);
			str += "<td>"+coWorkingVacancy+"</td>";
		str += "</tr>";
		
		str += "<tr>";
			str += "<td><b>Total</b></td>";
			str += "<td class='alignRight'>"+(parseInt(window.ArealyticsSuiteSummary["Direct"].buildings) + parseInt(window.ArealyticsSuiteSummary["Sublease"].buildings) + parseInt(window.ArealyticsSuiteSummary["Co-Working"].buildings))+"</td>";
			str += "<td class='alignRight'>"+parseInt(window.ArealyticsSuiteSummary["Direct"].units) + parseInt(window.ArealyticsSuiteSummary["Sublease"].units) + parseInt(window.ArealyticsSuiteSummary["Co-Working"].units)+"</td>";
			str += "<td>"+printNumberFormat(parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Co-Working"].units))+"</td>";
			str += "<td>"+( parseFloat(directVacancy) + parseFloat(subLeaseVacancy) + parseFloat(coWorkingVacancy) )+"</td>";
		str += "</tr>";
		*/
		str += "</table>";
		
	}
	else if(lastSelectedBuildingType == "OfficeRentalRates" && window.ArealyticsPricePerSQMSummary != null)
	{
		//var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		
		//str += "</table>";
		
	}
	else if(lastSelectedBuildingType == "InvestmentSalesMarket" && window.calgaryOfficeSaleSummary != null)
	{
		//var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		
		//str += "</table>";
		
	}
	else if(lastSelectedBuildingType == "Hotel")
	{
		showAdditionalSummaryInfobox = false;
		submarketSummaryBuildingType = "Hotel";
		if(hotelSummaryDetails.length > 0 && typeof hotelSummaryDetails[lastMarketLoaded] != "undefined")
		{
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			str += "<tr><td colspan='5'></td></tr>";
			str += "<tr><td>Rating</td><td class='alignCenter'>Properties</td>"; 
			str += "<td class='alignCenter'>Doors</td>";
			str += "<td class='alignCenter'>Average Age</td><td class='alignCenter'>Avg Nightly Rate</td></tr>";
			var totalBlgs = 0;
			var totalUnits = 0;
			var totalAverageAge = 0;
			var avgCount = 0;
			var cellWidth = " width: 60px; ";
			
			for(var i = 5; i > 0; i--)
			{
				var eachRow = hotelSummaryDetails[lastMarketLoaded][i];
				
				str += "<tr>";
				str += "<td style='background-color:"+classColor['HOTEL']+";"+cellWidth+"'>"+getHotelStarPattern(parseInt(eachRow.star_rating))+"</td>";
				str += "<td class='alignCenter'>"+printNumberFormat(eachRow.totalBuildings)+"</td>";
				str += "<td class='alignCenter'>"+printNumberFormat(eachRow.totalUnits)+"</td>";
				if(eachRow.year_difference == 0 || eachRow.year_difference == null)
				{
					eachRow.year_difference = "";
					str += "<td class='alignCenter'></td>";
				}
				else
				{
					str += "<td class='alignCenter'>"+printNumberFormat(eachRow.year_difference)+"</td>";
					avgCount++;
				}
				str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td>";
				str += "</tr>";
				totalBlgs += parseInt(eachRow.totalBuildings);
				totalUnits += parseInt(eachRow.totalUnits);
				if(eachRow.year_difference != "")
					totalAverageAge += parseInt(eachRow.year_difference);
			}
			str += "<tr class='row-with-totals'><td>Total</td><td  class='alignCenter'>"+printNumberFormat(totalBlgs)+"</td><td class='alignCenter'>"+printNumberFormat(totalUnits)+"</td><td class='alignCenter'>";
			if(avgCount > 0 && parseInt(totalAverageAge/avgCount) != 0)
				str += parseInt(totalAverageAge/avgCount);
			str += "</td><td></td></tr>";
		}
	}
	else if(lastSelectedBuildingType == "Development")
	{
		if( developmentBuildingSummary.length > 0 && typeof developmentBuildingSummary[lastMarketLoaded] != "undefined" && typeof developmentBuildingSummary[lastMarketLoaded]["PROPOSED"] != "undefined" )
		{
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			str += "<tr><td colspan='4'></td></tr>";
			str += "<tr><td valign='top'>Status</td><td valign='top' class='alignCenter'>Projects</td><td class='alignCenter'>Resi Units</td><td class='alignCenter'>Hotel Doors</td><td class='alignCenter'>Office "+cityAreaMeasurementUnit.replace(" ", "&nbsp;")+"</td></tr>"; 
			
			//str += "<td>Occupancy</td><td>Avg Nightly Rate</td></tr>";
			var totalBlgs = 0;
			var totalUnits = 0;
			var totalOfficeArea = 0;
			var cellWidth = " width: 180px; ";
				
				str += "<tr>";
					str += "<td class='infoboxLegendTD' style='background-color:"+classColor['UNDER CONSTRUCTION']+";"+cellWidth+"'>UNDER CONSTRUCTION</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].totalBuildings)+"</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].resiUnits)+"</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].hoteldoors)+"</td>";
					str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].officeArea), "", "")+"</td>";
					
					//str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td>";
					//str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td>";
				str += "</tr>";
				
				str += "<tr>";
					str += "<td class='infoboxLegendTD' style='background-color:"+classColor['PROPOSED']+";"+cellWidth+"'>PROPOSED</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].totalBuildings)+"</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].resiUnits)+"</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].hoteldoors)+"</td>";
					str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].officeArea), "", "")+"</td>";
					
					//str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td>";
					//str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td>";
				str += "</tr>";
				
				totalBlgs = parseInt(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].totalBuildings) + parseInt(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].totalBuildings);
				totalUnits = parseInt(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].resiUnits) + parseInt(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].resiUnits);
				totalHotelDoors = parseInt(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].hoteldoors) + parseInt(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].hoteldoors);
				if(typeof developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].officeArea == "undefined")
					developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].officeArea = 0;
				if(typeof developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].officeArea == "undefined")
					developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].officeArea = 0;
				totalOfficeArea = parseInt(developmentBuildingSummary[lastMarketLoaded]["PROPOSED"].officeArea) + parseInt(developmentBuildingSummary[lastMarketLoaded]["UNDER CONSTRUCTION"].officeArea);
				
			str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBlgs)+"</td><td class='alignCenter'>"+printNumberFormat(totalUnits)+"</td><td class='alignCenter'>"+printNumberFormat(totalHotelDoors)+"</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(totalOfficeArea), "", "")+"</td></tr>";
		}
		else
		{
			str = "";
		}
	}
	else if(lastSelectedBuildingType == "All")
	{
		showAdditionalSummaryInfobox = false;
		submarketSummaryBuildingType = "All";
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		cellWidth = " width: 95px;";
		str += "<tr><td>Class</td><td class='alignCenter'>Properties</td><td class='alignCenter'>Average Age</td><td class='alignCenter'>Area</td></tr>"; 
		if(typeof allBuildingVisualizationSummary[parseInt(lastMarketLoaded)] != "undefined")
		{
			str += "<tr>"+classFilterSummaryCell('AA', getPrimeOfficeChange(), cellWidth)+"<td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["AA"][0])+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["AA"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["AA"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('A', buildingClasses["A"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["A"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["A"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["A"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('B', buildingClasses["B"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["B"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["B"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["B"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('C', buildingClasses["C"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["C"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["C"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["C"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('Retail', buildingClasses["Retail"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["Retail"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["Retail"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["Retail"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('MDU', buildingClasses["MDU"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MDU"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MDU"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["Condominiums"].officeArea, "", " units")+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('Apartments', 'Apartments', cellWidth, 'APT')+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["APT"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["APT"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["Apartments"].officeArea, "", " units")+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('HOTEL', buildingClasses["HOTEL"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["HOTEL"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["HOTEL"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["Hotel"].officeArea, "", " doors")+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('SENIOR', buildingClasses["SENIOR"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["SENIOR"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["SENIOR"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["SENIOR"].officeArea, "", " units")+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('EDU', buildingClasses["EDU"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EDU"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EDU"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["EDU"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('MED', buildingClasses["MED"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MED"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MED"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["MED"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			
			str += "<tr>"+classFilterSummaryCell('EMS', buildingClasses["EMS"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EMS"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EMS"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["EMS"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			
			str += "<tr>"+classFilterSummaryCell('GOV', buildingClasses["GOV"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["GOV"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["GOV"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["GOV"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr>"+classFilterSummaryCell('PRKS', buildingClasses["PRKS"], cellWidth)+"<td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["PRKS"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["PRKS"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["PRKS"].stalls, "", " stalls")+"</td></tr>"; 
			
			var avgCount = 0;
			$.each(["AA", "A", "B", "C", "Retail", "MDU", "APT", "HOTEL", "SENIOR", "EDU", "MED", "GOV", "PRKS"], function (iiijj, eachItClass){
				if(parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)][eachItClass][1]) > 0)
					avgCount++;
			});
			avgAge = Math.round((parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["AA"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["A"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["B"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["C"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["Retail"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MDU"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["APT"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["HOTEL"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["SENIOR"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EDU"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MED"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["GOV"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["PRKS"][1]) ) / avgCount, 0);
			
			grossLeasableArea = parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["AA"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["A"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["B"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["C"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["Retail"].officeArea));
			
			totalResidentialUnit = (parseInt(summaryDetails[parseInt(lastMarketLoaded)]["Condominiums"].officeArea) + parseInt(summaryDetails[parseInt(lastMarketLoaded)]["Apartments"].officeArea) + parseInt(summaryDetails[parseInt(lastMarketLoaded)]["SENIOR"].officeArea) );
			
			str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["TOTAL"][0])+"</td><td class='alignCenter'></td><td></td></tr>"; 
			//str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["TOTAL"][0])+"</td><td class='alignCenter'></td></tr>"; 
			str += "<tr class='row-with-totals2'><td colspan='2'>Commercial Market (GLA)</td><td></td><td>"+numberWithCommaWithoutDecimal(grossLeasableArea, "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr class='row-with-totals2'><td colspan='2'>Residential Inventory</td><td></td>  <td>"+numberWithCommaWithoutDecimal(totalResidentialUnit, "", " units")+"</td></tr>"; 
		}
		str += "</table>";
		
	}
	else if(lastSelectedBuildingType == "Office")
	{
		showAdditionalSummaryInfobox = true;
		submarketSummaryBuildingType = "Office";
		//if(typeof summaryDetails[lastMarketLoaded] != "undefined" && summaryDetails[lastMarketLoaded].length > 0)
		if(typeof summaryDetails[lastMarketLoaded] != "undefined")
		{
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			str += "<tr><td colspan='5'></td></tr>";
			str += "<tr><td>Class</td><td style='text-align: center;padding-left: 10px !important;'>Properties</td>";
			str += "<td class='alignCenter'>"+cityAreaMeasurementUnit+"</td>";
			str += "<td>Average Age</td><td>Vacancy</td></tr>";
			
			var totalBuildings = 0;
			var totalArea = 0;
			var totalAOSArea = 0;
			var totalYearDifference = 0;
			var totalYearDifferenceDivider = 0;
			var totalUnits = 0;
			var prefix = "";
			var suffix = "&nbsp;Office";
			var officeClassPrint = ["AA", "A", "B", "C"];
			var totalVacancy = 0;
			$.each(officeClassPrint, function (index, eachClass){
				var eachClassDisplay = eachClass;
				cellWidth = " width: 60px; ";
				if(eachClassDisplay == "AA")
				{
					eachClassDisplay = getPrimeOfficeChange();//marketDetailsV2[lastMarketLoaded].class_aa_rename.replace(" Office", "");
					if(eachClassDisplay == "Prime")
						cellWidth = " width: 80px; ";
				}
				eachRow = summaryDetails[lastMarketLoaded][eachClass];
				str += "<tr id='"+eachClass+"'>"+classFilterSummaryCell(eachClass, buildingClasses[eachClass], cellWidth+";")+"<td class='alignCenter'>"+printNumberFormat(eachRow.totalBuildings)+"</td>";
				str += "<td  class='alignCenter'>"+printNumberFormat(Math.round(parseFloat(eachRow.officeArea) * parseFloat(cityAreaMeasurementMultiplier)))+"</td>";
				
				//str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td></tr>";
				if(eachRow.year_difference == null || eachRow.year_difference == 0)
				{
					str += "<td  class='alignCenter'></td>";
				}
				else
				{
					str += "<td  class='alignCenter'>"+eachRow.year_difference+"</td>";
					totalYearDifferenceDivider++;
					totalYearDifference += parseInt(eachRow.year_difference);
				}
				
				if(parseInt(summaryDetails[lastMarketLoaded]["officeSuite"][eachClass]) > 0)
				{
					totalAOSArea += parseInt(summaryDetails[lastMarketLoaded]["officeSuite"][eachClass]);
					var vacancyRate = ((summaryDetails[lastMarketLoaded]["officeSuite"][eachClass] / parseFloat(eachRow.officeArea))*100).toFixed(2);
					totalVacancy += parseFloat(vacancyRate);
					var vacancyRate = vacancyRate+"%";
					str += "<td class='hiddenGrayField2' style=''>"+vacancyRate+"</td>";
				}
				else
				{
					str += "<td class='hiddenGrayField22' style=''>-</td>";
				}
				
				totalBuildings += eachRow.totalBuildings;
				totalArea += eachRow.officeArea;
			});
			/*
			$.each(summaryDetails[lastMarketLoaded], function (eachClass, eachRow){
				var proceedWithBuilding = false;
				var prefix = "Office ";
				if(lastSelectedBuildingType == "Office" && officeClasses.includes(eachClass))
				{
					proceedWithBuilding = true;
				}
				
				if(proceedWithBuilding)
				{
					
					var cellWidth = "";
					var eachClassDisplay = eachClass;
					if(eachClass == "SENIOR")
					{
						eachClassDisplay = "Senior";
					}
					if(eachClass == "Condominiums")
					{
						cellWidth = " width: 95px; ";
					}
					if(eachClass == "A")
					{
						
				}
			});
			if(lastSelectedBuildingType == "AvailableOfficeSpace" && window.ArealyticsSuiteSummary != null)
			{
				
			}
			else
			{
				
			}
			*/
				if(cityAreaMeasurementUnit.toLowerCase() == "sqm" && lastSelectedBuildingType == "Office")
					totalArea = parseFloat(totalArea) * parseFloat(cityAreaMeasurementMultiplier);
				totalArea = Math.round(totalArea);
				str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td  class='alignCenter'>"+printNumberFormat(totalArea)+"</td>";
				//<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td>
				str += "<td class='alignCenter'>"+Math.round(totalYearDifference/totalYearDifferenceDivider)+"</td>";
				//console.log("totalAOSArea: "+totalAOSArea+", totalArea: "+totalArea);
				str += "<td style=''>";
					if(!isNaN(((totalAOSArea / totalArea)*100).toFixed(2)))
						str += ((totalAOSArea / totalArea)*100).toFixed(2)+"%";
					else
						str += "";
						
				str += "</td>";
				str += "</tr>";
				str += "</table>";
			/*
			if(lastSelectedBuildingType == "Office" || lastSelectedBuildingType == "Residential")
				str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td style='float:right;'>"+printNumberFormat(totalArea.toFixed(2))+"</td><td></td><td></td></tr>";
			else
				str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td style='float:right;'>"+printNumberFormat(totalUnits)+"</td><td></td><td></td></tr>";
			*/
		}
	}
	else if(lastSelectedBuildingType != "Floorplan" )
	{
		if(lastSelectedBuildingType == "Residential")
		{
			showAdditionalSummaryInfobox = false;
			submarketSummaryBuildingType = "Multifamily";
		}
		//if(typeof summaryDetails[lastMarketLoaded] != "undefined" && summaryDetails[lastMarketLoaded].length > 0)
		if(true)
		{
			var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
			str += "<tr><td colspan='5'></td></tr>";
			str += "<tr><td>Class</td><td class='alignCenter'>Properties</td>";
			if(lastSelectedBuildingType == "Office")
				str += "<td class='alignCenter'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+cityAreaMeasurementUnit+"</td>";
			else if(lastSelectedBuildingType == "Residential")
				str += "<td class='alignCenter'>Units</td>";
			
			if(lastSelectedBuildingType == "Office")
			{
				str += "<td class='alignCenter'>Availability</td><td class='alignCenter'>Asking Rent</td></tr>";
			}
			else if(lastSelectedBuildingType == "Residential")
			{
				str += "<td class='alignCenter'>Average Age</td><td class='alignCenter'>Availability</td></tr>";
			}
			
			var totalBuildings = 0;
			var totalArea = 0;
			var totalUnits = 0;
			var totalYearDifference = 0;
			var avgAgeDivider = 0;
			$.each(summaryDetails[lastMarketLoaded], function (eachClass, eachRow){
				var proceedWithBuilding = false;
				var prefix = "";
				if(lastSelectedBuildingType == "Office" && officeClasses.includes(eachClass))
				{
					prefix = "Office ";
					proceedWithBuilding = true;
				}
				else if(lastSelectedBuildingType == "Residential" && residentialClasses.includes(eachClass))
				{
					proceedWithBuilding = true;
				}
				else if(lastSelectedBuildingType == "Hotel" && hotelClassesLower.includes(eachClass.toLowerCase()))
				{
					proceedWithBuilding = true;
				}
				if(proceedWithBuilding)
				{
					totalBuildings += eachRow.totalBuildings;
					totalArea += eachRow.officeArea;
					var cellWidth = "";
					var eachClassDisplay = eachClass;
					if(eachClass == "SENIOR")
					{
						eachClassDisplay = "Retirement";
					}
					if(eachClass == "Condominiums")
					{
						cellWidth = " width: 95px; ";
					}
					if(eachClass == "A")
					{
						cellWidth = " width: 60px; ";
					}
					str += "<tr id='"+eachClass+"'>"+classFilterSummaryCell(eachClass, prefix+""+eachClassDisplay, cellWidth)+"<td class='alignCenter'>"+printNumberFormat(eachRow.totalBuildings)+"</td>";
					if(lastSelectedBuildingType == "Office" && cityAreaMeasurementUnit.toLowerCase() == "sqm")
						str += "<td class='alignRight'>"+printNumberFormat(Math.round(parseFloat(eachRow.officeArea) * parseFloat(cityAreaMeasurementMultiplier)))+"</td>";
					else
						str += "<td class='alignRight'>"+printNumberFormat(eachRow.officeArea)+"</td>";
					
					if(lastSelectedBuildingType == "Office")
					{
						str += "<td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td></tr>";
					}
					else if(lastSelectedBuildingType == "Residential")
					{
						if(eachRow.year_difference == null || eachRow.year_difference == 0)
						{
							str += "<td class='alignCenter'></td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td></tr>";
							
						}
						else
						{
							str += "<td class='alignCenter'>"+parseInt(eachRow.year_difference)+"</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td></tr>";
							totalYearDifference += parseInt(eachRow.year_difference);
							avgAgeDivider++;
						}
					}
				}
			});
			if(lastSelectedBuildingType == "AvailableOfficeSpace" && window.ArealyticsSuiteSummary != null)
			{
				
			}
			else
			{
				if(cityAreaMeasurementUnit.toLowerCase() == "sqm" && lastSelectedBuildingType == "Office")
					totalArea = parseFloat(totalArea) * parseFloat(cityAreaMeasurementMultiplier);
				totalArea = Math.round(totalArea);
				if(lastSelectedBuildingType == "Residential")
				{
					str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td style='float:right;'>"+printNumberFormat(totalArea)+"</td><td class='alignCenter'>"+printNumberFormat(parseInt(totalYearDifference/avgAgeDivider))+"</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td></tr>";
				}
				else
				{
					str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td style='float:right;'>"+printNumberFormat(totalArea)+"</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td><td class='hiddenGrayField' style='padding-left: 20px !important;'>[Hidden]</td></tr>";
				}
				str += "</table>";
			}
			/*
			if(lastSelectedBuildingType == "Office" || lastSelectedBuildingType == "Residential")
				str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td style='float:right;'>"+printNumberFormat(totalArea.toFixed(2))+"</td><td></td><td></td></tr>";
			else
				str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+printNumberFormat(totalBuildings)+"</td><td style='float:right;'>"+printNumberFormat(totalUnits)+"</td><td></td><td></td></tr>";
			*/
		}
	}
	
	if(str != '')
		$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainer").show();
	if(showAdditionalSummaryInfobox)
		$(".summaryInfoboxContainerData").append(ShowSubmarketSummary(submarketSummaryBuildingType));
	if(lastSelectedBuildingType == "Residential")
	{
		$("#Apartments").next().after($("#Apartments"));
	}
}

//Tracks whether the Market Statistics / Leasing Market Statistics collapsible table is expanded,
//so it survives a refresh (persisted as &statsExpanded=1 in the URL by updateURL()). Seeded from
//the URL in index.php (window.statsTableExpanded).
if(typeof window.statsTableExpanded == "undefined")
	window.statsTableExpanded = false;

function toggleSummaryCollapse(headerEl)
{
	var body = $(headerEl).next('.summaryCollapsibleBody');
	var willExpand = !body.is(':visible');//read the state before slideToggle starts animating
	body.slideToggle(200);
	$(headerEl).find('.summaryCollapseIcon').toggleClass('fa-chevron-right fa-chevron-down');
	window.statsTableExpanded = willExpand;
	if(typeof updateURL != "undefined")
		updateURL();
}

//Markup for the collapsible section body's initial state + chevron, honouring window.statsTableExpanded
//so a refreshed page reopens the table if it was open before.
function summaryCollapsibleBodyOpen()
{
	return window.statsTableExpanded
		? { bodyStyle: "", iconClass: "fa-chevron-down" }
		: { bodyStyle: "display:none;", iconClass: "fa-chevron-right" };
}

window.selectedSubmarketId = null;
function selectSubmarketRow(el, idtsubmarket)
{
	if(window.selectedSubmarketId == idtsubmarket)
	{
		//clicked the already-selected row again: deselect and clear its boundary
		$('#submarketSummaryTable tbody tr').removeClass('summaryRowSelected');
		window.selectedSubmarketId = null;
		clearSubmarketBoundary();
		return;
	}
	$('#submarketSummaryTable tbody tr').removeClass('summaryRowSelected');
	$(el).closest('tr').addClass('summaryRowSelected');
	window.selectedSubmarketId = idtsubmarket;
	//flyToSubmarketCamera(idtsubmarket);
	drawSubmarketBoundary(idtsubmarket);
}

window.submarketBoundaryEntityList = [];
window.submarketBoundaryClearTimer = null;
function parseSubmarketBoundaryCoords(boundaryStr)
{
	if(!boundaryStr || typeof boundaryStr !== "string")
		return null;
	var points = boundaryStr.split("**");
	var flat = [];
	for(var i = 0; i < points.length; i++)
	{
		var pair = points[i].trim();
		if(pair == "")
			continue;
		var parts = pair.split(",");
		if(parts.length < 2)
			continue;
		var lon = parseFloat(parts[0]);
		var lat = parseFloat(parts[1]);
		if(isNaN(lon) || isNaN(lat))
			continue;
		flat.push(lon, lat);
	}
	if(flat.length < 6)
		return null;
	return flat;
}

//Inverse of the current dark-overlay colour (getDarkOverlayColor(), a Cesium colour name that
//defaults to WHITE) so a submarket boundary line always contrasts against the fog overlay -
//black line over a white overlay, white line over a black one.
function getSubmarketBoundaryContrastColor()
{
	var name = (typeof getDarkOverlayColor != "undefined") ? getDarkOverlayColor() : "WHITE";
	var base = (Cesium.Color[name] instanceof Cesium.Color) ? Cesium.Color[name] : Cesium.Color.WHITE;
	return new Cesium.Color(1 - base.red, 1 - base.green, 1 - base.blue, 1);
}

function drawSubmarketBoundary(idtsubmarket)
{
	clearSubmarketBoundary();
	var boundaryStr = window.submarketBoundaryLookup ? window.submarketBoundaryLookup[idtsubmarket] : null;
	var coords = parseSubmarketBoundaryCoords(boundaryStr);
	if(coords == null)
		return;
	var boundaryEntity = viewer.entities.add({
		id: "submarketBoundary_" + idtsubmarket,
		polyline: {
			positions: Cesium.Cartesian3.fromDegreesArray(coords),
			width: 4,
			clampToGround: true,
			classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
			material: new Cesium.PolylineDashMaterialProperty({
				color: getSubmarketBoundaryContrastColor(),
			}),
		},
	});
	window.submarketBoundaryEntityList.push(boundaryEntity);
	window.submarketBoundaryClearTimer = setTimeout(function (){ clearSubmarketBoundary(); }, 60000);
}

function clearSubmarketBoundary()
{
	if(window.submarketBoundaryClearTimer != null)
	{
		clearTimeout(window.submarketBoundaryClearTimer);
		window.submarketBoundaryClearTimer = null;
	}
	RemoveEntitiesByType(window.submarketBoundaryEntityList);
	window.submarketBoundaryEntityList = [];
	window.allSubmarketBoundariesShown = false;
	//Keep the "Submarket" header word in sync - normal weight whenever the boundaries are gone.
	$(".submarketBoundaryToggleWord").removeClass("boundaryToggleOn");
}

//Removes just one submarket's dashed outline + label (both the polyline and the label entity),
//and drops them from window.submarketBoundaryEntityList. Returns true if something was removed.
function removeOneSubmarketBoundary(idtsubmarket)
{
	var lineId = "submarketBoundary_" + idtsubmarket;
	var labelId = "submarketBoundaryLabel_" + idtsubmarket;
	var existed = viewer.entities.getById(lineId) != null;
	viewer.entities.removeById(lineId);
	viewer.entities.removeById(labelId);
	window.submarketBoundaryEntityList = (window.submarketBoundaryEntityList || []).filter(function (ent){
		return ent && ent.id !== lineId && ent.id !== labelId;
	});
	return existed;
}

//Looks up a submarket's display name - first from window.submarketNameLookup (filled by
//drawSubmarketBoundariesV2 from its DB response), then window.submarketDetails (loaded per
//market by loadSubmarketDropdownFromMarketId()); falls back to "Submarket <id>".
window.submarketNameLookup = window.submarketNameLookup || {};
function getSubmarketName(idtsubmarket)
{
	if(window.submarketNameLookup && window.submarketNameLookup[idtsubmarket])
		return window.submarketNameLookup[idtsubmarket];
	var rows = window.submarketDetails || [];
	for(var i = 0; i < rows.length; i++)
	{
		if(rows[i] && rows[i].idtsubmarket == idtsubmarket && rows[i].ssubname)
			return rows[i].ssubname;
	}
	return "Submarket " + idtsubmarket;
}

//Adds one submarket's dashed outline + centred name label to the map and tracks the entities
//in window.submarketBoundaryEntityList. colorStr (tsubmarket.boundary_color) is accepted for
//call-site compatibility but ignored - the line always uses the fog-overlay contrast colour.
//Returns true if it drew something.
function addOneSubmarketBoundary(idtsubmarket, boundaryStr, colorStr)
{
	var coords = parseSubmarketBoundaryCoords(boundaryStr);
	if(coords == null)
		return false;

	var lineColor = getSubmarketBoundaryContrastColor();

	var positions = Cesium.Cartesian3.fromDegreesArray(coords);
	var boundaryEntity = viewer.entities.add({
		id: "submarketBoundary_" + idtsubmarket,
		polyline: {
			positions: positions,
			width: 4,
			clampToGround: true,
			classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
			material: new Cesium.PolylineDashMaterialProperty({ color: lineColor }),
			//Ground-clamped polylines/polygons on the 3D tileset don't use the depth buffer against
			//each other - draw order (and so which one renders "on top") is whichever was added to
			//the scene most recently, unless zIndex says otherwise. The fog overlay polygon never
			//sets one (so it's 0); keeping this comfortably higher means the boundary always wins,
			//regardless of load order or how often the fog gets recreated on a visualization change.
			zIndex: 100,
		},
	});
	window.submarketBoundaryEntityList.push(boundaryEntity);

	// Label sits at the boundary polygon's centroid, lifted to the city's altitude adjustment
	// height (same ground offset the rest of this app's entities use) so it doesn't clamp onto
	// terrain or collapse onto a shared point.
	var centre = computeCentroid(positions);
	var labelHeight = 0;
	if(typeof cityAltitudeAdjustment != "undefined" && cityAltitudeAdjustment != null && !isNaN(parseFloat(cityAltitudeAdjustment[lastCityLoaded])))
		labelHeight = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
	var labelEntity = viewer.entities.add({
		id: "submarketBoundaryLabel_" + idtsubmarket,
		position: Cesium.Cartesian3.fromRadians(centre.longitude, centre.latitude, labelHeight),
		label: {
			text: getSubmarketName(idtsubmarket),
			font: "20px sans-serif",
			showBackground: true,
			backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
			fillColor: Cesium.Color.WHITE,
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			verticalOrigin: Cesium.VerticalOrigin.CENTER,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
		},
	});
	window.submarketBoundaryEntityList.push(labelEntity);
	return true;
}

//Draws every submarket boundary currently in window.submarketBoundaryLookup (populated by
//ShowSubmarketSummary()), each as a dashed outline with its name labelled at the centre.
//Same 60s auto-clear + clearSubmarketBoundary() cleanup as the single drawSubmarketBoundary().
function drawSubmarketBoundaries()
{
	clearSubmarketBoundary();
	var lookup = window.submarketBoundaryLookup || {};
	var drawn = 0;
	for(var idtsubmarket in lookup)
	{
		if(!lookup.hasOwnProperty(idtsubmarket))
			continue;
		if(addOneSubmarketBoundary(idtsubmarket, lookup[idtsubmarket], null))
			drawn++;
	}

	if(drawn > 0)
		window.submarketBoundaryClearTimer = setTimeout(function (){ clearSubmarketBoundary(); }, 60000);
	console.log("drawSubmarketBoundaries: drew " + drawn + " boundary/boundaries.");
	return drawn;
}

//Pulls every submarket boundary for a city straight from the DB (tsubmarket.submarket_boundary,
//via controllers/buildingController.php?param=getSubmarketBoundariesByCity) and draws them.
//Falls back to the currently loaded city when idtcity is omitted. autoClear (default true) keeps
//the original 60s self-clear; pass false for a manual on/off toggle that stays until toggled off.
//onlyMarketId (optional) restricts the drawn boundaries to submarkets in that market.
function drawSubmarketBoundariesV2(idtcity, autoClear, onlyMarketId)
{
	if(idtcity == null || typeof idtcity == "undefined")
		idtcity = lastCityLoaded;
	if(autoClear == null || typeof autoClear == "undefined")
		autoClear = true;
	if(idtcity == null)
	{
		console.warn("drawSubmarketBoundariesV2: no idtcity given and no city loaded.");
		return;
	}

	$.ajax({
		method: "POST",
		url: "controllers/buildingController.php",
		data: { param: "getSubmarketBoundariesByCity", idtcity: idtcity }
	}).done(function (response){
		try { response = (typeof response == "string") ? $.parseJSON(response.trim()) : response; }
		catch(e) { console.error("drawSubmarketBoundariesV2: bad response", e); return; }

		if(!response || response.status != "success" || !response.data)
		{
			console.warn("drawSubmarketBoundariesV2: no data for city " + idtcity);
			return;
		}

		clearSubmarketBoundary();
		window.submarketBoundaryLookup = window.submarketBoundaryLookup || {};
		var drawn = 0;
		$.each(response.data, function (index, row){
			window.submarketBoundaryLookup[row.idtsubmarket] = row.submarket_boundary;
			if(row.ssubname)
				window.submarketNameLookup[row.idtsubmarket] = row.ssubname;
			if(onlyMarketId != null && typeof onlyMarketId != "undefined"
				&& parseInt(row.idtmarket) != parseInt(onlyMarketId))
				return;
			if(addOneSubmarketBoundary(row.idtsubmarket, row.submarket_boundary, row.boundary_color))
				drawn++;
		});

		if(drawn > 0 && autoClear)
			window.submarketBoundaryClearTimer = setTimeout(function (){ clearSubmarketBoundary(); }, 60000);
		if(drawn > 0 && !autoClear)
			window.allSubmarketBoundariesShown = true;
		console.log("drawSubmarketBoundariesV2: drew " + drawn + " boundary/boundaries for city " + idtcity + ".");
	}).fail(function (){
		console.error("drawSubmarketBoundariesV2: request failed for city " + idtcity);
	});
}

//"Submarket" header word in the Market Statistics table toggles the current market's submarket
//boundaries on/off (no auto-clear timer while toggled on).
window.allSubmarketBoundariesShown = false;
function toggleAllSubmarketBoundaries()
{
	if(window.allSubmarketBoundariesShown)
	{
		clearSubmarketBoundary();//also drops the .boundaryToggleOn bold state
		return;
	}
	drawSubmarketBoundariesV2(lastCityLoaded, false, lastMarketLoaded);
	$(".submarketBoundaryToggleWord").addClass("boundaryToggleOn");//bold while boundaries are shown
}

//Submarket boundaries and the visualization's fog overlay are both classification polylines/
//polygons draped on the 3D tileset - whichever was added to the scene more recently renders on
//top. Switching visualization (loadNewBuildingTypeView()) recreates that fog, so if it's added
//after the boundary lines already exist, it can wash the white line out to a washed-out grey.
//Called (with a delay generous enough for that fog to have loaded) after a visualization change
//so the boundaries - if currently shown - get redrawn on top of it again.
function refreshSubmarketBoundariesAfterVisChange()
{
	if(!window.allSubmarketBoundariesShown)
		return;
	drawSubmarketBoundariesV2(lastCityLoaded, false, lastMarketLoaded);
}

//AOS infobox submarket name toggles just that one submarket's dashed boundary line on/off.
//Uses window.submarketBoundaryLookup when it's already loaded, otherwise fetches the single row.
function toggleSubmarketBoundaryLine(idtsubmarket)
{
	if(removeOneSubmarketBoundary(idtsubmarket))
		return;

	var boundaryStr = (window.submarketBoundaryLookup || {})[idtsubmarket];
	if(boundaryStr)
	{
		addOneSubmarketBoundary(idtsubmarket, boundaryStr, null);
		return;
	}

	$.ajax({
		method: "POST",
		url: "controllers/buildingController.php",
		data: { param: "getSubmarketBoundary", idtsubmarket: idtsubmarket }
	}).done(function (response){
		try { response = (typeof response == "string") ? $.parseJSON(response.trim()) : response; }
		catch(e) { console.error("toggleSubmarketBoundaryLine: bad response", e); return; }
		var row = response && response.data ? response.data : null;
		if(!row || !row.submarket_boundary)
		{
			console.warn("toggleSubmarketBoundaryLine: no boundary for submarket " + idtsubmarket);
			return;
		}
		window.submarketBoundaryLookup = window.submarketBoundaryLookup || {};
		window.submarketBoundaryLookup[idtsubmarket] = row.submarket_boundary;
		if(row.ssubname)
			window.submarketNameLookup[idtsubmarket] = row.ssubname;
		addOneSubmarketBoundary(idtsubmarket, row.submarket_boundary, row.boundary_color);
	}).fail(function (){
		console.error("toggleSubmarketBoundaryLine: request failed for submarket " + idtsubmarket);
	});
}

function selectAdjacentSubmarket(direction)
{
	var submarketRows = $("#submarketSummaryTable tbody tr[data-idtsubmarket]");
	if(submarketRows.length == 0)
		return;
	var currentIndex = submarketRows.index(submarketRows.filter("[data-idtsubmarket='"+window.selectedSubmarketId+"']"));
	if(currentIndex == -1)
		return;
	var newIndex = currentIndex + direction;
	if(newIndex < 0 || newIndex >= submarketRows.length)
		return;
	var newRow = submarketRows[newIndex];
	var newSubmarketId = parseInt($(newRow).attr("data-idtsubmarket"));
	selectSubmarketRow(newRow, newSubmarketId);
}

var summaryTableSortState = {};
function sortSummaryTable(tableId, colIndex, dataType)
{
	var table = document.getElementById(tableId);
	if(table == null)
		return;
	var tbody = table.querySelector('tbody');
	var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
	var stateKey = tableId+"-"+colIndex;
	var ascending = !summaryTableSortState[stateKey];
	summaryTableSortState[stateKey] = ascending;
	rows.sort(function (rowA, rowB) {
		var valueA = rowA.children[colIndex].innerText.trim();
		var valueB = rowB.children[colIndex].innerText.trim();
		if(dataType == 'number')
		{
			valueA = parseFloat(valueA.replace(/[^0-9.\-]/g, '')) || 0;
			valueB = parseFloat(valueB.replace(/[^0-9.\-]/g, '')) || 0;
			return ascending ? valueA - valueB : valueB - valueA;
		}
		return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
	});
	$.each(rows, function (index, row) {
		tbody.appendChild(row);
	});
	$(table).find('thead .summarySortableHeader').removeClass('summarySortActive');
	$(table).find('thead .summarySortableHeader').eq(colIndex).addClass('summarySortActive');
}

function ShowSubmarketSummary(buildingType)
{
	var cityData = submarketSummaryDetails[lastCityLoaded] || {};
	// "Not fetched yet" vs "fetched, genuinely empty": while switching into the Office
	// visualization ShowSummaryInfobox() runs once before getAClassBuildings returns and
	// again after. On that first pass the data is still undefined - render nothing rather
	// than flash "No data available" for a few seconds until the fetch completes.
	var submarketDataLoaded = (typeof cityData[buildingType] != "undefined" && cityData[buildingType] != null);
	if(!submarketDataLoaded)
		return "";
	var rows = cityData[buildingType] || [];
	rows = rows.filter(function(row){ return row.idtsubmarket != 257; });//idtsubmarket 257 excluded from Market Statistics
	rows = rows.slice().sort(function(a, b){ return (parseFloat(b.sqft) || 0) - (parseFloat(a.sqft) || 0); });//default sort: Sq Ft, largest to smallest
	$(".summaryCollapsibleSection").remove();

	var openState = summaryCollapsibleBodyOpen();
	var str = "<div class='summaryCollapsibleSection'>";
	str += "<div class='summaryCollapsibleHeader' onclick='toggleSummaryCollapse(this)'>";
	str += "<span>Market Statistics</span><i class='fa-solid "+openState.iconClass+" summaryCollapseIcon'></i>";
	str += "</div>";
	str += "<div class='summaryCollapsibleBody' style='"+openState.bodyStyle+"'>";
	str += "<table class='table table-striped minPaddingtable' id='submarketSummaryTable' cellpadding=2 cellspacing=0 border=0 width='100%'>";
	str += "<thead><tr>";
	str += "<td class='summarySortableHeader submarketNameCol' onclick=\"sortSummaryTable('submarketSummaryTable', 0, 'text')\"><span class='submarketBoundaryToggleWord"+(window.allSubmarketBoundariesShown ? " boundaryToggleOn" : "")+"' onclick=\"event.stopPropagation(); toggleAllSubmarketBoundaries();\">Submarket</span></td>";
	str += "<td class='summarySortableHeader alignCenter' onclick=\"sortSummaryTable('submarketSummaryTable', 1, 'number')\">Properties</td>";
	str += "<td class='summarySortableHeader alignCenter summarySortActive' onclick=\"sortSummaryTable('submarketSummaryTable', 2, 'number')\">Sq Ft</td>";
	str += "<td class='summarySortableHeader alignCenter avgAgeCol' onclick=\"sortSummaryTable('submarketSummaryTable', 3, 'number')\">Average&nbsp;Age</td>";
	str += "<td class='summarySortableHeader' onclick=\"sortSummaryTable('submarketSummaryTable', 4, 'number')\">Vacancy</td>";
	str += "</tr></thead>";
	str += "<tbody>";
	if(rows.length == 0)
	{
		str += "<tr><td colspan='5'>No data available</td></tr>";
	}
	window.submarketBoundaryLookup = window.submarketBoundaryLookup || {};
	$.each(rows, function (index, row) {
		window.submarketBoundaryLookup[row.idtsubmarket] = row.submarket_boundary;
		str += "<tr data-idtsubmarket='"+row.idtsubmarket+"'>";
		str += "<td><a href='javascript:void(0)' onclick='selectSubmarketRow(this, "+row.idtsubmarket+")'>"+row.ssubname+"</a></td>";
		str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.properties)+"</td>";
		str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.sqft)+"</td>";
		str += "<td class='alignCenter avgAgeCol'>"+row.avgage+"</td>";
		str += "<td class='alignCenter'>"+row.vacancy+"%</td>";
		str += "</tr>";
	});
	str += "</tbody>";
	str += "</table>";
	str += "</div>";
	str += "</div>";
	return str;
}

function ShowCompanySummary()
{
	var data = companySummaryDetails[lastMarketLoaded] || {};
	var sortByAvailableDesc = function(a, b){ return (parseFloat(b.availablesqft) || 0) - (parseFloat(a.availablesqft) || 0); };//default sort: Available, largest to smallest
	var brokerages = (data.brokerages || []).slice().sort(sortByAvailableDesc);
	var propertyManagers = (data.propertyManagers || []).slice().sort(sortByAvailableDesc);

	$(".summaryCollapsibleSection").remove();
	
	var openState = summaryCollapsibleBodyOpen();
	var str = "<div class='summaryCollapsibleSection'>";
	str += "<div class='summaryCollapsibleHeader' onclick='toggleSummaryCollapse(this)'>";
	str += "<span>Leasing Market Statistics</span><i class='fa-solid "+openState.iconClass+" summaryCollapseIcon'></i>";
	str += "</div>";
	str += "<div class='summaryCollapsibleBody' style='"+openState.bodyStyle+"'>";
	str += "<table class='table table-striped minPaddingtable' id='companySummaryTable' cellpadding=2 cellspacing=0 border=0 width='100%'>";
	str += "<thead><tr>";
	str += "<td class='listingCompanyCol leasingNameCol'>Listing Company</td>";
	str += "<td class='alignCenter'>Properties</td>";
	str += "<td>Suites</td>";
	str += "<td>Available</td>";
	str += "<td>Vacancy</td>";
	str += "</tr></thead>";
	str += "<tbody>";
	if(brokerages.length == 0 && propertyManagers.length == 0)
	{
		str += "<tr><td colspan='5'>No data available</td></tr>";
	}
	if(brokerages.length > 0)
	{
		str += "<tr class='companySummaryGroupHeader'><td colspan='5'>Brokerages</td></tr>";
		$.each(brokerages, function (index, row) {
			str += "<tr data-idtcompany='"+row.idtcompany+"'>";
			str += "<td><span class='brokerRow brokerRow-"+row.idtcompany+"' onclick='filterAOSWithListingCompany("+row.idtcompany+", true)'>"+row.companyname+"</span></td>";
			str += "<td class='alignCenter'><span class='companyBuildingTourLink companyBuildingTourLink-"+row.idtcompany+(window.companyBuildingTourActive && window.companyBuildingTourCompanyId == row.idtcompany ? " companyTourOn" : "")+"' onclick='event.stopPropagation(); startCompanyBuildingTour("+row.idtcompany+")'>"+numberWithCommaWithoutDecimal(row.properties)+"</span></td>";
			str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.suites)+"</td>";
			str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.availablesqft)+"</td>";
			str += "<td></td>";
			str += "</tr>";
		});
	}
	if(propertyManagers.length > 0)
	{
		str += "<tr class='companySummaryGroupHeader'><td colspan='5'>Property Managers</td></tr>";
		$.each(propertyManagers, function (index, row) {
			str += "<tr data-idtcompany='"+row.idtcompany+"'>";
			str += "<td><span class='brokerRow brokerRow-"+row.idtcompany+"' onclick='filterAOSWithListingCompany("+row.idtcompany+", true)'>"+row.companyname+"</span></td>";
			str += "<td class='alignCenter'><span class='companyBuildingTourLink companyBuildingTourLink-"+row.idtcompany+(window.companyBuildingTourActive && window.companyBuildingTourCompanyId == row.idtcompany ? " companyTourOn" : "")+"' onclick='event.stopPropagation(); startCompanyBuildingTour("+row.idtcompany+")'>"+numberWithCommaWithoutDecimal(row.properties)+"</span></td>";
			str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.suites)+"</td>";
			str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.availablesqft)+"</td>";
			str += "<td class='alignCenter'>"+row.vacancy+"%</td>";
			str += "</tr>";
		});
	}
	str += "</tbody>";
	str += "</table>";
	str += "</div>";
	str += "</div>";
	return str;
}

function getAreaInCityUnits(areaValue)
{
	return Math.round(parseFloat(areaValue) * parseFloat(cityAreaMeasurementMultiplier));
}

function createSummaryInfoboxForAvailableOfficeSpace()
{
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	str += "<tr><td colspan='5'></td></tr>";
	str += "<tr><td>Type</td><td class='alignCenter'>Properties</td>";
	str += "<td class='alignCenter'>Suites</td>";
	str += "<td>Available ("+cityAreaMeasurementUnit+")</td><td>Vacancy</td></tr>";
	
	//var totalArea = parseFloat(window.availableOfficeSpaceSummary["Direct"].availableArea) + parseFloat(window.availableOfficeSpaceSummary["Sublease"].availableArea) + parseFloat(window.availableOfficeSpaceSummary["Co-Working"].availableArea);
	str += "<tr>";
		str += "<td style=' background-color:"+classColor["Direct"]+"'>Direct</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Direct"].buildings.length))+"</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Direct"].totalSuites))+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(Math.round(getAreaInCityUnits(parseInt(window.availableOfficeSpaceSummary["Direct"].availableOfficeArea))))+"</td>";
		var directVacancy = ((parseFloat(window.availableOfficeSpaceSummary["Direct"].availableOfficeArea) / getAreaInCityUnits(parseInt(window.totalOfficeAreaForVacancy))) * 100).toFixed(2);
		if(isNaN(directVacancy))
			directVacancy = 0;
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+directVacancy+"%</td>";
	str += "</tr>";
	
	str += "<tr>";
		str += "<td style=' background-color:"+classColor["Sublease"]+"'>Sublease</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Sublease"].buildings.length))+"</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Sublease"].totalSuites))+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(Math.round(getAreaInCityUnits(parseInt(window.availableOfficeSpaceSummary["Sublease"].availableOfficeArea))))+"</td>";
		var subLeaseVacancy = ((parseFloat(window.availableOfficeSpaceSummary["Sublease"].availableOfficeArea) / getAreaInCityUnits(parseInt(window.totalOfficeAreaForVacancy))) * 100).toFixed(2);
		if(isNaN(subLeaseVacancy))
			subLeaseVacancy = 0;
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+subLeaseVacancy+"%</td>";
	str += "</tr>";
	
	str += "<tr>";
		str += "<td style='background-color:"+classColor["Co-Working"]+"' width='80px'>Co-Working</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Co-Working"].buildings.length))+"</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Co-Working"].totalSuites))+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(Math.round(getAreaInCityUnits(parseInt(window.availableOfficeSpaceSummary["Co-Working"].availableOfficeArea))))+"</td>";
		var coWorkingVacancy = ((parseFloat(window.availableOfficeSpaceSummary["Co-Working"].availableOfficeArea) / getAreaInCityUnits(parseInt(window.totalOfficeAreaForVacancy))) * 100).toFixed(2);
		if(isNaN(coWorkingVacancy))
			coWorkingVacancy = 0;
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+coWorkingVacancy+"%</td>";
	str += "</tr>";
		
	str += "<tr class='row-with-totals'>";
		str += "<td>Total</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(window.availableOfficeSpaceSummary["Direct"].buildings.length) + parseInt(window.availableOfficeSpaceSummary["Sublease"].buildings.length) + parseInt(window.availableOfficeSpaceSummary["Co-Working"].buildings.length))+"</td>";
		////console.log(parseInt(window.availableOfficeSpaceSummary["Direct"].totalSuites) + parseInt(window.availableOfficeSpaceSummary["Sublease"].totalSuites) + parseInt(window.availableOfficeSpaceSummary["Co-Working"].totalSuites));
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(parseInt(window.availableOfficeSpaceSummary["Direct"].totalSuites) + parseInt(window.availableOfficeSpaceSummary["Sublease"].totalSuites) + parseInt(window.availableOfficeSpaceSummary["Co-Working"].totalSuites)))+"</td>";
		var totalAvailableSQM = getAreaInCityUnits(parseInt(window.availableOfficeSpaceSummary["Direct"].availableOfficeArea) + parseInt(window.availableOfficeSpaceSummary["Sublease"].availableOfficeArea) + parseInt(window.availableOfficeSpaceSummary["Co-Working"].availableOfficeArea));
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(parseInt(totalAvailableSQM))+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>";
		if(!isNaN(totalAvailableSQM))
			str += ( (parseInt(totalAvailableSQM) / getAreaInCityUnits(parseInt(window.totalOfficeAreaForVacancy))) * 100 ).toFixed(2)+"%";
		else
			str += "0%";
		str += "</td>";
		
	str += "</tr>";
	
	str += "<tr>";
		str += "<td colspan='5' style='text-align:left !important;'><small>Last updated: "+window.availableOfficeSpaceLastRecordDate+"</small></td>";
	str += "</tr>";
	
	str += "</table>";
	$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainerData").append(ShowCompanySummary());
	$(".summaryInfoboxContainer").show();
}

function createSummaryInfoboxForAvailableSpace()
{
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	str += "<tr><td colspan='5'></td></tr>";
	str += "<tr><td>Type</td><td class='alignCenter'>Properties</td>";
	str += "<td class='alignCenter'>Suites</td>";
	str += "<td>Available&nbsp;(sqm)</td><td>Vacancy</td></tr>";
	
	var availability = 5456078;
	if(typeof summaryDetails[36] != "undefined")
	{
		availability = summaryDetails[36]["A"].officeArea + summaryDetails[36]["B"].officeArea + summaryDetails[36]["C"].officeArea;
		availability = getAreaInCityUnits(parseFloat(availability));
	}
	//var totalArea = parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea);
	str += "<tr>";
		str += "<td style=' background-color:"+classColor["Direct"]+"'>Direct</td>";
		str += "<td class='alignCenter'>"+window.ArealyticsSuiteSummary["Direct"].buildings+"</td>";
		str += "<td class='alignCenter'>"+window.ArealyticsSuiteSummary["Direct"].units+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(Math.round(parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea)))+"</td>";
		var directVacancy = ((parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea)/availability) * 100).toFixed(2);
		if(isNaN(directVacancy))
			directVacancy = 0;
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+directVacancy+"%</td>";
	str += "</tr>";
	
	str += "<tr>";
		str += "<td style=' background-color:"+classColor["Sublease"]+"'>Sublease</td>";
		str += "<td class='alignCenter'>"+window.ArealyticsSuiteSummary["Sublease"].buildings+"</td>";
		str += "<td class='alignCenter'>"+window.ArealyticsSuiteSummary["Sublease"].units+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(Math.round(parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea)))+"</td>";
		var subLeaseVacancy = ((parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea)/availability) * 100).toFixed(2);
		if(isNaN(subLeaseVacancy))
			subLeaseVacancy = 0;
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+subLeaseVacancy+"%</td>";
	str += "</tr>";
	
	str += "<tr>";
		str += "<td style=' background-color:"+classColor["Co-Working"]+"' width='80px'>Co-Working</td>";
		str += "<td class='alignCenter'>"+window.ArealyticsSuiteSummary["Co-Working"].buildings+"</td>";
		str += "<td class='alignCenter'>"+window.ArealyticsSuiteSummary["Co-Working"].units+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(Math.round(parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea)))+"</td>";
		var coWorkingVacancy = ((parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea)/availability) * 100).toFixed(2);
		if(isNaN(coWorkingVacancy))
			coWorkingVacancy = 0;
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+coWorkingVacancy+"%</td>";
	str += "</tr>";
	
	str += "<tr class='row-with-totals'>";
		str += "<td>Total</td>";
		str += "<td class='alignCenter'>"+(parseInt(window.ArealyticsSuiteSummary["Direct"].buildings) + parseInt(window.ArealyticsSuiteSummary["Sublease"].buildings) + parseInt(window.ArealyticsSuiteSummary["Co-Working"].buildings))+"</td>";
		////console.log(parseInt(window.ArealyticsSuiteSummary["Direct"].units) + parseInt(window.ArealyticsSuiteSummary["Sublease"].units) + parseInt(window.ArealyticsSuiteSummary["Co-Working"].units));
		str += "<td class='alignCenter'>"+parseInt(parseInt(window.ArealyticsSuiteSummary["Direct"].units) + parseInt(window.ArealyticsSuiteSummary["Sublease"].units) + parseInt(window.ArealyticsSuiteSummary["Co-Working"].units))+"</td>";
		var totalAvailableSQM = parseFloat(window.ArealyticsSuiteSummary["Direct"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Sublease"].availablearea) + parseFloat(window.ArealyticsSuiteSummary["Co-Working"].availablearea);
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+printNumberFormat(parseInt(totalAvailableSQM))+"</td>";
		str += "<td class='alignCenter' style='padding-right:20px !important;'>"+( parseFloat(directVacancy) + parseFloat(subLeaseVacancy) + parseFloat(coWorkingVacancy) ).toFixed(2)+"%</td>";
	str += "</tr>";
	str += "</table>";
	$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainer").show();
}

function createSummaryInfoboxForPricePerSQM()
{
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	str += "<tr><td colspan='5'></td></tr>";
	str += "<tr><td>Range</td>";
	str += "<td class='alignCenter'>Properties</td>";
	str += "<td class='alignCenter'>Units</td>";
	str += "<td class='alignCenter'>Available (sqm)</td>";
	str += "<td class='alignCenter'>Vacancy</td>";
	str += "</tr>";
	
	var availability = 5456078;
	var totalbuildings = 0;
	var totalsuites = 0;
	var totalavailablearea = 0;
	var totalavailability = 0;
	$.each(window.ArealyticsSuitePricePerSQMSummary, function (index, row){
		totalbuildings += row.data.buildings;
		totalsuites += row.data.suites;
		totalavailablearea += parseFloat(row.data.availablearea);
		
		var low = row.low;
		if(low != 0)
			low = numberWithCommaWithoutDecimal(low, "$");
		var high = numberWithCommaWithoutDecimal(row.high, "$");
		var displayText = low+' - '+high;
		if(row.low == 0)
			displayText = '< '+high;
		if(row.high == 120000)
			displayText = '> '+numberWithCommaWithoutDecimal(row.low, "$");
		
		str += "<tr>";
			str += "<td style='background-color:"+getColorForPricePerSQM((row.high - 1), true)+"'>"+displayText+"</td>";
			str += "<td class='alignCenter'>"+row.data.buildings+"</td>";
			str += "<td class='alignCenter'>"+row.data.suites+"</td>";
			str += "<td class='alignCenter'>"+printNumberFormat(Math.round(parseFloat(row.data.availablearea)))+"</td>";
			var directVacancy = ((parseFloat(row.data.availablearea)/availability) * 100).toFixed(2);
			totalavailability += parseFloat(directVacancy);
			str += "<td class='alignCenter'>"+directVacancy+"%</td>";
		str += "</tr>";
	});
	
	str += "<tr class='row-with-totals'>";
		str += "<td>Total</td>";
		str += "<td class='alignCenter'>"+totalbuildings+"</td>";
		str += "<td class='alignCenter'>"+totalsuites+"</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(totalavailablearea))+"</td>";
		str += "<td class='alignCenter'>"+Math.round(totalavailability, 2)+"%</td>";
	str += "</tr>";
	str += "</table>";
	$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainer").show();
}

function setInvestmentSaleYearSelected(year)
{
	window.tabYearSelected = year;
	updateURL();
}

function createSummaryInfoboxForCalgaryOfficeMarketSales()
{
	var str = "";
	var tabs = "";
	var content = "";
	
	classArray = ["AAA", "AA", "A", "B", "C", "Retail", "APT", "MDU", "SENIOR", "HOTEL", "EMS", "IND", "INF", "INST", "LAND", "MED", "MIXED", "PRE-LEASING", "PRKS", "RGS", "SFR", "STADIUM", "TRANS", "WRHS"];
	
	var activeTab = " ";
	if(defaultTabYearSelected == "" || defaultTabYearSelected == "All")
	{
		activeTab = " active ";
	}
	
	tabs += '<li class="nav-item"><a style="float:left;" class="nav-link '+activeTab+' investmentSalesTabs" onClick=\'highlightCalgaryOfficeMarketSales("All");setInvestmentSaleYearSelected("All");\' data-bs-toggle="tab" href="#year-All">All</a></li>';
	content += '<div class="tab-pane fade '+activeTab+' investmentSalesContent" id="year-All">';
		content += createSummaryInfoboxForCalgaryOfficeMarketSales_OLD();
	content += '</div>';
	
	var allYears = [];
	$.each(calgaryOfficeSaleSummary, function (year, rows){
		if(year != "" && year != null)
		{
			allYears.push(parseInt(year));
		}
	});
	if(allYears.length > 0)
	for(var i = allYears.length-1; i>= 0; i--)
	{
		year = allYears[i];
		rows = calgaryOfficeSaleSummary[parseInt(year)];
		
		if(year != "" && year != null)
		{
			activeTab = "";
			
			if(defaultTabYearSelected == year)
			{
				activeTab = " show active ";
			}
			
			tabs += '<li class="nav-item"><a style="float:left;" class="nav-link '+activeTab+' investmentSalesTabs" onClick=\'highlightCalgaryOfficeMarketSales("'+year+'"); setInvestmentSaleYearSelected("'+year+'");\' data-bs-toggle="tab" href="#year-'+year+'">'+year+'</a></li>';
		
			content += '<div class="tab-pane fade '+activeTab+' investmentSalesContent" id="year-'+year+'">';
				//year data
				var availability = 5456078;
				var totalbuildings = 0;
				var totalsuites = 0;
				var totalavailablearea = 0;
				var totalsoldprice = 0;
				var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
				str += "<tr><td colspan='5'></td></tr>";
				str += "<tr><td>Class</td><td class='alignCenter'>Sales</td>";
				str += "<td class='alignCenter'>GLA <small>(Sq Ft)</small></td>";
				str += "<td class='alignCenter'>Value</td>";
				str += "</tr>";
				//$.each(window.calgaryOfficeSaleSummary, function (index, row){
				//console.log(rows);
				$.each(classArray, function (index, eachClass){
					if(typeof rows[eachClass] != "undefined")
					{
						var row = rows[eachClass];
						//console.log(row);
						totalbuildings += parseInt(row.totalbuildings);
						totalavailablearea += getAreaInCityUnits(parseInt(row.grossofficearea));
						totalsoldprice += parseInt(row.soldprice);
						
						str += "<tr>";
							var suffix = "";
							if(["A", "AA", "AAA", "B", "C"].includes(row.class))
							{
								suffix = " Office";
							}
							str += "<td style='width: 115px; '>"+row.class+""+suffix+"</td>";
							str += "<td class='alignCenter'>"+row.totalbuildings+"</td>";
							str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(row.grossofficearea), "", "")+"</td>";
							str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.soldprice, "$")+"</td>";
						str += "</tr>";
					}
				});
				
				str += "<tr class='row-with-totals'>";
					str += "<td>Total</td>";
					str += "<td class='alignCenter'>"+totalbuildings+"</td>";
					str += "<td class='alignCenter'>"+printNumberFormat(parseInt(totalavailablearea))+"</td>";
					str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(totalsoldprice, "$")+"</td>";
				str += "</tr>";
				str += "</table>";
				content += str;
			content += '</div>';
			activeTab = '';
		}
	
	}
	$.each(calgaryOfficeSaleSummary, function (year, rows){
	});
	
	str = "<ul class='nav nav-tabs' id='subTabs-sale'>"+tabs+"</ul><div class='nav-tab-content mt-2'>"+content+"</div>"
	
	$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainer").show();
	defaultTabYearSelected = "";
}

function createSummaryInfoboxForCalgaryOfficeMarketSales_OLD()
{
	var str = "";
	
	str += "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	str += "<tr><td colspan='5'></td></tr>";
	str += "<tr><td>Class</td><td class='alignCenter'>Transactions</td>";
	str += "<td class='alignCenter'>GLA <small>(Sq Ft)</td>";
	str += "<td class='alignCenter'>Value</td>";
	str += "</tr>";
	
	var availability = 5456078;
	var totalbuildings = 0;
	var totalsuites = 0;
	var totalavailablearea = 0;
	var totalsoldprice = 0;
	classArray = ["AAA", "AA", "A", "B", "C", "Retail", "APT", "MDU", "SENIOR", "HOTEL", "EMS", "IND", "INF", "INST", "LAND", "MED", "MIXED", "PRE-LEASING", "PRKS", "RGS", "SFR", "STADIUM", "TRANS", "WRHS"];
	//$.each(window.calgaryOfficeSaleSummary, function (index, row){
	$.each(classArray, function (index, eachClass){
		if(typeof calgaryOfficeSaleSummaryAll[eachClass] != "undefined")
		{
			var row = calgaryOfficeSaleSummaryAll[eachClass];
			totalbuildings += parseInt(row.totalbuildings);
			totalavailablearea += parseInt(row.grossofficearea);
			totalsoldprice += parseInt(row.soldprice);
			
			str += "<tr>";
				var suffix = "";
				if(["A", "AA", "AAA", "B", "C"].includes(row.class))
				{
					suffix = " Office";
				}
				str += "<td style='width: 115px; '>"+row.class+""+suffix+"</td>";
				str += "<td class='alignCenter'>"+row.totalbuildings+"</td>";
				str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.grossofficearea, "", "")+"</td>";
				str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(row.soldprice, "$")+"</td>";
			str += "</tr>";
		}
	});
	
	str += "<tr class='row-with-totals'>";
		str += "<td>Total</td>";
		str += "<td class='alignCenter'>"+totalbuildings+"</td>";
		str += "<td class='alignCenter'>"+printNumberFormat(parseInt(totalavailablearea))+"</td>";
		str += "<td class='alignCenter'>"+numberWithCommaWithoutDecimal(totalsoldprice, "$")+"</td>";
	str += "</tr>";
	str += "</table>";
	return str;
	
	$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainer").show();
}

function createSummaryInfoboxForCityFloorplans(idtcity)
{
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	str += "<tr><td colspan='5'></td></tr>";
	
	str += "<tr><td>Type</td><td class='alignCenter'>Properties</td><td class='alignCenter'>Count</td><td class='alignCenter'>Area</td></tr>";
	
	var totalSuites = 0;
	var totalBuildings = 0;
	var totalavailablearea = 0;
	if(window.cityFloorPlanSummary != null && typeof window.cityFloorPlanSummary[idtcity] != "undefined")
	{
		str += "<tr><td style='background-color: "+classColor["Office"]+"; width: 100px;'>Office</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Office"]["buildings"].length+"</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Office"].totalSuites+"</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(parseInt(window.cityFloorPlanSummary[idtcity]["Office"].totalArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>";
		//str += "<tr><td style='background-color: "+classColor["MDU"]+"'>Residential</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Residential"]["buildings"].length+"</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Residential"].totalSuites+"</td><td class='alignCenter'></td></tr>";
		//str += "<tr><td style='background-color: "+classColor["Hotel"]+"'>Hotel</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Hotel"]["buildings"].length+"</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Hotel"].totalSuites+"</td><td class='alignCenter'></td></tr>";
		str += "<tr><td style='background-color: "+classColor["Retail"]+"'>Retail</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Retail"]["buildings"].length+"</td><td class='alignCenter'>"+window.cityFloorPlanSummary[idtcity]["Retail"].totalSuites+"</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(parseInt(window.cityFloorPlanSummary[idtcity]["Retail"].totalArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>";
		
		/*
		totalSuites = parseInt(window.cityFloorPlanSummary[idtcity]["Office"].totalSuites) + parseInt(window.cityFloorPlanSummary[idtcity]["Residential"].totalSuites) + parseInt(window.cityFloorPlanSummary[idtcity]["Hotel"].totalSuites);
		totalBuildings = parseInt(window.cityFloorPlanSummary[idtcity]["Office"]["buildings"].length) + parseInt(window.cityFloorPlanSummary[idtcity]["Residential"]["buildings"].length) + parseInt(window.cityFloorPlanSummary[idtcity]["Hotel"]["buildings"].length);
		*/
		totalSuites = parseInt(window.cityFloorPlanSummary[idtcity]["Office"].totalSuites) + parseInt(window.cityFloorPlanSummary[idtcity]["Retail"].totalSuites);
		totalBuildings = parseInt(window.cityFloorPlanSummary[idtcity]["Office"]["buildings"].length) + parseInt(window.cityFloorPlanSummary[idtcity]["Retail"]["buildings"].length);
		
		totalavailablearea = parseInt(window.cityFloorPlanSummary[idtcity]["Office"].totalArea) + parseInt(window.cityFloorPlanSummary[idtcity]["Retail"].totalArea);
	}
	
	str += "<tr class='row-with-totals'>";
		str += "<td><b>Total</b></td>";
		str += "<td class='alignCenter'><b>"+totalBuildings+"</b></td>";
		if(totalSuites == 0)
			str += "<td class='alignCenter'></td>"; //  class='alignRight' style='padding-right:20px !important;'
		else
			str += "<td class='alignCenter'><b>"+totalSuites+"</b></td>"; //  class='alignRight' style='padding-right:20px !important;'
		if(totalavailablearea == 0)
			str += "<td class='alignCenter'></td>";
		else
			str += "<td class='alignCenter'><b>"+numberWithCommaWithoutDecimal(parseInt(totalavailablearea), "", " "+cityAreaMeasurementUnit)+"</b></td>";
	str += "</tr>";
	str += "</table>";
	
	$(".summaryInfoboxContainerData").html(str);
	$(".summaryInfoboxContainer").show();
}

function loadSydneyMarketDropdown(cityId, marketId, extraField = false)
{
	return;
	if(isNaN(cityId) && marketId == "")
	{
		cityId = defaultCity;
	}
	////console.log("CityId ", cityId);
	////console.log("MarketId ", marketId);
	$("#marketDropdown").empty();
	
	dropdownSelected = "";
	$.each(buildingTypeDropdown, function (index, eachType){
		dropdownSelected = " ";
		if(lastSelectedBuildingType == eachType)
			dropdownSelected = " selected ";
		//buildingTypeOption += "<option "+dropdownSelected+" value='"+eachType+"'>"+eachType+" Market</option>";
		var dText = eachType+" Market";
		if(eachType == "Floorplan")
		{
			dText = "Available Office Space";
		}
		if(eachType == "Development")
		{
			dText = "Development Activity";
		}
		if(eachType == "All")
		{
			dText = "All Properties";
		}
		if(eachType == "Residential")
			dText = "Multifamily Market";
		$('#marketDropdown')
		 .append($("<option></option>")
		 .attr("value",eachType)
		 .text(dText));
		 
		if((marketId == 36 || cityId == 23) && eachType == "All")
		{	 
			$('#marketDropdown')
			 .append($("<option></option>")
			 .attr("value","OfficeRentalRates")
			 .text("Example Market Rates"));
		}
		else if(window.marketsEnabledForInvestmentSales.includes(parseInt(marketId)) && eachType == "Floorplan")
		{
			$('#marketDropdown')
			 .append($("<option></option>")
			 .attr("value","InvestmentSalesMarket")
			 .text("Investment Sales Market"));
		}
	});
	$("#marketDropdown").val(lastSelectedBuildingType);
}

function reloadCityCamera()
{
	flyToCitySkylineSlow(lastCityLoaded);
}

function defaultToOfficeMarket()
{
	reloadCityCamera();
	/*
	if(typeof window.citiesWithMultipleMarket[lastCityLoaded] == "undefined")
	{
		//clearLastSelectedFunctions();
		//loadNewBuildingTypeView("Office");
	}
	else
	{
		console.log("In Else for City With Multiple Markets !!! ");
		flyToIdtcamera(marketDetailsV2[parseInt(lastMarketLoaded)].marketcamera);
	}
	*/
}

function loadAllVisualizationView(type)
{
	
}

function clearAllVisualizationView(type)
{
	
}
window.retailBuildingData = [];
window.nonRetailBuildingData = [];
window.retailBuildingMap = [];
window.activeUnitDetails = [];
window.buildingFiles = [];
window.buildingClasses = [];
function loadNewBuildingTypeView(type)
{
	window.changingVisualization = true;
	clearAllEffects();
	setDropdownWidthClass();
	$(".company-logo-image").html("");
	listingCompanyFiltered = null;
	listingAgentFiltered = null;
	window.filterWithBuildingClassActive = false;
	window.buildingClassFiltered = null;

	loadBuildingForAutoSuggest(lastMarketLoaded);
	DisableBottomPanoButton();
	
	$("#pano-view-li").hide();
	$(".full-screen-arrow").hide();
	saveUserAccessDetails("",  $("#mainCityDropdown option:selected").text() + " - " + $("#marketDropdown option:selected").text());
	clearPrimitives(false);
	clearLastSelectedFunctions();
	$(".infoboxContainer").hide();  $("#infoboxFloorPlanRow").hide();
	window.lastSuite = null;
	window.lastSuiteSubTabType = null;//reset remembered AOS sub-tab (Floorplans/Tours/etc.) back to Floorplans on visualization change
	viewer.entities.removeById("starRatingBox");
	//viewer.entities.removeById("FogEffectEntityPreload");
	
	if(typeof marketBoundaries[lastMarketLoaded] != "undefined")
	{
		//viewer.entities.removeById("FogEffectEntity");debugger;
		//FogEffectEntityPreload
		loadFogPreloadV2(lastCityLoaded);// !! Important to check...
	}
		
	setTimeout(function (){
		lastSelectedBuildingType = type;
		ShowSummaryInfobox();
		if(type == "AvailableOfficeSpace")
		{
			if($("#mainCityDropdown").val() == 36)
			{
				getSydneyArealyticsSuites("LeaseType");
				ShowLegend();
			}
			else
			{
				ShowLegend();
			}
		}
		else if(type == "OfficeRentalRates")
		{
			getSydneyArealyticsSuites("OfficeRentalRates");
			ShowLegend();
		}
		else if(type == "InvestmentSalesMarket")//Calgary
		{
			getMarketSalesDataCalgary();
			ShowLegend();
		}
		else if(type == "Floorplan")//Calgary
		{
			//getFloorPlansForCity(lastCityLoaded);
			getAvailableOfficeSpace();
			ShowLegend();
		}
		else
		{
			//Check if data available
			if(typeof marketBuildingDetails == "undefined" || marketBuildingDetails.length == 0 || typeof marketBuildingDetails[lastMarketLoaded] == "undefined" )
			{
				$.ajax({
					method: "POST",
					url: "controllers/buildingController.php",
					data: { param : "getAClassBuildings", idtmarket : lastMarketLoaded}
				})
				.done(function( data ) {
					////console.log(data);
					//console.log("Loading for Market : "+lastMarketLoaded);
					data = $.parseJSON( data );
					if(data.status == "success")
					{
						if(typeof data.data != "undefined")
						{
							marketBuildingDetails = [];
							marketBuildingDetails[lastMarketLoaded] = data.data;
							buildingFiles = data.buildingFiles;
							buildingClasses = data.buildingClasses;
							developmentBuildingDetails[lastMarketLoaded] = data.developmentBuildings;
							developmentBuildingFloors = data.developmentBuildingFloors;
							developmentBuildingSummary[lastMarketLoaded] = data.developmentSummary;
							summaryDetails[lastMarketLoaded] = data.summary;
							allBuildingVisualizationSummary[lastMarketLoaded] = data.allBuildingVisualizationSummary;
							submarketDetails = data.submarketDetails;
							//console.log("submarketDetails", submarketDetails);
							if(typeof submarketSummaryDetails[lastCityLoaded] == "undefined")
								submarketSummaryDetails[lastCityLoaded] = {};
							submarketSummaryDetails[lastCityLoaded]["Office"] = data.submarketSummary;
							hotelSummaryDetails[lastMarketLoaded] = data.hotelSummary;
							retailBuildingData = data.retailBuildingData;
							nonRetailBuildingData = data.nonRetailBuildingData;
							retailBuildingMap = data.retailBuildingMap;
							activeUnitDetails = data.activeUnitDetails;
							highlightAllBuildings(parseInt(lastCityLoaded), parseInt(lastMarketLoaded), false);
							loadSubmarketDropdown(parseInt(lastCityLoaded));
						}
					}
					else
					{
						alert("Something went wrong");
					}
				});
				
			}
			else
			{
				highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false);
			}
		}
	}, 500);

	//Redraw the submarket boundaries (if shown) once this visualization's own fog overlay has
	//almost certainly finished (re)loading - see refreshSubmarketBoundariesAfterVisChange().
	setTimeout(refreshSubmarketBoundariesAfterVisChange, 2000);
}

function printNumberFormat(num)
{
	if(num != null && num != "" && num != "undefined" && parseFloat(num) > 0 && !isNaN(num))
	{
		return numberWithCommas(num);
	}
	return 0;
}

function PrintYesNo(x) {
	if(x == null)
		return '';
	else 
	{
		if(x == true || x == 1)
			return "Yes";
		else
			return "No";
	}
}

function printIfNotNull(x) {
	if(x == null)
		return '';
	else
		return x;
}

function printBlankIfNotNull(x) {
	if(x == null || x == 0 )
		return '';
	else
		return x;
}
function numberWithCommas(x) {
	if(x == null)
		return '';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function printSqFt(sqft)
{
	if(sqft != null && sqft != "" && sqft != "undefined" && sqft != "0")
	{
		//sqft = parseFloat(sqft) * parseFloat(cityAreaMeasurementMultiplier);
		//sqft = sqft.toFixed(2);
		sqft = Math.round(sqft);
		return numberWithCommas(sqft) + " " + cityAreaMeasurementUnit;
	}
	return "";
}

function printIfNotNull(val)
{
	if(val != null)
	{
		return val;
	}
	return "";
}

function setWidthOfBottomBox()
{
	/* if($(".panoButton").attr("display") == "block")
		$("#viewerController").css("width", "220px");
	else
		$("#viewerController").css("width", "170px"); */
}

//True when any "Isolate" effect variant is active (Isolate on dark / on white / satellite / with
//labels). Used to keep the building infobox open on a map click the same way active Spotlight/
//Highlight already do (see the effectsArray[1]/[2] checks in the LEFT_CLICK handler).
function anyIsolateEffectActive()
{
	if(typeof effectsArray != "undefined" && effectsArray != null
		&& (effectsArray[0] == 1 || effectsArray[6] == 1 || effectsArray[9] == 1))
		return true;
	//window.isolateEffectActive is a legacy flag that's never actually set to true anywhere any more
	//(only reset) - window.isolateOnDarkEffectActive is what createIsolateOnDarkEffect()/
	//clearIsolateOnDarkEffect() actually toggle for "Isolate on Dark". Its absence here was the bug:
	//clicking the map while Isolate on Dark was active still closed the infobox.
	return !!(window.isolateOnDarkEffectActive || window.isolateWithWhiteActive
		|| window.isolateSatelliteEffectActive || window.isolateWithLabelsEffectActive);
}

function closeInfobox(forceClose = false)
{
	if(typeof RemoveEntitiesByType != "undefined" && typeof dashedEntityList != "undefined")
		RemoveEntitiesByType(dashedEntityList);
	$("#companyLogoContainer").hide();
	if(typeof viewer != "undefined")
	{
		if (viewer.entities.getById('imageLabel')) viewer.entities.removeById('imageLabel');
		if (viewer.entities.getById('logoConnectorLine')) viewer.entities.removeById('logoConnectorLine');
		if (viewer.entities.getById('sqftConnectorLine')) viewer.entities.removeById('sqftConnectorLine');
		if (viewer.entities.getById('areaLabel')) viewer.entities.removeById('areaLabel');
	}
	
	lastSelectedBuilding = null;
	setWidthOfBottomBox();
	if((!spotlightEffectActive && !highlightEffectActive && !buildingAssetEffectActive) || forceClose)
	{
		resetLastSelectedPrimitive();
		$(".infoboxContainer").hide();  $("#infoboxFloorPlanRow").hide();
		window.lastSuite = null;
		//$(".orbitButton").hide();
		if(typeof viewer != "undefined")
			viewer.entities.removeById("starRatingBox");
	}
	window.lastSuiteId = "";
	devSelectedBuilding = null;
	updateURL();
}

var lastSelectedBuilding = null;
function resetLastEntity()
{
	if(lastSelectedBuilding != null)
		viewer.entities.getById(lastSelectedBuilding).polygon.material = Cesium.Color.RED.withAlpha(0.5);
}


/*
Key event handlers
*/
/*
document.addEventListener(
  "keydown",
  function (e) {
    var flagName = getFlagForKeyCode(e.keyCode);
  },
  false
);
var cameraMoveAmount = 50;
function getFlagForKeyCode(keyCode) {
  switch (keyCode) {
    case 46: //DEL
      deleteLastSelectedPoint();
	  break;
	case 84: //T
      ToggleGoogleTileset();
	  break;
	case 82: //R
      moveUpsideDown();
	  break;
	case 27: //ESC
		movingPoint = null;
		movingPointIndex = null;
		resetHighlightedPoint();
	  break;
	case 37: //LEFT
		//viewer.scene.camera.moveLeft(cameraMoveAmount);
		moveCamera("Left");
	  break;
	case 38: //UP
		//viewer.scene.camera.moveUp(cameraMoveAmount);
		moveCamera("Forward");
	  break;
	case 39: //Right
		//viewer.scene.camera.moveRight(cameraMoveAmount);
		moveCamera("Right");
	  break;
	case 40: //Down
		//viewer.scene.camera.moveDown(cameraMoveAmount);
		moveCamera("Backward");
	  break;
  }
}

function moveCamera(direction)
{
	var ellipsoid = viewer.scene.globe.ellipsoid;
	var cameraHeight = ellipsoid.cartesianToCartographic(viewer.scene.camera.position).height;
	var moveRate = cameraHeight / 100;//100 is variable
	if(direction == 'Right')
	{
		viewer.scene.camera.moveRight(moveRate);
		$(".ticksCounter").html(window.rightTicks+" Steps");
	}
	else if(direction == 'Left')
	{
		viewer.scene.camera.moveLeft(moveRate);
		$(".ticksCounter").html(window.rightTicks+" Steps");
	}
	else if(direction == 'Up')
	{
		viewer.scene.camera.moveUp(moveRate);
		$(".ticksCounter").html(window.rightTicks+" Steps");
	}
	else if(direction == 'Down')
	{
		viewer.scene.camera.moveDown(moveRate);
		$(".ticksCounter").html(window.rightTicks+" Steps");
	}
	else if(direction == 'Forward')
	{
		viewer.scene.camera.moveForward(moveRate);
		$(".ticksCounter").html(window.rightTicks+" Steps");
	}
	else if(direction == 'Backward')
	{
		viewer.scene.camera.moveBackward(moveRate);
		$(".ticksCounter").html(window.rightTicks+" Steps");
	}
}

function moveUpsideDown() {
  var camera = viewer.camera;
  camera.flyTo({
    destination: camera.positionWC,
    duration: 4,
    orientation: {
      heading: 0,
    },
    duration: 4,
  });
}

*/


var searchActive = false;
function toggleSearchBox(forceClose = false) {
	//console.log("In toggleSearch() => "+searchActive);
	
	if(forceClose)
	{
		$(".searchTooltip").hide();
		$("#searchBoxController").hide();
		$(".searchTooltip").show();//Re-Enable tooltip

		$("#searchBox").val();
		$("#suggestions").html("");
		searchActive = false;
		$("#searchIconImage").attr("src","images/search.png");
		
		$('.dropdownCam').removeClass('active');
	}
	else
	{
		if(!searchActive)
		{
			$(".dropdown2-toggle").attr("src", "images/settings.png");
			$(".dropdown2 ").removeClass("active");
			
			$(".dropdown3").removeClass("active");
			$(".dropdown3-toggle").attr("src", "images/location_city.png");
		
			
			$(".searchTooltip").hide();
			$("#searchBoxController").show();
			$("#searchBox").val("");
			$("#searchBox").focus();
			$("#suggestions").html("");
			$("#searchIconImage").attr("src","images/search-active.png");
		}
		else
		{
			$(".searchTooltip").show();
			$("#searchBoxController").hide();
			$("#searchBox").val();
			$("#suggestions").html("");
			$("#searchIconImage").attr("src","images/search.png");
		}
		searchActive = !searchActive;
	}
}
var shrinkEffectInActive = false;
function toggleShrinkTileset(shrinkReset = false) {
	if(shrinkReset == true)
	{
		viewer.scene.verticalExaggeration = 1;
		shrinkEffectInActive = false;
	}
	else
	{
		if(!shrinkEffectInActive)
		{
			viewer.scene.verticalExaggeration = 0.2;
			viewer.scene.verticalExaggerationRelativeHeight = Number(cameraAltitudeAdjustment);
		}
		else
		{
			viewer.scene.verticalExaggeration = 1;
		}
		shrinkEffectInActive = !shrinkEffectInActive;
	}
}

// Camera Rotation
var autoRotate = false;
var autoRotateSlow = false;
var unsubscribeSlowZoom = null;
function ToggleCameraRotationSlowly() {
	
	if(typeof camera == "undefined")
	{
		camera = viewer.camera;
	}
  if (autoRotateSlow) {
    autoRotateSlow = false;
    StopCameraSlowRotation();
    camera.defaultZoomAmount = 100000.0;
    $("#autoRotateZoom").attr("src", "images/360.png");
  } else {
	setTimeout(function (){ $(".rotateTooltip").hide(); }, 1000);
	autoRotateSlow = true;
	camera.defaultZoomAmount = 10;
	CameraSlowRotation();
	$("#autoRotateZoom").attr("src", "images/pause-active.png");
  }
}
window.buildingRotationInProgress = false;
function ToggleCameraRotationForBuilding() {
	if (window.buildingRotationInProgress) {
		stopCameraRotation2();
		$("#autoRotateZoom4").attr("src", "images/change_circle.png");
	} else {
		flyToBuildingCamera(parseInt(devSelectedBuilding));
		autoRotateSlow = true;
		var temp = null;
		if(typeof TempBldgData[parseInt(devSelectedBuilding)] != "undefined")
			temp = TempBldgData[parseInt(devSelectedBuilding)].coords.split(",");
		else
			temp = window.devSelectedBuildingCoord.split(",");
			
		var ht = cameraAltitudeAdjustment;
		if(typeof TempBldgData[parseInt(devSelectedBuilding)] != "undefined" && typeof TempBldgData[parseInt(devSelectedBuilding)].calculatedMaxHeight != "undefined" && TempBldgData[parseInt(devSelectedBuilding)].calculatedMaxHeight != null && TempBldgData[parseInt(devSelectedBuilding)].calculatedMaxHeight != 0)
		{
			ht += parseInt(TempBldgData[parseInt(devSelectedBuilding)].calculatedMaxHeight);
		}
		else
		{
			ht += 100;
		}
		//setTimeout(function (){CameraRotation2(temp[0], temp[1], ht)}, 3500) ;
		setTimeout(function (){ CameraRotation2(window.SelectedBuildingLon, window.SelectedBuildingLat, ht); }, 4200) ;
		$("#autoRotateZoom4").attr("src", "images/pause_circle_red.png");
	}
	window.buildingRotationInProgress = !window.buildingRotationInProgress;
}

function StopCameraSlowRotation() {
  viewer.scene.screenSpaceCameraController.enableZoom = true;
  if(typeof unsubscribeSlowZoom != "undefined" && unsubscribeSlowZoom != null)
	unsubscribeSlowZoom();
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

// Fixed hardcoded camera pose to orbit around.
var fixedOrbitCameraView = {
	altitude: 1034.9018851086933,
	heading: 63.75604160975421,
	latitude: 40.707910569143515,//40.71010422201325,
	longitude:  -74.02494516642378, //-74.01814517867385,
	pitch: -32.91479584791279,
	roll: 359.9999994970778,
	tilt: 57.08520415208721
};

window.fixedOrbitInProgress = false;
var unsubscribeFixedOrbit = null;

function LookAtPointFromHeight(longitude = -74.02494516642378, latitude = 40.707910569143515, height = 1371) {
	if (typeof camera == "undefined")
		camera = viewer.camera;

	// Camera sits directly above the point at the given altitude, pitched straight down at it.
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
		orientation: {
			heading: Cesium.Math.toRadians(0),
			pitch: Cesium.Math.toRadians(-90),
			roll: 0,
		},
	});
}

function GoToFixedOrbitCameraView() {
	if (window.fixedOrbitInProgress)
	{
		StopFixedPointOrbit();
		window.fixedOrbitInProgress = false;
		return;
	}
	if (typeof camera == "undefined")
		camera = viewer.camera;

	// StartFixedPointOrbit (marketOrbit.js) flies to the camera pose itself
	// over 3 seconds, then begins orbiting once it has settled there.
	StartFixedPointOrbit(
		fixedOrbitCameraView.longitude,
		fixedOrbitCameraView.latitude,
		1371,
		fixedOrbitCameraView.longitude,
		fixedOrbitCameraView.latitude,
		fixedOrbitCameraView.altitude,
		fixedOrbitCameraView.roll,
		0.005
	);
}

window.lookAroundInProgress = false;
var unsubscribeLookAround = null;

// Camera stays put at the fixed lat/lon/altitude and just spins heading in
// place, like a person standing still and turning to look around.
function StartLookAroundFromPoint(rotationSpeed = 0.0005) {
	if (window.lookAroundInProgress)
	{
		StopLookAroundFromPoint();
		return;
	}

	if (typeof camera == "undefined")
		camera = viewer.camera;

	// Snap the camera to the exact hardcoded pose first.
	viewer.camera.setView({
		destination: Cesium.Cartesian3.fromDegrees(
			fixedOrbitCameraView.longitude,
			fixedOrbitCameraView.latitude,
			fixedOrbitCameraView.altitude
		),
		orientation: {
			heading: Cesium.Math.toRadians(fixedOrbitCameraView.heading),
			pitch: Cesium.Math.toRadians(fixedOrbitCameraView.pitch),
			roll: Cesium.Math.toRadians(fixedOrbitCameraView.roll),
		},
	});

	var position = Cesium.Cartesian3.clone(camera.position);
	var heading = camera.heading;
	var pitch = camera.pitch;
	var roll = camera.roll;

	window.lookAroundInProgress = true;
	viewer.scene.screenSpaceCameraController.enableZoom = false;
	viewer.scene.screenSpaceCameraController.enableRotate = false;
	unsubscribeLookAround = viewer.clock.onTick.addEventListener(function () {
		heading += rotationSpeed;
		camera.setView({
			destination: position,
			orientation: { heading: heading, pitch: pitch, roll: roll },
		});
	});
}

function StopLookAroundFromPoint() {
	if (!window.lookAroundInProgress)
		return;
	window.lookAroundInProgress = false;
	viewer.scene.screenSpaceCameraController.enableZoom = true;
	viewer.scene.screenSpaceCameraController.enableRotate = true;
	if (typeof unsubscribeLookAround != "undefined" && unsubscribeLookAround != null)
		unsubscribeLookAround();
	unsubscribeLookAround = null;
}

async function CameraSlowRotation(defaultIdtcamera = null, defaultCurrentPosition = null) {
	camera = viewer.scene.camera;
	
	var idtcameraToRotateAround = defaultIdtcamera;
	if(defaultIdtcamera == null)
	{
		var mktDetail = [];
		if(typeof window.citiesWithMultipleMarket[lastCityLoaded] == "undefined")
		{
			$.each(marketDetails, function (index, row){
				if(row.idtcity == lastCityLoaded)
				{
					mktDetail = row;
					idtcameraToRotateAround = mktDetail.skylineidtcamera;
				}
			});
		}
		else
		{
			console.log("In Else for City With Multiple Markets !!! ");
			var matchFound = false;
			$.each(marketDetails, function (index, row){
				console.log(row.idtmarket+" == "+lastMarketLoaded);
				if(row.idtmarket == lastMarketLoaded && matchFound == false)
				{
					mktDetail = row;
					idtcameraToRotateAround = mktDetail.marketcamera;
					matchFound = true;
					console.log("idtcameraToRotateAround: "+idtcameraToRotateAround);
					console.log(marketCameraRotationDetails[idtcameraToRotateAround]);
				}
			});
		}
	}
	if(typeof marketCameraRotationDetails[idtcameraToRotateAround] != "undefined")
	{
		//var latLonDetails = getMapCenterV2();
		  //console.log("latLonDetails");
		  //console.log(marketCameraRotationDetails[idtcameraToRotateAround]);
		  
		  /*
		  viewer.entities.add({
			  name: "Green cylinder with black outline",
			  position: Cesium.Cartesian3.fromDegrees(latLonDetails[0], latLonDetails[1], 200000.0),
			  cylinder: {
				length: 400000.0,
				topRadius: 20.0,
				bottomRadius: 20.0,
				material: Cesium.Color.GREEN.withAlpha(0.5),
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			  },
			});
		  */

		  currentPosition = Cesium.Cartesian3.fromDegrees(
			  marketCameraRotationDetails[idtcameraToRotateAround].rotation_longitude,
			  marketCameraRotationDetails[idtcameraToRotateAround].rotation_latitude,
			  marketCameraRotationDetails[idtcameraToRotateAround].rotation_altitude
		  );
		  //console.log(currentPosition);
		  //debugger;
		  if(defaultCurrentPosition != null)
		  {
			  currentPosition = defaultCurrentPosition;
		  }
		  var pitch = viewer.camera.pitch;
		  heading = camera.heading;
		  var down = true;
		  var increment = 0.08;
		  var ceiling =
			Cesium.Cartesian3.distance(currentPosition, camera.position) + 30;

		  unsubscribeSlowZoom = viewer.clock.onTick.addEventListener(() => {
			viewer.screenSpaceEventHandler.setInputAction(function (amount) {
			  amount =
				(Cesium.Math.sign(amount) *
				  viewer.scene.camera.positionCartographic.height) /
				Math.log(viewer.scene.camera.positionCartographic.height);
			  viewer.scene.camera.zoomIn(amount);
			  viewer.scene.camera.zoomOut(amount);
			  pitch = viewer.camera.pitch;
			  heading = camera.heading;
			}, Cesium.ScreenSpaceEventType.WHEEL);
			let rotation = -1; //counter-clockwise; +1 would be clockwise
			viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
			elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);
			////console.log(elevation);
			//debugger;
			const SMOOTHNESS = 5000; //it would make one full circle in roughly 800 frames
			heading += (rotation * Math.PI) / SMOOTHNESS;
			if (down == true && elevation <= ceiling) {
			  elevation -= increment;

			  if (Math.floor(elevation) == 70) {
				down = false;
			  }
			} else {
			  down = false;
			  elevation += increment;

			  if (Math.floor(elevation) == Math.floor(ceiling)) {
				down = true;
			  }
			}
			////console.log("Heading " + heading);
			viewer.camera.lookAt(
			  currentPosition,
			  new Cesium.HeadingPitchRange(heading, pitch, elevation)
			);
		  });
	}
}

const SMOOTHNESSDebug = 2000; //it would make one full circle in roughly 800 frames
const incrementDebug = 0.8;
async function CameraSlowRotationDebugMode() {
	camera = viewer.scene.camera;
	
	var latLonDetails = getMapCenterV2();

	  currentPosition = Cesium.Cartesian3.fromDegrees(
		  latLonDetails[0],
		  latLonDetails[1],
		  latLonDetails[2]
	  );
	  //console.log(currentPosition);
	  var pitch = viewer.camera.pitch;
	  heading = camera.heading;
	  var down = true;
	  var ceiling =
		Cesium.Cartesian3.distance(currentPosition, camera.position) + 30;

	  unsubscribeSlowZoom = viewer.clock.onTick.addEventListener(() => {
		viewer.screenSpaceEventHandler.setInputAction(function (amount) {
		  amount =
			(Cesium.Math.sign(amount) *
			  viewer.scene.camera.positionCartographic.height) /
			Math.log(viewer.scene.camera.positionCartographic.height);
		  viewer.scene.camera.zoomIn(amount);
		  viewer.scene.camera.zoomOut(amount);
		  pitch = viewer.camera.pitch;
		  heading = camera.heading;
		}, Cesium.ScreenSpaceEventType.WHEEL);
		let rotation = -1; //counter-clockwise; +1 would be clockwise
		viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);
		////console.log(elevation);
		//debugger;
		heading += (rotation * Math.PI) / SMOOTHNESSDebug;
		if (down == true && elevation <= ceiling) {
		  elevation -= incrementDebug;

		  if (Math.floor(elevation) == 70) {
			down = false;
		  }
		} else {
		  down = false;
		  elevation += incrementDebug;

		  if (Math.floor(elevation) == Math.floor(ceiling)) {
			down = true;
		  }
		}
		////console.log("Heading " + heading);
		viewer.camera.lookAt(
		  currentPosition,
		  new Cesium.HeadingPitchRange(heading, pitch, elevation)
		);
	  });
}

function getMapCenter() {
  var windowPosition = new Cesium.Cartesian2(
    viewer.container.clientWidth / 2,
    viewer.container.clientHeight / 2
  );
  var pickRay = viewer.scene.camera.getPickRay(windowPosition);
  var pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
  var pickPositionCartographic =
    viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
  var lon = parseFloat(pickPositionCartographic.longitude * (180 / Math.PI));
  var lat = parseFloat(pickPositionCartographic.latitude * (180 / Math.PI));
  var height = parseFloat(pickPositionCartographic.height);
  //console.log(lon+", "+lat+" @ "+height);
  var cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);
  return [lon, lat, height];
}

function getMapCenterV2() {
  var windowPosition = new Cesium.Cartesian2(
    viewer.container.clientWidth / 2,
    viewer.container.clientHeight / 2
  );
  var pickRay = viewer.scene.camera.getPickRay(windowPosition);
  var pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
  var pickPositionCartographic =
    viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
  var lon = parseFloat(pickPositionCartographic.longitude * (180 / Math.PI));
  var lat = parseFloat(pickPositionCartographic.latitude * (180 / Math.PI));
  var height = parseFloat(pickPositionCartographic.height);
  return [lon, lat, height];
  //var cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);
  //return cartesian;
}

var lastBuildingSolidFloorHighlighted = null;
var buildingAssetEffectActive = false;
window.lastHolesString = "";
window.lastHolesArray = [];
window.buildingAssetHeightvalues = [];

// Alternative footprint clip used ONLY by createBuildingAssets() (the "Files" effect). Same end
// result as clearClipSelectedBuildingApp15() + ToggleInverseClipSelectedBuildingApp15() - a
// building-shaped hole cut in the Google 3D Tileset so the app's own floor geometry shows through -
// but it does NOT touch globe.baseColor (the old path sets it to GRAY and can leave it stuck), and
// it reuses the ClippingPolygonCollection instead of reassigning it (avoids a tileset shader
// recompile every call).
async function clipGoogleTilesetForBuildingAssets(idtbldg)
{
	if(typeof googleTileset == "undefined" || googleTileset == null)
		return;
	if(typeof TempBldgData[idtbldg] == "undefined" || TempBldgData[idtbldg] == null || typeof TempBldgData[idtbldg].coords == "undefined")
		return;

	IsEnableClip = true;
	window.lastBuildingClipped = idtbldg;

	//Buffer the footprint outward 5 m, same as EnableBuildingClipping().
	var bufferCoords = [];
	await GetTurfPolyGon(TempBldgData[idtbldg].coords);
	var buffered = turf.buffer(TurfPolygon, 5, { units: "meters", steps: 8 });
	$.each(buffered.geometry.coordinates[0], function (i, pt){
		bufferCoords.push(pt[0], pt[1]);
	});

	var polygon = new Cesium.ClippingPolygon({
		positions: Cesium.Cartesian3.fromDegreesArray(bufferCoords),
	});

	if(googleTileset.clippingPolygons && !googleTileset.clippingPolygons.isDestroyed())
	{
		googleTileset.clippingPolygons.removeAll();
		googleTileset.clippingPolygons.add(polygon);
		googleTileset.clippingPolygons.inverse = false;//clip the region INSIDE the footprint - a building-shaped hole
	}
	else
	{
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
			polygons: [polygon],
			inverse: false,
		});
	}
}

function createBuildingAssets(idtbldg)
{
	/*
	if(highlightEffectActive)
	{
		clearHighlightEffect();
		highlightEffectActive = !highlightEffectActive;
	}
	if(floorplanEffectActive)
	{
		effectsArray[7] = 0;//floorplans effect
		clearFloorplanEffect();
		window.lastSuite = null;
		floorplanEffectActive = false;
	}
	*/
	//if(!buildingAssetEffectActive)
	if(true)
	{
		effectsArray[5] = 1;//Floor plan effect
		//console.log("Floor In Progress");
		buildingIdInEffect = idtbldg;
		//$("#legendPanel").hide();
		//Create clipping plane and data
		if(effectsArray[0] == 1 || effectsArray[6] == 1 )
		{
			googleTileset.show = false;
		}
		else
		{
			/* googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
			  polygons: [
				new Cesium.ClippingPolygon({
				  positions: new Cesium.Cartesian3.fromDegreesArray(
					eval("["+TempBldgData[idtbldg].coords+"]")
				  ),
				}),
			  ],
			});
			googleTileset.clippingPolygons.enabled = true; */
			//clearClipSelectedBuildingApp15();
			if(parseInt(lastCityLoaded) == 4)
				clipGoogleTilesetForBuildingAssets(idtbldg);
			else
				ToggleInverseClipSelectedBuildingApp15(idtbldg);
		}
		
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		//viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		
		
		$("#assetButton").removeClass("btn-secondary");
		$("#assetButton").addClass("btn-primary");
		
		lastBuildingSolidFloorHighlighted = idtbldg;
		//console.log("idtbldg "+idtbldg);
		clr = "";
		//lastFloorHeight = 0;
		//if(lastCityLoaded == 2)
		
		lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
		if(TempBldgData[idtbldg].basefloorheight != null)
			lastFloorHeight += parseFloat(TempBldgData[idtbldg].basefloorheight);
		
		floorHeight = (TempBldgData[idtbldg].altitude / TempBldgData[idtbldg].floors);
		if(floorHeight < 2 || floorHeight > 8)
			floorHeight = 4;
		var coordsToUse = eval("[" + TempBldgData[idtbldg].coords + "]");
		
		if(typeof window.buildingAssetHeightvalues[idtbldg] == "undefined")
		{
			window.buildingAssetHeightvalues[idtbldg] = [];
		}
		
		$.each(TempBldgData[idtbldg].floorDetails, function(i, eachFloor){
			if (clr == "" || clr == "Cesium.Color.YELLOW.withAlpha(0.07)" || clr == "Cesium.Color.WHITE")
				clr = "Cesium.Color.RED.withAlpha(0.07)";
			else if (clr == "Cesium.Color.RED.withAlpha(0.07)")
				clr = "Cesium.Color.YELLOW.withAlpha(0.07)";
			var loopFloorHt = floorHeight;
			if(eachFloor.floor_height != null && parseFloat(eachFloor.floor_height) > 0)
				loopFloorHt = parseFloat(eachFloor.floor_height);
			if(typeof buildingFiles[idtbldg] != "undefined" && typeof buildingFiles[idtbldg][eachFloor.number] != "undefined")
			{
				clr = "Cesium.Color.WHITE";
				
				window.buildingAssetHeightvalues[idtbldg][eachFloor.number] = [];
				window.buildingAssetHeightvalues[idtbldg][eachFloor.number][0] = (parseFloat(lastFloorHeight)).toFixed(2);
				window.buildingAssetHeightvalues[idtbldg][eachFloor.number][1] = (parseFloat(lastFloorHeight) + parseFloat(loopFloorHt)).toFixed(2);
				window.buildingAssetHeightvalues[idtbldg][eachFloor.number][2] = TempBldgData[idtbldg].coords;
			}
			
			
			viewer.entities.add({
			  id: "floor-" + idtbldg + "-" + (i+1)+"-"+eachFloor.number,
			  polygon: {
				hierarchy: Cesium.Cartesian3.fromDegreesArray(coordsToUse),
				extrudedHeight: lastFloorHeight,
				height: lastFloorHeight + loopFloorHt,
				material: eval(clr),
			  },
			});
			defaultShow = false;
			if(defaultFloorSelected != null && defaultFloorSelected != 0 && defaultFloorSelected == eachFloor.number)
			{
				window.lastSelectedPolygonEntityId = "floor-" + idtbldg + "-" + (i+1)+"-"+eachFloor.number;;
				viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outline = true;
				viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outlineColor = Cesium.Color.WHITE;
				viewer.entities.getById(window.lastSelectedPolygonEntityId).polygon.outlineWidth = 10;
				defaultShow = true;
				defaultFloorSelected = null;
			}
			
			showFloorNumberLabelV3("floorLabelAsset-"+idtbldg+"-"+eachFloor.number, coordsToUse[0], coordsToUse[1], (lastFloorHeight + loopFloorHt - 2), eachFloor.number, "14px Helvetica Neue", 10, true, true, false, defaultShow);
			lastFloorHeight = lastFloorHeight + loopFloorHt;
		});
		/*
		for(var i = 1; i <= TempBldgData[idtbldg].floors; i++)
		{
			if (clr == "" || clr == "Cesium.Color.YELLOW.withAlpha(0.75)")
				clr = "Cesium.Color.RED.withAlpha(0.75)";
			else if (clr == "Cesium.Color.RED.withAlpha(0.75)")
				clr = "Cesium.Color.YELLOW.withAlpha(0.75)";
			viewer.entities.add({
			  id: "floor-" + idtbldg + "-" + i,
			  polygon: {
				hierarchy: Cesium.Cartesian3.fromDegreesArray(eval("[" + TempBldgData[idtbldg].coords + "]")),
				extrudedHeight: lastFloorHeight,
				height: lastFloorHeight + floorHeight,
				material: eval(clr),
			  },
			});
			lastFloorHeight = lastFloorHeight + floorHeight;
		}
		*/
		buildingAssetEffectActive = true;
	}
	else
	{
		effectsArray[5] = 0;//Floor plan effect
		//console.log("Floor RESET");
		if(effectsArray[0] == 1 || effectsArray[6] == 1 )
		{
			//Create clipping effect for this building
			clearClipSelectedBuildingApp15();
			IsEnableClip = false;
			ToggleClipSelectedBuildingApp15(idtbldg);
			
			googleTileset.show = true;
		}
		else if(effectsArray[1] == 1)
		{
			window.lastHolesString = '';
			if(typeof TempBldgData[idtbldg] != "undefined")
				window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
			clearPrimitives(false);
			viewer.entities.removeById("FogEffectEntity");debugger;
			viewer.entities.removeById("NewFogEffectEntity");
			//viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		}
		else
		{
			//googleTileset.clippingPolygons.enabled = false;
			clearClipSelectedBuildingApp15();
		}
		$(".floorNumberRowTR").hide();
		clearBuildingAssets();
		//if(!spotlightEffectActive && !highlightEffectActive && !isolateEffectActive && !newHighlightEffectActive && !isolateSatelliteEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
	}
	buildingAssetEffectActive = !buildingAssetEffectActive;
	toggleFloorPlan(parseInt(idtbldg));
	updateURL();
}

function clearBuildingAssets()
{
	$("#assetButton").addClass("btn-secondary");
	$("#assetButton").removeClass("btn-primary");
	clearClipSelectedBuildingApp15();
	effectsArray[5] = 0;//Floor plan effect
	$(".floorNumberRowTR").hide();
	
	$("#infoboxFloorPlanRow").html("");
	$("#infoboxFloorPlanRow").hide();
	
	$("#assetButton").addClass("btn-secondary");
	$("#assetButton").removeClass("btn-primary");
	if(typeof TempBldgData[lastBuildingSolidFloorHighlighted] != "undefined" && typeof TempBldgData[lastBuildingSolidFloorHighlighted].floorDetails != "undefined")
	$.each(TempBldgData[lastBuildingSolidFloorHighlighted].floorDetails, function(i, eachFloor){
		viewer.entities.removeById("floor-"+lastBuildingSolidFloorHighlighted+"-"+(i+1)+"-"+eachFloor.number);
	});
	if(effectsArray[4] == 0)
	{
		$.each(floorLabels, function (index, eachLabel){
			viewer.entities.removeById(eachLabel);
		});
		floorLabels = [];
	}
	else
	{
		$.each(floorLabels, function (index, eachLabel){
			viewer.entities.getById(eachLabel).show = false;
		});
	}
	googleTileset.show = true;
}

async function initiateClippingPlane()
{
	clipTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207, {
		/*maximumScreenSpaceError: 1,*/
	});
	viewer.scene.primitives.add(clipTileset);
	clipTileset.show = false;
	
	googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
	  polygons: [
		new Cesium.ClippingPolygon({
		  positions: new Cesium.Cartesian3.fromDegreesArray(
			eval("["+TempBldgData[buildingIdInEffect].coords+"]")
		  ),
		}),
	  ],
	});
	googleTileset.clippingPolygons.enabled = true;
	
	clipTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
	  polygons: [
		new Cesium.ClippingPolygon({
		  positions: new Cesium.Cartesian3.fromDegreesArray(
			eval("["+TempBldgData[buildingIdInEffect].coords+"]")
		  ),
		}),
	  ],
	});
	clipTileset.clippingPolygons.enabled = true;
	clipTileset.clippingPolygons.inverse = true;
	clipTileset.show = true;
	
}

var TransparencyDivDisplay = false;
function toggleTransparencyDivDisplay()
{
	if(!TransparencyDivDisplay)
	{
		$("#transparencyImageId").attr("src", "images/title-active.png");
		$("#transparencyDiv").show();
		if(clipTileset == null)
		{
			initiateClippingPlane();
		}
		else
		{
			googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
			  polygons: [
				new Cesium.ClippingPolygon({
				  positions: new Cesium.Cartesian3.fromDegreesArray(
					eval("["+TempBldgData[buildingIdInEffect].coords+"]")
				  ),
				}),
			  ],
			});
			googleTileset.clippingPolygons.enabled = true;
			
			clipTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
			  polygons: [
				new Cesium.ClippingPolygon({
				  positions: new Cesium.Cartesian3.fromDegreesArray(
					eval("["+TempBldgData[buildingIdInEffect].coords+"]")
				  ),
				}),
			  ],
			});
			clipTileset.clippingPolygons.enabled = true;
			clipTileset.clippingPolygons.inverse = true;
			clipTileset.show = true;
		}
	}
	else
	{
		$("#transparencyImageId").attr("src", "images/title.png");
		$("#transparencyDiv").hide();
		UpdateTransparency(1);
		$("#opacity").val(1);
		$("#opacityText").val(1);
		if(clipTileset != null)
		{
			clipTileset.clippingPolygons.enabled = false;
			clipTileset.clippingPolygons.inverse = false;
			clipTileset.show = false;
		}
		if(typeof googleTileset.clippingPolygons != "undefined" & googleTileset.clippingPolygons != null)
		{
			googleTileset.clippingPolygons.enabled = false;
		}
	}
	TransparencyDivDisplay = !TransparencyDivDisplay;
}

window.isolateOnDarkEffectActive = false;
var buildingIdInEffect = null;
window.stadiaMapLoaded = false;
function createIsolateOnDarkEffect(idtbldg)
{
	setResetTickForEffectsButtons("isolateWithDarkButton", true);
	/*
	if(window.isolateOnDarkEffectActive == true)
	{
		window.isolateOnDarkEffectActive = false;
		clearIsolateOnDarkEffect();
		clearClipSelectedBuildingApp15();
		
		$("#transparencyDiv").hide();
		$("#opacity").val(1);
		$("#opacityText").val(1);
		TransparencyDivDisplay = false;
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		return;
	}
	*/
	//clearIfExistingEffectsAreOn();
	if(!window.stadiaMapLoaded)
	{
		//Stdia map
		const imageryViewModels = [];
		imageryViewModels.push(new Cesium.ProviderViewModel({
			name: "Stadia Alidade Smooth Dark",
			iconUrl: Cesium.buildModuleUrl(
			  "Widgets/Images/ImageryProviders/stadiaAlidadeSmoothDark.png"
			),
			tooltip: "Stadia Alidade Smooth Dark, like its lighter cousin, is also designed to stay out of the way. It just flips the dark mode switch on the color scheme. With the lights out, your data can now literally shine.\nhttps://docs.stadiamaps.com/map-styles/alidade-smooth-dark/",
			category: "Other",
			creationFunction: function() {
			  return new Cesium.UrlTemplateImageryProvider({
				url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
				minimumLevel: 0,
				maximumLevel: 20   // important to allow fine detail
			  });
			}
		  }));

		//Finally, create the baseLayerPicker widget using our view models.
		const layers = viewer.imageryLayers;
		const baseLayerPicker = new Cesium.BaseLayerPicker("baseLayerPickerContainer", {
			globe: viewer.scene.globe,
			imageryProviderViewModels: imageryViewModels
		});
		createTerrain();
		
		window.stadiaMapLoaded = true;
	}
	//if(typeof window.isolateOnDarkEffectActive == "undefined" || !window.isolateOnDarkEffectActive)
	if(true)
	{
		//viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
		effectsArray[0] = 1;//setting isolate effect
		
		viewer.scene.globe.depthTestAgainstTerrain = true;
		buildingIdInEffect = idtbldg;
		//createStadiaTerrain();
		$("#legendPanel").hide();
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		
		ToggleClipSelectedBuildingApp15(idtbldg, true);
		/*
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
		  polygons: [
			new Cesium.ClippingPolygon({
			  positions: new Cesium.Cartesian3.fromDegreesArray(
				eval("["+TempBldgData[idtbldg].coords+"]")
			  ),
			}),
		  ],
		});
		googleTileset.clippingPolygons.enabled = true;
		googleTileset.clippingPolygons.inverse = true;
		globe.translucency.enabled = false;
		
		*/
		$("#isolateButton").removeClass("btn-secondary");
		$("#isolateButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
		window.isolateOnDarkEffectActive = true;
	}
	/*
	else
	{
		effectsArray[0] = 0;//re-setting isolate dark effect
		viewer.scene.globe.depthTestAgainstTerrain = false;
		
		if(effectsArray[5] == 1)
		{
			googleTileset.show = true;
			googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
			  polygons: [
				new Cesium.ClippingPolygon({
				  positions: new Cesium.Cartesian3.fromDegreesArray(
					eval("["+TempBldgData[parseInt(devSelectedBuilding)].coords+"]")
				  ),
				}),
			  ],
			});
			googleTileset.clippingPolygons.enabled = true;
			
		}
		else
		{
			clearClipSelectedBuildingApp15();
			
		}
		window.isolateOnDarkEffectActive = false;
		clearIsolateOnDarkEffect();
		
		$("#transparencyDiv").hide();
		$("#opacity").val(1);
		$("#opacityText").val(1);
		TransparencyDivDisplay = false;
		//if(!buildingAssetEffectActive && !highlightEffectActive && !spotlightEffectActive && !newHighlightEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
	}
	*/
	updateURL();
}

function clearIsolateOnDarkEffect()
{
	setResetTickForEffectsButtons("isolateWithDarkButton", false);
	window.isolateOnDarkEffectActive = false;
	clearClipSelectedBuildingApp15();
	effectsArray[0] = 0;//re-setting isolate dark effect
	removeTerrain();
	window.stadiaMapLoaded = false;
	viewer.scene.globe.depthTestAgainstTerrain = false;
	globe.translucency.enabled = false;
	
	$("#transparencyDiv").hide();
	$("#opacity").val(1);
	$("#opacityText").val(1);
	TransparencyDivDisplay = false;
	
	//$("#isolateButton").addClass("btn-secondary");
	//$("#isolateButton").removeClass("btn-primary");
	
	const layers = viewer.imageryLayers;

	  // Remove Stadia layer — iterate in reverse to safely splice while looping
	  for (let i = layers.length - 1; i >= 0; i--) {
		const layer = layers.get(i);
		const provider = layer.imageryProvider;

		if (
		  provider instanceof Cesium.UrlTemplateImageryProvider &&
		  provider.url &&
		  provider.url.includes("alidade_smooth_dark")
		) {
		  layers.remove(layer, true); // true = destroy the provider
		  break;
		}
	  }

	  // Destroy the BaseLayerPicker widget if it exists
	  if (typeof baseLayerPicker !== "undefined" && !baseLayerPicker.isDestroyed()) {
		baseLayerPicker.destroy();
	  }

	  // Reset terrain to default (EllipsoidTerrainProvider = no terrain)
	  if (terrainCreated) {
		viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();
		terrainCreated = false;
	  }
}

window.customTileset = null;
async function loadAssetWithToken2(assetId, accessToken) {
	
  //ShowSpinner();
  customTileset = await Cesium.Cesium3DTileset.fromIonAssetId(assetId);
  viewer.scene.primitives.add(customTileset);
  
  SetInitialHeight(customTileset);
  await customTileset.allTilesLoaded.addEventListener(function () {
    HideSpinner();
  });
}

async function loadAssetWithToken_BAK(assetId, accessToken) {
  // await the resource — fromAssetId() is async
  const resource = await Cesium.IonResource.fromAssetId(assetId, {
    accessToken: accessToken,
  });

  const tileset = await Cesium.Cesium3DTileset.fromUrl(resource, {classificationType: Cesium.ClassificationType.CESIUM_3D_TILE});
  tileset._assetId = assetId;
  window.DGSAssetPrimitiveKey = viewer.scene.primitives.length;
  viewer.scene.primitives.add(tileset);

  return tileset;
}

async function loadAssetWithToken(assetId, accessToken) {
    const resource = await Cesium.IonResource.fromAssetId(assetId, { accessToken });
    const tileset = await Cesium.Cesium3DTileset.fromUrl(resource);
    tileset._assetId = assetId;

    viewer.scene.primitives.add(tileset);
    SetInitialHeight(tileset);
    tileset.maximumScreenSpaceError = 4;
	tileset.skipLevelOfDetail = true;

    // No index tracking needed — we hold a direct reference
    return tileset;
}

heightOffset = 1;
function SetInitialHeight(tileset) {
  const Matrix4 = Cesium.Matrix4;
  const Cartographic = Cesium.Cartographic;
  const Transforms = Cesium.Transforms;

  const oldCenterCartesian = tileset.boundingSphere?.center;
  const cartographic = Cartographic.fromCartesian(oldCenterCartesian);
  const oldToGlobal = Transforms.eastNorthUpToFixedFrame(oldCenterCartesian);
  const oldToLocal = Matrix4.inverseTransformation(oldToGlobal, new Matrix4());

  const newCenterCartographic = new Cartographic(
    cartographic.longitude,
    cartographic.latitude,
    cartographic.height + heightOffset,
  );
  const newCenterCartesian = Cartographic.toCartesian(newCenterCartographic);
  const newToGlobal = Transforms.eastNorthUpToFixedFrame(newCenterCartesian);
  const modelMatrix = Matrix4.multiplyTransformation(
    newToGlobal,
    oldToLocal,
    new Matrix4(),
  );
  tileset.modelMatrix = modelMatrix;
}

window.DGSEffectActive = false;
window.DGSAsset = null;//REMOVE THIS VARIABLE
window.DGSAssetPrimitiveKey = null;
let activeDGSTileset = [];
let dgsLoadGeneration = 0; // bumped on every load/clear to invalidate stale async loads

async function create3DGSEffect(idtbldg) {
    if (typeof TempBldgData[idtbldg].dgs_asset === "undefined") return;
	RemoveEntitiesByType(dashedEntityList);

    const myGeneration = ++dgsLoadGeneration; // claim this load
	
    var terrainCreatedOrNot = false;
    if (!window.sateliteMapLoaded) {
        window.sateliteMapLoaded = true;

        // Add the ArcGIS layer ONCE for the whole session; just toggle visibility after.
        if (!window.arcgisLayer) {
			/*
			const terrainProvider = await Cesium.createWorldTerrainAsync({
				requestVertexNormals: false,
				requestWaterMask: false
			});
			viewer.scene.terrainProvider = terrainProvider;
			*/

            window.arcgisLayer = viewer.imageryLayers.addImageryProvider(
                await Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
                    Cesium.ArcGisBaseMapType.SATELLITE
                )
            );
        } else {
            window.arcgisLayer.show = true;
        }
        createTerrain();
		terrainCreatedOrNot = true;
    }
	window.arcgisLayer.show = true;
	if(!terrainCreatedOrNot)
		createTerrain();
	
    setResetTickForEffectsButtons("3DGSButton", true);
    effectsArray[11] = 1;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    buildingIdInEffect = idtbldg;
    $("#legendPanel").hide();
	
    window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '
        + TempBldgData[idtbldg].coords + ' ]), }, ';
    globe.translucency.enabled = false;
    googleTileset.show = false;
    window.DGSEffectActive = true;

	if(typeof activeDGSTileset[idtbldg] == "undefined" || activeDGSTileset[devSelectedBuilding] == null)
	{
		const tileset = await loadAssetWithToken(
			TempBldgData[idtbldg].dgs_asset,
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlODI2NzQzOC1mM2JjLTRiOWMtOTc1MC1hMzQ2OWJhNWYzMjkiLCJpZCI6NDE5NzY3LCJpYXQiOjE3NzY0Njk1NTd9.Eh7KgE2H8rE8XmPX8p6tNfKBoA2GN2NXouzkLMQt7vA"
		);
		
		activeDGSTileset[idtbldg] = tileset;
	}
	else
	{
		activeDGSTileset[idtbldg].maximumScreenSpaceError = 4;
		activeDGSTileset[idtbldg].show = true;
	}
	

    // If a clear/another load happened while we were awaiting, this tileset is stale.
    // Tear it down now so nothing references or renders it.
	/*
    if (myGeneration !== dgsLoadGeneration || !window.DGSEffectActive) {
        if (viewer.scene.primitives.contains(tileset)) {
            viewer.scene.primitives.remove(tileset); // destroys via destroyPrimitives=true
        }
        if (!tileset.isDestroyed()) tileset.destroy();
        return;
    }
	*/

    updateURL();
}

function clear3DGSEffect() {
    setResetTickForEffectsButtons("3DGSButton", false);

    dgsLoadGeneration++;        // invalidate any in-flight create3DGSEffect load
    window.DGSEffectActive = false;
	
	/*
	if(typeof activeDGSTileset[devSelectedBuilding] != "undefined")
	{
		//activeDGSTileset[devSelectedBuilding].maximumScreenSpaceError = 64;
		activeDGSTileset[devSelectedBuilding].show = false;
	}
	*/
	
	//Reverting to old workflow
	
	/* ShowSpinner(); 
	await customTileset.allTilesLoaded.addEventListener(function () {
		HideSpinner();
	}); */
	
	if(typeof activeDGSTileset[devSelectedBuilding] != "undefined"){
		
		viewer.scene.primitives.remove(activeDGSTileset[devSelectedBuilding]); // remove from render loop

		if (!activeDGSTileset[devSelectedBuilding].isDestroyed()) {
			activeDGSTileset[devSelectedBuilding].destroy();                   // free GPU memory
		}
		activeDGSTileset[devSelectedBuilding] = null;
										
	}
	
	// Letting pass few frames
	/*
    const tileset = activeDGSTileset;
    activeDGSTileset = null;     // drop our reference immediately
    if (tileset && !tileset.isDestroyed()) {
        // Stop it contributing to the scene right away, then destroy it lazily
        // once it's no longer loading and a few frames have passed.
        tileset.show = false;
        deferredDestroyTileset(tileset);
    }
	*/
	window.sateliteMapLoaded = false;
    googleTileset.show = true;

    if (window.arcgisLayer) {
        window.arcgisLayer.show = false; // hide, don't re-add next time
    }
	//window.arcgisLayer = false;
	
	//keeping this as it is.
    removeTerrain();
    // NOTE: intentionally NOT resetting sateliteMapLoaded to false here, so the next
    // create3DGSEffect reuses the existing ArcGIS layer instead of stacking a new one.
    // If you truly need to reload it, fully remove the layer instead of just hiding it
    // (see the note below the code).

    viewer.scene.globe.depthTestAgainstTerrain = false;
    globe.translucency.enabled = true;
    effectsArray[11] = 0;
	if(typeof TempBldgData[devSelectedBuilding] != "undefined" && typeof TempBldgData[devSelectedBuilding].coords != "undefined")
		CreateDashedLine(devSelectedBuilding, TempBldgData[devSelectedBuilding].coords, ( cityAltitudeAdjustment[lastCityLoaded] + parseFloat(TempBldgData[devSelectedBuilding].basefloorheight) ), null);
}

/**
 * Waits until the tileset has finished loading (or a frame cap is hit), lets a
 * few extra frames pass so the render loop is no longer touching it, then
 * removes + destroys it. Implements the support team's recommendation safely.
 */
function deferredDestroyTileset(tileset, { settleFrames = 3, maxWaitFrames = 120 } = {}) {
    let idleFrames = 0;
    let elapsedFrames = 0;

    const stop = viewer.scene.postRender.addEventListener(function onPostRender() {
        elapsedFrames++;

        // Already gone (e.g. via another code path) — just detach.
        if (!tileset || tileset.isDestroyed()) {
            stop();
            return;
        }

        const capReached = elapsedFrames >= maxWaitFrames;

        // tilesLoaded is the documented signal that no tiles are pending/processing.
        // (When a tileset is hidden its traversal stops, so this may not flip to true;
        //  the maxWaitFrames cap guarantees we still tear down.)
        const stillLoading = tileset.tilesLoaded !== true;

        if (stillLoading && !capReached) {
            idleFrames = 0;
            return; // keep waiting for loads to settle
        }

        // Require a few consecutive settled frames before freeing.
        idleFrames++;
        if (idleFrames < settleFrames && !capReached) {
            return;
        }

        stop(); // detach BEFORE teardown to avoid re-entrancy

        if (viewer.scene.primitives.contains(tileset)) {
            viewer.scene.primitives.remove(tileset); // frees GPU resources (destroyPrimitives=true)
        }
        if (!tileset.isDestroyed()) {
            tileset.destroy(); // safety net; usually already destroyed by remove()
        }
    });
}

window.isolateWithWhiteActive = false;
window.stadiaWhiteMapLoaded = false;
function createIsolateWithWhiteEffect(idtbldg)
{
	setResetTickForEffectsButtons("isolateButtonWhiteEffect", true);
	/*
	if(window.isolateWithWhiteActive == true)
	{
		effectsArray[10] = 0;//re-setting isolate WHITE
		viewer.scene.globe.depthTestAgainstTerrain = false;
		
		clearIsolateWithWhiteEffect();
		clearClipSelectedBuildingApp15();
		
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
	
		window.isolateWithWhiteActive = false;
		return;
	}
	*/
	//Clear isolate on Satellite if active
	//clearIfExistingEffectsAreOn();
	
	if(window.stadiaWhiteMapLoaded == false)
	{
		//Stdia map
		const imageryViewModels = [];
		imageryViewModels.push(new Cesium.ProviderViewModel({
			name: "Stadia Alidade Smooth Dark",
			iconUrl: Cesium.buildModuleUrl(
			  "Widgets/Images/ImageryProviders/stadiaAlidadeSmooth.png"
			),
			tooltip: "Stadia Alidade Smooth Dark, like its lighter cousin, is also designed to stay out of the way. It just flips the dark mode switch on the color scheme. With the lights out, your data can now literally shine.\nhttps://docs.stadiamaps.com/map-styles/alidade-smooth/",
			category: "Other",
			creationFunction: function() {
			  return new Cesium.UrlTemplateImageryProvider({
				url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png",
				minimumLevel: 0,
				maximumLevel: 20   // important to allow fine detail
			  });
			}
		  }));

		//Finally, create the baseLayerPicker widget using our view models.
		const layers = viewer.imageryLayers;
		const baseLayerPicker = new Cesium.BaseLayerPicker("baseLayerPickerContainer", {
			globe: viewer.scene.globe,
			imageryProviderViewModels: imageryViewModels
		});
		createTerrain();
		
		window.stadiaWhiteMapLoaded = true;
	}
	//if(typeof window.isolateWithWhiteActive == "undefined" || !window.isolateWithWhiteActive)
	if(true)
	{
		//viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
		effectsArray[0] = 1;//setting isolate effect
		
		viewer.scene.globe.depthTestAgainstTerrain = true;
		buildingIdInEffect = idtbldg;
		//createStadiaTerrain();
		$("#legendPanel").hide();
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		if(window.lastBuildingClipped == null)
			ToggleClipSelectedBuildingApp15(idtbldg, true);
		/*
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
		  polygons: [
			new Cesium.ClippingPolygon({
			  positions: new Cesium.Cartesian3.fromDegreesArray(
				eval("["+TempBldgData[idtbldg].coords+"]")
			  ),
			}),
		  ],
		});
		googleTileset.clippingPolygons.enabled = true;
		googleTileset.clippingPolygons.inverse = true;
		globe.translucency.enabled = false;
		
		*/
		$("#isolateButton").removeClass("btn-secondary");
		$("#isolateButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
		window.isolateWithWhiteActive = true;
	}
	else //Will never enter this loop
	{
		effectsArray[10] = 0;//re-setting isolate WHITE
		viewer.scene.globe.depthTestAgainstTerrain = false;
		/*
		if(effectsArray[10] == 1)
		{
			googleTileset.show = true;
			googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
			  polygons: [
				new Cesium.ClippingPolygon({
				  positions: new Cesium.Cartesian3.fromDegreesArray(
					eval("["+TempBldgData[parseInt(devSelectedBuilding)].coords+"]")
				  ),
				}),
			  ],
			});
			googleTileset.clippingPolygons.enabled = true;
			
		}
		else
		{
			ToggleClipSelectedBuildingApp15(idtbldg);
		}
		*/
		
		clearIsolateWithWhiteEffect();
		clearClipSelectedBuildingApp15();
		$("#transparencyDiv").hide();
		$("#opacity").val(1);
		$("#opacityText").val(1);
		TransparencyDivDisplay = false;
		//if(!buildingAssetEffectActive && !highlightEffectActive && !spotlightEffectActive && !newHighlightEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
		window.isolateWithWhiteActive = false;
	}
	updateURL();
}

function clearIsolateWithWhiteEffect()
{
	setResetTickForEffectsButtons("isolateButtonWhiteEffect", false);
	window.isolateWithWhiteActive = false;
	effectsArray[10] = 0;
	
	if (window.stadiaWhiteMapLoaded)
	{
		  const layers = viewer.imageryLayers;

		  for (let i = layers.length - 1; i >= 0; i--) {
			const layer = layers.get(i);
			const provider = layer.imageryProvider;

			if (
			  provider instanceof Cesium.UrlTemplateImageryProvider &&
			  provider.url?.includes("alidade_smooth")
			) {
			  layers.remove(layer, true); // true = destroy provider + free GPU memory
			  break;
			}
		  }

		  // Destroy the BaseLayerPicker widget if still alive
		  if (typeof baseLayerPicker !== "undefined" && !baseLayerPicker.isDestroyed()) {
			baseLayerPicker.destroy();
		  }

	}
	window.stadiaWhiteMapLoaded = false;
		
	viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();
	terrainCreated = false;
	  if (window.lastBuildingClipped != null) {
		clearClipSelectedBuildingApp15();   // provided external function
		window.lastBuildingClipped = null;
	  }
	  
	  viewer.scene.globe.depthTestAgainstTerrain = false;

	  effectsArray[0] = 0;                  // clear isolate effect slot
	  buildingIdInEffect = null;
	  window.lastHolesString = null;
	  window.isolateWithWhiteActive = false;

	  $("#legendPanel").show();
	  
	$("#transparencyDiv").hide();
	$("#opacity").val(1);
	$("#opacityText").val(1);
	TransparencyDivDisplay = false;
	
	$("#isolateButton").addClass("btn-secondary");
	$("#isolateButton").removeClass("btn-primary");
}


window.isolateWithLabelsEffectActive = false;
window.googleLabelLayerLoaded = false;
function createIsolateWithLabelsEffect(idtbldg)
{
	setResetTickForEffectsButtons("isolateButtonWithLabel", true);
	/*
	if(window.isolateWithLabelsEffectActive == true)
	{
		effectsArray[9] = 0;
		clearIsolateWithLabelsEffect();
		clearClipSelectedBuildingApp15();
		window.isolateWithLabelsEffectActive = false;
		
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		return;
	}
	*/
	//Clear isolate on Satellite if active
	//clearIfExistingEffectsAreOn();
	
	if(googleLabelLayerLoaded == false)
	{
		googleLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
                url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                maximumLevel: 20,
                credit: '© Google'
            })
        );
		createTerrain();
		window.googleLabelLayerLoaded = true;
	}
	//if(typeof window.isolateWithLabelsEffectActive == "undefined" || !window.isolateWithLabelsEffectActive)
	if(true)
	{
		//viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
		effectsArray[9] = 1;//setting isolate effect
		googleLayer.show = true;
		viewer.scene.globe.depthTestAgainstTerrain = true;
		buildingIdInEffect = idtbldg;
		//createStadiaTerrain();
		$("#legendPanel").hide();
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		if(window.lastBuildingClipped == null)
			ToggleClipSelectedBuildingApp15(idtbldg, true);
		/*
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
		  polygons: [
			new Cesium.ClippingPolygon({
			  positions: new Cesium.Cartesian3.fromDegreesArray(
				eval("["+TempBldgData[idtbldg].coords+"]")
			  ),
			}),
		  ],
		});
		googleTileset.clippingPolygons.enabled = true;
		googleTileset.clippingPolygons.inverse = true;
		globe.translucency.enabled = false;
		
		*/
		$("#isolateButton").removeClass("btn-secondary");
		$("#isolateButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
		window.isolateWithLabelsEffectActive = true;
	}
	/*
	else
	{
		effectsArray[9] = 0;
		clearIsolateWithLabelsEffect();
		window.isolateWithLabelsEffectActive = false;
		//if(!buildingAssetEffectActive && !highlightEffectActive && !spotlightEffectActive && !newHighlightEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
	}
	*/
	updateURL();
}

function clearIsolateWithLabelsEffect()
{
	setResetTickForEffectsButtons("isolateButtonWithLabel", false);
	window.isolateWithLabelsEffectActive = false;
	//window.googleLayer = false;
	if(typeof googleLayer != "undefined" && typeof googleLayer.show != "undefined")
		googleLayer.show = false;
	//googleLabelLayerLoaded = 
	effectsArray[9] = 0;
	viewer.scene.globe.depthTestAgainstTerrain = false;
	clearClipSelectedBuildingApp15();
	removeTerrain();
	//window.stadiaMapLoaded = false;
	viewer.scene.globe.depthTestAgainstTerrain = false;
	globe.translucency.enabled = false;
	$("#transparencyDiv").hide();
	$("#opacity").val(1);
	$("#opacityText").val(1);
	TransparencyDivDisplay = false;
	
	$("#isolateButton").addClass("btn-secondary");
	$("#isolateButton").removeClass("btn-primary");
}

window.isolateSatelliteEffectActive = false;
window.sateliteMapLoaded = false;
window.arcgisLayer = null;
//Bing Map Key
//AonzLM7R2VRK3j0N-gTffmMsIPG5i0wolqRoVl7BZRTDNDa9-ZEmGVlQRkldikge
async function createIsolateSatelliteEffect(idtbldg)
{
	setResetTickForEffectsButtons("isolateSatelliteButton2", true);
	/*
	if(window.isolateSatelliteEffectActive == true)
	{
		effectsArray[6] = 0;//re-setting isolate satelite effect
		
		clearIsolateSatelliteEffect(idtbldg);
		clearClipSelectedBuildingApp15();
		
		$("#transparencyDiv").hide();
		$("#opacity").val(1);
		$("#opacityText").val(1);
		TransparencyDivDisplay = false;
		
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		window.isolateSatelliteEffectActive = false;
		return;
	}
	*/
	//clearIfExistingEffectsAreOn();
	if(typeof window.sateliteMapLoaded == "undefined" || !window.sateliteMapLoaded)
	{
		window.sateliteMapLoaded = true;
		window.arcgisLayer = viewer.imageryLayers.addImageryProvider(
		  await Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
			Cesium.ArcGisBaseMapType.SATELLITE
		  )
		);
		createTerrain();
		if(window.arcgisLayer == null)
		{
			/*
			Cesium.ArcGisBaseMapType.SATELLITE
			Cesium.ArcGisBaseMapType.HYBRID
			Cesium.ArcGisBaseMapType.STREETS
			Cesium.ArcGisBaseMapType.TOPOGRAPHIC
			Cesium.ArcGisBaseMapType.LIGHT_GRAY
			Cesium.ArcGisBaseMapType.DARK_GRAY
			Cesium.ArcGisBaseMapType.NOVA
			
			window.arcgisLayerDark = viewer.imageryLayers.addImageryProvider(
			  await Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
				Cesium.ArcGisBaseMapType.SATELLITE
			  )
			);
			*/
		}
	}
	//if(typeof window.isolateSatelliteEffectActive == "undefined" || !isolateSatelliteEffectActive)
	if(true)
	{
		//Clear isolate on Dark if active
		//viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
		effectsArray[6] = 1;
		viewer.scene.globe.depthTestAgainstTerrain = true;
		buildingIdInEffect = idtbldg;
		
		$("#legendPanel").hide();
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		if(window.lastBuildingClipped == null)
			ToggleClipSelectedBuildingApp15(idtbldg, true);
		
		/*
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
		  polygons: [
			new Cesium.ClippingPolygon({
			  positions: new Cesium.Cartesian3.fromDegreesArray(
				eval("["+TempBldgData[idtbldg].coords+"]")
			  ),
			}),
		  ],
		});
		googleTileset.clippingPolygons.enabled = true;
		googleTileset.clippingPolygons.inverse = true;
		globe.translucency.enabled = false;
		*/
		
		$("#isolateButton").removeClass("btn-secondary");
		$("#isolateButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
		window.isolateSatelliteEffectActive = true;
	}
	/*
	else
	{
		effectsArray[6] = 0;//re-setting isolate satelite effect
		
		clearIsolateSatelliteEffect(idtbldg);
		clearClipSelectedBuildingApp15();
		
		$("#transparencyDiv").hide();
		$("#opacity").val(1);
		$("#opacityText").val(1);
		TransparencyDivDisplay = false;
		//if(!buildingAssetEffectActive && !highlightEffectActive && !spotlightEffectActive && !newHighlightEffectActive && !isolateEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
		window.isolateSatelliteEffectActive = false;
	}
	*/
	updateURL();
}

function clearIsolateSatelliteEffect(idtbldg = "")
{
	setResetTickForEffectsButtons("isolateSatelliteButton2", false);
	window.isolateSatelliteEffectActive = false;
	window.arcgisLayer.show = false;
	globe.translucency.enabled = false;
	
	effectsArray[6] = 0;//re-setting isolate satelite effect
	removeTerrain();
	window.sateliteMapLoaded = false;
	viewer.scene.globe.depthTestAgainstTerrain = false;
	if(effectsArray[5] == 1)
	{
		googleTileset.show = true;
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
		  polygons: [
			new Cesium.ClippingPolygon({
			  positions: new Cesium.Cartesian3.fromDegreesArray(
				eval("["+TempBldgData[parseInt(devSelectedBuilding)].coords+"]")
			  ),
			}),
		  ],
		});
		googleTileset.clippingPolygons.enabled = true;
		
	}
	else
	{
		clearClipSelectedBuildingApp15();
		/*
		if(clipTileset != null && typeof clipTileset.clippingPolygons != "undefined")
		{
			clipTileset.clippingPolygons.enabled = false;
			clipTileset.clippingPolygons.inverse = false;
			clipTileset.show = false;
		}
		
		if(typeof googleTileset.clippingPolygons != "undefined" & googleTileset.clippingPolygons != null)
		{
			googleTileset.clippingPolygons.enabled = false;
		}
		*/
	}
	$("#transparencyDiv").hide();
	$("#opacity").val(1);
	$("#opacityText").val(1);
	TransparencyDivDisplay = false;
	
	$("#isolateButton").addClass("btn-secondary");
	$("#isolateButton").removeClass("btn-primary");
}

window.buildingEffectArray = [];
window.buildingEffectArray["Isolate"] = [];
window.buildingEffectArray["IsolateWithLabels"] = [];
window.buildingEffectArray["IsolateOnWhite"] = [];
window.buildingEffectArray["IsolateOnDark"] = [];
window.buildingEffectArray["Spotlight"] = [];
window.buildingEffectArray["Highlight"] = [];
window.buildingEffectArray["Floors"] = [];
window.buildingEffectArray["Files"] = [];
window.buildingEffectArray["Floorplans"] = [];

window.buildingEffectArray["Isolate"].push({
		"name": "Isolate", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "isolateSatelliteButton2", 
		"key": 0, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["IsolateWithLabels"].push({
		"name": "Isolate With Labels", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "isolateButtonWithLabel", 
		"key": 9, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["IsolateOnWhite"].push({
		"name": "Isolate On White", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "isolateButtonWhiteEffect", 
		"key": 10, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["IsolateOnDark"].push({
		"name": "Isolate On Dark", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "isolateWithDarkButton", 
		"key": 0, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["Spotlight"].push({
		"name": "Spotlight", 
		"isClip": false, 
		"isInverseClip": false, 
		"button": "spotlightButton2", 
		"key": 1, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["Highlight"].push({
		"name": "Highlight", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "newHighlightButton2", 
		"key": 2, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["Floors"].push({
		"name": "Floors", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "highlightButton", 
		"key": 4, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["Files"].push({
		"name": "Highlight", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "assetButton", 
		"key": 5, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray["Floorplans"].push({
		"name": "Highlight", 
		"isClip": true, 
		"isInverseClip": false, 
		"button": "floorplanButton", 
		"key": 7, 
		"isActive": null, 
		"lastBuilding": null
});
window.buildingEffectArray.push({
		"name": "Clear", 
		"isClip": false, 
		"isInverseClip": true, 
		"button": "clipEffectButton2", 
		"key": 0, 
		"isActive": null, 
		"lastBuilding": null
});

const GROUP1 = ["Isolate", "IsolateWithLabels", "IsolateOnWhite", "IsolateOnDark", "Spotlight", "3DGS", "Highlight", "Clear"];
const GROUP2 = ["Floors", "Files", "Floorplans"];

window.effectState = { g1: null, g2: null };


function createEffect(name)  {
	/* your existing create logic */ 
	console.log("Create: "+name); 
	switch(name)
	{
		case "Isolate":
			createIsolateSatelliteEffect(devSelectedBuilding);
		break;
		case "IsolateWithLabels":
			createIsolateWithLabelsEffect(devSelectedBuilding);
		break;
		case "IsolateOnWhite":
			createIsolateWithWhiteEffect(devSelectedBuilding);
		break;
		case "IsolateOnDark":
			createIsolateOnDarkEffect(devSelectedBuilding);
		break;
		case "Spotlight":
			createSpotlightEffect(devSelectedBuilding);
		break;
		case "3DGS":
			create3DGSEffect(devSelectedBuilding);
		break;
		case "Highlight":
			createApp6HighlightEffect(devSelectedBuilding);
		break;
		case "Clear":
			createClipEffect(devSelectedBuilding);
		break;
		case "Floors":
			createFloorsEffect(devSelectedBuilding);
		break;
		case "Files":
			createBuildingAssets(devSelectedBuilding);
		break;
		case "Floorplans":
			getDataForFloorPlan(devSelectedBuilding);
		break;
		case "Amenities":
			//createAmenitiesEffect(devSelectedBuilding);
		break;
	}
}

function clearEffect(name)   {
	/* your existing clear logic  */ 
	console.log("Clear: "+name); 
	//Calling Same function to clear it.
	switch(name)
	{
		case "Isolate":
			clearIsolateSatelliteEffect();
		break;
		case "IsolateWithLabels":
			clearIsolateWithLabelsEffect();
		break;
		case "IsolateOnWhite":
			clearIsolateWithWhiteEffect();
		break;
		case "IsolateOnDark":
			clearIsolateOnDarkEffect();
		break;
		case "Spotlight":
			clearSpotlightEffect();
		break;
		case "3DGS":
			clear3DGSEffect();
		break;
		case "Highlight":
			clearApp6HighlightEffect();
		break;
		case "Clear":
			clearClipEffect();
		break;
		case "Floors":
			clearHighlightEffect();
		break;
		case "Files":
			clearBuildingAssets();
		break;
		case "Floorplans":
			clearFloorplanEffect();
		break;
		case "Amenities":
			//clearAmenitiesEffect();
		break;
	}
}

function handleEffectClick(name) {
	if(camera180InProgress)
	{
		stop180CameraRotation();
	}
	closeBuildingAIAgentPanel();
	window.changingVisualization = true;
  const group = GROUP1.includes(name) ? 1 : GROUP2.includes(name) ? 2 : null;
  if (!group) return;

  if (group === 1) {
    if (effectState.g1 === name) {          // toggle off
      clearEffect(name);
      effectState.g1 = null;
    } else {
      if (effectState.g1) clearEffect(effectState.g1);   // clear previous g1
      effectState.g1 = name;
      createEffect(name);
    }
  }

  if (group === 2) {
    if (effectState.g2 === name) {          // toggle off
      clearEffect(name);
      effectState.g2 = null;
      if (effectState.g1) {                 // restore g1 if it was active
        //log(`RESTORE ${effectState.g1} ← peer cleared`, "restore");
        createEffect(effectState.g1);
      }
    } else {
      if (effectState.g2) clearEffect(effectState.g2);   // clear previous g2
      effectState.g2 = name;
      createEffect(name);
    }
  }
  
  if (effectState.g1 === null && effectState.g2 === null) {
	  console.log("G1 "+effectState.g1);
	  console.log("G2 "+effectState.g1);
    //log("No effects active → calling restore()", "restore");
	//$("#marketDropdown").val("Office");
	//lastSelectedBuildingType = "Office";
	if(window.primitivesCleared == true || window.primitivesCleared == null)
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
	else
	{
		//Just update holes String
		window.lastHolesString = window.backupHolesString;
		//generateFogHighlightString($("#marketDropdown").val());
		console.log("#!!!!!!!! Not Highlighting AGAIN!!!!!!!!!!!!");
	}
  }
}

function clearAllEffects() {
  if (effectState.g1) { clearEffect(effectState.g1); effectState.g1 = null; }
  if (effectState.g2) { clearEffect(effectState.g2); effectState.g2 = null; }
  //log("CLEAR ALL", "clear");
}

function createBuildingEffectV2(effectName, idtbldg, onlyClear = false)
{
	if(onlyClear)
	{
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		return;
	}
	if(window.lastBuildingClipped != idtbldg)
	{
		clearClipSelectedBuildingApp15();
	}
	
	if(window.buildingEffectArray[effectName].isClip == true)
	{
		//Clip building
		ToggleClipSelectedBuildingApp15(idtbldg);
	}
	
	if(window.buildingEffectArray[effectName].isInverseClip == true)
	{
		//Inverse Clip building
		ToggleInverseClipSelectedBuildingApp15(idtbldg);
	}
	
	if(window.buildingEffectArray[effectName].isInverseClip == false && window.buildingEffectArray[effectName].isClip == false)
	{
		globe.baseColor = Cesium.Color.TRANSPARENT;
		if (googleTileset.clippingPolygons != undefined) {
		  googleTileset.clippingPolygons.removeAll();
		  googleTileset.clippingPolygons = undefined;
		}
	}
	
	//Clear previous Imagery layer
	removeTerrain();
	
	//Imagery layer changes
	/*
		window.buildingEffectArray["Isolate"] = [];
		window.buildingEffectArray["IsolateWithLabels"] = [];
		window.buildingEffectArray["IsolateOnWhite"] = [];
		window.buildingEffectArray["IsolateOnDark"] = [];
		window.buildingEffectArray["Spotlight"] = [];
		window.buildingEffectArray["Highlight"] = [];
	*/
	switch(effectName)
	{
		case "Isolate":
			//Stdia map
			imageryViewModels = [];
			imageryViewModels.push(new Cesium.ProviderViewModel({
				name: "Stadia Alidade Smooth Dark",
				iconUrl: Cesium.buildModuleUrl(
				  "Widgets/Images/ImageryProviders/stadiaAlidadeSmoothDark.png"
				),
				tooltip: "Stadia Alidade Smooth Dark, like its lighter cousin, is also designed to stay out of the way. It just flips the dark mode switch on the color scheme. With the lights out, your data can now literally shine.\nhttps://docs.stadiamaps.com/map-styles/alidade-smooth-dark/",
				category: "Other",
				creationFunction: function() {
				  return new Cesium.UrlTemplateImageryProvider({
					url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
					minimumLevel: 0,
					maximumLevel: 20   // important to allow fine detail
				  });
				}
			  }));

			//Finally, create the baseLayerPicker widget using our view models.
			layers = viewer.imageryLayers;
			baseLayerPicker = new Cesium.BaseLayerPicker("baseLayerPickerContainer", {
				globe: viewer.scene.globe,
				imageryProviderViewModels: imageryViewModels
			});
			createTerrain();
			
			window.stadiaMapLoaded = true;
		break;
		
		case "IsolateWithLabels":
			googleLayer = viewer.imageryLayers.addImageryProvider(
				new Cesium.UrlTemplateImageryProvider({
					url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
					maximumLevel: 20,
					credit: '© Google'
				})
			);
			createTerrain();
		break;
		
		case "IsolateOnWhite":
			imageryViewModels = [];
			imageryViewModels.push(new Cesium.ProviderViewModel({
				name: "Stadia Alidade Smooth Dark",
				iconUrl: Cesium.buildModuleUrl(
				  "Widgets/Images/ImageryProviders/stadiaAlidadeSmooth.png"
				),
				tooltip: "Stadia Alidade Smooth Dark, like its lighter cousin, is also designed to stay out of the way. It just flips the dark mode switch on the color scheme. With the lights out, your data can now literally shine.\nhttps://docs.stadiamaps.com/map-styles/alidade-smooth/",
				category: "Other",
				creationFunction: function() {
				  return new Cesium.UrlTemplateImageryProvider({
					url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png",
					minimumLevel: 0,
					maximumLevel: 20   // important to allow fine detail
				  });
				}
			  }));

			//Finally, create the baseLayerPicker widget using our view models.
			layers = viewer.imageryLayers;
			baseLayerPicker = new Cesium.BaseLayerPicker("baseLayerPickerContainer", {
				globe: viewer.scene.globe,
				imageryProviderViewModels: imageryViewModels
			});
			createTerrain();
			
			window.stadiaWhiteMapLoaded = true;
		break;
		case "IsolateOnDark":
			//Stdia map Dark
			imageryViewModels = [];
			imageryViewModels.push(new Cesium.ProviderViewModel({
				name: "Stadia Alidade Smooth Dark",
				iconUrl: Cesium.buildModuleUrl(
				  "Widgets/Images/ImageryProviders/stadiaAlidadeSmoothDark.png"
				),
				tooltip: "Stadia Alidade Smooth Dark, like its lighter cousin, is also designed to stay out of the way. It just flips the dark mode switch on the color scheme. With the lights out, your data can now literally shine.\nhttps://docs.stadiamaps.com/map-styles/alidade-smooth-dark/",
				category: "Other",
				creationFunction: function() {
				  return new Cesium.UrlTemplateImageryProvider({
					url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
					minimumLevel: 0,
					maximumLevel: 20   // important to allow fine detail
				  });
				}
			  }));

			//Finally, create the baseLayerPicker widget using our view models.
			layers = viewer.imageryLayers;
			baseLayerPicker = new Cesium.BaseLayerPicker("baseLayerPickerContainer", {
				globe: viewer.scene.globe,
				imageryProviderViewModels: imageryViewModels
			});
			createTerrain();
			
			window.stadiaMapLoaded = true;
		break;
	}
	//Button tick changes
	setResetTickForEffectsButtons(window.buildingEffectArray[effectName]["button"], true);
	
	//
	updateURL();
}

function clearIfExistingEffectsAreOn()
{
	if(window.lastBuildingClipped != devSelectedBuilding)
	{
		globe.baseColor = Cesium.Color.TRANSPARENT;
		if (googleTileset.clippingPolygons != undefined) {
		  googleTileset.clippingPolygons.removeAll();
		  googleTileset.clippingPolygons = undefined;
		}
		window.lastBuildingClipped = null;
	}
	//Isolate on Dark
	if(window.isolateOnDarkEffectActive == true)
	{
		clearIsolateOnDarkEffect();
		setResetTickForEffectsButtons("isolateWithDarkButton", false);
		window.isolateOnDarkEffectActive = null;//IMPORTANT TO SET TO NULL
	}
	
	//Isolate with 
	if(window.isolateSatelliteEffectActive == true)
	{
		clearIsolateSatelliteEffect();
		setResetTickForEffectsButtons("isolateSatelliteButton2", false);
		window.isolateSatelliteEffectActive = null;
	}
	
	//Dark Overlay
	if(window.darkOverlayEffectActive)
	{
		clearDarkOverlayEffect();
		window.darkOverlayEffectActive = null;
	}
	
	//White Overlay
	if(window.whiteOverlayEffectActive)
	{
		clearWhiteOverlayEffect();
		window.whiteOverlayEffectActive = null;
	}
	
	//Isolate with White
	if(window.isolateWithWhiteActive)
	{
		clearIsolateWithWhiteEffect();
		setResetTickForEffectsButtons("isolateButtonWhiteEffect", false);
		window.isolateWithWhiteActive = null;
	}
	
	//Isolate with label
	if(window.isolateWithLabelsEffectActive)
	{
		clearIsolateWithLabelsEffect();
		setResetTickForEffectsButtons("isolateButtonWithLabel", false);
		window.isolateWithLabelsEffectActive = null;
	}
	
	if(window.newHighlightEffectActive)
	{
		clearApp6HighlightEffect();
		setResetTickForEffectsButtons("newHighlightButton2", false);
		window.newHighlightEffectActive = null;
	}
	
	if(window.spotlightEffectActive)
	{
		clearSpotlightEffect();
		setResetTickForEffectsButtons("spotlightButton2", false);
		window.spotlightEffectActive = null;
	}
	initiateEffectsArray();
}

var spotlightEffectActive = false;
var buildingIdInEffect = null;
function createSpotlightEffect(idtbldg)
{
	/*
	if(window.spotlightEffectActive == true)
	{
		clearSpotlightEffect();
		
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		window.spotlightEffectActive = false;
		return;
	}
	*/
	//clearIfExistingEffectsAreOn();
	//if(typeof window.spotlightEffectActive == "undefined" || !window.spotlightEffectActive)
	setResetTickForEffectsButtons("spotlightButton2", true);
	if(true)
	{
		if(window.lastBuildingClipped != null)
		{
			clearClipSelectedBuildingApp15();
		}
		effectsArray[1] = 1;//setting spotlight effect
		$("#viewerController").css("width", "215px");
		$("#Transparency").show();
		
		buildingIdInEffect = idtbldg;
		
		$("#legendPanel").hide();
		//ShowInfobox(idtbldg);
		window.lastHolesString = '';
		if(typeof TempBldgData[idtbldg] != "undefined")
			window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		$("#spotlightButton").removeClass("btn-secondary");
		$("#spotlightButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
		window.spotlightEffectActive = true;
		createTerrain();
	}
	/*
	else
	{
		effectsArray[1] = 0;//spotlight effect
		
		//$("#transparencyDiv").hide();
		clearSpotlightEffect();
		
		//if(!buildingAssetEffectActive && !highlightEffectActive && !isolateEffectActive && !newHighlightEffectActive && !isolateSatelliteEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
		window.spotlightEffectActive = false;
	}
	*/
	updateURL();
}

function clearSpotlightEffect()
{
	setResetTickForEffectsButtons("spotlightButton2", false);
	window.spotlightEffectActive = false;
	effectsArray[1] = 0;//spotlight effect
	setWidthOfBottomBox();
	$("#Transparency").hide();
	if(effectsArray[5] == 1)
	{
		googleTileset.show = true;
		googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
		  polygons: [
			new Cesium.ClippingPolygon({
			  positions: new Cesium.Cartesian3.fromDegreesArray(
				eval("["+TempBldgData[parseInt(devSelectedBuilding)].coords+"]")
			  ),
			}),
		  ],
		});
		googleTileset.clippingPolygons.enabled = true;
		
	}
	else
	{
		if(clipTileset != null && typeof clipTileset.clippingPolygons != "undefined")
		{
			clipTileset.clippingPolygons.enabled = false;
			clipTileset.clippingPolygons.inverse = false;
			clipTileset.show = false;
		}
		
		if(typeof googleTileset.clippingPolygons != "undefined" & googleTileset.clippingPolygons != null)
		{
			googleTileset.clippingPolygons.enabled = false;
		}
	}
	$("#transparencyDiv").hide();
	UpdateTransparency(1);
	$("#opacity").val(1);
	$("#opacityText").val(1);
	TransparencyDivDisplay = false;
	
	$("#spotlightButton").addClass("btn-secondary");
	$("#spotlightButton").removeClass("btn-primary");
}

var newHighlightEffectActive = false;
function createApp6HighlightEffect(idtbldg)
{
	/*
	if(newHighlightEffectActive == true)
	{
		effectsArray[2] = 0;//highlight effect
		clearApp6HighlightEffect();
		
		$("#legendPanel").show();
		highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		newHighlightEffectActive = false;
		return;
	}
	*/
	//clearIfExistingEffectsAreOn();
	//if(typeof newHighlightEffectActive == "undefined" || !newHighlightEffectActive)
	setResetTickForEffectsButtons("newHighlightButton2", true);
	if(true)
	{
		effectsArray[2] = 1;//highlight effect
		buildingIdInEffect = idtbldg;
		if(window.lastBuildingClipped != null)
		{
			clearClipSelectedBuildingApp15();
		}
		
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");

		//highlight with class color
		var clr = classColorCoding[TempBldgData[idtbldg].buildingclass];
		
		var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : new Cesium.PolygonGeometry({
				  polygonHierarchy : new Cesium.PolygonHierarchy(
					Cesium.Cartesian3.fromDegreesArray(eval("["+TempBldgData[idtbldg].coords+"]"))
				  ),
				  height : -100,
				  extrudedHeight : 3000
				}),
				attributes : {
					//color : defaultPrimitiveHighlightColor,
					color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
					show : new Cesium.ShowGeometryInstanceAttribute(true)
				},
				id : "bldg-"+TempBldgData[idtbldg].idtbuilding+"-0",
			}),
			classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
		}));
		
		primitiveCollection.push(ent);
		
		$("#newHighlightButton").removeClass("btn-secondary");
		$("#newHighlightButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
		newHighlightEffectActive = true;
	}
	/*
	else
	{
		effectsArray[2] = 0;//highlight effect
		clearApp6HighlightEffect();
		
		//if(!buildingAssetEffectActive && !highlightEffectActive && !isolateEffectActive && !spotlightEffectActive && !isolateSatelliteEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
		newHighlightEffectActive = false;
	}
	*/
	updateURL();
}

function clearApp6HighlightEffect()
{
	setResetTickForEffectsButtons("newHighlightButton2", false);
	window.newHighlightEffectActive = false;
	effectsArray[2] = 0;//highlight effect
	clearPrimitives();
	$("#newHighlightButton").addClass("btn-secondary");
	$("#newHighlightButton").removeClass("btn-primary");
}

var clipEffectActive = false;
function createClipEffect(idtbldg)
{
	setResetTickForEffectsButtons("clipEffectButton2", true);
	effectsArray[8] = 1;//Clip Effect
	buildingIdInEffect = idtbldg;
	
	ToggleInverseClipSelectedBuildingApp15(idtbldg);
	//$("#newHighlightButton").removeClass("btn-secondary");
	//$("#newHighlightButton").addClass("btn-primary");
	updateURL();
	clipEffectActive = true;
	
	return;
	
	if(!clipEffectActive)
	{
	}
	else
	{
		effectsArray[8] = 0;//Clip Effect
		clearClipEffect();
		
		//if(!buildingAssetEffectActive && !highlightEffectActive && !isolateEffectActive && !spotlightEffectActive && !isolateSatelliteEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
	}
	clipEffectActive = !clipEffectActive;
}

function clearClipEffect()
{
	setResetTickForEffectsButtons("clipEffectButton2", false);
	effectsArray[8] = 0;//Clip Effect
	$("#legendPanel").show();
	//clearPrimitives();
	clearClipSelectedBuildingApp15();
	$("#newHighlightButton").addClass("btn-secondary");
	$("#newHighlightButton").removeClass("btn-primary");
}

function re_createFogEffect()
{
	if(whiteOverlayEffectActive || darkOverlayEffectActive)
	{
		var cesOverlay = "CESIUM_3D_TILE";
		if(effectsArray[6] == 1 || effectsArray[0] == 1 )
			cesOverlay = "BOTH";
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType."+cesOverlay+", }, }) ");
		//viewer.entities.removeById("FogEffectEntityPreload");
	}
}

var darkOverlayEffectActive = false;
var whiteOverlayEffectActive = true;
window.darkOverlayEffectColor = 'WHITE';
function createDarkOverlayEffect(foceClear = false)
{
	if(foceClear)
	{
		clearDarkOverlayEffect();
	}
	else
	{
		//clearIfExistingEffectsAreOn();
		if(!darkOverlayEffectActive)
		{
			setResetSettingFlags("dark-overlay-li", true);
			viewer.entities.removeById("FogEffectEntity");debugger;
			viewer.entities.removeById("NewFogEffectEntity");
			//viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof window.lastHolesString == "undefined")
			{
				window.lastHolesString = "";
			}
			
			var cesOverlay = "CESIUM_3D_TILE";
			if(effectsArray[6] == 1 || effectsArray[0] == 1 )
				cesOverlay = "BOTH";
			if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.BLACK.withAlpha(0.5), classificationType: Cesium.ClassificationType."+cesOverlay+", }, }) ");
			window.darkOverlayEffectColor = 'BLACK';
			re_createFogEffect();
			$("#darkOverlayButton").removeClass("btn-secondary");
			$("#darkOverlayButton").addClass("btn-primary");
			//$("#transparencyDiv").show();
		}
		else
		{
			clearDarkOverlayEffect();
		}
	}
	darkOverlayEffectActive = !darkOverlayEffectActive;
	updateURL();
}

function createWhiteOverlayEffect(foceClear = false)
{
	if(foceClear)
	{
		clearDarkOverlayEffect();
	}
	else
	{
		//clearIfExistingEffectsAreOn();
		if(!whiteOverlayEffectActive)
		{
			setResetSettingFlags("white-overlay-li", true);
			viewer.entities.removeById("FogEffectEntity");debugger;
			viewer.entities.removeById("NewFogEffectEntity");
			//viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof window.lastHolesString == "undefined")
			{
				window.lastHolesString = "";
			}
			var cesOverlay = "CESIUM_3D_TILE";
			if(effectsArray[6] == 1 || effectsArray[0] == 1 )
				cesOverlay = "BOTH";
			if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType."+cesOverlay+", }, }) ");
			window.darkOverlayEffectColor = 'WHITE';
			re_createFogEffect();
			//$("#darkOverlayButton").removeClass("btn-secondary");
			//$("#darkOverlayButton").addClass("btn-primary");
			//$("#transparencyDiv").show();
		}
		else
		{
			clearWhiteOverlayEffect();
		}
	}
	whiteOverlayEffectActive = !whiteOverlayEffectActive;
	updateURL();
}

function clearDarkOverlayEffect()
{
	darkOverlayEffectActive = false;
	setResetSettingFlags("dark-overlay-li", false);
	viewer.entities.removeById("FogEffectEntity");debugger;
	viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	//window.darkOverlayEffectColor = 'WHITE';

	//$("#darkoverlayButton").addClass("btn-secondary");
	//$("#darkoverlayButton").removeClass("btn-primary");
}

function clearWhiteOverlayEffect()
{
	whiteOverlayEffectActive = false;
	setResetSettingFlags("white-overlay-li", false);
	viewer.entities.removeById("FogEffectEntity");debugger;
	viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	
	//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	//window.darkOverlayEffectColor = 'WHITE';

	//$("#darkoverlayButton").addClass("btn-secondary");
	//$("#darkoverlayButton").removeClass("btn-primary");
}

function clearEntireOverlayEffect()
{
	darkOverlayEffectActive = false;
	whiteOverlayEffectActive = false;

	viewer.entities.removeById("FogEffectEntity");debugger;
	viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");

	window.darkOverlayEffectColor = '';
}

//The White and Dark overlays are a mutually-exclusive pair: exactly one is always
//visible, never both and never neither ("if not W then it is D"). Every entry point -
//the W / D key shortcuts and the Settings > White overlay / Dark overlay menu items -
//routes through here so the two can't get out of sync.
function applyOverlayMode(mode)
{
	mode = (mode == "dark") ? "dark" : "white";

	clearWhiteOverlayEffect();
	clearDarkOverlayEffect();

	if(mode == "white")
		createWhiteOverlayEffect();
	else
		createDarkOverlayEffect();

	setResetSettingFlags("white-overlay-li", mode == "white");
	setResetSettingFlags("dark-overlay-li", mode == "dark");

	//The overlay just flipped, so any submarket boundary lines currently on the map need
	//to switch to the new contrast colour (black line on white overlay, white on dark).
	recolorSubmarketBoundaries();
}

//Repaints every submarket boundary polyline currently drawn (window.submarketBoundaryEntityList)
//with the current fog-overlay contrast colour. Labels in that list are left alone.
function recolorSubmarketBoundaries()
{
	if(typeof viewer == "undefined" || !window.submarketBoundaryEntityList || window.submarketBoundaryEntityList.length == 0)
		return;
	var lineColor = getSubmarketBoundaryContrastColor();
	for(var i = 0; i < window.submarketBoundaryEntityList.length; i++)
	{
		var ent = window.submarketBoundaryEntityList[i];
		if(ent && ent.polyline)
			ent.polyline.material = new Cesium.PolylineDashMaterialProperty({ color: lineColor });
	}
}

//window.floorNumberLabels = viewer.scene.primitives.add(new Cesium.LabelCollection());
window.floorLabels = [];
function showFloorNumberLabelV3(id, lon, lat, height, label, font, disableDepthTestDistance, fadeByDistance = false, showBackground = true, clearOthers = true, defaultShow = false)
{
	if(typeof viewer.entities.getById(id) == "undefined")
	{
		floorLabels.push(id);
		viewer.entities.add({
			id: id,
			show: defaultShow,
			position: Cesium.Cartesian3.fromDegrees(lon, lat, parseFloat(height.toFixed(2))),
			label: {
			  text: label + "",
			  font: "30px Helvetica",
			  /*heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,*/
			  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
			  disableDepthTestDistance: Number.POSITIVE_INFINITY,
			  fillColor: Cesium.Color.BLACK,
			  outlineColor: Cesium.Color.WHITE,
			  outlineWidth: 5,
			  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
			},
		});
	}
	
	/*
	////console.log(id+"\n"+lon+"\n"+lat+"\n"+height+"\n"+label);
	if(clearOthers)
	{
		window.floorNumberLabels.destroy();
		window.floorNumberLabels = viewerDemoPPT.scene.primitives.add(new Cesium.LabelCollection());
	}
	var translucencyByDistance = undefined;
	if(fadeByDistance)
	{
		var translucencyByDistance = new Cesium.NearFarScalar(300, 1.0, 500, 0.0);
	}
	
	var position = Cesium.Cartesian3.fromDegrees(lon, lat, parseFloat(height.toFixed(2)));
	window.floorNumberLabels.add({
		id: id,
		position : position,
		text : label,
		translucencyByDistance : translucencyByDistance,
		showBackground : showBackground,
		font : font,
		disableDepthTestDistance : disableDepthTestDistance
	});
	
	*/
}

var highlightEffectActive = false;
var floorPrimitives = [];
let backupHolesString = "";
function createFloorsEffect(idtbldg)
{
	/*
	if(buildingAssetEffectActive)
	{
		clearBuildingAssets();
		buildingAssetEffectActive = !buildingAssetEffectActive;
		if(typeof googleTileset.clippingPolygons != "undefined")
			googleTileset.clippingPolygons.enabled = false;
	}
	if(floorplanEffectActive)
	{
		effectsArray[7] = 0;//floorplans effect
		clearFloorplanEffect();
		window.lastSuite = null;
		floorplanEffectActive = false;
	}
	*/
	//if(!highlightEffectActive)
	if(true)
	{
		effectsArray[4] = 1;//floorplans effect
		clearPrimitives();
		
		buildingIdInEffect = idtbldg;
		//ShowInfobox(idtbldg);
		window.backupHolesString = window.lastHolesString;
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		//clearPrimitives(false);
		if(effectsArray[0] == 1 || effectsArray[6] == 1 )
		{
			//googleTileset.show = false;
		}
		else
		{
			viewer.entities.removeById("FogEffectEntity");debugger;
			viewer.entities.removeById("NewFogEffectEntity");
			//viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		}
		clr = "";
		defaultShow = true;
		//lastFloorHeight = 0;
		//if(lastCityLoaded == 2)
		
		lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
		if(TempBldgData[idtbldg].basefloorheight != null)
			lastFloorHeight += parseFloat(TempBldgData[idtbldg].basefloorheight);
		
		floorHeight = (TempBldgData[idtbldg].altitude / TempBldgData[idtbldg].floors);
		if(floorHeight < 2 || floorHeight > 8)
			floorHeight = 4;
		floorPrimitives = [];
		var coordsToUse = eval("["+TempBldgData[idtbldg].coords+"]");
		$.each(TempBldgData[idtbldg].floorDetails, function(i, eachFloor){
			if (clr == "" || clr == "Cesium.Color.YELLOW.withAlpha(0.5)")
				clr = "Cesium.Color.RED.withAlpha(0.5)";
			else if (clr == "Cesium.Color.RED.withAlpha(0.5)")
				clr = "Cesium.Color.YELLOW.withAlpha(0.5)";
			var loopFloorHt = floorHeight;
			if(eachFloor.floor_height != null && parseFloat(eachFloor.floor_height) > 0)
			{
				loopFloorHt = parseFloat(eachFloor.floor_height);
			}
			////console.log(id+"\n"+height+"\n"+extrudedHeight+"\n"+description+"\n"+coords);
			floorPrimitives.push(viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
				geometryInstances : new Cesium.GeometryInstance({
					geometry : new Cesium.PolygonGeometry({
					  polygonHierarchy : new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(coordsToUse)
					  ),
					  extrudedHeight: lastFloorHeight,
						height: lastFloorHeight + loopFloorHt,
					}),
					/*modelMatrix : modelMatrix,*/
					attributes : {
						//color : defaultPrimitiveHighlightColor,
						color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
						show : new Cesium.ShowGeometryInstanceAttribute(defaultShow)
					},
					id: "floorRow-"+(i+1)
				}),
				classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
				asynchronous: false,
			})));
			//showFloorNumberLabelV3(id, lon, lat, height, label, font, disableDepthTestDistance, fadeByDistance = false, showBackground = true, clearOthers = true)
			showFloorNumberLabelV3("floorLabel-"+idtbldg+"-"+eachFloor.number, coordsToUse[0], coordsToUse[1], (lastFloorHeight + loopFloorHt - 2), eachFloor.number, "14px Helvetica Neue", 10, true, true, false);
			
			lastFloorHeight = lastFloorHeight + loopFloorHt;
		});
		/*
		
		for(var i = 1; i <= TempBldgData[idtbldg].floors; i++)
		{
			if (clr == "" || clr == "Cesium.Color.YELLOW.withAlpha(0.5)")
				clr = "Cesium.Color.RED.withAlpha(0.5)";
			else if (clr == "Cesium.Color.RED.withAlpha(0.5)")
				clr = "Cesium.Color.YELLOW.withAlpha(0.5)";
			
			////console.log(id+"\n"+height+"\n"+extrudedHeight+"\n"+description+"\n"+coords);
			floorPrimitives.push(viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
				geometryInstances : new Cesium.GeometryInstance({
					geometry : new Cesium.PolygonGeometry({
					  polygonHierarchy : new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(eval("["+TempBldgData[idtbldg].coords+"]"))
					  ),
					  extrudedHeight: lastFloorHeight,
						height: lastFloorHeight + floorHeight,
					}),
					attributes : {
						//color : defaultPrimitiveHighlightColor,
						color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
						show : new Cesium.ShowGeometryInstanceAttribute(defaultShow)
					},
					id: "floorRow-"+i
				}),
				classificationType : Cesium.ClassificationType.BOTH,
			})));
			
			lastFloorHeight = lastFloorHeight + floorHeight;
		}
		*/
		$("#highlightButton").removeClass("btn-secondary");
		$("#highlightButton").addClass("btn-primary");
		highlightEffectActive = true;
	}
	/*
	else
	{
		effectsArray[4] = 0;//floorplans effect
		clearHighlightEffect();
		//if(!buildingAssetEffectActive && !spotlightEffectActive && !isolateEffectActive && !newHighlightEffectActive && !isolateSatelliteEffectActive)
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			setTimeout(function (){highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true); }, 200);
		}
	}
	highlightEffectActive = !highlightEffectActive;
	*/
	updateURL();
}

function clearHighlightEffect()
{
	highlightEffectActive = false;
	$("#highlightButton").addClass("btn-secondary");
	$("#highlightButton").removeClass("btn-primary");
	DisableBottomPanoButton();
	$(".panoButton").css("display", "none");
	effectsArray[4] = 0;//floorplans effect
	$("#highlightButton").addClass("btn-secondary");
	$("#highlightButton").removeClass("btn-primary");
	for(var i = 0; i <= floorPrimitives.length; i++)
	{
		if(typeof floorPrimitives[i] != "undefined")
			floorPrimitives[i].destroy();
	}
	floorPrimitives = [];
	if(effectsArray[5] == 0)
	{
		$.each(floorLabels, function (index, eachLabel){
			viewer.entities.removeById(eachLabel);
		});
		floorLabels = [];
	}
	else
	{
		$.each(floorLabels, function (index, eachLabel){
			viewer.entities.getById(eachLabel).show = false;
		});
	}
	
	window.lastHolesString = window.backupHolesString;
	viewer.entities.removeById("FogEffectEntity");debugger;
	if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
}

window.floorPlanDetails = [];
function getDataForFloorPlan(idtbldg)
{
	if(typeof window.floorPlanDetails[idtbldg] == "undefined" || window.floorPlanDetails[idtbldg].length == 0)
	{
		$.ajax({
		  method: "POST",
		  url: "./controllers/suiteController.php",
		  data: { param : "getBuildingFloorplanDetails", idtbuilding: idtbldg}
		})
		.done(function( data ) {
			////console.log(data);
			data = $.parseJSON( data );
			if(data.status == "success")
			{
				//console.log(data);
				window.floorPlanDetails[idtbldg] = data.floorplanDetails;
				if(typeof window.suiteOtherImages[parseInt(lastCityLoaded)] == "undefined")
				{
					window.suiteOtherImages[parseInt(lastCityLoaded)] = [];
				}
				$.each(data.suiteOtherDetails, function (index, eachRow){
					window.suiteOtherImages[parseInt(lastCityLoaded)][eachRow.idtsuite] = eachRow;
				});
				createFloorplanEffect(idtbldg);
				EnableBottomPanoButton();
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
	else
	{
		createFloorplanEffect(idtbldg);
	}
}
window.floorPlanPrimitives = [];
window.floorPlanPrimitivesIndexes = [];
var floorplanEffectActive = false;
function createFloorplanEffect(idtbldg)
{
	/* if(highlightEffectActive)
	{
		clearHighlightEffect();
		highlightEffectActive = !highlightEffectActive;
	}
	if(buildingAssetEffectActive)
	{
		clearBuildingAssets();
		buildingAssetEffectActive = !buildingAssetEffectActive;
		if(typeof googleTileset.clippingPolygons != "undefined")
			googleTileset.clippingPolygons.enabled = false;
	} */

	//if(!floorplanEffectActive)
	if(true)
	{
		effectsArray[7] = 1;//floorplans effect
		
		clearPrimitives(false);
		
		//var bldgName = cityFloorPlan[parseInt(lastCityLoaded)][parseInt(devSelectedBuilding)];
		window.lastHolesString = ' ';
		if(typeof TempBldgData[idtbldg] != "undefined")
			window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		//clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");debugger;
		viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");

		clr = "";
		defaultShow = true;
		var lastFloorHeight = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
		if(typeof TempBldgData[idtbldg] != "undefined" && TempBldgData[idtbldg].basefloorheight != null)
			lastFloorHeight += parseFloat(TempBldgData[idtbldg].basefloorheight);
		//floorPlanEntity is always red: RED.withAlpha(0.7) unselected, solid RED for the selected floor.
		var clr = "Cesium.Color.RED.withAlpha(0.7)";
		
		var floorHeight = (TempBldgData[idtbldg].altitude / TempBldgData[idtbldg].floors);
		if(floorHeight < 2 || floorHeight > 8)
			floorHeight = 4;
		
		$.each(TempBldgData[idtbldg].floorDetails, function(i, eachFloor){
			
			var loopFloorHt = floorHeight;
			if(eachFloor.floor_height != null && parseFloat(eachFloor.floor_height) > 0)
			{
				loopFloorHt = parseFloat(eachFloor.floor_height);
			}
			if(typeof window.floorPlanDetails[idtbldg][eachFloor.number] != "undefined" && window.floorPlanDetails[idtbldg][eachFloor.number].length > 0)
			{
				if(defaultFloorSelected != 0 && defaultFloorSelected == eachFloor.number)
				{
					clr = "Cesium.Color.RED";
					
				}
				else
				{
					clr = "Cesium.Color.RED.withAlpha(0.7)";
				}
				////console.log(id+"\n"+height+"\n"+extrudedHeight+"\n"+description+"\n"+coords);
				idtsuite = window.floorPlanDetails[idtbldg][eachFloor.number][0].idtsuite;
				
				if(typeof window.suiteHeightValues[idtsuite] == "undefined")
				{
					window.suiteHeightValues[idtsuite] = [];
				}
				
				window.suiteHeightValues[idtsuite].push(parseFloat(lastFloorHeight));
				window.suiteHeightValues[idtsuite].push(parseFloat(lastFloorHeight) + parseFloat(loopFloorHt));
				
				if(typeof window.floorPlanDetails[idtbldg][eachFloor.number] != "undefined")
				var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
					geometryInstances : new Cesium.GeometryInstance({
						geometry : new Cesium.PolygonGeometry({
						  polygonHierarchy : new Cesium.PolygonHierarchy(
							Cesium.Cartesian3.fromDegreesArray(eval("["+TempBldgData[idtbldg].coords+"]"))
						  ),
						  extrudedHeight: lastFloorHeight,
							height: lastFloorHeight + loopFloorHt,
						}),
						/*modelMatrix : modelMatrix,*/
						attributes : {
							//color : defaultPrimitiveHighlightColor,
							color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
							show : new Cesium.ShowGeometryInstanceAttribute(defaultShow)
						},
						id: "floorPlanEntity-"+idtbldg+"-"+eachFloor.number+"-"+idtsuite
					}),
					classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
				}));
				//id must match the primitive's own geometryInstance id above (including idtsuite) - Up/Down floor
				//navigation in tickMenu.js looks up the current floor in this array by comparing selectedPrimitiveId
				//(which is always the full id with idtsuite) against this .id, so a mismatch here silently breaks
				//Up/Down for this effect. floorNumber is also read by that same navigation code.
				window.floorPlanPrimitivesIndexes.unshift({"id": "floorPlanEntity-"+idtbldg+"-"+eachFloor.number+"-"+idtsuite, "primitiveindex" : window.floorPlanPrimitives.length, "floorNumber" : eachFloor.number } );
				window.floorPlanPrimitives.push(ent);
				if(defaultFloorSelected != 0 && defaultFloorSelected == eachFloor.number)
				{
					window.lastFloorAltitude = lastFloorHeight + loopFloorHt;
					$("#pano-view-li").show();
					//$(".full-screen-arrow").show();
					selectedPrimitive = ent;
					selectedPrimitiveId = "floorPlanEntity-"+idtbldg+"-"+eachFloor.number;
					
					$("#infoboxFloorPlanRow").show();
					var details = window.floorPlanDetails[idtbldg][defaultFloorSelected];
					prepareFloorPlanInInfobox(idtbldg, defaultFloorSelected, details);
					
					$(".floorNumberRowTR").show();
					$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+defaultFloorSelected+")</span></b>");
					
					defaultFloorSelected = 0;
					setTimeout(function (){
						
						addPolygonOutlineOnTileset(TempBldgData[idtbldg].coords, window.suiteHeightValues[idtsuite][0] - 0.5, window.suiteHeightValues[idtsuite][1], Cesium.Color.WHITE);
					}, 2000);
				}
			}
			lastFloorHeight = lastFloorHeight + loopFloorHt;
		});
		$("#legendPanel").hide();
		$("#floorplanButton").removeClass("btn-secondary");
		$("#floorplanButton").addClass("btn-primary");
	}
	/*
	else
	{
		$("#legendPanel").show();
		DisableBottomPanoButton();
		effectsArray[7] = 0;//floorplans effect
		clearFloorplanEffect();
		window.lastSuite = null;
		if(effectsArray.includes(1) == false)
		{
			$("#legendPanel").show();
			highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
		}
	}
	*/
	floorplanEffectActive = true;
	updateURL();
}

function clearFloorplanEffect()
{
	DisableBottomPanoButton();
	floorplanEffectActive = false;
	$("#floorplanButton").addClass("btn-secondary");
	$("#floorplanButton").removeClass("btn-primary");
	effectsArray[7] = 0;//floorplans effect
	$("#infoboxFloorPlanRow").show();
	$("#infoboxFloorPlanRow").html("");
	window.lastSuite = null;
	
	$("#floorplanButton").addClass("btn-secondary");
	$("#floorplanButton").removeClass("btn-primary");
	for(var i = 0; i <= floorPlanPrimitives.length; i++)
	{
		if(typeof floorPlanPrimitives[i] != "undefined")
			floorPlanPrimitives[i].destroy();
	}
	
	floorPlanPrimitives = [];
}

//Building-level AI Agent panel for the Office, Hotel and Multifamily visualisation infoboxes (replaces the
//old, disabled "Amenities" effect button there - see the amenitiesButtonIsAIAgent branch in ShowInfobox()).
//No suite is involved, so idtsuite is 0 and contextType is one of "Office Market" / "Hotel" / "Multifamily" -
//classes/aiAgent.php treats all three as building-level (drops suite/city references, stores idtsuite as NULL
//in tai_agent_usage_log) and each pulls its own question set. Reuses #infoboxFloorPlanRow, the same panel
//Floor Plan/Files content renders into.
//Toggle: first click opens the panel and marks the button selected (btn-primary, matching the
//.floorsToggleLabel.btn-primary/btn-secondary convention used elsewhere for toggle buttons in this infobox);
//a second click on the same button closes it. window.buildingAIAgentPanelActive tracks whether the panel
//currently showing is this one (vs. Files/Floorplans content sharing the same #infoboxFloorPlanRow), and is
//reset to false whenever ShowInfobox() runs for a (possibly different) building.
window.buildingAIAgentPanelActive = false;
//Closes the building-level AI Agent panel and de-highlights its button. Called whenever another button that
//shares #infoboxFloorPlanRow (Floorplans, Files, Effects) is clicked, so the AI Agent tab doesn't stay
//"selected" while a different panel's content is showing.
function closeBuildingAIAgentPanel()
{
	if(!window.buildingAIAgentPanelActive)
		return;
	$("#infoboxFloorPlanRow").hide();
	$("#infoboxFloorPlanRow").html("");
	$("#aiAgentBuildingButton").removeClass("btn-primary").addClass("btn-secondary");
	window.buildingAIAgentPanelActive = false;
}

function toggleBuildingAIAgentPanel(idtbldg, btnEl, contextType)
{
	contextType = contextType || "Office Market";
	if(window.buildingAIAgentPanelActive)
	{
		$("#infoboxFloorPlanRow").hide();
		$("#infoboxFloorPlanRow").html("");
		$(btnEl).removeClass("btn-primary").addClass("btn-secondary");
		window.buildingAIAgentPanelActive = false;
		return;
	}
	$("#infoboxFloorPlanRow").html(buildAIAgentPanel(idtbldg, idtbldg, 0, contextType));
	$("#infoboxFloorPlanRow").show();
	$(btnEl).removeClass("btn-secondary").addClass("btn-primary");
	window.buildingAIAgentPanelActive = true;
}

function prepareFloorPlanInInfobox(idtbldg, floorNumber, details)
{
	var bldgName = "";
	var st = "";
	if(lastSelectedBuildingType == "Floorplan")
	{
		st = '<div style="margin: 5px; padding: 2px; margin-left: 0px !important; padding-left: 0px !important;">';
		st += '<a style="margin-top: 5px;position: absolute;" href="javascript:void(0)" class="buildingNameOnInfobox buildingNameOnInfoboxBOLD" onclick="flyToBuildingCamera('+idtbldg+');">'+window.cityBuildingDetails[lastCityLoaded][idtbldg].sbuildingname+'</a>';
		st += "<span class='pull-right' style='cursor:pointer; position: absolute; right: 2% !important; margin-top: -5px !important;'><span id='copyURLButton' ><img src='images/link_24.png' width='24px;' height='24px;' /></span></span>";
		st += '<br />';
		st += '</div>';
	}
	
	if(details.length == 1)
	{
		st += "Suite: <span class='buildingNameOnInfobox'>"+details[0]["suite_name"]+"</span>";
		if(details[0]["suite_area"] != "" && parseInt(details[0]["suite_area"]) > 0)
		{
			st += "&nbsp; Area: <span class='buildingNameOnInfobox'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(details[0]["suite_area"]), "", " "+cityAreaMeasurementUnit)+"</span>";
		}
		st += "<br /><small>"+details[0]["suite_description"]+"</small>";
		st += prepareSuiteImagesTabStructure(details[0]["idtsuite"], idtbldg, floorNumber, 0, adminBaseUrl+details[0].image_path+details[0].image_name, details[0].virtual_tour_url, details[0].dgs_url, '', false, details[0].sbuildingname, false, "Office Market");
		
	}
	else
	{
		st += '<div class="tabs">';
		var isActive = " active ";
		if(DefaultSuiteIndex != 'null' || DefaultSuiteIndex != null)
			isActive = "";
		var tabContent = '';
		$.each(details, function (index, eachSuite){
			if(DefaultSuiteIndex != null && DefaultSuiteIndex != 'null' && DefaultSuiteIndex == index)
			{
				isActive = " active ";
			}
			else
			{
				isActive = " ";
			}
			st += '<button class="tab '+isActive+'" data-tab="tab-'+index+'">'+eachSuite.suite_name+'</button>';
			
			tabContent += '<div class="tab-content '+isActive+'" id="tab-'+index+'">';
				tabContent += "Area: <span class='buildingNameOnInfobox'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(eachSuite.suite_area), "", " "+cityAreaMeasurementUnit)+"</span>";
				tabContent += "<br /><small>"+eachSuite.suite_description+"</small>";
				tabContent += prepareSuiteImagesTabStructure(eachSuite.idtsuite, idtbldg, floorNumber, index, adminBaseUrl+eachSuite.image_path+eachSuite.image_name, eachSuite.virtual_tour_url, eachSuite.dgs_url, '', false, eachSuite.sbuildingname, false, "Office Market");
			tabContent += '</div>';
			isActive = "";
		});
		st += '</div>';
		st += tabContent;
		st = '<div class="tabs-container">'+st+'</div>';
	}
	$("#infoboxFloorPlanRow").html(st);
	
	document.querySelectorAll('.tab').forEach(tab => {
		tab.addEventListener('click', () => {
			// Remove active class from all tabs and contents
			document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
			document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

			// Add active class to the clicked tab and corresponding content
			tab.classList.add('active');
			const contentId = tab.getAttribute('data-tab');
			var temp = contentId.split("-");
			window.lastSuite = temp[1];
			document.getElementById(contentId).classList.add('active');
			updateURL();
		});
	});
	initiateCopyButton();
}

function prepareAvailableOfficeSpaceInfobox(idtbldg, index, details2, allSuitesOnFloor)
{
	//The infobox is about to be rebuilt/replaced - drop any CSS-expanded 3DGS preview first, since its tile
	//is about to be destroyed and would otherwise leave the fixed-position overlay chrome stuck on screen.
	if(typeof closeTourPreviewFullscreen == "function")
		closeTourPreviewFullscreen();
	lastFloor = details2.floor_number;
	lastSuite = index;
	lastCompany = "";
	lastAgent = "";
	lastSuiteId = details2.idtsuite;
	recordAOSUnitSelectionForBackAndForth(idtbldg, index, details2.idtsuite);
	updateURL();
	var bldgName = "";
	var st = "";
	if(lastSelectedBuildingType == "Floorplan")
	{
		st = '<div style=" margin-left: 0px !important; padding-left: 0px !important;">';
		st += '<a href="javascript:void(0)" class="buildingNameOnInfobox buildingNameOnInfoboxBOLD" onclick="flyToBuildingCamera('+idtbldg+');">'+details2.sbuildingname+'</a>';
		//st += "<span style='position: absolute; right: 2%; font-weight: none !important;'></span>";
		st += "<span class='pull-right' style='position: absolute; right: 2% !important;'>id: <span id='buildingIdToCopy'>"+details2.idtbuilding+"</span>-"+details2.idtsuite+"</span>";
		st += '<br />';
		st += '</div>';
		$(".infoboxHeaderData").html(st);
		st = "";
	}
	var details = [];
	var floorNumber = details2.floor_number;
	details.push(details2);
	if(allSuitesOnFloor.length == 1)
	{
		st += "<table class='table table-striped minPaddingtable'>";
		st += "<tr><td colspan='2' class='infoboxBuildingAddress'>"+details2.address+"</td><td colspan='2' class='alignRight'><a href=\"javascript:toggleSubmarketBoundaryLine("+details2.idtsubmarket+");\">"+details2.ssubname+"</a></td></tr>";
		st += "<tr>"+fieldLabelTd("Floor", details[0]["floor_number"])+"<td>"+details[0]["floor_number"]+"</td>";
		if(details[0]["suite_area"] != "" && parseInt(details[0]["suite_area"]) > 0)
		{
			//st += "<td>Available Area</td><td><b>"+details[0]["suite_areaV2"]+" "+cityAreaMeasurementUnit+"</b></td>";
			st += "<td>Available Area</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(details[0]["suite_area"]), "", " "+cityAreaMeasurementUnit)+"</td>";
		}
		else
			st += "<td class='mutedFieldLabel'>Available Area</td><td></td>";
		st += "</tr>";


		st += "<tr>"+fieldLabelTd("Suite", details[0]["suite_name"])+"<td>"+details[0]["suite_name"]+"</td>"+fieldLabelTd("Date Available", details[0]["date_available2"])+"<td>"+details[0]["date_available2"]+"</td></tr>";

		st += "<tr>"+fieldLabelTd("Class", details[0]["class"])+"<td>"+details[0]["class"]+"</td>"+fieldLabelTd("Additional Rent", details[0]["total_additional_rent"])+"<td>"+numberWithCommaWithTwoDecimal(details[0]["total_additional_rent"], "$", " /psf")+"</td></tr>";

		//Created  // "+PrintOnlyDate(PrintIfNotNull(details[0].date_created))+"
		st += "<tr>"+fieldLabelTd("Built", details[0]["yearbuilt"])+"<td>";
		if(details[0]["yearbuilt"] > 0)
		{
			st += details[0]["yearbuilt"];
		}
		st += "</td>"+fieldLabelTd("Asking Rent", details[0]["asking_rent"])+"<td >"+numberWithCommaWithTwoDecimal(details[0]["asking_rent"], "$", " /psf")+"</td></tr>";
		st += "<tr>"+fieldLabelTd("Last Reno", details[0]["lastreno"])+"<td>"+details[0]["lastreno"]+"</td>";

		var occupancyRate = (parseInt(details[0].grossofficearea) - parseInt(details[0].total_suite_area))/parseInt(details[0].grossofficearea);
		occupancyRate = (occupancyRate * 100).toFixed(2);
		vacancyRate = 100 - occupancyRate;
		st += fieldLabelTd("Lease Type", details[0]["lease_type"])+"<td><span class='customBadge' style='background-color: "+classColor[details[0]["lease_type"]]+";'>"+printIfNotNull(details[0]["lease_type"])+"</span></td></tr>";
		st += "<tr><td>Vacancy</td><td>"+vacancyRate.toFixed(2)+"%</td>"+fieldLabelTd("Term", details[0]["term"])+"<td>"+printIfNotNullAndDatenotEmpty(details[0]["term"])+"</td></tr>";
		st += "<tr>"+fieldLabelTd("Capacity Est.", details[0]["suite_area"])+"<td>"+(parseFloat(details[0]["suite_area"]) > 0 ? Math.floor(parseFloat(details[0]["suite_area"]) / 150) : "")+"</td><td></td><td></td></tr>";
		lastCompany = details[0]["idtcompany"];
		lastAgent = details[0]["idtbroker"];
		st += "<tr>"+fieldLabelTd("Listing Company", details[0]["companyname"], " colspan=2")+"<td colspan='2' class='brokerRow brokerRow-"+details[0]["idtcompany"]+"' onClick=\'filterAOSWithListingCompany("+details[0]["idtcompany"]+");initiateCompanyLogoEffectWithSpeed(); \'>"+details[0]["companyname"]+"</td></tr>";
		st += "<tr>"+fieldLabelTd("Listing Agent", details[0]["broker"], " colspan=2")+"<td class='agentRowDDD agentRow-"+details[0]["idtbroker"]+"' onClick='filterAOSWithListingAgent("+details[0]["idtbroker"]+");'><span style='color: -webkit-link;cursor: pointer;text-decoration: underline;'>" + details[0]["broker"] + "</span> <a href='mailto:" + details[0]["broker_email"] + "?subject=Inquiry on "+details[0]["sbuildingname"]+" from Floorplan City' onclick='event.stopPropagation();' title='Email "+details[0]["broker"]+"'><img width='16px;' height='16px;' style='vertical-align:middle;' src='images/email_24.png' /></a></td><td aligh='right' style='padding: 0px !important; float:right'>&nbsp;<span style='cursor:pointer;margin: 0px !important;padding-right:0px !important;' id='copyURLButton' ><img width='24px;' height='24px;' src='images/link_24.png' /></span></td></tr>";
		st += "</table>";
		$(".infoboxContainerData").html(st);
		$(".infoboxContainer").show();
		st = "";
		st += prepareSuiteImagesTabStructure(details[0]["idtsuite"], idtbldg, parseInt(details2.floor_number), index, adminBaseUrl+details[0].image_path+details[0].image_name, details2.virtual_tour_url, details2.dgs_url, details[0]["suite_description"], true, details2.sbuildingname, false, "AOS");
	}
	else
	{
		st += "<span class='infoboxBuildingAddress' style='float:left'>"+allSuitesOnFloor[0].address+"</span><span class='pull-right' style='position: absolute; right: 2% !important;'><a href=\"javascript:toggleSubmarketBoundaryLine("+allSuitesOnFloor[0].idtsubmarket+");\">"+allSuitesOnFloor[0].ssubname+"</a></span>";
		st += '<br clear="all">';
		st += '<div class="tabs">';
		var isActive = " active ";
		if(DefaultSuiteIndex != 'null' || DefaultSuiteIndex != null)
			isActive = "";
		var tabContent = '';
		$.each(allSuitesOnFloor, function (i2, eachSuite){
			if(eachSuite.idtsuite == details[0].idtsuite)
			{
				isActive = " active ";
			}
			else
			{
				isActive = " ";
			}
			st += '<button class="tab '+isActive+'" data-tab="tab-'+i2+'" onClick="selectPartialBasedOnUnitTab('+eachSuite.idtsuite+')">'+eachSuite.suite_name+'</button>';
			
			tabContent += '<div class="tab-content '+isActive+'" id="tab-'+i2+'">';
				tabContent += "<table class='table table-striped minPaddingtable'>";
					
					tabContent += "<tr>"+fieldLabelTd("Floor", eachSuite.floor_number)+"<td>"+eachSuite.floor_number+"</td>"+fieldLabelTd("Available Area", eachSuite.suite_area)+"<td><span class=''>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(eachSuite.suite_area), "", " "+cityAreaMeasurementUnit)+"</span></td></tr>";
					//tabContent += "<tr><td>Lease Type</td><td>"+eachSuite.lease_type+"</td><td>Space Type</td><td>"+eachSuite.space_type+"</td></tr>";

					tabContent += "<tr>"+fieldLabelTd("Suite", eachSuite.suite_name)+"<td>"+eachSuite.suite_name+"</td>"+fieldLabelTd("Date Available", eachSuite.date_available2)+"<td>"+eachSuite.date_available2+"</td></tr>";

					tabContent += "<tr>"+fieldLabelTd("Class", eachSuite.class)+"<td>"+eachSuite.class+"</td>"+fieldLabelTd("Additional Rent", eachSuite.total_additional_rent)+"<td>"+numberWithCommaWithTwoDecimal(eachSuite.total_additional_rent, "$", " /psf")+"</td></tr>";

					//Created  //"+PrintOnlyDate(PrintIfNotNull(eachSuite.date_created))+"
					tabContent += "<tr>"+fieldLabelTd("Built", eachSuite.yearbuilt)+"<td>";
					if(eachSuite.yearbuilt > 0)
					{
						tabContent += eachSuite.yearbuilt;
					}
					tabContent += "</td>"+fieldLabelTd("Asking Rent", eachSuite.asking_rent)+"<td >"+numberWithCommaWithTwoDecimal(eachSuite.asking_rent, "$", " /psf")+"</td></tr>";
					tabContent += "<tr>"+fieldLabelTd("Last Reno", eachSuite.lastreno)+"<td>"+eachSuite.lastreno+"</td>";

					var occupancyRate = (parseInt(details[0].grossofficearea) - parseInt(details[0].total_suite_area))/parseInt(details[0].grossofficearea);
					occupancyRate = (occupancyRate * 100).toFixed(2);
					vacancyRate = 100 - occupancyRate;

					tabContent += fieldLabelTd("Lease Type", eachSuite.lease_type)+"<td><span class='customBadge' style='background-color: "+classColor[eachSuite.lease_type]+";'>"+printIfNotNull(eachSuite.lease_type)+"</span></td></tr>";
					tabContent += "<tr><td>Vacancy</td><td>"+vacancyRate.toFixed(2)+"%</td>"+fieldLabelTd("Term", eachSuite.term)+"<td>"+printIfNotNullAndDatenotEmpty(eachSuite.term)+"</td></tr>";
					tabContent += "<tr>"+fieldLabelTd("Capacity Est.", eachSuite.suite_area)+"<td>"+(parseFloat(eachSuite.suite_area) > 0 ? Math.floor(parseFloat(eachSuite.suite_area) / 150) : "")+"</td><td></td><td></td></tr>";
					lastCompany = eachSuite.idtcompany;
					lastAgent = eachSuite.idtbroker;

					tabContent += "<tr>"+fieldLabelTd("Listing Company", eachSuite.companyname, " colspan=2")+"<td colspan=2 class='brokerRow brokerRow-"+eachSuite.idtcompany+"' onClick=\'filterAOSWithListingCompany("+eachSuite.idtcompany+"); initiateCompanyLogoEffectWithSpeed(); \'>"+eachSuite.companyname+"</td></tr>";
					tabContent += "<tr>"+fieldLabelTd("Listing Agent", eachSuite.broker, " colspan=2")+"<td class='agentRowDDD agentRow-"+eachSuite.idtbroker+"' onClick='filterAOSWithListingAgent("+eachSuite.idtbroker+");'><span style='color: -webkit-link;cursor: pointer;text-decoration: underline;'>" + eachSuite.broker + "</span> <a href='mailto:" + eachSuite.broker_email + "?subject=Inquiry on "+details[0]["sbuildingname"]+" from Floorplan City' onclick='event.stopPropagation();' title='Email "+eachSuite.broker+"'><img height='16px;' width='16px;' style='vertical-align:middle;' src='images/email_24.png' /></a></td><td aligh='right' style=' padding: 0px !important; float:right'>&nbsp;<span style='cursor:pointer;margin: 0px !important; padding-right: 0px !important;' id='copyURLButton' ><img height='24px;' width='24px;' src='images/link_24.png' /></span></td></tr>";
					
					//tabContent += "<tr><td>Company</td><td>"+eachSuite.companyname+"</td><td></td><td></td></tr>";
				tabContent += "</table>";
				
				tabContent += prepareSuiteImagesTabStructure(eachSuite.idtsuite, idtbldg, floorNumber, index, adminBaseUrl+eachSuite.image_path+eachSuite.image_name, eachSuite.virtual_tour_url, eachSuite.dgs_url, eachSuite.suite_description, true, eachSuite.sbuildingname, false, "AOS");

			tabContent += '</div>';
			
			isActive = "";
		});
		st += '</div>';
		st += tabContent;
		st = '<div class="tabs-container">'+st+'</div>';
		$(".infoboxContainerData").html(st);
		$(".infoboxContainer").show();
		st = "";
	}
	$("#infoboxFloorPlanRow").html(st);
	
	if(filterWithListingCompanyActive == true)
	{
		$(".brokerRow").removeClass("highlight-company-name");
		$(".brokerRow-"+lastCompany).addClass("highlight-company-name");
	}
	if(filterWithListingAgentActive == true)
	{
		$(".agentRow").removeClass("highlight-agent-name"); $(".agentRowDDD").removeClass("highlight-agent-name");
		$(".agentRow-"+lastAgent).addClass("highlight-agent-name");
	}

	document.querySelectorAll('.tab').forEach(tab => {
		tab.addEventListener('click', () => {
			// Remove active class from all tabs and contents
			document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
			document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

			// Add active class to the clicked tab and corresponding content
			tab.classList.add('active');
			const contentId = tab.getAttribute('data-tab');
			var temp = contentId.split("-");
			window.lastSuite = temp[1];
			document.getElementById(contentId).classList.add('active');
			updateURL();
		});
	});
	initiateCopyButton();
}

function selectPartialBasedOnUnitTab(idtsuite)
{
	if(typeof aosPrimitives[devSelectedBuilding])
	{
		/*
		
		*/
		entityPicked = null;
		entityRowPicked = null;
		$.each(aosPrimitives[devSelectedBuilding], function (uIndex, row){
			var temp = row._primitive._instanceIds[0].split("-");
			if(temp[3] == idtsuite)
			{
				entityPicked = aosPrimitives[devSelectedBuilding][uIndex];
				entityRowPicked = uIndex;
				//console.log("entityRowPicked: " + entityRowPicked);
			}
		});
		
		if(entityPicked != null)
		{
			resetLastSelectedPrimitive();
			
			selectedPrimitive = aosPrimitives[devSelectedBuilding][entityRowPicked]._primitive;
			selectedPrimitiveId = aosPrimitives[devSelectedBuilding][entityRowPicked]._primitive._instanceIds[0];
			var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
			//console.log(attributes.color);
			if(typeof attributes != "undefined")
			{
				selectedPrimitiveColor = attributes.color;
				attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 255];
				attributes.show = [1];
			}
			check = selectedPrimitiveId.split("-");
			details = window.availableOfficeSpace[check[2]];
			
			////console.log(details.suite_area);
			//allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
			
			if(typeof window.lastFloorAltitude == "undefined" || window.lastFloorAltitude == null)
			{
				window.lastFloorAltitude = cameraAltitudeAdjustment + (parseFloat(details.floor_height) * parseFloat(details.floor_number));
			}
			//prepareAvailableOfficeSpaceInfobox(check[1], check[2], details, allSuitesOnFloor);
			var temp = details.splitCoords.split(",");
			prepareLogoAndSqftLabels(selectedPrimitiveId, parseFloat(temp[1]), parseFloat(temp[0]), window.lastFloorAltitude, adminBaseUrl + details.companyimage, details.suite_area);
		}
	}
}

function prepareResiUnitInfobox(idtbldg, floorNumber, details)
{
	var bldgName = "";
	var st = '<span class="infoboxHeaderData"><a href="javascript:void(0)" class="buildingNameOnInfobox" onClick=\"flyToIdtcamera("'+details.idtcamera+'")\">'+details.unit_name+'</a></span>';
	st += '<table class="table table-striped minPaddingtable" cellpadding="2" cellspacing="0" border="0" witdh="90%">';

	st += "<tr><td>Floor Number</td><td>"+details.unit_type+"</td>";
	st += "<td>Baths</td><td>"+details.baths+"</td></tr>";
	//st += "<td>Unit Type</td><td>"+details.unit_type+"</td>";
	st += "<tr><td>Area</td><td>"+numberWithCommaWithoutDecimal(details.unit_sqft, "", " "+cityAreaMeasurementUnit)+"</td><td>Price</td><td>"+numberWithCommaWithoutDecimal(details.unit_price, "$", "")+"</td></tr>";
		
	st += "<tr><td>Availability</td><td>"+details.availability+"</td><td></td><td></td></tr>";
	//st += "<tr><td>Description</td><td colspan=3>"+details.unit_description+"</td></tr>";
	st += "</table>";
	
	$("#infoboxFloorPlanRow").html(st);
	$("#infoboxFloorPlanRow").show();
}

window.featureFloorPlanCollapsed = true;
setTimeout(function () {
	if(isMobile.any() != null)
	{
		window.featureFloorPlanCollapsed = false;
	}
}, 2000);

function getURLForFiles(row)
{
	return "view-files.php";
	if(row.filetype == "application/pdf")
		return "view-files.php";
	else
		return "index.php";
}

function getTargetForFiles(row)
{
	return "_blank";
	if(row.filetype == "application/pdf")
		return "_blank";
	else
		return "";
}

function resolveBldgName(idtbldg, bldgNameParam)
{
	if(typeof bldgNameParam != "undefined" && bldgNameParam != null && bldgNameParam != "")
	{
		//Preferred: passed directly from the suite row (sbuildingname) by the caller - see buildTourPreviewTile.
		return bldgNameParam;
	}
	//Fallback: window.cityBuildingDetails is only populated via getFloorPlansForCity(), which is currently
	//never called, so this branch is effectively dead - kept only as a harmless safety net.
	var cityId = parseInt(lastCityLoaded);
	if(typeof idtbldg != "undefined" && typeof window.cityBuildingDetails[cityId] != "undefined" && typeof window.cityBuildingDetails[cityId][idtbldg] != "undefined")
	{
		return window.cityBuildingDetails[cityId][idtbldg].sbuildingname;
	}
	return "";
}

function setFullScreenModalTitle(idtbldg, bldgNameParam)
{
	$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox buildingNameOnInfoboxBOLD modalHeaderText'>"+resolveBldgName(idtbldg, bldgNameParam)+"</span>");
}

function openFullScreenVirtualTour(url, idtbldg, bldgNameParam)
{
	$("#virtualTourModal").show();
	setFullScreenModalTitle(idtbldg, bldgNameParam);
	$(".virtual-tour-modal-content").html('<div class="d-flex justify-content-center align-items-center" style="height: 100% !important; width: 100% !important;"><div class="ratio ratio-16x9"><iframe id="virtualTourIframe" onClick=\"openFullScreenVirtualTour()\" style="width:95%; min-height: 95%;" src="'+url+'" title="Virtual Tour" allow="fullscreen; vr; xr-spatial-tracking; gyroscope; accelerometer" allowfullscreen loading="lazy" frameborder="0"></iframe></div></div>');
	//Viewers like the 3DGS one listen for WASD/wheel/drag; without an explicit focus() the page keeps
	//keyboard focus on whatever was clicked to open the modal, so input lands nowhere until the user
	//clicks inside the iframe first. This iframe is always freshly created above, so wait for its actual
	//"load" event (not a fixed delay) before focusing - a fixed delay can fire before the external viewer's
	//own input listeners have mounted, leaving WASD/wheel/drag dead until the modal is closed and reopened.
	var frameEl = document.getElementById("virtualTourIframe");
	if(frameEl)
		frameEl.addEventListener("load", function(){ frameEl.focus(); }, { once: true });
}

//Expands the small 3DGS preview iframe IN PLACE (CSS only) instead of moving it into #virtualTourModal or
//creating a fresh iframe there. Per the HTML spec, an iframe re-navigates every time it (or an ancestor) is
//(re)inserted into the document - so relocating the same node via appendChild still reloads it, exactly like
//building a brand new iframe would. Leaving the node exactly where it already lives and just CSS-expanding
//its wrapper to cover the viewport is the only way to avoid that reload.
window.activeFullscreenPreviewTileId = null;
window.dgsFullScreenActive = false;
window.floorplanFullScreenActive = false;
function expandTourPreviewToFullScreen(idtsuite, url, idtbldg, bldgNameParam)
{
	window.dgsFullScreenActive = true;
	updateURL();
	var tileEl = document.getElementById("tourPreviewTile-"+idtsuite);
	if(!tileEl)
	{
		//Preview tile isn't in the DOM (shouldn't normally happen) - fall back to the modal with a fresh iframe.
		openFullScreenVirtualTour(url, idtbldg, bldgNameParam);
		return;
	}
	window.activeFullscreenPreviewTileId = tileEl.id;
	tileEl.classList.add("tourPreviewTileFullscreen");
	document.body.style.overflow = "hidden";
	showTourPreviewFullscreenChrome(idtbldg, bldgNameParam);
	//The click that triggered this (the "Fullscreen"/"3D Gaussian Splat" link) can re-focus itself right after
	//this handler returns, stealing focus back from the iframe - deferring the focus() call to the next tick
	//lets it win, same as in openFullScreenVirtualTour(). If a building-name click just rebuilt the infobox
	//(prepareAvailableOfficeSpaceInfobox -> closeTourPreviewFullscreen), this tile's iframe is a brand new
	//node that's still navigating - a fixed delay used to lose that race, leaving WASD/wheel/drag dead inside
	//it until the fullscreen view was closed and reopened. Checking the "loaded" flag set by the iframe's own
	//onload (see buildTourPreviewTile) and, if it hasn't fired yet, waiting for it instead of guessing a delay
	//guarantees the external viewer's input listeners have actually mounted before we hand it focus.
	window.frameEl = document.getElementById("tourPreviewIframe-"+idtsuite);
	if(frameEl)
	{
		if(frameEl.dataset.loaded == "1")
			setTimeout(function(){ frameEl.focus(); }, 0);
		else
			frameEl.addEventListener("load", function(){ frameEl.focus(); }, { once: true });
	}

	$("#tourPreviewFullscreenBackdrop").on("click", function() {
        
        frameEl.focus()
    });

}

//Copies window.currentURL (kept in sync by updateURL(), including &dgsFullScreen=1 while this viewer is open -
//see expandTourPreviewToFullScreen) to the clipboard, for the share button in the 3DGS fullscreen chrome below.
function copyDGSFullScreenURL(e)
{
	if(e)
		e.stopPropagation();
	var btnEl = document.getElementById("dgsShareURLButton");
	function showCopiedFeedback()
	{
		if(!btnEl)
			return;
		var original = btnEl.innerHTML;
		btnEl.innerHTML = "Copied!";
		setTimeout(function (){ btnEl.innerHTML = original; }, 1500);
	}
	if(navigator.clipboard && navigator.clipboard.writeText)
	{
		navigator.clipboard.writeText(window.currentURL).then(showCopiedFeedback).catch(function (err){
			console.error("Failed to copy URL: ", err);
		});
	}
	else
	{
		var textarea = document.createElement("textarea");
		textarea.value = window.currentURL;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try
		{
			document.execCommand("copy");
			showCopiedFeedback();
		}
		catch(err)
		{
			console.error("Fallback copy failed: ", err);
		}
		document.body.removeChild(textarea);
	}
}

//Same copy-current-URL pattern as copyDGSFullScreenURL(), for the Share button in the floorplan #fullScreenModal
//header (see openFullScreenImageAOS(), which shows #floorplanShareURLButton and sets window.floorplanFullScreenActive
//so updateURL() keeps &floorplanFullScreen=1 in window.currentURL while this viewer is open).
function copyFloorplanFullScreenURL(e)
{
	if(e)
		e.stopPropagation();
	var btnEl = document.getElementById("floorplanShareURLButton");
	function showCopiedFeedback()
	{
		if(!btnEl)
			return;
		var original = btnEl.innerHTML;
		btnEl.innerHTML = "Copied!";
		setTimeout(function (){ btnEl.innerHTML = original; }, 1500);
	}
	if(navigator.clipboard && navigator.clipboard.writeText)
	{
		navigator.clipboard.writeText(window.currentURL).then(showCopiedFeedback).catch(function (err){
			console.error("Failed to copy URL: ", err);
		});
	}
	else
	{
		var textarea = document.createElement("textarea");
		textarea.value = window.currentURL;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try
		{
			document.execCommand("copy");
			showCopiedFeedback();
		}
		catch(err)
		{
			console.error("Fallback copy failed: ", err);
		}
		document.body.removeChild(textarea);
	}
}

//Fixed-position backdrop + title bar + close button drawn around the CSS-expanded preview tile, styled to match
//.fullScreenModalWindow/.fullscreenmodal-content/#closeModal. Plain <div>s, not iframes, so creating/updating
//them has no reload implications.
function showTourPreviewFullscreenChrome(idtbldg, bldgNameParam)
{
	var backdropEl = document.getElementById("tourPreviewFullscreenBackdrop");
	if(!backdropEl)
	{
		backdropEl = document.createElement("div");
		backdropEl.id = "tourPreviewFullscreenBackdrop";
		backdropEl.className = "tourPreviewFullscreenBackdrop";
		document.body.appendChild(backdropEl);
	}
	backdropEl.style.display = "block";

	var chromeEl = document.getElementById("tourPreviewFullscreenChrome");
	if(!chromeEl)
	{
		chromeEl = document.createElement("div");
		chromeEl.id = "tourPreviewFullscreenChrome";
		chromeEl.className = "tourPreviewFullscreenChrome";
		//Same title/close markup as #fullScreenModal and #virtualTourModal (see index.php) - reusing
		//.fullscreenmodal-title and #closeModal/.close instead of one-off classes keeps the header and
		//close icon visually identical across all three fullscreen surfaces.
		chromeEl.innerHTML = "<span class='buildingNameOnInfobox buildingNameOnInfoboxBOLD modalHeaderText fullscreenmodal-title'></span><button type='button' id='dgsShareURLButton' class='btn btn-primary tourPreviewShareButton' title='Copy link to this view' onclick='copyDGSFullScreenURL(event);'>Share</button><span id='closeModal' class='close' onclick='closeTourPreviewFullscreen();'>&times;</span>";
		document.body.appendChild(chromeEl);
	}
	chromeEl.querySelector(".fullscreenmodal-title").textContent = resolveBldgName(idtbldg, bldgNameParam);
	chromeEl.style.display = "flex";
}

function closeTourPreviewFullscreen()
{
	if(window.activeFullscreenPreviewTileId)
	{
		var tileEl = document.getElementById(window.activeFullscreenPreviewTileId);
		if(tileEl)
			tileEl.classList.remove("tourPreviewTileFullscreen");
		window.activeFullscreenPreviewTileId = null;
	}
	var chromeEl = document.getElementById("tourPreviewFullscreenChrome");
	if(chromeEl)
		chromeEl.style.display = "none";
	var backdropEl = document.getElementById("tourPreviewFullscreenBackdrop");
	if(backdropEl)
		backdropEl.style.display = "none";
	document.body.style.overflow = "";
	window.dgsFullScreenActive = false;
	updateURL();
}

//Shared onclick body for tour/3DGS links: tracks the click (see trackLabel below) then opens the fullscreen modal.
//trackLabel reuses the existing tuser_access_log mechanism (saveUserAccessDetails -> controllers/userController.php)
//to record idtuser, ip_address (window.IPAddress) and date_created for every click - no new table needed.
function buildTourOnclick(url, idtbldg, idtsuite, trackLabel, bldgName)
{
	//Escape apostrophes (e.g. "Fisher's Building") so they don't prematurely close the single-quoted onclick attribute below.
	var bldgNameEscaped = (bldgName || '').replace(/'/g, "&#39;");
	var onclickJS = 'openFullScreenVirtualTour("'+url+'", '+idtbldg+', "'+bldgNameEscaped+'");';
	if(typeof trackLabel != "undefined" && trackLabel != null && trackLabel != "")
	{
		onclickJS = 'saveUserAccessDetails("'+trackLabel+'", "'+idtsuite+'"); ' + onclickJS;
	}
	return onclickJS;
}

//Same as buildTourOnclick, but expands the already-loaded preview tile (id="tourPreviewTile-{idtsuite}") in
//place instead of creating a fresh iframe in the modal - avoids reloading the 3DGS viewer on open.
function buildExpandPreviewOnclick(url, idtbldg, idtsuite, trackLabel, bldgName)
{
	var bldgNameEscaped = (bldgName || '').replace(/'/g, "&#39;");
	var onclickJS = 'expandTourPreviewToFullScreen('+idtsuite+', "'+url+'", '+idtbldg+', "'+bldgNameEscaped+'");';
	if(typeof trackLabel != "undefined" && trackLabel != null && trackLabel != "")
	{
		onclickJS = 'saveUserAccessDetails("'+trackLabel+'", "'+idtsuite+'"); ' + onclickJS;
	}
	return onclickJS;
}

//Plain clickable text link (used for the 3DGS/Virtual Tour row above the 3DGS preview). reusePreview should be
//true for 3DGS (there's a live preview iframe to expand) and false for Virtual Tour (no preview iframe exists).
function buildTourLink(url, label, idtbldg, idtsuite, trackLabel, bldgName, reusePreview = false)
{
	var onclickJS = reusePreview
		? buildExpandPreviewOnclick(url, idtbldg, idtsuite, trackLabel, bldgName)
		: buildTourOnclick(url, idtbldg, idtsuite, trackLabel, bldgName);
	return '<a href="javascript:void(0);" onclick=\''+onclickJS+'\'>'+label+'</a>';
}

//Small clickable iframe preview of a tour URL, sized to fit inside the infobox.
//Experimental - self-contained, safe to delete this function and revert its callers to plain text links.
//showLabel controls the bottom "Fullscreen" overlay bar - pass false when that same expand action is already
//offered elsewhere (e.g. moved up into the .tourLinksRow next to "3D Gaussian Splat") so it isn't duplicated.
function buildTourPreviewTile(url, label, idtbldg, idtsuite, trackLabel, showiframe = false, bldgName = '', showLabel = true)
{
	divLabel = "";
	var idAttr = "";
	var onclickJS;
	var labelHtml = "";
	if(showiframe)
	{
		onclickJS = buildExpandPreviewOnclick(url, idtbldg, idtsuite, trackLabel, bldgName);
		idAttr = ' id="tourPreviewTile-'+idtsuite+'"';
		iframeURL = '<iframe id="tourPreviewIframe-'+idtsuite+'" class="tourPreviewIframe" src="'+url+'" loading="lazy" frameborder="0" onload="this.dataset.loaded=\'1\';"></iframe>';
		if(showLabel)
			labelHtml = '<div class="tourPreviewLabel"><a href="javascript:void(0);" onclick=\''+onclickJS+'\'>'+label+'</a></div>';
	}
	else
	{
		onclickJS = buildTourOnclick(url, idtbldg, idtsuite, trackLabel, bldgName);
		divLabel = "1";
		iframeURL = '';//'<iframe class="tourPreviewIframe" src="'+url+'" loading="lazy" frameborder="0"></iframe><div class="tourPreviewLabel">';
		if(showLabel)
			labelHtml = '<a href="javascript:void(0);" onclick=\''+onclickJS+'\'>'+label+'</a>';
	}
	return '<div'+idAttr+' class="tourPreviewTile'+divLabel+'">'+iframeURL+labelHtml+'</div>';
}

function prepareSuiteImagesTabStructure(idtsuite, idtbldg, floorNumber, index, imagePath, virtualTourURL = null, dgsURL = null, suiteDescription = '', rememberActiveTab = false, bldgName = '', disableAmenitiesTab = false, aiAgentContextType = "AOS")
{
	idtsuite = parseInt(idtsuite);
	var cityId = parseInt(lastCityLoaded);
	//window.suiteOtherImages
	/*
	<ul class="nav nav-tabs" id="subTabs">

		<li class="nav-item">
			<a class="nav-link" data-bs-toggle="tab" href="#subTab2">Sub Tab 2</a>
		</li>
	</ul>

	<div class="tab-content mt-2">
		<div class="tab-pane fade show active" id="subTab1">
			<p>Content for Sub Tab 1</p>
		</div>
		<div class="tab-pane fade" id="subTab2">
			<p>Content for Sub Tab 2</p>
		</div>
	</div>
	*/
	//idtsuite uniquely identifies this suite's tab/pane ids; index is a positional
	//array index (into the floor's suite list) required by openFullScreenImage and
	//must stay separate, otherwise different suites sharing the same loop position
	//(e.g. index 0 across different floors/buildings) end up with duplicate DOM ids.
	var uid = idtsuite;
	var ln = 0;

	var hasInterior = typeof window.suiteOtherImages[cityId][idtsuite] != "undefined" && typeof window.suiteOtherImages[cityId][idtsuite]["interior-images"] != "undefined";
	var hasExterior = typeof window.suiteOtherImages[cityId][idtsuite] != "undefined" && typeof window.suiteOtherImages[cityId][idtsuite]["exterior-images"] != "undefined";

	//Which sub-tab opens by default. Only honored when rememberActiveTab is true (prepareAvailableOfficeSpaceInfobox only,
	//per request); window.lastSuiteSubTabType is updated by the shown.bs.tab listener below and reset to null (-> floorplan)
	//in loadNewBuildingTypeView() whenever the visualization changes.
	var validTabKeys = ["floorplan", "Tour", "files"];
	if(!disableAmenitiesTab) validTabKeys.push("Amenities");
	if(hasInterior) validTabKeys.push("interior-images");
	if(hasExterior) validTabKeys.push("exterior-images");
	var activeTabKey = "floorplan";
	if(rememberActiveTab && typeof window.lastSuiteSubTabType != "undefined" && window.lastSuiteSubTabType != null && validTabKeys.indexOf(window.lastSuiteSubTabType) !== -1)
	{
		activeTabKey = window.lastSuiteSubTabType;
	}
	function navClass(key, extra)
	{
		return "nav-link"+(extra ? " "+extra : "")+(activeTabKey === key ? " active" : "");
	}
	function paneClass(key, extra)
	{
		return "tab-pane fade"+(extra ? " "+extra : "")+(activeTabKey === key ? " show active" : "");
	}
	var ulClass = "nav nav-tabs"+(rememberActiveTab ? " rememberSuiteSubTabs" : "");

	var tabs = '<li class="nav-item"><a style="float:left; width: 85%;" class="'+navClass("floorplan", "featureSheetLI")+'" data-bs-toggle="tab" data-tabtype="floorplan" href="#floorplan-'+uid+'">Floorplans</a></li>';
	var content = '<div class="'+paneClass("floorplan", "floorPlanImageDisplay")+'" id="floorplan-'+uid+'">';
		//content += "<span class='overlay' onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '', '', '"+idtsuite+"', 'Yes');\"><i class='fa fa-search'></i></span>";
		content += "<img class='hover-zoom-img' onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '', '', '"+idtsuite+"', 'Yes');\" src='"+imagePath+"' width='96%'/>";
		ln++;
		if(suiteDescription != null && suiteDescription != "")
		{
			content += "<span><small>"+suiteDescription+"</small></span>";
		}

	content += '</div>';

	var tourCount = 0;
	if(virtualTourURL != null && virtualTourURL.length > 0)
		tourCount++;
	if(dgsURL != null && dgsURL.length > 0)
		tourCount++;
	tourLength = tourCount > 0 ? "("+tourCount+")" : "";
	tabs += '<li class="nav-item toursTabSelector"><a style="float:left; width: 85%; font-weight: normal !important;" class="'+navClass("Tour")+' " data-bs-toggle="tab" data-tabtype="Tour" href="#Tour-'+uid+'">Tours '+tourLength+'</a></li>';
	content += '<div class="'+paneClass("Tour")+'" id="Tour-'+uid+'">';

		//content += '<div class="d-flex justify-content-center align-items-center" style="min-height: 100%;"><div class="ratio ratio-16x9"><iframe onClick=\"openFullScreenVirtualTour()\" style="width:90%; margin-left: 5%;" src="https://360.virtournyc.com/tour/2park-6" title="2 Park Avenue Virtual Tour" allow="fullscreen; vr; xr-spatial-tracking; gyroscope; accelerometer" allowfullscreen loading="lazy" frameborder="0"></iframe></div></div>';
		if(tourCount > 0)
		{
			//3DGS/Virtual Tour link(s) on the left, "Fullscreen" on the right - same row (.tourLinksRow is
			//justify-content:space-between) instead of its own row under the 3DGS preview.
			content += '<div class="tourLinksRow">';
			if(dgsURL != null && dgsURL.length > 0)
			{
				content += buildTourLink(dgsURL, "3D Gaussian Splat", idtbldg, idtsuite, "3DGS_Click", bldgName, true);
			}
			if(virtualTourURL != null && virtualTourURL.length > 0)
			{
				content += buildTourLink(virtualTourURL, "Virtual Tour", idtbldg, idtsuite, "VirtualTour_Click", bldgName);
			}
			if(dgsURL != null && dgsURL.length > 0)
			{
				content += buildTourLink(dgsURL, "Fullscreen", idtbldg, idtsuite, "3DGS_Click", bldgName, true);
			}
			content += '</div>';

			//Small live iframe preview sized to fit the infobox; click opens the same fullscreen modal as the floorplan image.
			//Self-contained block (see buildTourPreviewTile) - safe to drop if reverted.
			if(dgsURL != null && dgsURL.length > 0)
			{
				content += buildTourPreviewTile(dgsURL, "Fullscreen", idtbldg, idtsuite, "3DGS_Click", true, bldgName, false);
			}
		}
		else
		{
			content += '<div class="d-flex justify-content-center align-items-center" style="min-height: 100%;"><div class="ratio ratio-16x9"><small>Not Available</small></div></div>';

		}

	content += '</div>';

	content += '<div class="'+paneClass("Amenities")+'" id="Amenities-'+uid+'">';

		content += buildAIAgentPanel(uid, idtbldg, idtsuite, aiAgentContextType);

	content += '</div>';

	if(hasInterior)
	{
		tabs += '<li class="nav-item"><a class="'+navClass("interior-images")+'" data-bs-toggle="tab" data-tabtype="interior-images" href="#tab-'+uid+'-interior-images">Interior</li>';
		content += '<div class="'+paneClass("interior-images", "tab-images-container")+'" id="tab-'+uid+'-interior-images">';
		$.each(window.suiteOtherImages[cityId][idtsuite]["interior-images"], function (i, row){

			content += "<img class='hover-zoom-img' onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '"+i+"', 'interior-images', '"+idtsuite+"', 'Yes');\" src='"+adminBaseUrl + row.image_path + row.image_name+"' width='96%'/>";
		});
		content += '</div>';
	}
	if(hasExterior)
	{
		tabs += '<li class="nav-item"><a class="'+navClass("exterior-images")+'" data-bs-toggle="tab" data-tabtype="exterior-images" href="#tab-'+uid+'-exterior-images">Exterior</li>';
		content += '<div class="'+paneClass("exterior-images", "tab-images-container")+'" id="tab-'+uid+'-exterior-images">';
		$.each(window.suiteOtherImages[cityId][idtsuite]["exterior-images"], function (i, row){

			content += "<img class='hover-zoom-img' onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '"+i+"', 'exterior-images', '"+idtsuite+"', 'Yes');\" src='"+adminBaseUrl + row.image_path + row.image_name+"' width='96%' />";

		});
		content += '</div>';
	}


	content += '<div class="'+paneClass("files", "tab-images-container")+'" id="tab-'+uid+'-files">';

	//content += "<li class=\"list-group-item d-flex justify-content-between align-items-center\">";
	//content += "<img onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '', '', '"+idtsuite+"', 'Yes');\" src='"+imagePath+"' width='96%'/>";
		content += '<ul class="list-group file-list">';
		content += '<li class="list-group-item d-flex justify-content-between align-items-center"><a href="index.php?floorplan=1&id='+idtsuite+'" >Floorplan for floor '+floorNumber+'</a></li>';
	content += "";
	//content += "</li>";

		if(typeof window.suiteOtherImages[cityId][idtsuite] != "undefined" && typeof window.suiteOtherImages[cityId][idtsuite]["files"] != "undefined")
		{
				$.each(window.suiteOtherImages[cityId][idtsuite]["files"], function (i, row){
					content += '<li class="list-group-item d-flex justify-content-between align-items-center"><a href="'+getURLForFiles(row)+'?id='+row.aos_document_id2+'" target="'+getTargetForFiles(row)+'">'+row.filename+' ('+displayFileSize(row.filesize)+')</a></li>';
					ln++;
				});
		}
		content += '</ul>';

	tabs += '<li class="nav-item"><a class="'+navClass("files")+'" data-bs-toggle="tab" data-tabtype="files" href="#tab-'+uid+'-files">Files ('+ln+')</li>';

	if(disableAmenitiesTab)
	{
		tabs += '<li class="nav-item"><a style="float:left; width: 85%; font-weight: normal !important;" class="nav-link disabled disabledEffectsLI" tabindex="-1" aria-disabled="true" href="javascript:void(0);">AI Agent</a></li>';
	}
	else
	{
		tabs += '<li class="nav-item"><a style="float:left; width: 85%; font-weight: normal !important;" class="'+navClass("Amenities")+'" data-bs-toggle="tab" data-tabtype="Amenities" href="#Amenities-'+uid+'">AI Agent</a></li>';
	}

	content += '</div>';

	tabs += '<li class="ms-auto featureSheetTab"><span style="cursor:pointer;" class="featureSheetImage toggle-icon ms-2" data-target="#floorplan-'+uid+'" onclick="toggleFloorplan(this, event)">';
	var display = " style='display:block;' ";
	if(window.featureFloorPlanCollapsed)
	{
		//images/Collapse.png
		//./images/Expand.png
		tabs += '<img src="images/Collapse.png" class="featureSheetToggleIcon" alt="Toggle" width="40px" height="25px">';
		display = " style='display:block;' ";
	}
	else
	{
		tabs += '<img src="images/Expand.png" class="featureSheetToggleIcon" alt="Toggle" width="40px" height="25px">';
		display = " style='display:none;' ";
	}
	tabs += '</span></li>';

	return "<ul class='"+ulClass+"' id='subTabs-"+uid+"'>"+tabs+"</ul><div class='nav-tab-content mt-2' "+display+">"+content+"</div>";
}

//Remembers which sub-tab (Floorplans/Tours/Interior/Exterior/Files/Amenities) was last opened, scoped to
//prepareAvailableOfficeSpaceInfobox via the rememberSuiteSubTabs class (see rememberActiveTab param above),
//so the next suite clicked opens on the same tab instead of always defaulting back to Floorplans.
$(document).on('shown.bs.tab', 'ul.rememberSuiteSubTabs a[data-bs-toggle="tab"]', function(){
	window.lastSuiteSubTabType = $(this).data("tabtype");
});

//Tracks whether the Tours sub-tab (small Virtual Tour/3DGS preview) is the currently active suite sub-tab,
//reset whenever any other sub-tab is selected. Applies to every suite tab group, not just AOS.
window.toursTabSelected = false;
$(document).on('shown.bs.tab', 'ul[id^="subTabs-"] a[data-bs-toggle="tab"]', function(){
	window.toursTabSelected = ($(this).data("tabtype") === "Tour");
});

function displayFileSize(bytes) {
	const KB = 1024;
	const MB = KB * 1024;

	if (bytes < KB) {
		return `${bytes} Bytes`;
	} else if (bytes < MB) {
		const sizeInKB = (bytes / KB).toFixed(0); // Two decimal places
		return `${sizeInKB} KB`;
	} else {
		const sizeInMB = (bytes / MB).toFixed(0); // Two decimal places
		return `${sizeInMB} MB`;
	}
}

function prepareInfoboxForFiles(idtbldg, floorNumber)
{
	var suiteWiseData = [];
	var suiteNames = [];
	suiteCntr = -1;
	$.each(buildingFiles[idtbldg][floorNumber], function (ind, eachFile){
		if(typeof suiteWiseData[eachFile.suite_name] == "undefined")
		{
			suiteCntr++;
			suiteWiseData[suiteCntr] = [];
			suiteNames.push(eachFile.suite_name);
		}
		suiteWiseData[suiteCntr].push(eachFile);
	});
	console.log(suiteWiseData);
	var st = "<table>";
	st += "<tr><th>Suite</th><th>Files</th></tr>";
	$.each(suiteWiseData, function (suiteNameCntr, rows){
		firstRow = true;
		$.each(rows, function (i2, eachFile){
			if(firstRow)
				st += "<tr><td rowspan='"+rows.length+"'>"+suiteNames[suiteNameCntr]+"</td><td><a href='"+getURLForFiles(eachFile)+"?id="+eachFile.aos_document_id+"' target='"+getTargetForFiles(eachFile)+"'>"+eachFile.filename+" ("+displayFileSize(eachFile.filesize)+")</a></td></tr>";
			else
				st += "<tr><td><a href='"+getURLForFiles(eachFile)+"?id="+eachFile.aos_document_id+"' target='"+getTargetForFiles(eachFile)+"'>"+eachFile.filename+" ("+displayFileSize(eachFile.filesize)+")</a></td></tr>";
			firstRow = false;
		});
	});
	st += "</table>";
	$("#infoboxFloorPlanRow").html(st);
	$("#infoboxFloorPlanRow").show();
}

function toggleFloorplan(el, event) {
    event.stopPropagation(); // prevent tab switching
    if($(".nav-tab-content").css("display") == "block")
	{
		$(".nav-tab-content").css("display", "none");
		$(".featureSheetToggleIcon").attr("src", "images/Expand.png");
		window.featureFloorPlanCollapsed = false;
	}
	else
	{
		$(".nav-tab-content").css("display", "block");
		$(".featureSheetToggleIcon").attr("src", "images/Collapse.png");
		window.featureFloorPlanCollapsed = true;
		$(".floorPlanImageDisplay").addClass("active");
		$(".featureSheetLI").addClass("active");
	}
}

/*
function toggleFloorplan(el, event) {
    event.stopPropagation(); // prevent tab switching
    const targetSelector = el.getAttribute("data-target");
    const target = document.querySelector(targetSelector);
    const iconImg = el.querySelector("img");

    if (target.style.display === "none" || target.style.display === "") {
        target.style.display = "block";
        iconImg.src = "images/Collapse.png";
		window.featureFloorPlanCollapsed = true;
    } else {
        target.style.display = "none";
        iconImg.src = "images/Expand.png";
		window.featureFloorPlanCollapsed = false;
    }
}
*/

function OnChangeOpacity() {
  var opacity = $("#opacity").val();
  $("#opacityText").val(opacity);
  UpdateTransparency(opacity);
}

async function UpdateTransparency(opacity) {
  var color = "rgba(255,255,255," + opacity + ")";
  if (googleTileset != null && typeof googleTileset != "undefined") {
    googleTileset.style = new Cesium.Cesium3DTileStyle({
      color: color,
	  show: true
    });
  } else {
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: color,
    });
  }
}

async function TransparencyAnimationFadeIn() {
  var i = 0;
  var opacity = parseFloat($("#opacity").val());
  var refreshIntervalId = window.setInterval(function () {
    UpdateTransparency(i);
    i = (i + 0.05).toFixed(2);
    i = Number(i);
    if (i > opacity) {
      clearInterval(refreshIntervalId);
      i = 0;
    }
  }, 150);
}

async function TransparencyAnimationFadeOut() {
  var i = 1.0;
  var refreshIntervalId = window.setInterval(function () {
    UpdateTransparency(i);
    i = (i - 0.05).toFixed(2);
    i = Number(i);
    if (i < 0) {
      clearInterval(refreshIntervalId);
      i = 1.0;
    }
  }, 150);
}

function prepareBuilding(data)
{
	//console.log(data);
	if(typeof data != "undefined" && typeof data.floors != "undefined")
		$("#selectedBuildingFloors").html(data.floors);
	//$("#selectedBuildingAltitude").html("");
}

function saveCityCamera(cameratype = "")
{
	var camValues = getCameraValues();
	////console.log(camValues);
	var idtcity = lastCityLoaded;
	var actualAltitude = camValues.altitude - cameraAltitudeAdjustment;
	////console.log("actualAltitude "+actualAltitude);
	$.ajax({
	  method: "POST",
	  url: "../visgrid-tools/controller/cityAndSubmarketController.php",
	  data: { param : "saveCityCameraDetails" , "idtcity" : idtcity, "altitudeadjust": cameraAltitudeAdjustment, "cameratype" : cameratype, "latitude" : camValues.latitude, "longitude" : camValues.longitude, "altitude" : actualAltitude, "heading" : camValues.heading, "pitch" : camValues.pitch, "tilt" : camValues.tilt, "roll" : camValues.roll, "updatedBy" : updatedBy, "updatedByName" : updatedByName}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			//console.log(data);
			//$("#cameraModal").modal("hide");
			//$("#cameraModalNotification").html("Camera Saved!");
			//setTimeout(function(){ $("#cameraModalNotification").html(""); }, 3000);
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function saveCityCameraRotation(cameratype = "")
{
	var mktDetail = [];
	cameraIdToSave = 0;
	if(typeof window.citiesWithMultipleMarket[lastCityLoaded] == "undefined")
	{
		$.each(marketDetails, function (index, row){
			if(row.idtcity == lastCityLoaded && cameraIdToSave == 0)
			{
				mktDetail = row;
				cameraIdToSave = mktDetail.skylineidtcamera;
			}
		});
	}
	else
	{
		console.log("In Else for City With Multiple Markets !!! ");
		$.each(marketDetails, function (index, row){
			console.log(row.idtmarket+" == "+lastMarketLoaded);
			if(row.idtmarket == lastMarketLoaded && cameraIdToSave == 0)
			{
				mktDetail = row;
				cameraIdToSave = mktDetail.marketcamera;
			}
		});
	}
	
	var latLonDetails = getMapCenterV2();
	$.ajax({
	  method: "POST",
	  url: "../visgrid-tools/controller/cityAndSubmarketController.php",
	  data: { param : "saveCitySkylineCameraRotationDetails" , "idtcamera" : cameraIdToSave, "longitude" : latLonDetails[0], "latitude" : latLonDetails[1], "altitude" : latLonDetails[2], "updatedByName" : ""}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			alert("City Orbit Camera saved!");
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function saveBuildingCameraRotation()
{
	var idtcam = TempBldgData[parseInt(devSelectedBuilding)].idtcamera;
	var latLonDetails = getMapCenterV2();
	$.ajax({
	  method: "POST",
	  url: "../visgrid-tools/controller/cityAndSubmarketController.php",
	  data: { param : "saveCitySkylineCameraRotationDetails" , "idtcamera" : idtcam, "longitude" : latLonDetails[0], "latitude" : latLonDetails[1], "altitude" : latLonDetails[2], "updatedByName" : ""}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			//console.log(data);
			//console.log("Camera Rotation details saved!");
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

//Camera Rotation2
var activeTool = [];
var goPoint2Btn = false;
var IsStartPoint2 = false;
var IsRotation2Pause = false;
function ToggleCameraRotationForPoint2() {
  /*
  if (!activeTool.includes("goPoint2Btn")) {
    activeTool.push("goPoint2Btn");
  }
  if (IsAnyActiveControl()) {
    //activeTool.splice(activeTool.indexOf("goPoint2Btn"), 1);
    return;
  }
  */
  if (goPoint2Btn) {
    if (IsStartPoint2) {
      return;
    }
    goPoint2Btn = false;
    IsRotation2Pause = false;
    StopCameraRotation();
    //ResetPoint2();
    $("#goPoint2 i").attr("class", "fa-solid fa-2 defaultIconColor");
    $("#goPoint2").css("border-color", "white");
    //activeTool.splice(activeTool.indexOf("goPoint2Btn"), 1);
  } else {
    goPoint2Btn = true;
    goPoint2();
    $("#goPoint2 i").attr("class", "fa-solid fa-pause bActive");
    $("#goPoint2").css("border-color", "red");
  }
}

function goPoint2() {
  IsStartPoint2 = true;
  if (!IsRotation2Pause) {
	  //console.log("Fly To Building");
	  flyToBuildingCamera(devSelectedBuilding);
	  setTimeout(function (){CameraRotationForPoint2(), 4000});
	  IsRotation2Pause = true;
	  
    /* viewer.camera.flyTo({
      destination: new Cesium.Cartesian3(
        -1638741.4578482977,
        -3669339.2936654044,
        4938053.727241625
      ),
      orientation: {
        heading: 3.9075128816414213,
        pitch: -0.6034600597657498,
        roll: 6.283185050204488,
      },
      complete: CameraRotationForPoint2,
      duration: 4,
    }); */
  } else {
	//console.log("Cam Rotation 2");
    CameraRotationForPoint2();
  }
}

function StopCameraRotation() {
  unsubscribe();
  viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function CameraRotationForPoint2() {
  IsStartPoint2 = false;
  var latLonDetails = getMapCenterV2();
  //console.log("latLonDetails To Rotate around", latLonDetails);
  currentPosition = Cesium.Cartesian3.fromDegrees(
	  latLonDetails[0],
	  latLonDetails[1],
	  latLonDetails[2]
  );
  /*
  currentPosition = new Cesium.Cartesian3(
    -1639060.3187922465,
    -3669261.766359854,
    4937593.194043974
  );
  */
  var pitch = viewer.camera.pitch;
  heading = viewer.scene.camera.heading;
  unsubscribe = viewer.clock.onTick.addEventListener(() => {
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    elevation = Cesium.Cartesian3.distance(currentPosition, viewer.scene.camera.position);

    const SMOOTHNESS = 1450; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
  });
}

function initiateEffectsArray()
{
	window.effectsArray = [];
	window.effectsArray[0] = 0;//Isolate on Dark
	window.effectsArray[1] = 0;//Spotlight
	window.effectsArray[2] = 0;//Highlight
	window.effectsArray[3] = 0;//Suites
	window.effectsArray[4] = 0;//Floors
	window.effectsArray[5] = 0;//Assets
	
	window.effectsArray[6] = 0;//Isolate on Satellite
	
	window.effectsArray[7] = 0;//Floor Plan
	
	window.effectsArray[8] = 0;//Clip Effect
	
	window.effectsArray[9] = 0;//Isolate with Labels
	window.effectsArray[10] = 0;//Isolate On White
	
	window.cameraValues = [];
	
	window.lastFloor = 0;
	
	window.lastSuite = null;
}

window.currentURL = "";
window.showLogosFlag = "";
window.tabYearSelected = null;
function updateURL(isResetCamera = false)
{
	if(typeof effectsArray == "undefined")
	{
		initiateEffectsArray();
	}
	window.currentURL = window.location.origin+window.location.pathname+"?city="+lastCityLoaded+"&market="+lastSelectedBuildingType+"&marketId="+lastMarketLoaded;
	//Additional URL parameters
	if(lastSelectedBuilding != null)
	{
		window.currentURL += "&lastId="+lastSelectedBuilding;	
		window.currentURL += "&effects="+encodeURIComponent(JSON.stringify(effectsArray));
	}
	if(window.lastSelectedSuite != null)
	{
		window.currentURL += "&lastSuiteId="+window.lastSelectedSuite;
	}
	if(window.lastFloor != 0)
	{
		window.currentURL += "&lastFloor="+window.lastFloor;
	}
	if(window.lastSuite != null)
	{
		window.currentURL += "&lastSuite="+window.lastSuite;
	}
	if(window.lastSuiteId != null)
	{
		window.currentURL += "&lastSuiteId="+window.lastSuiteId	;
	}
	if(window.showLogosFlag != null && window.showLogosFlag != "")
	{
		window.currentURL += "&showLogos=1";
	}
	if(window.tabYearSelected != null)
	{
		window.currentURL += "&year="+window.tabYearSelected;
	}
	if(window.dgsFullScreenActive)
	{
		window.currentURL += "&dgsFullScreen=1";
	}
	if(window.floorplanFullScreenActive)
	{
		window.currentURL += "&floorplanFullScreen=1";
	}
	if(window.statsTableExpanded)
	{
		window.currentURL += "&statsExpanded=1";
	}
	// Which map overlay is on (mutually exclusive - see applyOverlayMode()): w = white, d = dark.
	if(typeof darkOverlayEffectActive != "undefined" && darkOverlayEffectActive)
		window.currentURL += "&overlay=d";
	else if(typeof whiteOverlayEffectActive != "undefined" && whiteOverlayEffectActive)
		window.currentURL += "&overlay=w";
	// Submarket boundaries toggle - only meaningful in the Office visualization.
	if(window.allSubmarketBoundariesShown && lastSelectedBuildingType == "Office")
		window.currentURL += "&submBoundary=1";

	window.cameraValues = [];
	if(!isResetCamera)
	{
		if(typeof getCameraValues != "undefined")
		{
			var tempCam = getCameraValues();
			window.cameraValues[0] = tempCam.latitude;//Lat
			window.cameraValues[1] = tempCam.longitude;//Lon
			window.cameraValues[2] = parseInt(tempCam.altitude) - parseInt(cameraAltitudeAdjustment);//Alt
			window.cameraValues[3] = tempCam.heading;//Heading
			window.cameraValues[4] = tempCam.pitch;//Pitch
			window.cameraValues[5] = tempCam.roll;//Roll;
		}
	}
	/*
	if(isNaN(window.cameraValues[2]) || window.cameraValues[2] == null)
	{
		window.cameraValues == [];
	}
	*/
	////console.log("Camera Values", window.cameraValues);
	window.currentURL += "&cam="+encodeURIComponent(JSON.stringify(cameraValues));
	if(lastCityLoaded == null)
		window.currentURL = window.location.origin+window.location.pathname;
	window.history.pushState("page","app10", window.currentURL);
}
/*
var newUrl = updateQueryStringParameter(window.location.href, "i", data.buildingData.idtbuilding);
//console.log("newURL : " + newUrl);
//window.history.pushState("page","PropSee", "?s="+(parseInt(chapterId) + 1)+"-"+step);
window.history.pushState("page","PropSee", newUrl);

function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}
*/


function toggleSummaryInfobox()
{
	// Size of browser viewport.
	//alert("viewport "+$(window).height()+", "+$(window).width());

	// Size of HTML document (same as pageHeight/pageWidth in screenshot).
	//alert("document "+$(document).height()+", "+$(document).width());
	
	if($(".chevronIconContaier").hasClass("opened"))
	{
		$(".chevronIconContaier").removeClass("opened");
		$(".chevronIconContaier").addClass("closed");
		$(".summaryInfoboxContainerData").hide();
		$(".infoboxContainer").hide();
		$("#infoboxFloorPlanRow").hide();
		$(".summaryInfoboxContainer").css("padding-bottom", "10px !important");
		$(".chevronIconContaier").html('<img src="./images/Expand.png" style="margin-bottom: 2px;" width="40px" height="25px" onClick="toggleSummaryInfobox();"/>');
	}
	else
	{
		$(".summaryInfoboxContainerData").show();
		if(devSelectedBuilding != null)
			$(".infoboxContainer").show();
		if(lastSelectedBuildingType == "Floorplan" && devSelectedBuilding != null)
		{
			$("#infoboxFloorPlanRow").show();
		}
		$(".summaryInfoboxContainer").css("padding-bottom", "0px !important");
		$(".chevronIconContaier").addClass("opened");
		$(".chevronIconContaier").removeClass("closed");
		$(".chevronIconContaier").html('<img src="./images/Collapse.png" style="margin-bottom: 2px;" width="40px" height="25px" onClick="toggleSummaryInfobox();"/>');
	}
}

window.marketAutosuggestBuildings = null;
function loadBuildingForAutoSuggest(marketId)
{
	if(window.marketAutosuggestBuildings == null)
	{
		$.ajax({
			method: "POST",
			url: "controllers/buildingController.php",
			data: { param : "getMarketBuildingsForAutosuggest", marketId: marketId}
		}).done(function (data) {
			data = $.parseJSON( data.trim() );
			//console.log(data);
			searchBuildingData = data.data;
			window.marketAutosuggestBuildings = searchBuildingData.length;
		});
	}
}

window.calgaryOfficeSale = null;
window.calgaryOfficeSaleSummary = null;
window.calgaryOfficeSaleSummaryAll = null;
window.calgaryOfficeSalePrimitives = [];
window.investmentSalesColors = [];
function getMarketSalesDataCalgary()
{
	if(window.calgaryOfficeSale == null || window.calgaryOfficeSale.length == 0)
	{
		$.ajax({
			method: "POST",
			url: "controllers/buildingController.php",
			data: { param : "getMarketSalesDataCalgary", idtcity: lastCityLoaded, idtmarket: lastMarketLoaded}
		}).done(function (data) {
			data = $.parseJSON( data.trim() );
			//console.log(data);
			window.calgaryOfficeSale = data.data;
			window.calgaryOfficeSaleYearWise = data.yearWiseData;
			window.calgaryOfficeSaleSummary = data.summary;
			//window.calgaryOfficeSaleSummary.sort((a, b) => b[0] - a[0]);
			window.calgaryOfficeSaleSummaryAll = data.allSummary;
			window.investmentSalesColors = data.investmentSalesColors;
			if(defaultTabYearSelected == null || defaultTabYearSelected == "")
				defaultTabYearSelected = "All";
			highlightCalgaryOfficeMarketSales(defaultTabYearSelected);
			createSummaryInfoboxForCalgaryOfficeMarketSales();
			
			eventsToExecuteAfterLoadingData();
		});
	}
	else
	{
		highlightCalgaryOfficeMarketSales("All");
		createSummaryInfoboxForCalgaryOfficeMarketSales();
		
		eventsToExecuteAfterLoadingData();
	}
}

window.availableOfficeSpace = null;
let companyLogoImages = [];
window.totalOfficeAreaForVacancy = null;
window.availableOfficeSpaceImproved = [];
window.availableOfficeSpaceFloorWise = [];
window.availableOfficeSpaceSummary = null;
window.availableOfficeSpaceLastRecordDate = null;
window.availableOfficeSpacePrimitives = [];
window.availableOfficeSpaceLoadedForMarket = null;
function getAvailableOfficeSpace(highlight = true)
{
	if(window.availableOfficeSpace == null || window.availableOfficeSpace.length == 0 || window.availableOfficeSpaceLoadedForMarket != lastMarketLoaded)
	{
		$.ajax({
			method: "POST",
			url: "controllers/suiteController.php",
			data: { param : "getAvailableOfficeSpaceDetails", idtmarket: lastMarketLoaded}
		}).done(function (data) {
			window.availableOfficeSpaceImproved = [];
			window.availableOfficeSpaceFloorWise = [];
			data = $.parseJSON( data.trim() );
			//console.log(data);
			window.availableOfficeSpace = data.data;
			window.availableOfficeSpaceLoadedForMarket = lastMarketLoaded;
			$.each(window.availableOfficeSpace, function (i2, r2){
				if(typeof window.availableOfficeSpaceImproved[r2.idtbuilding] == "undefined")
					window.availableOfficeSpaceImproved[r2.idtbuilding] = [];
				if(typeof window.availableOfficeSpaceFloorWise[r2.idtbuilding] == "undefined")
					window.availableOfficeSpaceFloorWise[r2.idtbuilding] = [];
				window.availableOfficeSpaceImproved[r2.idtbuilding].push(r2.idtsuite);
				if(typeof window.availableOfficeSpaceFloorWise[r2.idtbuilding][parseInt(r2.floor_number)] == "undefined")
					window.availableOfficeSpaceFloorWise[r2.idtbuilding][parseInt(r2.floor_number)] = [];
				window.availableOfficeSpaceFloorWise[r2.idtbuilding][parseInt(r2.floor_number)].push(r2);
				if(typeof TempBldgData[r2.idtbuilding] == "undefined")
					TempBldgData[r2.idtbuilding] = r2;
			});
			window.availableOfficeSpaceSummary = data.summaryDetails;
			window.suiteOtherImages[lastCityLoaded] = data.suiteOtherImages;
			window.totalOfficeAreaForVacancy = data.totalOfficeArea;
			window.availableOfficeSpaceLastRecordDate = data.lastRecordDate;
			companySummaryDetails[lastMarketLoaded] = data.companySummary;
			//A building infobox opened before this data arrived (e.g. straight after a text
			//search) would have rendered "Floorplans" with no count - fix it up now.
			refreshInfoboxFloorplanButton();
			if(highlight)
			{
				highlightAvailableOfficeSpace();
				createSummaryInfoboxForAvailableOfficeSpace();
			}
		});
	}
	else if(highlight)
	{
		highlightAvailableOfficeSpace();
		createSummaryInfoboxForAvailableOfficeSpace();
	}
}


window.cityFloorPlan = [];
window.cityBuildingDetails = [];
window.cityFloorPlanSummary = [];
window.cityFloorPlanPrimitives = null;
window.suiteOtherImages = [];
function getFloorPlansForCity(idtcity)
{
	if(typeof idtcity == "undefined")
		return "";
	
	if(typeof window.cityFloorPlan == "undefined" || window.cityFloorPlan == null )
	{
		window.cityFloorPlan = [];
	}
	if(typeof window.cityFloorPlan[idtcity] == "undefined")
	{
		window.cityFloorPlan[idtcity] = [];
	}
	if(typeof window.cityFloorPlanSummary[idtcity] == "undefined")
	{
		window.cityFloorPlanSummary[idtcity] = [];
	}
	if(window.cityFloorPlan[idtcity] == null || window.cityFloorPlan[idtcity].length == 0)
	{
		window.cityFloorPlan[idtcity] = [];
		$.ajax({
			method: "POST",
			url: "controllers/suiteController.php",
			data: { param : "getCityFloorplanDetails", idtcity: idtcity}
		}).done(function (data) {
			data = $.parseJSON( data.trim() );
			//console.log(data);
			window.cityFloorPlan[idtcity] = data.floorplanDetails;
			window.cityFloorPlanSummary[idtcity] = data.summaryDetails;
			window.suiteOtherImages[idtcity] = data.suiteOtherImages;
			$.each(data.floorplanDetails, function (idtbldg, row){
				if(typeof idtbldg != "undefined" && typeof row != "undefined")
				{
					window.floorPlanDetails[idtbldg] = row;
				}
			});
			
			window.cityBuildingDetails[idtcity] = data.floorDetails;
			/*
			if(typeof window.cityFloorPlanSummary[idtcity] == "undefined")
			{
				window.cityFloorPlanSummary[idtcity] = [];
			}
			//window.cityFloorPlanSummary[idtcity] = data.summary;
			*/

			highlightCityFloorplans(idtcity);
			createSummaryInfoboxForCityFloorplans(idtcity);
			
			eventsToExecuteAfterLoadingData();
		});
	}
	else
	{
		highlightCityFloorplans(idtcity);
		createSummaryInfoboxForCityFloorplans(idtcity);
		
		eventsToExecuteAfterLoadingData();
	}
}

function highlightCityFloorplans(idtcity)
{
	clearCityFloorplans();
	
	viewer.entities.removeById("FogEffectEntity");debugger;
	viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	if(typeof cityBoundaries[idtcity] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[idtcity]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	
	updateURL();
	ShowLegend();
	if(typeof window.cityFloorPlanPrimitives == "undefined")
	{
		window.cityFloorPlanPrimitives = [];
	}
	defaultShow = true;
	window.lastHolesString = '';
	$.each(window.cityFloorPlan[idtcity], function (idtbldg, eachBuilding){
		if(typeof eachBuilding != "undefined")
		{
			floorDetails = window.cityBuildingDetails[idtcity][idtbldg].floorDetails;
			
			
			//console.log("floorDetails", floorDetails);
			if(typeof window.cityBuildingDetails[idtcity][idtbldg].altitude != "undefined")
			{
				var floorHeight = (window.cityBuildingDetails[idtcity][idtbldg].altitude / window.cityBuildingDetails[idtcity][idtbldg].floors);
				if(floorHeight < 2 || floorHeight > 8)
				var floorHeight = 4;
			}
			
			lastFloorHeight = cityAltitudeAdjustment[lastCityLoaded];
			if(window.cityBuildingDetails[idtcity][idtbldg].basefloorheight != null)
				lastFloorHeight += parseFloat(window.cityBuildingDetails[idtcity][idtbldg].basefloorheight);
			$.each(floorDetails, function(i, eachFloor){
				var loopFloorHt = floorHeight;
				if(eachFloor.floor_height != null && parseFloat(eachFloor.floor_height) > 0)
				{
					loopFloorHt = parseFloat(eachFloor.floor_height);
				}
				if(typeof eachBuilding[eachFloor.number] != "undefined" && eachBuilding[eachFloor.number].length > 0 && typeof window.cityBuildingDetails[idtcity][idtbldg].bldgclass != "undefined")
				{
					if(defaultFloorSelected != 0 && defaultFloorSelected == eachFloor.number)
					{
						clr = Cesium.Color.fromCssColorString(classColor[window.cityBuildingDetails[idtcity][idtbldg].bldgclass]).withAlpha(0.7);
					}
					else
					{
						clr = Cesium.Color.fromCssColorString(classColor[window.cityBuildingDetails[idtcity][idtbldg].bldgclass]).withAlpha(0.5);
					}
					
					
					
					
					////console.log(id+"\n"+height+"\n"+extrudedHeight+"\n"+description+"\n"+coords);
					var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+eachBuilding[eachFloor.number][0].coords+"]"))
							  ),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + loopFloorHt,
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
								show : new Cesium.ShowGeometryInstanceAttribute(defaultShow)
							},
							id: "floorPlanEntity-"+idtbldg+"-"+eachFloor.number
						}),
						classificationType : Cesium.ClassificationType.BOTH,
					}));
					window.floorPlanPrimitivesIndexes.unshift({"id": "floorPlanEntity-"+idtbldg+"-"+eachFloor.number, "primitiveindex" : window.floorPlanPrimitives.length } );
					window.floorPlanPrimitives.push(ent);
					if(defaultFloorSelected != 0 && defaultFloorSelected == eachFloor.number)
					{
						selectedPrimitive = ent;
						selectedPrimitiveId = "floorPlanEntity-"+idtbldg+"-"+eachFloor.number;
						
						$("#infoboxFloorPlanRow").show();
						var details = window.floorPlanDetails[idtbldg][defaultFloorSelected];
						prepareFloorPlanInInfobox(idtbldg, defaultFloorSelected, details);
						
						$(".floorNumberRowTR").show();
						$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+defaultFloorSelected+")</span></b>");
						
						defaultFloorSelected = 0;
					}
				}
				lastFloorHeight = lastFloorHeight + loopFloorHt;
			});
		}			
	});
	
	executeDefaultEffectsAndCamera();
}

function clearCityFloorplans()
{
	if(window.floorPlanPrimitives != null && window.floorPlanPrimitives.length > 0)
	for(var i = 0; i < window.floorPlanPrimitives.length; i++)
	{
		window.floorPlanPrimitives[i].destroy();
	}
	window.floorPlanPrimitives = [];
}

window.ArealyticsSuites = null;
window.ArealyticsSuiteSummary = null;
window.ArealyticsSuitePricePerSQMSummary = null;
window.ArealyticsSuitePrimitives = null;
function getSydneyArealyticsSuites(type = "LeaseType") {
	if(window.ArealyticsSuites == null)
		window.ArealyticsSuites = [];
	if(window.ArealyticsSuites.length == 0)
	{
		if(typeof window.ArealyticsSuitePricePerSQMSummary == "undefined")
			window.ArealyticsSuitePricePerSQMSummary = [];
		$.ajax({
			method: "POST",
			/*
			url: "getArealyticsSuiteData.php",
			data: {  },
			*/
			url: "arealyticSuiteData.json",
			data: { }
		}).done(function (data) {
			//data = $.parseJSON( data) );
			////console.log(data);
			window.ArealyticsSuites = data.data;
			window.ArealyticsSuiteSummary = data.summary;
			window.ArealyticsSuitePricePerSQMSummary = data.pricePerSQMSummary;
			if(typeof window.improvedSuites == "undefined")
				window.improvedSuites = [];
			if(typeof window.improvedSuitesIndexes == "undefined")
				window.improvedSuitesIndexes = [];
			//$(".legendContainer").css("display", "block");
			//CreateFloorVisualizationLegend();
			if(window.ArealyticsSuitePrimitives == null)
				window.ArealyticsSuitePrimitives = [];
			
			
			var allPricePerSQM = [];
			
			$.each(window.ArealyticsSuites, function(i, eachSuite){
				if(!allPricePerSQM.includes(parseFloat(eachSuite.PricePerSQM)))
				{
					////console.log(parseFloat(eachSuite.PricePerSQM));
					allPricePerSQM.push(parseFloat(eachSuite.PricePerSQM));
				}
				////console.log(improvedSuitesIndexes.indexOf(eachSuite.idtbuilding+"-"+eachSuite.FloorNumber));
				if(improvedSuitesIndexes.indexOf(eachSuite.idtbuilding+"-"+eachSuite.FloorNumber) == -1)
				{
					improvedSuitesIndexes.push(eachSuite.idtbuilding+"-"+eachSuite.FloorNumber);
					improvedSuites[(improvedSuitesIndexes.length - 1)] = [];
					improvedSuites[(improvedSuitesIndexes.length - 1)].push(eachSuite);
				}
				else
				{
					var index = improvedSuitesIndexes.indexOf(eachSuite.idtbuilding+"-"+eachSuite.FloorNumber); // 1
					improvedSuites[index].push(eachSuite);
				}
			});
			
			////console.log("all Price Per SQM");
			////console.log(allPricePerSQM);
			if(type == "LeaseType")
			{
				createSummaryInfoboxForAvailableSpace();
				highlightSydneyArealyticsSuitesWithLeaseType();
			}
			else
			{
				createSummaryInfoboxForPricePerSQM();
				highlightSydneyArealyticsSuitesWithPricePerSQM();
			}
			
			eventsToExecuteAfterLoadingData();
		});
	}
	else
	{
		if(type == "LeaseType")
		{
			createSummaryInfoboxForAvailableSpace();
			highlightSydneyArealyticsSuitesWithLeaseType();
		}
		else
		{
			createSummaryInfoboxForPricePerSQM();
			highlightSydneyArealyticsSuitesWithPricePerSQM();
		}
		eventsToExecuteAfterLoadingData();
	}
	getSydneyArealyticsSuitesV2();
}

function getSydneyArealyticsSuitesV2() {
	if(window.ArealyticsSuites == null)
		window.ArealyticsSuites = [];
	if(window.ArealyticsSuites.length == 0)
	{
		$.ajax({
			method: "POST",
			/*
			url: "getArealyticsSuiteData.php",
			data: {  },
			*/
			url: "controllers/buildingController.php",
			data: { param : "getSydneyArealyticSuites"}
		}).done(function (data) {
			//data = $.parseJSON( data.trim() );
			////console.log(data/);
			//window.ArealyticsSuites = data.data;
			//window.ArealyticsSuiteSummary = data.summary;
		});
	}
}
getSydneyArealyticsSuitesV2();

//splitPolygonIntoPieces("151.2072874918983, -33.87510721636266, 151.20732414594522, -33.8748453587991, 151.20732804091338, -33.874832959895166, 151.20700952784293, -33.874794582174616, 151.2069402745275, -33.87484140648098, 151.20690691773524, -33.87483926301883, 151.20689703446894, -33.8748672192744, 151.20682921497996, -33.874914354618724, 151.20674396321658, -33.87488880208328, 151.20665470881144, -33.875171725018575, 151.20673582300202, -33.87518530955119, 151.20673220194848, -33.875206587673844, 151.2071308039864, -33.8752201982056, 151.2072869296806, -33.87512663469734, 151.2072874918983, -33.87510721636266", 4)
//151.20700630472368, -33.87499658894779, 151.2072874918983,-33.87510721636266  151.20732414594522,-33.8748453587991, 151.20732414594522,-33.8748453587991  151.20732804091338,-33.874832959895166, 151.20732804091338,-33.874832959895166  151.20700952784293,-33.874794582174616, 151.20700952784293,-33.874794582174616  151.2069402745275,-33.87484140648098, 151.2069402745275,-33.87484140648098  151.20690691773524,-33.87483926301883, 151.20690691773524,-33.87483926301883  151.20689703446894,-33.8748672192744, 151.20689703446894,-33.8748672192744  151.20682921497996,-33.874914354618724
function splitPolygonIntoPieces(coords, pieces, centroidCoordinates = [])
{
	var centroid = centroidCoordinates;
	if(centroidCoordinates.length == 0)
		centroid = calculateCentroid(coords);
	
	////console.log("Coords", coords);
	////console.log("centroid", centroid);
	var totalPoints = getAllPoints(coords);
	////console.log(totalPoints);
	var ptIncementer = Math.floor(totalPoints.length / pieces);
	var currentCounter = 0;
	var finalStringOfPoint = [];
	var lastPoint = "";
	starter = 0;
	for(var i = 1; i <= pieces; i++)
	{
		////console.log("Iterating "+i);
		
		var pt = [];
		var ptString = "";
		if(!isNaN(centroid.lon))
		{
			pt.push([centroid.lon, centroid.lat]);
			ptString += centroid.lon+", "+centroid.lat;
		}
		////console.log("From "+(currentCounter+ (ptIncementer * (i-1)))+"; Condition j < "+(ptIncementer * i));
		//var starter = (currentCounter+ (ptIncementer * (i-1)));
		//if(lastPoint != "" && totalPoints[starter] == )
		/*
		if(starter > 0)
			starter = starter - 1; // To continue with same point
		*/
		for(var j = starter; j < (ptIncementer * i); j++)
		{
			if(typeof totalPoints[j+1] != "undefined")
			{
				if(ptString != "")
					ptString += ", ";
				pt.push([totalPoints[j], totalPoints[j+1]]);
				ptString += totalPoints[j]+",  "+totalPoints[j+1];
				lastPoint = totalPoints[j]+",  "+totalPoints[j+1];
			}
			j++;
			starter = j;
		}
		////console.log("----------------");
		////console.log(pt);
		////console.log(ptString);
		finalStringOfPoint.push(ptString);
	}
	return finalStringOfPoint;
}

function ToggleToLeaseTypeVisualization()
{
	if(lastSelectedBuildingType == "AvailableOfficeSpace")
		return;
	clearPrimitives();
	lastSelectedBuildingType = "AvailableOfficeSpace";
	$("#marketDropdown").val(lastSelectedBuildingType);
	
	ShowLegend();
	createSummaryInfoboxForAvailableSpace();
	highlightSydneyArealyticsSuitesWithLeaseType();
}

function ToggleToPricePerSQMVisualization()
{
	if(lastSelectedBuildingType == "OfficeRentalRates")
		return;
	clearPrimitives();
	lastSelectedBuildingType = "OfficeRentalRates";
	$("#marketDropdown").val(lastSelectedBuildingType);
	
	ShowLegend();
	createSummaryInfoboxForPricePerSQM();
	highlightSydneyArealyticsSuitesWithPricePerSQM();
}

window.improvedSuites = [];
window.improvedSuitesIndexes = [];
function highlightSydneyArealyticsSuitesWithLeaseType()
{
	viewer.entities.removeById("FogEffectEntity");debugger;
	viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	if(typeof cityBoundaries[23] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[23]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	updateURL();
	ShowLegend();
	$.each(improvedSuitesIndexes, function(indexes, key){
		if(typeof improvedSuites[indexes] != "undefined")
		{
			////console.log(improvedSuites[indexes].length);
			var partialCoords = [];
			if(improvedSuites[indexes].length > 1 && improvedSuites[indexes][0].coords != null && improvedSuites[indexes][0].coords != "")
			{
				partialCoords = splitPolygonIntoPieces(improvedSuites[indexes][0].coords, improvedSuites[indexes].length);
			}
			else
			{
				partialCoords[0] = improvedSuites[indexes][0].coords;
			}
			
			$.each(improvedSuites[indexes], function (cntr, eachSuite){
				if(parseInt(eachSuite.idtbuilding) == 61784 || true)//Just for debugging
				{
					//eachSuite = improvedSuites[indexes][0];
					////console.log(eachSuite);
					floorHeight = (eachSuite.altitude / eachSuite.floors);
					if(floorHeight < 2 || floorHeight > 8)
						floorHeight = 4;
					var clr = "";
					clr = Cesium.Color.fromCssColorString(classColor[eachSuite.LeaseType]).withAlpha(0.7);
					if(defaultSuiteId != null && defaultSuiteId == eachSuite.suiteId)
					{
						clr = Cesium.Color.fromCssColorString(classColor[eachSuite.LeaseType]).withAlpha(1);
					}
					
					var baseFloorHeight = 0;
					if(!isNaN(parseFloat(eachSuite.basefloorheight)))
					{
						baseFloorHeight = parseFloat(eachSuite.basefloorheight);
					}
					if(eachSuite.floor_height != null && parseFloat(eachSuite.floor_height) > 0)
						floorHeight = parseFloat(eachSuite.floor_height);
					////console.log("-------------------" + baseFloorHeight);
					////console.log("floorHeight "+parseFloat(floorHeight));
					////console.log("floorNumber "+eachSuite.SuiteNumber+" => "+eachSuite.FloorNumber+" => "+parseFloat(eachSuite.FloorNumber));
					////console.log("Height "+(baseFloorHeight + (parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber))));
					////console.log("Extruded Height "+( baseFloorHeight + (parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)) - parseFloat(floorHeight)));
					if(isNaN(parseFloat(eachSuite.FloorNumber)))
					{
						eachSuite.FloorNumber = 1;//To Fix Levels B-1 etc types
					}
					if(!isNaN(parseFloat(eachSuite.FloorNumber)) && typeof eachSuite.FloorNumber != "undefined" && eachSuite.FloorNumber != null)
					{
						arealyticSuiteHeight[indexes] = [];
						arealyticSuiteHeight[indexes][0] = baseFloorHeight + ((parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)) - parseFloat(floorHeight));
						arealyticSuiteHeight[indexes][1] = baseFloorHeight + (parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber));
						var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
								geometryInstances : new Cesium.GeometryInstance({
									geometry : new Cesium.PolygonGeometry({
									  polygonHierarchy : new Cesium.PolygonHierarchy(
										Cesium.Cartesian3.fromDegreesArray(eval("["+partialCoords[cntr]+"]"))
									  ),
									  extrudedHeight: baseFloorHeight + ((parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)) - parseFloat(floorHeight)),
									  height: baseFloorHeight + (parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)),
									}),
									attributes : {
										//color : defaultPrimitiveHighlightColor,
										color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
										show : new Cesium.ShowGeometryInstanceAttribute(true)
									},
									id : "arealyticSuite-"+eachSuite.idtbuilding+"-"+indexes+"-"+cntr+"-"+parseInt(eachSuite.FloorNumber),
								}),
								classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
							}));
							
						window.ArealyticsSuitePrimitives.push(ent);
					}
					if(defaultSuiteId != null && defaultSuiteId == eachSuite.suiteId)
					{
						ShowInfoboxForSuite(indexes, cntr);
						selectedPrimitive = ent.primitive;
						selectedPrimitiveId = "arealyticSuite-"+eachSuite.idtbuilding+"-"+indexes+"-"+cntr;
						defaultSuiteId = null;
					}
				}
			});
		}
	});
	executeDefaultEffectsAndCamera();
	window.lastHolesString = '';
}

//Toggling a Listing Company / Listing Agent filter runs clearPrimitives()+highlightAvailableOfficeSpace(),
//which rebuilds every suite primitive from scratch. clearPrimitives() also wipes the white selection outline
//via clearPolygonOutline(), and highlightAvailableOfficeSpace() only redraws that outline for defaultSuiteId
//(set on first page load, null afterwards) - so a real, clicked selection silently loses its outline on every
//filter toggle. This re-draws the outline and re-highlights the suite's freshly created primitive from the
//tracked selection state (window.lastSuite / window.lastSuiteId), the same way a suite click does.
function reapplyAOSSelectionOutline()
{
	if(lastSelectedBuildingType != "Floorplan")
		return;
	var suiteIndex = window.lastSuite;
	var suiteId = window.lastSuiteId;
	if(suiteIndex == null || typeof suiteIndex == "undefined" || suiteId == null || typeof suiteId == "undefined")
		return;
	var details = (window.availableOfficeSpace || [])[suiteIndex];
	if(details == null || details.idtsuite != suiteId)
		return;
	//Selected suite is filtered out by the active filter - it wasn't redrawn, so there's nothing to outline.
	if(filterWithListingCompanyActive == true && details.idtcompany != listingCompanyFiltered)
		return;
	if(filterWithListingAgentActive == true && details.idtbroker != listingAgentFiltered)
		return;
	if(typeof window.suiteHeightValues[suiteId] == "undefined")
		return;

	var coords = details.coords;
	if(typeof details.updatedCoords != "undefined" && details.updatedCoords != null)
		coords = details.updatedCoords;
	else if(typeof details.splitCoords != "undefined" && details.splitCoords != null)
		coords = details.splitCoords;

	clearPolygonOutline();
	addPolygonOutlineOnTileset(coords, window.suiteHeightValues[suiteId][0], window.suiteHeightValues[suiteId][1], Cesium.Color.WHITE, details.dgs_url);
	showSelectedSuiteDGSCenterBand(details, coords);

	//Re-point the selection trackers at the newly created ClassificationPrimitive and set its fill to the
	//selected look (white, full alpha). ClassificationPrimitive attributes are only readable once the primitive
	//is ready, so retry a few times before giving up.
	var newId = "availableOfficeSpace-"+details.idtbuilding+"-"+suiteIndex+"-"+suiteId;
	var attempts = 0;
	(function highlightNewPrimitive(){
		var buildingPrims = (window.aosPrimitives && window.aosPrimitives[details.idtbuilding]) ? window.aosPrimitives[details.idtbuilding] : [];
		for(var i = 0; i < buildingPrims.length; i++)
		{
			var prim = buildingPrims[i];
			var attributes;
			try { attributes = prim.getGeometryInstanceAttributes(newId); } catch(e) { attributes = undefined; }
			if(typeof attributes == "undefined")
				continue;
			selectedPrimitive = prim;
			selectedPrimitiveId = newId;
			selectedPrimitiveColor = [attributes.color[0], attributes.color[1], attributes.color[2], attributes.color[3]];
			attributes.color = [255, 255, 255, 255];
			attributes.show = [1];
			return;
		}
		if(++attempts < 10)
			setTimeout(highlightNewPrimitive, 200);
	})();
}

function filterAOSWithListingCompany(listingCompanyId, forceLoad = false)
{
	if(forceLoad == true && listingCompanyId != listingCompanyFiltered)
	{
		filterWithListingCompanyActive = true;
		clearPrimitives(true, false, true);
		listingCompanyFiltered = listingCompanyId;
		highlightAvailableOfficeSpace();
		reapplyAOSSelectionOutline();
		$(".company-logo-image").html("<img src='"+adminBaseUrl+companyLogoImages[listingCompanyId]+"' width='150px' >");
		$(".company-logo-image").show();
		//$(".company-logo-image").removeClass("pulse-animate");
		//void $(".company-logo-image")[0].offsetWidth; // restart animation even if triggered again
		//$(".company-logo-image").addClass("pulse-animate");
		$(".brokerRow").removeClass("highlight-company-name");
		$("#companySummaryTable tr").removeClass("highlight-company-name-row");
		$(".brokerRow-"+listingCompanyId).addClass("highlight-company-name");
		$("#companySummaryTable .brokerRow-"+listingCompanyId).closest("tr").addClass("highlight-company-name-row");
		//$(".listing-company-label").css("font-weight", "bold");

		window.aosArrowKeyMode = "company";//Up/Down now navigates listing companies, until a suite is clicked
		return;
	}
	
	clearPrimitives(true, false, true);
	if(filterWithListingCompanyActive == false)
	{
		listingCompanyFiltered = listingCompanyId;
		//show floorplan
		$(".company-logo-image").html("<img src='"+adminBaseUrl+companyLogoImages[listingCompanyId]+"' width='150px' >");
		$(".company-logo-image").show();
		//$(".company-logo-image").removeClass("pulse-animate");
		//void $(".company-logo-image")[0].offsetWidth; // restart animation even if triggered again
		//$(".company-logo-image").addClass("pulse-animate");
		//$(".listing-company-label").css("font-weight", "bold");
		$(".brokerRow-"+listingCompanyId).addClass("highlight-company-name");
		$("#companySummaryTable .brokerRow-"+listingCompanyId).closest("tr").addClass("highlight-company-name-row");
		$(".listing-company-name").addClass("highlight-company-name");
	}
	else
	{
		$(".brokerRow").removeClass("highlight-company-name");
		$("#companySummaryTable tr").removeClass("highlight-company-name-row");
		$(".company-logo-image").html("");
		$(".company-logo-image").hide();
		$(".listing-company-name").removeClass("highlight-company-name");
		//$(".company-logo-image").removeClass("pulse-animate");
		//$(".listing-company-label").css("font-weight", "");
	}
	filterWithListingCompanyActive = !filterWithListingCompanyActive;
	window.aosArrowKeyMode = filterWithListingCompanyActive ? "company" : "suite";
	highlightAvailableOfficeSpace();
	reapplyAOSSelectionOutline();
	//createSummaryInfoboxForAvailableOfficeSpace();
}

//Same click-to-filter/click-again-to-clear pattern as filterAOSWithListingCompany(), but for the Listing Agent
//field on the AOS infobox - toggles the map-wide suite filter (by idtbroker) and the highlight on the clicked
//name. Like the Listing Company filter it also shows the agent's company logo (see .company-logo-image in
//filterAOSWithListingCompany()), with the agent's name drawn above it in white text with a black outline.
function filterAOSWithListingAgent(idtbroker)
{
	clearPrimitives(true, false, true);
	if(filterWithListingAgentActive == false)
	{
		listingAgentFiltered = idtbroker;
		$(".agentRow").removeClass("highlight-agent-name"); $(".agentRowDDD").removeClass("highlight-agent-name");
		$(".agentRow-"+idtbroker).addClass("highlight-agent-name");

		//Pull the agent's name + company logo off the first matching suite in availableOfficeSpace.
		var agentSuite = null;
		if(typeof availableOfficeSpace != "undefined" && availableOfficeSpace != null)
		{
			for(var i = 0; i < availableOfficeSpace.length; i++)
			{
				if(availableOfficeSpace[i].idtbroker == idtbroker)
				{
					agentSuite = availableOfficeSpace[i];
					break;
				}
			}
		}
		if(agentSuite != null && agentSuite.companyimage != null && agentSuite.companyimage != "")
		{
			var agentLogoHtml = "<div class='listing-agent-logo-name'>" + agentSuite.broker + "</div>";
			agentLogoHtml += "<img src='" + adminBaseUrl + agentSuite.companyimage + "' width='150px' >";
			$(".company-logo-image").html(agentLogoHtml);
			$(".company-logo-image").show();
		}
	}
	else
	{
		$(".agentRow").removeClass("highlight-agent-name"); $(".agentRowDDD").removeClass("highlight-agent-name");
		listingAgentFiltered = null;
		$(".company-logo-image").html("");
		$(".company-logo-image").hide();
	}
	filterWithListingAgentActive = !filterWithListingAgentActive;
	highlightAvailableOfficeSpace();
	reapplyAOSSelectionOutline();
}

function selectAdjacentListingCompany(direction)
{
	var companyRows = $("#companySummaryTable tbody tr[data-idtcompany]");
	if(companyRows.length == 0)
		return;
	var currentIndex = companyRows.index(companyRows.filter("[data-idtcompany='"+listingCompanyFiltered+"']"));
	if(currentIndex == -1)
		return;
	var newIndex = currentIndex + direction;
	if(newIndex < 0 || newIndex >= companyRows.length)
		return;
	var newCompanyId = parseInt($(companyRows[newIndex]).attr("data-idtcompany"));
	filterAOSWithListingCompany(newCompanyId, true);
}

//Backspace flips back and forth between the last two selections, strictly two-deep (a "to and fro" toggle, not a
//longer history) - kept as two independent trackers since the two contexts restore completely differently:
//  - Office/Residential/All/Hotel: whole-building selection - window.buildingBackAndForthHistory, hooked from
//    ShowInfobox(). Restoring replays what a real building click does: set devSelectedBuilding, fly the camera,
//    and do a full highlightAllBuildings() redraw (retainBuildingInfobox=true) so the previous building's primitive
//    is actually recolored/highlighted again and its infobox reopens - not just camera+infobox with no highlight.
//  - AvailableOfficeSpace: single suite/unit selection - window.aosUnitBackAndForthHistory, hooked from
//    prepareAvailableOfficeSpaceInfobox(). Restoring replays what a real suite click does: fly the camera, redraw
//    the white polygon outline via addPolygonOutlineOnTileset(), and rebuild that suite's infobox.
//window.suppressSelectionHistory guards both recorders while a Backspace-triggered restore is itself calling back
//into ShowInfobox/prepareAvailableOfficeSpaceInfobox, so replaying a selection doesn't scramble the 2-slot history.
window.suppressSelectionHistory = false;

window.buildingBackAndForthHistory = [];//up to 2 idtbuilding values, most recent first
function recordBuildingSelectionForBackAndForth(idtbuilding)
{
	if(window.suppressSelectionHistory == true || idtbuilding == null)
		return;
	if(["Office", "Residential", "All", "Hotel"].indexOf(lastSelectedBuildingType) === -1)
		return;
	idtbuilding = parseInt(idtbuilding);
	if(window.buildingBackAndForthHistory.length > 0 && window.buildingBackAndForthHistory[0] == idtbuilding)
		return;
	window.buildingBackAndForthHistory = window.buildingBackAndForthHistory.filter(function (id){ return id != idtbuilding; });
	window.buildingBackAndForthHistory.unshift(idtbuilding);
	if(window.buildingBackAndForthHistory.length > 2)
		window.buildingBackAndForthHistory.length = 2;
}

function goToPreviousBuildingSelection()
{
	if(window.buildingBackAndForthHistory.length < 2)
		return;
	var previous = window.buildingBackAndForthHistory[1];
	window.suppressSelectionHistory = true;
	devSelectedBuilding = previous;
	flyToBuildingCamera(previous);
	highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
	window.suppressSelectionHistory = false;
	recordBuildingSelectionForBackAndForth(previous);
}

window.aosUnitBackAndForthHistory = [];//up to 2 {idtbuilding, index, idtsuite}, most recent first
function recordAOSUnitSelectionForBackAndForth(idtbuilding, index, idtsuite)
{
	if(window.suppressSelectionHistory == true || idtsuite == null)
		return;
	if(window.aosUnitBackAndForthHistory.length > 0 && window.aosUnitBackAndForthHistory[0].idtsuite == idtsuite)
		return;
	window.aosUnitBackAndForthHistory = window.aosUnitBackAndForthHistory.filter(function (entry){ return entry.idtsuite != idtsuite; });
	window.aosUnitBackAndForthHistory.unshift({ idtbuilding: idtbuilding, index: index, idtsuite: idtsuite });
	if(window.aosUnitBackAndForthHistory.length > 2)
		window.aosUnitBackAndForthHistory.length = 2;
}

//Redraws the floating company-logo billboard + sqft label + connector line (ids 'imageLabel'/'areaLabel'/
//'logoConnectorLine'/'sqftConnectorLine') that a real suite click positions relative to the exact clicked 3D
//point and camera direction (see the "availableOfficeSpace" branch of the LEFT_CLICK handler in index.php).
//Backspace has no click point to work from, so this approximates it from the suite's polygon centroid instead -
//without this, those entities stay wherever they were left by whatever suite was clicked last.
function positionAOSSelectionLabels(details)
{
	viewer.entities.removeById('imageLabel');
	viewer.entities.removeById('areaLabel');
	viewer.entities.removeById('logoConnectorLine');
	viewer.entities.removeById('sqftConnectorLine');

	var coordsForCentroid = details.coords;
	if(typeof details.updatedCoords != "undefined")
		coordsForCentroid = details.updatedCoords;
	var pts = eval("["+coordsForCentroid+"]");
	var pt1 = getCentroid(pts);
	var suiteTopHeight = window.suiteHeightValues[details.idtsuite][1];
	var feature2 = Cesium.Cartesian3.fromDegrees(pt1[0], pt1[1], suiteTopHeight);

	var cameraPosition = viewer.scene.camera.positionWC;
	var direction = Cesium.Cartesian3.subtract(cameraPosition, feature2, new Cesium.Cartesian3());
	Cesium.Cartesian3.normalize(direction, direction);

	var towardCamera = Cesium.Cartesian3.multiplyByScalar(direction, 20, new Cesium.Cartesian3());
	var basePosition = Cesium.Cartesian3.add(feature2, towardCamera, new Cesium.Cartesian3());

	var towardCamera2 = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
	var basePosition2 = Cesium.Cartesian3.add(feature2, towardCamera2, new Cesium.Cartesian3());

	var up = new Cesium.Cartesian3(0, 0, 1);
	var left = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
	Cesium.Cartesian3.normalize(left, left);

	var leftOffset = Cesium.Cartesian3.multiplyByScalar(left, 40, new Cesium.Cartesian3());
	var rightOffset = Cesium.Cartesian3.multiplyByScalar(left, -5, new Cesium.Cartesian3());

	var imagePosition = Cesium.Cartesian3.add(basePosition, leftOffset, new Cesium.Cartesian3());
	var areaPosition = Cesium.Cartesian3.add(basePosition2, rightOffset, new Cesium.Cartesian3());

	var showLogo = false;
	if(isMobile.any() == null && window.desktop_logo_display == 1)
		showLogo = true;
	if(isMobile.any() != null && window.mobile_logo_display == 1)
		showLogo = true;

	if(showLogo == true)
	{
		var billboardHalfWidth = 5;
		var rightOffsetLogo = Cesium.Cartesian3.multiplyByScalar(left, -billboardHalfWidth, new Cesium.Cartesian3());
		var logoConnectorStart = Cesium.Cartesian3.add(imagePosition, rightOffsetLogo, new Cesium.Cartesian3());

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

		viewer.entities.add({
			id: 'logoConnectorLine',
			polyline: {
				positions: [logoConnectorStart, feature2],
				width: 1,
				material: Cesium.Color.WHITE,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});
	}

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
}

function goToPreviousAOSUnitSelection()
{
	if(window.aosUnitBackAndForthHistory.length < 2)
		return;
	var previous = window.aosUnitBackAndForthHistory[1];
	var details = window.availableOfficeSpace[previous.index];
	if(typeof details == "undefined" || details == null)
		return;
	var allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
	window.suppressSelectionHistory = true;
	devSelectedBuilding = parseInt(details.idtbuilding);
	window.lastSuite = previous.index;
	window.lastSuiteId = previous.idtsuite;
	flyToBuildingCamera(details.idtbuilding);
	if(typeof window.outlinePrimitives == "undefined")
		window.outlinePrimitives = [];
	clearPolygonOutline();
	var coooordss = details.coords;
	if(typeof details.updatedCoords != "undefined")
		coooordss = details.updatedCoords;
	addPolygonOutlineOnTileset(coooordss, window.suiteHeightValues[details.idtsuite][0], window.suiteHeightValues[details.idtsuite][1], Cesium.Color.WHITE, details.dgs_url);
	showSelectedSuiteDGSCenterBand(details, coooordss);
	positionAOSSelectionLabels(details);
	prepareAvailableOfficeSpaceInfobox(details.idtbuilding, previous.index, details, allSuitesOnFloor);
	//Matches the "floorNumberRowTD" update a real suite click does (index.php "availableOfficeSpace" branch) -
	//without this the label stays showing whichever suite was clicked last instead of the one Backspace jumped to.
	$("#infoboxFloorPlanRow").show();
	$(".floorNumberRowTR").show();
	$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>("+previous.index+")</span></b>");
	window.suppressSelectionHistory = false;
	recordAOSUnitSelectionForBackAndForth(details.idtbuilding, previous.index, previous.idtsuite);
}

$(document).on('keydown', function (e) {
	if(e.key != "Backspace")
		return;
	var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
	if(targetTag == "input" || targetTag == "textarea" || (e.target && e.target.isContentEditable))
		return;
	if(lastSelectedBuildingType == "Floorplan")
	{
		if(window.aosUnitBackAndForthHistory.length < 2)
			return;
		e.preventDefault();
		goToPreviousAOSUnitSelection();
	}
	else if(["Office", "Residential", "All", "Hotel"].indexOf(lastSelectedBuildingType) !== -1)
	{
		if(window.buildingBackAndForthHistory.length < 2)
			return;
		e.preventDefault();
		goToPreviousBuildingSelection();
	}
});

$(document).on('keydown', function (e) {
	if(e.key != "ArrowUp" && e.key != "ArrowDown")
		return;
	var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
	if(targetTag == "input" || targetTag == "textarea" || (e.target && e.target.isContentEditable))
		return;
	var direction = (e.key == "ArrowUp") ? -1 : 1;
	if(filterWithListingCompanyActive == true && listingCompanyFiltered != null && window.aosArrowKeyMode != "suite")
	{
		e.preventDefault();
		selectAdjacentListingCompany(direction);
	}
	else if(window.selectedSubmarketId != null)
	{
		e.preventDefault();
		selectAdjacentSubmarket(direction);
	}
});

window.aosPrimitives = [];
window.suiteHeightValues = [];
window.suiteDGSCenterBands = [];
let filterWithListingCompanyActive = false;
let listingCompanyFiltered = null;
let filterWithListingAgentActive = false;
let listingAgentFiltered = null;
window.filterWithPropertyManagerActive = false;
window.propertyManagerFiltered = null;
//Same click-to-filter/click-again-to-clear pattern as filterAOSWithListingCompany(), but for the Property
//Manager field on the (non-AOS) building infobox - dims every building in the current market whose
//idtpropertymanager doesn't match (see the clr.alpha check in highlightAllBuildings()) instead of hiding suites.
function filterBuildingsWithPropertyManager(idtpropertymanager)
{
	if(window.filterWithPropertyManagerActive == true && parseInt(window.propertyManagerFiltered) == parseInt(idtpropertymanager))
	{
		window.filterWithPropertyManagerActive = false;
		window.propertyManagerFiltered = null;
	}
	else
	{
		window.filterWithPropertyManagerActive = true;
		window.propertyManagerFiltered = idtpropertymanager;
	}
	highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, true);
	//highlightAllBuildings() already calls handleFogAfterHighlight() at its end, but it rebuilds the fog holes
	//from window.lastHolesArray/holesFragments as they stood during that same building loop - calling it again
	//here explicitly (now that dimmedByPropertyManagerFilter buildings are excluded from those arrays, see the
	//loop above) guarantees the fog overlay is re-punched to match the current property manager filter state.
	handleFogAfterHighlight();
}

//Building-class filter, driven by clicking a class row in the Summary infobox (Office / Multifamily /
//All Properties). Same dim-the-rest + click-again-to-clear behaviour as filterBuildingsWithPropertyManager().
//"AA" is treated as the AA + AAA bucket (there is no separate AAA filter), so a click on an AAA
//row filters as "AA". APT/Apartments and MDU/Condominiums are treated as the same class.
window.filterWithBuildingClassActive = false;
window.buildingClassFiltered = null;

function normalizeBuildingClassForMatch(buildingClass)
{
	var c = String(buildingClass == null ? "" : buildingClass).toUpperCase();
	if(c == "APARTMENTS") return "APT";
	if(c == "CONDOMINIUMS") return "MDU";
	return c;
}

function normalizeBuildingClassFilter(buildingClass)
{
	var c = normalizeBuildingClassForMatch(buildingClass);
	return (c == "AAA") ? "AA" : c;
}

//True when a building's class falls in the currently filtered bucket (AA bucket = AA + AAA).
function buildingMatchesClassFilter(buildingClass, filterClass)
{
	if(buildingClass == null || filterClass == null)
		return false;
	var bc = normalizeBuildingClassForMatch(buildingClass);
	var fc = normalizeBuildingClassForMatch(filterClass);
	if(fc == "AA")
		return bc == "AA" || bc == "AAA";
	return bc == fc;
}

//Is the class filter currently on and pointed at this class?
function isBuildingClassFilterActiveFor(buildingClass)
{
	return window.filterWithBuildingClassActive == true
		&& window.buildingClassFiltered != null
		&& buildingMatchesClassFilter(buildingClass, window.buildingClassFiltered);
}

//A Summary infobox class-name cell that doubles as the class filter toggle: click to dim every
//building that isn't that class, click again to clear. colorKey is the classColor[] key for the
//cell background + label, label is the displayed text, extraStyle is any style already on the cell
//(e.g. a width rule), filterClass overrides which class the click filters by (defaults to colorKey -
//used for the All-Properties "Apartments" row whose colour key isn't the building class).
function classFilterSummaryCell(colorKey, label, extraStyle, filterClass)
{
	extraStyle = extraStyle || "";
	filterClass = filterClass || colorKey;
	var activeClass = isBuildingClassFilterActiveFor(filterClass) ? " classFilterRowActive" : "";
	return "<td class='infoboxLegendTD classFilterRow" + activeClass + "' style='background-color:"
		+ classColor[colorKey] + "; " + extraStyle + "' onclick=\"filterBuildingsWithClass('" + filterClass
		+ "')\">" + label + "</td>";
}

function filterBuildingsWithClass(buildingClass)
{
	var normalized = normalizeBuildingClassFilter(buildingClass);
	if(window.filterWithBuildingClassActive == true && window.buildingClassFiltered == normalized)
	{
		window.filterWithBuildingClassActive = false;
		window.buildingClassFiltered = null;
	}
	else
	{
		window.filterWithBuildingClassActive = true;
		window.buildingClassFiltered = normalized;
	}
	//Triggered from the Summary infobox (no building selected), so redraw with the summary infobox,
	//not a building infobox - that also re-renders the class rows with the active one highlighted.
	highlightAllBuildings(lastCityLoaded, lastMarketLoaded, false, false);
	handleFogAfterHighlight();
}
window.aosArrowKeyMode = "suite";//"company" while Up/Down should navigate the Leasing Market Statistics list instead of suites - see filterAOSWithListingCompany() and the "availableOfficeSpace" click branch in index.php
//Same thin-band-via-ClassificationPrimitive technique as addPolygonOutlineOnTileset() (index.php) uses for
//the white selected-suite border, but a single band at the vertical centre of the floor. Added to
//viewer.scene.groundPrimitives and raised to the top of the collection so it draws over the floor's own
//colour primitive (same-tileset ground primitives are drawn in collection order, there is no real z-index).
//It is kept idempotent per suite via removeSuiteDGSCenterBand() so a re-highlight plus a suite click can't
//stack two bands on the same suite.
//Half the band's vertical thickness - it is extruded symmetrically about centerHeight so it stays centred.
window.suiteDGSCenterBandHalfThickness = 0.45;
function createSuiteDGSCenterBand(coords, centerHeight, idtsuite)
{
	if(typeof window.suiteDGSCenterBands == "undefined" || window.suiteDGSCenterBands == null)
		window.suiteDGSCenterBands = [];
	if(typeof viewer == "undefined" || coords == null || coords === "" || isNaN(parseFloat(centerHeight)))
		return null;

	//Idempotent per suite: a full re-highlight, a suite click and a floor select can all
	//ask for the same suite's band - drop any existing one first so they never stack.
	removeSuiteDGSCenterBand(idtsuite);

	var footprint = Cesium.Cartesian3.fromDegreesArray(eval("["+coords+"]"));
	var half = parseFloat(window.suiteDGSCenterBandHalfThickness);
	var band = new Cesium.ClassificationPrimitive({
		geometryInstances: new Cesium.GeometryInstance({
			geometry: new Cesium.PolygonGeometry({
				polygonHierarchy: new Cesium.PolygonHierarchy(footprint),
				height: parseFloat(centerHeight) - half,
				extrudedHeight: parseFloat(centerHeight) + half
			}),
			attributes: {
				//color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
				color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('#0000FF'))
			},
			id: "suiteDGSCenterBand_" + idtsuite,
		}),
		classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
		//Purely decorative: clicks must fall through to the suite polygon underneath, and the
		//generic LEFT_CLICK primitive-select logic must never adopt the band as selectedPrimitive
		//(it would later overwrite this #0000FF fill with the previous suite's stored colour).
		allowPicking: false
	});
	var primitive = viewer.scene.groundPrimitives.add(band);
	primitive.suiteDGSCenterBandSuiteId = idtsuite;
	//Ground primitives that classify the same tileset are drawn in collection order, so force this
	//band to the top of the stack - after the floor's own color primitive - so it shows through.
	viewer.scene.groundPrimitives.raiseToTop(primitive);
	window.suiteDGSCenterBands.push(primitive);
	return primitive;
}
//groundPrimitives.remove() also destroys the primitive; fall back to destroy() only if it
//is no longer in the collection. Calling bare destroy() while it is still in the collection
//is what left stale bands rendering (and stacking) after a re-highlight or a suite click.
function disposeSuiteDGSCenterBand(primitive)
{
	if(primitive == null)
		return;
	try
	{
		if(typeof viewer == "undefined" || !viewer.scene.groundPrimitives.remove(primitive))
		{
			if(typeof primitive.isDestroyed != "function" || !primitive.isDestroyed())
				primitive.destroy();
		}
	}
	catch(e){}
}
function removeSuiteDGSCenterBand(idtsuite)
{
	if(typeof window.suiteDGSCenterBands == "undefined" || window.suiteDGSCenterBands == null)
	{
		window.suiteDGSCenterBands = [];
		return;
	}
	var kept = [];
	for(var i = 0; i < window.suiteDGSCenterBands.length; i++)
	{
		var p = window.suiteDGSCenterBands[i];
		if(p != null && p.suiteDGSCenterBandSuiteId == idtsuite)
			disposeSuiteDGSCenterBand(p);
		else
			kept.push(p);
	}
	window.suiteDGSCenterBands = kept;
}
function destroySuiteDGSCenterBands()
{
	if(typeof window.suiteDGSCenterBands != "undefined" && window.suiteDGSCenterBands != null)
	{
		for(var i = 0; i < window.suiteDGSCenterBands.length; i++)
		{
			disposeSuiteDGSCenterBand(window.suiteDGSCenterBands[i]);
		}
	}
	window.suiteDGSCenterBands = [];
}
//Show the vertical-centre band for the currently selected 3DGS suite - called from the
//suite click / floor-select / back-forth paths, alongside addPolygonOutlineOnTileset().
function showSelectedSuiteDGSCenterBand(details, coords)
{
	if(details == null || details.dgs_url == null || details.dgs_url == "")
		return;
	var hv = (typeof window.suiteHeightValues != "undefined" && window.suiteHeightValues != null) ? window.suiteHeightValues[details.idtsuite] : null;
	if(hv == null || typeof hv[0] == "undefined" || typeof hv[1] == "undefined")
		return;
	createSuiteDGSCenterBand(coords || details.coords, (parseFloat(hv[0]) + parseFloat(hv[1])) / 2, details.idtsuite);
}
function highlightAvailableOfficeSpace()
{
	destroySuiteDGSCenterBands();
	//viewer.entities.removeById("FogEffectEntity");debugger;
	//viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	/*
	if(typeof cityBoundaries[23] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[23]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	*/
	updateURL();
	ShowLegend();
	
	handleFogAfterHighlight();
	
	var buildingHoleAdded = [];
	var cityAltitudeHeight = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
	var floorAlreadyHighlighted = [];
	window.lastHolesString = '';
		$.each(availableOfficeSpace, function (index, eachSuite){
			if((filterWithListingCompanyActive == false || eachSuite.idtcompany == listingCompanyFiltered) && (filterWithListingAgentActive == false || eachSuite.idtbroker == listingAgentFiltered))
			{
				companyLogoImages[eachSuite.idtcompany] = eachSuite.companyimage;
				//console.log("------------------");console.log(eachSuite);
				//if(eachSuite.idtbuilding == 164)
				if(eachSuite.coords.length > 0 && eachSuite.lease_type != null && eachSuite.lease_type.length > 0)//Just for debugging
				{
					if(typeof floorAlreadyHighlighted[eachSuite.idtbuilding] == "undefined")
					{
						floorAlreadyHighlighted[eachSuite.idtbuilding] = [];
						window.aosPrimitives[eachSuite.idtbuilding] = [];
						
					}
					if(typeof floorAlreadyHighlighted[eachSuite.idtbuilding][eachSuite.floor_number] == "undefined")
					{
						//floorAlreadyHighlighted[eachSuite.idtbuilding][eachSuite.floor_number] = 1;
						//eachSuite = improvedSuites[indexes][0];
						////console.log(eachSuite);
						if(eachSuite.floor_height != null && eachSuite.floor_height != '')
							floorHeight = eachSuite.floor_height
						else
						{
							floorHeight = parseFloat(eachSuite.building_floor_height);
							if(floorHeight < 2 || floorHeight > 8)
								floorHeight = 4;
						}
						
						var clr = "";
						var baseClr = Cesium.Color.fromCssColorString(classColor[eachSuite.lease_type]).withAlpha(0.7);
						clr = baseClr;
						if(defaultSuiteId != null && defaultSuiteId == eachSuite.idtsuite)
						{
							clr = Cesium.Color.fromCssColorString(classColor[eachSuite.lease_type]).withAlpha(1);
						}
						
						var baseFloorHeight = 0;
						if(!isNaN(parseFloat(eachSuite.basefloorheight)))
						{
							baseFloorHeight = parseFloat(eachSuite.basefloorheight);
						}
						
						var coords = eachSuite.coords;
						var drawVerticalLine = false;
						availableOfficeSpace[index]["splitCoords"] = coords;
						if(!isNaN(parseInt(eachSuite.floor_number)) && typeof eachSuite.floor_number != "undefined" && eachSuite.floor_number != null)
						{
							if(true)
							{
								var totalSuites = window.availableOfficeSpaceFloorWise[parseInt(eachSuite.idtbuilding)][parseInt(eachSuite.floor_number)];
								
								var TotalPts = parseInt(eval("["+coords+"]").length /2);
								/*
								var requiredPts = Math.ceil((parseInt(eachSuite.suite_area) / parseInt(eachSuite.grossofficearea)) * TotalPts);
								if(requiredPts <= 2)
									requiredPts = 3;
								*/
								//if(totalSuites.length > 1 && totalSuites.length <= 3 )
								if(totalSuites.length > 1 )//&& totalSuites.length <= 3 )
								{
									//debugger;
									////console.log("idtsuite: "+eachSuite.idtsuite);
									var centroid = [];
									if([535, 89, 896].includes(parseInt(eachSuite.idtbuilding)))
									{
										centroid = {"lat": eachSuite.latitude, "lon": eachSuite.longitude };
									}
									
									var splitCoords = splitPolygonIntoPieces( eachSuite.coords, totalSuites.length, centroid);
									////console.log(splitCoords);
									cntr = 0;
									$.each(availableOfficeSpaceFloorWise[parseInt(eachSuite.idtbuilding)][parseInt(eachSuite.floor_number)], function (i4, r4){
										if(r4.idtsuite == eachSuite.idtsuite)
										{
											cntr = i4;
											coords = splitCoords[i4];
											eachSuite.updatedCoords = coords;
											availableOfficeSpace[index]["splitCoords"] = coords;
											drawVerticalLine = true;
											availableOfficeSpaceFloorWise[parseInt(eachSuite.idtbuilding)][parseInt(eachSuite.floor_number)][i4]["splitCoords"] = coords;
											////console.log("Selecting "+i4);
										}
									});
									
									/*
									//console.log("Coords: "+coords[cntr]);
									if(typeof coords[cntr] == "undefined")
									{
										coords[cntr] = coords[0];
									}
									*/
								}
							}
							//console.log(eachSuite.idtsuite+">> ht"+baseFloorHeight+", "+((parseFloat(floorHeight) * parseInt(eachSuite.floor_number)) - parseFloat(floorHeight)));
							var newExtrudedHeight = ((parseFloat(floorHeight) * parseInt(eachSuite.floor_number)) - parseFloat(floorHeight));
							
							if(typeof eachSuite.extruded_height != "undefined" && parseFloat(eachSuite.extruded_height) > 0)
								newExtrudedHeight = parseFloat(eachSuite.extruded_height);
							
							////console.log("idtsuite: "+eachSuite.idtsuite);
							window.suiteHeightValues[eachSuite.idtsuite] = [];
							var temp = parseFloat(cityAltitudeHeight) + parseFloat(baseFloorHeight) + parseFloat(newExtrudedHeight);
							window.suiteHeightValues[eachSuite.idtsuite].push(temp);
							////console.log("extruded Height: " + temp);
							
							temp = parseFloat(cityAltitudeHeight) + parseFloat(baseFloorHeight) + (parseFloat(newExtrudedHeight) + parseFloat(floorHeight));
							window.suiteHeightValues[eachSuite.idtsuite].push(temp);
							if(drawVerticalLine)
							{
								var coordsArray = eval("[" + coords + "]");

								// Start and End points from your polygon coords
								var startLon = coordsArray[0];
								var startLat = coordsArray[1];
								var endLon = coordsArray[coordsArray.length - 2];
								var endLat = coordsArray[coordsArray.length - 1];
								if(endLon == startLon)
								{
									endLon = coordsArray[coordsArray.length - 4];
									endLat = coordsArray[coordsArray.length - 3];
								}
								// Height reference (same as your polygon’s base)
								var baseHeight = cityAltitudeHeight + baseFloorHeight + newExtrudedHeight;
								//addVerticalLine(startLon, startLat, window.suiteHeightValues[eachSuite.idtsuite][0], window.suiteHeightValues[eachSuite.idtsuite][1], Cesium.Color.WHITE, 4);
								
								//addVerticalLine(endLon, endLat, window.suiteHeightValues[eachSuite.idtsuite][0], window.suiteHeightValues[eachSuite.idtsuite][1], Cesium.Color.WHITE, 4);
								/*
								viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
									geometryInstances : new Cesium.GeometryInstance({
										geometry : new Cesium.PolygonGeometry({
										  polygonHierarchy : new Cesium.PolygonHierarchy(
											Cesium.Cartesian3.fromDegreesArray([
											  startLon, startLat, cityAltitudeHeight + baseFloorHeight + newExtrudedHeight,
											  startLon, startLat, cityAltitudeHeight + baseFloorHeight + (newExtrudedHeight + parseFloat(floorHeight)),
											])
										  ),
										  extrudedHeight: cityAltitudeHeight + baseFloorHeight + newExtrudedHeight,
										  height: cityAltitudeHeight + baseFloorHeight + (newExtrudedHeight + parseFloat(floorHeight)),
										}),
										attributes : {
											//color : defaultPrimitiveHighlightColor,
											color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString("#FFFFFF")),
											show : new Cesium.ShowGeometryInstanceAttribute(true)
										},
										id : "availableOfficeSpaceLINE-"+eachSuite.idtbuilding+"-"+index+"-"+eachSuite.idtsuite,
									}),
									classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
								}));
								*/
							}
							////console.log("height: "+temp);
							var dgsExtrudedHeight = parseFloat(cityAltitudeHeight) + parseFloat(baseFloorHeight) + parseFloat(newExtrudedHeight);
							var dgsHeight = parseFloat(cityAltitudeHeight) + parseFloat(baseFloorHeight) + (parseFloat(newExtrudedHeight) + parseFloat(floorHeight));
							var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
									geometryInstances : new Cesium.GeometryInstance({
										geometry : new Cesium.PolygonGeometry({
										  polygonHierarchy : new Cesium.PolygonHierarchy(
											Cesium.Cartesian3.fromDegreesArray(eval("["+coords+"]"))
										  ),
										  extrudedHeight: dgsExtrudedHeight,
										  height: dgsHeight,
										}),
										attributes : {
											//color : defaultPrimitiveHighlightColor,
											color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
											show : new Cesium.ShowGeometryInstanceAttribute(true)
										},
										id : "availableOfficeSpace-"+eachSuite.idtbuilding+"-"+index+"-"+eachSuite.idtsuite,
									}),
									classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
								}));
								window.aosPrimitives[eachSuite.idtbuilding].push(ent);
							if(typeof buildingHoleAdded[eachSuite.idtbuilding] == "undefined")
							{
								buildingHoleAdded[eachSuite.idtbuilding] = 1;
								//window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+eachSuite.coords+' ]), }, ';
							}
							window.availableOfficeSpacePrimitives.push(ent);
							if(eachSuite.dgs_url != null && eachSuite.dgs_url != "")
							{
								//Added after "ent" so it is drawn on top of the floor's own color primitive
								createSuiteDGSCenterBand(coords, (dgsExtrudedHeight + dgsHeight) / 2, eachSuite.idtsuite);
							}
						}
						if(defaultSuiteId != null && defaultSuiteId == eachSuite.idtsuite)
						{
							//ShowInfoboxForSuite(indexes, cntr);
							var details = window.availableOfficeSpace[index];
							allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
							window.lastFloor = index;
							window.lastFloor = parseInt(details.floor_number);
							
							$("#infoboxFloorPlanRow").show();
							window.lastSuite = index;
							window.lastSuiteId = eachSuite.idtsuite;
							devSelectedBuilding = parseInt(eachSuite.idtbuilding);
							var openDgsFullScreen = (defaultdgsFullScreen == 1 && details.dgs_url != null && details.dgs_url != "");
							if(openDgsFullScreen)
								window.lastSuiteSubTabType = "Tour";//so prepareAvailableOfficeSpaceInfobox renders the Tours tab already active, instead of clicking it open afterward
							prepareAvailableOfficeSpaceInfobox(eachSuite.idtbuilding, index, details, allSuitesOnFloor);
							selectedPrimitive = ent;
							selectedPrimitiveId = "availableOfficeSpace-"+eachSuite.idtbuilding+"-"+index+"-"+eachSuite.idtsuite;
							//Without this, resetLastSelectedPrimitive() has no backup color to restore to when the
							//user later selects a different suite, so this one stays stuck at alpha 1 forever -
							//its color attribute was baked in at primitive creation (fromColor(clr)) instead of set
							//via getGeometryInstanceAttributes(), which is the only path that records this backup.
							selectedPrimitiveColor = Cesium.ColorGeometryInstanceAttribute.toValue(baseClr);
							defaultSuiteId = null;
							var temp = details.splitCoords.split(",");
							var exHeight = parseFloat(details.floor_height) * parseFloat(details.floor_number);
							prepareLogoAndSqftLabels(selectedPrimitiveId, parseFloat(temp[1]), parseFloat(temp[0]), (exHeight + parseInt(cityAltitudeAdjustment[lastCityLoaded])), adminBaseUrl + details.companyimage, details.suite_area);
							setTimeout(function (){

								addPolygonOutlineOnTileset(coords, window.suiteHeightValues[lastSuiteId][0], window.suiteHeightValues[lastSuiteId][1], Cesium.Color.WHITE, details.dgs_url);
							}, 2000);

							if(openDgsFullScreen)
							{
								defaultdgsFullScreen = 0;
								setTimeout(function (){
									expandTourPreviewToFullScreen(eachSuite.idtsuite, details.dgs_url, eachSuite.idtbuilding, details.sbuildingname);
								}, 3000);
							}
							if(defaultFloorplanFullScreen == 1)
							{
								defaultFloorplanFullScreen = 0;
								setTimeout(function (){
									openFullScreenImage(eachSuite.idtbuilding, details.floor_number, index, '', '', eachSuite.idtsuite, 'Yes');
								}, 3000);
							}
						}
					}
					else
					{
						floorAlreadyHighlighted[eachSuite.idtbuilding][eachSuite.floor_number]++;
					}
				}
				
			}
		});
		
		//Old Code
		/*
		viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		////console.log("floorAlreadyHighlighted", floorAlreadyHighlighted);
		*/
	executeDefaultEffectsAndCamera();
	eventsToExecuteAfterLoadingData();

}

// =============================================================================
// highlightAvailableOfficeSpace — optimized
//
// Key changes vs original:
//  1. Removed all eval() — coords parsed with parseCoords() / safeFromDegreesArray()
//  2. Batched ClassificationPrimitive per unique color (same constraint as above)
//  3. Cesium.Color.fromCssColorString result cached — called once per lease_type,
//     not once per suite (was the hot path: CSS color parse is expensive)
//  4. Repeated parseFloat/parseInt on the same field hoisted out of inner loops
//  5. Inner $.each over availableOfficeSpaceFloorWise replaced with a plain for-loop
//     that breaks as soon as the matching suite is found (was scanning entire floor
//     even after a match)
//  6. coordsArray parse in the drawVerticalLine block reuses the already-parsed nums
//     instead of calling eval() a second time on the same string
// =============================================================================
 
function highlightAvailableOfficeSpace_new() {
  updateURL();
  ShowLegend();
 
  const buildingHoleAdded       = [];       // sparse array keyed by idtbuilding
  const cityAltitudeHeight      = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
  const floorAlreadyHighlighted = [];       // [idtbuilding][floor_number]
 
  window.lastHolesString = "";
 
  // --- color cache: avoid re-parsing the same CSS color string for every suite ---
  const colorCache = {};   // lease_type → base Cesium.Color (alpha=1)
  function getSuiteColor(leaseType, alpha) {
    if (!colorCache[leaseType]) {
      colorCache[leaseType] = Cesium.Color.fromCssColorString(classColor[leaseType]);
    }
    // withAlpha returns a NEW color object each time — no shared-state mutation
    return colorCache[leaseType].withAlpha(alpha);
  }
 
  // --- batch geometry by color key (Cesium ClassificationPrimitive constraint) ---
  // colorKey() and pushToMap() are defined in highlightAllBuildings_optimized.js
  const instancesByColor = new Map(); // colorKey → [{geomInstance, idtbuilding, index, idtsuite, isDefault}]
 
  $.each(availableOfficeSpace, function (index, eachSuite) {
    if (!eachSuite.coords || eachSuite.coords.length === 0) return;
    if (!eachSuite.lease_type || eachSuite.lease_type.length === 0) return;
 
    const bldgId    = parseInt(eachSuite.idtbuilding);
    const floorNum  = parseInt(eachSuite.floor_number);
 
    // Per-building init
    if (typeof floorAlreadyHighlighted[bldgId] === "undefined") {
      floorAlreadyHighlighted[bldgId]  = [];
      window.aosPrimitives[bldgId]     = [];
    }
 
    if (typeof floorAlreadyHighlighted[bldgId][floorNum] !== "undefined") {
      floorAlreadyHighlighted[bldgId][floorNum]++;
      return; // already rendered this floor
    }
 
    // --- floor height ---
    let floorHeight;
    if (eachSuite.floor_height != null && eachSuite.floor_height !== "") {
      floorHeight = parseFloat(eachSuite.floor_height);
    } else {
      floorHeight = parseFloat(eachSuite.building_floor_height);
      if (floorHeight < 2 || floorHeight > 8) floorHeight = 4;
    }
 
    // --- color (cached) ---
    const isDefault = (defaultSuiteId != null && defaultSuiteId == eachSuite.idtsuite);
    const clr       = getSuiteColor(eachSuite.lease_type, isDefault ? 1 : 0.7);
 
    // --- base floor height ---
    const baseFloorHeight = isNaN(parseFloat(eachSuite.basefloorheight))
      ? 0
      : parseFloat(eachSuite.basefloorheight);
 
    // --- determine coords (may be split if multiple suites share a floor) ---
    let coords           = eachSuite.coords;
    let drawVerticalLine = false;
 
    if (!isNaN(floorNum) && typeof eachSuite.floor_number !== "undefined" && eachSuite.floor_number != null) {
      const totalSuites = window.availableOfficeSpaceFloorWise[bldgId]?.[floorNum];
 
      if (totalSuites && totalSuites.length > 1) {
        const centroid = [535, 89, 896].includes(bldgId)
          ? { lat: eachSuite.latitude, lon: eachSuite.longitude }
          : [];
 
        const splitCoords = splitPolygonIntoPieces(eachSuite.coords, totalSuites.length, centroid);
 
        // FIX 5: plain for-loop with early break instead of $.each scanning the whole floor
        for (let i4 = 0; i4 < totalSuites.length; i4++) {
          if (totalSuites[i4].idtsuite == eachSuite.idtsuite) {
            coords = splitCoords[i4];
            eachSuite.updatedCoords = coords;
            availableOfficeSpace[index]["splitCoords"] = coords;
            drawVerticalLine = true;
            availableOfficeSpaceFloorWise[bldgId][floorNum][i4]["splitCoords"] = coords;
            break; // FIX 5: stop scanning once found
          }
        }
      } else {
        availableOfficeSpace[index]["splitCoords"] = coords;
      }
 
      // --- heights ---
      let newExtrudedHeight = (floorHeight * floorNum) - floorHeight;
      if (typeof eachSuite.extruded_height !== "undefined" && parseFloat(eachSuite.extruded_height) > 0) {
        newExtrudedHeight = parseFloat(eachSuite.extruded_height);
      }
 
      const bottomH = cityAltitudeHeight + baseFloorHeight + newExtrudedHeight;
      const topH    = cityAltitudeHeight + baseFloorHeight + newExtrudedHeight + floorHeight;
 
      window.suiteHeightValues[eachSuite.idtsuite] = [bottomH, topH];
 
      // --- parse coords once, reuse for both vertical line and polygon ---
      // FIX 1 + 6: single parseCoords call; no second eval() in the drawVerticalLine block
      const coordNums  = parseCoords(coords);
      const coordCart3 = safeFromDegreesArray(coordNums);
      if (!coordCart3) {
        console.warn("highlightAvailableOfficeSpace: bad coords for suite", eachSuite.idtsuite, coords);
        return;
      }
 
      if (drawVerticalLine && coordNums) {
        // FIX 6: reuse coordNums instead of eval("["+coords+"]")
        const startLon = coordNums[0];
        const startLat = coordNums[1];
        let   endLon   = coordNums[coordNums.length - 2];
        let   endLat   = coordNums[coordNums.length - 1];
        if (endLon === startLon) {
          endLon = coordNums[coordNums.length - 4];
          endLat = coordNums[coordNums.length - 3];
        }
        // vertical line rendering preserved exactly (currently commented-out
        // in original; kept commented here so behavior is unchanged)
        // addVerticalLine(startLon, startLat, bottomH, topH, Cesium.Color.WHITE, 4);
        // addVerticalLine(endLon,   endLat,   bottomH, topH, Cesium.Color.WHITE, 4);
      }
 
      // --- queue geometry instance (batched by color, not added to Cesium yet) ---
      const ck = colorKey(clr);
      if (!instancesByColor.has(ck)) instancesByColor.set(ck, []);
      instancesByColor.get(ck).push({
        geomInstance: new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(coordCart3),
            extrudedHeight:   bottomH,
            height:           topH,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
            show:  new Cesium.ShowGeometryInstanceAttribute(true),
          },
          id: `availableOfficeSpace-${bldgId}-${index}-${eachSuite.idtsuite}`,
        }),
        bldgId:    bldgId,
        index:     index,
        idtsuite:  eachSuite.idtsuite,
        isDefault: isDefault,
        coords:    coords,
      });
 
      if (typeof buildingHoleAdded[bldgId] === "undefined") {
        buildingHoleAdded[bldgId] = 1;
      }
    }
  }); // end $.each
 
  // --- flush: one ClassificationPrimitive per unique color ---
  for (const [, group] of instancesByColor) {
    const prim = viewer.scene.groundPrimitives.add(
      new Cesium.ClassificationPrimitive({
        geometryInstances:  group.map(g => g.geomInstance),
        asynchronous:       false,
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      })
    );
 
    for (const g of group) {
      window.aosPrimitives[g.bldgId].push(prim);
      window.availableOfficeSpacePrimitives.push(prim);
 
      if (g.isDefault) {
        const details      = window.availableOfficeSpace[g.index];
        const allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
 
        window.lastFloor     = parseInt(details.floor_number);
        window.lastSuite     = g.index;
        window.lastSuiteId   = g.idtsuite;
        devSelectedBuilding  = parseInt(details.idtbuilding);
 
        $("#infoboxFloorPlanRow").show();
        prepareAvailableOfficeSpaceInfobox(details.idtbuilding, g.index, details, allSuitesOnFloor);
 
        selectedPrimitive   = prim;
        selectedPrimitiveId = `availableOfficeSpace-${g.bldgId}-${g.index}-${g.idtsuite}`;
        defaultSuiteId      = null;
 
        const tempCoords = details.splitCoords.split(",");
        const exHeight   = parseFloat(details.floor_height) * parseFloat(details.floor_number);
        prepareLogoAndSqftLabels(
          selectedPrimitiveId,
          parseFloat(tempCoords[1]),
          parseFloat(tempCoords[0]),
          exHeight + parseInt(cityAltitudeAdjustment[lastCityLoaded]),
          adminBaseUrl + details.companyimage,
          details.suite_area
        );
 
        setTimeout(function () {
          addPolygonOutlineOnTileset(
            g.coords,
            window.suiteHeightValues[window.lastSuiteId][0],
            window.suiteHeightValues[window.lastSuiteId][1],
            Cesium.Color.WHITE
          );
        }, 2000);
      }
    }
  }
 
  setTimeout(function () {
          handleFogAfterHighlight();
		  executeDefaultEffectsAndCamera();
		  eventsToExecuteAfterLoadingData();
	}, 2000);
}

function handleFogAfterHighlight()
{
	window.primitivesCleared = false;
	console.log("In handleFogAfterHighlight()");
	var boundary = "";
	if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
		boundary = cityBoundaries[parseInt(lastCityLoaded)];
	if(typeof window.marketBoundaries[parseInt(lastMarketLoaded)] != "undefined" && window.marketBoundaries[parseInt(lastMarketLoaded)] != null)
	{
		//console.warn("Using Market fog");
		boundary = window.marketBoundaries[parseInt(lastMarketLoaded)];
		mergedCoords = mergeIntersectingPolygons(window.lastHolesArray);
		//KEEP HOLE STRING AS IT IS
		
		window.lastHolesString = "";
		$.each(mergedCoords, function (i2, eachRow){
			window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(eachRow.coords)+' ]), }, ';
		});
		
		marketHole = '  ';
		viewer.entities.removeById("NewFogEffectEntity");
		//console.log("viewer.entities.add({ id: 'NewFogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[idtcity]+"), holes: [{ positions: Cesium.Cartesian3.fromDegreesArray([ "+boundary+" ]), },] }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		viewer.entities.add({
		  id: 'NewFogEffectEntity',
		  polygon: {
			hierarchy: new Cesium.PolygonHierarchy(
			  Cesium.Cartesian3.fromDegreesArray(eval(cityBoundaries[parseInt(lastCityLoaded)])),
			  [
				new Cesium.PolygonHierarchy(
				  Cesium.Cartesian3.fromDegreesArray(boundary.split(',').map(Number))
				)
			  ]
			),
			material: Cesium.Color[getDarkOverlayColor()].withAlpha(0.5),
			classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
			// classificationType REMOVED — incompatible with holes (GroundPrimitive limitation)
		  },
		});
		
		
		//console.log("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+boundary+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+boundary+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		boundary = "["+boundary+"]";
	}
	else
	{
		console.warn("Using City Coords");
		//KEEP HOLE STRING AS IT IS
		/*
		mergedCoords = mergeIntersectingPolygons(window.lastHolesArray);
		window.lastHolesString = "";
		$.each(mergedCoords, function (i2, eachRow){
			window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(eachRow.coords)+' ]), }, ';
		});
		*/
	}
	//console.log(boundary);
	if(window.changingVisualization && typeof viewer.entities.getById("FogEffectEntity") != "undefined")
	{
		updateFogHoles(eval("["+window.lastHolesString+"]"));
	}
	else
	{
		if(typeof viewer.entities.getById("FogEffectEntity") != "undefined")
		{
			viewer.entities.removeById("FogEffectEntity");debugger;
		}
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+boundary+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
	}
}

// V2 of handleFogAfterHighlight() - fixes from review:
//  1. NewFogEffectEntity is always removed up front (not only inside the
//     market-boundary branch), so it can't be orphaned on screen when
//     switching to a market that has no market boundary.
//  2. Holes are rebuilt from window.lastHolesArray in both branches, not
//     just the market-boundary one, so the city-only path never reuses a
//     stale holes string left over from a previous market.
//  3. Boundary/hole coordinate strings go through parseCoords(), which
//     rejects NaN/trailing-comma garbage instead of Number("") silently
//     becoming 0 and corrupting the polygon with a bogus (0,0) vertex.
//  4. Entities are built as real objects via safeFromDegreesArray() and
//     Cesium.PolygonHierarchy instead of string-concatenated eval() - a
//     malformed boundary logs a warning and skips the update instead of
//     throwing mid-function (which could leave FogEffectEntity/
//     NewFogEffectEntity removed with nothing re-added).
//  5. cityBoundaries (pre-bracketed, e.g. "[1,2,3,4]") and marketBoundaries
//     (raw, e.g. "1,2,3,4") are normalized the same way before parsing,
//     instead of relying on the caller to know which one needs wrapping.
//  6. getDarkOverlayColor() is validated against Cesium.Color before use.
function stripBoundaryBrackets(str) {
	if (typeof str != "string") return str;
	return str.trim().replace(/^\[/, "").replace(/\]$/, "");
}

function safeOverlayColor() {
	var colorName = getDarkOverlayColor();
	var color = Cesium.Color[colorName];
	if (color == null) {
		console.warn("handleFogAfterHighlightV2: unknown overlay color '" + colorName + "', falling back to WHITE");
		color = Cesium.Color.WHITE;
	}
	return color.withAlpha(0.5);
}

function buildFogHolesV2() {
	var holes = [];
	var holeStringParts = [];
	var mergedCoords = mergeIntersectingPolygons(window.lastHolesArray);
	$.each(mergedCoords, function (i2, eachRow) {
		var closed = tryClosingPolygon(eachRow.coords);
		var nums = parseCoords(closed);
		var positions = safeFromDegreesArray(nums);
		if (positions == null) {
			console.warn("handleFogAfterHighlightV2: skipping malformed hole", eachRow.coords);
			return;
		}
		holes.push({ positions: positions });
		holeStringParts.push(' { positions: Cesium.Cartesian3.fromDegreesArray([ ' + closed + ' ]), }, ');
	});
	// Kept in sync for other code elsewhere in this file that still reads
	// window.lastHolesString directly.
	window.lastHolesString = holeStringParts.join('');
	return holes;
}

function handleFogAfterHighlightV2()
{
	window.primitivesCleared = false;
	console.log("In handleFogAfterHighlightV2()");

	viewer.entities.removeById("NewFogEffectEntity");

	var holes = buildFogHolesV2();

	var cityBoundaryNums = parseCoords(stripBoundaryBrackets(cityBoundaries[parseInt(lastCityLoaded)]));
	var marketBoundaryRaw = window.marketBoundaries[parseInt(lastMarketLoaded)];
	var outerBoundaryNums = cityBoundaryNums;

	if (marketBoundaryRaw != null)
	{
		var marketBoundaryNums = parseCoords(stripBoundaryBrackets(marketBoundaryRaw));
		var marketPositions = safeFromDegreesArray(marketBoundaryNums);
		var cityPositions = safeFromDegreesArray(cityBoundaryNums);

		if (marketPositions != null && cityPositions != null)
		{
			viewer.entities.add({
				id: 'NewFogEffectEntity',
				polygon: {
					hierarchy: new Cesium.PolygonHierarchy(
						cityPositions,
						[ new Cesium.PolygonHierarchy(marketPositions) ]
					),
					material: safeOverlayColor(),
					classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
					// classificationType REMOVED — incompatible with holes (GroundPrimitive limitation)
				},
			});
			outerBoundaryNums = marketBoundaryNums;
		}
		else
		{
			console.warn("handleFogAfterHighlightV2: market boundary present but could not be parsed, falling back to city boundary", marketBoundaryRaw);
		}
	}
	else
	{
		console.warn("handleFogAfterHighlightV2: Using City Coords");
	}

	if (outerBoundaryNums == null)
	{
		console.warn("handleFogAfterHighlightV2: no usable boundary for city " + lastCityLoaded + " - skipping fog update");
		return;
	}

	if (window.changingVisualization && viewer.entities.getById("FogEffectEntity") != null)
	{
		updateFogHoles(holes);
		return;
	}

	var outerPositions = safeFromDegreesArray(outerBoundaryNums);
	if (outerPositions == null)
	{
		console.warn("handleFogAfterHighlightV2: outer boundary failed to build Cartesian3 array - skipping fog update");
		return;
	}

	if (viewer.entities.getById("FogEffectEntity") != null)
	{
		viewer.entities.removeById("FogEffectEntity");debugger;
	}

	viewer.entities.add({
		id: 'FogEffectEntity',
		polygon: {
			hierarchy: new Cesium.PolygonHierarchy(outerPositions, holes),
			material: safeOverlayColor(),
			classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
		},
	});
}

function prepareLogoAndSqftLabels(id, lat, lon, ht, imagePath, sqftValue) {
	if(typeof ht == "undefined" || ht == null)
	{
		ht = cameraAltitudeAdjustment;
	}
	check = id.split("-");
	$(".floorNumberRowTR").show();
	$(".floorNumberRowTD").html("<b><span class='floorNumberDisplay'>(" + check[2] + ")</span></b>");

	// Convert lat, lon, ht to Cartesian3 position (base point on model)
	const featurePosition = Cesium.Cartesian3.fromDegrees(parseFloat(lon), parseFloat(lat), parseFloat(ht));

	const cameraPosition = viewer.scene.camera.positionWC;

	// 1. Direction from feature to camera
	const direction = Cesium.Cartesian3.subtract(cameraPosition, featurePosition, new Cesium.Cartesian3());
	Cesium.Cartesian3.normalize(direction, direction);

	// 2. Offset toward camera
	const towardCamera = Cesium.Cartesian3.multiplyByScalar(direction, 20, new Cesium.Cartesian3());
	const basePosition = Cesium.Cartesian3.add(featurePosition, towardCamera, new Cesium.Cartesian3());

	// 2. Offset toward camera
	const towardCamera2 = Cesium.Cartesian3.multiplyByScalar(direction, 5, new Cesium.Cartesian3());
	const basePosition2 = Cesium.Cartesian3.add(featurePosition, towardCamera2, new Cesium.Cartesian3());

	// 3. Left vector (direction × up)
	const up = new Cesium.Cartesian3(0, 0, 1);
	const left = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
	Cesium.Cartesian3.normalize(left, left);

	// 4. Positions for image & sqft
	const leftOffset = Cesium.Cartesian3.multiplyByScalar(left, 30, new Cesium.Cartesian3());   // image closer to sqft
	const rightOffset = Cesium.Cartesian3.multiplyByScalar(left, -5, new Cesium.Cartesian3()); // sqft slightly to right

	const imagePosition = Cesium.Cartesian3.add(basePosition, leftOffset, new Cesium.Cartesian3());
	const areaPosition = Cesium.Cartesian3.add(basePosition2, rightOffset, new Cesium.Cartesian3());

	// Billboard dimensions
	const billboardHalfWidth = 5;

	// 5. Connector start points
	const rightOffsetLogo = Cesium.Cartesian3.multiplyByScalar(left, -billboardHalfWidth, new Cesium.Cartesian3());
	const logoConnectorStart = Cesium.Cartesian3.add(imagePosition, rightOffsetLogo, new Cesium.Cartesian3());

	const leftOffsetSqft = Cesium.Cartesian3.multiplyByScalar(left, billboardHalfWidth, new Cesium.Cartesian3());
	const sqftConnectorStart = Cesium.Cartesian3.add(areaPosition, leftOffsetSqft, new Cesium.Cartesian3());

	// 6. Remove old entities
	viewer.entities.removeById('imageLabel');
	viewer.entities.removeById('areaLabel');
	viewer.entities.removeById('logoConnectorLine');
	viewer.entities.removeById('sqftConnectorLine');

	/*
	// Animation control vars (same idea as font size)
	let billboardScaleDelta = 0.002;
	let billboardScale = 0.05;
	const minScale = 0.02;
	const maxScale = 0.08;

	// Attach to same listener
	billboardListenerCallback = viewer.scene.preUpdate.addEventListener(
	  function (scene, time) {
		// Billboard scale animation
		billboardScale += billboardScaleDelta;
		if (billboardScale >= maxScale || billboardScale <= minScale) {
		  billboardScaleDelta *= -1.0;
		}
		imageEntity.billboard.scale = billboardScale;
	  }
	);
	*/

	// 8. Add sqft label
	viewer.entities.add({
		id: 'areaLabel',
		position: areaPosition,
		label: {
			text: numberWithCommaWithoutDecimal(getAreaInCityUnits(sqftValue), "", " " + cityAreaMeasurementUnit),
			font: "30px Helvetica",
			horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
			fillColor: Cesium.Color.BLACK,
			outlineColor: Cesium.Color.WHITE,
			outlineWidth: 5,
			style: Cesium.LabelStyle.FILL_AND_OUTLINE
		}
	});
	showLogo = false;
	if( isMobile.any() == null && window.desktop_logo_display == 1 )
		showLogo = true;
	if( isMobile.any() != null && window.mobile_logo_display == 1 )
		showLogo = true;
		
	if( showLogo == true )
	{
		// 7. Add image billboard
		window.imageEntity = viewer.entities.add({
			id: 'imageLabel',
			position: imagePosition,
			billboard: {
				image: imagePath,
				scale: 0.05,
				sizeInMeters: true,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});
		// 9. Add connector lines
		viewer.entities.add({
			id: 'logoConnectorLine',
			polyline: {
				positions: [logoConnectorStart, featurePosition],
				width: 1,
				material: Cesium.Color.WHITE,
				disableDepthTestDistance: Number.POSITIVE_INFINITY // Always on top
			}
		});
	}
	
	/*
	viewer.entities.add({
		id: 'sqftConnectorLine',
		polyline: {
			positions: [sqftConnectorStart, featurePosition],
			width: 2,
			material: Cesium.Color.WHITE
		}
	});
	*/
}

function clearAvailableOfficeSpaceEntities()
{
	if(typeof window.availableOfficeSpacePrimitives != "undefined" && window.availableOfficeSpacePrimitives != null)
	{
		for(var i = 0; i < window.availableOfficeSpacePrimitives.length; i++)
		{
			window.availableOfficeSpacePrimitives[i].destroy();
		}
		window.availableOfficeSpacePrimitives = [];
	}
	destroySuiteDGSCenterBands();
}

function getInvestmentSaleColor(soldValue, psfValue, onlyHex = false)
{
	//console.log(psfValue);
	if(isNaN(psfValue))
		psfValue = 0; 
	//console.log(psfValue);
	foundColor = "";
	$.each(window.investmentSalesColors, function (index, eachColor){
		if(soldValue == null || soldValue == 0)
		{
			if(foundColor == "" && parseFloat(eachColor.range_start) == 0 && parseFloat(eachColor.range_end) == 0)
			{
				foundColor = eachColor.hex_color;
			}
		}
		else
		{
			if(foundColor == "" && psfValue >= parseFloat(eachColor.range_start) && psfValue <= parseFloat(eachColor.range_end))
			{
				//console.log(psfValue+" <"+eachColor.range_start+"> "+eachColor.hex_color+" <"+eachColor.range_end+">");
				foundColor = eachColor.hex_color;
			}
			else if(foundColor == "" && parseFloat(eachColor.range_start) > 0 && psfValue >= parseFloat(eachColor.range_start) && parseFloat(eachColor.range_end) == 0)
			{
				foundColor = eachColor.hex_color;
			}
		}
	});
	if(foundColor)
	{
		if(onlyHex)
			return foundColor;
		return Cesium.Color.fromCssColorString(foundColor).withAlpha(0.5);
	}
}

// "Q3 2024" style label for one investment-sale record (falls back to the raw sale_date, then "Sale").
function officeSaleDateLabel(row)
{
	if(row == null) return "Sale";
	var y = (row.sale_year && parseInt(row.sale_year) != 0) ? ("" + row.sale_year) : "";
	var q = row.sale_quarter ? ("" + row.sale_quarter).trim() : "";
	var d = (q + " " + y).trim();
	if(d === "" && row.sale_date)
		d = PrintOnlyDate(row.sale_date);
	return d === "" ? "Sale" : d;
}

// Sortable "YYYY-MM-DD" key for ordering a building's sales newest-first. Prefers a real
// sale_date; otherwise derives one from sale_year + sale_quarter.
function officeSaleSortKey(row)
{
	if(row && typeof row.sale_date == "string" && /^\d{4}-\d{2}-\d{2}/.test(row.sale_date))
		return row.sale_date.substring(0, 10);
	var y = (row && parseInt(row.sale_year)) ? parseInt(row.sale_year) : 0;
	var qMonth = { Q1: "03", Q2: "06", Q3: "09", Q4: "12" };
	var q = (row && row.sale_quarter) ? qMonth[("" + row.sale_quarter).toUpperCase().trim()] : null;
	if(!q) q = "00";
	var ys = "" + y;
	while(ys.length < 4) ys = "0" + ys;
	return ys + "-" + q + "-01";
}

function highlightCalgaryOfficeMarketSales(yearSelected = "")
{
	devSelectedBuilding = "";
	closeInfobox();
	//viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[2]+") }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	updateURL();
	ShowLegend();
	clearCalgaryOfficeMarketSales();
	if(typeof window.calgaryOfficeSalePrimitives == "undefined")
	{
		window.calgaryOfficeSalePrimitives = [];
	}
	if(typeof window.calgaryOfficeSalePrimitivesLabels == "undefined")
	{
		window.calgaryOfficeSalePrimitivesLabels = [];
		//window.calgaryOfficeSalePrimitivesLabels = viewer.scene.primitives.add(new Cesium.LabelCollection());
	}
	window.lastHolesString = '';
	window.lastHolesArray = [];
	window.TempBldgData = [];
	
	//Label Config
	disableDepthTestDistance = Number.POSITIVE_INFINITY;
	backgroundColor = "";
	textColor = "";
	defaultVariable = "";
	var font = '15px helvetica neue';
	var translucencyByDistance = undefined;
	var bgColor = new Cesium.Color(0.165, 0.165, 0.165, 0.8);
	var fillColor = Cesium.Color.WHITE;
	var objectToUse = [];
	if(yearSelected == "All")
	{
		objectToUse = calgaryOfficeSale;
	}
	else
	{
		objectToUse = calgaryOfficeSaleYearWise[yearSelected];
	}

	// Group every sale record by building, newest sale first. A building with more than one
	// sale gets a single polygon/label on the map (coloured by its newest sale) and a tabbed
	// infobox - one tab per sale, "Sale date" labelled, newest first (see ShowInfoboxOfficeMarketSales()).
	window.officeSalesByBuilding = {};
	$.each(objectToUse, function (i2, row){
		if(typeof window.officeSalesByBuilding[row.idtbuilding] == "undefined")
			window.officeSalesByBuilding[row.idtbuilding] = [];
		window.officeSalesByBuilding[row.idtbuilding].push(row);
	});
	var officeSaleBuildingIds = [];
	for(var obid in window.officeSalesByBuilding)
	{
		if(!window.officeSalesByBuilding.hasOwnProperty(obid))
			continue;
		window.officeSalesByBuilding[obid].sort(function (a, b){ return officeSaleSortKey(b).localeCompare(officeSaleSortKey(a)); });
		officeSaleBuildingIds.push(obid);
	}

	$.each(officeSaleBuildingIds, function (cntr, officeSaleBid){
		var eachSuite = window.officeSalesByBuilding[officeSaleBid][0];//newest sale drives the map colour + labels
		window.TempBldgData[eachSuite.idtbuilding] = eachSuite;
		
		var clr = getInvestmentSaleColor(parseFloat(eachSuite.sold_price), parseFloat(eachSuite.sold_price) / parseFloat(eachSuite.grossofficearea));
		console.log(clr);
		/*
		if(eachSuite.office_conversion == "Office")
			clr = Cesium.Color.fromCssColorString(classColor["Office"]).withAlpha(0.5);
		else if(eachSuite.office_conversion == "Office Conversion")
			clr = Cesium.Color.fromCssColorString(classColor["OfficeConversion"]).withAlpha(0.5);
		if(typeof defaultBuilding != "undefined" && defaultBuilding != null && defaultBuilding == eachSuite.idtbuilding)
		{
			clr = clr.withAlpha(0.7);
		}
		*/
		if(typeof clr != "undefined")
		{
			var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
				geometryInstances : new Cesium.GeometryInstance({
					geometry : new Cesium.PolygonGeometry({
					  polygonHierarchy : new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(eval("["+eachSuite.coords+"]"))
					  ),
					  height : -100,
					  extrudedHeight : 3000
					}),
					attributes : {
						//color : defaultPrimitiveHighlightColor,
						color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
						show : new Cesium.ShowGeometryInstanceAttribute(true)
					},
					id : "calgaryOfficeMarket-"+cntr+"-"+eachSuite.idtbuilding,
				}),
				classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
			}));
		}
		if(eachSuite.sold_price != null && eachSuite.sold_price != "" && eachSuite.sold_price != "0")
		{
			var pts = eval("["+eachSuite.coords+"]");
			var pt1 = getCentroid(pts);
			//console.log("sale_id: "+eachSuite.sale_id);
			//console.log(pt1);
			//console.log(window.TempBldgData[eachSuite.idtbuilding].altitude);
			//console.log(parseInt(window.TempBldgData[eachSuite.idtbuilding].floors * 4));
			
			var htCheck = (parseInt(window.TempBldgData[eachSuite.idtbuilding].altitude) + (parseInt(window.TempBldgData[eachSuite.idtbuilding].floors) * 4) + 20);
			htCheck = (parseInt(cameraAltitudeAdjustment) + (parseInt(window.TempBldgData[eachSuite.idtbuilding].floors) * 4) + 40);
			if(window.TempBldgData[eachSuite.idtbuilding].altitude == null || parseInt(window.TempBldgData[eachSuite.idtbuilding].altitude) == 0)
			{
				htCheck = parseInt(cameraAltitudeAdjustment) + (parseInt(window.TempBldgData[eachSuite.idtbuilding].floors) * 4) + 40;
			}
			console.log(window.TempBldgData[eachSuite.idtbuilding]);
			console.log("ID: "+eachSuite.idtbuilding+", Ht: "+htCheck);
			var position = Cesium.Cartesian3.fromDegrees(pt1[0], pt1[1], htCheck);
			//console.log(position);
			
			window.calgaryOfficeSalePrimitivesLabels.push("label-"+eachSuite.idtbuilding);
			viewer.entities.add({
				id: "label-"+eachSuite.idtbuilding,
				position: position,
				show: false,
				label: {
					text: numberWithCommaWithoutDecimal(eachSuite.sold_price, "$"),
					font: '40px sans-serif',
					showBackground: true,
					fillColor: Cesium.Color.WHITE,
					outlineColor: Cesium.Color.BLACK,
					outlineWidth: 2,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					//pixelOffset: new Cesium.Cartesian2(0, -20), // Adjust vertical position
					disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible
					//scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 2000, 1.0), // Maintain size across zoom levels
				}
			});
			var psf = parseFloat(eachSuite.sold_price) / parseFloat(eachSuite.grossofficearea);
			window.calgaryOfficeSalePrimitivesLabels.push("label-psf-"+eachSuite.idtbuilding);
			viewer.entities.add({
				id: "label-psf-"+eachSuite.idtbuilding,
				position: position,
				show: false,
				label: {
					text: numberWithCommaWithTwoDecimal(psf, "$", " psf"),
					font: '40px sans-serif',
					showBackground: true,
					fillColor: Cesium.Color.WHITE,
					outlineColor: Cesium.Color.BLACK,
					outlineWidth: 2,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					//pixelOffset: new Cesium.Cartesian2(0, -20), // Adjust vertical position
					disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible
					//scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 2000, 1.0), // Maintain size across zoom levels
				}
			});
			
			  
			//window.calgaryOfficeSalePrimitivesLabels.add();
			/*
			window.calgaryOfficeSalePrimitivesLabels.add({
				position : position,
				text : numberWithCommaWithoutDecimal(eachSuite.sold_price, "$ "),
				showBackground : true,
				translucencyByDistance : translucencyByDistance,
				backgroundColor: bgColor,
				fillColor: fillColor,
				font : font,
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				disableDepthTestDistance : disableDepthTestDistance
			});
			*/
		}
		
		window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+eachSuite.coords+' ]), }, ';
		window.lastHolesArray.push({"id": eachSuite.idtsuite, "coords": eval("["+eachSuite.coords+"]")});
		window.calgaryOfficeSalePrimitives.push(ent);
		if(typeof defaultBuilding != "undefined" && defaultBuilding != null && defaultBuilding == eachSuite.idtbuilding)
		{
			selectedPrimitive = ent.primitive;
			selectedPrimitiveId = "calgaryOfficeMarket-"+cntr+"-"+eachSuite.idtbuilding;
			ShowInfoboxOfficeMarketSales(eachSuite.idtbuilding);
			defaultBuilding = null;
			
		}
	});
	console.log(lastHolesString);
	handleFogAfterHighlight();
	//Old Code
	/*
	viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	if(typeof cityBoundaries[parseInt(lastCityLoaded)] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[parseInt(lastCityLoaded)]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	*/
	executeDefaultEffectsAndCamera();
}

function clearCalgaryOfficeMarketSales()
{
	if(typeof window.calgaryOfficeSalePrimitives != "undefined" && window.calgaryOfficeSalePrimitives != null)
	{
		for(var i = 0; i < window.calgaryOfficeSalePrimitives.length; i++)
		{
			if(typeof window.calgaryOfficeSalePrimitives[i] != "undefined")
				window.calgaryOfficeSalePrimitives[i].destroy();
		}
	}
	window.calgaryOfficeSalePrimitives = [];
	if(typeof window.calgaryOfficeSalePrimitivesLabels != "undefined" && window.calgaryOfficeSalePrimitivesLabels != null)
	{
		for(var i = 0; i < window.calgaryOfficeSalePrimitivesLabels.length; i++)
		{
			viewer.entities.removeById(window.calgaryOfficeSalePrimitivesLabels[i]);
		}
		//window.calgaryOfficeSalePrimitivesLabels.destroy();
	}
	window.calgaryOfficeSalePrimitivesLabels = [];
	window.salePriceLabelsVisible = false;
	window.pricePsfLabelsVisible = false;
	window.officeSalesByBuilding = {};
}

//Sale Price/Price PSF labels for every building are pre-created (show:false) in createCalgaryOfficeMarketSales()
//as "label-{idtbuilding}" and "label-psf-{idtbuilding}", all tracked in window.calgaryOfficeSalePrimitivesLabels -
//these two just flip .show on the right set (mutually exclusive) instead of recreating anything.
window.salePriceLabelsVisible = false;
window.pricePsfLabelsVisible = false;
function toggleAllSalePriceLabels()
{
	if(typeof window.calgaryOfficeSalePrimitivesLabels == "undefined" || window.calgaryOfficeSalePrimitivesLabels == null)
		return;
	window.salePriceLabelsVisible = !window.salePriceLabelsVisible;
	window.pricePsfLabelsVisible = false;
	$.each(window.calgaryOfficeSalePrimitivesLabels, function (i, id){
		var ent = viewer.entities.getById(id);
		if(typeof ent == "undefined" || ent == null)
			return;
		if(id.indexOf("label-psf-") === 0)
			ent.show = false;
		else
			ent.show = window.salePriceLabelsVisible;
	});
}
function toggleAllPricePsfLabels()
{
	if(typeof window.calgaryOfficeSalePrimitivesLabels == "undefined" || window.calgaryOfficeSalePrimitivesLabels == null)
		return;
	window.pricePsfLabelsVisible = !window.pricePsfLabelsVisible;
	window.salePriceLabelsVisible = false;
	$.each(window.calgaryOfficeSalePrimitivesLabels, function (i, id){
		var ent = viewer.entities.getById(id);
		if(typeof ent == "undefined" || ent == null)
			return;
		if(id.indexOf("label-psf-") === 0)
			ent.show = window.pricePsfLabelsVisible;
		else
			ent.show = false;
	});
}

initiatePriceSQMRange();
function initiatePriceSQMRange()
{
	window.priceSQMRange = [];
	window.priceSQMRange.push({low: 1800, high: 120000, color: "#FF0000"});
	window.priceSQMRange.push({low: 1400, high: 1800, color: "#FF8000"});
	window.priceSQMRange.push({low: 1200, high: 1400, color: "#FFFF00"});
	window.priceSQMRange.push({low: 800, high: 1200, color: "#009900"});
	window.priceSQMRange.push({low: 500, high: 800, color: "#00FFFF"});
	window.priceSQMRange.push({low: 0, high: 500, color: "#0080FF"});
}

window.arealyticSuiteHeight = [];
function highlightSydneyArealyticsSuitesWithPricePerSQM()
{
	viewer.entities.removeById("FogEffectEntity");debugger;viewer.entities.removeById("NewFogEffectEntity");
	//viewer.entities.removeById("FogEffectEntityPreload");
	if(typeof cityBoundaries[23] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[23]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	if(typeof window.priceSQMRange == "undefined")
	{
		initiatePriceSQMRange();
	}
	updateURL();
	ShowLegend();
	$.each(window.improvedSuitesIndexes, function(indexes, key){
		if(typeof window.improvedSuites[indexes] != "undefined")
		{
			////console.log(improvedSuites[indexes].length);
			var partialCoords = [];
			if(improvedSuites[indexes].length > 1 && improvedSuites[indexes][0].coords != null && improvedSuites[indexes][0].coords != "")
			{
				partialCoords = splitPolygonIntoPieces(improvedSuites[indexes][0].coords, improvedSuites[indexes].length);
			}
			else
			{
				partialCoords[0] = improvedSuites[indexes][0].coords;
			}
			
			$.each(improvedSuites[indexes], function (cntr, eachSuite){
				//if(parseInt(eachSuite.idtbuilding) == 61687 && eachSuite.SuiteId == 940)//Just for debugging
				if(true)
				{
					//eachSuite = improvedSuites[indexes][0];
					////console.log(eachSuite);
					////console.log("cntr "+cntr);
					////console.log(partialCoords);
					floorHeight = (eachSuite.altitude / eachSuite.floors);
					if(floorHeight < 2 || floorHeight > 8)
						floorHeight = 4;
					
					var clr = getColorForPricePerSQM(eachSuite.PricePerSQM);
					if(defaultSuiteId != null && defaultSuiteId == eachSuite.SuiteId)
					{
						clr = clr.withAlpha(1);
					}
					if(clr != null)
					{
						var baseFloorHeight = 0;
						if(!isNaN(parseFloat(eachSuite.basefloorheight)))
						{
							baseFloorHeight = parseFloat(eachSuite.basefloorheight);
						}
						if(eachSuite.floor_height != null && parseFloat(eachSuite.floor_height) > 0)
							floorHeight = parseFloat(eachSuite.floor_height);
						if(isNaN(parseFloat(eachSuite.FloorNumber)))
						{
							eachSuite.FloorNumber = 1;//To Fix Levels B-1 etc types
						}
						if(!isNaN(parseFloat(eachSuite.FloorNumber)) && typeof eachSuite.FloorNumber != "undefined" && eachSuite.FloorNumber != null)
						{
							arealyticSuiteHeight[indexes] = [];
							arealyticSuiteHeight[indexes][0] = baseFloorHeight + ((parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)) - parseFloat(floorHeight));
							arealyticSuiteHeight[indexes][1] = baseFloorHeight + (parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber));
							var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
									geometryInstances : new Cesium.GeometryInstance({
										geometry : new Cesium.PolygonGeometry({
										  polygonHierarchy : new Cesium.PolygonHierarchy(
											Cesium.Cartesian3.fromDegreesArray(eval("["+partialCoords[cntr]+"]"))
										  ),
										  extrudedHeight: baseFloorHeight + ((parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)) - parseFloat(floorHeight)),
										  height: baseFloorHeight + (parseFloat(floorHeight) * parseInt(eachSuite.FloorNumber)),
										}),
										attributes : {
											//color : defaultPrimitiveHighlightColor,
											color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
											show : new Cesium.ShowGeometryInstanceAttribute(true)
										},
										id : "arealyticSuitePriceSQM-"+eachSuite.idtbuilding+"-"+indexes+"-"+cntr+"-"+parseInt(eachSuite.FloorNumber),
									}),
									classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
								}));
								
							window.ArealyticsSuitePrimitives.push(ent);
						}
						if(defaultSuiteId != null && defaultSuiteId == eachSuite.SuiteId)
						{
							//console.log("default Entity");
							//console.log(ent);
							ShowInfoboxForSuite(indexes, cntr);
							defaultSuiteId = null;
							selectedPrimitive = ent.primitive;
							selectedPrimitiveId =  "arealyticSuitePriceSQM-"+eachSuite.idtbuilding+"-"+indexes+"-"+cntr;
						}
					}
				}
			});
		}
	});
	executeDefaultEffectsAndCamera();
	window.lastHolesString = '';
}

function clearSydneyArealyticsSuites()
{
	if(typeof window.ArealyticsSuitePrimitives != "undefined" && window.ArealyticsSuitePrimitives != null)
	{
		for(var i = 0; i < window.ArealyticsSuitePrimitives.length; i++)
		{
			window.ArealyticsSuitePrimitives[i].destroy();
		}
		window.ArealyticsSuitePrimitives = [];
	}
}

function getColorForPricePerSQM(PricePerSQM, justColor = false)
{
	if(typeof window.priceSQMRange == "undefined")
	{
		initiatePriceSQMRange();
	}
	////console.log("getColorForPricePerSQM() => PricePerSQM => "+PricePerSQM);
	if(PricePerSQM == null || isNaN(PricePerSQM))
		PricePerSQM = 0;
	var matchFound = "";
	$.each(window.priceSQMRange, function (index, eachRow){
		if(matchFound == "" && eachRow.low < PricePerSQM && eachRow.high >= PricePerSQM)
		{
			matchFound = eachRow.color;
		}
	});
	////console.log(PricePerSQM + " => color "+matchFound);
	if(matchFound != "")
	{
		if(justColor)
			return matchFound;
		else
			return Cesium.Color.fromCssColorString(matchFound).withAlpha(0.7);
			
	}
	else
		return null;
}

var ArealyticsJoins = [];
var ArealyticsJoinPrimitives = [];
function getSydneyArealyticsJoins() {
	if(ArealyticsJoins.length == 0)
	{
		$.ajax({
			method: "POST",
			/*
			url: "getArealyticsSuiteData.php",
			data: { "justjoins" : "YES"},
			*/
			url: "controllers/buildingController.php",
			data: { param : "getSydneyArealyticSuites", justjoins : "YES" }
		}).done(function (data) {
			data = $.parseJSON( data.trim() );
			//console.log(data);
			ArealyticsJoins = data;
			highlightSydneyArealyticsJoins();
		});
	}
	else
	{
		highlightSydneyArealyticsJoins();
	}
}

function highlightSydneyArealyticsJoins()
{
	$.each(ArealyticsJoins, function(i, eachSuite){
		
		clr = Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.5);
		
		var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
				geometryInstances : new Cesium.GeometryInstance({
					geometry : new Cesium.PolygonGeometry({
					  polygonHierarchy : new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(eval("["+eachSuite.coords+"]"))
					  ),
					  height : -100,
					  extrudedHeight : 3000
					}),
					attributes : {
						//color : defaultPrimitiveHighlightColor,
						color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
						show : new Cesium.ShowGeometryInstanceAttribute(true)
					},
					id : "bldg2-"+eachSuite.idtbuilding+"-"+i,
				}),
				classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
			}));
			
		ArealyticsJoinPrimitives.push(ent);
	});
	
}

function clearSydneyArealyticsJoins()
{
	$(".legendContainer").css("display", "none");
	closeInfoboxV2();
	for(var i = 0; i < ArealyticsJoinPrimitives.length; i++)
	{
		ArealyticsJoinPrimitives[i].destroy();
	}
	ArealyticsJoinPrimitives = [];
}

function toggleFloorPlan(idtbuilding)
{
	if(idtbuilding == 62)//Dome Tower
	{
		ToggleInverseClipFloorPlanFeature();
	}
	else if(idtbuilding == 60)//TD Tower
	{
		ToggleInverseClipFloorPlanFeatureTDTower37();
	}
	else if(idtbuilding == 1574)//Home Oil Tower
	{
		ToggleInverseClipFloorPlanFeatureHomeOilTower();
	}
	else
	{
		return "";
	}
}


document.addEventListener('dblclick', function (event) {
  event.preventDefault(); // Prevent default double-tap behavior
});


$('.dropdown-item-up').on('click', function (e) {
  e.preventDefault(); // Prevent default link behavior
  $('.dropdown-item-up').removeClass('selected'); // Remove 'selected' from all
  $(this).addClass('selected'); // Add 'selected' to the clicked item
});


$(document).ready(function () {
	initiateSettingDropdown();
	initiateSkylineDropdown();
	initiateCameraDropdown();
	
	if(isMobile.any() == null)
	{
		window.desktop_logo_display = false;
		window.mobile_logo_display = false;
		setResetSettingFlags("showLogo-li", false);
		setResetSettingFlags("hideLogo-li", true);
	}
	else
	{
		window.desktop_logo_display = false;
		window.mobile_logo_display = false;
		setResetSettingFlags("showLogo-li", false);
		setResetSettingFlags("hideLogo-li", true);
	}
	
	if(showLogos == 1)
	{
		console.log("showLogos: " + showLogos);
		if(isMobile.any() == null)
		{
			window.desktop_logo_display = true;
			window.mobile_logo_display = false;
			setResetSettingFlags("showLogo-li", true);
			setResetSettingFlags("hideLogo-li", false);
		}
		else
		{
			window.desktop_logo_display = false;
			window.mobile_logo_display = true;
			setResetSettingFlags("showLogo-li", true);
			setResetSettingFlags("hideLogo-li", false);
		}
		showLogos = null;
	}
	//Add more dropdowns here
});

window.settingDropdownInitiated = false;
window.desktop_logo_display = false;
window.mobile_logo_display = false;
function initiateSettingDropdown()
{
	//console.log("initiateSettingDropdown()");
	window.settingDropdownInitiated = true;
	$('.dropdown2-toggle').on('click', function (e) {
		toggleSearchBox(true);
		$(".dropdown3").removeClass("active");
		$(".dropdown3-toggle").attr("src", "images/location_city.png");
		e.stopPropagation(); // Prevent click from propagating
		$(this).closest('.dropdown2').toggleClass('active'); // Toggle 'active' class on parent
		if($(this).closest('.dropdown2').hasClass('active'))
		{
			$(".dropdown2-toggle").attr("src", "images/settings-active.png");
		}
		else
		{
			$(".dropdown2-toggle").attr("src", "images/settings.png");
		}
	});
	
	  // Add click event for dropdown items to toggle selection
	  $('.dropdown2-item').on('click', function (e) {
		e.preventDefault(); // Prevent default link behavior

		// Toggle 'selected' class on the clicked item
		$(this).toggleClass('selected');
		
		if($(this).attr("data-text") == "White Overlay")
		{
			//White / Dark are a radio pair - selecting one always deselects the other.
			applyOverlayMode("white");
			return;
		}
		else if($(this).attr("data-text") == "Dark Overlay")
		{
			applyOverlayMode("dark");
			return;
		}
		else if($(this).attr("data-text") == "My Account")
		{
			$(".dropdown2-toggle").attr("src", "images/settings.png");
			$(".dropdown2 ").removeClass("active");
			setResetSettingFlags("myaccount-li", false);
			getLoggedInUserDetails(parseInt(loggedInUserId));
		}
		else if($(this).attr("data-text") == "Show Logo")
		{
			if(isMobile.any() == null)
			{
				window.desktop_logo_display = true;
			}
			else
			{
				window.mobile_logo_display = true;
			}
			setResetSettingFlags("showLogo-li", true);
			setResetSettingFlags("hideLogo-li", false);
			showLogosFlag = true;
			updateURL();
		}
		else if($(this).attr("data-text") == "Hide Logo")
		{
			if(isMobile.any() == null)
			{
				window.desktop_logo_display = false;
			}
			else
			{
				window.mobile_logo_display = false;
			}
			setResetSettingFlags("showLogo-li", false);
			setResetSettingFlags("hideLogo-li", true);
			showLogosFlag = null;
			updateURL();
		}
		else if($(this).attr("data-text") == "FPS")
		{
			viewer.scene.debugShowFramesPerSecond = !viewer.scene.debugShowFramesPerSecond;
		}
		else if($(this).attr("data-text") == "Measure")
		{
			if($("#measurementPanel").css("display") == "block")
			{
				CloseMeasurementPanel();
			}
			else
			{
				showMeasurementPanel();
			}
		}
		else if($(this).attr("data-text") == "Shrink")
		{
			toggleShrinkTileset();
		}
		else if($(this).attr("data-text") == "Reset")
		{
			//New function
			clearAllEffects();
			settingResetToDefault();
			$(".dropdown2-toggle").attr("src", "images/settings.png");
			$(".dropdown2 ").removeClass("active");
		}
		else if($(this).attr("data-text") == "Pano-View")
		{
			//prepareHorizonCameraView(devSelectedBuilding, window.lastFloorAltitude);
			//prepareFloorPanoView(devSelectedBuilding, window.lastFloorAltitude);
			//lookOutwardFromPoint(devSelectedBuilding, window.lastFloorAltitude);
			//lookOutwardFromPointV2([window.SelectedBuildingLon, window.SelectedBuildingLat], devSelectedBuilding, window.lastFloorAltitude);
			//lookOutwardFromPointV3([window.SelectedBuildingLon, window.SelectedBuildingLat], devSelectedBuilding, window.lastFloorAltitude);
			prepareForPanoViewForFloor(devSelectedBuilding, window.lastFloor, true, true);
			$(this).removeClass('selected');
			$(".dropdown2-toggle").click();
			$(".dropdown2-toggle").attr("src", "images/settings.png");
		}
		else if($(this).attr("data-text") == "User")
		{
			$(this).removeClass('selected');
			//Do Nothing!
		}
	  });

	  // Close the dropdown when clicking outside
	  /*
	  $(document).on('click', function () {
		  //console.log("Outside Click event");
		$('.dropdown2').removeClass('active'); // Remove 'active' from all dropdowns
		$(".dropdown2-toggle").attr("src", "images/settings.png");
	  });
	  */
}

function EnableBottomPanoButton()
{
	$(".panoButton").show();
	//$("#viewerController").css("width", "220px");
	$("#panoButtonImageContainer").attr("src", "images/visibility.png");
	window.panoSpinCentroid = [];
	window.panoSpinHeight = 0;
	window.isPanoSpinInProgress = false;
}
function DisableBottomPanoButton()
{
	stopRotateIfInProgress();
	$(".panoButton").hide();
	setWidthOfBottomBox();
	$("#panoButtonImageContainer").attr("src", "images/visibility.png");
}

function TogglePanoRotationForBuilding()
{
	if($("#panoButtonImageContainer").attr("src") == 'images/visibility-active.png' || $(".full-screen-arrow").css("display") == "block")
	{
		$("#panoButtonImageContainer").attr("src", "images/visibility.png");
		$(".full-screen-arrow").hide();
	}
	else
	{
		prepareForPanoViewForFloor(devSelectedBuilding, window.lastFloor, true, true);
		$("#panoButtonImageContainer").attr("src", "images/visibility-active.png");
	}
}

window.cameraDropdownInitiated = false;
window.IsEnableRotateAroundPoint = false;
function initiateCameraDropdown()
{
	//console.log("now initiateSkylineDropdown()");
	window.cameraDropdownInitiated = true;
	$('.dropdownCam-toggle').on('click', function (e) {
		// Market Orbit turns this same button into a play/pause control while
		// it's active: single click pauses/resumes in place instead of the
		// generic "stop whatever's rotating" behavior below. Double click
		// (bound separately) fully stops it. Only treat it as play/pause when
		// the icon is actually showing one of those two states - not just
		// because window.fixedOrbitInProgress happens to be true (e.g. mid-
		// transition between states).
		var currentIconSrc = $(".dropdownCam-toggle").attr("src");
		if (window.fixedOrbitInProgress && (currentIconSrc == 'images/pause-active.png' || currentIconSrc == 'images/play-button.png'))
		{
			e.stopPropagation();
			ToggleFixedPointOrbitPause();
			return;
		}
		// Properties building tour turns this same button into a play/pause control too.
		if (window.companyBuildingTourActive && (currentIconSrc == 'images/pause-active.png' || currentIconSrc == 'images/play-button.png'))
		{
			e.stopPropagation();
			toggleCompanyBuildingTourPause();
			return;
		}

		if($(".dropdownCam-toggle").attr("src") != 'images/pause-active.png')
		{
			toggleSearchBox(true);
		}
		$(".dropdown3").removeClass("active");
		$(".dropdown2").removeClass("active");
		$(".dropdown3-toggle").attr("src", "images/location_city.png");
		$(".dropdown2-toggle").attr("src", "images/settings.png");

		e.stopPropagation(); // Prevent click from propagating
		if($(".dropdownCam").hasClass("active") || $(".dropdownCam-toggle").attr("src") == 'images/pause-active.png')
		{
			$('.dropdownCam-item').removeClass('selected');
			//$(".dropdownCam-toggle").attr("src", "images/pause-active.png");
			//$(".rotateTooltip").hide();
			if (autoRotateSlow)//City Orbit
			{
				ToggleCameraRotationSlowly();
			}
			if (IsEnableRotateAroundPoint)//Point Orbit
			{
				unsubscribeSPoint();
				camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
				IsEnableRotateAroundPoint = false;
			}
			if (IsEnableRotateAroundBuilding)//Building Orbit
			{
				ToggleRotateAroundBuilding();
			}
			$(".dropdownCam-toggle").attr("src", "images/360.png");
			$(".dropdownCam").removeClass('active');
		}
		else
		{
			$(".dropdownCam").toggleClass('active');
		}
	});

	$('.dropdownCam-toggle').on('dblclick', function (e) {
		if (window.fixedOrbitInProgress || window.fixedOrbitStarting)
		{
			e.stopPropagation();
			StopFixedPointOrbit();
			$('.dropdownCam-item').removeClass('selected');
			$(".dropdownCam").removeClass('active');
		}
		if (window.companyBuildingTourActive)
		{
			e.stopPropagation();
			stopCompanyBuildingTour();
			$(".dropdownCam").removeClass('active');
		}
	});

	$('.dropdownCam-item').on('click', function (e) {
		e.preventDefault(); // Prevent default link behavior
		$('.dropdownCam').removeClass('active');

		if($(this).attr("data-text") == "Market Orbit")
		{
			// Own the 'selected' checkmark here instead of the unconditional
			// toggle below - it should only show while an orbit is actually
			// running, not just because the item was clicked.
			if (window.fixedOrbitInProgress || window.fixedOrbitStarting)
			{
				console.log("!!!! Market Orbit Disabled !!!!");
				StopFixedPointOrbit();
				$(this).removeClass('selected');
				return;
			}

			console.log("!!!! Market Orbit Enabled!!!!");
			//Rotate button is shared - stop a running Properties tour before starting an orbit.
			if (typeof stopCompanyBuildingTour == "function" && window.companyBuildingTourActive)
				stopCompanyBuildingTour();
			var orbitList = marketOrbitDetails[lastMarketLoaded];
			if(typeof orbitList == "undefined" || orbitList == null || orbitList.length == 0)
			{
				console.log("No orbit camera saved for this market yet.");
				return;
			}

			var orbit = orbitList[0];
			$(this).addClass('selected');
			StartFixedPointOrbit(
				parseFloat(orbit.point_longitude),
				parseFloat(orbit.point_latitude),
				parseFloat(orbit.point_altitude),
				parseFloat(orbit.camera_longitude),
				parseFloat(orbit.camera_latitude),
				parseFloat(orbit.camera_altitude),
				parseFloat(orbit.camera_roll),
				parseFloat(orbit.orbit_speed)
			);
			return;
		}

		// Toggle 'selected' class on the clicked item
		$(this).toggleClass('selected');

		if($(this).attr("data-text") == "City Orbit")
		{
			console.log("!!!! City Orbit Enabled!!!!");
			ToggleCameraRotationSlowly();
			FlyToCityOrbit();
		}
		else if($(this).attr("data-text") == "Point Orbit")
		{
			IsEnableRotateAroundPoint = true;
			//ToggleCameraRotationSlowly();
		}
		else if($(this).attr("data-text") == "Building Orbit")
		{
			if(typeof buildingPointSelected != "undefined")
			{
				ToggleRotateAroundBuilding();
			}
			else
			{
				$('.dropdownCam').removeClass('active');
			}
		}
	  });
}
	
window.skylineDropdownInitiated = false;
function initiateSkylineDropdown()
{
	console.log("now initiateSkylineDropdown()");
	window.skylineDropdownInitiated = true;
	$(document)
  .off('click', '.dropdown3-toggle')
  .on('click', '.dropdown3-toggle', function (e) {
		setDropdownWidthClass();
		toggleSearchBox(true);
		$(".dropdown2").removeClass("active");
		$(".dropdown2-toggle").attr("src", "images/settings.png");
		
		e.stopPropagation(); // Prevent click from propagating
		$(this).closest('.dropdown3').toggleClass('active'); // Toggle 'active' class on parent
		if($(this).closest('.dropdown3').hasClass('active'))
		{
			$(".dropdown3-toggle").attr("src", "images/location_city-active.png");
		}
		else
		{
			$(".dropdown3-toggle").attr("src", "images/location_city.png");
		}
	});

	  // Add click event for dropdown items to toggle selection
	  //$('.dropdown3-item').on('click', function (e) {
	  $(document)
	  .off('click', '.dropdown3-item')
	  .on('click', '.dropdown3-item', function (e) {
		e.preventDefault(); // Prevent default link behavior

		// Toggle 'selected' class on the clicked item
		//$(this).toggleClass('selected');
		
		if($(this).attr("data-text") == "City skyline" || $(this).attr("data-text") == "city-skyline")
		{
			flyToCitySkylineSlow($(this).attr("data-id"));
		}
		else if($(this).attr("data-text") == "City skyline 2" || $(this).attr("data-text") == "city-skyline2")
		{
			flyToCitySkyline2Slow($(this).attr("data-id"));
		}
		else if($(this).attr("data-text") == "Submarket Max Building")
		{
			console.log("Event Listener: Submarket Max Building");
			setResetSettingFlags("city-submarket-tour-li", true)
			flyToSubmarketCamera($(this).attr("data-id"), "idtcamera", true);
		}
		else if($(this).attr("data-text") == "market-view")
		{
			flyToIdtcamera($(this).attr("data-id"));
		}
		else
		{
			flyToSubmarketCamera($(this).attr("data-id"));
		}

		//Collapse the Views menu once a view has been picked.
		$(".dropdown3").removeClass("active");
		$(".dropdown3-toggle").attr("src", "images/location_city.png");
	  });

	  // Close the dropdown when clicking outside
	  /*
	  $(document).on('click', function () {
		  //console.log("Outside Click event");
		$('.dropdown3').removeClass('active'); // Remove 'active' from all dropdowns
		$(".dropdown3-toggle").attr("src", "images/settings.png");
	  });
	  */
}

var IsEnableSubmarketCameraRotation= false;
function ToggleRotateAroundSubmarket(lon, lat, altitude) {
  if (IsEnableSubmarketCameraRotation) {
    IsEnableSubmarketCameraRotation = false;
    SubmarketCameraRotationBtn = false;
    $("#orbit").css("font-weight", "normal");
    StopSubmarketCameraRotation();
  } else {
    IsEnableSubmarketCameraRotation = true;
    SubmarketCameraRotationBtn = true;
    $("#orbit").css("font-weight", "bold");
    SubmarketCameraRotation(lon, lat, altitude);
  }
}

function SubmarketCameraRotation(lon, lat, altitude) {
  currentPosition = Cesium.Cartesian3.fromDegrees(lon, lat, altitude);
  var pitch = viewer.camera.pitch;
  var heading = camera.heading;
  unsubscribeSubmarketRotation = viewer.clock.onTick.addEventListener(() => {
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    const SMOOTHNESS = 1400; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation),
    );
  });
}

function StopSubmarketCameraRotation() {
  viewer.scene.screenSpaceCameraController.enableZoom = true;
  if (unsubscribeSubmarketRotation != null) {
    unsubscribeSubmarketRotation();
  }
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function flyToBuildingNADIRView(id)
{
	if(typeof TempBldgData[id] != "undefined")
	{
		var alt = TempBldgData[id].altitude;
		if(alt == null || alt == 0)
		{
			alt = cameraAltitudeAdjustment + (parseInt(TempBldgData[id].floors) * 4) + 100;
		}
		alt = cameraAltitudeAdjustment + (parseInt(TempBldgData[id].floors) * 4) + 100;
		if(TempBldgData[id].latitude == null || TempBldgData[id].longitude == null)
		{
			var t = TempBldgData[id].coords.split(",");
			lookDownAtPoint(t[1], t[0], alt);
		}
		else
		{
			lookDownAtPoint(TempBldgData[id].latitude, TempBldgData[id].longitude, alt);
		}
	}
}

function lookDownAtPoint(lat, lon, heightMeters, durationSeconds = 3) {
    const destination = Cesium.Cartesian3.fromDegrees(
        lon,
        lat,
        heightMeters
    );

    viewer.camera.flyTo({
        destination: destination,
        orientation: {
            heading: Cesium.Math.toRadians(0),   // North
            pitch: Cesium.Math.toRadians(-90),   // Look straight down
            roll: 0
        },
        duration: durationSeconds
    });
}

function settingResetToDefault()
{
	lastSelectedBuilding = "";
	//Reset Setting to Default - White overlay on, Dark overlay off
	applyOverlayMode("white");

	setResetSettingFlags("shrink-li", false);
	setResetSettingFlags("toggleLogo-li", false);
	toggleShrinkTileset(true);
	
	setResetSettingFlags("fps-li", false);
	viewer.scene.debugShowFramesPerSecond = false;
	
	setResetSettingFlags("reset-li", false);
	
	//Measurement
	setResetSettingFlags("measure-li", false);
	MeasurementMode = null;
	CloseMeasurementPanel();
	
	//Reset all infobox effects
	//Do not close infobox
	clearAllEffectsEnabled();
	
	//Clear all search
	toggleSearchBox(true);//Force Close
	
	//Clear building / Floor highlight
	//Do not clear highlight
	devSelectedBuilding = lastSelectedBuilding;//To retain infobox
	loadNewBuildingTypeView(lastSelectedBuildingType);
	
	//Reset Effects Array and Camera both
	initiateEffectsArray();
	
	unsubscribeSlowZoom();
	unsubscribeSPoint();
	StopCameraRotationAroundBuilding();

	updateURL();
}

setTimeout(function(){
	const element = document.querySelector('body');
	if(element != null)
	{
		element.addEventListener('touchend', (event) => {
		  const now = new Date().getTime();
		  if(typeof lastTouchEnd != "undefined")
		  {
			  if (now - lastTouchEnd <= 300) {
				event.preventDefault(); // Prevent zoom only for this element
			  }
		  }
		  lastTouchEnd = now;
		});
	}

	//console.log("settings event timeOut()");
	if(typeof window.settingDropdownInitiated == "undefined" || !window.settingDropdownInitiated)
	{
		initiateSettingDropdown();
	}
}, 2000);

/*
document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById("loginModal");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.getElementsByClassName("close")[0];
    openModalBtn.onclick = function() {
        modal.style.display = "block";
    }

    closeModalBtn.onclick = function() {
        modal.style.display = "none";
    }
	
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
	
    document.getElementById("loginForm").onsubmit = function(event) {
        //event.preventDefault();
        //alert('Login form submitted!');
    }
});
*/
/*
function copyURLToClipboard()
{
	//Logic for copying URL
	navigator.clipboard.writeText(window.currentURL);
	$("#copyURLButton").text("Copied");
	setTimeout(function (){$("#copyURLButton").text("Copy URL")}, 2000);
}

function copyURLToClipboardV2()
{
	//Logic for copying URL
	$.ajax({
		method: "POST",
		url: "controllers/tinyURLController.php",
		data: { param : "createTinyURL", URL : window.currentURL }
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		//console.log(data);
		 
		navigator.clipboard.writeText("http://visgrid.com/measure/app10/q="+data.shortURL);
		$("#copyURLButton").text("Copied");
		setTimeout(function (){$("#copyURLButton").text("Copy URL")}, 2000);
	});
}
*/
function copyBuildingId() {
    var copyText = $("#buildingIdToCopy").html();
    navigator.clipboard.writeText(copyText)
    .then(() => {
      alert("Copied to clipboard: " + copyText);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
}


function initiateCopyButton() {

	function fallbackCopy(text) {
		var textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed"; // prevent scrolling on iOS
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();

		try {
			document.execCommand("copy");
			//console.log("Fallback: Copied successfully");
		} catch (err) {
			console.error("Fallback copy failed", err);
		}

		document.body.removeChild(textarea);
	}

	function copyTextToClipboard(text, e) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(text).then(() => {
				showTooltip(e);
			}).catch(err => {
				console.error("Clipboard API failed, using fallback:", err);
				fallbackCopy(text);
				showTooltip(e);
			});
		} else {
			fallbackCopy(text);
			showTooltip(e);
		}
	}

	function showTooltip(e) {
		const tooltip = document.getElementById('tooltip');
		if (!tooltip) return;

		tooltip.style.left = e.pageX - 20 + 'px';
		tooltip.style.top = e.pageY - 30 + 'px';

		tooltip.classList.add('show');

		setTimeout(() => {
			tooltip.classList.remove('show');
		}, 500);
	}

	// Copy URL button handler
	if (document.getElementById('copyURLButton') != null) {
		document.getElementById('copyURLButton').addEventListener('click', (e) => {
			var apiUrl = "./controllers/createShortCode.php?id=1&name=" + $(".buildingNameOnInfobox").text() + "&url=" + encodeURIComponent(window.currentURL);

			fetch(apiUrl)
				.then(response => response.json())
				.then(data => {
					if (data.shortURL) {
						const shortCode = data.shortURL;
						const fullUrl = tinyBaseURL+"?q=" + shortCode;
						copyTextToClipboard(fullUrl, e);
					} else {
						console.error("No shortURL returned");
					}
				})
				.catch(err => {
					console.error("Error in fetch: ", err);
				});
		});
	}

	// Copy buildingId handler
	if (document.getElementById('buildingIdToCopy') != null) {
		document.getElementById('buildingIdToCopy').addEventListener('click', function (e) {
			var copyText = $("#buildingIdToCopy").html();
			copyTextToClipboard(copyText, e);
		});
	}
}

function stopRotateIfInProgress()
{
	//Floor Views.
	if($("#panoButtonImageContainer").attr("src") == 'images/visibility-active.png' || $(".full-screen-arrow").css("display") == "block")
	{
		TogglePanoRotationForBuilding();
	}
	if(autoRotateSlow)
	{
		window.autoLoadCityCamera = true;
		ToggleCameraRotationSlowly();
		return true;
	}
	return false;
}
window.lastSelectedSuite = null;
function openFullScreenImage(idtbuilding, floorNumber, index, imgCounter = 0, imgType = "", idtsuite = 0, floorPlanView = "No")
{
	if(lastSelectedBuildingType == 'Floorplan' || floorPlanView == "Yes") //Means Availalbe Office Space
	{
		openFullScreenImageAOS(idtbuilding, floorNumber, index, imgCounter, imgType, idtsuite)
		return;
	}
	window.modalImageCurrentCounter = parseInt(imgCounter);
	window.modalImageType = imgType;
	window.lastSelectedSuite = idtsuite;
	var url = "";
	var details = "";
	var isAvailableOfficeSuite = false;
	if(typeof window.floorPlanDetails[parseInt(idtbuilding)] != "undefined" && typeof window.floorPlanDetails[parseInt(idtbuilding)][parseInt(floorNumber)] != "undefined")
	{
		details = window.floorPlanDetails[parseInt(idtbuilding)][parseInt(floorNumber)];
	}
	else if(typeof window.availableOfficeSpaceFloorWise[parseInt(idtbuilding)][parseInt(floorNumber)] != "undefined")
	{
		isAvailableOfficeSuite = true;
		$.each(window.availableOfficeSpaceFloorWise[parseInt(idtbuilding)][parseInt(floorNumber)], function (i4, r4){
			if(r4.idtsuite == idtsuite)
				details = r4;
		});
	}
	else
		return;
	if(imgType == "")
	{
		url = adminBaseUrl+details[index].image_path+details[index].image_name;
	}
	else
	{
		//console.log(window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][imgCounter].image_path + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType]);
		url = adminBaseUrl + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][imgCounter].image_path + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][imgCounter].image_name;
	}
	$("#fullScreenModal").show();
	window.floorplanFullScreenActive = false;
	$("#floorplanShareURLButton").hide();
	var bldgName = "";
	if(isAvailableOfficeSuite)
	{
		$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox buildingNameOnInfoboxBOLD modalHeaderText'>"+bldgName+"</span>");
		
		var st = "<div style='float:left;'><b>Floor:</b> <span class='buildingNameOnInfobox'>"+floorNumber+"</span></div><br clear='all'>";
		st += "<div style='float:left;'><b>Suite:</b> <span class='buildingNameOnInfobox'>"+details["suite_name"]+"</span></div><br clear='all'>";
		
		if(details["suite_area"] != "" && parseInt(details["suite_area"]) > 0)
		{
			st += "<div style='float:left; position: absolute;'><b>Area:</b> <span class='buildingNameOnInfobox'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(details["suite_area"]), "", " "+cityAreaMeasurementUnit)+"</span></div><br clear='all'>";
		}
		url = details["image_path"]+details["image_name"];
		//st += "<div style='float:left;'><b>Note:</b> <span class='buildingNameOnInfobox'>"+details[index]["suite_description"]+"</span></div>";
		
		$(".fullscreen-buildingname").html(st);
		
		var modalImage = '';
		if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
			modalImage += '<button class="prev" onclick="changeModalImage('+details.idtsuite+', -1)">&#10094;</button>';
		
			modalImage += '<img id="modalFullScreenImage" src="'+url+'" width="90%">';
		
		if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
			modalImage += '<button class="next" onclick="changeModalImage('+details.idtsuite+', 1)">&#10095;</button>';
		$(".fullscreen-innter-content").html(modalImage);
		
		firstTimeFullScreenModalOpened();
		return;
	}
	else
	{
		if(typeof window.TempBldgData[idtbuilding] != "undefined")
		{
			$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox buildingNameOnInfoboxBOLD modalHeaderText'>"+window.TempBldgData[idtbuilding].sbuildingname+"</span>");
		}
		else if(typeof window.cityFloorPlan[parseInt(lastCityLoaded)][parseInt(devSelectedBuilding)] != "undefined")
		{
			$.each(window.cityFloorPlan[parseInt(lastCityLoaded)][parseInt(devSelectedBuilding)], function (floor, floorData){
				if(typeof floor != "undefined" && typeof floorData != "undefined" && bldgName == "")
				{
					bldgName = floorData[0]["sbuildingname"];
				}
			});
			$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox buildingNameOnInfoboxBOLD modalHeaderText'>"+bldgName+"</span>");
		}
	}
	
	//$(".fullscreen-buildingname").html("<span class='buildingNameOnInfobox'>"+window.TempBldgData[lastSelectedBuilding].sbuildingname + "</span>&nbsp;&nbsp;&nbsp;<br />Suite: <span class='buildingNameOnInfobox'>"+details[0]["suite_name"]+"</span><br /><span style='float:left;'>"+details[0]["suite_description"]+"</span>");
	
	var st = "<div style='float:left;'><b>Floor:</b> <span class='buildingNameOnInfobox'>"+floorNumber+"</span></div><br clear='all'>";
	st += "<div style='float:left;'><b>Suite:</b> <span class='buildingNameOnInfobox'>"+details[index]["suite_name"]+"</span></div><br clear='all'>";
	
	if(details[index]["suite_area"] != "" && parseInt(details[index]["suite_area"]) > 0)
	{
		st += "<div style='float:left; position: absolute;'><b>Area:</b> <span class='buildingNameOnInfobox'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(details[index]["suite_area"]), "", " "+cityAreaMeasurementUnit)+"</span></div><br clear='all'>";
	}
	//st += "<div style='float:left;'><b>Note:</b> <span class='buildingNameOnInfobox'>"+details[index]["suite_description"]+"</span></div>";
	
	$(".fullscreen-buildingname").html(st);
	
	var modalImage = '';
	if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
		modalImage += '<button class="prev" onclick="changeModalImage('+details[index].idtsuite+', -1)">&#10094;</button>';
	
	if (url.endsWith('.pdf')) {
		modalImage += "<div style='height: 100%; overflow: hidden;'> ";
			modalImage += 'Click here to view<br /><object data="'+url+'"  type="application/pdf" style="width: 100%; height: 100%;"> ';
				modalImage += 'alt : <a href="'+url+'">pdf</a>';
			modalImage += '</object>';
		modalImage += '</div>';
	}
	else
	{
		modalImage += '<img id="modalFullScreenImage" src="'+url+'" width="90%">';
	}
	
	if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
		modalImage += '<button class="next" onclick="changeModalImage('+details[index].idtsuite+', 1)">&#10095;</button>';
	$(".fullscreen-innter-content").html(modalImage);
	
	firstTimeFullScreenModalOpened();
}

function openFullScreenImageAOS(idtbuilding, floorNumber, index, imgCounter = 0, imgType = "", idtsuite = 0)
{
	window.modalImageCurrentCounter = parseInt(imgCounter);
	window.modalImageType = imgType;
	window.lastSelectedSuite = idtsuite;
	var url = "";
	var details = [];
	var isAvailableOfficeSuite = false;
	if(typeof window.availableOfficeSpaceFloorWise[parseInt(idtbuilding)][parseInt(floorNumber)] != "undefined")
	{
		isAvailableOfficeSuite = true;
		$.each(window.availableOfficeSpaceFloorWise[parseInt(idtbuilding)][parseInt(floorNumber)], function (i4, r4){
			if(r4.idtsuite == idtsuite)
				details = r4;
		});
	}
	else
		return;
	if(imgType == "")
	{
		url = adminBaseUrl+details.image_path + details.image_name;
	}
	else
	{
		//console.log(window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][imgCounter].image_path + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType]);
		url = adminBaseUrl + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][imgCounter].image_path + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][imgCounter].image_name;
	}
	$("#fullScreenModal").show();
	window.floorplanFullScreenActive = true;
	$("#floorplanShareURLButton").show();
	updateURL();
	var bldgName = details.sbuildingname;

		$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox buildingNameOnInfoboxBOLD modalHeaderText'>"+bldgName+"</span>");
		/*
		var st = "<div style='float:left;'><b>Floor:</b> <span class='buildingNameOnInfobox'>"+floorNumber+"</span></div><div style='float:right; width:30%;'><img height='100px' src='"+adminBaseUrl+details.companyimage+"'/></div>";
		
		st += "<br clear='all'>";
		st += "<div style='float:left;'><b>Suite:</b> <span class='buildingNameOnInfobox'>"+details["suite_name"]+"</span></div><br clear='all'>";
		
		if(details["suite_area"] != "" && parseInt(details["suite_area"]) > 0)
		{
			st += "<div style='float:left; position: absolute;'><b>Area:</b> <span class='buildingNameOnInfobox'>"+numberWithCommaWithoutDecimal(details["suite_area"], "", " "+cityAreaMeasurementUnit)+"</span></div><br clear='all'>";
		}
		
		//st += "<div style='float:right;' ><img src='../visgrid-tools/uploads/company-images/1753551502_6885128e13a02.png'/></div>";
		
		//url = details["image_path"]+details["image_name"];
		//st += "<div style='float:left;'><b>Note:</b> <span class='buildingNameOnInfobox'>"+details[index]["suite_description"]+"</span></div>";
		
		$(".fullscreen-buildingname").html(st);
		
		var modalImage = '';
		if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
			modalImage += '<button class="prev" onclick="changeModalImage('+details.idtsuite+', -1)">&#10094;</button>';
		
			modalImage += '<img id="modalFullScreenImage" src="'+url+'" width="90%">';
		
		if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
			modalImage += '<button class="next" onclick="changeModalImage('+details.idtsuite+', 1)">&#10095;</button>';
		$(".fullscreen-innter-content").html(modalImage);
		
		firstTimeFullScreenModalOpened();
		*/
		
	
	//$(".fullscreen-buildingname").html("<span class='buildingNameOnInfobox'>"+window.TempBldgData[lastSelectedBuilding].sbuildingname + "</span>&nbsp;&nbsp;&nbsp;<br />Suite: <span class='buildingNameOnInfobox'>"+details[0]["suite_name"]+"</span><br /><span style='float:left;'>"+details[0]["suite_description"]+"</span>");
	
	var st = "<div style='float:left;'><b>Floor:</b> <span class='buildingNameOnInfobox2'>"+floorNumber+"</span></div><br clear='all'>";
	st += "<div style='float:left;'><b>Suite:</b> <span class='buildingNameOnInfobox2'>"+details["suite_name"]+"</span></div><br clear='all'>";
	
	if(details["suite_area"] != "" && parseInt(details["suite_area"]) > 0)
	{
		st += "<div style='float:left; position: absolute;'><b>Area:</b> <span class='buildingNameOnInfobox2'>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(details["suite_area"]), "", " "+cityAreaMeasurementUnit)+"</span></div><br clear='all'>";
	}
	if(details["lease_type"] != "")
	{
		st += "<div style='float:left; position: absolute;'><b>Lease Type:</b> <span class='buildingNameOnInfobox2'>"+details["lease_type"]+"</span></div><br clear='all'>";
	}
	/*
	if(details["companyname"] != "")
	{
		st += "<div style='float:left; position: absolute;'><b>Company:</b> <span class='buildingNameOnInfobox2'>"+details["companyname"]+"</span></div><br clear='all'>";
	}
	*/
	//st += "<div style='float:left;'><b>Note:</b> <span class='buildingNameOnInfobox'>"+details[index]["suite_description"]+"</span></div>";
	
	$(".fullscreen-buildingname").html("");
	$(".modal-left").html(st);
	$(".modal-right").html("<div style='text-align:center;'><img class='modalCompanyLogo' height='100px' src='"+adminBaseUrl+details["companyimage"]+"'/></div>");//<br />"+details["broker"]+"
	
	var modalImage = '';
	if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
		modalImage += '<button class="prev" onclick="changeModalImage('+details.idtsuite+', -1)">&#10094;</button>';
	
	modalImage += '<img id="modalFullScreenImage" class="modalFullScreenImageClass" src="'+url+'" width="90%">';
	modalImage += '<div id="imageOverlay" onclick="zoomImage()"><i class="fa fa-search-plus"></i></div>';

	if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
		modalImage += '<button class="next" onclick="changeModalImage('+details.idtsuite+', 1)">&#10095;</button>';
	$(".modal-center").html(modalImage);
	$(".fullscreen-innter-content").html("");
	
	firstTimeFullScreenModalOpened();
}

function zoomImage() {
    const src = document.getElementById('modalFullScreenImage').src;
    document.getElementById('zoomImage').src = src;
    document.getElementById('zoomView').style.display = 'flex';
}

function closeZoom() {
    document.getElementById('zoomView').style.display = 'none';
}


window.modalImageCurrentCounter = null;
function changeModalImage(idtsuite, step)
{
	if(idtsuite == 0 || idtsuite == null)
	{
		idtsuite = window.lastSelectedSuite;
	}
	var imgLength = window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length;
	window.modalImageCurrentCounter = (window.modalImageCurrentCounter + step + imgLength) % imgLength; // Looping navigation
	if(typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][window.modalImageCurrentCounter] != "undefined")
	{
		//console.log(suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][window.modalImageCurrentCounter]);
		$("#modalFullScreenImage").attr("src", adminBaseUrl + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][window.modalImageCurrentCounter].image_path + window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType][window.modalImageCurrentCounter].image_name);
	}
}

function closeFullScreenModal()
{
	$("#fullScreenModal").hide();
	window.floorplanFullScreenActive = false;
	$("#floorplanShareURLButton").hide();
	updateURL();
}

function closVirtualToureFullScreenModal()
{
	$("#virtualTourModal").hide();
	window.dgsFullScreenActive = false;
	updateURL();
}

function closeMyAccountModal()
{
	$("#myAccountModal").hide();
}

window.firstTimeFullScreenModal = false;
function firstTimeFullScreenModalOpened()
{
	$("#fullScreenModalV2").modal("show");
	/*
	if(!window.firstTimeFullScreenModal)
	{
		window.firstTimeFullScreenModal = true;
		const modal = document.getElementById('fullScreenModal');
		modal.addEventListener('click', (event) => {
			if (event.target === modal) {
				modal.style.display = 'none'; // Hide modal
			}
		});
	}
	*/
}

function logoutUser()
{
	window.location.href = "logout.php";
}



// Catch asynchronous errors in primitives, tilesets, imagery
/*
if(typeof Cesium != "undefined" && Cesium != null && typeof Cesium.TileLoadErrorEvent != "undefined")
{
	Cesium.TileLoadErrorEvent.addEventListener(function(error) {
		console.error("Tile Load Error:", error);
		showCesiumError("Tile loading failed. Retrying...");
	});
}
*/

// Last-chance JS global handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global JS Error:", message, " @ ", source, ":", lineno);
    showCesiumError("Something went wrong in the map.");
};

function showCesiumError(msg) {
	console.log(msg);
	return;
    // Replace with your UI popup / toast
    let box = document.getElementById("cesiumErrorBox");
    if (!box) {
        box = document.createElement("div");
        box.id = "cesiumErrorBox";
        box.style.cssText =
            "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);" +
            "background:#ffcccc;padding:10px 20px;border-radius:6px;" +
            "color:#900;font-weight:bold;z-index:999999;";
        document.body.appendChild(box);
    }
    box.innerHTML = msg;
    box.style.display = "block";
    setTimeout(() => { box.style.display = "none"; }, 5000);
}

// 1️⃣ CESIUM RENDER ERROR TEST
function testRenderError() {
    console.log("Running testRenderError()");

    // Force-render error by adding invalid primitive
    try {
        viewer.scene.primitives.add({
            nonsense: true
        });
    } catch (e) {
        console.warn("Local try/catch hit, but renderError will also fire on next frame");
        throw e;
    }
}


// 2️⃣ GLOBAL JS ERROR TEST
function testGlobalError() {
    console.log("Running testGlobalError()");
    
    // This will throw a reference error
    nonexistentFunctionCall();
}


// 3️⃣ UNHANDLED PROMISE TEST
function testPromiseError() {
    console.log("Running testPromiseError()");

    // Force unhandled rejection
    Promise.reject("Manually triggered promise rejection!");
}

//Nearest Building logic
function findBuilding(pts, id)
{
	foundMatch = null;
	$.each(pts, function (index, row){
		if(row.bldg == id)
		{
			foundMatch = pts[index];
		}
	});
	return foundMatch;
}

window.arrowSelectedPrimitive = null;
window.arrowSelectedInstanceId = null;
window.originalColor = null;
function setBuildingSelectedV2(point)
{
	if(arrowSelectedPrimitive != null)
	{
		attr = arrowSelectedPrimitive.getGeometryInstanceAttributes(window.arrowSelectedInstanceId);
		if(typeof attr != "undefined")
		{
			attr.color = originalColor;
			attr.show = [1];
		}
	}
	
	prim = TempBuildingPrimitives[point.entityIndex];
	window.arrowSelectedPrimitive = prim;
	window.arrowSelectedInstanceId = "bldg-"+point.id+"-"+point.entityIndex;
	attributes = prim.getGeometryInstanceAttributes(window.arrowSelectedInstanceId);

	// We found the correct primitive + instance
	//selectedPrimitive = prim;
	//selectedInstanceId = "bldg-87-370";

	if(typeof attributes != "undefined")
	{
		originalColor = attributes.color;
		attributes.color = [attributes.color[0], attributes.color[1], attributes.color[2], 179];
		attributes.show = [1];
	}
}

function setBuildingSelected(entityId)
{
    const primitives = viewer.scene.primitives;

    for (let i = 0; i < primitives.length; i++) {
        const prim = primitives.get(i);

        if (!(prim instanceof Cesium.ClassificationPrimitive)) continue;

        // Try accessing geometry instance attributes by ID
        const attrs = prim.getGeometryInstanceAttributes(entityId);
        if (!attrs) continue;

        // We found the correct primitive + instance
        selectedPrimitive = prim;
        selectedInstanceId = entityId;

        // read original color (Uint8Array → Cesium.Color)
        originalColor = attrs.color;

        // Highlight → alpha(1)
        const newColor = originalColor;
		newColor[3] = 1;

        attrs.color = Cesium.ColorGeometryInstanceAttribute.toValue(newColor);

        return true;
    }
	
	const primitives2 = viewer.scene.groundPrimitives;

    for (let i = 0; i < primitives2.length; i++) {
        const prim = primitives2.get(i);

        if (!(prim instanceof Cesium.ClassificationPrimitive)) continue;

        // Try accessing geometry instance attributes by ID
        const attrs = prim.getGeometryInstanceAttributes(entityId);
        if (!attrs) continue;

        // We found the correct primitive + instance
        selectedPrimitive = prim;
        selectedInstanceId = entityId;

        // read original color (Uint8Array → Cesium.Color)
        originalColor = attrs.color;

        // Highlight → alpha(1)
        const newColor = originalColor;
		newColor[3] = 1;
        attrs.color = Cesium.ColorGeometryInstanceAttribute.toValue(newColor);

        return true;
    }

    return false; // Not found
}

function resetHighlight() {
    if (!window.arrowSelectedPrimitive || !window.arrowSelectedInstance) return false;

    // restore original color
    window.arrowSelectedInstance.attributes.color =
        Cesium.ColorGeometryInstanceAttribute.fromColor(originalColor);

    return true;
}

//Function North
//flyToNorthUp(viewer, -114.06968106698228, 51.04401437592839, 1500)
function flyToNorthUp(viewer, lon, lat, height = 1500) {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
        orientation: {
            heading: Cesium.Math.toRadians(0),   // North = Up (0°)
            pitch: Cesium.Math.toRadians(-90),   // Look straight down
            roll: 0
        },
        duration: 1.5
    });
}

//createDirectionMarkers(viewer, -114.06968106698228, 51.04401437592839, 1500)
function createDirectionMarkers(viewer, lon, lat, distance = 200) {

    const positions = {
        N: { label: 'N', coords: [lon, lat + (distance / 111000)] },
        S: { label: 'S', coords: [lon, lat - (distance / 111000)] },
        E: { label: 'E', coords: [lon + (distance / 111000), lat] },
        W: { label: 'W', coords: [lon - (distance / 111000), lat] }
    };

    Object.keys(positions).forEach(dir => {
        const pos = positions[dir];

        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(pos.coords[0], pos.coords[1], 10),
            label: {
                text: pos.label,
                font: "24px bold sans-serif",
                fillColor: Cesium.Color.YELLOW,
                outlineWidth: 2,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            billboard: {
                image: createArrowCanvas(dir),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                scale: 0.8
            }
        });
    });
}

function createArrowCanvas(direction) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.translate(32, 32);

    // Arrow pointing UP initially (north)
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(10, 0);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.stroke();

    // Rotate based on direction
    const angles = { N: 0, E: 90, S: 180, W: 270 };
    ctx.rotate(Cesium.Math.toRadians(angles[direction]));

    return canvas;
}

function add3DArrow(viewer, lon, lat, angleDeg, labelText, color) {

    const height = 20;     // arrow height
    const base = 10;       // arrow width
    const length = 40;     // arrow length

    // Arrow shape in local ENU coordinates (meters)
    const arrowPositions = [
        new Cesium.Cartesian3(0, 0, 0),
        new Cesium.Cartesian3(base, 0, 0),
        new Cesium.Cartesian3(base, length, 0),
        new Cesium.Cartesian3(base * 2, length, 0),
        new Cesium.Cartesian3(0, length * 2, 0),
        new Cesium.Cartesian3(-base * 2, length, 0),
        new Cesium.Cartesian3(-base, length, 0),
        new Cesium.Cartesian3(-base, 0, 0)
    ];

    // Convert ENU → ECEF at the given location
    const origin = Cesium.Cartesian3.fromDegrees(lon, lat, 5);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(origin);

    // Rotate the arrow
    const rotation = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angleDeg));
    const rotationMatrix = Cesium.Matrix4.fromRotationTranslation(rotation);

    const finalMatrix = Cesium.Matrix4.multiply(transform, rotationMatrix, new Cesium.Matrix4());

    const worldPositions = arrowPositions.map(p =>
        Cesium.Matrix4.multiplyByPoint(finalMatrix, p, new Cesium.Cartesian3())
    );

    viewer.entities.add({
        polygon: {
            hierarchy: new Cesium.PolygonHierarchy(worldPositions),
            height: 5,
            extrudedHeight: 5 + height,
            material: color.withAlpha(0.8)
        },
        label: {
            text: labelText,
            font: "20px bold",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            heightReference: Cesium.HeightReference.NONE,
            position: origin
        }
    });
}

function create3DDirectionArrows(viewer, lon, lat, offsetMeters = 200) {

    const metersPerDegree = 111000;

    // Offset points around the center
    const north = [lon, lat + (offsetMeters / metersPerDegree)];
    const south = [lon, lat - (offsetMeters / metersPerDegree)];
    const east  = [lon + (offsetMeters / metersPerDegree), lat];
    const west  = [lon - (offsetMeters / metersPerDegree), lat];

    add3DArrow(viewer, north[0], north[1], 0, "N", Cesium.Color.RED);
    add3DArrow(viewer, south[0], south[1], 180, "S", Cesium.Color.BLUE);
    add3DArrow(viewer, east[0],  east[1],  90, "E", Cesium.Color.YELLOW);
    add3DArrow(viewer, west[0],  west[1], 270, "W", Cesium.Color.GREEN);
}

const directionAngles = {
    N: 0,
    E: 90,
    S: 180,
    W: 270
};

function computeBearing(lat1, lon1, lat2, lon2) {
    const dLon = Cesium.Math.toRadians(lon2 - lon1);
    lat1 = Cesium.Math.toRadians(lat1);
    lat2 = Cesium.Math.toRadians(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let brng = Cesium.Math.toDegrees(Math.atan2(y, x));
    return (brng + 360) % 360; // normalize 0–360
}

function choosePointInDirection(current, direction, points, angleRange = 10) {

    const baseAngle = directionAngles[direction];
    const minAngle = (baseAngle - angleRange + 360) % 360;
    const maxAngle = (baseAngle + angleRange) % 360;

    let nearest = null;
    let nearestDist = Infinity;

    for (const p of points) {
        if (p.id === current.id) continue;

        const brng = computeBearing(current.lat, current.lon, p.lat, p.lon);

        // check if bearing lies inside cone
        const inCone = minAngle < maxAngle
            ? (brng >= minAngle && brng <= maxAngle)
            : (brng >= minAngle || brng <= maxAngle);

        if (!inCone) continue;

        const dist = Cesium.Cartesian3.distance(
            Cesium.Cartesian3.fromDegrees(current.lon, current.lat),
            Cesium.Cartesian3.fromDegrees(p.lon, p.lat)
        );

        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = p;
        }
    }

    return nearest;
}

let coneEntity = null;

function drawDirectionCone(viewer, current, direction, distanceMeters = 300) {

    if (coneEntity) viewer.entities.remove(coneEntity);

    const baseAngle = directionAngles[direction];
    const leftAngle = Cesium.Math.toRadians(baseAngle - 10);
    const rightAngle = Cesium.Math.toRadians(baseAngle + 10);

    const metersToDegrees = 1 / 111000;

    function project(lat, lon, angleRad) {
        const dx = Math.sin(angleRad) * distanceMeters;
        const dy = Math.cos(angleRad) * distanceMeters;
        return [
            lon + (dx * metersToDegrees),
            lat + (dy * metersToDegrees)
        ];
    }

    const left = project(current.lat, current.lon, leftAngle);
    const right = project(current.lat, current.lon, rightAngle);

    coneEntity = viewer.entities.add({
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
                current.lon, current.lat,
                left[0], left[1],
                right[0], right[1]
            ]),
            material: Cesium.Color.YELLOW.withAlpha(0.3),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });
}

let selectedEntity = null;

function highlightPoint(viewer, point) {
    if (selectedEntity) viewer.entities.remove(selectedEntity);

    selectedEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
        point: {
            pixelSize: 20,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3
        }
    });
}

function navigateDirection(viewer, currentPoint, direction) {

    drawDirectionCone(viewer, currentPoint, direction); // visualize cone

    const nextPoint = choosePointInDirection(currentPoint, direction, points);

    if (!nextPoint) {
        console.log("No point found in that direction.");
        return currentPoint;
    }

    highlightPoint(viewer, nextPoint);

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(nextPoint.lon, nextPoint.lat, 150),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-60)
        },
        duration: 0.8
    });

    return nextPoint;
}

window.currentPoint = null;
/*
document.addEventListener('keydown', function (ev) {
		//debugger;
		const key = ev.key;
		console.log(key);
		
		  var direction = "";
		if(key == "ArrowUp")
			direction = "N";
		if(key == "ArrowDown")
			direction = "S";
		if(key == "ArrowLeft")
			direction = "W";
		if(key == "ArrowRight")
			direction = "E";
		if(direction != "")
		{
			var lastGoodPoint = choosePointInDirection(currentPoint, direction, TempPointsData, 10);
			if(lastGoodPoint != null)
			{
				currentPoint = lastGoodPoint;
				console.log("Got Point", currentPoint);
				if(typeof currentPoint.id != "undefined")
				{
					resetLastSelectedPrimitive();
					RemoveEntitiesByType(dashedEntityList);
					//flyToBuildingCamera(currentPoint.id);
					setBuildingSelectedV2(currentPoint);
					ShowInfobox(currentPoint.id);
				}
			}
		}
		return;
		ev.preventDefault();
		if (!selectedPoint) return;

		const nextPoint = findNextDirectional(selectedPoint, key);
		console.log(nextPoint);
		
	});
	*/

function createFlatTerrain()
{
	viewer.scene.globe.depthTestAgainstTerrain = false;

    viewer.terrainProvider = flatTerrain;

    // Force refresh
    viewer.scene.requestRender();
}

$("#measurementPanel").draggable();



/*	Label on 3D Tile	*/
/**
 * Creates a text label rendered on a horizontal rectangle (flat on 3D tileset).
 * Canvas width is dynamically calculated based on text length.
 * The rectangle aspect ratio is matched to the canvas so text renders without distortion.
 *
 * @param {number} lon1 - First longitude (degrees)
 * @param {number} lat1 - First latitude (degrees)
 * @param {number} lon2 - Second longitude (degrees)
 * @param {number} lat2 - Second latitude (degrees)
 * @param {string} text - Text to display
 * @param {number} height - Bottom height of the rectangle (meters)
 * @param {number} extrudedHeight - Top height of the rectangle (meters)
 * @param {string} [id=""] - Optional entity ID
 */
function createLabelTextOnRectangle(lon1, lat1, lon2, lat2, text, height, extrudedHeight, id = "") {
    const west  = Math.min(lon1, lon2);
    const east  = Math.max(lon1, lon2);
    const south = Math.min(lat1, lat2);
    const north = Math.max(lat1, lat2);

    // --- Measure the real-world size of the rectangle ---
    const widthMeters  = haversineDistance(west, (north + south) / 2, east, (north + south) / 2);
    const heightMeters = Math.abs(extrudedHeight - height);

    // --- Build a canvas whose pixel aspect ratio matches the world aspect ratio ---
    const { canvas, ctx } = createDynamicTextCanvas(text, widthMeters, heightMeters);

    viewer.entities.add({
        id: id || Cesium.createGuid(),
        rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
            height: height,
            extrudedHeight: extrudedHeight,
            material: new Cesium.ImageMaterialProperty({
                image: canvas,
                transparent: true
            }),
            classificationType: Cesium.ClassificationType.BOTH
        }
    });

    viewer.zoomTo(viewer.entities);
}

/**
 * Creates a canvas whose pixel dimensions mirror the real-world width/height ratio,
 * then draws the text scaled to fill it properly.
 *
 * @param {string} text
 * @param {number} worldWidth  - real-world width in meters
 * @param {number} worldHeight - real-world height in meters
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
function createDynamicTextCanvas(text, worldWidth, worldHeight) {
    const BASE_HEIGHT_PX = 256; // fixed pixel height — width scales from this

    // Pixel width proportional to real-world aspect ratio
    const aspectRatio  = worldWidth / Math.max(worldHeight, 0.001);
    const canvasWidth  = Math.round(BASE_HEIGHT_PX * aspectRatio);
    const canvasHeight = BASE_HEIGHT_PX;

    const canvas = document.createElement("canvas");
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");

    // --- Background ---
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- Auto-fit font size so text fills ~90% of canvas width ---
    const maxFontSize = canvasHeight * 0.65;   // never taller than 65% of height
    const padding     = canvasWidth * 0.05;    // 5% horizontal padding each side
    const maxTextWidth = canvasWidth - padding * 2;

    let fontSize = maxFontSize;
    ctx.font = `bold ${fontSize}px Arial`;

    // Shrink font until text fits within available width
    while (ctx.measureText(text).width > maxTextWidth && fontSize > 8) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px Arial`;
    }

    // --- Optional: rounded border for readability ---
    const borderR = canvasHeight * 0.08;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth   = Math.max(2, canvasHeight * 0.02);
    roundRect(ctx, 4, 4, canvasWidth - 8, canvasHeight - 8, borderR);
    ctx.stroke();

    // --- Draw text centered ---
    ctx.fillStyle    = "white";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

    return { canvas, ctx };
}

/**
 * Haversine distance between two lon/lat points (meters).
 */
function haversineDistance(lon1, lat1, lon2, lat2) {
    const R  = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a  = Math.sin(Δφ / 2) ** 2 +
               Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Draws a rounded rectangle path on a canvas context.
 */
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
    ctx.lineTo(x,     y + r);
    ctx.quadraticCurveTo(x,     y,     x + r, y);
    ctx.closePath();
}

function confirmRedirect(url)
{
	if(confirm("Are you sure?"))
	{
		window.location.href = url;
	}
}

// -------------------------------------------------------------------
// Example call from your spec:
// createLabelTextOnRectangle(
//   -114.06757610397607, 51.04425025596059,
//   -114.06720972064971, 51.044248353615814,
//   "9999444433", 1107, 1098
// );
// -------------------------------------------------------------------