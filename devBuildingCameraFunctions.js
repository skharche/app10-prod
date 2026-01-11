//App18 functions

function getHeading(pointA, pointB) {
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  const positionvector = Cesium.Cartesian3.subtract(
    pointB,
    pointA,
    new Cesium.Cartesian3()
  );
  const vector = Cesium.Matrix4.multiplyByPointAsVector(
    Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
    positionvector,
    new Cesium.Cartesian3()
  );
  const direction = Cesium.Cartesian3.normalize(
    vector,
    new Cesium.Cartesian3()
  );
  //heading
  const heading =
    Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
  //pitch
  const pitch = Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
  return Cesium.Math.toDegrees(
    Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  );
}

//Floor view related functions
async function FlyToFloorView() {
  RemoveEntityByName("FloorView");
  if (currentFloorCoord) {
    var centerLatLon = CartesianToLatlon(currentFloorCenter);
    var pointA = new Cesium.Cartesian3.fromDegrees(
      currentFloorCoord.lon,
      currentFloorCoord.lat,
      currentFloorHeight
    );
    var pointB = new Cesium.Cartesian3.fromDegrees(
      parseFloat(centerLatLon.lon),
      parseFloat(centerLatLon.lat),
      currentFloorHeight
    );
    var newPoint = await GenerateNewPoint(pointB, pointA);
    var cameraPoint = await CartesianToLatlon(newPoint);
    var curHeading = await getHeading(pointB, pointA);
    var entityH = viewer.entities.add({
      name: "FloorView",
      position: Cesium.Cartesian3.fromDegrees(
        parseFloat(cameraPoint.lon),
        parseFloat(cameraPoint.lat),
        currentFloorHeight
      ),
      point: {
        color: Cesium.Color.TRANSPARENT,
        pixelSize: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    var options = {
      maximumHeight: 30,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(curHeading),
        -0.2,
        0.1
      ),
    };
    viewer.flyTo(entityH, options);
  }
}

function GenerateNewPoint(p1, p2, extraDistance = 5) {
  // Direction vector p1 → p2
  const direction = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );

  // Distance between points
  const distance = Cesium.Cartesian3.distance(p1, p2);

  // Total extension distance
  const extension = distance + extraDistance;

  // Compute extended offset
  const offset = Cesium.Cartesian3.multiplyByScalar(
    direction,
    extension,
    new Cesium.Cartesian3()
  );

  // New point C = p1 + direction * extension
  const newPoint = Cesium.Cartesian3.add(p1, offset, new Cesium.Cartesian3());

  return newPoint;
}

function computeCentroidCartesian(positions) {
  let x = 0,
    y = 0,
    z = 0;

  positions.forEach((p) => {
    x += p.x;
    y += p.y;
    z += p.z;
  });

  const count = positions.length;
  return new Cesium.Cartesian3(x / count, y / count, z / count);
}

function getHeading(pointA, pointB) {
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
  const positionvector = Cesium.Cartesian3.subtract(
    pointB,
    pointA,
    new Cesium.Cartesian3()
  );
  const vector = Cesium.Matrix4.multiplyByPointAsVector(
    Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
    positionvector,
    new Cesium.Cartesian3()
  );
  const direction = Cesium.Cartesian3.normalize(
    vector,
    new Cesium.Cartesian3()
  );
  //heading
  const heading =
    Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
  //pitch
  const pitch = Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
  return Cesium.Math.toDegrees(
    Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
  );
}

function isClockwise(polygonPositions) {
  let sum = 0;
  for (let i = 0; i < polygonPositions.length; i++) {
    const lon1 = parseFloat(polygonPositions[i][0]);
    const lat1 = parseFloat(polygonPositions[i][1]);
    const lon2 = parseFloat(
      polygonPositions[(i + 1) % polygonPositions.length][0]
    );
    const lat2 = parseFloat(
      polygonPositions[(i + 1) % polygonPositions.length][1]
    );
    sum += (lon2 - lon1) * (lat2 + lat1);
  }
  return sum > 0; // true = clockwise
}


FloorViewautoSlowRotate = false;
TSEntity = undefined;
var timeStepInSeconds = 30;
var TravelSpeed = 1.25;
var timeStepInSeconds = 30;
var start = null;
var stop = null;
var IsPause = false;
var lookLeft = true;
var speed = 60;
var IsBuildingFlrChange = false;
var unsubscribeLoadSlowModelRotation = null;

async function ToggleFloorViewCameraSlowRotation() {
  if (FloorViewautoSlowRotate) {
    FloorViewautoSlowRotate = false;
    IsPause = true;
    FloorViewStopCameraSlowRotation();
  } else {
    FloorViewautoSlowRotate = true;
    FloorViewCameraSlowRotation();
  }
}

function FloorViewStopCameraSlowRotation() {
  FloorViewautoSlowRotate = false;
  viewer.clock.shouldAnimate = false;
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function FloorViewPauseSlowRotation() {
  if (FloorViewautoSlowRotate) {
    FloorViewautoSlowRotate = false;
    IsPause = true;
    FloorViewStopCameraSlowRotation();
  }
}

async function FloorViewCameraSlowRotation() {
  const temGArr = currentfloorCoordLL.split(",");
  var routePoints = [];
  for (var k = 0; k < temGArr.length; k = k + 2) {
    var TGeom = [];
    TGeom.push(temGArr[k]);
    TGeom.push(temGArr[k + 1]);
    TGeom.push(currentFloorHeight);
    routePoints.push(TGeom);
  }
  var TGeom = [];
  TGeom.push(temGArr[0]);
  TGeom.push(temGArr[1]);
  TGeom.push(currentFloorHeight);
  routePoints.push(TGeom);
  var centerLatLon = CartesianToLatlon(currentFloorCenter);
  currentPosition = Cesium.Cartesian3.fromDegrees(
    parseFloat(centerLatLon.lon),
    parseFloat(centerLatLon.lat),
    parseFloat(currentFloorHeight)
  );
  var pitch = viewer.camera.pitch;
  heading = camera.heading;
  if (isClockwise(routePoints)) {
    lookLeft = true;
  } else {
    lookLeft = false;
  }
  if (TSEntity != undefined) {
    if (IsBuildingFlrChange && !IsPause) {
      IsBuildingFlrChange = false;
      TravelSlowlyAlongToPath(routePoints);
    } else {
      IsPause = false;
      viewer.clock.shouldAnimate = true;
    }
  } else {
    TravelSlowlyAlongToPath(routePoints);
  }
}

function RemoveTEntity() {
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == "TEntity") {
      viewer.entities.remove(entity);
    }
  });
}
function RemoveTSEntity() {
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == "TSEntity") {
      viewer.entities.remove(entity);
    }
  });
}

