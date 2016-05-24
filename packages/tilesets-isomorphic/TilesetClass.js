/*------------------------------------------------------------
A Tileset stores the metadata for a tilemap

Tile indexes start at 1 in the upper leftmost tile:
|1|2|3|
|4|5|6|
|7|8|9|

TilesetClass is designed to be a DDS objects, so it constrains
to certain limitations - EX:
- constructor sets incomplete = true
- .init method populates properties

exampleData = {
  "name":"elements",
  "imageUrl": "elements9x3.png",
  "width": 9,
  "height": 3,
  "tileWidth": 28,
  "tileHeight": 35,
  "cellWidth": 30,
  "cellHeight": 37
}
------------------------------------------------------------*/

TilesetClass = function(serverId, name){
  // generic, for all objects
  this.serverId = serverId;
  this.name = name;

  // unique to this DDS Type
  this.imageUrl = '';
  this.width  = 0;
  this.height = 0;
  this.tileWidth = 0;
  this.tileHeight = 0;
  this.cellWidth = 0;
  this.cellHeight = 0;
};

TilesetClass.prototype = {
  getUpperLeftX: function(i) {
    return (((i-1) % this.width) * this.cellWidth) + 1;
  },

  getUpperLeftY: function(i) {
    return (Math.floor((i-1) / this.width) * this.cellHeight) + 1;
  }
};
