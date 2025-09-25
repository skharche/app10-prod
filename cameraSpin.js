/**		Camera Spin		**/

//Define Timer Controls
//var start = Cesium.JulianDate.fromDate(new Date(2018, 1, 9, 16));
/*
//var start = Cesium.JulianDate.fromDate(new Date());
//var date = new Date(new Date().setDate(new Date().getDate() - 30));
var start = Cesium.JulianDate.fromDate(new Date(new Date().setDate(new Date().getDate() - 150)));
var stop = Cesium.JulianDate.addDays(start, 150, new Cesium.JulianDate());

//Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 5;

//Set timeline to simulation bounds
viewer.timeline.zoomTo(start, stop); */
var cylinderEntity = null;
var spinEntity = null;

function enableSpinForBuilding(idtbuilding, centroidLon, centroidLat, height, customRadius = false, radiansOffset = 0, typeOfSpin = "")
{
	if(window.start == null || window.stop == null)
	{
		setClockTime();
	}
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 10));
	
	if(window.startCameraRotation)
	{
		if(idtbuilding > 0)//Means Info SLide
		{
			$(".infoToggleSpin").removeClass("btn-primary");
			$(".infoToggleSpin").addClass("btn-grey");
		}
		window.startCameraRotation = false;
		return "";
	}
	
	$(".infoToggleSpin").addClass("btn-primary");
	$(".infoToggleSpin").removeClass("btn-grey");
	
	var radius = 0.004;
	if(height < 100)
	{
		radius = 0.002;
		height = 100 + parseInt(height);
	}
	
	if(customRadius != false)
		radius = customRadius;
	
	tempHt = height/1.5;
	if(typeOfSpin == "spin1")
		tempHt = 20;
	//Create Centroid
	cylinderEntity = viewer.entities.add({
		name : 'Green cylinder with black outline',
		position: Cesium.Cartesian3.fromDegrees(centroidLon, centroidLat, tempHt),
		cylinder : {
			length : 10.0,
			topRadius : 10.0,
			bottomRadius : 10.0,
			material : Cesium.Color.GREEN.withAlpha(0.01)
		},
		show:false
	});
	
	//New way to work for entire timeline
	var property = new Cesium.SampledPositionProperty();
	var degStep = 0;
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 4, 02));
	viewer.clock.startTime = start.clone();
	viewer.clock.currentTime = start.clone();
	positionsArray = [];
	for(var i = 0; i < 360; i += 5)//15 days seconds
	{
		var radians = Cesium.Math.toRadians(i);
		radians = radians + radiansOffset;
		var time = Cesium.JulianDate.addSeconds(start, i*2, new Cesium.JulianDate());
		positionsArray.push( Cesium.Cartesian3.fromDegrees(centroidLon + (radius * 1 * Math.cos(radians)), centroidLat + (radius * Math.sin(radians)), (parseInt(height) + (parseInt(height)*0.5))));
	}
	
	/* $.each(customSpin1Positions, function (JK, EX){
		positionsArray.push( Cesium.Cartesian3.fromDegrees(EX[0], EX[1], (parseInt(height) + (parseInt(height)*0.5))));
	}); */
	
	positionSequence = 0;
	pos = null;
	$.each(window.pts, function (KJ, EX){
		EX.show = false;
	});
	window.pts = [];
	for(var i = 0; i <= 1296000; i+=100)//15 days seconds
	{
		if(typeof positionsArray[positionSequence] != "undefined")
		{
			pos = positionsArray[positionSequence];
		}
		//Also create a point for each sample we generate.
		en = viewer.entities.add({
			position : pos,
			point : {
				pixelSize : 8,
				color : Cesium.Color.TRANSPARENT,
				outlineColor : Cesium.Color.YELLOW,
				outlineWidth : 3
			},
			show:false
		});
		window.pts.push(en);
		var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
		property.addSample(time, pos);
		positionSequence++;
		if(typeof positionsArray[positionSequence] == "undefined")
			positionSequence = 0;
	}
	
	//Actually create the spinEntity
	spinEntity = viewer.entities.add({

		//Set the spinEntity availability to the same interval as the simulation time.
		availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
			start : start,
			stop : stop
		})]),
		show : false,
		//Use our computed positions
		position : property,

		//Automatically compute orientation based on position movement.
		orientation : new Cesium.VelocityOrientationProperty(property),

		//Load the Cesium plane model to represent the spinEntity
		/* model : {
			uri : '../SampleData/models/CesiumAir/Cesium_Air.glb',
			minimumPixelSize : 64
		}, */

		//Show the path as a pink line sampled in 1 second increments.
		path : {
			resolution : 1,
			material : new Cesium.PolylineGlowMaterialProperty({
				glowPower : 0.1,
				color : Cesium.Color.YELLOW
			}),
			width : 10
		}
	});
	
	startCameraRotation = true;
	viewer.clock.multiplier = 100;//To Speed Up
	
	/* setTimeout(function(){
	spinEntity.position.setInterpolationOptions({
	  interpolationDegree: 10,
	  interpolationAlgorithm:
		Cesium.LagrangePolynomialApproximation,
	});
	},5000); */
}

