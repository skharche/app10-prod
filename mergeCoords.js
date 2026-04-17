// Uses the 'polyclip-ts' or 'martinez' library approach
// This is pure JS using TURF.js logic — paste this in browser or Node

/**
 * Merges intersecting/overlapping polygons
 * Input:  [{ id: 'abc', coords: [lon, lat, lon, lat, ...] }, ...]
 * Output: [{ ids: 'abc,def', coords: [lon, lat, lon, lat, ...] }, ...]
 *
 * FIX: replaced convexHull() approximation with a proper Greiner-Hormann
 * polygon union so every outer vertex is preserved (concave shapes work).
 */
function mergeIntersectingPolygons(input) {

  const EPS = 1e-10;

  // --- Helpers ---

  // Flat coords array → closed GeoJSON ring [[lon,lat],...]
  function toRing(coords) {
    const ring = [];
    for (let i = 0; i < coords.length; i += 2) {
      ring.push([coords[i], coords[i + 1]]);
    }
    if (ring.length > 1) {
      const f = ring[0], l = ring[ring.length - 1];
      if (f[0] !== l[0] || f[1] !== l[1]) ring.push([...f]);
    }
    return ring;
  }

  // Closed ring → flat coords array
  function fromRing(ring) {
    const out = [];
    for (const [lon, lat] of ring) out.push(lon, lat);
    return out;
  }

  // Remove repeated closing point → open ring
  function openRing(ring) {
    const r = [...ring];
    if (r.length > 1) {
      const f = r[0], l = r[r.length - 1];
      if (Math.abs(f[0] - l[0]) < EPS && Math.abs(f[1] - l[1]) < EPS) r.pop();
    }
    return r;
  }

  // Append first point at end → closed ring
  function closeRing(ring) {
    if (ring.length === 0) return ring;
    return [...ring, [...ring[0]]];
  }

  // Axis-aligned bounding box
  function bbox(ring) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of ring) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
  }

  // Quick AABB overlap check
  function bboxOverlap(a, b) {
    return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
  }

  // Point-in-polygon ray casting (works for open or closed rings)
  function pointInPolygon([px, py], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  // Segment intersection — interior only (not at shared endpoints).
  // Returns { pt, t, u } or null.
  function segInt(p1, p2, p3, p4) {
    const dx1 = p2[0] - p1[0], dy1 = p2[1] - p1[1];
    const dx2 = p4[0] - p3[0], dy2 = p4[1] - p3[1];
    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < EPS) return null;
    const dx = p3[0] - p1[0], dy = p3[1] - p1[1];
    const t = (dx * dy2 - dy * dx2) / denom;
    const u = (dx * dy1 - dy * dx1) / denom;
    if (t > EPS && t < 1 - EPS && u > EPS && u < 1 - EPS)
      return { pt: [p1[0] + t * dx1, p1[1] + t * dy1], t, u };
    return null;
  }

  // Do two closed rings intersect or is one inside the other?
  function ringsIntersectOrContain(a, b) {
    const oa = openRing(a), ob = openRing(b);
    const na = oa.length, nb = ob.length;
    for (let i = 0; i < na; i++)
      for (let j = 0; j < nb; j++)
        if (segInt(oa[i], oa[(i + 1) % na], ob[j], ob[(j + 1) % nb])) return true;
    if (pointInPolygon(oa[0], ob)) return true;
    if (pointInPolygon(ob[0], oa)) return true;
    return false;
  }

  // -----------------------------------------------------------------------
  // Greiner-Hormann UNION of two open rings Ra, Rb.
  // Returns a closed ring representing Ra ∪ Rb.
  //
  // How it works:
  //   1. Find every edge-edge intersection and insert each one into both
  //      augmented vertex lists (augA, augB), sorted by arc parameter.
  //   2. Mark each intersection in augA as "entry" (Ra enters Rb) or
  //      "exit" (Ra leaves Rb).
  //   3. Start at the first vertex of augA that lies outside Rb.
  //   4. Walk augA forward collecting vertices.
  //      When we hit an ENTRY intersection (Ra entering Rb), switch to augB.
  //      On augB, walk in whichever direction immediately leaves Ra
  //      (checked by a midpoint pip test — this handles both CW and CCW input).
  //   5. When we hit any intersection while on augB, switch back to augA
  //      and continue forward from there.
  //   6. Repeat until we return to the start vertex.
  //
  // This preserves every outer vertex of both polygons, including all
  // concave notches — unlike a convex hull which discards them.
  // -----------------------------------------------------------------------
  function unionTwoRings(Ra, Rb) {
    const na = Ra.length, nb = Rb.length;

    // Collect all intersections, binned by which edge of Ra / Rb they fall on
    const ixByA = Array.from({ length: na }, () => []);
    const ixByB = Array.from({ length: nb }, () => []);

    for (let i = 0; i < na; i++) {
      for (let j = 0; j < nb; j++) {
        const r = segInt(Ra[i], Ra[(i + 1) % na], Rb[j], Rb[(j + 1) % nb]);
        if (r) {
          const ix = { pt: r.pt, t: r.t, u: r.u, edgeA: i, edgeB: j };
          ixByA[i].push(ix);
          ixByB[j].push(ix);
        }
      }
    }

    // Sort intersections along each edge by their parameter value
    for (let i = 0; i < na; i++) ixByA[i].sort((a, b) => a.t - b.t);
    for (let j = 0; j < nb; j++) ixByB[j].sort((a, b) => a.u - b.u);

    // Build augmented vertex lists  { pt, isInt, ix? }
    const augA = [], augB = [];
    for (let i = 0; i < na; i++) {
      augA.push({ pt: Ra[i], isInt: false });
      for (const ix of ixByA[i]) augA.push({ pt: ix.pt, isInt: true, ix });
    }
    for (let j = 0; j < nb; j++) {
      augB.push({ pt: Rb[j], isInt: false });
      for (const ix of ixByB[j]) augB.push({ pt: ix.pt, isInt: true, ix });
    }

    const lenA = augA.length, lenB = augB.length;

    // Cross-link: store each intersection's index in both lists on the ix object
    for (let i = 0; i < lenA; i++) if (augA[i].isInt) augA[i].ix._iA = i;
    for (let j = 0; j < lenB; j++) if (augB[j].isInt) augB[j].ix._iB = j;

    // No intersections at all → containment or disjoint
    if (!augA.some(n => n.isInt)) {
      if (pointInPolygon(Ra[0], closeRing(Rb))) return closeRing(Rb); // Ra inside Rb
      if (pointInPolygon(Rb[0], closeRing(Ra))) return closeRing(Ra); // Rb inside Ra
      return closeRing(Ra); // disjoint (shouldn't reach here after union-find)
    }

    // Mark entry / exit for every intersection in augA
    // "entry" = the previous regular vertex of Ra was OUTSIDE Rb
    const RbClosed = closeRing(Rb);
    for (let i = 0; i < lenA; i++) {
      if (!augA[i].isInt) continue;
      let prev = (i - 1 + lenA) % lenA;
      while (augA[prev].isInt) prev = (prev - 1 + lenA) % lenA;
      augA[i].entry = !pointInPolygon(augA[prev].pt, RbClosed);
    }

    // Find the first regular vertex of augA that lies outside Rb
    let start = -1;
    for (let i = 0; i < lenA; i++) {
      if (!augA[i].isInt && !pointInPolygon(augA[i].pt, RbClosed)) { start = i; break; }
    }
    if (start === -1) return closeRing(Rb); // Ra entirely inside Rb

    const RaClosed = closeRing(Ra);
    const result = [];
    let onA = true, idx = start, dirB = 1;
    const maxIter = (lenA + lenB) * 4;

    for (let iter = 0; iter < maxIter; iter++) {
      const cur = onA ? augA[idx] : augB[idx];
      result.push([...cur.pt]);

      // ── On Ra: reached an ENTRY intersection → switch to Rb ──
      if (onA && cur.isInt && cur.entry) {
        const bIdx = cur.ix._iB;
        // Determine which direction on Rb immediately goes OUTSIDE Ra.
        // Check the midpoint to the next-forward Rb vertex.
        const fwdPt = augB[(bIdx + 1) % lenB].pt;
        const mid = [(cur.pt[0] + fwdPt[0]) / 2, (cur.pt[1] + fwdPt[1]) / 2];
        dirB = !pointInPolygon(mid, RaClosed) ? 1 : -1;
        onA = false;
        idx = (bIdx + dirB + lenB) % lenB;
        continue;
      }

      // ── On Rb: hit any intersection → switch back to Ra ──
      if (!onA && cur.isInt) {
        const aIdx = cur.ix._iA;
        onA = true;
        idx = (aIdx + 1) % lenA;
        if (result.length > 2 && idx === start) break;
        continue;
      }

      // ── Advance along the current polygon ──
      if (onA) {
        idx = (idx + 1) % lenA;
        if (result.length > 2 && idx === start) break;
      } else {
        idx = (idx + dirB + lenB) % lenB;
      }
    }

    if (result.length < 3) return closeRing(Ra); // degenerate fallback
    return closeRing(result);
  }

  // Iteratively union an array of open rings into one closed ring
  function unionAllRings(openRings) {
    if (openRings.length === 0) return [];
    let result = openRings[0];
    for (let i = 1; i < openRings.length; i++) {
      const merged = unionTwoRings(result, openRings[i]);
      result = openRing(merged); // strip closing point for next iteration
    }
    return closeRing(result);
  }

  // --- Main logic ---

  const polys = input.map(item => ({
    ids: [item.id],
    ring: toRing(item.coords),
  }));

  polys.forEach(p => p.box = bbox(p.ring));

  // Union-Find
  const parent = polys.map((_, i) => i);
  function find(i) { return parent[i] === i ? i : (parent[i] = find(parent[i])); }
  function union(i, j) { parent[find(i)] = find(j); }

  for (let i = 0; i < polys.length; i++) {
    for (let j = i + 1; j < polys.length; j++) {
      if (!bboxOverlap(polys[i].box, polys[j].box)) continue;
      if (ringsIntersectOrContain(polys[i].ring, polys[j].ring)) union(i, j);
    }
  }

  // Group by root
  const groups = new Map();
  for (let i = 0; i < polys.length; i++) {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(polys[i]);
  }

  // Merge each group
  const result = [];
  for (const group of groups.values()) {
    const allIds = group.flatMap(p => p.ids).join(',');
    if (group.length === 1) {
      result.push({ ids: allIds, coords: fromRing(group[0].ring) });
    } else {
      // Proper union — every outer vertex is preserved
      const openRings = group.map(p => openRing(p.ring));
      const merged = unionAllRings(openRings);
      result.push({ ids: allIds, coords: fromRing(merged) });
    }
  }

  return result;
}

