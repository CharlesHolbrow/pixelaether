import { Coord } from 'meteor/coord';

export class LightCatalog {
  // all inputs are an integer number of tiles
  constructor(map) {
    this.map     = map;
    this.catalog = {};
  }

  forEachChunk(func) {
    Object.keys(this.catalog).forEach((cx) => {
      const cxInt = parseInt(cx, 10);
      const cxObj = this.catalog[cx];
      Object.keys(cxObj).forEach((cy) => {
        const cyInt = parseInt(cy, 10);
        func(cxObj[cy], cxInt, cyInt);
      });
    });
  }

  clean() {
    Object.keys(this.catalog).forEach((cx) => {
      const cxObj = this.catalog[cx];
      Object.keys(cxObj).forEach((cy) => {
        if (Object.keys(cxObj[cy]).length === 0) delete cxObj[cy];
      });
      if (Object.keys(this.catalog[cx]).length === 0) delete this.catalog[cx];
    });
  }

  setLevel(ctxy, level) {
    const obj = this.catalog[ctxy.cx][ctxy.cy];
    const tileIndex = ctxy.ty * this.map.chunkWidth + ctxy.tx;
    obj[tileIndex] = level;
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
      if (!this.catalog.hasOwnProperty(cx)) {
        this.catalog[cx] = {};
      }
      for (let cy = minCy; cy <= maxCy; cy++) {
        if (!this.catalog[cx].hasOwnProperty(cy)) {
          this.catalog[cx][cy] = {};
        }
      }
    }
  }
}

export class LightMap {

  static createLightCatalog(map, startCtxy, radius, chunkCatalog) {

    if (map.incomplete) {
      console.error('cannot createLightMap on incomplete map');
      return;
    }

    const LIGHT_LEVEL = 180;
    const lightCatalog = new LightCatalog(map);
    const startCoord = new Coord(startCtxy);
    startCoord.resolve(map);
    lightCatalog.ensure(startCoord, radius);

    // TODO: don't let this throw on a bad chunk
    const isOpaque = (coord) => {
      // Try to get the chunk from chunkCatalog
      const cxObj = chunkCatalog[coord.cx];
      if (!cxObj) return null;
      const chunk = cxObj[coord.cy];
      if (!chunk) return null;

      // Cheack Each Layer
      for (const layerName of chunk.layerNames) {
        const index = chunk[layerName][coord.ty * chunk.width + coord.tx];
        if (map.tileset.prop(index, 'opaque')) return true;
      }
      return false;
    };

    lightCatalog.setLevel(startCoord, LIGHT_LEVEL);

    for (const dir of ['n', 's', 'e', 'w']) {

      const obstructedAngles = [];
      let obstructedAnglesSize = 0;

      const gen = map.losCoordGenerator(startCtxy, dir, radius);

      // iterate over each row
      for (let r = 1; r <= radius; r++) {

        // how many tiles are there on this row?
        const width = Math.abs(r * 2 + 1);
        // Every tile has two divisions (NOT width * 2 + 1).
        const divs = width * 2;
        const div = 1 / divs;

        let w = 0;

        let numObstaclesOnThisRow = 0;
        let lastTileInRowIsOpaque = false;

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

          // This is ugly, and I foolishly optimized for speed
          // However, it has two advantages:
          //
          // 1. Checking if all three angles are blocked by any
          //    combination of obstacles
          // 2. Performs minimum number of checks possible
          for (let i = 0; i < obstructedAnglesSize; i++) {
            const [obA1, obA2] = obstructedAngles[i];

            // Check if first Angle is blocked
            // a1 uses: >=, <
            // a2 uses: >=, <=
            // a3 uses: >=, <
            // In testing, these produce the cleanest shadows
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
          // if it is obstructed, we still need to check if it is
          // obstructing other tiles.

          // we must make sure this gets called every step of the way
          const coord = gen.next().value;

          // mark the tile as visible in our results
          if (tileIsVisible) {
            lightCatalog.setLevel(coord, LIGHT_LEVEL);
          }

          if (isOpaque(coord)) {
            // If the last tile in the row was opaque, we do not
            // need to create another entry in the array of
            // obstructed angles. We can just increase the size
            // of the last entry.
            if (lastTileInRowIsOpaque) {
              obstructedAngles[obstructedAngles.length - 1][1] = a3;
            } else {
              obstructedAngles.push([a1, a3]);
              numObstaclesOnThisRow++;
            }
            lastTileInRowIsOpaque = true;
          } else {
            lastTileInRowIsOpaque = false;
          }

          if (++w >= width) {
            // start a new row
            obstructedAnglesSize += numObstaclesOnThisRow;
            numObstaclesOnThisRow = 0;
            break;
          }
        }
      }
    }
    return lightCatalog;
  }
}
