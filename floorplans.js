const position = new Cesium.Cartesian3(
      -1639063.6135089968,
      -3669255.5226047677,
      4937598.926497805
    );
var modelEntityClippingPlanes = new Cesium.ClippingPlaneCollection({
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
      unionClippingRegions: true,
      edgeWidth: 0.0,
      edgeColor: Cesium.Color.TRANSPARENT,
      enabled: true,
    });
	
function CartesianToLatlon(cartesian) {
	var ellipsoid = viewer.scene.globe.ellipsoid;
	var cartographic = ellipsoid.cartesianToCartographic(cartesian);
	var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
	var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
	var heightString = cartographic.height.toFixed(3);
	
	return { lon: longitudeString, lat: latitudeString, height: heightString };
}

var FloorPlanInverseClippingEnabled = false;
var DomeTowerClipCoords = [
  -114.0690683047458, 51.04643147750371,-114.06941988271846, 51.04622626714348,-114.06983159946667, 51.04624316229517,-114.06980201963833, 51.0466951624515,-114.06905626865658, 51.04666807178396,-114.0690683047458, 51.04643147750371
];
var DomeTower27Coords = [
  -114.06977018731389, 51.04657553301039, -114.06908361672139,
  51.04655621144337, -114.06908656354634, 51.04644304255597,
  -114.06944491287145, 51.04624121374219, -114.06979635931127,
  51.046252263824094, -114.06977018731389, 51.04657553301039,
];
function ToggleInverseClipFloorPlanFeature() {
  if (!FloorPlanInverseClippingEnabled) {
    currentFloor = "Dome-27";
    createFloorPlanDomeTower27();
    $("#viewerController").css("width", "230px");
    $("#floorview").css("display", "block");
    if ($("#ClippingFloorPlanToggleHomeOilTower").hasClass("active")) {
      ToggleInverseClipFloorPlanFeatureHomeOilTower();
    }
    if ($("#ClippingFloorPlanToggleTDTower").hasClass("active")) {
      ToggleInverseClipFloorPlanFeatureTDTower37();
    }
   /* 
    var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
    baseLayerPickerViewModel.selectedImagery =
      baseLayerPickerViewModel.imageryProviderViewModels[0];
    */
    const position = new Cesium.Cartesian3(
      -1639025.3111605712,
      -3669332.388114772,
      4937706.732197587
    );
    var latlonObj = CartesianToLatlon(position);
    const newPosition = Cesium.Cartographic.toCartesian(
      new Cesium.Cartographic.fromDegrees(
        parseFloat(latlonObj.lon),
        parseFloat(latlonObj.lat),
        0
      )
    );

    modelEntityClippingPlanes.unionClippingRegions = false;

    modelEntityClippingPlanes.modelMatrix =
      Cesium.Transforms.eastNorthUpToFixedFrame(newPosition);

    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 1134)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), -50)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), -50)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), -20)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), -25)
    );

    googleTileset.clippingPlanes = modelEntityClippingPlanes;

    // Clicked entity
    clkEntity1 = viewer.entities.add({
      id: "clk1",
      polygon: {
        hierarchy: {
          /* positions: Cesium.Cartesian3.fromDegreesArray([
            -114.06977663981752, 51.0464649091748, -114.06979178101712,
            51.046253705576774, -114.06944611986934, 51.046242314205585,
            -114.06909349664903, 51.04644358760793, -114.06908574861745,
            51.04655255995839, -114.06917181478917, 51.0465551113062,
            -114.0691762509884, 51.04649563539632, -114.06919666013836,
            51.046496246248324,
            -114.06919928833324, 51.046458835932704, -114.06928476952567,
            51.04646149911345, -114.06928532797599, 51.04644718206594,
            -114.06937640706525, 51.04644990337478, -114.06938198396132,
            51.04635239570458, -114.06941976996426, 51.046353561431204,
            -114.06942080017494, 51.04633797014459, -114.06964763076068,
            51.04634486128198, -114.06965202077565, 51.046308550751455,
            -114.06965250608084, 51.046308401943485, -114.0696933162504,
            51.046310786257294, -114.06968473030031, 51.04642486124185,
            -114.06969287269915, 51.046310524591284, -114.06968372285372,
            51.0464244792091, -114.06961782776315, 51.046422325380505,
            -114.06961594418244, 51.04644615680808, -114.06968183425575,
            51.0464486258543, -114.06968145533891, 51.046461799624076,
            -114.06977526273094, 51.04646460911927,
          ]), */
          positions: Cesium.Cartesian3.fromDegreesArray([
            -114.069776595473, 51.046464909441006, -114.06979176407414,
            51.04625373193204, -114.0694437245664, 51.046242284387006,
            -114.06908692827231, 51.046443121848476, -114.06908444246478,
            51.0465525625454, -114.06917182758882, 51.046555074781075,
            -114.06917627154992, 51.046495713142924, -114.06919844613445,
            51.04649649711899, -114.06920133374015, 51.046459071359884,
            -114.06928481695765, 51.046461605695306, -114.06928629782846,
            51.04644593450745, -114.06937685513392, 51.046449578154004,
            -114.06938250746107, 51.046351259332965, -114.06942006877016,
            51.04635254016059, -114.0694213925576, 51.046337942186454,
            -114.06964745302248, 51.04634485511736, -114.06965178869255,
            51.046308842896764, -114.06969318208169, 51.046310585920914,
            -114.06968374760365, 51.046424461996146, -114.06961801127457,
            51.04642232163985, -114.06961586669618, 51.04644624922168,
            -114.06968242803865, 51.04644853860597, -114.0696799452133,
            51.0464616485799, -114.06977686110635, 51.046464953466284,
          ]),
        },
        material: Cesium.Color.WHITE.withAlpha(0.1),
        height: 1134.16,
        //extrudedHeight: 0.75,
        //zIndex: 3,
      },
    });
    clkEntitylbl1 = viewer.entities.add({
      id: "clklbl1",
      show: false,
      position: Cesium.Cartesian3.fromDegrees(
        -114.06937498,
        51.04645021,
        1134.16
      ),
      label: {
        text: "Available",
        backgroundColor: Cesium.Color.WHITE,
        fillColor: Cesium.Color.BLACK,
        showBackground: true,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(2, 0),
      },
    });
    clkEntity2 = viewer.entities.add({
      id: "clk2",
      polygon: {
        hierarchy: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            -114.06977691407316, 51.046464939017895, -114.06976802221202,
            51.046572484446656, -114.06917609739605, 51.046552744060605,
            -114.06918065191533, 51.046495830069674, -114.0691995948963,
            51.046496385908995, -114.06920286793702, 51.04645867337727,
            -114.06928673732287, 51.04646130071307, -114.06928792269652,
            51.04644659031828, -114.06940431097658, 51.046450908152885,
            -114.0694077958948, 51.046465309836464, -114.069587670619,
            51.046471256529784, -114.06958892416486, 51.046456557131506,
            -114.06961773864772, 51.046457352366964, -114.069618782226,
            51.046446966417285, -114.06968230427267, 51.046449070546174,
            -114.06968146490586, 51.046461469564534, -114.06977686899569,
            51.0464648244001,
          ]),
        },
        material: Cesium.Color.WHITE.withAlpha(0.1),
        height: 1134.16,
        //extrudedHeight: 1134.75,
        zIndex: 3,
      },
    });
    clkEntitylbl2 = viewer.entities.add({
      id: "clklbl2",
      show: false,
      position: Cesium.Cartesian3.fromDegrees(
        -114.06976271281411,
        51.0465716220447,
        1134.1507533536114
      ),
      label: {
        text: "Subleased",
        backgroundColor: Cesium.Color.WHITE,
        fillColor: Cesium.Color.BLACK,
        showBackground: true,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(2, 0),
      },
    });
  } else {
    currentFloor = null;
    $("#viewerController").css("width", "150px");
    $("#floorview").css("display", "none");
    modelEntityClippingPlanes.removeAll();
	modelEntityClippingPlanes.unionClippingRegions = true;
    viewer.entities.removeById("clipHandle-DomeTower27");
    viewer.entities.removeById("clk1");
    viewer.entities.removeById("clk2");
    viewer.entities.removeById("clklbl1");
    viewer.entities.removeById("clklbl2");
    floorView = false;
    IsFloorViewRotate = false;
    if (typeof unsubscribeFloorView != "undefined" && unsubscribeFloorView !== null) {
      unsubscribeFloorView();
    }
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    $("#floorview").css("border-color", "white");
    $("#floorview").css("color", "white");
    activeTool.splice(activeTool.indexOf("floorview"), 1);
  }
  FloorPlanInverseClippingEnabled = !FloorPlanInverseClippingEnabled;
  $("#ClippingFloorPlanToggle").toggleClass("active");
}


