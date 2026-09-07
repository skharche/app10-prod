// ---------------------------------------------------------------------------
// AOS "Properties" building tour
//
// Clicking the Properties count for a listing company in the Leasing Market
// Statistics table (see startCompanyBuildingTour wiring in ShowCompanySummary())
// turns on that company's space filter (same as clicking the company name) and
// flies the camera through that company's buildings, visiting them ordered by
// number of available spaces (most -> least).
//
// While the tour runs the Rotate button on the bottom bar becomes a play/pause
// control, exactly like Market Orbit: single click pauses/resumes in place,
// double click cancels. Any click on the map also cancels it (unless paused).
//
// Every building in the portfolio gets a name label (in a dedicated LabelCollection that
// always draws on top) and a dashed footprint outline at a fixed height (it does NOT drape
// onto the terrain/tileset, same idea as the Office Market visualization). The building the
// camera is currently settled on / paused at is emphasised with a larger label.
//
// Camera motion mirrors Market Orbit's moveCameraAtConstantSpeed() (marketOrbit.js)
// - linear interpolation of position + orientation at a fixed real-world speed.
// "+"/"-" while a tour is running speed it up/slow it down, same as Market Orbit.
// ---------------------------------------------------------------------------

window.companyBuildingTourActive = false;
window.companyBuildingTourPaused = false;
window.companyBuildingTourUnsub = null;
window.companyBuildingTourCancelHandler = null;
window.companyBuildingTourEntities = [];
window.companyBuildingTourCompanyId = null;//company whose tour is running, for re-bolding on table re-render
window.companyBuildingTourDwellTimer = null;
window.companyBuildingTourActiveFootprintId = null;//id of the footprint entity currently turned solid
window.companyBuildingTourCurrentBuilding = null;//building the current leg is flying to / dwelling on
window.companyBuildingTourPhase = null;//"flight" while gliding to it, "dwell" once settled

// Building-name labels live in their own LabelCollection added LAST to scene.primitives, so they
// draw on top of the entity footprint polylines - a polyline's depthFailMaterial otherwise lets its
// dashes render over an entity label, no matter the label's height or eyeOffset.
window.companyTourLabelCollection = null;
window.companyTourLabelByBuilding = {};//idtbuilding -> Cesium Label object
window.companyBuildingTourActiveLabelObj = null;//the label currently blown up

function companyTourEnsureLabelCollection()
{
	if(window.companyTourLabelCollection == null && typeof viewer != "undefined")
		window.companyTourLabelCollection = viewer.scene.primitives.add(new Cesium.LabelCollection({ scene: viewer.scene }));
	return window.companyTourLabelCollection;
}

// metres/second - brisk glide between buildings
var COMPANY_TOUR_SPEED = 165;
// pause once settled on each building before gliding to the next
var COMPANY_TOUR_DWELL_MS = 5000;
// Draw each building's dashed footprint outline during the tour. Set to false to disable.
var COMPANY_TOUR_DRAW_FOOTPRINT = true;
// Name-label font: normal vs the building the camera is currently sitting on.
var COMPANY_TOUR_LABEL_FONT = "22px sans-serif";
var COMPANY_TOUR_LABEL_FONT_ACTIVE = "32px sans-serif";
// Footprint outline width: normal (dashed) vs the building currently emphasised (solid).
var COMPANY_TOUR_FOOTPRINT_WIDTH = 4;
var COMPANY_TOUR_FOOTPRINT_WIDTH_ACTIVE = 6;

// The footprint outline's normal look - dashed white, doesn't drape onto the tileset (see
// companyTourFootprintPositions()). Used both to draw it and to restore it after emphasis.
function companyTourFootprintDashMaterial()
{
	return new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString("#FFFFFF") });
}

