
window.oneMeterPoints = [];

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

/**
 * Calculate the intermediate points between two latitude-longitude pairs.
 * @param {number} lat1 - Latitude of the first point.
 * @param {number} lon1 - Longitude of the first point.
 * @param {number} lat2 - Latitude of the second point.
 * @param {number} lon2 - Longitude of the second point.
 * @param {number} spacing - Distance between each intermediate point in meters.
 * @returns {Array} - Array of intermediate points as [latitude, longitude].
 */
window.finalPoints = [];
function calculateIntermediatePoints(lon1, lat1, lon2, lat2, spacing) {
    const R = 6371000; // Radius of the Earth in meters

    // Convert latitudes and longitudes to radians
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const λ1 = toRadians(lon1);
    const λ2 = toRadians(lon2);

    // Calculate the great-circle distance between the points
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Determine the number of intermediate points
    const numPoints = Math.floor(distance / spacing);

    // Calculate intermediate points
    for (let i = 0; i <= numPoints; i++) {
        const fraction = i / numPoints;

        // Interpolate latitude and longitude
        const A = Math.sin((1 - fraction) * c) / Math.sin(c);
        const B = Math.sin(fraction * c) / Math.sin(c);

        const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
        const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
        const z = A * Math.sin(φ1) + B * Math.sin(φ2);

        const interpolatedLat = toDegrees(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)));
        const interpolatedLon = toDegrees(Math.atan2(y, x));
		if(!isNaN(interpolatedLon) && !isNaN(interpolatedLat))
		{
			window.finalPoints.push([interpolatedLon, interpolatedLat]);
		}
    }

    //return points;
}

function get1MeterPoints(points, spacing = 1.0)
{
	//debugger;
	window.oneMeterPoints = [];
	window.finalPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        calculateIntermediatePoints(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], spacing);
    }
	console.log("finalPoints: ");
	console.log(window.finalPoints);
    //return result;
}

function createPointsArray(inputString) {
    // Split the string into an array of numbers
    const coordinates = inputString.split(',').map(coord => parseFloat(coord.trim()));
    
    // Group the numbers into pairs of [longitude, latitude]
    const latLongArray = [];
    for (let i = 0; i < coordinates.length; i += 2) {
        latLongArray.push([coordinates[i], coordinates[i + 1]]);
    }

    return latLongArray;
}

window.panoSpinCentroid = [];
window.panoSpinHeight = 0;
window.isPanoSpinInProgress = false;
function prepareForPanoViewForFloor(idtbldg, floor, skipGranularPoints = false, justOnce = false)
{
	index = 0;
	if(typeof window.availableOfficeSpaceFloorWise[idtbldg] != "undefined")
	{
		coords = availableOfficeSpaceFloorWise[idtbldg][floor][0].coords;
		var coordsArray = createPointsArray(coords);
		window.panoSpinCentroid = getCentroid(eval("["+coords+"]"));
		console.log(coordsArray);
		get1MeterPoints(coordsArray, 5);
		if(skipGranularPoints)
		{
			window.finalPoints = coordsArray;
		}
		if(justOnce)
		{
			//Enable < > arrows for Moving points
			$(".full-screen-arrow").show();
		}
		window.panoSpinHeight = parseInt(parseFloat(availableOfficeSpaceFloorWise[idtbldg][floor][0].floor_height) * parseInt(floor)) + parseInt(cameraAltitudeAdjustment);
	}
	else if(typeof window.floorPlanDetails[idtbldg] == "undefined")
	{
		var coordsArray = createPointsArray(window.TempBldgData[idtbldg].coords);
		window.panoSpinCentroid = getCentroid(eval("["+window.TempBldgData[idtbldg].coords+"]"));
		console.log(coordsArray);
		get1MeterPoints(coordsArray, 5);
		if(skipGranularPoints)
		{
			window.finalPoints = coordsArray;
		}
		if(justOnce)
		{
			//Enable < > arrows for Moving points
			$(".full-screen-arrow").show();
		}
	}
	else
	{
		var details = window.floorPlanDetails[idtbldg][floor];
		
		var floorHeight = 4;
		//TODO, needs a proper fix for Floor Plan Effect. Because we are drawing floors, but with other variables
		if(typeof window.cityBuildingDetails[parseInt(lastCityLoaded)] != "undefined" && typeof window.cityBuildingDetails[parseInt(lastCityLoaded)][idtbldg].altitude != "undefined")
		{
			floorHeight = parseInt(window.cityBuildingDetails[parseInt(lastCityLoaded)][idtbldg].altitude / window.cityBuildingDetails[parseInt(lastCityLoaded)][idtbldg].floors);
			if(floorHeight < 2 || floorHeight > 8)
				floorHeight = 4;
		}
		
		window.panoSpinHeight = (floorHeight * parseInt(floor)) + window.cameraAltitudeAdjustment;
		
		var coordsArray = createPointsArray(details[0].coords);
		window.panoSpinCentroid = getCentroid(eval("["+details[0].coords+"]"));
		console.log(coordsArray);
		get1MeterPoints(coordsArray, 5);
		if(skipGranularPoints)
		{
			window.finalPoints = coordsArray;
		}
		if(justOnce)
		{
			//Enable < > arrows for Moving points
			$(".full-screen-arrow").show();
		}
	}
	index = 0;
	window.isPanoSpinInProgress = true;
	//animateFloorViewCameraV2(justOnce);
	prepareHorizonCameraViewV2(window.finalPoints[index], window.panoSpinCentroid, window.panoSpinHeight);
}

