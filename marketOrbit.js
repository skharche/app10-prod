window.fixedOrbitInProgress = false;
window.fixedOrbitPaused = false;
// True from the moment StartFixedPointOrbit kicks off its initial flight
// until the orbit is actually ticking (fixedOrbitInProgress becomes true).
// Needed because clicking Market Orbit again during that flight used to look
// like starting fresh (fixedOrbitInProgress was still false), launching a
// second, colliding flight instead of being treated as "already active".
window.fixedOrbitStarting = false;
var unsubscribeFixedOrbit = null;
var fixedOrbitTargetEntity = null;
var fixedOrbitRotationSpeed = 0.0005;
var fixedOrbitBaseSpeed = 0.0005;
var fixedOrbitSpeedIndicatorTimeout = null;

// Current orbit target and the camera's live offset from it, in the target's
// local East-North-Up frame. Kept at module scope (not just inside a tick
// closure) so pause/resume and the wheel-zoom handler can all read/mutate the
// same state between ticks.
var fixedOrbitTarget = null;
var fixedOrbitLocalOffset = null;

// Bumped every time StopFixedPointOrbit() runs. The flyTo "complete" callbacks
// in StartFixedPointOrbit and ResumeFixedPointOrbit capture the id current at
// the moment they were kicked off and check it's still current before acting -
// otherwise a stop that happens mid-flight (e.g. double-click while resuming)
// would have its own async completion silently resurrect the orbit afterward.
var fixedOrbitSessionId = 0;

// Briefly shows the current orbit speed (as a multiple of the starting speed)
// in the bottom-right corner, then fades it back out after a moment.
function ShowOrbitSpeedIndicator() {
	return;
	var indicator = document.getElementById("fixedOrbitSpeedIndicator");
	if (!indicator) {
		indicator = document.createElement("div");
		indicator.id = "fixedOrbitSpeedIndicator";
		indicator.style.position = "fixed";
		indicator.style.right = "20px";
		indicator.style.bottom = "50px";
		indicator.style.padding = "6px 12px";
		indicator.style.background = "rgba(0, 0, 0, 0.7)";
		indicator.style.color = "#fff";
		indicator.style.fontFamily = "sans-serif";
		indicator.style.fontSize = "14px";
		indicator.style.borderRadius = "4px";
		indicator.style.zIndex = "9999";
		indicator.style.transition = "opacity 0.3s";
		indicator.style.pointerEvents = "none";
		document.body.appendChild(indicator);
	}

	indicator.textContent = "Orbit speed: " + fixedOrbitRotationSpeed;
	indicator.style.opacity = "1";

	if (fixedOrbitSpeedIndicatorTimeout != null)
		clearTimeout(fixedOrbitSpeedIndicatorTimeout);
	fixedOrbitSpeedIndicatorTimeout = setTimeout(function () {
		indicator.style.opacity = "0";
	}, 1200);
}

// While the market orbit is running, "+" doubles the rotation speed and "-"
// halves it (numpad or top-row, with or without Shift).
document.addEventListener("keydown", function (e) {
	if (!window.fixedOrbitInProgress)
		return;
	if (e.key === "+" || e.key === "=" || e.key === "Add") {
		fixedOrbitRotationSpeed *= 2;
		ShowOrbitSpeedIndicator();
	} else if (e.key === "-" || e.key === "_" || e.key === "Subtract") {
		fixedOrbitRotationSpeed /= 2;
		ShowOrbitSpeedIndicator();
	}
});

// Marks the orbit's pivot point with a cylinder so it's visible while tuning this.
function ShowFixedOrbitTargetMarker(position) {
	RemoveFixedOrbitTargetMarker();
	fixedOrbitTargetEntity = viewer.entities.add({
		name: "fixedOrbitTargetMarker",
		position: position,
		cylinder: {
			length: 200.0,
			topRadius: 8.0,
			bottomRadius: 8.0,
			material: Cesium.Color.RED.withAlpha(0.8),
			outline: true,
			outlineColor: Cesium.Color.BLACK,
		},
		show: window.cylinderToShow,
	});
}