async function ComputeSlowRoutePath(routeEntities) {
  var property = new Cesium.SampledPositionProperty();
  for (let i = 0; i < routeEntities.length; i++) {
    var time = Cesium.JulianDate.addSeconds(
      start,
      i * timeStepInSeconds,
      new Cesium.JulianDate()
    );
    var centerLatLon = CartesianToLatlon(currentFloorCenter);
    var pointB = new Cesium.Cartesian3.fromDegrees(
      parseFloat(centerLatLon.lon),
      parseFloat(centerLatLon.lat),
      currentFloorHeight
    );
    var pointA = Cesium.Cartesian3.fromDegrees(
      routeEntities[i][0],
      routeEntities[i][1],
      routeEntities[i][2]
    );
    var newPoint = await GenerateNewPoint(pointB, pointA, 2);
    var cameraPoint = await CartesianToLatlon(newPoint);
    var position = Cesium.Cartesian3.fromDegrees(
      cameraPoint.lon,
      cameraPoint.lat,
      currentFloorHeight
    );
    /*  var entity = viewer.entities.add({
      position: position,
      point: {
        pixelSize: 6,
        color: Cesium.Color.GREEN,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 2,
      },
    }); */
    //PathEntityList.push(entity);
    property.addSample(time, position);
  }
  return property;
}

