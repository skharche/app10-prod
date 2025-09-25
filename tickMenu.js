var tiksVal = 50;	
window.tickCameraSpeed = 100;
function initiateMotion(direction)
{
	return;
	if(typeof window.rightTicks == "undefined")
	{
		window.rightTicks = 0;
	}
	//console.log("initiateRight() "+window.rightTicks);
	window.rightTicks++;
	if(window.rightTicks <= tiksVal)
	{
		$(".btn"+direction+"Motion").removeClass("btn-grey");
		$(".btn"+direction+"Motion").addClass("btn-primary");
		//console.log("clock onTick");
		if (false) {
			var width = canvas.width;
			var height = canvas.height;

			// Coordinate (0.0, 0.0) will be where the mouse was clicked.
			var x = (window.mousePosition.x - window.startMousePosition.x) / width;
			var y = -(window.mousePosition.y - window.startMousePosition.y) / height;

			var lookFactor = 0.05;
			camera.lookRight(x * lookFactor);
			camera.lookUp(y * lookFactor);
		}

		// Change movement speed based on the distance of the camera to the surface of the ellipsoid.
		var ellipsoid = viewer.scene.globe.ellipsoid;
		var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
		var moveRate = cameraHeight / parseInt($("#ticksCameraSpeed").val());
		
		//overriding speed 
		//moveRate = window.cameraSpeedDuration;
		console.log("moveRate "+moveRate);
		if(direction == 'Right')
		{
			camera.moveRight(moveRate);
			$(".ticksCounter").html(window.rightTicks+" Steps");
		}
		else if(direction == 'Left')
		{
			camera.moveLeft(moveRate);
			$(".ticksCounter").html(window.rightTicks+" Steps");
		}
		else if(direction == 'Up')
		{
			camera.moveUp(moveRate);
			$(".ticksCounter").html(window.rightTicks+" Steps");
		}
		else if(direction == 'Down')
		{
			camera.moveDown(moveRate);
			$(".ticksCounter").html(window.rightTicks+" Steps");
		}
		else if(direction == 'Forward')
		{
			camera.moveForward(moveRate);
			$(".ticksCounter").html(window.rightTicks+" Steps");
		}
		else if(direction == 'Backward')
		{
			camera.moveBackward(moveRate);
			$(".ticksCounter").html(window.rightTicks+" Steps");
		}
		
		setTimeout(function (){ initiateMotion(direction);}, $("#moveSpeed").val());
	}
	else
	{
		$(".btn"+direction+"Motion").addClass("btn-grey");
		$(".btn"+direction+"Motion").removeClass("btn-primary");
		window.rightTicks = 0;
	}
}

function incrementTicks()
{
	var v = parseFloat(tiksVal);
	v = v + 5;
	tiksVal = v;
	//$(".ticksVal").html(v);
}

function decrementTicks()
{
	var v = parseFloat(tiksVal);
	v = v - 5;
	tiksVal = v;
	//$(".ticksVal").html(v);
}

function decrementTickCameraSpeed()
{
	window.tickCameraSpeed = parseInt(window.tickCameraSpeed) + 10;
	//$(".cameraSpeedVal").html(window.tickCameraSpeed);
}

function incrementTickCameraSpeed()
{
	if(window.tickCameraSpeed > 10)
	{
		window.tickCameraSpeed = parseInt(window.tickCameraSpeed) - 10;
	}
	else
	{
		alert("Speed cant be more than this");
	}
	//$(".cameraSpeedVal").html(window.tickCameraSpeed);
}

//Keyboard Events

// disable the default event handlers
var canvas = viewer.canvas;
canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
canvas.onclick = function() {
    canvas.focus();
};

/* scene.screenSpaceCameraController.enableRotate = false;
scene.screenSpaceCameraController.enableTranslate = false;
scene.screenSpaceCameraController.enableZoom = false;
scene.screenSpaceCameraController.enableTilt = false;
scene.screenSpaceCameraController.enableLook = false; */

window.startMousePosition;
window.mousePosition;
window.flags = {
    toggleTileset : false,
    toggleFPS : false,
    toggleOrbit : false,
    moveUpsideDown : false,
    moveUpsideDown : false,
    looking : false,
    moveForward : false,
    moveBackward : false,
    moveNorth : false,
    moveUp : false,
    moveDown : false,
    moveLeft : false,
    moveRight : false
};