function RemoveFixedOrbitTargetMarker() {
	if (fixedOrbitTargetEntity != null) {
		viewer.entities.remove(fixedOrbitTargetEntity);
		fixedOrbitTargetEntity = null;
	}
}

// Converts a camera position into an offset relative to a target point, in the
// target's local East-North-Up frame (x=east, y=north, z=up). camera.lookAt()
// accepts this Cartesian3 form directly (same frame), so feeding it straight
// back in reproduces the exact same camera position with zero jump - no angle
// convention to get wrong, unlike converting to a HeadingPitchRange first.
function getLocalOffsetFromTarget(target, position) {
	var offset = Cesium.Cartesian3.subtract(position, target, new Cesium.Cartesian3());
	var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(target);
	var enuInverse = Cesium.Matrix4.inverseTransformation(enuTransform, new Cesium.Matrix4());
	return Cesium.Matrix4.multiplyByPointAsVector(enuInverse, offset, new Cesium.Cartesian3());
}

// Computes the heading/pitch a camera at fromPosition needs in order to look
// directly at toPosition (compass bearing + elevation angle, in the same
// heading/pitch convention camera.setView/flyTo orientation expects).
function computeHeadingPitchLookingAt(fromPosition, toPosition) {
	var direction = Cesium.Cartesian3.subtract(toPosition, fromPosition, new Cesium.Cartesian3());
	var enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
	var enuInverse = Cesium.Matrix4.inverseTransformation(enuTransform, new Cesium.Matrix4());
	var localDirection = Cesium.Matrix4.multiplyByPointAsVector(enuInverse, direction, new Cesium.Cartesian3());
	Cesium.Cartesian3.normalize(localDirection, localDirection);

	return {
		heading: Math.atan2(localDirection.x, localDirection.y),
		pitch: Math.asin(localDirection.z),
	};
}

function SetMarketOrbitIcon(src) {
	var el = document.getElementById("autoRotateZoom");
	if (el != null)
		el.src = src;
}

// Mouse wheel while a market orbit is actively running zooms by shrinking/
// growing the camera's offset from the target - i.e. the orbit's radius/
// height - instead of Cesium's normal camera zoom. While paused, native
// camera control (including its normal zoom) is handed back instead, so this
// stays out of the way.
var FIXED_ORBIT_MIN_RANGE = 10.0;
function onFixedOrbitWheel(event) {
	if (!window.fixedOrbitInProgress || window.fixedOrbitPaused || fixedOrbitLocalOffset == null)
		return;
	event.preventDefault();

	var zoomFactor = event.deltaY > 0 ? 1.1 : (1 / 1.1);
	var currentRange = Cesium.Cartesian3.magnitude(fixedOrbitLocalOffset);
	var newRange = Math.max(currentRange * zoomFactor, FIXED_ORBIT_MIN_RANGE);
	Cesium.Cartesian3.multiplyByScalar(fixedOrbitLocalOffset, newRange / currentRange, fixedOrbitLocalOffset);
}

// Two-finger pinch on touch devices does the same radius/height zoom as the
// mouse wheel above. Cesium's own pinch-to-zoom is covered by the same
// enableZoom flag we disable while orbiting, so it needs its own handling.
var fixedOrbitPinchStartDistance = null;

function getTouchDistance(touches) {
	var dx = touches[0].clientX - touches[1].clientX;
	var dy = touches[0].clientY - touches[1].clientY;
	return Math.sqrt(dx * dx + dy * dy);
}

function onFixedOrbitTouchStart(event) {
	if (!window.fixedOrbitInProgress || window.fixedOrbitPaused)
		return;
	if (event.touches.length === 2)
		fixedOrbitPinchStartDistance = getTouchDistance(event.touches);
}