window.start = null;
window.stop = null;
function setClockTime() {
	
	var d = new Date();
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 10));
	window.stop = Cesium.JulianDate.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 16));
	
	//Make sure viewer is at the desired time.
	viewer.clock.startTime = start.clone();
	viewer.clock.stopTime = stop.clone();
	viewer.clock.currentTime = start.clone();
	viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
	viewer.clock.multiplier = 5;

	//Set timeline to simulation bounds
	viewer.timeline.zoomTo(start, stop);
	
}

	//Input as two Points in LON, LAT format
	function prepareHorizonCameraView(pt1 = null, pt2 = null, ht = null)
	{
		if(pt1 == null || pt2 == null || ht == null)
		{
			var pt1 = getCentroid(eval("["+window.clippingBuildingPartialInUse.coords+"]"));
			var pt2 = getCentroid(eval("["+window.allBuildingsData[window.clippingBuildingInUse].coords+"]"));
			var ht = parseFloat(clippingBuildingPartialInUse.bottomfloorheight) + parseFloat(clippingBuildingPartialInUse.floorheight) + 4;
		}
		
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
	
	/**
	*	23/09
	*	Function to have Pano View, Pass on patameters
	**/
	window.spEntity = null;
	window.eyeEntity = null;
	function executePanoView(eyePt, pt1, pt2, ht, sampledProperty = null)
	{
		console.log("In Execute Pano View");
		console.log(eyePt, pt1, pt2, ht, sampledProperty);
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
			var property = sampledProperty;//Sampled property is point collection
		}

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
		  
		  show : false,//SK: NOT SHOWING THE PATH

		  //Use our computed positions
		  position: property,

		  //Automatically compute orientation based on position movement.
		  orientation: new Cesium.VelocityOrientationProperty(position),

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
			show: false
		});
		
		console.log("eyeEntity");
		console.log(eyeEntity);
		
		window.panoViewEnabled = true;
	}
	
function toggleSpin()
{
	startCameraRotation = !startCameraRotation;
	startCameraRotation2 = false;
}

window.toggleSpin2Coordinates = null;
window.cameraS2Speed = 0.001;
window.cameraSpinS2Initialized = false;
function playPauseSpin2(resetPlayPause = false)
{
	if($(".spin2PlayPause").hasClass("fa-pause"))
	{
		//Pause Spin2
		window.startCameraRotation2 = false;
		$(".spin2PlayPause").addClass("fa-play");
		$(".spin2PlayPause").removeClass("fa-pause");
	}
	else
	{
		//Start Spin2
		window.startCameraRotation2 = true;
		$(".spin2PlayPause").addClass("fa-pause");
		$(".spin2PlayPause").removeClass("fa-play");
	}
	if(resetPlayPause)
	{
		$(".spin2PlayPause").addClass("fa-pause");
		$(".spin2PlayPause").removeClass("fa-play");
	}
}

function stopLastSpinToggle(resetValue = true)
{
	if(resetValue)
		$("#subviews").val("");
	$("#stopSpinToggle").addClass("hide");
	if(startCameraRotation)
		forceStopSpin1();
	if(window.newSpin3InProgress)
		forceStopSpin3();
	if(window.cameraSpinS2Initialized)
		forceStopSpin2();
}

