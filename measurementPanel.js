var MeasurementMode = null;
var measureUnit = "Imperial";
var MeasureHrLineEntityList = [];
var MeasureVrLineEntityList = [];
var MeasurePolylineEntityList = [];
var MeasureAreaEntityList = [];
var distanceClickCount = 0;
var areaClickCount = 0;
var labelPosition = null;
var labelEntities = [];
var areastartingPoint = null;
var hrdistancelines = [];
var vrdistancelines = [];
var HrMeasureEntity = null;
var VrMeasureEntity = null;
var AreaMeasureEntity = null;
var slopePoint = [];
var activeShapePoints = [];
var polylineClickCount = 0;
var polylinedistancelines = [];
var polylineEntity = [];
var polylineDistance = 0;
var areaPolygon = [];
var distanceLabel,
  verticalLabel,
  horizontalLabel,
  firstPointAngleLabel,
  secondPointAngleLabel;
var points = null;
var tempPoints = null;
var polylines = null;
var altentities = [];

$("#measurementPanel").draggable();

$("#measureCheckbox").bind("change", function () {
    if ($("#measureCheckbox").prop("checked")) {
      IsEnableMeasurementPanel = true;
      $("#measurementPanel").css("display", "block");
    } else {
      IsEnableMeasurementPanel = false;
      $("#measurementPanel").css("display", "none");
    }
  });

function showMeasurementPanel() {
  IsEnableMeasurementPanel = true;
  $("#measurementPanel").css("display", "block");
  IsEnableMenuPanel = false;
  $("#menuPanel").css("display", "none");
  //MeshLayer2.show = false;
  //MeshLayer3.show = false;
  //MeshLayer.splitDirection = Cesium.SplitDirection.NONE;
  //MeshLayer2.splitDirection = Cesium.SplitDirection.NONE;
  //MeshLayer3.splitDirection = Cesium.SplitDirection.NONE;
  $("#slider").css("display", "none");
  $("#TilesetCompareExit").css("display", "none");
}

function CloseMeasurementPanel() {
  IsEnableMeasurementPanel = false;
  MeasurementMode = null;
  $("#measurementPanel").css("display", "none");
  $("#measureCheckbox").prop("checked", false);
  setResetSettingFlags("measure-li", false);
  ClearMeasurement();
}

function drawShape(positionData) {
  var shape;
  if (MeasurementMode === "hrLine") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 3,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });
    hrdistancelines.push(shape);
  } else if (MeasurementMode === "vrLine") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 3,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });
    vrdistancelines.push(shape);
  } else if (MeasurementMode === "polyline") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 3,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });
    polylinedistancelines.push(shape);
  } else if (MeasurementMode == "area") {
    shape = viewer.entities.add({
      name: MeasurementMode,
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.YELLOW.withAlpha(0.7)
        ),
        //perPositionHeight: true,
      },
    });
    areaPolygon.push(shape);
    if (true) {
      areaClickCount = 0;
      if (activeShapePoints.length >= 4) {
        var area = GetPolygonAreaUsingTurf(activeShapePoints);
        var unit = null;
        if (measureUnit === "Imperial") {
          unit = " ft²";
        } else {
          unit = " ㎡";
        }
        var center = GetCenterUsingTurf(activeShapePoints);
        var entity = viewer.entities.add({
          name: "area",
          position: Cesium.Cartesian3.fromDegrees(
            parseFloat(center.geometry.coordinates[0]),
            parseFloat(center.geometry.coordinates[1]),
            parseFloat(areastartingPoint.height)
          ),
          label: {
            show: true,
            text: area + unit,
            showBackground: true,
            font: "14px monospace",
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            pixelOffset: new Cesium.Cartesian2(-10, -7),
          },
        });
        RefreshMeasurementLabel();
        MeasureAreaEntityList.push(entity);
      }
    }
  } else if (MeasurementMode == "volume") {
    shape = viewer.entities.add({
      name: MeasurementMode,
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.YELLOW.withAlpha(0.7)
        ),
        //perPositionHeight: true,
      },
    });
    volumePolygon.push(shape);
  }
  return shape;
}


function SetMeasureUnit(unit) {
  measureUnit = unit;
  UpdateLabelText();
}

