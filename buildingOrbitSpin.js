
window.dashedEntityList = [];

function monentarilyGenerateBuildingDash(id, index)
{
	console.log(id+", "+index);
	var coords = "";
	var basefloorheight = 0;
	if(typeof TempBldgData[id] != "undefined" && typeof TempBldgData[id].coords != "undefined")
	{
		coords = TempBldgData[id].coords;
		basefloorheight = TempBldgData[id].basefloorheight;
	}
	else
	{
		coords = searchBuildingData[index].coords;
		basefloorheight = searchBuildingData[index].basefloorheight;
	}
	setTimeout(function (){ CreateDashedLine(id, coords, ( cityAltitudeAdjustment[lastCityLoaded] + parseFloat(basefloorheight) ), null)}, 2000);
	setTimeout(function (){ RemoveEntitiesByType(dashedEntityList); }, 5000);
}

async function CreateDashedLine( tempId, BldgFootprint, buildingHeight, attributes ) {
	BldgFootprint = BldgFootprint.replace(/[\s,]+$/, '');
	console.log("CreateDashedLine("+tempId+", "+buildingHeight+")");
  //HighlightBuilding(attributes);
  var clipFootPrint = JSON.parse(`[${BldgFootprint}]`);
  var lonlat = {
    lon: clipFootPrint[0],
    lat: clipFootPrint[1],
  };
  //var terrainHeight = await GetTerrainHeight(lonlat);
  clipFootPrint.push(clipFootPrint[0]);
  clipFootPrint.push(clipFootPrint[1]);
  var pointsWithHeight = [];
  for (var i = 0; i < clipFootPrint.length - 1; i = i + 2) {
    pointsWithHeight.push(clipFootPrint[i]);
    pointsWithHeight.push(clipFootPrint[i + 1]);
    pointsWithHeight.push(buildingHeight);
  }
  RemoveEntitiesByType(dashedEntityList);
  dashedEntityList = [];
  var dashEnity = viewer.entities.add({
    id: "dashedLine_" + tempId,
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(pointsWithHeight),
      //positions: Cesium.Cartesian3.fromDegreesArray(clipFootPrint),
      width: 4,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#FFFFFF"),
      }),
      depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#FFFFFF"),
      }),
    },
  });
  dashedEntityList.push(dashEnity);
}

function RemoveEntitiesByType(entities) {
  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    viewer.entities.remove(entity);
  }
}
window.IsEnableRotateAroundBuilding = false;
function ToggleRotateAroundBuilding()
{
	if (IsEnableRotateAroundBuilding) {
    IsEnableRotateAroundBuilding = false;
    RotateAroundPointBtn = false;
    $("#autoRotateZoom").attr("src", "images/360.png");
    StopCameraRotationAroundBuilding();
    //$("#SRotate").attr("src", "./images/auto_rotate.svg");
    //$("#speedWindowForPointOrbit").css("display", "none");
  } else {
	  if(typeof buildingPointSelected != "undefined")
	  {
		IsEnableRotateAroundBuilding = true;
		RotateAroundPointBtn = true;
		$("#autoRotateZoom").attr("src", "images/pause-active.png");
		if (buildingPointSelected != null) {
		  FlyToPointBuildingOrbit(buildingPointSelected);
		}
	  }
  }
}

function CameraRotationAroundBuilding(latlonObj) {
	$("#autoRotateZoom").attr("src", "images/pause-active.png");
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

    const SMOOTHNESS = 5250;//SpeedForPointOrbit; //it would make one full circle in roughly 800 frames
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewer.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
    if (
      Math.abs(heading.toFixed(3)) == (12.35694262027422).toFixed(3) ||
      Math.abs(heading.toFixed(3)) > (12.35694262027422).toFixed(3)
    ) {
      IsEnableRotateAroundBuilding = false;
      RotateAroundPointBtn = false;
      unsubscribeSPoint();
      camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  });
}

function StopCameraRotationAroundBuilding() {
  if (unsubscribeSPoint != null) {
    unsubscribeSPoint();
  }
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

async function FlyToPointBuildingOrbit() {
  RemoveEntityByName("tempMarkerPin");
  if (buildingPointSelected != null) {
    entity = viewer.entities.add({
      name: "tempMarkerPin",
      position: new Cesium.Cartesian3.fromDegrees(
        parseFloat(buildingPointSelected.lon),
        parseFloat(buildingPointSelected.lat),
        parseFloat(buildingPointSelected.height)
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
        250
      ),
    };
    viewer.flyTo(entity, options);
    setTimeout(CameraRotationAroundBuilding, 3100, buildingPointSelected);
  }
}

async function FlyToCityOrbit() {
  RemoveEntityByName("tempMarkerPin");
  
  var camDetails = marketCameraDetails[parseInt(marketDetailsV2[lastMarketLoaded].marketcamera)];
  defaultToOfficeMarket();
    entity = viewer.entities.add({
      name: "tempMarkerPin",
      position: new Cesium.Cartesian3.fromDegrees(
        parseFloat(camDetails.longitude),
        parseFloat(camDetails.latitude),
        parseFloat(camDetails.altitude)
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
        250
      ),
    };
    //viewer.flyTo(entity, options);
    setTimeout(function () { ToggleCameraRotationSlowly(); }, 3000);
}

function RemoveEntityByName(entityName) {
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == entityName) {
      viewer.entities.remove(entity);
    }
  });
}

