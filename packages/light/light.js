import { Coord } from 'meteor/coord';

// LightMap stores the projection of one or more light sources.
// Light levels are stored in the .data object two levels deep.
// The following example of a data object stores a light level
// of 127 at {cx:3, cy:-1, tx:0, ty:0}
// note that tile indexes are rasterized the same as they are
// stored in chunks.
//
// this.data = {
//   '3': {
//     '-1': {0: 127}
//   }
// }

// Catalog must be agnostic of the kind of array
export class Catalog {

  constructor(map, ArrayType = null) {
    this.map  = map;
    this.data = {};
    this.ArrayType = ArrayType;
  }

  createChunkObject() {
    if (!this.ArrayType)
      return {};
    if (this.map.incomplete)
      throw new Error('Cannot create new array with incomplete map');
    return new this.ArrayType(this.map.chunkSize);
  }

  forEachChunk(func) {
    Object.keys(this.data).forEach((cx) => {
      const cxInt = parseInt(cx, 10);
      const cxObj = this.data[cx];
      Object.keys(cxObj).forEach((cy) => {
        const cyInt = parseInt(cy, 10);
        // Note that the first argument is not a chunk. It is a
        // lightMap for the chunk at the specified cxy coord
        func(cxObj[cy], cxInt, cyInt);
      });
    });
  }

  clean() {
    Object.keys(this.data).forEach((cx) => {
      const cxObj = this.data[cx];
      Object.keys(cxObj).forEach((cy) => {
        if (Object.keys(cxObj[cy]).length === 0) delete cxObj[cy];
      });
      if (Object.keys(this.data[cx]).length === 0) delete this.data[cx];
    });
  }

  set(ctxy, level) {
    const obj = this.data[ctxy.cx][ctxy.cy];
    const tileIndex = ctxy.ty * this.map.chunkWidth + ctxy.tx;
    obj[tileIndex] = level;
  }

  get(ctxy) {
    const cxObj = this.data[ctxy.cx];
    if (!cxObj) return null;
    const chunk = cxObj[ctxy.cy];
    if (!chunk) return null;
    index = ctxy.ty * this.map.chunkWidth  + ctxy.tx;
    return chunk[index];
  }

  ensureChunk(cx, cy) {
    if (typeof cx !== 'number' || typeof cy !== 'number')
      throw new Error('invalid cxy');

    if (!this.data.hasOwnProperty(cx)) {
      this.data[cx] = {};
    }
    const cxObj = this.data[cx];
    if (!cxObj.hasOwnProperty(cy))
      cxObj[cy] = this.createChunkObject();
  }

  removeChunk(cx, cy) {
    if (!this.data.hasOwnProperty(cx)) return;
    const cxObj = this.data[cx];
    if (!cxObj.hasOwnProperty(cy)) return;
    delete cxObj[cy];
  }

  // maxRadius is an integer number of tiles
  // ensure that all the chunks in the range
  ensure(ctxy, maxRadius) {

    if (this.map.incomplete)
      throw new Error('Cannot ensure without complete map');

    // Figure out which chunks we need to create
    const widthInTiles = maxRadius * 2 + 1;
    const cursor = new Coord(ctxy);

    cursor.move({ tx: - maxRadius, ty: - maxRadius });
    cursor.resolveMap(this.map);
    const minCx = cursor.cx;
    const minCy = cursor.cy;

    cursor.move({ tx: widthInTiles, ty: widthInTiles });
    cursor.resolve(this.map);
    const maxCx = cursor.cx;
    const maxCy = cursor.cy;

    // create any missing arrays
    for (let cx = minCx; cx <= maxCx; cx++) {
      if (!this.data.hasOwnProperty(cx)) {
        this.data[cx] = {};
      }
      for (let cy = minCy; cy <= maxCy; cy++) {
        if (!this.data[cx].hasOwnProperty(cy)) {
          this.data[cx][cy] = this.createChunkObject();
        }
      }
    }
  }
}

export class LightMap {