window.isDebugDistortion = false;
window.distortionBuildingStart = 0;
window.distortionBuildingEnd = 400;
function createMergedFogEffect(cityBoundary)
{
	viewer.entities.removeById('FogEffectEntity');
	buildingHoles = "";
	var mergedCoords = mergeIntersectingPolygons(window.lastHolesArray);
	//mergedCoords = mergeIntersectingPolygons(mergedCoords);
	$.each(mergedCoords, function (index, eachRow){
		if((window.isDebugDistortion == true && window.distortionBuildingStart <= index && index <= window.distortionBuildingEnd) || !window.isDebugDistortion)
		{
			buildingHoles += ' { positions: Cesium.Cartesian3.fromDegreesArray([ '+eachRow.coords.join(", ")+' ]), }, ';
		}
	});
	console.log("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundary+"), holes: ["+buildingHoles+"] }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
	eval("viewer.entities.add({ id: 'FogEffectEntity', polygon: { hierarchy: { positions: Cesium.Cartesian3.fromDegreesArray("+cityBoundary+"), holes: ["+buildingHoles+"] }, material: Cesium.Color."+getDarkOverlayColor()+".withAlpha(0.5), classificationType: Cesium.ClassificationType.CESIUM_3D_TILE, }, }) ");
}

function createMergedFogEffectV2( outerCoords) {
	//debugger;
	viewer.entities.removeById('FogEffectEntity');
	
  function toCartesian(coords) {
    const lonLat = [];
    for (let i = 0; i < coords.length; i += 2) {
      const lat = coords[i];
      const lon = coords[i + 1];
      if (
        typeof lat === 'number' && typeof lon === 'number' &&
        isFinite(lat) && isFinite(lon) &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180
      ) {
        lonLat.push(lon, lat);
      }
    }
    return lonLat.length >= 6 ? Cesium.Cartesian3.fromDegreesArray(lonLat) : null;
  }

  const holeHierarchies = lastHolesArray.reduce((acc, { id, coords }) => {
    if (!coords || coords.length < 6) return acc;
    const positions = toCartesian(coords);
    if (positions) acc.push(new Cesium.PolygonHierarchy(positions));
    return acc;
  }, []);

  const outerPositions = toCartesian(outerCoords);
  if (!outerPositions) {
    console.error('Outer polygon has invalid coordinates, aborting.');
    return;
  }

  viewer.entities.add({
    id: 'FogEffectEntity',
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(outerPositions, holeHierarchies),
      material: Cesium.Color.WHITE.withAlpha(0.5),
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      arcType: Cesium.ArcType.RHUMB,
    },
  });
}

