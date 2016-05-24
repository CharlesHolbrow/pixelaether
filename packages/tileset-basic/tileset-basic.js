// Write your package code here!

// Variables exported by this module can be imported by other packages and
// applications. See tileset-basic-tests.js for an example of importing.
import { TilesetDDS } from  'meteor/game-server-tilesets';

// Static Tilesets
TilesetDDS.add({
  "name":"elements",
  "imageUrl": "/packages/tileset-basic/img/elements9x3.png",
  "width": 9,
  "height": 3,
  "tileWidth": 28,
  "tileHeight": 35,
  "cellWidth": 30,
  "cellHeight": 37
});

TilesetDDS.add({
  "name":"characters",
  "imageUrl": "/packages/tileset-basic/img/characters5x1.png",
  "width": 5,
  "height": 1,
  "tileWidth": 28,
  "tileHeight": 35,
  "cellWidth": 30,
  "cellHeight": 37
});
