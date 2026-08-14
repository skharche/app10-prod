
//CameraRotation2(-114.07826000000003, 51.044309999999996, altitude) {
//CameraRotation2(getCameraValues().longitude, getCameraValues().latitude, getCameraValues().altitude)
function CameraRotation2(longitude, latitude, altitude) {
	
	var latLonObj = calculateCentroid();
	
	console.log("CameraRotation2() "+longitude+","+latitude+" @"+altitude);
	//altitude = getCameraValues().altitude;
	altitude = (parseFloat(window.lastCameraAltitude) + cameraAltitudeAdjustment);
	console.log("Altitude Correction  "+altitude);
	
  currentPosition = Cesium.Cartesian3.fromDegrees(
    parseFloat(latLonObj.lon),
    parseFloat(latLonObj.lat),
    parseFloat(altitude)
  );
  var camera = viewer.scene.camera;
  $("#rotate2").css("display", "flex");
  var pitch = viewer.camera.pitch;
  heading = camera.heading;
  unsubscribeR2 = viewer.clock.onTick.addEventListener(() => {
	  /*
    viewer.screenSpaceEventHandler.setInputAction(function (amount) {
      amount =
        (Cesium.Math.sign(amount) *
          viewer.scene.camera.positionCartographic.height) /
        Math.log(viewer.scene.camera.positionCartographic.height);
		console.log("unsubscribeR2 => Amount "+amount);
      viewer.scene.camera.zoomIn(amount);
      //viewer.scene.camera.zoomOut(amount);
      pitch = viewer.camera.pitch;
      heading = camera.heading;
    }, Cesium.ScreenSpaceEventType.WHEEL);
	  */
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);

    const SMOOTHNESS = 1450; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
  });
}
function stopCameraRotation2() {
  unsubscribeR2();
  $("#rotate2").css("display", "none");
  IsStartRotation2 = false;
  viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

//FOG Fade out effect
function EnableFogInSelectedCity() {
	console.log("in EnableFogInSelectedCity()");
  EnableFogProcess(200);
  setTimeout(FogFadeInOut, 5000, 150000000);
}
function EnableFogProcess(range) {
  viewer.scene.postProcessStages.removeAll();
  const fragmentShaderSource = `
  float getDistance(sampler2D depthTexture, vec2 texCoords) 
  { 
      float depth = czm_unpackDepth(texture(depthTexture, texCoords)); 
      if (depth == 0.0) { 
          return czm_infinity; 
      } 
      vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth); 
      return -eyeCoordinate.z / eyeCoordinate.w; 
  } 
  float interpolateByDistance(vec4 nearFarScalar, float distance) 
  { 
      float startDistance = nearFarScalar.x; 
      float startValue = nearFarScalar.y; 
      float endDistance = nearFarScalar.z; 
      float endValue = nearFarScalar.w; 
      float t = clamp((distance - startDistance) / (endDistance - startDistance), 0.0, 1.0); 
      return mix(startValue, endValue, t); 
  } 
  vec4 alphaBlend(vec4 sourceColor, vec4 destinationColor) 
  { 
      return sourceColor * vec4(sourceColor.aaa, 1.0) + destinationColor * (1.0 - sourceColor.a); 
  } 
  uniform sampler2D colorTexture; 
  uniform sampler2D depthTexture; 
  uniform vec4 fogByDistance; 
  uniform vec4 fogColor; 
  in vec2 v_textureCoordinates; 
  void main(void) 
  { 
      float distance = getDistance(depthTexture, v_textureCoordinates); 
      vec4 sceneColor = texture(colorTexture, v_textureCoordinates); 
      float blendAmount = interpolateByDistance(fogByDistance, distance); 
      vec4 finalFogColor = vec4(fogColor.rgb, fogColor.a * blendAmount); 
      out_FragColor = alphaBlend(finalFogColor, sceneColor); 
  }
  `;

  const ellipsoid = viewer.scene.globe.ellipsoid;
  const postProcessStage = viewer.scene.postProcessStages.add(
    new Cesium.PostProcessStage({
      fragmentShader: fragmentShaderSource,
      uniforms: {
        fogByDistance: new Cesium.Cartesian4(10, 0.0, range, 1.0),
        fogColor: Cesium.Color.WHITE,
      },
    })
  );
}
function FogFadeInOut(range) {
	console.log("In FogFadeInOut();");
  var initailFadeRange = 200;
  EnableFogProcess(initailFadeRange);
  unsubscribe = viewer.clock.onTick.addEventListener(() => {
    if (initailFadeRange > 5000) {
      if (initailFadeRange > 10000) {
        if (initailFadeRange > 25000) {
          if (initailFadeRange > 50000) {
            if (initailFadeRange > 150000) {
              if (initailFadeRange > 300000) {
                if (initailFadeRange > 500000) {
                  initailFadeRange += 1000000;
                } else {
                  initailFadeRange += 100000;
                }
              } else {
                initailFadeRange += 50000;
              }
            } else {
              initailFadeRange += 20000;
            }
          } else {
            initailFadeRange += 4000;
          }
        } else {
          initailFadeRange += 800;
        }
      } else {
        initailFadeRange += 80;
      }
    } else {
      initailFadeRange += 40;
    }
    if (initailFadeRange < range) {
      EnableFogProcess(initailFadeRange);
    } else {
      unsubscribe();
      viewer.scene.postProcessStages.removeAll();
      viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  });
}


function calculateCentroid(coords = "") {
    let totalLon = 0;
    let totalLat = 0;
    let coordsLength = 0;
	var arr = [];
	if(coords == "")
		arr = TempBldgData[parseInt(devSelectedBuilding)].coords.split(",");
	else
		arr = coords.split(",");

	arr.forEach((value, index) => {
		if(!isNaN(value) && value != "")
		{
			//console.log(value+" <> "+index);
			if (index % 2 === 0) {
				totalLon += parseFloat(value);
				coordsLength++;
			} else {
				totalLat += parseFloat(value);
			}
		}
    });

    var centroidLat = totalLat / coordsLength;
    var centroidLon = totalLon / coordsLength;

    return {
        lat: centroidLat,
        lon: centroidLon
    };
}

function getAllPoints(coords = "") {
	var arr = [];
	if(coords == "")
		arr = TempBldgData[parseInt(devSelectedBuilding)].coords.split(",");
	else
		arr = coords.split(",");

	var allPoints = [];
	for(var i = 0; i < arr.length; i++)
	{
		if(typeof arr[i+1] != "undefined")
			allPoints.push([parseFloat(arr[i]), parseFloat(arr[i+1])]);
		i++;
	}
	
	//Go for ExplCoords
	/*
	var finalPoints = [];
	for(var i = 1; i< allPoints.length; i++)
	{
		
	}
	*/
	return allPoints;
}

// Function to calculate the distance (in meters) between two points using Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the Earth in meters
  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to interpolate points between two coordinates
function generateIntermediatePoints(lat1, lon1, lat2, lon2, interval = 1) {
  const distance = haversineDistance(lat1, lon1, lat2, lon2);

  // Return the original points if distance is <= 10 meters
  if (distance <= 10) return [[lat1, lon1], [lat2, lon2]];

  const numPoints = Math.ceil(distance / interval) - 1; // Number of intermediate points
  const points = [[lat1, lon1]]; // Start with the first point

  for (let i = 1; i <= numPoints; i++) {
    const fraction = i / (numPoints + 1);
    const interpolatedLat = lat1 + fraction * (lat2 - lat1);
    const interpolatedLon = lon1 + fraction * (lon2 - lon1);
    points.push([interpolatedLat, interpolatedLon]);
  }

  points.push([lat2, lon2]); // Add the final point
  return points;
}


let activeRotation = null; // so a new call cancels any in-progress rotation

/**
 * Smoothly orbit the camera 180° around a geographic point, then stop.
 * Starts from the camera's current heading/pitch/distance relative to the point.
 *
 * @param {number} longitude  Longitude in degrees
 * @param {number} latitude   Latitude in degrees
 * @param {object} [options]
 * @param {number} [options.degrees=180]  How far to rotate
 * @param {number} [options.duration=4]   Duration in seconds
 * @param {number} [options.height=0]     Height (m) of the orbit center
 * @param {boolean} [options.clockwise=true]  Direction of rotation
 */
function rotateAroundPoint(longitude, latitude, options = {}) {
    const {
        degrees = 180,
        duration = 4.0,
        height = 0,
        clockwise = true,
    } = options;

    const camera = viewer.camera;
    const center = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

    // Lock to the center's ENU frame to read the CURRENT orbit parameters.
    camera.lookAtTransform(transform);
    const startHeading = camera.heading;
    const pitch = camera.pitch;
    const range = Cesium.Cartesian3.magnitude(camera.position); // distance to center
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY); // release until per-frame relock

    const totalRotation =
        Cesium.Math.toRadians(degrees) * (clockwise ? 1 : -1);
    const startTime = performance.now();

    // Smooth ease-in / ease-out so it accelerates and decelerates.
    const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Cancel any rotation already running before starting a new one.
    if (activeRotation) activeRotation();

    function onPreRender() {
        const elapsed = (performance.now() - startTime) / 1000;
        let t = duration > 0 ? elapsed / duration : 1;
        if (t > 1) t = 1;

        const heading = startHeading + totalRotation * easeInOutCubic(t);

        camera.lookAtTransform(
            transform,
            new Cesium.HeadingPitchRange(heading, pitch, range)
        );

        if (t >= 1) {
            finish();
        }
    }

    function finish() {
        // Release the camera from the orbit frame so the user regains control.
        camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        viewer.scene.preRender.removeEventListener(onPreRender);
        activeRotation = null;
    }

    viewer.scene.preRender.addEventListener(onPreRender);
    activeRotation = finish; // expose a canceller
}

// Tolerance thresholds for camera position comparison
const CAMERA_TOLERANCE = {
    latitude: 0.0001,      // ~11 meters
    longitude: 0.0001,     // ~11 meters  
    altitude: 10           // 10 meters
};

/**
 * Get current camera position in lat/lon/altitude
 */
function getCurrentCameraPosition() {
    const cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.position);
    return {
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        altitude: cartographic.height
    };
}
 
