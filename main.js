
function getDarkOverlayColor()
{
	if(typeof window.darkOverlayEffectColor == "undefined")
	{
		window.darkOverlayEffectColor = 'WHITE';
	}
	return window.darkOverlayEffectColor;
}

var officeClasses = ["A", "AA", "AAA", "B", "C"];
var residentialClasses = ["APT", "MDU", "SENIOR", "Apartments", "Condominiums"];
var hotelClasses = ["HOTEL"];
var hotelClassesLower = ["hotel"];
var govClassLower = ["gov"];
var retailClass = ["Retail"];
var retailClassLower = ["retail"];

var educationalClass = ["EDU"];
var educationalClassLower = ["edu"];
var parkadesClassLower = ["prks"];

var healthcareClass = ["MED"];
var healthcareClassLower = ["med"];

var marketBuildingDetails = [];
var developmentBuildingDetails = [];
var developmentBuildingFloors = [];
var developmentBuildingSummary  = [];
var allBuildingVisualizationSummary  = [];
var summaryDetails = [];
var submarketDetails = [];
var hotelSummaryDetails = [];

function ToggleGoogleTileset()
{
	googleTileset.show = !googleTileset.show;
}
if(typeof viewer != "undefined")
{
	//loadFogPreload(2);
	if(typeof cityBoundaries[2] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[2]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
}

//setTimeout(function (){ getApp10MarketDetails(); }, 4000);
getApp10MarketDetails();

var marketDetails = [];
var marketDetailsV2 = [];
var marketCameraDetails = [];
var marketCameraRotationDetails = [];
function loadFogPreload(id)
{
	////console.log("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[id]+") }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	if(typeof cityBoundaries[id] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[id]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
}
window.PageLoadDefaultGridDisplayed = false;
window.citiesToShow = [];
window.allCitiesWithCountry = [];
window.countryWithProperties = [];
window.allRemainingCitiesWithCountry = [];
window.citiesCounts = [];
window.cityMarketRelationship = [];
function getApp10MarketDetails()
{
	$.ajax({
		method: "POST",
		url: "controllers/buildingController.php",
		data: { param : "getApp10MarketDetails", user_id: window.loggedInUserId}
	})
	.done(function( data ) {
		////console.log(data);
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			if(typeof data.data != "undefined")
			{
				marketDetails = data.data;
				$.each(marketDetails, function (i2, row2){
					marketDetailsV2[parseInt(row2.idtmarket)] = row2;
					if(typeof window.cityMarketRelationship[parseInt(row2.idtcity)] == "undefined")
					{
						window.cityMarketRelationship[parseInt(row2.idtcity)] = [];
					}
					window.cityMarketRelationship[parseInt(row2.idtcity)].push(row2);
				});
				disabledMarkets = data.disabledMarkets;
				window.citiesToShow = data.citiesAccessible;
				window.cityBoundaries = data.cityBoundaries;
				window.cityCameras = data.cityCameras;
				window.allCitiesWithCountry = data.allCitiesWithCountry;
				window.countryWithProperties = data.countryWithProperties;
				window.allRemainingCitiesWithCountry = data.allRemainingCitiesWithCountry;
				window.citiesCounts = data.citiesCounts;
				
				$.each(marketDetails, function (index, eachRow){
					if(typeof window.cityLabels == "undefined")
						window.cityLabels = [];
					window.cityLabels[eachRow.idtcity] = eachRow.scityname;
				});
				marketCameraDetails = data.marketCamera;
				marketCameraRotationDetails = data.cameraRotation;
				cityAltitudeAdjustment = data.cityAltitudeAdjustment;
				if(defaultCity != null && defaultCity != "" )
				{
					//$("#viewerController").show();
					$("#viewerController").css("display", "flex");
					lastSelectedBuildingType = defaultMarket;
					lastMarketLoaded = defaultMarketId;
					var tempRow = null;
					var market = marketDetailsV2[defaultMarketId];
					/*
					$.each(marketDetails, function (index, eachMarket){
						if(market == null)
						{
							if(defaultCity == 4)
							{
								if(eachMarket.idtmarket == defaultMarketId)
								{
									market = eachMarket;
								}
							}
							else if(eachMarket.idtcity == defaultCity)
							{
								market = eachMarket;
							}
						}
					});
					*/
					if(market != null && typeof market.idtcity != "undefined")
					{
						loadSubmarketDropdownFromMarketId(market.idtcity, market.idtmarket);
						loadBuildingForAutoSuggest(market.idtmarket);
					}
					if(window.PageLoadDefaultGridDisplayed == false && (isNaN(defaultCity) || defaultCity == null || defaultCity == 0))
					{
						$(".loading-overlay").show();
						$(".loading-overlay-message").hide();
						window.PageLoadDefaultGridDisplayed = false;
						prepareCityGridStructure(data.citiesAccessible);
					}
					else
					{
						window.PageLoadDefaultGridDisplayed = false;
						if(defaultCity == 2 || defaultCity == 0)
						{
							defaultCity = 2;
							getBuildingData(market, false);
						}
						else
						{
							getBuildingData(market);
						}
					}
				}
				else if(defaultCity == 0)
				{
					$(".loading-overlay").show();
					$(".loading-overlay-message").hide();
					window.PageLoadDefaultGridDisplayed = false;
					prepareCityGridStructure(data.citiesAccessible);
				}
				else
				{
					getBuildingData(marketDetails[0], false);
				}
			}
			getApp10Counts();
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function moveToCityGrid()
{
	lastCityLoaded = null;
	lastMarketLoaded = null;
	$(".loading-overlay").show();
	$(".loading-overlay-message").hide();
	$(".mapLogoOverlay").hide();
	$(".logoOverlay").hide();
	if(typeof htmlPolygonCOverlay != "undefined")
		htmlPolygonCOverlay.remove();
	lastSelectedBuildingType = "Office";
	prepareCityGridStructure(window.citiesToShow);
	stopRotateIfInProgress();
	setTimeout(function (){ clearPrimitives(); }, 500);
}

function cityGridSortToggle() {
  if (window.cityGridSort == "alphabetical") {
    window.cityGridSort = "properties";
  } else {
    window.cityGridSort = "alphabetical";
  }
  //console.log("window.cityGridSort: "+window.cityGridSort);
  prepareCityGridStructure("", false);
}

window.cityGridSort = "alphabetical";
window.cityCounts = [];
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
		var headerContent = '<div class="gridLogoOverlay"><img src="images/FLOORPLAN-CITY.png" alt="Logo">';
			headerContent += '<hr />';
			headerContent += '<div style="overflow: hidden;">';
				headerContent += '<span style="">';
					headerContent += '<span class="badge cityGridLegendBadge" style="background-color: '+classColor['Office']+'">Office</span><span class="badge cityGridLegendBadge" style="background-color: '+classColor['Apartments']+'">Residential</span><span class="badge cityGridLegendBadge" style="background-color: '+classColor['Retail']+'">Retail</span><span class="badge cityGridLegendBadge" style="background-color: '+classColor['Hotel']+'">Hotels</span><span class="badge cityGridLegendBadge" style="background-color: white;">Other</span>';
				headerContent += '</span>';
				headerContent += '<span style="float:right; ">';
				txt = "";
				if(window.cityGridSort == "alphabetical")
					headerContent += '<span id="sortContainer" onClick="cityGridSortToggle();" class="badge sort-btn badge-button-style pull-right">Sort by Total Properties</span>';
				if(window.cityGridSort == "properties")
					headerContent += '<span id="sortContainer" onClick="cityGridSortToggle();" class="badge sort-btn badge-button-style pull-right">Sort Alphabetically</span>';
				headerContent += '</span>';
			headerContent += '</div>';
		headerContent += '</div>';
		
		$(".container").html(headerContent+"<div class='newContainer'></div>");
	}
	else
	{
		txt = "";
		if(window.cityGridSort == "alphabetical")
			txt = 'Sort by Total Properties';
		if(window.cityGridSort == "properties")
			txt = 'Sort Alphabetically';
		$("#sortContainer").html(txt);
		$(".newContainer").html("");
	}
	$(".below-grid-loader").html("");
	const container = document.querySelector('.newContainer');
	var allClickableCities = [];
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
	
	if(window.cityGridSort == "properties")
	{
		countryWithProperties.sort((a, b) => b.total - a.total);
	}
	else if(window.cityGridSort == "alphabetical")
	{
		countryWithProperties.sort((a, b) => a.name.localeCompare(b.name));
	}
	
	$.each(countryWithProperties, function (iir, eachRow){
		
		country = eachRow.name;
		cityRows = allCitiesWithCountry[eachRow.name];
		
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
			//var randomCounter = countryMaxCounter[country];
			cityCounts[eachCity.idtcity] = eachCity.cnt;
			var randomCounter  = parseInt(eachCity.cnt);
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
			var buildingCnt = numberWithCommaWithoutDecimal2(eachCity.cnt);
			var floorplansCnt = numberWithCommaWithoutDecimal2(eachCity.floorplans);
			/*
			if(eachCity.floorplans == '')
				eachCity.floorplans = 0;
			if(eachCity.cnt == '')
				eachCity.cnt = 0;
			*/
			cityBox.innerHTML += `
			  <span class="city-box-name">${eachCity.scityname}</span>
			  <div class="city-box-count"><span class='city-box-count-label'>Properties:</span> ${buildingCnt}</div>
			  <div class="city-box-count"><span class='city-box-count-label'>Floorplans:</span> ${floorplansCnt}</div>
			`;
			  //<div class="city-box-count"><span class='city-box-count-label'>Available Office Spaces:</span> ${floorplansCnt}</div>

			if (!allClickableCities.includes(eachCity.idtcity)) {
			  cityBox.className = 'disabled-city-box city-disabled';
			} else {
			  cityBox.addEventListener('click', () => {
				  $(".city-box-"+eachCity.idtcity).css("border", "2px solid black");
				  setTimeout(function (){
					openVisualizationForCity(eachCity);
				}, 700);
			  });
			}

			// Create the new row below the city box
			const extraRow = document.createElement('div');
			extraRow.className = 'city-extra-row';
			extraRow.innerHTML = `
			  <div class="extra-item">${getMarketAvailableDropdown(eachCity.idtcity)}</div>
			  <div class="extra-item">${getVisualizationDropdown(eachCity.idtcity)}</div>
			`;

			// Append both elements into the wrapper
			cityWrapper.appendChild(cityBox);
			cityWrapper.appendChild(extraRow);

			grid.appendChild(cityWrapper);
			
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
		
      container.appendChild(countryGroup);
	});
	
	var remainingCities = "<p>Other Cities</p>";
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
	str = "<select style='width:100%;' onChange='setCookie(this.id, this.value);' class='' id='cityVis"+idtcity+"'>";
	
		$.each(buildingTypeDropdown, function (index, eachType){
			var dText = eachType+" Market";
			if(eachType == "Floorplan")
				dText = "Available Office Space";
			if(eachType == "Development")
				dText = "Development Activity";
			if(eachType == "Residential")
				dText = "Multifamily Market";
			if(eachType == "All")
				dText = "All Properties";
			
			str += "<option value='"+eachType+"'>"+dText+"</option>";
			
			if(idtcity == 23 && eachType == "All")
			{
				str += "<hr><option value='AvailableOfficeSpace'>Example Market Vacancy</option>";
				str += "<option value='OfficeRentalRates'>Example Market Rates</option>";
			}
			
			if(window.citiesEnabledForInvestmentSales.includes(parseInt(idtcity)) && eachType == "Floorplan")
			{
				str += "<option value='InvestmentSalesMarket'>Investment Sales Market</option>";
			}
		});
	str += "</select>";
	return str;
}

function getMarketAvailableDropdown(idtcity)
{
	str = "";
	idtcity = parseInt(idtcity);
	if(typeof window.cityMarketRelationship[idtcity] != "undefined")
	{
		if(window.cityMarketRelationship[idtcity].length > 1 || true)
		{
			str = "<select style='width:100%;' onChange='setCookie(this.id, this.value);' class='' id='cityMkt"+idtcity+"'>";
			$.each(window.cityMarketRelationship[idtcity], function (row, eachMarket){
				
				str += "<option value='"+eachMarket.idtmarket+"'>"+eachMarket.smarketname+"</option>";
			});
			str += "</select>";
		}
		else
		{
			str = window.cityMarketRelationship[idtcity][0].smarketname;
		}
	}
	return str;
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

function openVisualizationForCity(cityDetails)
{
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
	
	setLoadingMessage(cityDetails.idtcity, marketDetailsV2[lastMarketLoaded].smarketname);
			
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

function setLoadingMessage(idtcity, cityName)
{
	var cnt = 0;
	if(typeof cityCounts[idtcity] != "undefined")
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
		$(".loading-message").html("Loading "+cityName+"...<br /><br />"+numberWithCommaWithoutDecimal2(cnt)+" Properties");
}

function getApp10Counts()
{
	$.ajax({
		method: "POST",
		url: "controllers/buildingController.php",
		data: { param : "getApp10CityBuildingCount"}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		////console.log(data);
	});
	
	$.ajax({
		method: "POST",
		url: "controllers/buildingController.php",
		data: { param : "getApp10CityCameraDetails"}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		////console.log(data);
	});
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
function loadMarket(val)
{
	if(window.reloadingAfterCrash == true)
	{
		initCesium2();
	}
	lastMarketLoaded = val;
	triedAfterRetry = 0;
	setDropdownWidthClass();
		
	isCityLoadingInProgress = true;
	setTimeout(function (){ isCityLoadingInProgress = false; }, 5000);
	
	window.lastFloor = null;
	$("#pano-view-li").hide();
	$(".full-screen-arrow").hide();
	
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
	lastCityLoaded = mktDetail.idtcity;
	showLoadingMessage(mktDetail.idtcity);
	console.log("mktDetail.idtcity: "+mktDetail.idtcity);
	flyToCitySkyline(mktDetail.idtcity)
	
	if([1, 6].includes(lastMarketLoaded) && [1, 6].includes(marketDetails.idtmarket))
		window.changingMarketWithinCity = true;
	
	if(window.changingMarketWithinCity)
	{
		clearPrimitives(false, true);
	}
	else
	{
		clearPrimitives();
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
	setLoadingMessage(cityLoaded, marketDetailsV2[lastMarketLoaded].smarketname);
	$(".loading-overlay").show();
}
window.startCountingMatchedToo = false;
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
		setLoadingMessage(marketDetails.idtcity, marketDetailsV2[lastMarketLoaded].smarketname);
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
		viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[marketDetails.idtcity] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntityPreload', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[marketDetails.idtcity]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
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
						developmentBuildingDetails[marketDetails.idtmarket] = data.developmentBuildings;
						developmentBuildingFloors = data.developmentBuildingFloors;
						developmentBuildingSummary[marketDetails.idtmarket] = data.developmentSummary;
						allBuildingVisualizationSummary[marketDetails.idtmarket] = data.allBuildingVisualizationSummary;
						submarketDetails = data.submarketDetails;
						//console.log("submarketDetails", submarketDetails);
						summaryDetails[marketDetails.idtmarket] = data.summary;
						hotelSummaryDetails[marketDetails.idtmarket] = data.hotelSummary;
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
		clr = "Cesium.Color.GREEN";
		lastFloorHeight = parseFloat(cameraAltitudeAdjustment);
		var calculatedFloorHeight = Math.round(parseInt(activeUnitDetails[idtbldg][0].altitude) / parseInt(activeUnitDetails[idtbldg][0].floors), 2);
		if(calculatedFloorHeight > 4 || calculatedFloorHeight < 2)
			calculatedFloorHeight = 4;
		$.each(activeUnitDetails[idtbldg], function (index, eachUnit){
			var extrudedHt = parseFloat(cameraAltitudeAdjustment) + parseFloat(calculatedFloorHeight * (eachUnit.floor_number-1));
			if(typeof eachUnit.floor_height != "undefined" && eachUnit.floor_height != null)
				calculatedFloorHeight = eachUnit.floor_height;
			var ent = viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
				geometryInstances : new Cesium.GeometryInstance({
					geometry : new Cesium.PolygonGeometry({
					  polygonHierarchy : new Cesium.PolygonHierarchy(
						Cesium.Cartesian3.fromDegreesArray(eval("["+eachUnit.coords+"]"))
					  ),
					  extrudedHeight: extrudedHt,
						height: extrudedHt + parseFloat(calculatedFloorHeight),
					}),
					/*modelMatrix : modelMatrix,*/
					attributes : {
						//color : defaultPrimitiveHighlightColor,
						color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
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
	$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="city-skyline-li" data-text="city-skyline" data-id="'+idtcity+'" href="#">City Skyline</a></li>');
	$(".dropdown3 ul").append('<li><a class="dropdown3-item" id="city-skyline2-li" data-text="city-skyline2" data-id="'+idtcity+'" href="#">City Skyline2</a></li>');
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
	window.lastHolesString = "";
	viewer.entities.removeById("FogEffectEntity");
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
					window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+EachBuilding.coords+' ]), }, ';
				}
			}
		}
	});
	distortionIndex = distortionIndex + window.distortionIndexStep;
	////console.log(window.lastHolesString);
	if(typeof cityBoundaries[lastCityLoaded] != "undefined")
	eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
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
	return coordsToClose;
	var check= eval('['+coordsToClose+']');
	////console.log(check);
	if(check[0] != check[check.length - 2])
	{
		return coordsToClose+', '+check[0]+', '+check[1];
	}
	else
		return coordsToClose;
}

function addBuildingToSkip()
{
	buildingToSkipForHoles.push(parseInt(devSelectedBuilding));
	loadNewBuildingTypeView("Office");
}

function keepPolygonOpen(coordsToClose)
{
	var check= eval('['+coordsToClose+']');
	////console.log(check);
	if(check[0] == check[check.length - 2])
	{
		check.pop();
		check.pop();
		return check.toString();
	}
	else
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
function highlightAllBuildings(idtcity, marketId, cameraChange = true, retainBuildingInfobox = false)
{
	cameraAltitudeAdjustment = cityAltitudeAdjustment[idtcity];
	//viewer.scene.screenSpaceCameraController.minimumZoomDistance = cameraAltitudeAdjustment;
	//console.log("setting new cameraAltitudeAdjustment "+cameraAltitudeAdjustment);
	clearPrimitives();
	//$(".infoboxContainer").hide();  $("#infoboxFloorPlanRow").hide();
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
		
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
					  hierarchy: Cesium.Cartesian3.fromDegreesArray(
						eval("[" + EachBuilding.coords + "]")
					  ),
					  extrudedHeight: lastFloorHeight + loopFloorHt,
					  height: lastFloorHeight,
					  material: eval(borderClr),
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
				hierarchy: Cesium.Cartesian3.fromDegreesArray(
				  eval("[" + floorCoord + "]")
				),
				//extrudedHeight: lastFloorHeight + baseFloorHeight + 1,
				height: lastFloorHeight,
				material: eval(clr),
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
				new Cesium.Cartesian3.fromDegrees(
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
						hierarchy: Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]")),
						extrudedHeight: lastFloorHeight + loopFloorHt,
						height: lastFloorHeight,
						material: eval(clr),
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
				hierarchy: Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]")),
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
		$.each(marketBuildingDetails[marketId], function (index, EachBuilding) {
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
				else if(lastSelectedBuildingType == "All" && (educationalClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || healthcareClassLower.includes(EachBuilding.buildingclass.toLowerCase()) || parkadesClassLower.includes(EachBuilding.buildingclass.toLowerCase())))
				{
					proceedWithBuilding = true;
				}
				
				if(window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding)))
					proceedWithBuilding = false;
				
				//if(window.buildingToSkipForHoles.includes(parseInt(EachBuilding.idtbuilding)))
				//	proceedWithBuilding = false;
				
				if(proceedWithBuilding && typeof window.retailBuildingData[EachBuilding.idtbuilding] != "undefined" && lastSelectedBuildingType == "All" && !retailClassLower.includes(EachBuilding.buildingclass.toLowerCase()))
				{
					////console.log("Not Retail", EachBuilding);
					//searchBuildingData.push({id: EachBuilding.idtbuilding, name: EachBuilding.sbuildingname, address: EachBuilding.address, index: index, entityIndex : primitiveCollection.length});
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					var tt = EachBuilding.coords.split(",");
					TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					if(lastSelectedBuildingType == "All" && window.retailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
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
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  extrudedHeight: lastFloorHeight,
								height: lastFloorHeight + 1000,
							}),
							/*modelMatrix : modelMatrix,*/
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(clr)),
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
					var tt = EachBuilding.coords.split(",");
					TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					if(lastSelectedBuildingType == "All" && window.retailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
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
				else if(proceedWithBuilding && typeof window.nonRetailBuildingData[EachBuilding.idtbuilding] != "undefined")
				{
					////console.log( "Non Retail Builing Data ", EachBuilding );
					//searchBuildingData.push({id: EachBuilding.idtbuilding, name: EachBuilding.sbuildingname, address: EachBuilding.address, index: index, entityIndex : primitiveCollection.length});
					TempBldgData[EachBuilding.idtbuilding] = EachBuilding;
					var tt = EachBuilding.coords.split(",");
					TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					if(lastSelectedBuildingType == "All" && window.nonRetailBuildingData[EachBuilding.idtbuilding].skip_fog != 1)
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					if(newLogicCheckForFogSkip(EachBuilding.idtbuilding) && lastSelectedBuildingType != "All")
					{
						window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					}
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
					var tt = EachBuilding.coords.split(",");
					TempPointsData.push({lat: tt[0], lon: tt[1], bldg: EachBuilding.idtbuilding, id: EachBuilding.idtbuilding, index: index, entityIndex: window.TempBuildingPrimitives.length});
					////console.log("Bldg " + EachBuilding.idtbuilding+" => "+tryClosingPolygon(EachBuilding.coords));
					window.lastHolesString += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+tryClosingPolygon(EachBuilding.coords)+' ]), }, ';
					
					var clr = classColorCoding[EachBuilding.buildingclass];
					if( typeof devSelectedBuilding != "undefined" && parseInt(devSelectedBuilding) == parseInt(EachBuilding.idtbuilding) )
					{
						clr.alpha = 0.7;
					}
					else
					{
						clr.alpha = 0.5;
					}
					/*
					var t = eval("["+EachBuilding.coords+"]");
					viewer.entities.add({
					  name: "Green cylinder with black outline",
					  position: Cesium.Cartesian3.fromDegrees(t[0], t[1], 1000.0),
					  cylinder: {
						length: 400000.0,
						topRadius: 20.0,
						bottomRadius: 20.0,
						material: Cesium.Color.GREEN,
					  },
					});	
					*/
					////console.log(EachBuilding.idtbuilding);//console.log(EachBuilding.coords);
					var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolygonGeometry({
							  polygonHierarchy : new Cesium.PolygonHierarchy(
								Cesium.Cartesian3.fromDegreesArray(eval("["+EachBuilding.coords+"]"))
							  ),
							  height : 3000,
							  extrudedHeight : -100
							}),
							attributes : {
								//color : defaultPrimitiveHighlightColor,
								color : Cesium.ColorGeometryInstanceAttribute.fromColor(clr),
								show : new Cesium.ShowGeometryInstanceAttribute(true)
							},
							id : "bldg-"+EachBuilding.idtbuilding+"-"+index,
						}),
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
			
				window.TempBuildingPrimitives.push(ent);
			}
		});
	}
		setTimeout(function (){ setPrimitiveColorLogic(); }, 500);
	
	
	////console.log("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[idtcity]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	if(typeof cityBoundaries[idtcity] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[idtcity]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	viewer.entities.removeById("FogEffectEntityPreload");
	//10/01
	/*
	if(cameraChange)
		flyToCitySkyline(idtcity);
	*/
	
	eventsToExecuteAfterLoadingData();
	//console.log("All Finished!");
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

  return new Cesium.Cartographic(
    sumLat / cartesians.length,
    sumLon / cartesians.length,
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
	//console.log("delay: "+delay);
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
							createIsolateEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("isolateButton2", true);
						break;
						case 1://Spotlight
							createSpotlightEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("spotlightButton2", true);
						break;
						case 2://Highlight
							createApp6HighlightEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("newHighlightButton2", true);
						break;
						case 3://Suites
						
						break;
						case 4://Floors
							createFloorsEffect(devSelectedBuilding);
							$("#highlightButton").addClass("btn-primary");
							$("#highlightButton").removeClass("btn-secondary");
						break;
						case 5://FloorPlans
							createBuildingAssets(devSelectedBuilding);
							$("#assetButton").addClass("btn-primary");
							$("#assetButton").removeClass("btn-secondary");
						break;
						case 6://Isolate Satellite
							createIsolateSatelliteEffect(devSelectedBuilding);
							setResetTickForEffectsButtons("isolateSatelliteButton2", true);
						break;
						case 7://Floor Plan
							getDataForFloorPlan(devSelectedBuilding);
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
								createClipEffect(devSelectedBuilding);
								setResetTickForEffectsButtons("clipEffectButton2", true);
							}, timeToWait);
							
						break;
						case 9://Resi Units
							highlightResiUnitsInBuilding(devSelectedBuilding);
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
				//console.log("No span with class 'tick' is visible.");
			  }
			  
			defaultEffects = [];
		}
		if(true)// Add condition here for any one effect active
		{
			//Go to Default Camera
			flyToDefaultCameraWithDelay();
		}
	}, 1000);
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
    '<div style="font-size: 22px;margin-bottom: 10px;"><span id="floorNum"></span></div><div id="FloorViewInInfoBox" onclick="FlyToFloorView()">Floor View</div><div id="FloorViewTravelInInfoBox" onclick="ToggleFloorViewCameraSlowRotation()">Floor View Travel</div>';
  document.body.appendChild(div);
  $("#PolygonCOverlay").css("left", "-999px");
}