var FloorPlanInverseClippingEnabledHomeOilTower = false;
var HomeOilClipCoords = [
  -114.06879731695042, 51.045821461463326,-114.06953840949483, 51.04583701206301,-114.06954115933614, 51.045989967630504,-114.06916841764787, 51.04622270426168,-114.06873872886534, 51.04621563255485,-114.06876781265126, 51.04581851043601,-114.06879731695042, 51.045821039888025,-114.06879731695042, 51.045821461463326
];
var HomeOil11Coords = [
  -114.06879731695042, 51.045821461463326, -114.06948342421003,
  51.04583701206297, -114.06947410411078, 51.0459486533814, -114.06912684340814,
  51.046155252746246, -114.06877728561993, 51.046149445746174,
  -114.06879731695042, 51.045821461463326,
];
function ToggleInverseClipFloorPlanFeatureHomeOilTower() {
  if (!FloorPlanInverseClippingEnabledHomeOilTower) {
    currentFloor = "Home-11";
    createFloorPlanHomeOil11();
    $("#viewerController").css("width", "230px");
    $("#floorview").css("display", "block");
    if ($("#ClippingFloorPlanToggle").hasClass("active")) {
      ToggleInverseClipFloorPlanFeature();
    }
    if ($("#ClippingFloorPlanToggleTDTower").hasClass("active")) {
      ToggleInverseClipFloorPlanFeatureTDTower37();
    }
   /* 
    var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
    baseLayerPickerViewModel.selectedImagery =
      baseLayerPickerViewModel.imageryProviderViewModels[0];
    */
    const position = new Cesium.Cartesian3(
      -1639015.2791109316,
      -3669374.3322468605,
      4937674.225826076
    );
    var latlonObj = CartesianToLatlon(position);
    const newPosition = Cesium.Cartographic.toCartesian(
      new Cesium.Cartographic.fromDegrees(
        parseFloat(latlonObj.lon),
        parseFloat(latlonObj.lat),
        0
      )
    );

    modelEntityClippingPlanes.unionClippingRegions = false;

    modelEntityClippingPlanes.modelMatrix =
      Cesium.Transforms.eastNorthUpToFixedFrame(newPosition);

    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 1093)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), -50)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), -50)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), -20)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), -19)
    );
    googleTileset.clippingPlanes = modelEntityClippingPlanes;
  } else {
    currentFloor = null;
    $("#viewerController").css("width", "150px");
    $("#floorview").css("display", "none");
    modelEntityClippingPlanes.removeAll();
	modelEntityClippingPlanes.unionClippingRegions = true;
    viewer.entities.removeById("clipHandle-HomeOilTower11");
    viewer.entities.removeById("clk1");
    viewer.entities.removeById("clk2");
    viewer.entities.removeById("clk3");
    floorView = false;
    IsFloorViewRotate = false;
    if (typeof unsubscribeFloorView != "undefined" && unsubscribeFloorView !== null) {
      unsubscribeFloorView();
    }
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    $("#floorview").css("border-color", "white");
    $("#floorview").css("color", "white");
    activeTool.splice(activeTool.indexOf("floorview"), 1);
  }
  FloorPlanInverseClippingEnabledHomeOilTower =
    !FloorPlanInverseClippingEnabledHomeOilTower;
  $("#ClippingFloorPlanToggleHomeOilTower").toggleClass("active");
}