function startCompanyBuildingTour(idtcompany)
{
	stopCompanyBuildingTour();

	if(typeof viewer == "undefined" || typeof window.availableOfficeSpace == "undefined" || window.availableOfficeSpace == null)
		return;

	// The Rotate button is shared with Market Orbit - a tour and an orbit can't both run.
	if(typeof StopFixedPointOrbit == "function" && (window.fixedOrbitInProgress || window.fixedOrbitStarting))
		StopFixedPointOrbit();

	// Turn on this company's space filter, just like clicking its name in the table
	// (also brings up the company logo bottom-left for the duration of the tour).
	// Skip it when this company's filter is already the active one - calling
	// filterAOSWithListingCompany() again in that state would toggle it back off.
	var alreadyFiltered = (typeof filterWithListingCompanyActive != "undefined" && filterWithListingCompanyActive
		&& typeof listingCompanyFiltered != "undefined" && listingCompanyFiltered == idtcompany);
	window.companyBuildingTourAppliedFilter = false;
	if(typeof filterAOSWithListingCompany == "function" && !alreadyFiltered)
	{
		filterAOSWithListingCompany(idtcompany, true);
		//Remember the tour turned this on, so stopCompanyBuildingTour() can turn it back off
		//(and clear the company logo) - but leave a filter the user set themselves alone.
		window.companyBuildingTourAppliedFilter = true;
	}

	// Group this company's available spaces by building: count the spaces, and
	// keep the building's lat/lon + floor-plate coords (both come off the AOS
	// query - tbuilding.latitude/longitude and tcoords.coords).
	var byBuilding = {};
	$.each(window.availableOfficeSpace, function (index, suite){
		if(suite.idtcompany != idtcompany)
			return;
		var key = suite.idtbuilding;
		if(typeof byBuilding[key] == "undefined")
		{
			byBuilding[key] = {
				idtbuilding: parseInt(suite.idtbuilding),
				count: 0,
				lat: parseFloat(suite.latitude),
				lon: parseFloat(suite.longitude),
				name: suite.sbuildingname,
				coords: suite.coords,
			};
		}
		if((byBuilding[key].coords == null || byBuilding[key].coords === "") && suite.coords)
			byBuilding[key].coords = suite.coords;
		byBuilding[key].count++;
	});

	var buildings = [];
	for(var k in byBuilding)
	{
		if(!byBuilding.hasOwnProperty(k))
			continue;
		var b = byBuilding[k];
		if(!isNaN(b.lat) && !isNaN(b.lon))
			buildings.push(b);
	}
	//Most available spaces first
	buildings.sort(function (a, b){ return b.count - a.count; });

	if(buildings.length == 0)
	{
		console.warn("startCompanyBuildingTour: no located buildings for company " + idtcompany);
		return;
	}

	window.companyBuildingTourActive = true;
	window.companyBuildingTourPaused = false;
	window.companyBuildingTourCompanyId = idtcompany;
	window.companyBuildingTourCurrentBuilding = null;
	window.companyBuildingTourPhase = null;

	//Bold this company's Properties value while its tour is running.
	if(typeof $ != "undefined")
	{
		$(".companyBuildingTourLink").removeClass("companyTourOn");
		$(".companyBuildingTourLink-" + idtcompany).addClass("companyTourOn");
	}

	//Any pointer press on the globe canvas ends the tour ("terminate on click of map"),
	//except while it's paused - then the user is free to look around.
	window.companyBuildingTourCancelHandler = function (){
		if(!window.companyBuildingTourPaused)
			stopCompanyBuildingTour();
	};
	viewer.canvas.addEventListener("pointerdown", window.companyBuildingTourCancelHandler);

	setCompanyTourIcon("images/pause-active.png");

	drawCompanyTourMarkers(buildings);

	console.log("startCompanyBuildingTour: " + buildings.length + " building(s) for company " + idtcompany + ".");

	var i = 0;
	function flyToNext()
	{
		if(!window.companyBuildingTourActive)
			return;
		deEmphasizeTourBuilding();
		if(i >= buildings.length)
		{
			stopCompanyBuildingTour();
			return;
		}
		var b = buildings[i++];
		//The building this leg is heading to - so a manual pause mid-flight can still
		//white-border it (see pauseCompanyBuildingTour()).
		window.companyBuildingTourCurrentBuilding = b;
		window.companyBuildingTourPhase = "flight";
		var groundAdjustment = companyTourGroundHeight();

		// Look at a point just above the building base, from a camera sitting a
		// little to the south and up - a gentle oblique view, not straight down.
		var lookAtPoint = Cesium.Cartesian3.fromDegrees(b.lon, b.lat, groundAdjustment + 25);
		var cameraDestination = Cesium.Cartesian3.fromDegrees(b.lon, b.lat - 0.0032, groundAdjustment + 430);
		var hpr = computeHeadingPitchLookingAt(cameraDestination, lookAtPoint);

		moveCameraTourStep(cameraDestination, hpr.heading, hpr.pitch, 0, function (){
			if(!window.companyBuildingTourActive)
				return;
			//Settled on the building: make it stand out, then hold before gliding on.
			window.companyBuildingTourPhase = "dwell";
			emphasizeTourBuilding(b);
			companyTourStartDwell(flyToNext);
		});
	}
	flyToNext();
}

