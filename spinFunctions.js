
//CameraRotation2(-114.07826000000003, 51.044309999999996, altitude) {
//CameraRotation2(getCameraValues().longitude, getCameraValues().latitude, getCameraValues().altitude)
function CameraRotation2(longitude, latitude, altitude) {
	
	var latLonObj = calculateCentroid();
	
	console.log("CameraRotation2() "+longitude+","+latitude+" @"+altitude);
	//altitude = getCameraValues().altitude;
	altitude = (parseFloat(window.lastCameraAltitude) + cameraAltitudeAdjustment);
	console.log("Altitude Correction  "+altitude);
	
  currentPosition = new Cesium.Cartesian3.fromDegrees(
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