function clearPrimitives( clearFog = true, retainMainFog = false )
{
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
	if(!retainMainFog)
		viewer.entities.removeById("FogEffectEntity");
	//viewer.entities.removeById("starRatingBox");
	if(clearFog)
	{
		viewer.entities.removeById("FogEffectEntityPreload");
	}
	
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
	
	window.availableOfficeSpace = null;
	window.availableOfficeSpaceSummary = null;
	window.availableOfficeSpacePrimitives = [];
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

function flyToSubmarketCamera(id, type = 'idtcamera')
{
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
				if(selectedPrimitiveColor != null)
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

function ShowInfobox(idtbl, id)
{
	if(idtbl == null)
		return;
	idtbl = parseInt(idtbl);
	
	window.lastSelectedSuite = null;
	//$(".orbitButton").show();
	
	createStadiaTerrain();
	$(".marketStatsButtonContainer").show();
	//console.log("Bldg "+idtbl);
	devSelectedBuilding = idtbl;
	lastSelectedBuilding = idtbl;
	//console.log(TempBldgData[idtbl]);
	prepareBuilding(TempBldgData[idtbl]);
	getBuildingFloorDetails(idtbl);
	var marketData = null;
	$.each(marketDetails, function (index, eachRow){
		if(eachRow.idtmarket == lastMarketLoaded)
			marketData = eachRow;
	});
	var st = "<span></span><a href='javascript:void(0)' class='buildingNameOnInfobox' onClick='flyToBuildingCamera("+TempBldgData[idtbl].idtbuilding+");'>"+TempBldgData[idtbl].sbuildingname+"</a>";
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

	str += "<tr><td style='width: 20% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+printIfNotNull(TempBldgData[idtbl].buildingclass)+"</span>";
	if(TempBldgData[idtbl].buildingclass == "HOTEL" || (lastSelectedBuildingType == "All" && TempBldgData[idtbl].buildingclass == "HOTEL"))
	{
		//str += "&nbsp;"+;
	}
	str += "</td><td style='width: 30% !important;'>Floors</td><td style='width: 32% !important;'>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td></tr>";
	
	var lastreno = "";
	if(TempBldgData[idtbl].lastreno != "" && TempBldgData[idtbl].lastreno != null)
		lastreno = " ("+TempBldgData[idtbl].lastreno+")";
	
	if(lastSelectedBuildingType == "Hotel" || (lastSelectedBuildingType == "All" && hotelClasses.includes(TempBldgData[idtbl].buildingclass)))
	{
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		
		str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
		
		str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+printIfNotNull(TempBldgData[idtbl].buildingclass)+"</span>";
		if(TempBldgData[idtbl].buildingclass == "HOTEL" || (lastSelectedBuildingType == "All" && TempBldgData[idtbl].buildingclass == "HOTEL"))
		{
			//str += "&nbsp;"+;
		}
		str += "</td><td style='width: 26% !important;'>Built</td><td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";
		
		str += "<tr><td>Floors</td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		str += "<td>Doors</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].hoteldoors)+"</td></tr>";
		
		str += "<tr><td></td><td></td><td>Rating</td><td>"+getHotelStarPattern(parseInt(TempBldgData[idtbl].star_rating))+"</td></tr>";
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
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
		//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
		str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
		
		
		str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+printIfNotNull(TempBldgData[idtbl].buildingclass)+"</span>";
		
		str += "<td>Built</td><td>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";
		
		//str += "<tr><td style='width: 23% !important;'>Floors</td><td style='width: 18% !important;'>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		str += "<tr><td>Floors</td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		$("#newSuiteButton").html("Units");
		newButtonText = "Units";
		str += "<td style='width: 26% !important;'>Units</td><td style='width: 31% !important;'>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].units)+"</td></tr>";
		
	}
	else if(lastSelectedBuildingType == "Office" || (lastSelectedBuildingType == "All" && officeClasses.includes(TempBldgData[idtbl].buildingclass)))
	{
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
		//str += "<tr><td colspan=2 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"</td><td colspan='2' class='alignRight' class='infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
		str += "<tr><td colspan=4 class='infoboxBuildingAddress'>"+TempBldgData[idtbl].address+"<span style='float:right;' class='alignRight infoboxSubmarketName'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></span></td></tr>";
		
		var classToPrint = printIfNotNull(TempBldgData[idtbl].buildingclass);
		if(classToPrint == "AA")
		{
			 classToPrint = marketDetailsV2[lastMarketLoaded].class_aa_rename.replace(" Office", "");
		}
		//classToPrint = "Prime";
		str += "<tr><td style='width: 23% !important;'>Class</td><td style='width: 18% !important;'><span class='customBadge' style='background-color: "+classColor[TempBldgData[idtbl].buildingclass]+";'>"+classToPrint+"</span>";
		
		str += "</td><td style='width: 26% !important;'>Built</td><td style='width: 31% !important;'>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td></tr>";
		
		str += "<tr><td>Floors</td><td>"+TempBldgData[idtbl].floors+"&nbsp;<span class='floorNumberRowTD'></span></td>";
		str += "<td>Office</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossofficearea)))+"</td></tr>";
		
		str += "<tr><td>Total&nbsp;Parking&nbsp;</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].parkingstalls, "")+"</td>";
			if(parseInt(TempBldgData[idtbl].total_available_office_area) > 0)
				str += "<td>Available Space</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(parseInt(TempBldgData[idtbl].total_available_office_area)), " ", " "+cityAreaMeasurementUnit)+"</td>";
			else
				str += "<td>Available Space</td><td></td>";
		str += "</tr>";
		
		if(parseInt(TempBldgData[idtbl].total_available_office_area) > 0)
		{
			var calcPercentage = Math.round((parseInt(TempBldgData[idtbl].total_available_office_area) / parseInt(TempBldgData[idtbl].grossofficearea))*100);
			str += "<tr><td>Vacancy</td><td>"+calcPercentage+"%</td><td>Additional&nbsp;Rent&nbsp;</td><td>"+numberWithCommaWithTwoDecimal(TempBldgData[idtbl].total_additional_rent, "$", " /psf")+"</td></tr>";
		}
		else
		{
			str += "<tr><td>Vacancy</td><td>0%</td><td>Additional&nbsp;Rent&nbsp;</td><td></td></tr>";
		}
		
		$("#newSuiteButton").html("Suites");
		newButtonText = "Suites";
	}
	else
	{
		str += "<tr><td>Built</td><td>"+printIfNotNull(TempBldgData[idtbl].yearbuilt)+lastreno+"</td>";
		//str += "<tr><td>Year Built</td><td>"+TempBldgData[idtbl].units+"</td>";
		
		var newButtonText = "";
		if(lastSelectedBuildingType == "Office" || (lastSelectedBuildingType == "All" && officeClasses.includes(TempBldgData[idtbl].buildingclass)))
		{
			str += "<td>Office</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossofficearea)))+"</td></tr>";
			
			str += "<tr><td>Total&nbsp;Parking&nbsp;</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].parkingstalls, "")+"</td>";
				if(parseInt(TempBldgData[idtbl].total_available_office_area) > 0)
					str += "<td>Available Space</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(parseInt(TempBldgData[idtbl].total_available_office_area)), " ", " "+cityAreaMeasurementUnit)+"</td>";
				else
					str += "<td>Available Space</td><td></td>";
			str += "</tr>";
			
			if(parseInt(TempBldgData[idtbl].total_available_office_area) > 0)
			{
				var calcPercentage = Math.round((parseInt(TempBldgData[idtbl].total_available_office_area) / parseInt(TempBldgData[idtbl].grossofficearea))*100);
				str += "<tr><td>Vacancy</td><td>"+calcPercentage+"%</td>";
				str += "<td>Additional&nbsp;Rent&nbsp;</td><td>"+numberWithCommaWithTwoDecimal(TempBldgData[idtbl].total_additional_rent, "$", " /psf")+"</td>";
				"</tr>";
			}
			else
			{
				str += "<tr><td>Vacancy</td><td>0%</td><td>Additional&nbsp;Rent&nbsp;</td><td></td></tr>";
			}
			
			$("#newSuiteButton").html("Suites");
			newButtonText = "Suites";
		}
		else if(lastSelectedBuildingType == "Residential" || (lastSelectedBuildingType == "All" && residentialClasses.includes(TempBldgData[idtbl].buildingclass)))
		{
			$("#newSuiteButton").html("Units");
			newButtonText = "Units";
			str += "<td>Units</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].units)+"</td></tr>";
		}
		else if(lastSelectedBuildingType == "Retail" || (lastSelectedBuildingType == "All" && retailClass.includes(TempBldgData[idtbl].buildingclass)))
		{
			newButtonText = "Rooms";
			str += "<td>Retail</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea)))+"</td></tr>";
		}
		else if(["EDU", "MED", "GOV"].includes(TempBldgData[idtbl].buildingclass))
		{
			str += "<td>Area</td><td>"+printSqFt(getAreaInCityUnits(parseFloat(TempBldgData[idtbl].grossretailarea)))+"</td></tr>";
		}
		else if(lastSelectedBuildingType == "All" || (lastSelectedBuildingType == "All" && parkadesClassLower.includes(TempBldgData[idtbl].buildingclass)))
		{
			//$("#newSuiteButton").html("Rooms");
			//newButtonText = "Rooms";
			if(TempBldgData[idtbl].buildingclass.toLowerCase() != "gov")
				str += "<td>Stalls</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].parkingstalls)+"</td></tr>";
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
	
	str += '<div class="dropdown" ><button id="newEffectsButton" class="dropdown-toggle btn btn-sm btn-secondary actionButtons" >Effects</button>';
	str += '<ul class="dropdown-menu">';
        
    str += '<li style="margin-right: 10px;" id="isolateSatelliteButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option1" onClick=\'createIsolateSatelliteEffect('+idtbl+');\'><span class="tick">&#x2714;</span>Isolate</a></li>';
    str += '<li style="margin-right: 10px;" id="isolateButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option1" onClick=\'createIsolateEffect('+idtbl+');\'><span class="tick">&#x2714;</span> Isolate on Dark</a></li>';
    str += '<li style="margin-right: 10px;" id="spotlightButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option2" onClick=\'createSpotlightEffect('+idtbl+');\'><span class="tick">&#x2714;</span> Spotlight</a></li>';
    str += '<li style="margin-right: 10px;" id="newHighlightButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option3" onClick=\'createApp6HighlightEffect('+idtbl+');\'><span class="tick">&#x2714;</span> Highlight</a></li>';
    str += '<li style="margin-right: 10px;" id="clipEffectButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option4" onClick=\'createClipEffect('+idtbl+');\'><span class="tick">&#x2714;</span> Clear</a></li>';
    //str += '<li style="margin-right: 10px;" id="darkOverlayButton2"><a class="dropdown-item" style="text-decoration:none; color: black;" href="#" data-option="option4" onClick=\'createDarkOverlayEffect('+idtbl+');\'><span class="tick">&#x2714;</span> Dark Overlay</a></li>';

    str += '</ul></div>';
    

    //Isolate, Spotlight, Highlight
    //<button class='btn btn-sm btn-secondary actionButtons' id='isolateButton' onClick=\"createIsolateEffect("+idtbl+");\">Isolate</button><button class='btn btn-sm btn-secondary actionButtons' id='spotlightButton' onClick=\"createSpotlightEffect("+idtbl+");\">Spotlight</button><button class='btn btn-sm btn-secondary actionButtons' id='newHighlightButton' onClick=\"createApp6HighlightEffect("+idtbl+");\">Highlight</button>
	
	//Removed Suites button
	//<button class='btn btn-sm btn-secondary actionButtons' id='newSuiteButton'>"+newButtonText+"</button>
	isUnitsAvailable = ' disabled';
	if(typeof window.activeUnitDetails[parseInt(idtbl)] != "undefined")
	{
		isUnitsAvailable = '';
	}
	str += "<span class='pull-left'><button class='btn btn-sm btn-secondary actionButtons' id='highlightButton' onClick=\"createFloorsEffect("+idtbl+");\">Floors</button><button class='btn btn-sm btn-secondary actionButtons ' id='assetButton' onClick=\"createBuildingAssets("+idtbl+");\">Files</button><button class='btn btn-sm btn-secondary actionButtons' id='floorplanButton' onClick=\"getDataForFloorPlan("+idtbl+");\">Floorplans</button><button class='btn btn-sm btn-secondary actionButtons ' style='display:none;' id='cameraRotation2' onClick=\"ToggleCameraRotationForPoint2();\">Cam2</button></span>";
	//Vacancy button in Office infobox, Hiding it for now
	//<button class='btn btn-sm btn-secondary actionButtons' id='vacancyButton' onClick=\"highlightResiUnitsInBuilding("+idtbl+");\" "+isUnitsAvailable+">Vacancy</button>
	str += "<span class='pull-right' style='cursor:pointer; float: right; margin-top: 10px; '><span  id='copyURLButton' ><img src='images/link_24.png' height='24px;' width='24px;' /></span></span>";
	$(".infoboxContainerData").html(str);
	$(".infoboxContainer").show();
	
	updateURL();
	initiateDropdownToggle();
	initiateCopyButton();
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
	var row = window.developmentBuildingDetails[parseInt(lastMarketLoaded)][id];
	
	var str = "<a href='javascript:void(0)' class='buildingNameOnInfobox' onClick='flyToBuildingCamera("+row.idtbuilding+");'>"+row.sbuildingname+"</a>";
	
	str += "<span style='position: absolute; right: 2%; font-weight: none !important;'>id: <span id='buildingIdToCopy'>"+row.idtbuilding+"</span></span>";
	str += "";
	$(".infoboxHeaderData").html(str);
	
	var st = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	if(officeClasses.includes(row.buildingclass))
	{
		st += "<tr><td>Class</td><td>"+row.buildingclass+"</td>";
		st += "<td>Floors</td><td>"+row.floors+"</td></tr>";
		st += "<tr>";
			st += "<td>Built</td><td>"+row.yearbuilt+"</td>";
			st += "<td width='80px'>Office</td>";
			st += "<td>"+numberWithCommaWithoutDecimal(parseInt(row.grossofficearea), " ", " "+cityAreaMeasurementUnit)+"</td>";
		st += "</tr>";
		
	}
	else if(residentialClasses.includes(row.buildingclass))
	{
		st += "<tr><td>Class</td><td>"+row.buildingclass+"</td>";
		st += "<td>Floors</td><td>"+row.floors+"</td></tr>";
		st += "<tr>";
		st += "<td>Built</td><td>"+row.yearbuilt+"</td>";
			st += "<td width='80px'>Units</td>";
			if(row.units != null)
				st += "<td>"+row.units+"</td>";
			else
				st += "<td></td>";
		st += "</tr>";
		
	}
	else if(row.buildingclass.toLowerCase() == "hotel")
	{
		//getHotelStarPattern(parseInt(eachRow.star_rating))
		st += "<tr><td>Class</td><td>"+row.buildingclass;
		if(row.star_rating != null)
		{
			st += getHotelStarPattern(parseInt(row.star_rating));
		}
		st += "</td>";
		st += "<td>Floors</td><td>"+row.floors+"</td></tr>";
		st += "<tr>";
			st += "<td>Built</td><td>"+row.yearbuilt+"</td>";
			st += "<td>Doors</td><td>"+row.hoteldoors+"</td>";
		st += "</tr>";
		st += "<tr>";
			st += "<td width='80px'>Resi Units</td>";
			if(row.units != null)
				st += "<td>"+row.units+"</td>";
			else
				st += "<td></td>";
		st += "<td></td><td></td></tr>";
		
	}
	
	
	//&nbsp;&nbsp;<a href='javascript:prepareForPanoView("+TempBldgData[idtbl].idtbuilding+")'>Pano</a>
	st += "</table>";
	//$(".infoboxHeaderData").html(st);
	
	$(".infoboxContainerData").html(st);
	$(".infoboxContainer").show();
	initiateCopyButton();
	
	updateURL();
}

function ShowInfoboxOfficeMarketSales(idtbl)
{
	if(typeof viewer.entities.getById("label-"+idtbl) != "undefined")
		viewer.entities.getById("label-"+idtbl).show = true;
	
	devSelectedBuilding = idtbl;
	lastSelectedBuilding = idtbl;
	getBuildingFloorDetails(idtbl);
	
	var st = "<a href='javascript:void(0)' class='buildingNameOnInfobox' onClick='flyToBuildingCamera("+TempBldgData[idtbl].idtbuilding+");'>"+TempBldgData[idtbl].sbuildingname+"</a>";
	
	st += "<span style='position: absolute; right: 2%; font-weight: none !important;'>id: <span id='buildingIdToCopy'>"+idtbl+"</span></span>";
	st += "";
	$(".infoboxHeaderData").html(st);
	
	var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
	//str += "<tr><td>Name</td><td>"+TempBldgData[idtbl].sbuildingname+"</td></tr>";
	str += "<tr><td colspan=2>"+TempBldgData[idtbl].address+"</td><td></td><td class='alignRight'><a href=\"javascript:flyToSubmarketCamera("+TempBldgData[idtbl].idtsubmarket+");\">"+TempBldgData[idtbl].ssubname+"</a></td></tr>";
	
	/*
	str += "<tr>";
		str += "<td>Listed Price</td><td>"+numberWithCommaWithoutDecimal(parseInt(TempBldgData[idtbl].listed_price), "$")+"</td>";
		str += "<td>Sold Price</td><td>"+numberWithCommaWithoutDecimal(parseInt(TempBldgData[idtbl].sold_price), "$")+"</td>";
	str += "</tr>";
	
	*/
	if(TempBldgData[idtbl].sale_year == 0)
		TempBldgData[idtbl].sale_year = "";
	var dt = TempBldgData[idtbl].sale_quarter + " " + TempBldgData[idtbl].sale_year;
	str += "<tr>";
		str += "<td>Sale Date</td><td>"+printIfNotNull(dt)+"</td>";
		str += "<td>GLA</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].grossofficearea)+" Sq Ft</td>";
	str += "</tr>";
	
	str += "<tr>";
		str += "<td>Class</td><td>"+printIfNotNull(TempBldgData[idtbl].buildingclass)+"</td>";
		if(parseFloat(TempBldgData[idtbl].sold_price) == 0 || TempBldgData[idtbl].sold_price == null)
		{
			str += "<td>Sale Price</td><td style='background-color:"+getInvestmentSaleColor(0, 0, true)+"'>Undisclosed</td>";
		}
		else
		{
			str += "<td>Sale Price</td><td>"+numberWithCommaWithoutDecimal(TempBldgData[idtbl].sold_price, "$")+"</td>";
		}
	str += "</tr>";
	str += "<tr>";
		str += "<td>Age</td><td>"+printIfNotNull(TempBldgData[idtbl].year_difference)+"</td>";
		var psf = TempBldgData[idtbl].sold_price / parseInt(TempBldgData[idtbl].grossofficearea);
		if(psf > 0)
			str += "<td>Price PSF</td><td style='background-color:"+getInvestmentSaleColor(parseFloat(TempBldgData[idtbl].sold_price), psf, true)+"'>$"+psf.toFixed(2)+"</td>";
		else
			str += "<td>Price PSF</td><td></td>";
	str += "</tr>";
	str += "<tr><td>Vendor</td><td colspan='3'><b>"+printIfNotNull(TempBldgData[idtbl].vendor_company_name)+"</b></td></tr>";
	str += "<tr><td>Purchaser</td><td colspan='3'><b>"+printIfNotNull(TempBldgData[idtbl].purchaser_company_name)+"</b></td></tr>";
	if(TempBldgData[idtbl].description != null && TempBldgData[idtbl].description != "")
	{
		str += "<tr><td>Note</td><td colspan='3'>"+printIfNotNull(TempBldgData[idtbl].description)+"</td></tr>";
	}
	str += "</table>";
	
	$(".infoboxContainerData").html(str);
	$(".infoboxContainer").show();

	initiateCopyButton();
	updateURL();
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
	
	var st = "<a href='javascript:void(0)' class='buildingNameOnInfobox' onClick='flyToBuildingCamera("+stData.idtbuilding+");'>"+stData.address+"</a>";
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
			str += "<td>Available Area</td><td><b>" +numberWithCommaWithoutDecimal(stData.SuiteSize, "", " sqm") + "</b></td></tr>";
		}
		else
		{
			availableArea = parseInt(stData.TotalSuiteSize);
			str += "<td>Available Area</td><td><b>" +numberWithCommaWithoutDecimal(stData.TotalSuiteSize, "", " sqm") + "</b></td></tr>";
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
		str += "<tr><td colspan='2'>Listing Broker</td><td colspan='2'>" + PrintIfNotNull(stData.ListingBroker1) + "</td></tr>";
		
		
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
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["A"]+';">A Office</div>';
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["B"]+';">B Office</div>';
			str += '<div class="colorLegend2 " style="width: 100px !important; background-color: '+classColor["C"]+';">C Office</div>';
		}
		else if(lastSelectedBuildingType == "Residential")
		{
			str = '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["MDU"]+';">Condominiums</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["APT"]+';">Apartments</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["SENIOR"]+';">Retirement</div>';
		}
		else if(lastSelectedBuildingType == "Hotel")
		{
			str = '<div class="colorLegend2 " style="width: 55px; background-color: '+classColor["HOTEL"]+';">Hotels</div>';
		}
		else if(lastSelectedBuildingType == "All")
		{
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["AA"]+';">'+getPrimeOfficeChange()+'</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["A"]+';">A Office</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["B"]+';">B Office</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["C"]+';">C Office</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["Retail"]+';">Retail</div>';
		
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["MDU"]+';">Condominiums</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["APT"]+';">Apartments</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["HOTEL"]+';">Hotels</div>';
		
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["SENIOR"]+';">Retirement</div>';
			
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["EDU"]+';">Education</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["MED"]+';">Healthcare</div>';
			
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["GOV"]+';">Government</div>';
			str += '<div class="colorLegend2 " style="width: 115px; background-color: '+classColor["PRKS"]+';">Parkades</div>';
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
		clearIsolateEffect();
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
		clearIsolateEffect();
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

var buildingTypeDropdown = ["Office", "Floorplan", "Residential", "Hotel", "Development", "All"];
var lastSelectedBuildingType = "Office";
var lastSelectedMarket = null;
window.cityLabels = [];
var disabledMarkets = [];
disabledMarkets = [7, 8, 9, 45, 48, 3, 78];//Move to DB
window.marketsEnabledForInvestmentSales = [1, 3, 18, 26];//Calgary, Toronto, Vancouver, Edmonton
window.citiesEnabledForInvestmentSales = [1, 2, 12, 15];//Calgary, Toronto, Vancouver, Edmonton
function ShowSummaryInfobox()
{
	//console.log("Inside Summary => "+lastSelectedBuildingType);
	$(".logoOverlay").show();
	$(".marketStatsButtonContainer").hide();
	var cityDropdownOption = "<select style='width: 49% !important; font-size:16px;' data-dropup-auto='false' id='mainCityDropdown' onChange='loadMarket(this.value)'>";
	var dropdownSelected = "";
	var country = null;
	$.each(marketDetails, function (index, eachMarket){
		dropdownSelected = " ";
		if(country != eachMarket.country)
		{
			if(country != null)
				cityDropdownOption += "</optgroup>";
			cityDropdownOption += "<optgroup label='"+eachMarket.country+"' >";
			country = eachMarket.country;
		}
			
		if(lastMarketLoaded == eachMarket.idtmarket)
			dropdownSelected = " selected ";
		var isDisabled = '';
		if(disabledMarkets.includes(parseInt(eachMarket.idtmarket)) || disabledMarkets.includes(eachMarket.idtmarket))
		{
			isDisabled = ' disabled ';
			////console.log(eachMarket.idtmarket+" disabled");
		}
		cityDropdownOption += "<option "+isDisabled+" "+dropdownSelected+" value='"+eachMarket.idtmarket+"'>"+eachMarket.smarketname+"</option>";
	});
	cityDropdownOption += "</optgroup>";
	cityDropdownOption += "</select>";
	
	var buildingTypeOption = "<select style='width: 49% !important; font-size:16px;' data-dropup-auto='false' id='marketDropdown' onChange='loadNewBuildingTypeView(this.value)'>";
	dropdownSelected = "";
	$.each(buildingTypeDropdown, function (index, eachType){
		var dText = eachType+" Market";
		if(eachType == "Floorplan")
			dText = "Available Office Space";
		if(eachType == "Development")
			dText = "Development Activity";
		if(eachType == "Residential")
			dText = "Multifamily Market";
		if(eachType == "All")
			dText = "All Properties";
		dropdownSelected = " ";
		if(lastSelectedBuildingType == eachType)
			dropdownSelected = " selected ";
		buildingTypeOption += "<option "+dropdownSelected+" value='"+eachType+"'>"+dText+"</option>";
		if(lastMarketLoaded == 36 && eachType == "All")
		{
			dropdownSelected = " ";
			if(lastSelectedBuildingType == "AvailableOfficeSpace")
				dropdownSelected = " selected ";
			buildingTypeOption += "<hr><option "+dropdownSelected+" value='AvailableOfficeSpace'>Example Market Vacancy</option>";

			dropdownSelected = " ";
			if(lastSelectedBuildingType == "OfficeRentalRates")
				dropdownSelected = " selected ";
			buildingTypeOption += "<option "+dropdownSelected+" value='OfficeRentalRates'>Example Market Rates</option>";

		}
		if(window.marketsEnabledForInvestmentSales.includes(parseInt(lastMarketLoaded)) && eachType == "Floorplan")
		{
			dropdownSelected = " ";
			if(lastSelectedBuildingType == "InvestmentSalesMarket")
				dropdownSelected = " selected ";
			buildingTypeOption += "<option "+dropdownSelected+" value='InvestmentSalesMarket'>Investment Sales Market</option>";
		}
	});
	buildingTypeOption += "</select>";
	//$(".summaryInfoboxCityDetails").html("<b>Downtown</b> "+cityDropdownOption+" "+buildingTypeOption+" <b>Market</b>&nbsp;&nbsp; <span style='position: absolute; right: 15px;font-size: 12px;'><a href='javascript:reloadCityCamera();' >Skyline</a></span>");
	//<span style='position: absolute; right: 15px;font-size: 12px;'><a href='javascript:reloadCityCamera();' >Skyline</a></span>
	$(".summaryInfoboxCityDetails").html(""+cityDropdownOption+" "+buildingTypeOption+"");
	
	//Need to do something for this. Hardcoded
	loadSydneyMarketDropdown(parseInt(lastCityLoaded), "", false);
	var str = '';
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
			str += "<tr><td valign='top'>Status</td><td valign='top' class='alignCenter'>Projects</td><td class='alignCenter'>Resi Units</td><td class='alignCenter'>Hotel Doors</td><td class='alignCenter'>Office "+cityAreaMeasurementUnit+"</td></tr>"; 
			
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
		
		var str = "<table class='table table-striped minPaddingtable' cellpadding=2 cellspacing=0 border=0 witdh='90%'>";
		cellWidth = " width: 95px;";
		str += "<tr><td>Class</td><td class='alignCenter'>Properties</td><td class='alignCenter'>Average Age</td><td class='alignCenter'>Area</td></tr>"; 
		if(typeof allBuildingVisualizationSummary[parseInt(lastMarketLoaded)] != "undefined")
		{
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['AA']+";"+cellWidth+"'>"+getPrimeOfficeChange()+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["AA"][0])+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["AA"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["AA"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['A']+";"+cellWidth+"'>A Office</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["A"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["A"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["A"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['B']+";"+cellWidth+"'>B Office</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["B"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["B"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["B"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['C']+";"+cellWidth+"'>C Office</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["C"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["C"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["C"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['Retail']+";"+cellWidth+"'>Retail</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["Retail"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["Retail"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["Retail"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['MDU']+";"+cellWidth+"'>Condominiums</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MDU"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MDU"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["Condominiums"].officeArea, "", " units")+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['Apartments']+";"+cellWidth+"'>Apartments</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["APT"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["APT"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["Apartments"].officeArea, "", " units")+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['HOTEL']+";"+cellWidth+"'>Hotels</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["HOTEL"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["HOTEL"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["Hotel"].officeArea, "", " doors")+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['SENIOR']+";"+cellWidth+"'>Retirement</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["SENIOR"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["SENIOR"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["SENIOR"].officeArea, "", " units")+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['EDU']+";"+cellWidth+"'>Education</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EDU"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EDU"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["EDU"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['MED']+";"+cellWidth+"'>Healthcare</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MED"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MED"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["MED"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['GOV']+";"+cellWidth+"'>Government</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["GOV"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["GOV"][1])+"</td><td>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["GOV"].officeArea), "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr><td class='infoboxLegendTD' style='background-color:"+classColor['PRKS']+";"+cellWidth+"'>Parkades</td><td  class='alignCenter'>"+allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["PRKS"][0]+"</td><td  class='alignCenter'>"+printBlankIfNotNull(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["PRKS"][1])+"</td><td>"+numberWithCommaWithoutDecimal(summaryDetails[lastMarketLoaded]["PRKS"].stalls, "", " stalls")+"</td></tr>"; 
			
			var avgCount = 0;
			$.each(["AA", "A", "B", "C", "Retail", "MDU", "APT", "HOTEL", "SENIOR", "EDU", "MED", "GOV", "PRKS"], function (iiijj, eachItClass){
				if(parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)][eachItClass][1]) > 0)
					avgCount++;
			});
			avgAge = Math.round((parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["AA"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["A"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["B"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["C"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["Retail"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MDU"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["APT"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["HOTEL"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["SENIOR"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["EDU"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["MED"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["GOV"][1]) + parseInt(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["PRKS"][1]) ) / avgCount, 0);
			
			grossLeasableArea = parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["AA"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["A"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["B"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["C"].officeArea)) + parseInt(getAreaInCityUnits(summaryDetails[lastMarketLoaded]["Retail"].officeArea));
			
			totalResidentialUnit = (parseInt(summaryDetails[parseInt(lastMarketLoaded)]["Condominiums"].officeArea) + parseInt(summaryDetails[parseInt(lastMarketLoaded)]["Apartments"].officeArea) + parseInt(summaryDetails[parseInt(lastMarketLoaded)]["SENIOR"].officeArea) );
			
			str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["TOTAL"][0])+"</td><td class='alignCenter'>"+avgAge+"</td></tr>"; 
			//str += "<tr class='row-with-totals'><td>Total</td><td class='alignCenter'>"+numberWithCommaWithoutDecimal(allBuildingVisualizationSummary[parseInt(lastMarketLoaded)]["TOTAL"][0])+"</td><td class='alignCenter'></td></tr>"; 
			str += "<tr class='row-with-totals'><td colspan='2'>Market Size (GLA)</td><td></td><td>"+numberWithCommaWithoutDecimal(grossLeasableArea, "", " "+cityAreaMeasurementUnit)+"</td></tr>"; 
			str += "<tr class='row-with-totals'><td colspan='2'>Residential Inventory</td><td></td>  <td>"+numberWithCommaWithoutDecimal(totalResidentialUnit, "", " units")+"</td></tr>"; 
		}
		str += "</table>";
		
	}
	else if(lastSelectedBuildingType == "Office")
	{
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
					eachClassDisplay = marketDetailsV2[lastMarketLoaded].class_aa_rename.replace(" Office", "");
					if(eachClassDisplay == "Prime")
						cellWidth = " width: 80px; ";
				}
				eachRow = summaryDetails[lastMarketLoaded][eachClass];
				str += "<tr id='"+eachClass+"'><td class='infoboxLegendTD' style='background-color:"+classColor[eachClass]+"; "+cellWidth+";'>"+prefix+""+eachClassDisplay+""+suffix+"</td><td class='alignCenter'>"+printNumberFormat(eachRow.totalBuildings)+"</td>";
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
					str += "<tr id='"+eachClass+"'><td class='infoboxLegendTD' style='background-color:"+classColor[eachClass]+"; "+cellWidth+"'>"+prefix+""+eachClassDisplay+"</td><td class='alignCenter'>"+printNumberFormat(eachRow.totalBuildings)+"</td>";
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
	
	if(lastSelectedBuildingType == "Residential")
	{
		$("#Apartments").next().after($("#Apartments"));
	}
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
	str += "</table>";
	$(".summaryInfoboxContainerData").html(str);
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
				str += "<tr><td>Class</td><td class='alignCenter'>Transactions</td>";
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
	str += "<tr><td>Property Class</td><td class='alignCenter'>Transactions</td>";
	str += "<td class='alignCenter'>Sq Ft</td>";
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
	//clearLastSelectedFunctions();
	reloadCityCamera();
	//loadNewBuildingTypeView("Office");
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
function loadNewBuildingTypeView(type)
{
	setDropdownWidthClass();
	
	loadBuildingForAutoSuggest(lastMarketLoaded);
	DisableBottomPanoButton();
	
	$("#pano-view-li").hide();
	$(".full-screen-arrow").hide();
	saveUserAccessDetails("",  $("#mainCityDropdown option:selected").text() + " - " + $("#marketDropdown option:selected").text());
	clearPrimitives(false);
	clearLastSelectedFunctions();
	$(".infoboxContainer").hide();  $("#infoboxFloorPlanRow").hide();
	window.lastSuite = null;
	viewer.entities.removeById("starRatingBox");
	viewer.entities.removeById("FogEffectEntityPreload");
	loadFogPreload(lastCityLoaded);
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
							developmentBuildingDetails[lastMarketLoaded] = data.developmentBuildings;
							developmentBuildingFloors = data.developmentBuildingFloors;
							developmentBuildingSummary[lastMarketLoaded] = data.developmentSummary;
							summaryDetails[lastMarketLoaded] = data.summary;
							allBuildingVisualizationSummary[lastMarketLoaded] = data.allBuildingVisualizationSummary;
							submarketDetails = data.submarketDetails;
							//console.log("submarketDetails", submarketDetails);
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

function getCenterOfMap()
{
	//Not useful...
	// Get the center of the screen in Cartesian3 coordinates
	var centerOfScreen = new Cesium.Cartesian2(
		viewer.canvas.clientWidth / 2,
		viewer.canvas.clientHeight / 2
	);

	// Get the position on the ellipsoid
	var ellipsoid = viewer.scene.globe.ellipsoid;
	var centerPosition = viewer.camera.pickEllipsoid(centerOfScreen, ellipsoid);

	if (centerPosition) {
		// Convert the Cartesian3 position to Cartographic (latitude, longitude, height)
		var cartographic = Cesium.Cartographic.fromCartesian(centerPosition);
		
		// Convert radians to degrees for latitude and longitude
		var longitude = Cesium.Math.toDegrees(cartographic.longitude);
		var latitude = Cesium.Math.toDegrees(cartographic.latitude);
		var height = cartographic.height;
		//console.log('Center Longitude: ' + longitude);
		//console.log('Center Latitude: ' + latitude);
		//console.log('Height: ' + height);
		
		return [longitude, latitude, height];
	} else {
		//console.log('The center of the screen does not intersect the ellipsoid.');
	}
}

async function CameraSlowRotation(defaultIdtcamera = null, defaultCurrentPosition = null) {
	camera = viewer.scene.camera;
	
	var idtcameraToRotateAround = defaultIdtcamera;
	if(defaultIdtcamera == null)
	{
		var mktDetail = [];
		$.each(marketDetails, function (index, row){
			if(row.idtcity == lastCityLoaded)
			{
				mktDetail = row;
				idtcameraToRotateAround = mktDetail.skylineidtcamera;
			}
		});
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
  var cartesian = new Cesium.Cartesian3.fromDegrees(lon, lat, height);
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
  //var cartesian = new Cesium.Cartesian3.fromDegrees(lon, lat, height);
  //return cartesian;
}

var lastBuildingSolidFloorHighlighted = null;
var buildingAssetEffectActive = false;
window.lastHolesString = "";
window.buildingAssetHeightvalues = [];
function createBuildingAssets(idtbldg)
{
	if(highlightEffectActive)
	{
		clearHighlightEffect();
		highlightEffectActive = !highlightEffectActive;
	}
	if(!buildingAssetEffectActive)
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
		}
		
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[lastCityLoaded] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		//viewer.entities.removeById("FogEffectEntity");
		//viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		
		
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
			showFloorNumberLabelV3("floorLabelAsset-"+idtbldg+"-"+eachFloor.number, coordsToUse[0], coordsToUse[1], (lastFloorHeight + loopFloorHt - 2), eachFloor.number, "14px Helvetica Neue", 10, true, true, false);
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
	}
	else
	{
		effectsArray[5] = 0;//Floor plan effect
		//console.log("Floor RESET");
		if(effectsArray[0] == 1 || effectsArray[6] == 1 )
		{
			//Create clipping effect for this building
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
			googleTileset.clippingPolygons.inverse = true;
			googleTileset.show = true;
		}
		else if(effectsArray[1] == 1)
		{
			window.lastHolesString = '';
			if(typeof TempBldgData[idtbldg] != "undefined")
				window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
			clearPrimitives(false);
			viewer.entities.removeById("FogEffectEntity");
			viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof cityBoundaries[lastCityLoaded] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		}
		else
		{
			googleTileset.clippingPolygons.enabled = false;
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
	effectsArray[5] = 0;//Floor plan effect
	$(".floorNumberRowTR").hide();
	
	$("#infoboxFloorPlanRow").html("");
	$("#infoboxFloorPlanRow").hide();
	
	$("#assetButton").addClass("btn-secondary");
	$("#assetButton").removeClass("btn-primary");
	
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

window.isolateEffectActive = false;
var buildingIdInEffect = null;
window.stadiaMapLoaded = false;
function createIsolateEffect(idtbldg)
{
	//Clear isolate on Satellite if active
	if(window.isolateSatelliteEffectActive == true)
	{
		clearIsolateSatelliteEffect(idtbldg);
		setResetTickForEffectsButtons("isolateSatelliteButton2", false);
	}
	
	if(typeof window.stadiaMapLoaded == "undefined" || !stadiaMapLoaded)
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
	if(typeof window.isolateEffectActive == "undefined" || !window.isolateEffectActive)
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
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		
		ToggleClipSelectedBuildingApp15(idtbldg);
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
	}
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
			ToggleClipSelectedBuildingApp15(idtbldg);
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
		
		clearIsolateEffect();
		
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
	window.isolateEffectActive = !window.isolateEffectActive;
	updateURL();
}

function clearIsolateEffect()
{
	effectsArray[0] = 0;//re-setting isolate dark effect
	removeTerrain();
	window.stadiaMapLoaded = false;
	viewer.scene.globe.depthTestAgainstTerrain = false;
	globe.translucency.enabled = false;
	if(effectsArray[5] == 1)
	{
		
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
	if(window.isolateEffectActive == true)
	{
		clearIsolateEffect();
		setResetTickForEffectsButtons("isolateButton2", false);
	}
	if(typeof window.sateliteMapLoaded == "undefined" || !window.sateliteMapLoaded)
	{
		window.arcgisLayer = viewer.imageryLayers.addImageryProvider(
		  await Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
			Cesium.ArcGisBaseMapType.SATELLITE
		  )
		);
		
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
		createTerrain();
	}
	if(typeof window.isolateSatelliteEffectActive == "undefined" || !isolateSatelliteEffectActive)
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
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
		
		ToggleClipSelectedBuildingApp15(idtbldg);
		
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
	}
	else
	{
		effectsArray[6] = 0;//re-setting isolate satelite effect
		
		clearIsolateSatelliteEffect(idtbldg);
		
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
	}
	window.isolateSatelliteEffectActive = !window.isolateSatelliteEffectActive;
	updateURL();
}

function clearIsolateSatelliteEffect(idtbldg)
{
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
		ToggleClipSelectedBuildingApp15(idtbldg);
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

var spotlightEffectActive = false;
var buildingIdInEffect = null;
function createSpotlightEffect(idtbldg)
{
	if(!spotlightEffectActive)
	{
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
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[lastCityLoaded] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		$("#spotlightButton").removeClass("btn-secondary");
		$("#spotlightButton").addClass("btn-primary");
		//$("#transparencyDiv").show();
	}
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
	}
	spotlightEffectActive = !spotlightEffectActive;
	updateURL();
}

function clearSpotlightEffect()
{
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
	if(!newHighlightEffectActive)
	{
		effectsArray[2] = 1;//highlight effect
		buildingIdInEffect = idtbldg;
		
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[lastCityLoaded] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		//highlight with class color
		var clr = classColorCoding[TempBldgData[idtbldg].buildingclass];
		
		var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : new Cesium.PolygonGeometry({
				  polygonHierarchy : new Cesium.PolygonHierarchy(
					Cesium.Cartesian3.fromDegreesArray(eval("["+TempBldgData[idtbldg].coords+"]"))
				  ),
				  height : 3000,
				  extrudedHeight : -100
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
	}
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
	}
	newHighlightEffectActive = !newHighlightEffectActive;
	updateURL();
}

function clearApp6HighlightEffect()
{
	effectsArray[2] = 0;//highlight effect
	clearPrimitives();
	$("#newHighlightButton").addClass("btn-secondary");
	$("#newHighlightButton").removeClass("btn-primary");
}

var clipEffectActive = false;
function createClipEffect(idtbldg)
{
	if(!clipEffectActive)
	{
		effectsArray[8] = 1;//Clip Effect
		buildingIdInEffect = idtbldg;
		
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
		googleTileset.clippingPolygons.inverse = false;
		//$("#newHighlightButton").removeClass("btn-secondary");
		//$("#newHighlightButton").addClass("btn-primary");
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
	updateURL();
}

function clearClipEffect()
{
	effectsArray[8] = 0;//Clip Effect
	//clearPrimitives();
	googleTileset.clippingPolygons.enabled = false;
	googleTileset.clippingPolygons.inverse = false;
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
		viewer.entities.removeById("FogEffectEntity");
		if(typeof cityBoundaries[lastCityLoaded] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType."+cesOverlay+", }, }) ");
		viewer.entities.removeById("FogEffectEntityPreload");
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
		if(whiteOverlayEffectActive)
		{
			clearWhiteOverlayEffect();
		}
		if(!darkOverlayEffectActive)
		{
			setResetSettingFlags("dark-overlay-li", true);
			viewer.entities.removeById("FogEffectEntity");
			viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof window.lastHolesString == "undefined")
			{
				window.lastHolesString = "";
			}
			
			var cesOverlay = "CESIUM_3D_TILE";
			if(effectsArray[6] == 1 || effectsArray[0] == 1 )
				cesOverlay = "BOTH";
			if(typeof cityBoundaries[lastCityLoaded] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.BLACK.withAlpha(0.5), classificationType: Cesium.ClassificationType."+cesOverlay+", }, }) ");
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
		if(darkOverlayEffectActive)
		{
			clearDarkOverlayEffect();
		}
		if(!whiteOverlayEffectActive)
		{
			setResetSettingFlags("white-overlay-li", true);
			viewer.entities.removeById("FogEffectEntity");
			viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof window.lastHolesString == "undefined")
			{
				window.lastHolesString = "";
			}
			var cesOverlay = "CESIUM_3D_TILE";
			if(effectsArray[6] == 1 || effectsArray[0] == 1 )
				cesOverlay = "BOTH";
			if(typeof cityBoundaries[lastCityLoaded] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType."+cesOverlay+", }, }) ");
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
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
	//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	//window.darkOverlayEffectColor = 'WHITE';

	//$("#darkoverlayButton").addClass("btn-secondary");
	//$("#darkoverlayButton").removeClass("btn-primary");
}

function clearWhiteOverlayEffect()
{
	whiteOverlayEffectActive = false;
	setResetSettingFlags("white-overlay-li", false);
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
	
	//eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color.WHITE.withAlpha(0.5), classificationType: Cesium.ClassificationType.BOTH, }, }) ");
	//window.darkOverlayEffectColor = 'WHITE';

	//$("#darkoverlayButton").addClass("btn-secondary");
	//$("#darkoverlayButton").removeClass("btn-primary");
}

function clearEntireOverlayEffect()
{
	darkOverlayEffectActive = false;
	whiteOverlayEffectActive = false;
	
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
	
	window.darkOverlayEffectColor = '';
}

//window.floorNumberLabels = viewer.scene.primitives.add(new Cesium.LabelCollection());
window.floorLabels = [];
function showFloorNumberLabelV3(id, lon, lat, height, label, font, disableDepthTestDistance, fadeByDistance = false, showBackground = true, clearOthers = true)
{
	if(typeof viewer.entities.getById(id) == "undefined")
	{
		floorLabels.push(id);
		viewer.entities.add({
			id: id,
			show: false,
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
function createFloorsEffect(idtbldg)
{
	if(buildingAssetEffectActive)
	{
		clearBuildingAssets();
		buildingAssetEffectActive = !buildingAssetEffectActive;
		if(typeof googleTileset.clippingPolygons != "undefined")
			googleTileset.clippingPolygons.enabled = false;
	}
	if(!highlightEffectActive)
	{
		effectsArray[4] = 1;//floorplans effect
		
		buildingIdInEffect = idtbldg;
		//ShowInfobox(idtbldg);
		window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		if(effectsArray[0] == 1 || effectsArray[6] == 1 )
		{
			//googleTileset.show = false;
		}
		else
		{
			viewer.entities.removeById("FogEffectEntity");
			viewer.entities.removeById("FogEffectEntityPreload");
			if(typeof cityBoundaries[lastCityLoaded] != "undefined")
				eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
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
				classificationType : Cesium.ClassificationType.BOTH,
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
	}
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
	updateURL();
}

function clearHighlightEffect()
{
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
	if(!floorplanEffectActive)
	{
		effectsArray[7] = 1;//floorplans effect
		
		clearPrimitives(false);
		
		//var bldgName = cityFloorPlan[parseInt(lastCityLoaded)][parseInt(devSelectedBuilding)];
		window.lastHolesString = ' ';
		if(typeof TempBldgData[idtbldg] != "undefined")
			window.lastHolesString = ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+TempBldgData[idtbldg].coords+' ]), }, ';
		clearPrimitives(false);
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[lastCityLoaded] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		
		clr = "";
		defaultShow = true;
		var lastFloorHeight = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
		if(typeof TempBldgData[idtbldg] != "undefined" && TempBldgData[idtbldg].basefloorheight != null)
			lastFloorHeight += parseFloat(TempBldgData[idtbldg].basefloorheight);
		var clr = "Cesium.Color.RED.withAlpha(0.5)";
		
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
				window.floorPlanPrimitivesIndexes.unshift({"id": "floorPlanEntity-"+idtbldg+"-"+eachFloor.number, "primitiveindex" : window.floorPlanPrimitives.length } );
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
	floorplanEffectActive = !floorplanEffectActive;
	updateURL();
}

function clearFloorplanEffect()
{
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

function prepareFloorPlanInInfobox(idtbldg, floorNumber, details)
{
	var bldgName = "";
	var st = "";
	if(lastSelectedBuildingType == "Floorplan")
	{
		st = '<div style="margin: 5px; padding: 2px; margin-left: 0px !important; padding-left: 0px !important;">';
		st += '<a style="margin-top: 5px;position: absolute;" href="javascript:void(0)" class="buildingNameOnInfobox" onclick="flyToBuildingCamera('+idtbldg+');">'+window.cityBuildingDetails[lastCityLoaded][idtbldg].sbuildingname+'</a>';
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
		st += prepareSuiteImagesTabStructure(details[0]["idtsuite"], idtbldg, floorNumber, 0, adminBaseUrl+details[0].image_path+details[0].image_name);
		
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
				tabContent += prepareSuiteImagesTabStructure(eachSuite.idtsuite, idtbldg, floorNumber, index, adminBaseUrl+eachSuite.image_path+eachSuite.image_name);
				
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
	var bldgName = "";
	var st = "";
	if(lastSelectedBuildingType == "Floorplan")
	{
		st = '<div style=" margin-left: 0px !important; padding-left: 0px !important;">';
		st += '<a href="javascript:void(0)" class="buildingNameOnInfobox" onclick="flyToBuildingCamera('+idtbldg+');">'+details2.sbuildingname+'</a>';
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
		st += "<tr><td colspan='2' class='infoboxBuildingAddress'>"+details2.address+"</td><td colspan='2' class='alignRight'><a href=\"javascript:flyToSubmarketCamera("+details2.idtsubmarket+");\">"+details2.ssubname+"</a></td></tr>";
		st += "<tr><td>Floor</td><td>"+details[0]["floor_number"]+"</td>";
		if(details[0]["suite_area"] != "" && parseInt(details[0]["suite_area"]) > 0)
		{
			//st += "<td>Available Area</td><td><b>"+details[0]["suite_areaV2"]+" "+cityAreaMeasurementUnit+"</b></td>";
			st += "<td>Available Area</td><td><b>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(details[0]["suite_area"]), "", " "+cityAreaMeasurementUnit)+"</b></td>";
		}
		else
			st += "<td></td><td></td>";
		st += "</tr>";
		
		
		st += "<tr><td>Suite</td><td>"+details[0]["suite_name"]+"</td><td>Date Available</td><td>"+details[0]["date_available2"]+"</td></tr>";
		
		st += "<tr><td>Class</td><td>"+details[0]["class"]+"</td><td>Additional Rent</td><td>"+numberWithCommaWithTwoDecimal(details[0]["total_additional_rent"], "$", " /psf")+"</td></tr>";
		
		//Created  // "+PrintOnlyDate(PrintIfNotNull(details[0].date_created))+"
		st += "<tr><td>Age</td><td>";
		if(details[0]["year_difference"] > 0)
		{
			st += details[0]["year_difference"] + " years";
		}
		st += "</td><td>Annual Rent</td><td></td></tr>";
		
		//Status //Active
		st += "<tr><td></td><td></td><td>Lease Type</td><td>"+details[0]["lease_type"]+"</td></tr>";
		
		st += "<tr><td colspan=2>Listing Company</td><td colspan='2' onClick='initiateCompanyLogoEffectWithSpeed();'><strong>"+details[0]["companyname"]+"</strong></td></tr>";
		st += "<tr><td colspan=2>Listing Broker</td><td></td><td aligh='right' style='padding: 0px !important; float:right'>&nbsp;<span style='cursor:pointer;margin: 0px !important;padding-right:0px !important;' id='copyURLButton' ><img width='24px;' height='24px;' src='images/link_24.png' /></span></td></tr>";
		st += "</table>";
		$(".infoboxContainerData").html(st);
		$(".infoboxContainer").show();
		st = "";
		st += prepareSuiteImagesTabStructure(details[0]["idtsuite"], idtbldg, parseInt(details2.floor_number), index, adminBaseUrl+details[0].image_path+details[0].image_name);
		
		if(details[0]["suite_description"] != "")
		{
			st += "<span><small>"+details[0]["suite_description"]+"</small></span>";
		}
	}
	else
	{
		st += "<span class='infoboxBuildingAddress' style='float:left'>"+allSuitesOnFloor[0].address+"</span><span class='pull-right' style='position: absolute; right: 2% !important;'><a href=\"javascript:flyToSubmarketCamera("+allSuitesOnFloor[0].idtsubmarket+");\">"+allSuitesOnFloor[0].ssubname+"</a></span>";
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
					
					tabContent += "<tr><td>Floor</td><td>"+eachSuite.floor_number+"</td><td>Available Area</td><td><span class='buildingNameOnInfobox'><b>"+numberWithCommaWithoutDecimal(getAreaInCityUnits(eachSuite.suite_area), "", " "+cityAreaMeasurementUnit)+"</b></span></td></tr>";
					//tabContent += "<tr><td>Lease Type</td><td>"+eachSuite.lease_type+"</td><td>Space Type</td><td>"+eachSuite.space_type+"</td></tr>";
					
					tabContent += "<tr><td>Suite</td><td>"+eachSuite.suite_name+"</td><td>Date Available</td><td>"+eachSuite.date_available2+"</td></tr>";
		
					tabContent += "<tr><td>Class</td><td>"+eachSuite.class+"</td><td>Additional Rent</td><td>"+numberWithCommaWithTwoDecimal(eachSuite.total_additional_rent, "$", " /psf")+"</td></tr>";
					
					//Created  //"+PrintOnlyDate(PrintIfNotNull(eachSuite.date_created))+"
					tabContent += "<tr><td>Age</td><td>";
					if(eachSuite.year_difference > 0)
					{
						tabContent += eachSuite.year_difference + " years";
					}
					tabContent += "</td><td>Annual Rent</td><td></td></tr>";
					
					//Status  //Active
					tabContent += "<tr><td></td><td></td><td>Lease Type</td><td>"+eachSuite.lease_type+"</td></tr>";
					
					tabContent += "<tr><td colspan=2>Listing Company</td><td colspan=2 onClick='initiateCompanyLogoEffectWithSpeed();'><strong>"+eachSuite.companyname+"</strong></td></tr>";
					tabContent += "<tr><td colspan=2>Listing Broker</td><td></td><td aligh='right' style=' padding: 0px !important; float:right'>&nbsp;<span style='cursor:pointer;margin: 0px !important; padding-right: 0px !important;' id='copyURLButton' ><img height='24px;' width='24px;' src='images/link_24.png' /></span></td></tr>";
					
					//tabContent += "<tr><td>Company</td><td>"+eachSuite.companyname+"</td><td></td><td></td></tr>";
				tabContent += "</table>";
				
				tabContent += prepareSuiteImagesTabStructure(eachSuite.idtsuite, idtbldg, floorNumber, index, adminBaseUrl+eachSuite.image_path+eachSuite.image_name);
				tabContent += "<span><small>"+eachSuite.suite_description+"</small></span>";
				
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

function prepareSuiteImagesTabStructure(idtsuite, idtbldg, floorNumber, index, imagePath)
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
	
	var tabs = '<li class="nav-item"><a style="float:left; width: 85%;" class="nav-link active featureSheetLI" data-bs-toggle="tab" href="#floorplan-'+index+'">Floorplans</a></li>';
	var content = '<div class="tab-pane fade show active floorPlanImageDisplay" id="floorplan-'+index+'">';
	
		content += "<img onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '', '', '"+idtsuite+"', 'Yes');\" src='"+imagePath+"' width='96%'/>";
	
	content += '</div>';
	
	
	tabs += '<li class="nav-item"><a style="float:left; width: 85%; font-weight: normal !important;" class="nav-link" data-bs-toggle="tab" href="#Amenities-'+index+'">Amenities</a></li>';
	content += '<div class="tab-pane fade" id="Amenities-'+index+'">';
	
		content += "";//
	
	content += '</div>';
	
	if(typeof window.suiteOtherImages[cityId][idtsuite] != "undefined" && typeof window.suiteOtherImages[cityId][idtsuite]["interior-images"] != "undefined")
	{
		tabs += '<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-'+index+'-interior-images">Interior</li>';
		content += '<div class="tab-pane fade tab-images-container" id="tab-'+index+'-interior-images">';
		$.each(window.suiteOtherImages[cityId][idtsuite]["interior-images"], function (i, row){
			
			content += "<img onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '"+i+"', 'interior-images', '"+idtsuite+"', 'Yes');\" src='"+adminBaseUrl + row.image_path + row.image_name+"' width='96%'/>";
		});
		content += '</div>';
	}
	if(typeof window.suiteOtherImages[cityId][idtsuite] != "undefined" && typeof window.suiteOtherImages[cityId][idtsuite]["exterior-images"] != "undefined")
	{
		tabs += '<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-'+index+'-exterior-images">Exterior</li>';
		content += '<div class="tab-pane fade tab-images-container" id="tab-'+index+'-exterior-images">';
		$.each(window.suiteOtherImages[cityId][idtsuite]["exterior-images"], function (i, row){
			
			content += "<img onClick=\"openFullScreenImage('"+idtbldg+"', '"+floorNumber+"', '"+index+"', '"+i+"', 'exterior-images', '"+idtsuite+"', 'Yes');\" src='"+adminBaseUrl + row.image_path + row.image_name+"' width='96%' />";
			
		});
		content += '</div>';
	}
	
	var ln = 0;
	content += '<div class="tab-pane fade tab-images-container" id="tab-'+index+'-files">';
	if(typeof window.suiteOtherImages[cityId][idtsuite] != "undefined" && typeof window.suiteOtherImages[cityId][idtsuite]["files"] != "undefined")
	{
			content += '<ul class="list-group file-list">';
			$.each(window.suiteOtherImages[cityId][idtsuite]["files"], function (i, row){
				content += '<li class="list-group-item d-flex justify-content-between align-items-center"><a href="'+getURLForFiles(row)+'?id='+row.aos_document_id+'" target="'+getTargetForFiles(row)+'">'+row.filename+' ('+displayFileSize(row.filesize)+')</a></li>';
				ln++;
			});
			content += '</ul>';
	}
	
	tabs += '<li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-'+index+'-files">Files ('+ln+')</li>';
	content += '</div>';
	
	tabs += '<li class="ms-auto featureSheetTab"><span style="cursor:pointer;" class="featureSheetImage toggle-icon ms-2" data-target="#floorplan-'+index+'" onclick="toggleFloorplan(this, event)">';
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
	
	return "<ul class='nav nav-tabs' id='subTabs-"+index+"'>"+tabs+"</ul><div class='nav-tab-content mt-2' "+display+">"+content+"</div>";
}

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
	$.each(marketDetails, function (index, row){
		if(row.idtcity == lastCityLoaded)
		{
			mktDetail = row;
		}
	});
	
	var latLonDetails = getMapCenterV2();
	$.ajax({
	  method: "POST",
	  url: "../visgrid-tools/controller/cityAndSubmarketController.php",
	  data: { param : "saveCitySkylineCameraRotationDetails" , "idtcamera" : mktDetail.skylineidtcamera, "longitude" : latLonDetails[0], "latitude" : latLonDetails[1], "altitude" : latLonDetails[2], "updatedByName" : ""}
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
	
	window.cameraValues = [];
	
	window.lastFloor = 0;
	
	window.lastSuite = null;
}

window.currentURL = "";
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
	if(window.tabYearSelected != null)
	{
		window.currentURL += "&year="+window.tabYearSelected;
	}
	
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
		$(".infoboxContainer").show();
		if(lastSelectedBuildingType == "Floorplan")
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
			data: { param : "getMarketSalesDataCalgary", idtcity: lastCityLoaded}
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
window.totalOfficeAreaForVacancy = null;
window.availableOfficeSpaceImproved = [];
window.availableOfficeSpaceFloorWise = [];
window.availableOfficeSpaceSummary = null;
window.availableOfficeSpacePrimitives = [];
function getAvailableOfficeSpace(highlight = true)
{
	if(window.availableOfficeSpace == null || window.availableOfficeSpace.length == 0)
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
	
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
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
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
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

window.aosPrimitives = [];
window.suiteHeightValues = [];
function highlightAvailableOfficeSpace()
{
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
	if(typeof cityBoundaries[23] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[23]+") }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	updateURL();
	ShowLegend();
	var buildingHoleAdded = [];
	var cityAltitudeHeight = parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
	var floorAlreadyHighlighted = [];
	window.lastHolesString = '';
		$.each(availableOfficeSpace, function (index, eachSuite){
			
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
					clr = Cesium.Color.fromCssColorString(classColor[eachSuite.lease_type]).withAlpha(0.7);
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
						////console.log("ht"+baseFloorHeight+", "+((parseFloat(floorHeight) * parseInt(eachSuite.floor_number)) - parseFloat(floorHeight)));
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
						var ent = viewer.scene.groundPrimitives.add(new Cesium.ClassificationPrimitive({
								geometryInstances : new Cesium.GeometryInstance({
									geometry : new Cesium.PolygonGeometry({
									  polygonHierarchy : new Cesium.PolygonHierarchy(
										Cesium.Cartesian3.fromDegreesArray(eval("["+coords+"]"))
									  ),
									  extrudedHeight: parseFloat(cityAltitudeHeight) + parseFloat(baseFloorHeight) + parseFloat(newExtrudedHeight),
									  height: parseFloat(cityAltitudeHeight) + parseFloat(baseFloorHeight) + (parseFloat(newExtrudedHeight) + parseFloat(floorHeight)),
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
						prepareAvailableOfficeSpaceInfobox(eachSuite.idtbuilding, index, details, allSuitesOnFloor);
						selectedPrimitive = ent;
						selectedPrimitiveId = "availableOfficeSpace-"+eachSuite.idtbuilding+"-"+index+"-"+eachSuite.idtsuite;
						defaultSuiteId = null;
						var temp = details.splitCoords.split(",");
						var exHeight = parseFloat(details.floor_height) * parseFloat(details.floor_number);
						prepareLogoAndSqftLabels(selectedPrimitiveId, parseFloat(temp[1]), parseFloat(temp[0]), (exHeight + parseInt(cityAltitudeAdjustment[lastCityLoaded])), adminBaseUrl + details.companyimage, details.suite_area);
						setTimeout(function (){
						
							addPolygonOutlineOnTileset(coords, window.suiteHeightValues[lastSuiteId][0], window.suiteHeightValues[lastSuiteId][1], Cesium.Color.WHITE);
						}, 2000);
						
					}
				}
				else
				{
					floorAlreadyHighlighted[eachSuite.idtbuilding][eachSuite.floor_number]++;
				}
			}
		});
		viewer.entities.removeById("FogEffectEntity");
		viewer.entities.removeById("FogEffectEntityPreload");
		if(typeof cityBoundaries[lastCityLoaded] != "undefined")
			eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
		////console.log("floorAlreadyHighlighted", floorAlreadyHighlighted);
		
		executeDefaultEffectsAndCamera();
		eventsToExecuteAfterLoadingData();
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

function highlightCalgaryOfficeMarketSales(yearSelected = "")
{
	devSelectedBuilding = "";
	closeInfobox();
	//viewer.entities.removeById("FogEffectEntity");
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
	$.each(objectToUse, function (cntr, eachSuite){
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
					  height : 3000,
					  extrudedHeight : -100
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
		window.calgaryOfficeSalePrimitives.push(ent);
		if(typeof defaultBuilding != "undefined" && defaultBuilding != null && defaultBuilding == eachSuite.idtbuilding)
		{
			selectedPrimitive = ent.primitive;
			selectedPrimitiveId = "calgaryOfficeMarket-"+cntr+"-"+eachSuite.idtbuilding;
			ShowInfoboxOfficeMarketSales(eachSuite.idtbuilding);
			defaultBuilding = null;
			
		}
	});
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
	if(typeof cityBoundaries[lastCityLoaded] != "undefined")
		eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundaries[lastCityLoaded]+"), holes: eval(["+window.lastHolesString+"]) }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
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
	viewer.entities.removeById("FogEffectEntity");
	viewer.entities.removeById("FogEffectEntityPreload");
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
					  height : 3000,
					  extrudedHeight : -100
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
			if(!whiteOverlayEffectActive)
			{
				setResetSettingFlags("white-overlay-li", true);
				createWhiteOverlayEffect();
				return;
			}
			else
			{
				clearWhiteOverlayEffect();
			}
		}
		else if($(this).attr("data-text") == "Dark Overlay")
		{
			if(!darkOverlayEffectActive)
			{
				setResetSettingFlags("dark-overlay-li", true);
				createDarkOverlayEffect();
				return;
			}
			else
			{
				clearDarkOverlayEffect();
			}
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
		}
		else if($(this).attr("data-text") == "FPS")
		{
			viewer.scene.debugShowFramesPerSecond = !viewer.scene.debugShowFramesPerSecond;
		}
		else if($(this).attr("data-text") == "Shrink")
		{
			toggleShrinkTileset();
		}
		else if($(this).attr("data-text") == "Reset")
		{
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
	
	$('.dropdownCam-item').on('click', function (e) {
		e.preventDefault(); // Prevent default link behavior
		$('.dropdownCam').removeClass('active');
		// Toggle 'selected' class on the clicked item
		$(this).toggleClass('selected');
		
		if($(this).attr("data-text") == "City Orbit")
		{
			ToggleCameraRotationSlowly();
			//FlyToCityOrbit();
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
	//console.log("now initiateSkylineDropdown()");
	window.skylineDropdownInitiated = true;
	$('.dropdown3-toggle').on('click', function (e) {
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
	  $('.dropdown3-item').on('click', function (e) {
		e.preventDefault(); // Prevent default link behavior

		// Toggle 'selected' class on the clicked item
		//$(this).toggleClass('selected');
		
		if($(this).attr("data-text") == "City Skyline" || $(this).attr("data-text") == "city-skyline")
		{
			flyToCitySkylineSlow($(this).attr("data-id"));
		}
		else if($(this).attr("data-text") == "City Skyline2" || $(this).attr("data-text") == "city-skyline2")
		{
			flyToCitySkyline2Slow($(this).attr("data-id"));
		}
		else
		{
			flyToSubmarketCamera($(this).attr("data-id"));
		}
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

function settingResetToDefault()
{
	lastSelectedBuilding = "";
	//Reset Setting to Default
	setResetSettingFlags("white-overlay-li", true);
	setResetSettingFlags("dark-overlay-li", false);
	whiteOverlayEffectActive = false;
	createWhiteOverlayEffect();
	
	setResetSettingFlags("shrink-li", false);
	setResetSettingFlags("toggleLogo-li", false);
	toggleShrinkTileset(true);
	
	setResetSettingFlags("fps-li", false);
	viewer.scene.debugShowFramesPerSecond = false;
	
	setResetSettingFlags("reset-li", false);
	
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
	var bldgName = "";
	if(isAvailableOfficeSuite)
	{
		$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox modalHeaderText'>"+bldgName+"</span>");
		
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
			$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox modalHeaderText'>"+window.TempBldgData[idtbuilding].sbuildingname+"</span>");
		}
		else if(typeof window.cityFloorPlan[parseInt(lastCityLoaded)][parseInt(devSelectedBuilding)] != "undefined")
		{
			$.each(window.cityFloorPlan[parseInt(lastCityLoaded)][parseInt(devSelectedBuilding)], function (floor, floorData){
				if(typeof floor != "undefined" && typeof floorData != "undefined" && bldgName == "")
				{
					bldgName = floorData[0]["sbuildingname"];
				}
			});
			$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox modalHeaderText'>"+bldgName+"</span>");
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
	var bldgName = details.sbuildingname;
	
		$(".fullscreenmodal-title").html("<span class='buildingNameOnInfobox modalHeaderText'>"+bldgName+"</span>");
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
	$(".modal-right").html("<div><img class='modalCompanyLogo' height='100px' src='"+adminBaseUrl+details["companyimage"]+"'/></div>");
	
	var modalImage = '';
	if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
		modalImage += '<button class="prev" onclick="changeModalImage('+details.idtsuite+', -1)">&#10094;</button>';
	
	modalImage += '<img id="modalFullScreenImage" src="'+url+'" width="90%">';
	
	if(window.modalImageType != '' && typeof window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType] != "undefined" && window.suiteOtherImages[parseInt(lastCityLoaded)][idtsuite][window.modalImageType].length > 1)
		modalImage += '<button class="next" onclick="changeModalImage('+details.idtsuite+', 1)">&#10095;</button>';
	$(".modal-center").html(modalImage);
	$(".fullscreen-innter-content").html("");
	
	firstTimeFullScreenModalOpened();
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
if(typeof Cesium != "undefined" && typeof Cesium.TileLoadErrorEvent != "undefined")
{
	Cesium.TileLoadErrorEvent.addEventListener(function(error) {
		console.error("Tile Load Error:", error);
		showCesiumError("Tile loading failed. Retrying...");
	});
}

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