function toggleSpin2()
{
	//Spin1 and Spin3 disabled
	if(startCameraRotation)
		forceStopSpin1();
	if(window.newSpin3InProgress)
		forceStopSpin3();
	viewer.clock.multiplier = 5;//To Speed Up
	//window.startCameraRotation2 = !window.startCameraRotation2;
	//$(".downtownSpin2ViewButton").toggleClass("enabledHeaderRow enabledOtherHeaderRow");
	if(!$(".downtownSpin2ViewButton").hasClass("enabledOtherHeaderRow"))
	{
		if(!window.cameraSpinS2Initialized)
		{
			window.startCameraRotation2 = true;
			$(".downtownSpin2ViewButton").addClass("enabledHeaderRow enabledOtherHeaderRow")
			$(".headerRightLabelCAM").removeClass("hide");
			
			/* var center = Cesium.Cartesian3.fromDegrees(-74.01287854035964, 40.714821838093066, 200);
			var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
			viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(177.088, -18.34048, 200)); */
			
			var center = Cesium.Cartesian3.fromRadians(-1.291729874078671, 0.7105521771565355, 750);
			var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
			viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(0, -Math.PI/4, 200));
			
			/* viewer.scene.camera.flyTo({
			  destination: Cesium.Cartesian3.fromDegrees(-74.00977532531365, 40.72691005348416, 463.4365581135317),
			  orientation: {
				heading: Cesium.Math.toRadians(177.088),
				pitch: Cesium.Math.toRadians(-18.34048),
			  },
			  duration:0
			}); */
			//flyToIdtcamera(window.submarketDetails[7].idtcamera);
			//flyToCamera(40.72691005348416, -74.00977532531365, 463.4365581135317, 177.0881269629247, 71.65951952762478, -18.340480472375212, 0.010167630524989858, 0, viewer.scene.camera);
			flyToCamera(submarketDetails[7].latitude, submarketDetails[7].longitude, submarketDetails[7].altitude, submarketDetails[7].heading, submarketDetails[7].tilt, submarketDetails[7].pitch, submarketDetails[7].roll, 0, viewer.scene.camera);
			window.cameraSpinS2Initialized = true;
		}
		else
		{
			//viewer.timeline._clock._multiplier = window.lastClockSpeed;
		}
		
		/* if(window.toggleSpin2Coordinates == null)
		{
			
		}
		else
		{
			viewer.scene.camera.flyTo({
			  destination: Cesium.Cartesian3.fromDegrees(window.toggleSpin2Coordinates.lon, window.toggleSpin2Coordinates.lat, window.toggleSpin2Coordinates.alt),
			  orientation: {
				heading: Cesium.Math.toRadians(window.toggleSpin2Coordinates.heading),
				pitch: Cesium.Math.toRadians(window.toggleSpin2Coordinates.pitch),
			  },
			  duration:0
			}); 

			var center = Cesium.Cartesian3.fromRadians(-1.291729874078671, 0.7105521771565355, 750);
			var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
			viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(0, -Math.PI/4, 200));
		} */
	}
	else
	{
		$(".downtownSpin2ViewButton").removeClass("enabledHeaderRow")
		$(".downtownSpin2ViewButton").removeClass("enabledOtherHeaderRow")
		window.startCameraRotation2 = false;
		playPauseSpin2(true);
		spin2ResetView();
		//viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	}
}