function onFixedOrbitTouchMove(event) {
	if (!window.fixedOrbitInProgress || window.fixedOrbitPaused || fixedOrbitLocalOffset == null)
		return;
	if (event.touches.length !== 2 || fixedOrbitPinchStartDistance == null)
		return;
	event.preventDefault();

	// Fingers spreading apart (distance growing) = zoom in = smaller range;
	// pinching together = zoom out = larger range.
	var newDistance = getTouchDistance(event.touches);
	var zoomFactor = fixedOrbitPinchStartDistance / newDistance;
	var currentRange = Cesium.Cartesian3.magnitude(fixedOrbitLocalOffset);
	var newRange = Math.max(currentRange * zoomFactor, FIXED_ORBIT_MIN_RANGE);
	Cesium.Cartesian3.multiplyByScalar(fixedOrbitLocalOffset, newRange / currentRange, fixedOrbitLocalOffset);

	fixedOrbitPinchStartDistance = newDistance;
}

function onFixedOrbitTouchEnd(event) {
	if (event.touches.length < 2)
		fixedOrbitPinchStartDistance = null;
}

// Interpolates an angle (radians) from start to end along its shortest path,
// so e.g. 350deg -> 10deg goes forward through 360/0 instead of the long way
// backward through 180.
function lerpAngle(start, end, t) {
	var twoPi = Cesium.Math.TWO_PI;
	var delta = ((end - start + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
	return start + delta * t;
}

// Moves the camera to a destination at a fixed real-world speed (linear
// interpolation of both position and orientation) instead of camera.flyTo(),
// whose default ease-in/ease-out curve crawls to a near-stop right as it
// reaches the destination - noticeably slow motion right before the orbit
// pivot settles in. Duration is derived from distance/speed so it still
// takes longer to travel further, just without the easing curve.
var FIXED_ORBIT_FLIGHT_SPEED = 800; // meters/second
function moveCameraAtConstantSpeed(destination, heading, pitch, roll, onComplete) {
	var startPosition = Cesium.Cartesian3.clone(camera.position);
	var startHeading = camera.heading;
	var startPitch = camera.pitch;
	var startRoll = camera.roll;

	var distance = Cesium.Cartesian3.distance(startPosition, destination);
	var duration = Cesium.Math.clamp(distance / FIXED_ORBIT_FLIGHT_SPEED, 1.0, 6.0);

	var startTimeMs = performance.now();
	var currentPosition = new Cesium.Cartesian3();

	var unsubscribeFlight = viewer.clock.onTick.addEventListener(function () {
		var t = Math.min((performance.now() - startTimeMs) / 1000 / duration, 1.0);

		Cesium.Cartesian3.lerp(startPosition, destination, t, currentPosition);
		camera.setView({
			destination: currentPosition,
			orientation: {
				heading: lerpAngle(startHeading, heading, t),
				pitch: lerpAngle(startPitch, pitch, t),
				roll: lerpAngle(startRoll, roll, t),
			},
		});

		if (t >= 1.0) {
			unsubscribeFlight();
			if (typeof onComplete == "function")
				onComplete();
		}
	});
}

// Orbits the camera around a fixed target point (lat/lon/height), starting
// from a given camera position (lat/lon/altitude). Matches Cesium's native
// Ctrl+Left-drag single-point orbit: fixed pivot/pitch/range, heading
// advancing as if dragging the mouse.
function StartFixedPointOrbit(
	targetLongitude = -74.02494516642378,
	targetLatitude = 40.707910569143515,
	targetHeight = 1371,
	cameraLongitude = -74.02494516642378,
	cameraLatitude = 40.707910569143515,
	cameraAltitude = 1034.9018851086933,
	cameraRoll = 359.9999994970778,
	rotationSpeed = 0.0005
) {
	if (window.fixedOrbitInProgress || window.fixedOrbitStarting)
	{
		StopFixedPointOrbit();
		return;
	}
	window.fixedOrbitStarting = true;

	if (typeof camera == "undefined")
		camera = viewer.camera;

	// Stored altitudes/heights here are relative to ground, same as every other
	// camera height in this app (see cameraFunctions.js) - not height above the
	// WGS84 ellipsoid. Skipping this adjustment is exactly why the orbit breaks
	// in high-elevation cities like Calgary (~1000m+ ground height): both points
	// end up positioned far below the actual terrain instead of just above it.
	var groundAdjustment = (typeof cameraAltitudeAdjustment != "undefined" && cameraAltitudeAdjustment != null) ? cameraAltitudeAdjustment : 0;
	var cameraStartPosition = Cesium.Cartesian3.fromDegrees(cameraLongitude, cameraLatitude, cameraAltitude + groundAdjustment);
	var orbitTarget = Cesium.Cartesian3.fromDegrees(targetLongitude, targetLatitude, targetHeight + groundAdjustment);

	// Fly there already looking straight at the orbit target - not whatever
	// heading/pitch happens to be stored alongside the camera position, which
	// may not exactly bore-sight that point. Otherwise the very first
	// camera.lookAt() call (once the orbit starts ticking) snaps the view to
	// the target and that mismatch is exactly what shows up as a jump.
	var lookHpr = computeHeadingPitchLookingAt(cameraStartPosition, orbitTarget);

	viewer.canvas.addEventListener("wheel", onFixedOrbitWheel, { passive: false });
	viewer.canvas.addEventListener("touchstart", onFixedOrbitTouchStart, { passive: false });
	viewer.canvas.addEventListener("touchmove", onFixedOrbitTouchMove, { passive: false });
	viewer.canvas.addEventListener("touchend", onFixedOrbitTouchEnd, { passive: false });

	// Move to the starting pose at constant speed, then begin orbiting only
	// once the camera has actually settled there.
	var sessionId = fixedOrbitSessionId;
	moveCameraAtConstantSpeed(
		cameraStartPosition,
		lookHpr.heading,
		lookHpr.pitch,
		Cesium.Math.toRadians(cameraRoll),
		function () {
			if (sessionId !== fixedOrbitSessionId)
				return; // stopped before the flight finished - don't resurrect it
			window.fixedOrbitStarting = false;
			BeginFixedPointOrbit(orbitTarget, rotationSpeed);
		}
	);
}

function BeginFixedPointOrbit(orbitTarget, rotationSpeed) {
	// The camera has now settled into the starting position - save its height
	// and angle here, before anything else moves it, so the rotation below
	// starts from this exact saved point.
	window.fixedOrbitStartState = {
		height: camera.positionCartographic.height,
		heading: camera.heading,
		pitch: camera.pitch,
		roll: camera.roll,
	};

	fixedOrbitTarget = orbitTarget;
	ShowFixedOrbitTargetMarker(fixedOrbitTarget);

	// The camera's current offset from the target, in the target's local
	// East-North-Up frame. Starting the tick loop from this exact vector (a
	// zero-degree rotation of itself) is what makes the orbit start with no jump.
	fixedOrbitLocalOffset = getLocalOffsetFromTarget(fixedOrbitTarget, camera.position);
	fixedOrbitRotationSpeed = rotationSpeed;
	fixedOrbitBaseSpeed = rotationSpeed;

	window.fixedOrbitInProgress = true;
	window.fixedOrbitPaused = false;
	viewer.scene.screenSpaceCameraController.enableZoom = false;
	ResumeFixedPointOrbitTick();
	SetMarketOrbitIcon("images/pause-active.png");
}

function ResumeFixedPointOrbitTick() {
	unsubscribeFixedOrbit = viewer.clock.onTick.addEventListener(function () {
		// Reset the transform each tick, then re-derive the camera pose from the
		// target so the camera stays locked on orbitTarget instead of drifting.
		viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

		// Rotate the offset around the local up axis (east/north plane) - this is
		// heading rotation, keeping pitch (up component) and range untouched.
		var cosStep = Math.cos(fixedOrbitRotationSpeed);
		var sinStep = Math.sin(fixedOrbitRotationSpeed);
		var rotatedX = fixedOrbitLocalOffset.x * cosStep - fixedOrbitLocalOffset.y * sinStep;
		var rotatedY = fixedOrbitLocalOffset.x * sinStep + fixedOrbitLocalOffset.y * cosStep;
		fixedOrbitLocalOffset.x = rotatedX;
		fixedOrbitLocalOffset.y = rotatedY;

		viewer.camera.lookAt(fixedOrbitTarget, fixedOrbitLocalOffset);
	});
}

// Single click on #autoRotateZoom while a market orbit is active pauses it in
// place (camera freezes exactly where it is) or resumes it from that same
// spot - like a media player's play/pause, not a full stop.
function PauseFixedPointOrbit() {
	if (!window.fixedOrbitInProgress || window.fixedOrbitPaused)
		return;
	window.fixedOrbitPaused = true;
	if (unsubscribeFixedOrbit != null) {
		unsubscribeFixedOrbit();
		unsubscribeFixedOrbit = null;
	}
	// Fully hand normal navigation back to the user while paused - not just
	// releasing the lookAt transform, but also re-enabling zoom (the one
	// control the orbit disables) so pan/zoom/rotate all work normally again.
	camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	viewer.scene.screenSpaceCameraController.enableZoom = true;
	SetMarketOrbitIcon("images/play-button.png");
}

function ResumeFixedPointOrbit() {
	if (!window.fixedOrbitInProgress || !window.fixedOrbitPaused)
		return;

	// Take control back from the user and fly back to exactly where the
	// orbit was paused - the camera may have been manually moved in the
	// meantime - then resume rotating from that same saved offset.
	viewer.scene.screenSpaceCameraController.enableZoom = false;

	var pausedWorldPosition = Cesium.Matrix4.multiplyByPoint(
		Cesium.Transforms.eastNorthUpToFixedFrame(fixedOrbitTarget),
		fixedOrbitLocalOffset,
		new Cesium.Cartesian3()
	);
	var lookHpr = computeHeadingPitchLookingAt(pausedWorldPosition, fixedOrbitTarget);

	var sessionId = fixedOrbitSessionId;
	moveCameraAtConstantSpeed(
		pausedWorldPosition,
		lookHpr.heading,
		lookHpr.pitch,
		0,
		function () {
			if (sessionId !== fixedOrbitSessionId)
				return; // stopped before the fly-back finished - don't resurrect it
			window.fixedOrbitPaused = false;
			ResumeFixedPointOrbitTick();
			SetMarketOrbitIcon("images/pause-active.png");
		}
	);
}

function ToggleFixedPointOrbitPause() {
	if (!window.fixedOrbitInProgress)
		return;
	if (window.fixedOrbitPaused)
		ResumeFixedPointOrbit();
	else
		PauseFixedPointOrbit();
}

function StopFixedPointOrbit() {
	// Also runs during the "starting" phase (initial flight still in progress,
	// not yet ticking) so a stop/restart during that window cancels it
	// cleanly instead of leaving a stale flight to complete on its own later.
	if (!window.fixedOrbitInProgress && !window.fixedOrbitStarting)
		return;
	//$('.dropdownCam-item').removeClass('selected');
	$('#market-orbit-li').removeClass('selected');
	fixedOrbitSessionId++;
	window.fixedOrbitInProgress = false;
	window.fixedOrbitStarting = false;
	window.fixedOrbitPaused = false;
	viewer.scene.screenSpaceCameraController.enableZoom = true;
	viewer.canvas.removeEventListener("wheel", onFixedOrbitWheel);
	viewer.canvas.removeEventListener("touchstart", onFixedOrbitTouchStart);
	viewer.canvas.removeEventListener("touchmove", onFixedOrbitTouchMove);
	viewer.canvas.removeEventListener("touchend", onFixedOrbitTouchEnd);
	fixedOrbitPinchStartDistance = null;
	if (typeof unsubscribeFixedOrbit != "undefined" && unsubscribeFixedOrbit != null)
		unsubscribeFixedOrbit();
	unsubscribeFixedOrbit = null;
	if (typeof camera != "undefined")
		camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	RemoveFixedOrbitTargetMarker();
	SetMarketOrbitIcon("images/360.png");
}
