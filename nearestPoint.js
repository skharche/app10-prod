window.selectedPoint = null;
//const points = raw.map((p, i) => ({ id: i, lon: p[0], lat: p[1] }));

  // ---------- appearance params ----------
  const Y_COLOR = Cesium.Color.YELLOW;
  const R_COLOR = Cesium.Color.RED;
  const DEFAULT_SIZE = 10;
  const SELECTED_SIZE = 14;
  const ANGLE_TOLERANCE_DEG = 5; // change this value to widen/narrow cone

  // ---------- add entities ----------
  const entities = [];
  /*
  for (const pt of points) {
    const ent = viewer.entities.add({
      id: 'p_' + pt.id,
      position: Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat),
      point: {
        pixelSize: DEFAULT_SIZE,
        color: Y_COLOR,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1
      },
      properties: {
        pid: pt.id,
        lat: pt.lat,
        lon: pt.lon
      }
    });
    entities.push(ent);
  }
  */

  // zoom to all points
  //viewer.zoomTo(viewer.entities);

  // ---------- helpers: bearing & haversine ----------
  function toRad(d) { return d * Math.PI / 180; }
  function toDeg(r) { return r * 180 / Math.PI; }
	
  // bearing from (lat1,lon1) -> (lat2,lon2) in degrees [0..360)
  function getBearing(lat1, lon1, lat2, lon2) {
    const theta1 = toRad(lat1), theta2 = toRad(lat2);
    const lambda1 = toRad(lon1), lambda2 = toRad(lon2);
    const y = Math.sin(lambda2 - lambda1) * Math.cos(theta2);
    const x = Math.cos(theta1)*Math.sin(theta2) - Math.sin(theta1)*Math.cos(theta2)*Math.cos(lambda2 - lambda1);
    const TT2 = Math.atan2(y, x);
    return (toDeg(TT2) + 360) % 360;
  }

  // haversine distance in meters
  function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const theta1 = toRad(lat1), theta2 = toRad(lat2);
    const delta_theta = toRad(lat2 - lat1), delta_lambda = toRad(lon2 - lon1);
    const a = Math.sin(delta_theta/2)*2 + Math.cos(theta1)*Math.cos(theta2)*Math.sin(delta_lambda/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ---------- selection state ----------

  // update status text
  function updateStatus() {
	//const idx = selectedEntity && selectedEntity.properties ? selectedEntity.properties.pid.getValue() : '—';
	//document.getElementById('selIdx').textContent = idx;
  }

  // set selected visuals
  function setSelected(ent) {
    // reset all
    for (const e of entities) {
      e.point.pixelSize = DEFAULT_SIZE;
      e.point.color = Y_COLOR;
    }
    selectedEntity = ent;
    if (!selectedEntity) return;
    selectedEntity.point.pixelSize = SELECTED_SIZE;
    selectedEntity.point.color = R_COLOR;
    // fly to selected for visual feedback
    /*
	viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        selectedEntity.properties.lon.getValue(),
        selectedEntity.properties.lat.getValue(),
        120 // height above point
      ),
      duration: 0.6
    });
	*/
    updateStatus();
  }

  // ---------- directional search ----------
  // map key -> desired bearing
  const dirToBearing = {
    ArrowUp: 0,     // North
    ArrowRight: 90, // East
    ArrowDown: 180, // South
    ArrowLeft: 270  // West
  };

	function findNextDirectional(currentPoint, key) {
		const desired = dirToBearing[key];
		if (desired === undefined) return null;

		const lat0 = currentPoint.lat;
		const lon0 = currentPoint.lon;

		const candidates = [];

		for (const p of TempPointsData) {
			if (p.bldg === currentPoint.id) continue; // skip same point

			const br = getBearing(lat0, lon0, p.lat, p.lon);
			let diff = Math.abs(br - desired);
			if (diff > 180) diff = 360 - diff; // normalize smallest angle

			if (diff <= ANGLE_TOLERANCE_DEG) {
				const d = haversineMeters(lat0, lon0, p.lat, p.lon);
				candidates.push({ point: p, dist: d, angleDiff: diff, bearing: br });
			}
		}

		if (candidates.length === 0) return null;

		// sort nearest first (can also add angle priority if needed)
		candidates.sort((a, b) => a.dist - b.dist);

		return candidates[0].point;
	}

	/*
	document.addEventListener('keydown', function (ev) {
		const key = ev.key;
		if (!dirToBearing.hasOwnProperty(key)) return;

		ev.preventDefault();
		if (!selectedPoint) return;

		const nextPoint = findNextDirectional(selectedPoint, key);
		console.log(nextPoint);
		
		//if (nextPoint) {
		//	setSelected(nextPoint);
		//} else {
			// optional feedback: flash or highlight
		//	flashPoint(selectedPoint.id);
		//}
	});
	*/

  // ---------- click-to-select ----------
  /*
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function(click) {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && Cesium.defined(picked.id)) {
      setSelected(picked.id);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  */

  // update initial status
  updateStatus();