function prepareForPanoViewForBuilding(idtbldg, skipGranularPoints = false)
{
	window.panoSpinHeight = parseInt(window.TempBldgData[idtbldg].altitude) + parseInt(cameraAltitudeAdjustment);
	var coordsArray = createPointsArray(window.TempBldgData[idtbldg].coords);
	window.panoSpinCentroid = getCentroid(eval("["+window.TempBldgData[idtbldg].coords+"]"));
	get1MeterPoints(coordsArray);
	if(skipGranularPoints)
	{
		window.finalPoints = coordsArray;
	}
	
	index = 0;
	window.isPanoSpinInProgress = true;
	animateFloorViewCameraV2();
}

function animateFloorViewCameraV2(justOnce = false) {
    if (index >= window.finalPoints.length) return; // Stop after all points

    prepareHorizonCameraViewV2(window.finalPoints[index], window.panoSpinCentroid, window.panoSpinHeight);
    index++;
	if(window.isPanoSpinInProgress && !justOnce)
	{
		setTimeout(animateFloorViewCameraV2, 4000); // Wait before moving to the next point
	}
}

function panoCameraMovement(step)
{
	clearSearchAndSettingBox();
	if(window.panoSpinCentroid.length == 0)
	{
		prepareForPanoViewForFloor(parseInt(devSelectedBuilding), parseInt(window.lastFloor), true, true);
		return;
	}
	index = index + step;
	if (index >= window.finalPoints.length){
		index = 0;
	}
	else if (index <= 0){
		index = (window.finalPoints.length - 1);
	}
	prepareHorizonCameraViewV2(window.finalPoints[index], window.panoSpinCentroid, window.panoSpinHeight);
}

function prepareHorizonCameraViewV2(pt1, pt2, ht)
{
	viewer.entities.removeById('cyl-clip');
	var cyl = viewer.entities.add({
		id : 'cyl-clip',
		position: Cesium.Cartesian3.fromDegrees(pt1[0], pt1[1], ht),
		cylinder : {
			length : ht,
			topRadius : 2.0,
			bottomRadius : 20.0,
			material : Cesium.Color.YELLOW
		},
		show:false
	});
	viewer.entities.removeById('spn-clip');
	var spn = viewer.entities.add({
		id : 'spn-clip',
		position: Cesium.Cartesian3.fromDegrees(pt2[0], pt2[1], ht),
		extrudedHeight:0,
		cylinder : {
			length : ht,
			topRadius : 2.0,
			bottomRadius : 20.0,
			material : Cesium.Color.GREEN
		},
		show:false
	});
	
	entityPosition = spn.position._value;//getValue(viewer.clock.currentTime);
	
	var targetPosition = cyl.position._value;//.getValue(viewer.clock.currentTime);
	
	//viewer.camera.position.x = entityPosition.x;
	//viewer.camera.position.y = entityPosition.y;
	//viewer.camera.position.z = entityPosition.z;
	// Look towards a target.
	var direction = Cesium.Cartesian3.subtract(targetPosition, entityPosition, new Cesium.Cartesian3());
	direction = Cesium.Cartesian3.normalize(direction, direction);
	//viewer.camera.direction = direction;
	
	// get an "approximate" up vector, which in this case we want to be something like the geodetic surface normal.
	// geocentric might be close enough, I dunno I'm a cat!
	var approxUp = Cesium.Cartesian3.normalize(entityPosition, new Cesium.Cartesian3());
	
	// cross viewdir with approxUp to get a right normal
	var right = Cesium.Cartesian3.cross(direction, approxUp, new Cesium.Cartesian3());
	right = Cesium.Cartesian3.normalize(right, right);
	//viewer.camera.right = right;

	// cross right with view dir to get an orthonormal up
	var up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
	up = Cesium.Cartesian3.normalize(up, up); // might not even be necessary, I dunno, I'm a cat!
	//viewer.camera.up = up;
	
	viewer.camera.flyTo({
		destination : targetPosition,
		orientation : {
			direction : direction,
			up : up
		},
		duration: 10,
		easingFunction: function (t) {
			// t goes from 0 → 1
			// Example: smoothstep curve
			return t * t * (3 - 2 * t);
		  }
	});
}