function UpdateLabelText() {
  var entities = viewer.entities._entities._array;
  for (const entity of entities) {
    if (entity.label !== undefined && entity.label.text !== undefined) {
      var text = entity.label.text._value;
      if (entity.name == "area") {
        if (text.includes("ft²")) {
          var value = text.replace(" ft²", "").trim();
          var newValue = Number(value) / Math.pow(3.2808, 2);
          entity.label.text = newValue.toFixed(2) + " ㎡";
        } else {
          var value = text.replace(" ㎡", "").trim();
          var newValue = Number(value) * Math.pow(3.2808, 2);
          entity.label.text = newValue.toFixed(2) + " ft²";
        }
      } else if (text.includes("m")) {
        var value = text.replace(" m", "").trim();
        var newValue = Number(value) * 3.2808;
        entity.label.text = newValue.toFixed(2) + " ft";
      } else if (text.includes("ft")) {
        var value = text.replace(" ft", "").trim();
        var newValue = Number(value) / 3.2808;
        entity.label.text = newValue.toFixed(2) + " m";
      }
    }
  }
}

function createPoint(worldPosition) {
  var latlongObj = GetlonlatheightfromCartesian(worldPosition);
  point = viewer.entities.add({
    name: MeasurementMode,
    position: Cesium.Cartesian3.fromDegrees(
      parseFloat(latlongObj.lon),
      parseFloat(latlongObj.lat),
      parseFloat(latlongObj.height)
    ),
    point: {
      color: Cesium.Color.YELLOW,
      pixelSize: 10,
      heightReference: Cesium.HeightReference.NONE,
    },
  });
  PushIntoEntityContainer(point);
  return point;
}

async function terminateShape() {
  if (MeasurementMode == "area") {
    areaClickCount = 0;
    var area = GetPolygonAreaUsingTurf(activeShapePoints);
    var unit = null;
    if (measureUnit === "Imperial") {
      unit = " ft²";
    } else {
      unit = " ㎡";
    }
    var center = GetCenterUsingTurf(activeShapePoints);
    var entity = viewer.entities.add({
      name: "area",
      position: Cesium.Cartesian3.fromDegrees(
        parseFloat(center.geometry.coordinates[0]),
        parseFloat(center.geometry.coordinates[1]),
        parseFloat(areastartingPoint.height)
      ),
      label: {
        show: true,
        text: area + unit,
        showBackground: true,
        font: "14px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(-10, -7),
      },
    });
    RefreshMeasurementLabel();
    MeasureAreaEntityList.push(entity);
  } else if (MeasurementMode == "polyline") {
    var unit = null;
    if (measureUnit === "Imperial") {
      unit = " ft";
    } else {
      unit = " m";
    }
    polylineClickCount = 0;
    var entity = viewer.entities.add({
      name: "polyline",
      position: activeShapePoints[activeShapePoints.length - 2],
      label: {
        show: true,
        text: polylineDistance.toFixed(2).toLocaleString("en-US") + unit,
        showBackground: true,
        font: "18px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(-10, -7),
      },
    });
    RefreshMeasurementLabel();
    MeasurePolylineEntityList.push(entity);
  } else if (MeasurementMode == "hrLine") {
    var point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
    var point2 = ellipsoid.cartesianToCartographic(activeShapePoints[1]);
    var distance = GetHorizontalDistance(point1, point2);
    if (measureUnit === "Imperial") {
      if (distance == "0.00 ft") {
        point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
        point2 = ellipsoid.cartesianToCartographic(activeShapePoints[2]);
        distance = GetHorizontalDistance(point1, point2);
      }
    } else {
      if (distance == "0.00 m") {
        point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
        point2 = ellipsoid.cartesianToCartographic(activeShapePoints[2]);
        distance = GetHorizontalDistance(point1, point2);
      }
    }
    var entity = viewer.entities.add({
      name: "hrLine",
      position: activeShapePoints[2],
      label: {
        show: true,
        text: distance,
        showBackground: true,
        font: "18px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(-10, -7),
      },
    });
    RefreshMeasurementLabel();
    MeasureHrLineEntityList.push(entity);
  } else if (MeasurementMode == "vrLine") {
    var point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
    var point2 = ellipsoid.cartesianToCartographic(activeShapePoints[1]);
    var distance = GetVerticalDistance(point1, point2);
    if (distance == "0.00 ft") {
      point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
      point2 = ellipsoid.cartesianToCartographic(activeShapePoints[2]);
      distance = GetVerticalDistance(point1, point2);
    }
    var entity = viewer.entities.add({
      name: "vrLine",
      position: activeShapePoints[2],
      label: {
        show: true,
        text: distance,
        showBackground: true,
        font: "18px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(-10, -7),
      },
    });
    RefreshMeasurementLabel();
    MeasureVrLineEntityList.push(entity);
  }
  if (MeasurementMode == "area") {
    drawShape(GetPositionWithExtraHeight(activeShapePoints));
  } else {
    drawShape([...new Set(activeShapePoints)]);
  }
  activeShapePoints.pop();
  viewer.entities.remove(floatingPoint);
  viewer.entities.remove(activeShape);
  floatingPoint = undefined;
  activeShape = undefined;
  activeShapePoints = [];
}