// The city's ground-altitude adjustment (same offset the rest of the app's entities use),
// so labels/footprints sit on the terrain instead of at sea level.
function companyTourGroundHeight()
{
	if(typeof cityAltitudeAdjustment != "undefined" && cityAltitudeAdjustment != null && typeof lastCityLoaded != "undefined"
		&& !isNaN(parseFloat(cityAltitudeAdjustment[lastCityLoaded])))
		return parseFloat(cityAltitudeAdjustment[lastCityLoaded]);
	if(typeof cameraAltitudeAdjustment != "undefined" && cameraAltitudeAdjustment != null && !isNaN(parseFloat(cameraAltitudeAdjustment)))
		return parseFloat(cameraAltitudeAdjustment);
	return 0;
}

// Footprint polyline positions at a fixed absolute height - built the same way as
// CreateDashedLine() in buildingOrbitSpin.js: trim trailing separators, parse the
// "lon,lat,lon,lat,..." string, close the ring, then lift every vertex to `height`
// via fromDegreesArrayHeights so the line floats at a fixed altitude rather than
// draping onto the 3D tileset.
function companyTourFootprintPositions(coords, height)
{
	if(typeof coords != "string" || coords === "")
		return null;
	var footprint;
	try { footprint = JSON.parse("[" + coords.replace(/[\s,]+$/, "") + "]"); }
	catch(e) { return null; }
	if(!footprint || footprint.length < 6)
		return null;
	footprint.push(footprint[0]);
	footprint.push(footprint[1]);
	var pointsWithHeight = [];
	for(var i = 0; i < footprint.length - 1; i += 2)
		pointsWithHeight.push(footprint[i], footprint[i + 1], height);
	return Cesium.Cartesian3.fromDegreesArrayHeights(pointsWithHeight);
}

// A name label for every building in the portfolio (in the always-on-top LabelCollection),
// plus its dashed footprint outline when COMPANY_TOUR_DRAW_FOOTPRINT is on. Footprint entities
// are tracked in window.companyBuildingTourEntities; labels in window.companyTourLabelByBuilding.
function drawCompanyTourMarkers(buildings)
{
	var groundHeight = companyTourGroundHeight();
	var labels = companyTourEnsureLabelCollection();
	window.companyTourLabelByBuilding = {};

	for(var i = 0; i < buildings.length; i++)
	{
		var b = buildings[i];

		var lbl = labels.add({
			position: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, groundHeight + 60),
			text: b.name,
			font: COMPANY_TOUR_LABEL_FONT,
			showBackground: true,
			backgroundColor: Cesium.Color.BLACK.withAlpha(0.75),
			fillColor: Cesium.Color.WHITE,
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
		});
		window.companyTourLabelByBuilding[b.idtbuilding] = lbl;

		if(COMPANY_TOUR_DRAW_FOOTPRINT && b.coords)
		{
			var footprint = companyTourFootprintPositions(b.coords, groundHeight + 0.5);
			if(footprint)
			{
				var footprintEntity = viewer.entities.add({
					id: "companyTourFootprint_" + b.idtbuilding,
					polyline: {
						positions: footprint,
						width: COMPANY_TOUR_FOOTPRINT_WIDTH,
						//depthFailMaterial keeps the dashes visible where the tileset would occlude the
						//line - the LabelCollection above still renders on top of it.
						material: companyTourFootprintDashMaterial(),
						depthFailMaterial: companyTourFootprintDashMaterial(),
					},
				});
				window.companyBuildingTourEntities.push(footprintEntity);
			}
		}
	}
}

// Blow up the current building's label and turn its (already-drawn) dashed footprint solid,
// so it's obvious which one the camera has landed on / paused at - rather than drawing a
// second outline on top of it.
function emphasizeTourBuilding(b)
{
	deEmphasizeTourBuilding();
	if(typeof viewer == "undefined" || b == null)
		return;

	var lbl = window.companyTourLabelByBuilding[b.idtbuilding];
	if(lbl != null && typeof lbl != "undefined")
	{
		lbl.font = COMPANY_TOUR_LABEL_FONT_ACTIVE;
		window.companyBuildingTourActiveLabelObj = lbl;
	}

	var footprintId = "companyTourFootprint_" + b.idtbuilding;
	var footprintEnt = viewer.entities.getById(footprintId);
	if(typeof footprintEnt != "undefined" && footprintEnt != null && footprintEnt.polyline)
	{
		/*
		footprintEnt.polyline.width = COMPANY_TOUR_FOOTPRINT_WIDTH_ACTIVE;
		footprintEnt.polyline.material = Cesium.Color.WHITE;
		footprintEnt.polyline.depthFailMaterial = new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.6));
		*/
		window.companyBuildingTourActiveFootprintId = footprintId;
	}
}