function prepareFloorPanoView(idtbldg, ht)
{
	if(window.start == null)
	{
		setClockTime();
	}
	index = 0;
	var details = window.floorPlanDetails[idtbldg][window.lastFloor];
	
	ht = ht + cameraAltitudeAdjustment;
	
	var coordsArray = createPointsArray(details[0].coords);
	console.log(coordsArray);
	get1MeterPoints(coordsArray, 5);
	var newSamplesProperty = new Cesium.SampledPositionProperty();
	var sampledAt = 0;
	$.each(window.finalPoints, function (index, row){
		var time = Cesium.JulianDate.addSeconds( start, sampledAt, new Cesium.JulianDate() );
		var position = Cesium.Cartesian3.fromDegrees( row[0], row[1], ht );
		newSamplesProperty.addSample(time, position);
		sampledAt = sampledAt + 2;
	});
	animateFloorViewCamera();
}

//var inputString = "-114.06814644399779, 51.045106301970215, -114.06810987578011, 51.04538327287468, -114.0682774057939, 51.045383517827744, -114.06827547274807, 51.04541360832404, -114.06845693085702, 51.04541714763882, -114.06843827167526, 51.04562048876178, -114.0689414790256, 51.04564337293016, -114.06895582762846, 51.04487166659877, -114.06830896299257, 51.04484221650436, -114.06828802115385, 51.04510448583827";
/*
var allPoints = get1MeterPoints(points, 1.0);
console.log(allPoints);
*/

//Spin Function
function executePanoView(eyePt, pt1, pt2, ht, sampledProperty = null)
{
	console.log("In Execute Pano View");
	console.log(eyePt, pt1, pt2, ht, sampledProperty);
	/*
	if(sampledProperty == null)
	{
		var property = new Cesium.SampledPositionProperty();
		var time = Cesium.JulianDate.addSeconds( start, 0, new Cesium.JulianDate() );
		var position = Cesium.Cartesian3.fromDegrees( pt1[0], pt1[1], ht );
		property.addSample(time, position);

		//Also create a point for each sample we generate.
		//viewer.entities.add({ position: position, point: { pixelSize: 8, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.YELLOW, outlineWidth: 3, }, });

		time = Cesium.JulianDate.addSeconds( start, 180, new Cesium.JulianDate() );
		position = Cesium.Cartesian3.fromDegrees( pt2[0], pt2[1], ht );
		property.addSample(time, position);
	}
	else
	{
	}
	*/
	var property = sampledProperty;//Sampled property is point collection
	pos = Cesium.Cartesian3.fromDegrees( eyePt[0], eyePt[1], ht);

	//Also create a point for each sample we generate.
	//viewer.entities.add({ position: position, point: { pixelSize: 8, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.YELLOW, outlineWidth: 3, }, });
	//Actually create the entity
	viewer.entities.removeById("spinPanoEntity");
	window.spEntity = viewer.entities.add({
	  id : 'spinPanoEntity',
	  //Set the entity availability to the same interval as the simulation time.
	  availability: new Cesium.TimeIntervalCollection([
		new Cesium.TimeInterval({
		  start: start,
		  stop: stop,
		}),
	  ]),
	  
	  show : true,//SK: NOT SHOWING THE PATH

	  //Use our computed positions
	  position: property,

	  //Automatically compute orientation based on position movement.
	  //orientation: new Cesium.VelocityOrientationProperty(pos),

	  //Load the Cesium plane model to represent the entity
	  /* model: {
		uri: "./Cesium_Air.glb",
		minimumPixelSize: 64,
	  }, */

	  //Show the path as a pink line sampled in 1 second increments.
	  path: {
		resolution: 1,
		material: new Cesium.PolylineGlowMaterialProperty({
		  glowPower: 0.1,
		  color: Cesium.Color.YELLOW,
		}),
		width: 10,
	  },
	});
	
	viewer.entities.removeById("cylPanoPoint");
	window.eyeEntity = viewer.entities.add({
		id : 'cylPanoPoint',
		position: Cesium.Cartesian3.fromDegrees(eyePt[0], eyePt[1], ht),
		cylinder : {
			length : 10.0,
			topRadius : 10.0,
			bottomRadius : 10.0,
			material : Cesium.Color.GREEN.withAlpha(0.5),
			outline : false,
			outlineColor : Cesium.Color.DARK_GREEN
		},
		show: true
	});
	
	console.log("eyeEntity");
	console.log(eyeEntity);
	
	window.panoViewEnabled = true;
}

