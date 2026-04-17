// =============================================================================
// Vertical text label on a 3D Cesium tileset
// No polygon / ClassificationPrimitive needed.
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Canvas builder
// -----------------------------------------------------------------------------
function createTextCanvas(text) {
    const H = 256, padding = 40;
    const tmp = document.createElement("canvas");
    tmp.width = 2048; tmp.height = H;
    const tmpCtx = tmp.getContext("2d");
    let fontSize = H * 0.55;
    tmpCtx.font = `bold ${fontSize}px Arial`;
    while (tmpCtx.measureText(text).width > 2048 - padding * 2 && fontSize > 12) {
        fontSize -= 1;
        tmpCtx.font = `bold ${fontSize}px Arial`;
    }
    const W = Math.ceil(tmpCtx.measureText(text).width + padding * 2);
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(15,25,50,0.92)");
    grad.addColorStop(1, "rgba(5,12,30,0.92)");
    ctx.fillStyle = grad;
    _roundRect(ctx, 0, 0, W, H, H * 0.12); ctx.fill();
    const bw = Math.max(3, H * 0.022);
    ctx.strokeStyle = "rgba(80,180,255,0.95)"; ctx.lineWidth = bw;
    _roundRect(ctx, bw/2, bw/2, W-bw, H-bw, H*0.10); ctx.stroke();
    ctx.shadowColor = "rgba(0,0,0,0.95)"; ctx.shadowBlur = H*0.08; ctx.shadowOffsetY = H*0.02;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, W/2, H/2);
    return canvas;
}

function _roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
}

// -----------------------------------------------------------------------------
// 2. Haversine distance metres
// -----------------------------------------------------------------------------
function haversineDistance(lon1, lat1, lon2, lat2) {
    const R=6371000, p1=lat1*Math.PI/180, p2=lat2*Math.PI/180,
          dp=(lat2-lat1)*Math.PI/180, dl=(lon2-lon1)*Math.PI/180;
    const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// -----------------------------------------------------------------------------
// 3. Sample tileset surface height — uses clampToHeightMostDetailed (not
//    sampleTerrainMostDetailed which crashes on 3D Tiles with
//    "computeMaximumLevelAtPosition" error).
// -----------------------------------------------------------------------------
async function sampleTilesetHeight(lon, lat) {
    const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, 9999);

    // Method 1: clampToHeightMostDetailed (async ray-cast on 3D Tiles)
    if (viewer.scene.clampToHeightMostDetailed) {
        try {
            const clamped = await viewer.scene.clampToHeightMostDetailed([cartesian]);
            if (clamped && clamped[0]) {
                const carto = Cesium.Cartographic.fromCartesian(clamped[0]);
                console.log(`[sampleTilesetHeight] clampToHeightMostDetailed -> ${carto.height.toFixed(2)}m`);
                return carto.height;
            }
        } catch (e) {
            console.warn("[sampleTilesetHeight] clampToHeightMostDetailed failed:", e.message);
        }
    }

    // Method 2: sampleHeight (sync, Cesium >= 1.57)
    if (viewer.scene.sampleHeight) {
        try {
            const carto = Cesium.Cartographic.fromDegrees(lon, lat);
            const height = viewer.scene.sampleHeight(carto);
            if (height !== undefined && !isNaN(height)) {
                console.log(`[sampleTilesetHeight] sampleHeight -> ${height.toFixed(2)}m`);
                return height;
            }
        } catch (e) {
            console.warn("[sampleTilesetHeight] sampleHeight failed:", e.message);
        }
    }

    console.warn("[sampleTilesetHeight] all methods failed, using 0");
    return 0;
}

// -----------------------------------------------------------------------------
// 4. addTilesetLabel — place vertical plane label on a 3D tileset
//
// @param {number} lon    anchor longitude
// @param {number} lat    anchor latitude
// @param {string} text   label text
// @param {object} options:
//
//   labelHeight   {number}  plane height in metres            Default: 5
//   labelWidth    {number}  plane width  in metres            Default: 0 = auto
//   offsetUp      {number}  metres to lift above surface      Default: 0
//   offsetForward {number}  metres to shift along facingDeg   Default: 0
//                           +ve = forward (away from wall)
//                           -ve = backward (into the wall)
//   facingDeg     {number}  compass bearing the face looks    Default: 0 (North)
//                           0=N  90=E  180=S  270=W
//   manualHeight  {number}  skip sampling, use this elevation Default: null
//   id            {string}  entity id                         Default: GUID
// -----------------------------------------------------------------------------
async function addTilesetLabel(lon, lat, text, options = {}) {
    const {
        labelHeight   = 5,
        labelWidth    = 0,
        offsetUp      = 0,
        offsetForward = 0,
        facingDeg     = 0,
        manualHeight  = null,
        id            = Cesium.createGuid(),
    } = options;

    // Resolve surface elevation
    const surfaceH = (manualHeight !== null)
        ? manualHeight
        : await sampleTilesetHeight(lon, lat);

    // Vertical centre of the plane
    const placeH = surfaceH + offsetUp + labelHeight / 2;

    // ── offsetForward ────────────────────────────────────────────────────────
    // Shift the anchor point N metres along the facingDeg bearing.
    // Uses equirectangular approximation — accurate for offsets < 100 m.
    //
    //   bearingRad = 0   (N) -> dLat +, dLon  0
    //   bearingRad = 90  (E) -> dLat  0, dLon +
    //   bearingRad = 180 (S) -> dLat -, dLon  0
    //   bearingRad = 270 (W) -> dLat  0, dLon -
    let finalLon = lon;
    let finalLat = lat;

    if (offsetForward !== 0) {
        const bearingRad    = Cesium.Math.toRadians(facingDeg);
        const mPerDegLat    = 111320;
        const mPerDegLon    = 111320 * Math.cos(Cesium.Math.toRadians(lat));
        finalLat = lat + (offsetForward * Math.cos(bearingRad)) / mPerDegLat;
        finalLon = lon + (offsetForward * Math.sin(bearingRad)) / mPerDegLon;
    }

    // Canvas + plane size
    const canvas    = createTextCanvas(text);
    const autoWidth = labelHeight * (canvas.width / canvas.height);
    const planeW    = labelWidth > 0 ? labelWidth : autoWidth;
    const planeH    = labelHeight;

    const position  = Cesium.Cartesian3.fromDegrees(finalLon, finalLat, placeH);

    // heading = direction the label face looks outward
    // roll 90 + UNIT_Z normal = perfectly vertical plane aligned with heading
    const hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(facingDeg),
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(90)
    );
    const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    console.log(
        `[addTilesetLabel] "${text}"`,
        `surface=${surfaceH.toFixed(2)}m`,
        `placeH=${placeH.toFixed(2)}m`,
        `offsetUp=${offsetUp}m`,
        `offsetForward=${offsetForward}m`,
        `facing=${facingDeg}deg`,
        `pos=(${finalLon.toFixed(8)}, ${finalLat.toFixed(8)})`
    );

    viewer.entities.add({
        id,
        position,
        orientation,
        plane: {
            plane      : new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
            dimensions : new Cesium.Cartesian2(planeW, planeH),
            material   : new Cesium.ImageMaterialProperty({
                image      : canvas,
                transparent: true,
            }),
            outline : false,
            shadows : Cesium.ShadowMode.DISABLED,
        }
    });

    return id;
}

