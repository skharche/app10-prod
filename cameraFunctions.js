function getCameraValues() {
	if(typeof viewer == "undefined")
		return "";
  var camera = viewer.scene.camera;

  // Get the camera's position in Cartesian3

  var position = camera.position.clone();

  // Convert the position to latitude, longitude, and height

  var cartographicPosition = Cesium.Cartographic.fromCartesian(position);

  var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);

  var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);

  var height = cartographicPosition.height;

  // Get the heading, pitch, and roll in degrees

  var heading = Cesium.Math.toDegrees(camera.heading);

  var pitch = Cesium.Math.toDegrees(camera.pitch);

  var roll = Cesium.Math.toDegrees(camera.roll);

  // Log the captured values

  /*

		//console.log('Longitude:', longitude);

		//console.log('Latitude:', latitude);

		//console.log('Height:', height);

		//console.log('Heading:', heading);

		//console.log('Pitch:', pitch);

		//console.log('Roll:', roll);

		*/

  var tilt = pitch + 90;

  return {
    longitude: longitude,
    latitude: latitude,
    altitude: height,
    heading: heading,
    pitch: pitch,
    roll: roll,
    tilt: tilt,
  };
}

//var cameraAltitudeAdjustment = 1029;

function setCameraView(cameraView) {
  cameraView.altitude = Number(cameraView.altitude) + cameraAltitudeAdjustment;

  ////console.log(cameraView.longitude+", "+cameraView.latitude+" @"+cameraView.altitude);

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      cameraView.longitude,
      cameraView.latitude,
      cameraView.altitude
    ),

    orientation: {
      heading: Cesium.Math.toRadians(cameraView.heading),

      pitch: Cesium.Math.toRadians(cameraView.pitch),

      roll: Cesium.Math.toRadians(cameraView.roll),
    },
  });

  //console.log("Altitude Check after Camera set: ", getCameraValues().altitude);

  /*

		setTimeout(function (){

		viewer.camera.flyTo({

			destination: Cesium.Cartesian3.fromDegrees(cameraView.longitude, cameraView.latitude, cameraView.altitude),

		}) , 3 * 1000;});

		*/
}

window.expectedAltitude = null;

function setCameraViewV2(lat, lon, alt, heading, pitch, roll) {
	//triedAfterRetry = 0;
	//console.log("setCameraViewV2: #Altitude "+cameraAltitudeAdjustment+", ", lat, lon, alt, heading, pitch, roll);

	window.expectedAltitude = parseFloat(alt) + parseFloat(cameraAltitudeAdjustment);
	//console.log("expectedAltitude: "+expectedAltitude);
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      lon,
      lat,
      parseFloat(alt) + parseFloat(cameraAltitudeAdjustment)
    ),

    orientation: {
      heading: Cesium.Math.toRadians(heading),

      pitch: Cesium.Math.toRadians(pitch),

      roll: Cesium.Math.toRadians(roll),
    },
  });

  //console.log("Altitude Check after Camera set: ", getCameraValues().altitude);
  
  /*

		setTimeout(function (){

		viewer.camera.flyTo({

			destination: Cesium.Cartesian3.fromDegrees(cameraView.longitude, cameraView.latitude, cameraView.altitude),

		}) , 3 * 1000;});

		*/
}

window.lastCameraAltitude = null;