function spin2ResetView()
{
	if(window.startCameraRotation2 == true)
		window.startCameraRotation2 = false;
	$(".downtownSpin2ViewButton").removeClass("enabledHeaderRow enabledOtherHeaderRow");
	viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	$('.headerRightLabelCAM').addClass('hide');
	window.cameraSpinS2Initialized = false;
}

	var isLockedToCenter = true;
	var startCameraRotation = false;
	var startCameraRotation2 = false;
	window.currentDate = null;
	window.dateProgressing = true;
	window.resiRentalDatesDone = [];//This is for Progressive
	window.lastTimelineDate = null;
	window.panoViewEnabled = false;
	viewer.clock.onTick.addEventListener(function(clock) {
		
		if(window.clearFogSmoothFlag == true)
		{
			if(window.smoothFogAlphaStepAfter >= window.smoothFogAlphaStepAfterMax)
			{
				window.smoothFogAlphaStepAfter = 0;
				window.smoothFogAlpha = window.smoothFogAlpha - window.smoothFogAlphaStep;
				//console.log(window.smoothFogAlpha);
				if(window.smoothFogAlpha > 0)
				{
					$.each(window.submarketDetails, function (index, sub){
						if(typeof index != "undefined" && typeof sub != "undefined")
						{
							if(typeof viewer.entities.getById("submarketFogHighlight"+index) != "undefined")
								viewer.entities.getById("submarketFogHighlight"+index).polygon.material.color = Cesium.Color.WHITE.withAlpha( window.smoothFogAlpha );
						}
					});
				}
				else
				{
					$.each(window.submarketDetails, function (index, sub){
						if(typeof index != "undefined" && typeof sub != "undefined")
						{
							if(typeof viewer.entities.getById("submarketFogHighlight"+index) != "undefined")
								viewer.entities.removeById("submarketFogHighlight"+index);
						}
					});
					window.clearFogSmoothFlag = false;
				}
			}
			else
			{
				window.smoothFogAlphaStepAfter++;
			}
		}
		
		if(window.createFadeInFogEffect == true)
		{
			//Fix for wrong behaviour
			if(window.clearFogSmoothFlag)
			{
				$.each(window.submarketDetails, function (index, sub){
					if(typeof index != "undefined" && typeof sub != "undefined")
					{
						if(typeof viewer.entities.getById("submarketFogHighlight"+index) != "undefined")
							viewer.entities.removeById("submarketFogHighlight"+index);
					}
				});
				window.clearFogSmoothFlag = false;
			}
			//console.log("In createFadeInFogEffect");
			if(window.smoothFogAlphaStepAfter >= window.smoothFogAlphaStepAfterMax)
			{
				window.smoothFogAlphaStepAfter = 0;
				window.smoothFogAlpha = window.smoothFogAlpha + window.smoothFogAlphaStep;
				//console.log(window.smoothFogAlpha);
				if(window.smoothFogAlpha <= window.fogEffectAlpha)
				{
					$.each(window.submarketDetails, function (index, sub){
						if(typeof index != "undefined" && typeof sub != "undefined")
						{
							if(typeof viewer.entities.getById("submarketFogHighlight"+index) != "undefined")
								viewer.entities.getById("submarketFogHighlight"+index).polygon.material.color = Cesium.Color.WHITE.withAlpha( window.smoothFogAlpha );
						}
					});
				}
				else
				{
					window.createFadeInFogEffect = false;
				}
			}
			else
			{
				window.smoothFogAlphaStepAfter++;
			}
		}
		
		//console.log("In Tick");
		if($(".submarketOutlineSwitch").hasClass("fa-toggle-on"))
		{
			adjustSubmarketLabelFonts();
		}
		
		if(window.infoboxLineBeingDisplayed)
		{
			window.infoboxWindowRight = window.innerWidth;
			window.infoboxWindowTop = 90;
			if($("#submarketStatistics").css("display") == "block")
			{
				var ht = parseInt($("#submarketStatistics").css("height"));
				if( ht > 0 )
				{
					window.infoboxWindowTop = window.infoboxWindowTop + ht - 12;
				}
				if($("#sidebar").hasClass("active"))
					window.infoboxWindowRight = window.infoboxWindowRight - parseInt($("#submarketStatistics").css("width").replace("px","")) - 320;
				else
					window.infoboxWindowRight = window.infoboxWindowRight - parseInt($("#submarketStatistics").css("width").replace("px",""));
				
				window.infoboxWindowRight = window.infoboxWindowRight;// - 17;
				console.log(window.infoboxWindowRight+", "+window.infoboxWindowTop);
			}
			
			adjustInfoboxLine();
		}
		
		if(window.submarketInfoboxLineBeingDisplayed)
		{
			//$("#arrowIndicators").attr("width", window.innerWidth+"px");
			/* window.infoboxWindowRight = window.innerWidth;
			window.infoboxWindowTop = 90;
			if($("#submarketStatistics").css("display") == "block")
			{
				var ht = parseInt($("#submarketStatistics").css("height"));
				if( ht > 0 )
				{
					window.infoboxWindowTop = window.infoboxWindowTop + ht - 12;
				}
				if($("#sidebar").hasClass("active"))
					window.infoboxWindowRight = window.infoboxWindowRight - parseInt($("#submarketStatistics").css("width").replace("px","")) - 320;
				else
					window.infoboxWindowRight = window.infoboxWindowRight - parseInt($("#submarketStatistics").css("width").replace("px",""));
				
				window.infoboxWindowRight = window.infoboxWindowRight;// - 17;
				console.log(window.infoboxWindowRight+", "+window.infoboxWindowTop);
			} */
			
			adjustSubmarketInfoboxLine();
		}
		
		if(window.panoViewEnabled == true)
		{
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
		/*
		if(viewer.clock.multiplier < 0)
			window.dateProgressing = false;
		else if(viewer.clock.multiplier > 0)
			window.dateProgressing = true;
		var anotherCheckForDateProgressing = true;
		//console.log("Date Check 1 " + new Date(window.currentDate).getTime() > new Date(temp.substr(0, 10)).getTime());
		//console.log("Date Check 2 " + new Date(window.currentDate).getTime() < new Date(temp.substr(0, 10)).getTime());
		if(window.dateProgressing == true && new Date(window.currentDate).getTime() > new Date(temp.substr(0, 10)).getTime())
		{
			anotherCheckForDateProgressing = false;
			window.dateProgressing = false;
			window.resiRentalDatesDone = [];
			console.log("Proceeding");
		}
		else if(window.dateProgressing == false && new Date(window.currentDate).getTime() < new Date(temp.substr(0, 10)).getTime())
		{
			window.dateProgressing = true;
			window.resiRentalDatesDone = [];
			console.log("Reverse");
		}
		*/
		
		var temp = viewer.clock.currentTime.toString();
		//Another check for Drag operation
		
		window.currentDate = temp.substr(0, 10);
		//console.log(window.currentDate);
		if(window.lastTimelineDate == null)
		{
			//First time
			window.dateProgressing = true;
			window.resiRentalDatesDone = [];
		}
		else
		{
			if(new Date(window.lastTimelineDate).getTime() != new Date(temp).getTime())
			{
				//console.log(new Date(window.lastTimelineDate).getTime() + " < " + new Date(temp).getTime());
				if(new Date(window.lastTimelineDate).getTime() < new Date(temp).getTime())
				{
					//console.log(">>>>>>>>>>>>>");
					if(window.dateProgressing == false)//Means it was running in other direction
						window.resiRentalDatesDone = [];
					window.dateProgressing = true;
				}
				else
				{
					//console.log("<<<<<<<<<<<<<");
					if(window.dateProgressing == true)//Means it was running in other direction
						window.resiRentalDatesDone = [];
					window.dateProgressing = false;
				}
			}
		}
		window.lastTimelineDate = temp;
		/* if((window.dateProgressing == true && viewer.clock.multiplier < 0) || (window.dateProgressing == false && viewer.clock.multiplier > 0))
		{
			window.resiRentalDatesDone = [];//Resetting Dates Done for other direction
		} */
		
		if( typeof window.pptSteps[window.currentStep-1] != "undefined" && window.pptSteps[window.currentStep-1].action == "residentialRentalHighlightDateFilter")
		{
			if($("#stepVisible"+window.resirentalDateFilterIndex).is(":checked") == true)
			if(typeof window.resiRentalDatesDone[window.currentDate] == "undefined")
			{
				window.resiRentalDatesDone[window.currentDate] = 1;//This means that date is highlighted
				console.log('i m in tick menu and '+ window.currentDate);
				//console.log(window.currentDate);
				//clearResidentialRentalHighlight("", "", true);
				//residentialRentalHighlightDateFilter("", "", "");
				adjustResidentialRentalHighlightWithDateFilter();
			}
		}

		if(window.startCameraRotation2)
		{
			console.log("tick in SPin 2 ");
			//window.toggleSpin2Coordinates
			viewer.scene.camera.rotateRight(viewer.timeline._clock._multiplier / 5 * window.cameraS2Speed);
			return "";
		}
		
		
	});

	/* if(typeof spinEntity != "undefined" && spinEntity != null)
		spinEntity.position.setInterpolationOptions({
			interpolationDegree : 10,
			interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
		}); */
		
		