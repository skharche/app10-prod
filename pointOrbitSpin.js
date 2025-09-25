var IsEnableRotateAroundPoint = false;
var RotateAroundPointBtn = false;
var unsubscribeSPoint = null;
var pointSelected = null;
var SpeedForPointOrbit = 5250;
var CameraRotationSpeed = 4200;

function IsAnyActiveControl() {
  if (
    RotateAroundPointBtn == true
  ) {
    return true;
  } else {
    return false;
  }
}

async function FlyToPoint(latlonObj) {
  RemoveEntityByName("tempMarkerPin");
  entity = viewer.entities.add({
    name: "tempMarkerPin",
    position: new Cesium.Cartesian3.fromDegrees(
      parseFloat(latlonObj.lon),
      parseFloat(latlonObj.lat),
      parseFloat(latlonObj.height)
    ),
    point: {
      pixelSize: 1,
      color: Cesium.Color.TRANSPARENT,
    },
  });
  var options = {
    maximumHeight: -30,
    offset: new Cesium.HeadingPitchRange(
      viewer.camera.heading,
      -0.7853981633974483,
      120
    ),
  };
  viewer.flyTo(entity, options);
  setTimeout(CameraRotationAroundPoint, 3100, latlonObj);
}

function CameraRotationAroundPoint(latlonObj) {
  $("#speedWindowForPointOrbit").css("display", "block");
  $("#SRotate").attr("src", "./images/pause.svg");
  currentPosition = new Cesium.Cartesian3.fromDegrees(
    parseFloat(latlonObj.lon),
    parseFloat(latlonObj.lat),
    parseFloat(latlonObj.height)
  );
  var pitch = viewer.camera.pitch;
  var heading = camera.heading;
  unsubscribeSPoint = viewer.clock.onTick.addEventListener(() => {
    viewer.screenSpaceEventHandler.setInputAction(function (amount) {
      amount =
        (Cesium.Math.sign(amount) *
          viewer.scene.camera.positionCartographic.height) /
        Math.log(viewer.scene.camera.positionCartographic.height);
      viewer.scene.camera.zoomIn(amount);
      //viewer.scene.camera.zoomOut(amount);
      pitch = viewer.camera.pitch;
      heading = camera.heading;
    }, Cesium.ScreenSpaceEventType.WHEEL);
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);

    const SMOOTHNESS = SpeedForPointOrbit; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
  });
}
function RemoveEntityByName(entityName) {
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == entityName) {
      viewer.entities.remove(entity);
    }
  });
}


function ToggleRotateAroundPoint() {
  if (IsAnyActiveControl()) {
    IsEnableRotateAroundPoint = false;
    RotateAroundPointBtn = false;
    StopCameraRotationAroundPoint();
    $("#SRotate").attr("src", "./images/auto_rotate.svg");
    $("#speedWindowForPointOrbit").css("display", "none");
    return;
  }
  if (IsEnableRotateAroundPoint) {
    IsEnableRotateAroundPoint = false;
    RotateAroundPointBtn = false;
    StopCameraRotationAroundPoint();
    $("#SRotate").attr("src", "./images/auto_rotate.svg");
    $("#speedWindowForPointOrbit").css("display", "none");
  } else {
    IsEnableRotateAroundPoint = true;
    RotateAroundPointBtn = true;
    if (pointSelected != null) {
      CameraRotationAroundPoint(pointSelected);
    }
  }
}

function StopCameraRotationAroundPoint() {
  unsubscribeSPoint();
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function CameraRotationAroundPoint(latlonObj) {
	$('.dropdownCam').removeClass("active");

	$("#autoRotateZoom").attr("src", "images/pause-active.png");
	$("#speedWindowForPointOrbit").css("display", "block");
	$("#SRotate").attr("src", "./images/pause.svg");
  currentPosition = new Cesium.Cartesian3.fromDegrees(
    parseFloat(latlonObj.lon),
    parseFloat(latlonObj.lat),
    parseFloat(latlonObj.height)
  );
  var pitch = viewer.camera.pitch;
  var heading = camera.heading;
  unsubscribeSPoint = viewer.clock.onTick.addEventListener(() => {
    viewer.screenSpaceEventHandler.setInputAction(function (amount) {
      amount =
        (Cesium.Math.sign(amount) *
          viewer.scene.camera.positionCartographic.height) /
        Math.log(viewer.scene.camera.positionCartographic.height);
      viewer.scene.camera.zoomIn(amount);
      //viewer.scene.camera.zoomOut(amount);
      pitch = viewer.camera.pitch;
      heading = camera.heading;
    }, Cesium.ScreenSpaceEventType.WHEEL);
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);

    const SMOOTHNESS = SpeedForPointOrbit; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
  });
}

function IncreasePointOrbitSpeed() {
  if (SpeedForPointOrbit > 1200) {
    SpeedForPointOrbit -= 200;
  } else {
    SpeedForPointOrbit -= 100;
  }
}
function DecreasePointOrbitSpeed() {
  if (SpeedForPointOrbit > 1200) {
    SpeedForPointOrbit += 200;
  } else {
    SpeedForPointOrbit += 100;
  }
}
function ResetPointOrbitSpeed() {
  SpeedForPointOrbit = 5250;
}
