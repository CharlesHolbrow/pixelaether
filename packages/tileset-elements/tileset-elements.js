import { TilesetDDS } from  'meteor/game-server-tilesets';

// Static Tilesets
TilesetDDS.add({
  name: 'elements',
  imageUrl: '/packages/tileset-elements/img/elements9x3.png',
  width: 9,
  height: 3,
  tileWidth: 28,
  tileHeight: 35,
  cellWidth: 30,
  cellHeight: 37,
  tileProperties: {
    opaque: [
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0],
    obstructed: [
      1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 0, 0, 0, 0, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  tileNames: {
    tree: 1,
    grass: 10,
    water: 11,
    ice: 12,
    dirt: 13,
    lava: [14, 15],
    path: 16,
    'stone wall': 17,
    sand: 18,
    fire: 23,
  },
});

const elements = TilesetDDS.get('elements');
elements.set('lava', 'lightRadius', 4);
