/*------------------------------------------------------------
An coordess marks a pixelaether position in World Coordinates

See coors.md in the docs for more info

Methods:

copyTo
resolve
resolveMap
resolveTileset
move
set
------------------------------------------------------------*/
export class Coord {

  constructor(coord) {
    coord = coord || {};

    this.px = coord.px || 0;
    this.py = coord.py || 0;
    this.tx = coord.tx || 0;
    this.ty = coord.ty || 0;
    this.cx = coord.cx || 0;
    this.cy = coord.cy || 0;
  }

  copyTo(target) {
    if (typeof target.px === 'number') target.px = this.px;
    if (typeof target.py === 'number') target.py = this.py;
    if (typeof target.tx === 'number') target.tx = this.tx;
    if (typeof target.ty === 'number') target.ty = this.ty;
    if (typeof target.cx === 'number') target.cx = this.cx;
    if (typeof target.cy === 'number') target.cy = this.cy;
  }

  resolve(map, tileset) {
    if (map && !tileset) tileset = map.tileset;
    if (tileset) this.resolveTileset(tileset);
    if (map) this.resolveMap(map);
    return this;
  }

  resolveMap(map) {
    const cxDiff = Math.floor(this.tx / map.chunkWidth);
    const cyDiff = Math.floor(this.ty / map.chunkHeight);
    this.cx += cxDiff;
    this.cy += cyDiff;

    // a little more complex than we like, because mode % is not what we want for negative values: (-1 % 8) != 7
    this.tx = (cxDiff >= 0) ? this.tx % (map.chunkWidth) : (this.tx + map.chunkWidth  * cxDiff * -1) % map.chunkWidth;
    this.ty = (cyDiff >= 0) ? this.ty % (map.chunkHeight): (this.ty + map.chunkHeight * cyDiff * -1) % map.chunkHeight;
  }

  resolveTileset(tileset) {
    const tileWidth = tileset.tileWidth;
    const tileHeight = tileset.tileHeight;
    const halfWidth = Math.floor(tileWidth * 0.5);
    const halfHeight = Math.floor(tileHeight * 0.5);
    let px = this.px + halfWidth;
    let py = this.py + halfHeight;
    const txDiff = Math.floor(px / tileWidth);
    const tyDiff = Math.floor(py / tileHeight);
    px = (txDiff >= 0) ? px % tileWidth  : (px + tileWidth  * txDiff * -1) % tileWidth;
    py = (tyDiff >= 0) ? py % tileHeight : (py + tileHeight * tyDiff * -1) % tileHeight;
    this.px = px - halfWidth;
    this.py = py - halfHeight;
    this.tx += txDiff;
    this.ty += tyDiff;
  }

  move(amount) {
    if (amount.tx) this.tx += amount.tx;
    if (amount.ty) this.ty += amount.ty;
    if (amount.px) this.px += amount.px;
    if (amount.py) this.py += amount.py;
    if (amount.cx) this.cx += amount.cx;
    if (amount.cy) this.cy += amount.cy;
  }

  set(coord) {
    if (typeof coord.px === 'number') this.px = coord.px;
    if (typeof coord.py === 'number') this.py = coord.py;
    if (typeof coord.tx === 'number') this.tx = coord.tx;
    if (typeof coord.ty === 'number') this.ty = coord.ty;
    if (typeof coord.cx === 'number') this.cx = coord.cx;
    if (typeof coord.cy === 'number') this.cy = coord.cy;
  }

  toString() {
    return `chunk(${this.cx},${this.cy}) tile(${this.tx},${this.ty}) pixel(${this.px},${this.py})`;
  }

} // Addr class
