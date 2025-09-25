function getPointAtHeight(position, height)
{
	const cartographic = Cesium.Cartographic.fromCartesian(position);
      cartographic.height = height;
      return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
}

function lookOutsideHorizontally(point, centroid, ht)
{
	centroid = Cesium.Cartesian3.fromDegrees(centroid.longitude, centroid.latitude);
	const firstPoint = getPointAtHeight(Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude), ht); // 100 meters above ground
    const direction = Cesium.Cartesian3.subtract(firstPoint, centroid, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(direction, direction);
	
	viewer.camera.setView({
      destination: firstPoint,
      orientation: {
        direction: direction, // Look outward from centroid to first point
        up: Cesium.Cartesian3.UNIT_Z // Keep the camera horizontal
      }
    });
}