var FloorPlanInverseClippingEnabledTDTower37 = false;
var TDTower37ClipCoords = [
  -114.07124465699005, 51.046306313344665,-114.07124564083543, 51.04634146625786,-114.07131594548193, 51.04634229014503,-114.07131841073418, 51.04638011062709,-114.07141573865627, 51.046379424705485,-114.07142746991414, 51.04656545350314,-114.0714293148599, 51.04659710775209,-114.07136992078763, 51.04659784059912,-114.07137183464505, 51.04663850225933,-114.0712955568531, 51.04663728919286,-114.07129797126619, 51.046688381907174,-114.0705948116284, 51.04669833601207,-114.07058666122796, 51.04662366889923,-114.07055834431134, 51.04662377309863,-114.07053235549351, 51.04662362395779,-114.07053106720817, 51.04659569662236,-114.07052981277236, 51.046582952354534,-114.07046470538387, 51.04658268473292,-114.07047147430094, 51.04635652465516,-114.07057086503379, 51.04635907165994,-114.07056976136468, 51.04631462671813,-114.07065639792475, 51.046315974976785,-114.07065668135078, 51.0462669478605,-114.07124733919906, 51.04627511708729,-114.07124465699005, 51.046306313344665
];
var TDTower37Coords = [
  -114.071236610363, 51.04630715648646, -114.07123222979035, 51.046348632957226,
  -114.07129985222784, 51.04635114312626, -114.07129695306206, 51.0463898067414,
  -114.07136276502824, 51.04639207181084, -114.07135002112884,
  51.046563556444596, -114.07134985441783, 51.04656317149497,
  -114.07128811341268, 51.04655989944106, -114.07128600395657,
  51.046598453293434, -114.07121140254526, 51.04659724022585,
  -114.07120811726419, 51.04664158789922, -114.07066052574928,
  51.04662414010162, -114.07066209835651, 51.04658636011487,
  -114.07061265904389, 51.04658477804092, -114.07061282176396, 51.0465802024318,
  -114.07060449267995, 51.04657841232006, -114.07060558517703,
  51.04653953079039, -114.07053611919889, 51.046536522971444,
  -114.07055059946688, 51.046365377633535, -114.07061176872126,
  51.04636665992692, -114.0706187116792, 51.046323058133915,
  -114.07068120835812, 51.046329043670234, -114.07068752675445,
  51.04628886956073, -114.071236610363, 51.04630715648646,
];
function ToggleInverseClipFloorPlanFeatureTDTower37() {
  if (!FloorPlanInverseClippingEnabledTDTower37) {
    currentFloor = "TD-37";
    createFloorPlanTDTower37();
    $("#viewerController").css("width", "230px");
    $("#floorview").css("display", "block");
    if ($("#ClippingFloorPlanToggle").hasClass("active")) {
      ToggleInverseClipFloorPlanFeature();
    }
    if ($("#ClippingFloorPlanToggleHomeOilTower").hasClass("active")) {
      ToggleInverseClipFloorPlanFeatureHomeOilTower();
    }
   /* 
    var baseLayerPickerViewModel = viewer.baseLayerPicker.viewModel;
    baseLayerPickerViewModel.selectedImagery =
      baseLayerPickerViewModel.imageryProviderViewModels[0];
    */
    const position = new Cesium.Cartesian3(
      -1639119.0704856256,
      -3669290.4145529843,
      4937714.540882989
    );
    var latlonObj = CartesianToLatlon(position);
    const newPosition = Cesium.Cartographic.toCartesian(
      new Cesium.Cartographic.fromDegrees(
        parseFloat(latlonObj.lon),
        parseFloat(latlonObj.lat),
        0
      )
    );

    modelEntityClippingPlanes.unionClippingRegions = false;

    modelEntityClippingPlanes.modelMatrix =
      Cesium.Transforms.eastNorthUpToFixedFrame(newPosition);

    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 1159)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), -50)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), -50)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), -30)
    );
    modelEntityClippingPlanes.add(
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), -19)
    );
    googleTileset.clippingPlanes = modelEntityClippingPlanes;
  } else {
    currentFloor = null;
    $("#viewerController").css("width", "150px");
    $("#floorview").css("display", "none");
    modelEntityClippingPlanes.removeAll();
	modelEntityClippingPlanes.unionClippingRegions = true;
    viewer.entities.removeById("clipHandle-TDTower37");
    viewer.entities.removeById("clk1");
    viewer.entities.removeById("clk2");
    viewer.entities.removeById("clk3");
    floorView = false;
    IsFloorViewRotate = false;
    if (typeof unsubscribeFloorView != "undefined" && unsubscribeFloorView !== null) {
      unsubscribeFloorView();
    }
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    $("#floorview").css("border-color", "white");
    $("#floorview").css("color", "white");
    activeTool.splice(activeTool.indexOf("floorview"), 1);
  }
  FloorPlanInverseClippingEnabledTDTower37 =
    !FloorPlanInverseClippingEnabledTDTower37;
  $("#ClippingFloorPlanToggleTDTower").toggleClass("active");
}