function prepareHorizonCameraView(idtbldg, ht)
{
	var details = window.floorPlanDetails[idtbldg][window.lastFloor];
	var pts = eval("["+details[0].coords+"]");
	var pt1 = getCentroid(pts);
	var pt2 = [window.SelectedBuildingLon, window.SelectedBuildingLat];
	//var ht = ;//parseInt(window.TempBldgData[526].altitude) + cameraAltitudeAdjustment;
	ht = ht + cameraAltitudeAdjustment;
	viewer.entities.removeById('cyl-clip');
		var cyl = viewer.entities.add({
			id : 'cyl-clip',
			position: Cesium.Cartesian3.fromDegrees(pt1[0], pt1[1], ht),
			cylinder : {
				length : ht,
				topRadius : 2.0,
				bottomRadius : 20.0,
				material : Cesium.Color.YELLOW
			},
			show:true
		});
		viewer.entities.removeById('spn-clip');
		var spn = viewer.entities.add({
			id : 'spn-clip',
			position: Cesium.Cartesian3.fromDegrees(pt2[0], pt2[1], ht),
			extrudedHeight:0,
			cylinder : {
				length : ht,
				topRadius : 2.0,
				bottomRadius : 20.0,
				material : Cesium.Color.GREEN
			},
			show:true
		});
		
		entityPosition = spn.position.getValue(viewer.clock.currentTime);
		
		var targetPosition = cyl.position.getValue(viewer.clock.currentTime);
		
		//viewer.camera.position.x = entityPosition.x;
		//viewer.camera.position.y = entityPosition.y;
		//viewer.camera.position.z = entityPosition.z;
		// Look towards a target.
		var direction = Cesium.Cartesian3.subtract(targetPosition, entityPosition, new Cesium.Cartesian3());
		direction = Cesium.Cartesian3.normalize(direction, direction);
		//viewer.camera.direction = direction;
		
		// get an "approximate" up vector, which in this case we want to be something like the geodetic surface normal.
		// geocentric might be close enough, I dunno I'm a cat!
		var approxUp = Cesium.Cartesian3.normalize(entityPosition, new Cesium.Cartesian3());
		
		// cross viewdir with approxUp to get a right normal
		var right = Cesium.Cartesian3.cross(direction, approxUp, new Cesium.Cartesian3());
		right = Cesium.Cartesian3.normalize(right, right);
		//viewer.camera.right = right;

		// cross right with view dir to get an orthonormal up
		var up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
		up = Cesium.Cartesian3.normalize(up, up); // might not even be necessary, I dunno, I'm a cat!
		//viewer.camera.up = up;
		
		viewer.camera.flyTo({
			destination : entityPosition,
			orientation : {
				direction : direction,
				up : up
			},
			duration: window.cameraSpeedDuration
		});
}


function lookOutwardFromPointV3(pt, idtbldg, ht) {
	var details = window.floorPlanDetails[idtbldg][window.lastFloor];
	var pts = eval("["+details[0].coords+"]");
	var pt1 = getCentroid(pts);
	
	//ht = ht + cameraAltitudeAdjustment;
	
	var point = {"lon" : pt[0], "lat": pt[1]};
	var centroid = {"lon" : pt1[0], "lat": pt1[1]};
	
	lookOpposite(pt[0], pt[1], pt1[0], pt1[1], ht);
	
}
	