function flyToCameraView(lat, lon, alt, heading, pitch, roll, duration) {
  window.lastCameraAltitude = alt;
  window.expectedAltitude = parseFloat(alt) + parseFloat(cameraAltitudeAdjustment);
  var coords = Cesium.Cartesian3.fromDegrees(
    lon,
    lat,
    parseFloat(alt) + parseFloat(cameraAltitudeAdjustment),
    Cesium.Ellipsoid.WGS84
  );
  var heading = Cesium.Math.toRadians(heading);
  var pitch = Cesium.Math.toRadians(pitch);
  camera_v = viewer.scene.camera;

  var options = {
    destination: coords,
    duration: duration,
    orientation: {
      heading: heading,
      pitch: pitch,
      roll: 0.0,
    },
  };
  camera_v.flyTo(options);
  //console.log("Altitude Check after Camera set: ", getCameraValues().altitude);
}
async function flyToCameraViewV2(
  lat,
  lon,
  alt,
  heading,
  pitch,
  roll,
  duration
) {
  viewer.entities.removeById("tempMarkerPin");
  var latLonObj = await calculateCentroid();
  window.lastCameraAltitude = alt;
  var entity = viewer.entities.add({
    name: "tempMarkerPin",
    position: new Cesium.Cartesian3.fromDegrees(
      parseFloat(latLonObj.lon),
      parseFloat(latLonObj.lat),
      parseFloat(alt) + parseFloat(cameraAltitudeAdjustment),
      Cesium.Ellipsoid.WGS84
    ),
    point: {
      pixelSize: 10,
      color: Cesium.Color.TRANSPARENT,
    },
  });
  var heading = Cesium.Math.toRadians(heading);
  var pitch = Cesium.Math.toRadians(pitch);
  camera_v = viewer.scene.camera;

  var options = {
    offset: new Cesium.HeadingPitchRange(heading, pitch, 150),
  };
  viewer.flyTo(entity, options);
  //console.log("Altitude Check after Camera set: ", getCameraValues().altitude);
}

window.triedAfterRetry = 0;
function flyToDefaultCameraWithDelay()
{
	if(typeof defaultCamera != "undefined" && typeof defaultCamera[0] != "undefined")
	{
		viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
		console.log("enable Collision False");
		setTimeout(() => {
			console.log("enable Collision True");
			viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
		}, 5000);
		
		console.log("Flying to Default Camera", defaultCamera);
		flyToCameraView(defaultCamera[0], defaultCamera[1], defaultCamera[2], defaultCamera[3], defaultCamera[4], defaultCamera[5], 0);
		setTimeout(function (){
			console.log("Delayed Default Camera: ", defaultCamera);
			if(typeof defaultCamera != "undefined" && typeof defaultCamera[0] != "undefined")
				flyToCameraView(defaultCamera[0], defaultCamera[1], defaultCamera[2], defaultCamera[3], defaultCamera[4], defaultCamera[5], 1);
			setTimeout(function (){
				console.log("Delayed Default Camera: ", defaultCamera);
				if(typeof defaultCamera != "undefined" && typeof defaultCamera[0] != "undefined")
					flyToCameraView(defaultCamera[0], defaultCamera[1], defaultCamera[2], defaultCamera[3], defaultCamera[4], defaultCamera[5], 1);
				setTimeout(function (){
					defaultCamera = [];
				}, 1000);			
			}, 1000);
		}, 1000);
	}
	else
	{
		console.log("no default camera available");
		//flyToCitySkyline(lastCityLoaded);
	}
	
}
function cameraAltitudeLog()
{
	return;
	/*
	if(typeof cameraAltitudeAdjustment != "undefined")
		console.log("#"+cameraAltitudeAdjustment+", Altitude Log: ", getCameraValues().altitude);
	*/
	setTimeout(function (){ cameraAltitudeLog(); }, 300);
	
	if(window.expectedAltitude != null && parseInt(window.expectedAltitude) != parseInt(getCameraValues().altitude))
	{
		//console.log(triedAfterRetry+":> "+window.expectedAltitude+" != "+getCameraValues().altitude+" => Altitude Difference");
		triedAfterRetry++;
		if(triedAfterRetry <= 10)
		{
			//console.log(triedAfterRetry+" retries, Now Skyline Cam "+lastCityLoaded);
			//Go to Default Camera
			if(typeof defaultCamera != "undefined" && typeof defaultCamera[0] != "undefined")
			{
				flyToDefaultCameraWithDelay();
				triedAfterRetry = 11;
			}
			else
			{
				flyToCitySkyline(lastCityLoaded, 10);
			}
		}
	}
	else if(parseInt(window.expectedAltitude) == parseInt(getCameraValues().altitude))
	{
		//console.log(triedAfterRetry+":> Altitude Matched: "+window.expectedAltitude+" === "+getCameraValues().altitude+" => Altitude Difference");
		if(window.startCountingMatchedToo)
			triedAfterRetry++;
	}
}

cameraAltitudeLog();