let camera180InProgress = false;
function start180CameraRotation()
{
	if(camera180InProgress)
	{
		stop180CameraRotation();
		return;
	}
	//console.log("Before Alt "+getCameraValues().altitude+" & "+buildingCameraAltitudeValue);
	var time = 4000;
	if(typeof buildingCameraDataLogged[devSelectedBuilding] != "undefined")
	{
		if(isCameraAtPosition(parseFloat(buildingCameraDataLogged[devSelectedBuilding].latitude), parseFloat(buildingCameraDataLogged[devSelectedBuilding].longitude), parseFloat(buildingCameraDataLogged[devSelectedBuilding].altitude)+parseFloat(cameraAltitudeAdjustment)))
		{
			console.log("Camera already at target position - starting rotation immediately");
			time = 0;
		}
		else
		{
			flyToCameraView(buildingCameraDataLogged[devSelectedBuilding].latitude, buildingCameraDataLogged[devSelectedBuilding].longitude, buildingCameraDataLogged[devSelectedBuilding].altitude, buildingCameraDataLogged[devSelectedBuilding].heading, buildingCameraDataLogged[devSelectedBuilding].pitch, buildingCameraDataLogged[devSelectedBuilding].roll, 4);
		}
	}
	else
	{
		flyToBuildingCamera(devSelectedBuilding);
	}
	console.log("time: "+time);
	setTimeout(function () {
		if(TempBldgData[devSelectedBuilding].latitude == null || TempBldgData[devSelectedBuilding].longitude == null)
		{
			var t = TempBldgData[devSelectedBuilding].coords.split(",");
			CameraRotationAroundPoint180(t[1], t[0], Cesium.Cartographic.fromCartesian(viewer.camera.position).height);//getCameraValues().altitude);
		}
		else
		{
			//console.log("After Alt "+getCameraValues().altitude+"& "+buildingCameraAltitudeValue);
			CameraRotationAroundPoint180(SelectedBuildingLat, SelectedBuildingLon, clickedAltitude);//, getCameraValues().altitude);
		}
	}, time);
}