function lookOutwardFromPointV2(pt, idtbldg, ht) {
	var details = window.floorPlanDetails[idtbldg][window.lastFloor];
	var pts = eval("["+details[0].coords+"]");
	var pt1 = getCentroid(pts);
	
	//ht = ht + cameraAltitudeAdjustment;
	
	var point = {"lon" : pt[0], "lat": pt[1]};
	var centroid = {"lon" : pt1[0], "lat": pt1[1]};
	
	
	let dirLon = point.lon - centroid.lon;
    let dirLat = point.lat - centroid.lat;
    let dirHeight = point.height - centroid.height;

    // Compute a look-at position in the outward direction
    let lookAt = {
        lon: point.lon + dirLon * 0.8,
        lat: point.lat + dirLat * 0.8,
        height: point.height + dirHeight * 0.5 // Adjusting height smoothly
    };

    viewer.camera.flyTo({
        destination: toCartesian(point, ht),
        orientation: {
            direction: Cesium.Cartesian3.normalize(
                Cesium.Cartesian3.subtract(
                    toCartesian(lookAt, ht),
                    toCartesian(point, ht),
                    new Cesium.Cartesian3()
                ),
                new Cesium.Cartesian3()
            ),
            up: Cesium.Cartesian3.UNIT_Z
        },
        duration: 2
    });
}

function lookOutwardFromPoint(idtbldg, ht) {
	var details = window.floorPlanDetails[idtbldg][window.lastFloor];
	var pts = eval("["+details[0].coords+"]");
	var pt1 = getCentroid(pts);
	var pt2 = [window.SelectedBuildingLon, window.SelectedBuildingLat];
	var point = {"lon" : window.SelectedBuildingLon, "lat": window.SelectedBuildingLat};
	var centroid = {"lon" : pt1[0], "lat": pt1[1]};
	ht = ht + cameraAltitudeAdjustment;
	
	let dirLon = point.lon - centroid.lon;
    let dirLat = point.lat - centroid.lat;

    // Compute a look-at position in the outward direction
    let lookAt = {
        lon: point.lon + dirLon * 0.8,
        lat: point.lat + dirLat * 0.8
    };

    viewer.camera.flyTo({
        destination: toCartesian(point, ht),
        orientation: {
            direction: Cesium.Cartesian3.normalize(
                Cesium.Cartesian3.subtract(
                    toCartesian(lookAt, ht),
                    toCartesian(point, ht),
                    new Cesium.Cartesian3()
                ),
                new Cesium.Cartesian3()
            ),
            up: Cesium.Cartesian3.UNIT_Z
        },
        duration: 2
    });
	/*
    let dir = Cesium.Cartesian3.subtract(point, centroid, new Cesium.Cartesian3()); 
    Cesium.Cartesian3.normalize(dir, dir); // Normalize direction
    let lookAt = Cesium.Cartesian3.add(point, dir, new Cesium.Cartesian3()); // Look outward

    viewer.camera.flyTo({
        destination: point,
        orientation: {
            direction: Cesium.Cartesian3.subtract(lookAt, point, new Cesium.Cartesian3()),
            up: Cesium.Cartesian3.UNIT_Z
        },
        duration: 2
    });
	*/
}

let index = 0;
function animateFloorViewCamera() {
    if (index >= finalPoints.length) return; // Stop after all points

    lookOutwardFromPointV2(finalPoints[index], devSelectedBuilding, lastFloorLatitude);
    index++;
    setTimeout(animateFloorViewCamera, 3500); // Wait before moving to the next point
}


function toCartesian(coord, ht) {
    return Cesium.Cartesian3.fromDegrees(coord.lon, coord.lat, ht);
}

function getCentroid(coords)
{
	var allLat = 0;
	var allLon = 0;
	var cntr = 0;
	var alternate = true;
	$.each(coords, function (index, row){
		if(alternate)
		{
			cntr++;
			allLon = allLon + parseFloat(row);
		}
		else
			allLat = allLat + parseFloat(row);
		
		alternate = !alternate;
	});
	//console.log("in getCentroid");
	//console.log(coords.toString());
	//console.log((allLon/cntr)+", "+(allLat/cntr));
	return [parseFloat(allLon/cntr), parseFloat(allLat/cntr)]
}