function RefreshMeasurementLabel() {
  RemoveEntitiesByType(MeasureAreaEntityList);
  viewer.entities.remove(AreaMeasureEntity);
  viewer.entities.remove(HrMeasureEntity);
  viewer.entities.remove(VrMeasureEntity);
  viewer.entities.remove(PolylineMeasureEntity);
  viewer.entities.remove(positionInspectorEntity);
  positionInspectorEntity = viewer.entities.add({
    name: "position_Ins",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(15, 0),
    },
  });
  HrMeasureEntity = viewer.entities.add({
    name: "hrmeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
  VrMeasureEntity = viewer.entities.add({
    name: "vrmeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
  PolylineMeasureEntity = viewer.entities.add({
    name: "polylinemeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-50, -7),
    },
  });
  AreaMeasureEntity = viewer.entities.add({
    name: "areameasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
}

function PushIntoEntityContainer(point) {
  var mode = MeasurementMode;
  switch (mode) {
    case "vrLine":
      vrdistancelines.push(point);
      break;
    case "hrLine":
      hrdistancelines.push(point);
      break;
    case "polyline":
      polylinedistancelines.push(point);
      break;
    case "area":
      areaPolygon.push(point);
      break;
    case "slope":
      slopePoint.push(point);
      break;
  }
}

function RefreshInsEntityByName(entities) {
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == "position_Ins") {
      viewer.entities.remove(entity);
    }
  });
  positionInspectorEntity = viewer.entities.add({
    name: "position_Ins",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(15, 0),
    },
  });
}