function createFogPolygonV3(entityId, outerCoords, holes) {
	viewer.entities.removeById(entityId);
  function toCartesian(coords) {
    return Cesium.Cartesian3.fromDegreesArray(coords);
  }

	  const holeHierarchies = holes.reduce((acc, { id, coords }, index) => {
		if (index < window.distortionBuildingStart || index > window.distortionBuildingEnd) return acc;
		if (!coords || coords.length < 6) return acc;
		acc.push(new Cesium.PolygonHierarchy(toCartesian(coords)));
		return acc;
	  }, []);


  const outerPositions = toCartesian(outerCoords);
console.log('outerCoords:', outerCoords);
console.log('length:', outerCoords?.length);
console.log('sample:', outerCoords?.slice(0, 4));
  viewer.entities.add({
    id: entityId,
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(outerPositions, holeHierarchies),
      material: Cesium.Color.WHITE.withAlpha(0.5),
      height: 1,
	  extrudedHeight: 0
    },
  });
}


/* // --- USAGE ---
const input = [
  { id: 'bldg_001', coords: [-73.985, 40.762, -73.984, 40.762, -73.984, 40.763, -73.985, 40.763] },
  { id: 'bldg_002', coords: [-73.9845, 40.7625, -73.983, 40.7625, -73.983, 40.764, -73.9845, 40.764] }, // overlaps 001
  { id: 'bldg_003', coords: [-73.970, 40.750, -73.969, 40.750, -73.969, 40.751, -73.970, 40.751] },    // isolated
];

const merged = mergeIntersectingPolygons(input);
console.log(merged); */