window.start = null;
window.stop = null;
function setClockTime() {
	//return "";
	//window.start = Cesium.JulianDate.fromDate(new Date(new Date().setDate(new Date().getDate() - 0.5)));
	//window.start = Cesium.JulianDate.fromDate(new Date(new Date().setDate(new Date().getDate() - 180)));
	//window.currentTime = start.clone();//Cesium.JulianDate.fromDate(new Date(estTimezone.toString()));
	//window.stop = Cesium.JulianDate.addDays(start, 180, new Cesium.JulianDate());
	var d = new Date();
	window.start = Cesium.JulianDate.fromDate(new Date(2025, 1, 25, 10));
	window.stop = Cesium.JulianDate.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 16));
        /* window.stop = Cesium.JulianDate.addSeconds(
          window.start,
          3600,
          new Cesium.JulianDate()
        ); */
	//Make sure viewer is at the desired time.
	viewer.clock.startTime = start.clone();
	viewer.clock.stopTime = stop.clone();
	viewer.clock.currentTime = start.clone();
	viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
	viewer.clock.multiplier = 5;

	//Set timeline to simulation bounds
	//viewer.timeline.zoomTo(start, stop);
	
	//Changing To EST
	/* $('.cesium-timeline-ticLabel').each(function(i) {
		var str = $(this).html();
		$(this).html(str.replace("UTC", "EST"));
		console.log($(this).html());
	 }); */
	 
	 /* $('.cesium-animation-svgText').each(function(i) {
		var str = $(this).html();
		$(this).html(str.replace("UTC", "EST"));
		console.log($(this).html());
	 }); */
}


viewer.clock.onTick.addEventListener(function(clock) {
	//console.log("Clock Tick Events");
	if(window.panoViewEnabled == true && typeof window.eyeEntity != "undefined")
	{
		//return;
		//debugger;
		// Put the camera at the entity.
		//console.log(viewer.clock.currentTime);
		var ent = window.eyeEntity.position.getValue(viewer.clock.currentTime);
		//console.log("ent "+ent);
		/* if(typeof ent != "undefined")
		{
			console.log("eye entitiey undefined ");
			window.panoViewEnabled = false;
			return "";
		} */
		
		viewer.camera.position.x = ent.x;
		viewer.camera.position.y = ent.y;
		viewer.camera.position.z = ent.z;
		// Look towards a target.
		var targetP = window.spEntity.position.getValue(viewer.clock.currentTime);
		//console.log("targetP "+targetP);
		/* if(typeof targetP != "undefined")
		{
			console.log("target undefined ");
			window.panoViewEnabled = false;
			return "";
		} */
		if(typeof targetP == "undefined" )
		{
			window.panoViewEnabled = false;
			console.log("targetP.x is undefined");
			return "";
		}
		
		var direction = Cesium.Cartesian3.subtract(targetP, ent, new Cesium.Cartesian3());
		//console.log("direction "+direction);
		direction = Cesium.Cartesian3.normalize(direction, direction);
		viewer.camera.direction = direction;
		
		// get an "approximate" up vector, which in this case we want to be something like the geodetic surface normal.
		// geocentric might be close enough, I dunno I'm a cat!
		var approxUp = Cesium.Cartesian3.normalize(ent, new Cesium.Cartesian3());
		
		// cross viewdir with approxUp to get a right normal
		var right = Cesium.Cartesian3.cross(direction, approxUp, new Cesium.Cartesian3());
		right = Cesium.Cartesian3.normalize(right, right);
		viewer.camera.right = right;

		// cross right with view dir to get an orthonormal up
		var up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
		up = Cesium.Cartesian3.normalize(up, up); // might not even be necessary, I dunno, I'm a cat!
		viewer.camera.up = up;
		return "";
	}
});

//Fresh workflow
function computeBearing(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180;
    let φ1 = lat1 * rad, φ2 = lat2 * rad;
    let Δλ = (lon2 - lon1) * rad;

    let y = Math.sin(Δλ) * Math.cos(φ2);
    let x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // Convert to degrees (0-360)
}

function lookOpposite(lonA, latA, lonB, latB, ht) {
    let posA = Cesium.Cartesian3.fromDegrees(lonA, latA, ht);
    let posB = Cesium.Cartesian3.fromDegrees(lonB, latB, ht); // Camera at B

    // Compute direction vector (from B to A)
    let direction = Cesium.Cartesian3.subtract(posA, posB, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(direction, direction);

    // Reverse the direction (look opposite)
    Cesium.Cartesian3.negate(direction, direction);

    // Set up camera transform at B
    let transform = Cesium.Transforms.eastNorthUpToFixedFrame(posB);
    
    // Look in the opposite direction
    viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(direction.x * 1000, direction.y * 1000, direction.z * 1000));

    viewer.camera.lookAt(position, direction);
}