let forceStop180CameraRotation = false;
function stop180CameraRotation()
{
	forceStop180CameraRotation = true;
}

function CameraRotationAroundPoint180(latitude, longitude, height) {

	camera180InProgress = true;
	$("#rotateCamera180ImgContainer").attr("src", "images/pause-active.png");
  currentPosition = Cesium.Cartesian3.fromDegrees(
    parseFloat(longitude),
    parseFloat(latitude),
    parseFloat(height)
  );
  
  var pitch = viewer.camera.pitch;
  var heading = viewer.camera.heading;
  var startingHeading = heading;
  var totalRotation = 0;
  
  let unsubscribe180Rotation = viewer.clock.onTick.addEventListener(() => {
    // ADDED: check if 180 degrees (Math.PI) completed
	console.log(totalRotation);
    if (totalRotation >= Math.PI || forceStop180CameraRotation) {
		camera180InProgress = false;
		viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      unsubscribe180Rotation(); // stop the rotation
	  $("#rotateCamera180ImgContainer").attr("src", "images/redo-24.png");
	  forceStop180CameraRotation = false;
      return;
    }
	
	/*
    viewer.screenSpaceEventHandler.setInputAction(function (amount) {
      amount =
        (Cesium.Math.sign(amount) *
          viewer.scene.camera.positionCartographic.height) /
        Math.log(viewer.scene.camera.positionCartographic.height);
      viewer.scene.camera.zoomIn(amount);
      pitch = viewer.camera.pitch;
      heading = viewer.camera.heading;
    }, Cesium.ScreenSpaceEventType.WHEEL);
	*/
    
    let rotation = -1; // counter-clockwise
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    var elevation = Cesium.Cartesian3.distance(currentPosition, viewer.camera.position);
    
    const SMOOTHNESS = 1400;
    var increment = (rotation * Math.PI) / SMOOTHNESS;
    
    totalRotation += Math.abs(increment);
    heading += increment;
    
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
  });
}