function createFloorPlanDomeTower27(adjustment = 0) {
  var rot = 3;
  viewer.entities.removeById("clipHandle-DomeTower27");
  viewer.entities.add({
    id: "clipHandle-DomeTower27",
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray(DomeTower27Coords)
      ),
      material: "./floorplans/DomeTower-27.png",
      rotation: Cesium.Math.toRadians(rot),
      stRotation: Cesium.Math.toRadians(rot),
      height: 1134.15 + adjustment,
      extrudedHeight: 1134 + adjustment,
    },
  });
}

function createFloorPlanHomeOil11(adjustment = 0) {
  var rot = 2;
  viewer.entities.removeById("clipHandle-HomeOilTower11");
  viewer.entities.add({
    id: "clipHandle-HomeOilTower11",
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray(HomeOil11Coords)
      ),
      material: "./floorplans/HomeOilTower-11.png",
      rotation: Cesium.Math.toRadians(rot),
      stRotation: Cesium.Math.toRadians(rot),
      height: 1093.15 + adjustment,
      extrudedHeight: 1093 + adjustment,
    },
  });
}

function createFloorPlanTDTower37(adjustment = 0) {
  var rot = 2;
  viewer.entities.removeById("clipHandle-TDTower37");
  viewer.entities.add({
    id: "clipHandle-TDTower37",
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray(TDTower37Coords)
      ),
      material: "./floorplans/TDTower-37.png",
      rotation: Cesium.Math.toRadians(rot),
      stRotation: Cesium.Math.toRadians(rot),
      height: 1159.3 + adjustment,
      extrudedHeight: 1159 + adjustment,
    },
  });
}