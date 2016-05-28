/*------------------------------------------------------------
An address marks a pixelaether position in World Coordinates

See coors.md in the docs for more info
------------------------------------------------------------*/
Addr = function(addr){
  addr = addr || {};

  this.px = addr.px || 0;
  this.py = addr.py || 0;
  this.tx = addr.tx || 0;
  this.ty = addr.ty || 0;
  this.cx = addr.cx || 0;
  this.cy = addr.cy || 0;
};

/*------------------------------------------------------------
copyTo
resolve
move
set
------------------------------------------------------------*/
Addr.prototype = {

copyTo: function(target){
  if (typeof target.px === 'number') target.px = this.px;
  if (typeof target.py === 'number') target.py = this.py;
  if (typeof target.tx === 'number') target.tx = this.tx;
  if (typeof target.ty === 'number') target.ty = this.ty;
  if (typeof target.cx === 'number') target.cx = this.cx;
  if (typeof target.cy === 'number') target.cy = this.cy;
},

resolve: function(map, tileset){

  if (tileset){
    this._tileset = tileset;
    var tileWidth = tileset.tileWidth;
    var tileHeight = tileset.tileHeight;
    var halfWidth = Math.floor(tileWidth * 0.5);
    var halfHeight = Math.floor(tileHeight * 0.5);
    var px = this.px + halfWidth;
    var py = this.py + halfHeight;
    var txDiff = Math.floor(px / tileWidth);
    var tyDiff = Math.floor(py / tileHeight);
    px = (txDiff >= 0) ? px % tileWidth  : (px + tileWidth  * txDiff * -1) % tileWidth;
    py = (tyDiff >= 0) ? py % tileHeight : (py + tileHeight * tyDiff * -1) % tileHeight;
    this.px = px - halfWidth;
    this.py = py - halfHeight;
    this.tx += txDiff;
    this.ty += tyDiff;
  }

  if (map){
    this._map = map;
    var cxDiff = Math.floor(this.tx / map.chunkWidth);
    var cyDiff = Math.floor(this.ty / map.chunkHeight);
    this.cx += cxDiff;
    this.cy += cyDiff;

    // a little more complex than we like, because mode % is not what we want for negative values: (-1 % 8) != 7
    this.tx = (cxDiff >= 0) ? this.tx % (this._map.chunkWidth) : (this.tx + this._map.chunkWidth  * cxDiff * -1) % this._map.chunkWidth;
    this.ty = (cyDiff >= 0) ? this.ty % (this._map.chunkHeight): (this.ty + this._map.chunkHeight * cyDiff * -1) % this._map.chunkHeight;
  }

  return this;
},

move: function(amount){
  if (amount.tx) this.tx += amount.tx;
  if (amount.ty) this.ty += amount.ty;
  if (amount.px) this.px += amount.px;
  if (amount.py) this.py += amount.py;
  if (amount.cx) this.cx += amount.cx;
  if (amount.cy) this.cy += amount.cy;
},

set: function(coords){
  if (typeof coords.px === 'number') this.px = coords.px;
  if (typeof coords.py === 'number') this.py = coords.py;
  if (typeof coords.tx === 'number') this.tx = coords.tx;
  if (typeof coords.ty === 'number') this.ty = coords.ty;
  if (typeof coords.cx === 'number') this.cx = coords.cx;
  if (typeof coords.cy === 'number') this.cy = coords.cy;
},

}; // Addr.prototype