function loadSlowModel(position) {
  viewer.clock.shouldAnimate = false;
  TSEntity = viewer.entities.add({
    id: "TSEntity",
    name: "TSEntity",
    //Set the entity availability to the same interval as the simulation time.
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: start,
        stop: stop,
      }),
    ]),

    //Use our computed positions
    position: position,

    //Automatically compute orientation based on position movement.
    orientation: new Cesium.VelocityOrientationProperty(position),
    /*  point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
    },
    path: {
      show: true,
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.YELLOW,
      }),
      width: 10,
    }, */
  });
  TSEntity.position.setInterpolationOptions({
    interpolationDegree: 2,
    interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
  });
  var CC3 = Cesium.Cartesian3;
  var position1 = TSEntity.position.getValue(start, new CC3());
  var position2 = TSEntity.position.getValue(
    Cesium.JulianDate.addSeconds(start, 1 / speed, new Cesium.JulianDate()),
    new CC3()
  );

  //velocity in terms of Earth Fixed
  if (position1 === undefined || position2 === undefined) {
    return;
  }
  var Wvelocity = CC3.subtract(position2, position1, new CC3());
  CC3.normalize(Wvelocity, Wvelocity);
  var Wup = new CC3();
  var Weast = new CC3();
  var Wnorth = new CC3();
  Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(position1, Wup);
  CC3.cross({ x: 0, y: 0, z: 1 }, Wup, Weast);
  CC3.cross(Wup, Weast, Wnorth);

  //velocity in terms of local ENU
  var Lvelocity = new CC3();
  Lvelocity.x = CC3.dot(Wvelocity, Weast);
  Lvelocity.y = CC3.dot(Wvelocity, Wnorth);
  Lvelocity.z = CC3.dot(Wvelocity, Wup);

  //angle of travel
  var Lup = new CC3(0, 0, 1);
  var Least = new CC3(1, 0, 0);
  var Lnorth = new CC3(0, 1, 0);
  var x = CC3.dot(Lvelocity, Least);
  var y = CC3.dot(Lvelocity, Lnorth);
  var z = CC3.dot(Lvelocity, Lup);
  var flrHeading = Math.atan2(x, y); //math: y b4 x, heading: x b4 y

  //angles offsets
  flrHeading += (0 / 180) * Math.PI;
  if (lookLeft) {
    flrHeading -= Cesium.Math.toRadians(90);
  } else {
    flrHeading += Cesium.Math.toRadians(90);
  }
  RemoveEntityByName("FloorView");
  var entityH = viewer.entities.add({
    name: "FloorView",
    position: position1,
    point: {
      color: Cesium.Color.TRANSPARENT,
      pixelSize: 1,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  var options = {
    maximumHeight: 30,
    offset: new Cesium.HeadingPitchRange(flrHeading, -0.2, 1),
  };
  viewer.flyTo(entityH, options);
  setTimeout(() => {
    viewer.clock.currentTime = start.clone();
    viewer.clock.shouldAnimate = true;
    unsubscribeLoadSlowModelRotation = viewer.clock.onTick.addEventListener(function (
      clock
    ) {
      var CC3 = Cesium.Cartesian3;
      var position1 = TSEntity.position.getValue(clock.currentTime, new CC3());
      var position2 = TSEntity.position.getValue(
        Cesium.JulianDate.addSeconds(
          clock.currentTime,
          1 / speed,
          new Cesium.JulianDate()
        ),
        new CC3()
      );

      //velocity in terms of Earth Fixed
      if (position1 === undefined || position2 === undefined) {
        return;
      }
      var Wvelocity = CC3.subtract(position2, position1, new CC3());
      CC3.normalize(Wvelocity, Wvelocity);
      var Wup = new CC3();
      var Weast = new CC3();
      var Wnorth = new CC3();
      Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(position1, Wup);
      CC3.cross({ x: 0, y: 0, z: 1 }, Wup, Weast);
      CC3.cross(Wup, Weast, Wnorth);

      //velocity in terms of local ENU
      var Lvelocity = new CC3();
      Lvelocity.x = CC3.dot(Wvelocity, Weast);
      Lvelocity.y = CC3.dot(Wvelocity, Wnorth);
      Lvelocity.z = CC3.dot(Wvelocity, Wup);

      //angle of travel
      var Lup = new CC3(0, 0, 1);
      var Least = new CC3(1, 0, 0);
      var Lnorth = new CC3(0, 1, 0);
      var x = CC3.dot(Lvelocity, Least);
      var y = CC3.dot(Lvelocity, Lnorth);
      var z = CC3.dot(Lvelocity, Lup);
      angle = Math.atan2(x, y); //math: y b4 x, heading: x b4 y
      var pitch = Math.asin(z); //make sure Lvelocity is unitized

      //angles offsets
      angle += (0 / 180) * Math.PI;
      if (lookLeft) {
        angle -= Cesium.Math.toRadians(90);
      } else {
        angle += Cesium.Math.toRadians(90);
      }
      //angle += Cesium.Math.toRadians(90);
      var offset = new Cesium.HeadingPitchRange(angle, -0.2, 1);
      if (!IsPause) {
        viewer.camera.lookAt(
          TSEntity.position.getValue(clock.currentTime),
          offset
        );
      }
    });
  }, 3100);

  viewer.trackedEntity = undefined;
}

async function TravelSlowlyAlongToPath(routePoints) {
  // Remove Entity
  RemoveTSEntity();
  start = Cesium.JulianDate.now();
  totalSeconds = timeStepInSeconds * (routePoints.length - 1);
  stop = Cesium.JulianDate.addSeconds(
    start,
    totalSeconds,
    new Cesium.JulianDate()
  );
  var position = await ComputeSlowRoutePath(routePoints);
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // stop at the end
  viewer.clock.multiplier = TravelSpeed;
  viewer.clock.shouldAnimate = true;
  //Set timeline to simulation bounds
  viewer.timeline.zoomTo(start, stop);

  //Actually create the entity
  loadSlowModel(position);
}




//New Clip functions, App15
var IsEnableClip = false;
var AllTileLoaded = false;
function ToggleClipSelectedBuildingApp15(id) {
  if (IsEnableClip)
  {
    $("#clip").css("font-weight", "normal");
    IsEnableClip = false;
	/*
    for (var item of highLightPolygons) {
      item.classificationType = Cesium.ClassificationType.CESIUM_3D_TILE;
    }
	*/
    globe.baseColor = Cesium.Color.TRANSPARENT;
    if (googleTileset.clippingPolygons != undefined) {
      googleTileset.clippingPolygons.removeAll();
      googleTileset.clippingPolygons = undefined;
    }
  }
  else
  {
	/*
    for (var item of highLightPolygons) {
      item.classificationType = Cesium.ClassificationType.BOTH;
    }
	*/
	currentBuildingwkt = TempBldgData[id].coords;
    EnableBuildingClipping();
    globe.baseColor = Cesium.Color.GRAY;
  }
}

//currentBuildingwkt = BldgFootprint;
async function EnableBuildingClipping() {
  if (AllTileLoaded) {
    $("#clip").css("font-weight", "bold");
    IsEnableClip = true;
    var BufferCoords = [];
    await GetTurfPolyGon(currentBuildingwkt);
    var buffered = turf.buffer(TurfPolygon, 5, {
      units: "meters",
      steps: 0,
    });
    for (var bItem of buffered.geometry.coordinates[0]) {
      BufferCoords.push(bItem[0]);
      BufferCoords.push(bItem[1]);
    }
    googleTileset.clippingPolygons = new Cesium.ClippingPolygonCollection({
      polygons: [
        new Cesium.ClippingPolygon({
          positions: new Cesium.Cartesian3.fromDegreesArray(BufferCoords),
        }),
      ],
    });
    googleTileset.clippingPolygons.inverse = true;
  } else {
    Toast.fire({
      icon: "warning",
      title: "Google Tileset is not loaded completely! Please wait.",
    });
  }
}

function GetTurfPolyGon(wkt) {
  var AreaPoints = wkt.split(",");
  var tempArr = [];
  var polygonGeom = [];
  for (var i = 0; i < AreaPoints.length - 1; i = i + 2) {
    tempArr.push([parseFloat(AreaPoints[i]), parseFloat(AreaPoints[i + 1])]);
  }
  tempArr.push(tempArr[0]);
  polygonGeom.push(tempArr);
  TurfPolygon = turf.polygon(polygonGeom);
}

currentBldgObject = {
	bldgId: null,
	flrNum: null,
	};
function computeCentroidCartesian(positions) {
  let x = 0,
    y = 0,
    z = 0;

  positions.forEach((p) => {
    x += p.x;
    y += p.y;
    z += p.z;
  });

  const count = positions.length;
  return new Cesium.Cartesian3(x / count, y / count, z / count);
}