  // generate entirely new lightCatalog
  createLightCatalog(map, startCtxy, radius, opacityMap) {

    if (map.incomplete) {
      console.error('cannot createLightMap on incomplete map');
      return;
    }

    // For each quadrant, we have an array of arrays. Each inner
    // array contians an angle range, [min, max]
    obstructionCompass = { n: [], s: [], e: [], w: [] };

    // Each array above stores obstructed angles for all rows.
    // We want to track which angles ranges refer to which rows.
    //
    // Example:
    //
    // rowIndexCompass['n'][4] = 3
    //
    // This would mean that obstacles on the 4th row begin at
    //
    // obstructionCompass['n'][3]
    //
    // However, it does not gaurantee that the value stored
    // there is defined. Becuase the first row that we check is
    // considered index = 1, we initialize each array with two
    // zeros instead of one.
    rowIndexCompass    = { n: [0, 0], s: [0, 0], e: [0, 0], w: [0, 0] };


    const LIGHT_LEVEL = 180;
    const lightCatalog = new Catalog(map);
    const startCoord = new Coord(startCtxy);
    startCoord.resolve(map);
    lightCatalog.ensure(startCoord, radius);
    lightCatalog.set(startCoord, LIGHT_LEVEL);

    for (const dir of ['n', 's', 'e', 'w']) {

      const gen = map.losCoordGenerator(startCtxy, dir, radius);
      const compassDirAngles      = obstructionCompass[dir];
      const compassDirRowIndices  = rowIndexCompass[dir];

      // iterate over each row
      for (let r = 1; r <= radius; r++) {

        // how many tiles are there on this row?
        const width = Math.abs(r * 2 + 1);
        // Every tile has two divisions (NOT width * 2 + 1).
        const divs = width * 2;
        const div = 1 / divs;

        let w = 0;

        let previousTileInRowIsOpaque = false;

        const rowStopIndex = compassDirRowIndices[r];

        while (true) {

          // Find the three angles for this tile. In Chrome, using
          // multiplication (not repeated addition) yields more
          // accurate floating point angles.
          // .2 + .2 + .2 + .2 === 0.8000000000000001
          // .2 * 4            === 0.8

          const a1 = w * 2 * div;
          const a2 = (w * 2 + 1) * div;
          // The last time through the loop, we may get a floating
          // point arithmatic error. (.99999999 instead of 1)
          // If this is the last tile on the row, set final angle
          // to 1.
          const a3 = (w === width - 1) ? 1 : (w * 2 + 2) * div;

          // Check if this tile is obstructed by previous rows

          let tileIsVisible = true;
          let a1Visible = true;
          let a2Visible = true;
          let a3Visible = true;

          // This loop is complex, but has two advantages:
          //
          // 1. It checks if all three angles are blocked by any
          //    combination of obstacles
          // 2. It performs minimum number of checks possible
          for (let i = 0; i < rowStopIndex; i++) {
            const [obA1, obA2] = compassDirAngles[i];

            // Check if first Angle is blocked
            // a1 uses: >=, <
            // a2 uses: >=, <=
            // a3 uses: >=, <
            // In testing, these produce symetrical shadows
            if  (a1Visible && a1 >= obA1 && a1 < obA2) {
              a1Visible = false;
              if (!a2Visible && !a3Visible) { tileIsVisible = false; break; }
            }
            // check if center is blocked
            if  (a2Visible && a2 >= obA1 && a2 <= obA2) {
              a2Visible = false;
              if (!a1Visible && !a3Visible) { tileIsVisible = false; break; }
            }
            //  check if last Angle is blocked
            if  (a3Visible && a3 > obA1 && a3 <= obA2) {
              a3Visible = false;
              if (!a1Visible && !a2Visible) { tileIsVisible = false; break; }
            }
          }

          // We now know if the tile is obstructed (or not). Even
          // if it is obstructed, we still check if it is
          // obstructing other tiles.

          // we must make sure this gets called every step of the way
          const coord = gen.next().value;

          // mark the tile as visible in our results
          if (tileIsVisible) {
            // The light level of tiles on the diagonal can be
            // set by two different quadrants. Both quadrants
            // should set it to the same level. The 'e' and 'w'
            // quadrants trust that the light level will be set
            // by the 'n' and 's' quadrants
            if ((dir === 'n' || dir === 's') || (a1 !== 0 && a3 !== 1))
              lightCatalog.set(coord, LIGHT_LEVEL);
          }

          if (opacityMap.get(coord)) {
            // If the last tile in the row was opaque, we do not
            // need to create another entry in the array of
            // obstructed angles. We can just increase the size
            // of the last entry.
            if (previousTileInRowIsOpaque) {
              compassDirAngles[compassDirAngles.length - 1][1] = a3;
            } else {
              compassDirAngles.push([a1, a3]);
            }
            previousTileInRowIsOpaque = true;
          } else {
            previousTileInRowIsOpaque = false;
          }

          if (++w >= width) {
            // start a new row
            // On our next row, include obstacles up to, but not including this index;
            compassDirRowIndices[r + 1] = compassDirAngles.length;
            break;
          }
        } // finished iterating over a row
      }
    }
    return lightCatalog;
  }
}
