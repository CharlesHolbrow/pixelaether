import { MapDDS } from 'meteor/game-server-maps';

MapDDS.add({
  name: 'forest',
  tilesetName: 'elements',
  chunkWidth: 16,
  chunkHeight: 16,
});

MapDDS.get('forest').onNewChunk(function(chunk, callback) {
  chunk.layerNames.push('ground');
  chunk.layerNames.push('plants');
  chunk.ground = [];
  chunk.plants = [];
  for (let i = 0; i < this.chunkSize; i++) {
    const tiles = [];
    chunk.ground[i] = 10;
    tiles.push(10);
    if (!Math.floor(Math.random() * 2)) { // one in two
      chunk.plants[i] = 23;  // fire
      tiles.push(1); // tree
    } else {
      chunk.plants[i] = 0;
    }
    chunk[i] = tiles;
  }
  callback(null, chunk);
});