setTimeout(function (){
	$("#measurementPanel").draggable();
	
	$("#positionIns").click(function () {
		RefreshInsEntityByName("position_Ins");
		if($("#positionIns").hasClass("active"))
		{
			MeasurementMode = null;
			$(".measurementButton").removeClass("active").addClass("inactive");
		}
		else
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			$(this).removeClass("inactive").addClass("active");
			MeasurementMode = "InspectionMode";
		}
	  });
	  $("#hrLine").click(function () {
		RefreshInsEntityByName("position_Ins");
		if($("#hrLine").hasClass("active"))
		{
			MeasurementMode = null;
			$(".measurementButton").removeClass("active").addClass("inactive");
		}
		else
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			$(this).removeClass("inactive").addClass("active");
			MeasurementMode = "hrLine";
		}
	  });
	  $("#vrLine").click(function () {
		RefreshInsEntityByName("position_Ins");
		if($("#vrLine").hasClass("active"))
		{
			MeasurementMode = null;
			$(".measurementButton").removeClass("active").addClass("inactive");
		}
		else
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			$(this).removeClass("inactive").addClass("active");
			MeasurementMode = "vrLine";
		}
	  });
	  $("#polyline").click(function () {
		RefreshInsEntityByName("position_Ins");
		if($("#polyline").hasClass("active"))
		{
			MeasurementMode = null;
			$(".measurementButton").removeClass("active").addClass("inactive");
		}
		else
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			$(this).removeClass("inactive").addClass("active");
			MeasurementMode = "polyline";
		}
	  });
	  $("#area").click(function () {
		RefreshInsEntityByName("position_Ins");
		if($("#area").hasClass("active"))
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			MeasurementMode = null;
		}
		else
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			$(this).removeClass("inactive").addClass("active");
			MeasurementMode = "area";
		}
	  });
	  $("#slope").click(function () {
		RefreshInsEntityByName("position_Ins");
		if($("#slope").hasClass("active"))
		{
			MeasurementMode = null;
			$(".measurementButton").removeClass("active").addClass("inactive");
		}
		else
		{
			$(".measurementButton").removeClass("active").addClass("inactive");
			$(this).removeClass("inactive").addClass("active");
			MeasurementMode = "slope";
		}
	  });
	  $("#clear").click(function () {
		ClearMeasurement();
		$(".measurementButton").removeClass("active").addClass("inactive");
		$(this).removeClass("inactive").addClass("active");
		MeasurementMode = null;
	  });
	  
	  $("#infoBoxCheckbox").bind("change", function () {
		if ($("#infoBoxCheckbox").prop("checked")) {
		  IsEnableInfoBox = true;
		  $("#infoboxContent").removeClass("d-none");
		} else {
		  IsEnableInfoBox = false;
		  $("#infoboxContent").addClass("d-none");
		}
	  });
	  $("#timeCompareCheckbox").bind("change", function () {
		if ($("#timeCompareCheckbox").prop("checked")) {
		  IsEnableTimeComapare = true;
		  $("#measurementPanel").css("display", "none");
		  $("#left_part").text(MeshLayerDate);
		  $("#right_part").text(MeshLayer2Date);
		  MeshLayer2.show = true;
		  MeshLayer.splitDirection = Cesium.SplitDirection.LEFT;
		  MeshLayer2.splitDirection = Cesium.SplitDirection.RIGHT;
		  MeshLayer.show = true;
		  InitialMovement();
		  $("#slider").css("display", "block");
		  $("#TilesetCompareExit").css("display", "flex");
		  $("#TilesetCompareTitle").css("display", "flex");
		} else {
		  IsEnableTimeComapare = false;
		  ExitTilesetCompare();
		}
	  });
	  $("#measureCheckbox").bind("change", function () {
		if ($("#measureCheckbox").prop("checked")) {
		  IsEnableMeasurementPanel = true;
		  $("#measurementPanel").css("display", "block");
		} else {
		  IsEnableMeasurementPanel = false;
		  $("#measurementPanel").css("display", "none");
		}
	  });
	  
	  handler5 = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  var selected = {
    feature: undefined,
    originalColor: undefined,
  };

  handler5.setInputAction(function (event) {
    if (Cesium.defined(floatingPoint)) {
      var newPosition = viewer.scene.pickPosition(event.endPosition);
      if (Cesium.defined(newPosition)) {
        floatingPoint.position.setValue(newPosition);
        activeShapePoints.pop();
        activeShapePoints.push(newPosition);
      }
      if (MeasurementMode == "slope" && slopStartPoint !== null) {
        if (pointCount == 2) {
          pointCount = 0;
          RemoveEntitiesByType(slopePoint);
          slopStartPoint = null;
        } else {
          RemoveSlopeEntities();
          if (
            slopStartPoint.position !== undefined &&
            newPosition !== undefined
          ) {
            updateSlopeMeasurement(slopStartPoint.position._value, newPosition);
          }
        }
      }
      if (
        MeasurementMode == "hrLine" &&
        activeShapePoints.length !== 0 &&
        newPosition !== undefined
      ) {
        var point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
        var point2 = ellipsoid.cartesianToCartographic(newPosition);
        var distance = GetHorizontalDistance(point1, point2);
        HrMeasureEntity.position = activeShapePoints[1];
        HrMeasureEntity.label.show = true;
        HrMeasureEntity.label.text = distance;
      }
      if (
        MeasurementMode == "vrLine" &&
        activeShapePoints.length !== 0 &&
        newPosition !== undefined
      ) {
        var point1 = ellipsoid.cartesianToCartographic(activeShapePoints[0]);
        var point2 = ellipsoid.cartesianToCartographic(newPosition);
        var distance = GetVerticalDistance(point1, point2);
        VrMeasureEntity.position = activeShapePoints[1];
        VrMeasureEntity.label.show = true;
        VrMeasureEntity.label.text = distance;
      }
      if (
        MeasurementMode == "polyline" &&
        activeShapePoints.length !== 0 &&
        newPosition !== undefined
      ) {
        var point1 = ellipsoid.cartesianToCartographic(
          activeShapePoints[activeShapePoints.length - 2]
        );
        var point2 = ellipsoid.cartesianToCartographic(newPosition);
        var distance = GetHorizontalDistance(point1, point2);
        PolylineMeasureEntity.position =
          activeShapePoints[activeShapePoints.length - 1];
        PolylineMeasureEntity.label.show = true;
        PolylineMeasureEntity.label.text = distance;
      }
    }
    // Position Inspection
    if (MeasurementMode === "InspectionMode") {
      const newPosition = viewer.scene.pickPosition(event.endPosition);
      if (newPosition) {
        var latlongObj = GetlonlatheightfromCartesian(newPosition);
        (positionInspectorEntity.position = Cesium.Cartesian3.fromDegrees(
          parseFloat(latlongObj.lon),
          parseFloat(latlongObj.lat),
          parseFloat(latlongObj.height)
        )),
          (positionInspectorEntity.label.show = true);
        positionInspectorEntity.label.text =
          `Lon: ${parseFloat(latlongObj.lon).toFixed(2)}` +
          `\nLat: ${parseFloat(latlongObj.lat).toFixed(2)}` +
          `\nAlt: ${
            measureUnit === "Metric"
              ? parseFloat(latlongObj.height).toFixed(2)
              : (parseFloat(latlongObj.height) * 3.2808).toFixed(2)
          }`;
      } else {
        positionInspectorEntity.label.show = false;
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	
	handler5.setInputAction(function (event) {
		terminateShape();
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

	positionInspectorEntity = viewer.entities.add({
		name: "position_Ins",
		label: {
		  show: false,
		  showBackground: true,
		  font: "14px monospace",
		  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
		  disableDepthTestDistance: Number.POSITIVE_INFINITY,
		  pixelOffset: new Cesium.Cartesian2(15, 0),
		},
	  });

	  HrMeasureEntity = viewer.entities.add({
		name: "hrmeasurementlbl",
		label: {
		  show: false,
		  showBackground: true,
		  font: "18px monospace",
		  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
		  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		  disableDepthTestDistance: Number.POSITIVE_INFINITY,
		  pixelOffset: new Cesium.Cartesian2(-10, -7),
		},
	  });
	  VrMeasureEntity = viewer.entities.add({
		name: "vrmeasurementlbl",
		label: {
		  show: false,
		  showBackground: true,
		  font: "18px monospace",
		  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
		  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		  disableDepthTestDistance: Number.POSITIVE_INFINITY,
		  pixelOffset: new Cesium.Cartesian2(-10, -7),
		},
	  });
	  PolylineMeasureEntity = viewer.entities.add({
		name: "polylinemeasurementlbl",
		label: {
		  show: false,
		  showBackground: true,
		  font: "18px monospace",
		  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
		  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		  disableDepthTestDistance: Number.POSITIVE_INFINITY,
		  pixelOffset: new Cesium.Cartesian2(-50, -7),
		},
	  });
	  AreaMeasureEntity = viewer.entities.add({
		name: "areameasurementlbl",
		label: {
		  show: false,
		  showBackground: true,
		  font: "18px monospace",
		  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
		  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		  disableDepthTestDistance: Number.POSITIVE_INFINITY,
		  pixelOffset: new Cesium.Cartesian2(-10, -7),
		},
	  });
	  infoEntity = viewer.entities.add({
		name: "info_entity",
		label: {
		  show: false,
		  showBackground: true,
		  font: "18px monospace",
		  backgroundColor: Cesium.Color.WHITE.withAlpha(0.8),
		  fillColor: Cesium.Color.BLACK,
		  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
		  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
		  disableDepthTestDistance: Number.POSITIVE_INFINITY,
		  pixelOffset: new Cesium.Cartesian2(2, 0),
		},
	  });

	  
}, 3000);
	
	function GetlonlatheightfromCartesian(cartesian) {
	  var ellipsoid = viewer.scene.globe.ellipsoid;
	  var cartographic = ellipsoid.cartesianToCartographic(cartesian);
	  var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
	  var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
	  var height = cartographic.height.toFixed(3);
	  return { lon: lon, lat: lat, height: height };
	}
	
	function GetCenterOfPoints(point1, point2) {
	  var x = (point1.x + point2.x) / 2;
	  var y = (point1.y + point2.y) / 2;
	  var z = (point1.z + point2.z) / 2;
	  return new Cesium.Cartesian3(x, y, z);
	}
	function GetHorizontalDistance(point1, point2) {
	  geodesic.setEndPoints(point1, point2);
	  var meters = geodesic.surfaceDistance.toFixed(3);
	  if (measureUnit === "Imperial") {
		var feet = meters * 3.2808;
		return Number(feet).toFixed(2).toLocaleString("en-US") + " ft";
	  } else {
		return Number(meters).toFixed(2).toLocaleString("en-US") + " m";
	  }
	}

	function GetVerticalDistance(point1, point2) {
	  var heights = [point1.height, point2.height];
	  var meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
	  if (measureUnit === "Imperial") {
		var feet = meters * 3.2808;
		return Number(feet).toFixed(2).toLocaleString("en-US") + " ft";
	  } else {
		return Number(meters).toFixed(2).toLocaleString("en-US") + " m";
	  }
	}
	function GetPolygonAreaUsingTurf(points) {
	  var AreaPoints = [];
	  $.each(points, function (index, point) {
		AreaPoints.push(CartesianToLatlon(point));
	  });
	  var geojson = {
		type: "Feature",
		geometry: {
		  type: "Polygon",
		  coordinates: [],
		},
		properties: null,
	  };

	  for (var i = 0; i < AreaPoints.length; i++) {
		var point = AreaPoints[i];
		geojson.geometry.coordinates.push([point.lon, point.lat]);
	  }

	  geojson.geometry.coordinates.push([AreaPoints[0].lon, AreaPoints[0].lat]);
	  var polygon = turf.polygon([geojson.geometry.coordinates]);
	  if (measureUnit === "Imperial") {
		var area = turf.area(polygon);
		var areaInFeet = area * Math.pow(3.2808, 2);

		return areaInFeet.toFixed(2).toLocaleString("en-US");
	  } else {
		var area = turf.area(polygon);
		return area.toFixed(2).toLocaleString("en-US");
	  }
	}
	function GetCenterUsingTurf(points) {
	  var AreaPoints = [];
	  $.each(points, function (index, point) {
		AreaPoints.push(CartesianToLatlon(point));
	  });
	  var tempArr = [];
	  for (var i = 0; i < AreaPoints.length; i++) {
		var point = AreaPoints[i];
		tempArr.push([parseFloat(point.lon), parseFloat(point.lat)]);
	  }
	  var features = turf.points(tempArr);
	  var center = turf.center(features);

	  return center;
	}


function ClearMeasurement() {
  activeShapePoints.pop();
  viewer.entities.remove(floatingPoint);
  viewer.entities.remove(activeShape);
  floatingPoint = undefined;
  activeShape = undefined;
  activeShapePoints = [];
  RemoveSlopeEntities();
  RemoveLabelEntity();
  RemoveEntitiesByType(vrdistancelines);
  RemoveEntitiesByType(hrdistancelines);
  RemoveEntitiesByType(altentities);
  RemoveEntitiesByType(MeasureHrLineEntityList);
  RemoveEntitiesByType(MeasurePolylineEntityList);
  RemoveEntitiesByType(MeasureAreaEntityList);
  RemoveEntitiesByType(MeasureVrLineEntityList);
  altentities = [];
  vrdistancelines = [];
  hrdistancelines = [];
  RemoveEntitiesByType(areaPolygon);
  areaPolygon = [];
  RemoveEntitiesByType(polylinedistancelines);
  polylinedistancelines = [];
  RemoveEntitiesByType(polylineEntity);
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == "markerPin") {
      viewer.entities.remove(entity);
    }
  });
  RefreshMeasurementLabel();
}
function RemoveEntitiesByType(entities) {
  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    viewer.entities.remove(entity);
  }
}
function RemoveLabelEntity() {
  labelEntities.forEach((entity) => {
    viewer.entities.remove(entity);
  });
}
function RefreshMeasurementLabel() {
  RemoveEntitiesByType(MeasureAreaEntityList);
  viewer.entities.remove(AreaMeasureEntity);
  viewer.entities.remove(HrMeasureEntity);
  viewer.entities.remove(VrMeasureEntity);
  viewer.entities.remove(PolylineMeasureEntity);
  viewer.entities.remove(positionInspectorEntity);
  positionInspectorEntity = viewer.entities.add({
    name: "position_Ins",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(15, 0),
    },
  });
  HrMeasureEntity = viewer.entities.add({
    name: "hrmeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
  VrMeasureEntity = viewer.entities.add({
    name: "vrmeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
  PolylineMeasureEntity = viewer.entities.add({
    name: "polylinemeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-50, -7),
    },
  });
  AreaMeasureEntity = viewer.entities.add({
    name: "areameasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "18px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
}

function RemoveSlopeEntities() {
	if(typeof points != "undefined" && points != null)
		points.removeAll();
	if(typeof polylines != "undefined" && polylines != null)
		polylines.removeAll();
  viewer.entities.remove(distanceLabel);
  viewer.entities.remove(horizontalLabel);
  viewer.entities.remove(verticalLabel);
  viewer.entities.remove(firstPointAngleLabel);
  viewer.entities.remove(secondPointAngleLabel);
  if(typeof tempPoints != "undefined" && tempPoints != null)
	tempPoints.removeAll();
  if(typeof temppolylines != "undefined" && temppolylines != null)
  temppolylines.removeAll();
}