function getFlagForKeyCode(keyCode) {
	return;
	if(!$("#searchBox").is(':focus'))
	{
		switch (keyCode)
		{
			case 38:
				var tempId = selectedPrimitiveId.split("-");
				var nextId = 0;
				if(effectsArray[5] == 1)//Asset
				{
					moveSelectedFloorUp();
					nextId = parseInt(tempId[1]);
				}
				else if(effectsArray[4] == 1)//Floors Effect
				{
					moveSelectedFloorUp();
					nextId = parseInt(tempId[1]) - 1;
				}
					selectedPrimitive = floorPrimitives[nextId]._primitive;
					$.each(floorLabels, function (jk, tk){
						viewer.entities.getById(tk).show = false;
					});
					viewer.entities.getById("floorLabel-"+devSelectedBuilding+"-"+(nextId + 1)).show = true;
					//selectedPrimitive = null;
					//selectedPrimitiveId = null;
					$(".floorNumberRowTR").show();
					$(".floorNumberRowTD").html("<b>---> <span class='floorNumberDisplay'>"+(nextId + 1)+"</span></b>");
					
					selectedPrimitiveId = pickedObject.id;
					lastFloorSelected = selectedPrimitiveId._id;
				return 'moveForward';
			case 40:
				if(effectsArray[5] == 1)//Asset
				{
					moveSelectedFloorUp();
				}
				else if(effectsArray[4] == 1)//Floors Effect
				{
					
				}
				return 'moveBackward';
			
			default:
				return undefined;
		}
	}
	return;
	if(!$("#searchBox").is(':focus'))
	{
		switch (keyCode)
		{
			case 'A'.charCodeAt(0):
				return 'moveDown';
			case 'Q'.charCodeAt(0):
				return 'moveUp';
			case 38:
				return 'moveForward';
			case 40:
				return 'moveBackward';
			case 37:
				return 'moveLeft';
			case 39:
				return 'moveRight';
			case 78://N
				return 'moveNorth';
			case 82://$R
				return 'moveUpsideDown';
			/*
			case 84://T
				return 'toggleTileset';
			case 70://F
				return 'toggleFPS';
			case 32://Space
				return 'toggleOrbit';
			*/
			default:
				return undefined;
		}
	}
}

var clickHandler = new Cesium.ScreenSpaceEventHandler(canvas);