// -----------------------------------------------------------------------------
// 5. addTilesetLabelBetween — label spanning two points (wall edge)
//    Auto-calculates bearing so the face looks outward from the edge.
//    Label width defaults to the real-world edge length.
// -----------------------------------------------------------------------------
async function addTilesetLabelBetween(lon1, lat1, lon2, lat2, text, options = {}) {
    const midLon = (lon1 + lon2) / 2;
    const midLat = (lat1 + lat2) / 2;
    const dLon   = (lon2 - lon1) * Math.PI / 180;
    const p1     = lat1 * Math.PI / 180;
    const p2     = lat2 * Math.PI / 180;
    const y      = Math.sin(dLon) * Math.cos(p2);
    const x      = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dLon);
    const facingDeg = Math.atan2(y, x) * 180 / Math.PI + 90;  // outward normal
    const edgeLen   = haversineDistance(lon1, lat1, lon2, lat2);
    return addTilesetLabel(midLon, midLat, text, {
        labelWidth: options.labelWidth ?? edgeLen,
        facingDeg,
        ...options,
    });
}


var sampleData = [];
sampleData.push({
		"idtbuilding": 138, 
		"floor_number": 30, 
		longitude: -114.06765872133302, 
		latitude: 51.04427138329099,
		altitude: 1117, 
		label_text: "1800 880 2258", 
		label_height: 3, 
		offset_up: 0, 
		offset_forward: 0, 
		facing_degree: 0, 
	});
sampleData.push({
		"idtbuilding": 138, 
		"floor_number": 30, 
		longitude: -114.06849409608337, 
		latitude: 51.044864072494185,
		altitude: 1106, 
		label_text: "1800 880 9999", 
		label_height: 2, 
		offset_up: 2, 
		offset_forward: -0.5, 
		facing_degree: 10, 
	});
	
if(false)
{
	$.each(sampleData, function (index, row){
		viewer.entities.removeById("floor-label-new-"+index);
		addTilesetLabel(
			row.longitude, 
			row.latitude,
			row.label_text,
			{
				labelHeight : row.label_height,        // metres tall
				offsetUp    : row.offset_up,        // sit right on the surface
				offsetForward     : row.offset_forward,        // sit right on the surface
				facingDeg   : row.facing_degree,        // face North
				manualHeight   : parseInt(row.altitude),        // altitude
				id          : "floor-label-new-"+index
			}
		);
	});
}
/*
// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE CALLS
// ─────────────────────────────────────────────────────────────────────────────

// A) Simple label at a point — auto-samples surface height
//    Label faces North (default), 5m tall, width auto from text
addTilesetLabel(
    -114.06738, 51.04425,
    "9999444433",
    {
        labelHeight : 5,        // metres tall
        offsetUp    : 0,        // sit right on the surface
        facingDeg   : 0,        // face North
        id          : "label-a"
    }
);

addTilesetLabel(
    -114.06944984975146, 51.04502409183571,
    "9999444433",
    {
        labelHeight : 5,        // metres tall
        offsetUp    : 0,        // sit right on the surface
        facingDeg   : 0,        // face North
        id          : "label-a"
    }
);

// B) Label facing a specific direction (e.g. East-facing wall)
addTilesetLabel(
    -114.06738, 51.04424,
    "UNIT 204",
    {
        labelHeight : 3,
        offsetUp    : 1,        // raise 1m above surface
        facingDeg   : 90,       // face East
        id          : "label-b"
    }
);

// C) Two-point label — spans an edge, auto-aligns parallel to it
//    Perfect for labelling a building wall face
addTilesetLabelBetween(
    -114.06757610397607, 51.04425025596059,   // start of edge
    -114.06720972064971, 51.04425025596059,   // end of edge
    "9999444433",
    {
        labelHeight : 4,
        offsetUp    : 0.5,
        id          : "label-c"
    }
);


*/