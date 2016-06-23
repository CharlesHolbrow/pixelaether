import { Coord } from 'meteor/coord';

export class LightCatalog {
  // all inputs are an integer number of tiles
  constructor(map, maxRadius) {

    if (map.incomplete) {
      throw new Error('cannot create LightCatalog with incomplete map');
    }

    this.map = map;
    this.maxRadius = maxRadius;

    const chunkWidth = map.chunkWidth;
    const chunkHeight = map.chunkHeight;

    // figure out how many chunks we need to create
    // widthInTiles is the same as heightInTiles
    const widthInTiles = maxRadius * 2 + 1;
    this.numberOfChunksWide = Math.ceil(widthInTiles / chunkWidth) + 1;
    this.numberOfChunksHigh = Math.ceil(widthInTiles / chunkHeight) + 1;
    this.numberOfChunks = this.numberOfChunksWide * this.numberOfChunksHigh;


    // create all our light arrays
    const chunkLength = chunkWidth * chunkHeight;
    this.dirtyArrays = [];
    for (let i = 0; i < this.numberOfChunks; i++) {
      const lightArray = new Int16Array(chunkLength);
      lightArray.fill(0);
      this.dirtyArrays.push(lightArray);
    }

    this.catalog = {};
  }

  center(ctxy) {
    const cursor = new Coord(ctxy);
    cursor.move({ tx: - this.maxRadius, ty: - this.maxRadius });
    cursor.resolveMap(this.map);
    const minCx = cursor.cx;
    const minCy = cursor.cy;
    const maxCx = minCx + this.numberOfChunksWide - 1; // (-1 for fencepost error)
    const maxCy = minCy + this.numberOfChunksHigh - 1; // (-1 for fencepost error)


    // find which arrays can be recycled
    for (let cx of Object.keys(this.catalog)) {
      const cxObj = this.catalog[cx];
      cx = parseInt(cx, 10);

      if (cx < minCx || cx > maxCx) {
        // we don't need this entire row
        // Copy the objects over to dirtyArrays
        for (const cy of Object.keys(cxObj)) {
          this.dirtyArrays.push(cxObj[cy]);
        }
        // remove this entire row from the catalog
        delete this.catalog[cx];
      } else {
        for (let cy of Object.keys(cxObj)) {
          cy = parseInt(cy, 10);
          if (cy < minCy || cy > maxCy) {
            dirtyCatalog[cx][cy] = cxObj[cy];
            this.dirtyArrays.push(cxObj[cy]);
            delete cxObj[cy];
          }
        }

      }
    }

    // replace and missing arrays f
    for (let cx = minCx; cx <= maxCx; cx++) {

      if (!this.catalog.hasOwnProperty(cx)) {
        this.catalog[cx] = {};
      }

      for (let cy = minCy; cy <= maxCy; cy++) {
        if (!this.catalog[cx].hasOwnProperty(cy)) {
          const array = this.dirtyArrays.pop();
          array.fill(0);
          this.catalog[cx][cy] = array;
        }
      }
    }
  }
}

export class LightMap {
  constructor(centerCtxy, radius, chunkCatalog) {
    this.chunkCatalog = chunkCatalog || {};
    this.radius       = radius;
    this.centerCoord  = new Coord(centerCtxy);
    this.lightCatalog = {};
  }
}
