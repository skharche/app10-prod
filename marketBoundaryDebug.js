// ---------------------------------------------------------------------------
// Market boundary debug helpers
//
// Draws the boundary polygon(s) that are available for a market, straight from
// window.marketBoundaries (populated in main.js from data.marketBoundaries).
//
//   drawMarketBoundaries()            - draw every available market boundary,
//                                       the selected market highlighted, each
//                                       labelled at its centre.
//   drawMarketBoundaries(marketId)    - draw just that one.
//   quickDrawBoundary()               - fast one-shot debug draw of the
//                                       currently selected market's boundary
//                                       with a label at the centre + flyTo.
//   quickDrawBoundary(marketId)       - same, for a specific market.
//   clearMarketBoundaryDebug()        - remove everything this file added.
// ---------------------------------------------------------------------------

window.marketBoundaryDebugEntities = window.marketBoundaryDebugEntities || [];

// The stored market_boundary string comes in one of two shapes:
//   "lon, lat, lon, lat, ..."      (comma separated, as used by main.js)
//   "lon,lat ** lon,lat ** ..."    (same "**" pair format as submarkets)
// Returns a flat [lon, lat, lon, lat, ...] array, or null if it can't be read.
function parseMarketBoundary(boundaryStr) {
	if (!boundaryStr || typeof boundaryStr !== "string")
		return null;

	var flat = [];
	if (boundaryStr.indexOf("**") !== -1) {
		var pairs = boundaryStr.split("**");
		for (var i = 0; i < pairs.length; i++) {
			var parts = pairs[i].trim().split(",");
			if (parts.length < 2)
				continue;
			var lon = parseFloat(parts[0]);
			var lat = parseFloat(parts[1]);
			if (isNaN(lon) || isNaN(lat))
				continue;
			flat.push(lon, lat);
		}
	} else {
		flat = boundaryStr.trim().replace(/^\[|\]$/g, "").replace(/,\s*$/, "").split(",").map(Number);
	}

	if (flat.length < 6 || flat.length % 2 !== 0 || flat.some(isNaN))
		return null;
	return flat;
}

function getMarketName(marketId) {
	var v2 = window.marketDetailsV2 || [];
	if (v2[marketId] && (v2[marketId].smarketname || v2[marketId].marketname))
		return v2[marketId].smarketname || v2[marketId].marketname;
	return "Market " + marketId;
}

// Draws one boundary: a coloured outline, a faint fill, and a name label sitting
// at the polygon centroid. Returns the boundary's cartesian positions (or null).
function drawOneMarketBoundary(marketId, color, isSelected) {
	var coords = parseMarketBoundary((window.marketBoundaries || [])[marketId]);
	if (coords == null) {
		console.warn("marketBoundaryDebug: no usable boundary for market " + marketId);
		return null;
	}

	var positions = Cesium.Cartesian3.fromDegreesArray(coords);
	var centre = computeCentroid(positions);

	var outline = viewer.entities.add({
		id: "marketBoundaryDebug_line_" + marketId,
		polyline: {
			positions: positions.concat([positions[0]]),
			width: isSelected ? 6 : 3,
			clampToGround: true,
			classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
			material: color,
		},
	});

	var fill = viewer.entities.add({
		id: "marketBoundaryDebug_fill_" + marketId,
		polygon: {
			hierarchy: { positions: positions },
			material: color.withAlpha(isSelected ? 0.22 : 0.08),
			classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
		},
	});

	var label = viewer.entities.add({
		id: "marketBoundaryDebug_label_" + marketId,
		position: Cesium.Cartesian3.fromRadians(centre.longitude, centre.latitude, centre.height),
		label: {
			text: getMarketName(marketId) + "  (#" + marketId + ")",
			font: "14px sans-serif",
			showBackground: true,
			backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
			fillColor: Cesium.Color.WHITE,
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			verticalOrigin: Cesium.VerticalOrigin.CENTER,
			disableDepthTestDistance: Number.POSITIVE_INFINITY,
			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
		},
	});

	window.marketBoundaryDebugEntities.push(outline, fill, label);
	return positions;
}

// Draw every market boundary we have on hand (or just `onlyMarketId` if given).
// The currently selected market (lastMarketLoaded) is drawn highlighted in red.
function drawMarketBoundaries(onlyMarketId) {
	clearMarketBoundaryDebug();

	var boundaries = window.marketBoundaries || [];
	var selectedId = parseInt(window.lastMarketLoaded);
	var palette = [
		Cesium.Color.CYAN, Cesium.Color.LIME, Cesium.Color.ORANGE,
		Cesium.Color.MAGENTA, Cesium.Color.YELLOW, Cesium.Color.DEEPSKYBLUE,
	];

	var drawn = 0, colorIndex = 0;
	for (var key in boundaries) {
		if (!boundaries.hasOwnProperty(key))
			continue;
		var marketId = parseInt(key);
		if (typeof onlyMarketId !== "undefined" && onlyMarketId !== null && marketId !== parseInt(onlyMarketId))
			continue;

		var isSelected = marketId === selectedId;
		var color = isSelected ? Cesium.Color.RED : palette[colorIndex++ % palette.length];
		if (drawOneMarketBoundary(marketId, color, isSelected) != null)
			drawn++;
	}

	console.log("marketBoundaryDebug: drew " + drawn + " boundary/boundaries.");
	return drawn;
}

// Quick, no-frills debug draw: clears previous debug entities, draws the one
// boundary, drops a label at its centre and flies the camera to it.
function quickDrawBoundary(marketId) {
	if (typeof marketId === "undefined" || marketId === null)
		marketId = parseInt(window.lastMarketLoaded);

	clearMarketBoundaryDebug();
	var positions = drawOneMarketBoundary(marketId, Cesium.Color.RED, true);
	if (positions == null)
		return;

	viewer.flyTo(
		viewer.entities.getById("marketBoundaryDebug_fill_" + marketId),
		{ duration: 1.5 }
	);
}

function clearMarketBoundaryDebug() {
	var list = window.marketBoundaryDebugEntities || [];
	for (var i = 0; i < list.length; i++)
		viewer.entities.remove(list[i]);
	window.marketBoundaryDebugEntities = [];
}