clickHandler.setInputAction(function(movement) {
    window.flags.looking = true;
    window.mousePosition = window.startMousePosition = Cesium.Cartesian3.clone(movement.position);
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

clickHandler.setInputAction(function(movement) {
    window.mousePosition = movement.endPosition;
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

clickHandler.setInputAction(function(position) {
    window.flags.looking = false;
}, Cesium.ScreenSpaceEventType.LEFT_UP);


document.addEventListener('keydown', function(e) {
    var flagName = getFlagForKeyCode(e.keyCode);
    if (typeof flagName !== 'undefined') {
        window.flags[flagName] = true;
    }
}, false);

document.addEventListener('keyup', function(e) {
    var flagName = getFlagForKeyCode(e.keyCode);
    if (typeof flagName !== 'undefined') {
        window.flags[flagName] = false;
    }
}, false);

viewer.clock.onTick.addEventListener(function(clock) {
	//console.log("Clock Tick Event");
	
    var camera = viewer.camera;

    /* if (window.flags.looking) {
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;

        // Coordinate (0.0, 0.0) will be where the mouse was clicked.
        var x = (window.mousePosition.x - window.startMousePosition.x) / width;
        var y = -(window.mousePosition.y - window.startMousePosition.y) / height;

        var lookFactor = 0.05;
        camera.lookRight(x * lookFactor);
        camera.lookUp(y * lookFactor);
    } */

    // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
	var ellipsoid = viewer.scene.globe.ellipsoid;
    var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
    var moveRate = cameraHeight / window.tickCameraSpeed;

    if (window.flags.moveForward) {
        camera.moveForward(moveRate);
    }
    if (window.flags.moveBackward) {
        camera.moveBackward(moveRate);
    }
    if (window.flags.moveUp) {
        camera.moveUp(moveRate);
    }
    if (window.flags.moveDown) {
        camera.moveDown(moveRate);
    }
    if (window.flags.moveLeft) {
        camera.moveLeft(moveRate);
    }
    if (window.flags.moveRight) {
        camera.moveRight(moveRate);
    }
	if(window.flags.moveNorth)
	{
		var camera = viewer.camera;

		camera.flyTo({
			destination: camera.positionWC,
			duration: window.cameraSpeedDuration,
			orientation: {
				heading : 0,
				pitch: camera.pitch,
				roll: camera.roll
			}
		});
	}
	if(window.flags.moveUpsideDown)
	{
		/* camera = viewer.camera;
		camera.setView({
			orientation: {
				heading : 0
			}
		}); */
		
		var camera = viewer.camera;

		camera.flyTo({
			destination: camera.positionWC,
			duration: window.cameraSpeedDuration,
			orientation: {
				heading : 0
			},
			duration: window.cameraSpeedDuration
		});
	}
});

document.addEventListener('keydown', (event) => {
	console.log(event.key);
	if(!$("#searchBox").is(':focus'))
	{
		if (event.ctrlKey && event.key === 'f') {
			event.preventDefault(); // Prevent the browser's default find action
			//	alert('CTRL + F was pressed!');
			
			//Toggle Search functionality
			console.log("Open Search Functionality");
			$("#searchBoxController").show();
			$("#searchBox").focus();
			setTimeout(function (){ $("#searchBox").focus(); }, 500);
		}
		else if($("#fullScreenModal").css("display") == 'block')
		{
			switch (event.key) {
				case 'Escape':
					$("#fullScreenModal").hide();
				break;
				case 'ArrowRight': // ArrowRight
					changeModalImage(null, 1);
				break;
				case 'ArrowLeft': // ArrowRight
					changeModalImage(null, -1);
				break;
				default:
					// Do nothing for other keys
					break;
			}
		}
		else
		{
			switch (event.key) {
				case 'Escape':
					//Clear search and its effect.
					console.log("Clear Search Functionality");
					$("#searchBoxController").hide();
					$("#searchBox").val();
					if(typeof suggestions != "undefined")
					{
						suggestions.innerHTML = "";
					}
				break;
				case 'ArrowDown':
					var tempId = null;
					var nextId = 0;
					if(effectsArray[5] == 1)//Asset
					{
						tempId = lastFloorSelected.split("-");
						//moveSelectedFloorUp();
						nextId = parseInt(tempId[2]) - 1;
						if(lastFloorSelected != null && typeof lastFloorSelected != "undefined")
						{
							if(typeof viewer.entities.getById(lastFloorSelected) != "undefined")
							{
								var clr = viewer.entities.getById(lastFloorSelected).polygon.material.color;
								if(typeof clr != "undefined")
								{
									if(clr._value.red == 1 && clr._value.green == 1)
									{
										viewer.entities.getById(lastFloorSelected).polygon.material.color = Cesium.Color.YELLOW.withAlpha(0.07);
									}
									else
									{
										viewer.entities.getById(lastFloorSelected).polygon.material.color = Cesium.Color.RED.withAlpha(0.07);
									}
								}
							}
						}
						clearSearchAndSettingBox();
						//selectedPrimitive = viewer.entities.getById(lastFloorSelected);
						lastFloorSelected = tempId[0]+"-"+tempId[1]+"-"+nextId;
						selectedPrimitiveId = viewer.entities.getById(lastFloorSelected);
						$(".floorNumberRowTR").show();
						$(".floorNumberRowTD").html("<b>---> <span class='floorNumberDisplay'>"+nextId+"</span></b>");
						//console.log(viewer.entities(pickedObject.id._id));
						//console.log(viewer.entities(pickedObject.id._id).material);
						var clr = viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color;
						
						if(clr._value.red == 1 && clr._value.green == 1)
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.YELLOW;
						}
						else
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.RED;
						}
						
						$.each(floorLabels, function (jk, tk){
							viewer.entities.getById(tk).show = false;
						});
						viewer.entities.getById("floorLabelAsset-"+devSelectedBuilding+"-"+nextId).show = true;
						
						
					}
					else if(effectsArray[4] == 1)//Floors Effect
					{
						tempId = selectedPrimitiveId.split("-");
						nextId = parseInt(tempId[1]) - 1;
						
						if(lastSelectedPrimitive != null)
						{
							var t = selectedPrimitiveId.split("-");
							
							var attributes = floorPrimitives[parseInt(t[1])-1].getGeometryInstanceAttributes(selectedPrimitiveId);
							//console.log(attributes.color);
							if(typeof attributes != "undefined")
							{
								attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 127];
								attributes.show = [1];
							}
						}
						
						selectedPrimitiveId = "floorRow-"+nextId;
						lastSelectedPrimitive = floorPrimitives[nextId-1];
						floorPrimitives[nextId-1].getGeometryInstanceAttributes("floorRow-"+nextId);
						attributes = floorPrimitives[nextId-1].getGeometryInstanceAttributes("floorRow-"+nextId);
						if(typeof attributes != "undefined")
						{
							selectedPrimitiveColor = attributes.color;
							attributes.color = [255, 255, 255, 255];
							attributes.show = [1];
						}
						$.each(floorLabels, function (jk, tk){
							viewer.entities.getById(tk).show = false;
						});
						viewer.entities.getById("floorLabel-"+devSelectedBuilding+"-"+nextId).show = true;
					}
					else if(effectsArray[7] == 1)//Floors Effect
					{
						tempId = selectedPrimitiveId.split("-");
						nextId = parseInt(tempId[1]) + 1;
						
						if(lastSelectedPrimitive != null && floorPrimitives.length > 0)
						{
							var t = selectedPrimitiveId.split("-");
							
							var attributes = floorPrimitives[parseInt(t[1])-1].getGeometryInstanceAttributes(selectedPrimitiveId);
							//console.log(attributes.color);
							if(typeof attributes != "undefined")
							{
								attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 127];
								attributes.show = [1];
							}
						}
						
						lastSelectedPrimitive = null;
						nextPrimitiveId = null;
						foundMatch = null;
						$.each(window.floorPlanPrimitivesIndexes, function (index2, eachFloorPrimitive){
							if(eachFloorPrimitive.id == selectedPrimitiveId && foundMatch == null)
							{
								foundMatch = true;
								if(typeof window.floorPlanPrimitivesIndexes[index2 + 1] != "undefined")
								{
									lastSelectedPrimitive = floorPlanPrimitives[window.floorPlanPrimitivesIndexes[index2+1].primitiveindex];
									selectedPrimitiveId = window.floorPlanPrimitivesIndexes[index2+1].id;
									$(".floorNumberDisplay").html(window.floorPlanPrimitivesIndexes[index2 + 1].floorNumber);
								}
							}
						});
						if(lastSelectedPrimitive != null)
						{
							lastSelectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
							attributes = lastSelectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
							if(typeof attributes != "undefined")
							{
								selectedPrimitiveColor = attributes.color;
								attributes.color = [255, 0, 0, 255];
								attributes.show = [1];
							}
						}
						
					}
						
						//Check for AOS primitives
					if(typeof aosPrimitives[devSelectedBuilding])
					{
						/*
						
						*/
						entityPicked = null;
						entityRowPicked = null;
						$.each(aosPrimitives[devSelectedBuilding], function (uIndex, row){
							if(row._primitive._instanceIds[0] == selectedPrimitiveId )
							{
								entityPicked = aosPrimitives[devSelectedBuilding][uIndex - 1];
								entityRowPicked = uIndex - 1;
							}
						});
						
						if(entityPicked != null)
						{
							resetLastSelectedPrimitive();
							
							selectedPrimitive = aosPrimitives[devSelectedBuilding][entityRowPicked]._primitive;
							selectedPrimitiveId = aosPrimitives[devSelectedBuilding][entityRowPicked]._primitive._instanceIds[0];
							var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
							console.log(attributes.color);
							if(typeof attributes != "undefined")
							{
								selectedPrimitiveColor = attributes.color;
								attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 255];
								attributes.show = [1];
							}
							check = selectedPrimitiveId.split("-");
							details = window.availableOfficeSpace[check[2]];
							allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
							var floorAltitude = details.extruded_height;
							if(floorAltitude == 0)
							{
								var flrht = details.floor_height;
								if(flrht == null || flrht == 0)
								{
									flrht = 3.5;
								}
								floorAltitude = parseFloat(flrht) * parseInt(details.floor_number);
							}
							
							prepareAvailableOfficeSpaceInfobox(check[1], check[2], details, allSuitesOnFloor);
							var temp = details.splitCoords.split(",");
							prepareLogoAndSqftLabels(selectedPrimitiveId, parseFloat(temp[1]), parseFloat(temp[0]), (floorAltitude + parseInt(cityAltitudeAdjustment[lastCityLoaded])), adminBaseUrl + details.companyimage, details.suite_area);
						}
					}
						if(typeof floorPrimitives[nextId] != "undefined")
						{
							selectedPrimitive = floorPrimitives[nextId]._primitive;
							$.each(floorLabels, function (jk, tk){
								viewer.entities.getById(tk).show = false;
							});
							viewer.entities.getById("floorLabel-"+devSelectedBuilding+"-"+nextId).show = true;
							//selectedPrimitive = null;
							//selectedPrimitiveId = null;
							$(".floorNumberRowTR").show();
							$(".floorNumberRowTD").html("<b>---> <span class='floorNumberDisplay'>"+nextId+"</span></b>");
						}
						
						//selectedPrimitiveId = pickedObject.id;
						//lastFloorSelected = selectedPrimitiveId._id;
						
					break;
				case 'ArrowLeft':
					if($("#panoButtonImageContainer").attr("src") == 'images/visibility-active.png')
					{
						panoCameraMovement(1);
					}
					break;
				case 'ArrowRight':
					if($("#panoButtonImageContainer").attr("src") == 'images/visibility-active.png')
					{
						panoCameraMovement(-1);
					}
					break;
				case 'ArrowUp':
					var tempId = null;
					var nextId = 0;
					if(effectsArray[5] == 1)//Asset
					{
						if(lastFloorSelected == null)
						{
							lastFloorSelected = "floor-"+devSelectedBuilding+"-0";
						}
						tempId = lastFloorSelected.split("-");
						//moveSelectedFloorUp();
						nextId = parseInt(tempId[2]) + 1;
						if(lastFloorSelected != null && typeof lastFloorSelected != "undefined")
						{
							if(typeof viewer.entities.getById(lastFloorSelected) != "undefined")
							{
								var clr = viewer.entities.getById(lastFloorSelected).polygon.material.color;
								if(typeof clr != "undefined")
								{
									if(clr._value.red == 1 && clr._value.green == 1)
									{
										viewer.entities.getById(lastFloorSelected).polygon.material.color = Cesium.Color.YELLOW.withAlpha(0.07);
									}
									else
									{
										viewer.entities.getById(lastFloorSelected).polygon.material.color = Cesium.Color.RED.withAlpha(0.07);
									}
								}
							}
						}
						clearSearchAndSettingBox();
						//selectedPrimitive = viewer.entities.getById(lastFloorSelected);
						lastFloorSelected = tempId[0]+"-"+tempId[1]+"-"+nextId;
						selectedPrimitiveId = viewer.entities.getById(lastFloorSelected);
						$(".floorNumberRowTR").show();
						$(".floorNumberRowTD").html("<b>---> <span class='floorNumberDisplay'>"+nextId+"</span></b>");
						//console.log(viewer.entities(pickedObject.id._id));
						//console.log(viewer.entities(pickedObject.id._id).material);
						var clr = viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color;
						
						if(clr._value.red == 1 && clr._value.green == 1)
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.YELLOW;
						}
						else
						{
							viewer.entities.getById(selectedPrimitiveId._id).polygon.material.color = Cesium.Color.RED;
						}
						
						$.each(floorLabels, function (jk, tk){
							viewer.entities.getById(tk).show = false;
						});
						viewer.entities.getById("floorLabelAsset-"+devSelectedBuilding+"-"+nextId).show = true;
						
					}
					else if(effectsArray[4] == 1)//Floors Effect
					{
						if(selectedPrimitiveId == null)
						{
							selectedPrimitiveId = 'floorRow-0';
						}
						tempId = selectedPrimitiveId.split("-");
						if(tempId[0] != "floorRow")
						{
							selectedPrimitiveId = 'floorRow-0';
							tempId = selectedPrimitiveId.split("-");
						}
							
						nextId = parseInt(tempId[1]) + 1;
						
						if(lastSelectedPrimitive != null)
						{
							var t = selectedPrimitiveId.split("-");
							
							var attributes = floorPrimitives[parseInt(t[1])-1].getGeometryInstanceAttributes(selectedPrimitiveId);
							//console.log(attributes.color);
							if(typeof attributes != "undefined")
							{
								attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 127];
								attributes.show = [1];
							}
						}
						
						selectedPrimitiveId = "floorRow-"+nextId;
						lastSelectedPrimitive = floorPrimitives[nextId-1];
						floorPrimitives[nextId-1].getGeometryInstanceAttributes("floorRow-"+nextId);
						attributes = floorPrimitives[nextId-1].getGeometryInstanceAttributes("floorRow-"+nextId);
						if(typeof attributes != "undefined")
						{
							selectedPrimitiveColor = attributes.color;
							attributes.color = [255, 255, 255, 255];
							attributes.show = [1];
						}
						$.each(floorLabels, function (jk, tk){
							viewer.entities.getById(tk).show = false;
						});
						viewer.entities.getById("floorLabel-"+devSelectedBuilding+"-"+nextId).show = true;
						
					}
					else if(effectsArray[7] == 1)//Floor plan
					{
						tempId = selectedPrimitiveId.split("-");
						nextId = parseInt(tempId[1]) + 1;
						
						if(lastSelectedPrimitive != null && floorPrimitives.length > 0)
						{
							var t = selectedPrimitiveId.split("-");
							
							var attributes = floorPrimitives[parseInt(t[1])-1].getGeometryInstanceAttributes(selectedPrimitiveId);
							//console.log(attributes.color);
							if(typeof attributes != "undefined")
							{
								attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 127];
								attributes.show = [1];
							}
						}
						
						lastSelectedPrimitive = null;
						nextPrimitiveId = null;
						foundMatch = null;
						$.each(window.floorPlanPrimitivesIndexes, function (index2, eachFloorPrimitive){
							if(eachFloorPrimitive.id == selectedPrimitiveId && foundMatch == null)
							{
								foundMatch = true;
								if(typeof window.floorPlanPrimitivesIndexes[index2 - 1] != "undefined")
								{
									lastSelectedPrimitive = floorPlanPrimitives[window.floorPlanPrimitivesIndexes[index2 - 1].primitiveindex];
									selectedPrimitiveId = window.floorPlanPrimitivesIndexes[index2 - 1].id;
									$(".floorNumberDisplay").html(window.floorPlanPrimitivesIndexes[index2 - 1].floorNumber);
								}
							}
						});
						
						if(lastSelectedPrimitive != null)
						{
							lastSelectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
							attributes = lastSelectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
							if(typeof attributes != "undefined")
							{
								selectedPrimitiveColor = attributes.color;
								attributes.color = [255, 0, 0, 255];
								attributes.show = [1];
							}
						}
					}
						
					//Check for AOS primitives
					if(typeof aosPrimitives[devSelectedBuilding])
					{
						/*
						
						*/
						entityPicked = null;
						entityRowPicked = null;
						$.each(aosPrimitives[devSelectedBuilding], function (uIndex, row){
							if(row._primitive._instanceIds[0] == selectedPrimitiveId && typeof aosPrimitives[devSelectedBuilding][uIndex+1] != "undefined")
							{
								entityPicked = aosPrimitives[devSelectedBuilding][uIndex + 1];
								entityRowPicked = uIndex + 1;
							}
						});
						
						if(entityPicked != null)
						{
							resetLastSelectedPrimitive();
							
							selectedPrimitive = aosPrimitives[devSelectedBuilding][entityRowPicked]._primitive;
							selectedPrimitiveId = aosPrimitives[devSelectedBuilding][entityRowPicked]._primitive._instanceIds[0];
							var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
							console.log(attributes.color);
							if(typeof attributes != "undefined")
							{
								selectedPrimitiveColor = attributes.color;
								attributes.color = [selectedPrimitiveColor[0], selectedPrimitiveColor[1], selectedPrimitiveColor[2], 255];
								attributes.show = [1];
							}
							check = selectedPrimitiveId.split("-");
							details = window.availableOfficeSpace[check[2]];
							var floorAltitude = details.extruded_height;
							if(floorAltitude == 0)
							{
								var flrht = details.floor_height;
								if(flrht == null || flrht == 0)
								{
									flrht = 3.5;
								}
								floorAltitude = parseFloat(flrht) * parseInt(details.floor_number);
							}
							allSuitesOnFloor = window.availableOfficeSpaceFloorWise[parseInt(details.idtbuilding)][parseInt(details.floor_number)];
							
							prepareAvailableOfficeSpaceInfobox(check[1], check[2], details, allSuitesOnFloor);
							var temp = details.splitCoords.split(",");
							prepareLogoAndSqftLabels(selectedPrimitiveId, parseFloat(temp[1]), parseFloat(temp[0]), (floorAltitude + parseInt(cityAltitudeAdjustment[lastCityLoaded])), adminBaseUrl + details.companyimage, details.suite_area);
						}
					}
						if(typeof floorPrimitives[nextId] != "undefined")
						{
							selectedPrimitive = floorPrimitives[nextId]._primitive;
							$.each(floorLabels, function (jk, tk){
								viewer.entities.getById(tk).show = false;
							});
							viewer.entities.getById("floorLabel-"+devSelectedBuilding+"-"+nextId).show = true;
							//selectedPrimitive = null;
							//selectedPrimitiveId = null;
							$(".floorNumberRowTR").show();
							$(".floorNumberRowTD").html("<b>---> <span class='floorNumberDisplay'>"+nextId+"</span></b>");
						}
						
						//selectedPrimitiveId = pickedObject.id;
						//lastFloorSelected = selectedPrimitiveId._id;
						
					break;
				case 'D':
				case 'd': // Handle Dark Overlay
					if(!darkOverlayEffectActive)
					{
						setResetSettingFlags("dark-overlay-li", true);
						createDarkOverlayEffect();
						return;
					}
					else
					{
						clearDarkOverlayEffect();
					}
					break;
				case 'T':
				case 't':
					googleTileset.show = !googleTileset.show;
					break;
				case 'W':
				case 'w':
					//viewer.entities.getById("FogEffectEntity").show = !viewer.entities.getById("FogEffectEntity").show;
					//setResetSettingFlags("White Overlay", viewer.scene.debugShowFramesPerSecond);
					//setResetSettingFlags("Dark Overlay", viewer.scene.debugShowFramesPerSecond);
					if(!whiteOverlayEffectActive)
					{
						setResetSettingFlags("white-overlay-li", true);
						createWhiteOverlayEffect();
						return;
					}
					else
					{
						clearWhiteOverlayEffect();
					}
					
					break;
				case 'R':
				case 'r':
					var camera = viewer.camera;

					camera.flyTo({
						destination: camera.positionWC,
						duration: window.cameraSpeedDuration,
						orientation: {
							heading : 0
						},
						duration: window.cameraSpeedDuration
					});
					break;
				case ' ': // Space key
					ToggleCameraRotationSlowly();
				break;
				/*
				case 'Control':
					case 'F':
					case 'f':
						//Toggle Search functionality
						console.log("Open Search Functionality");
						$("#searchBoxController").show();
						$("#searchBox").focus();
						setTimeout(function (){ $("#searchBox").focus(); }, 500);
						break;
					break;
					*/
					/*
				case 'F':
				case 'f': // To handle both uppercase and lowercase
					console.log("New Toggle Functionality");
					viewer.scene.debugShowFramesPerSecond = !viewer.scene.debugShowFramesPerSecond;
					setResetSettingFlags("fps-li", viewer.scene.debugShowFramesPerSecond);
					break;
				
				case 'ArrowRight': // ArrowRight
					if($("#fullScreenModal").css("display") == 'block')
					{
						changeModalImage(null, 1);
					}
				break;
				case 'ArrowLeft': // ArrowRight
					if($("#fullScreenModal").css("display") == 'block')
					{
						changeModalImage(null, -1);
					}
				break;
				*/
				default:
					// Do nothing for other keys
					break;
			}
		}
	}
});

function setResetSettingFlags(settingName, flag)
{
	if(flag == true)
	{
		$("#"+settingName).addClass("selected");
	}
	else
	{
		$("#"+settingName).removeClass("selected");
	}
	/*
	var dropdownItems2 = document.querySelectorAll('.dropdown2-menu');
	var atleastOneTick = false;
	dropdownItems2.forEach(item => {
		console.log(item);
		var checkAttr = item.attr('data-text');
		if(checkAttr == settingName)
		{
			if(flag == true)
			{
				
			}
			else if(flag == false)
			{
				
			}
		}
	});
	*/
}

document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', function (event) {
        event.preventDefault();

        const span = this.querySelector('span');

        // Toggle the visibility of the tick mark
        if (span.style.visibility === 'hidden') {
          span.style.visibility = 'visible';
        } else {
          span.style.visibility = 'hidden';
        }
      });

      // Initialize tick marks to hidden on page load
      item.querySelector('span').style.visibility = 'hidden';
    });
	
	
	