function deEmphasizeTourBuilding()
{
	if(typeof viewer == "undefined")
		return;
	if(window.companyBuildingTourActiveLabelObj != null)
	{
		try { window.companyBuildingTourActiveLabelObj.font = COMPANY_TOUR_LABEL_FONT; } catch(e) {}
		window.companyBuildingTourActiveLabelObj = null;
	}
	if(window.companyBuildingTourActiveFootprintId != null)
	{
		var footprintEnt = viewer.entities.getById(window.companyBuildingTourActiveFootprintId);
		if(typeof footprintEnt != "undefined" && footprintEnt != null && footprintEnt.polyline)
		{
			footprintEnt.polyline.width = COMPANY_TOUR_FOOTPRINT_WIDTH;
			footprintEnt.polyline.material = companyTourFootprintDashMaterial();
		}
		window.companyBuildingTourActiveFootprintId = null;
	}
}

// Hold on a building for COMPANY_TOUR_DWELL_MS of un-paused time, then call next().
// Uses a polled timer (not a plain setTimeout) so a pause mid-dwell actually stops
// the clock instead of just deferring the same fixed delay.
function companyTourStartDwell(next)
{
	if(window.companyBuildingTourDwellTimer != null)
	{
		clearTimeout(window.companyBuildingTourDwellTimer);
		window.companyBuildingTourDwellTimer = null;
	}
	var remainingMs = COMPANY_TOUR_DWELL_MS;
	var lastMs = performance.now();
	function step()
	{
		window.companyBuildingTourDwellTimer = null;
		if(!window.companyBuildingTourActive)
			return;
		var now = performance.now();
		if(!window.companyBuildingTourPaused)
			remainingMs -= (now - lastMs);
		lastMs = now;
		if(remainingMs <= 0)
		{
			next();
			return;
		}
		window.companyBuildingTourDwellTimer = setTimeout(step, 60);
	}
	step();
}

function setCompanyTourIcon(src)
{
	var el = (typeof document != "undefined") ? document.getElementById("autoRotateZoom") : null;
	if(el != null)
		el.src = src;
}

// Single click on the Rotate button while a tour is running - pause/resume in place.
function pauseCompanyBuildingTour()
{
	if(!window.companyBuildingTourActive || window.companyBuildingTourPaused)
		return;
	window.companyBuildingTourPaused = true;
	//White-border whichever building the tour is on/heading to while paused.
	if(window.companyBuildingTourCurrentBuilding != null)
		emphasizeTourBuilding(window.companyBuildingTourCurrentBuilding);
	setCompanyTourIcon("images/play-button.png");
}

function resumeCompanyBuildingTour()
{
	if(!window.companyBuildingTourActive || !window.companyBuildingTourPaused)
		return;
	window.companyBuildingTourPaused = false;
	//Mid-flight the border is only a paused-state cue - drop it on resume; on a dwell
	//it belongs there anyway so leave it.
	if(window.companyBuildingTourPhase != "dwell")
		deEmphasizeTourBuilding();
	setCompanyTourIcon("images/pause-active.png");
}

function toggleCompanyBuildingTourPause()
{
	if(!window.companyBuildingTourActive)
		return;
	if(window.companyBuildingTourPaused)
		resumeCompanyBuildingTour();
	else
		pauseCompanyBuildingTour();
}

function stopCompanyBuildingTour()
{
	var tourCompanyId = window.companyBuildingTourCompanyId;
	window.companyBuildingTourActive = false;
	window.companyBuildingTourPaused = false;
	window.companyBuildingTourCompanyId = null;
	window.companyBuildingTourCurrentBuilding = null;
	window.companyBuildingTourPhase = null;
	if(typeof $ != "undefined")
		$(".companyBuildingTourLink").removeClass("companyTourOn");//back to normal weight
	if(window.companyBuildingTourDwellTimer != null)
	{
		clearTimeout(window.companyBuildingTourDwellTimer);
		window.companyBuildingTourDwellTimer = null;
	}
	if(window.companyBuildingTourUnsub != null)
	{
		window.companyBuildingTourUnsub();
		window.companyBuildingTourUnsub = null;
	}
	if(window.companyBuildingTourCancelHandler != null && typeof viewer != "undefined")
	{
		viewer.canvas.removeEventListener("pointerdown", window.companyBuildingTourCancelHandler);
		window.companyBuildingTourCancelHandler = null;
	}
	deEmphasizeTourBuilding();
	if(typeof viewer != "undefined")
	{
		for(var i = 0; i < window.companyBuildingTourEntities.length; i++)
			viewer.entities.remove(window.companyBuildingTourEntities[i]);
	}
	window.companyBuildingTourEntities = [];
	if(window.companyTourLabelCollection != null)
		window.companyTourLabelCollection.removeAll();
	window.companyTourLabelByBuilding = {};
	window.companyBuildingTourActiveLabelObj = null;
	setCompanyTourIcon("images/360.png");

	// If starting the tour switched the company filter on, switch it back off now - that
	// also clears the company logo (.company-logo-image). A filter the user turned on
	// themselves before the tour is left as it was.
	if(window.companyBuildingTourAppliedFilter && typeof filterAOSWithListingCompany == "function"
		&& typeof filterWithListingCompanyActive != "undefined" && filterWithListingCompanyActive
		&& typeof listingCompanyFiltered != "undefined" && listingCompanyFiltered == tourCompanyId)
	{
		filterAOSWithListingCompany(listingCompanyFiltered);
	}
	window.companyBuildingTourAppliedFilter = false;
}

