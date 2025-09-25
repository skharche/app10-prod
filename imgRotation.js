
//createCompanyImage(-114.0684939642457, 51.045102603340624, 1400.8784146711173);
function createCompanyImage(lon, lat, ht)
{
	var positio2n = Cesium.Cartesian3.fromDegrees(lon, lat, ht); 

	// ✅ Medium size in pixels
	var size = 64; 

	// ✅ Create entity with a billboard
	window.companySpinningImage = viewer.entities.add({
		position: positio2n,
		billboard: {
			image: "../visgrid-tools/uploads/company-images/1752862382_687a8eaee048f.jpg",
			width: size,
			height: size,
			verticalOrigin: Cesium.VerticalOrigin.CENTER
		}
	});

	// ✅ Animate spin
	viewer.clock.onTick.addEventListener(function(clock) {
		var now = Cesium.JulianDate.now();
		var seconds = Cesium.JulianDate.secondsDifference(now, viewer.clock.startTime);

		// Rotate over time
		var angle = seconds * Cesium.Math.toRadians(45); // 45° per second
		companySpinningImage.billboard.rotation = angle;
	});
}