// While a Properties tour is running, "+" doubles the glide speed and "-" halves it - the
// same speed-adjust feel as Market Orbit (see marketOrbit.js). Changes COMPANY_TOUR_SPEED,
// which moveCameraTourStep() now reads fresh on every tick (not just once per leg), so a
// change lands immediately mid-flight instead of waiting for the next leg to start.
document.addEventListener("keydown", function (e) {
	var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
	if (targetTag == "input" || targetTag == "textarea" || (e.target && e.target.isContentEditable))
		return;
	if (!window.companyBuildingTourActive)
		return;
	if (e.key === "+" || e.key === "=" || e.key === "Add") {
		COMPANY_TOUR_SPEED = Math.min(COMPANY_TOUR_SPEED * 2, 2000);
		console.log("Properties tour speed: " + COMPANY_TOUR_SPEED + " m/s");
	} else if (e.key === "-" || e.key === "_" || e.key === "Subtract") {
		COMPANY_TOUR_SPEED = Math.max(COMPANY_TOUR_SPEED / 2, 10);
		console.log("Properties tour speed: " + COMPANY_TOUR_SPEED + " m/s");
	}
});

// One leg of the tour, gliding at COMPANY_TOUR_SPEED (metres/second) - same lerp-position-and-
// orientation approach as marketOrbit.js moveCameraAtConstantSpeed(), but progress is tracked as
// distance actually covered (speed * elapsed, summed per tick) rather than a fixed duration
// computed once up front. That's what lets the "+"/"-" speed keys take effect immediately mid-
// flight - each tick reads whatever COMPANY_TOUR_SPEED is right now - and a pause genuinely
// freezes the leg where it is, with resume carrying on from that exact point.
function moveCameraTourStep(destination, heading, pitch, roll, onComplete)
{
	var cam = viewer.camera;
	var startPosition = Cesium.Cartesian3.clone(cam.position);
	var startHeading = cam.heading;
	var startPitch = cam.pitch;
	var startRoll = cam.roll;

	var distance = Cesium.Cartesian3.distance(startPosition, destination);

	var lastTickMs = performance.now();
	var distanceTraveled = 0;
	var currentPosition = new Cesium.Cartesian3();

	var unsub = viewer.clock.onTick.addEventListener(function (){
		if(!window.companyBuildingTourActive)
		{
			unsub();
			return;
		}
		var now = performance.now();
		if(window.companyBuildingTourPaused)
		{
			lastTickMs = now;//freeze - don't accrue progress while paused
			return;
		}
		var dtSeconds = (now - lastTickMs) / 1000;
		lastTickMs = now;
		distanceTraveled += COMPANY_TOUR_SPEED * dtSeconds;//COMPANY_TOUR_SPEED read fresh every tick

		var t = (distance <= 0) ? 1.0 : Math.min(distanceTraveled / distance, 1.0);
		Cesium.Cartesian3.lerp(startPosition, destination, t, currentPosition);
		cam.setView({
			destination: currentPosition,
			orientation: {
				heading: lerpAngle(startHeading, heading, t),
				pitch: lerpAngle(startPitch, pitch, t),
				roll: lerpAngle(startRoll, roll, t),
			},
		});
		if(t >= 1.0)
		{
			unsub();
			if(window.companyBuildingTourUnsub === unsub)
				window.companyBuildingTourUnsub = null;
			if(typeof onComplete == "function")
				onComplete();
		}
	});
	window.companyBuildingTourUnsub = unsub;
}
