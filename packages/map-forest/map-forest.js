import { MapDDS } from 'meteor/game-server-maps';

MapDDS.add({
  name: 'forest',
  tilesetName: 'elements',
  chunkWidth: 16,
  chunkHeight: 16,
});

MapDDS.get('forest').onNewChunk(function(chunk, callback) {
  for (let i = 0; i < this.chunkSize; i++) {
    const tiles = [];
    tiles.push(10);
    if (!Math.floor(Math.random() * 2)) tiles.push(1); // tree
    chunk[i] = tiles;
  }
  callback(null, chunk);
});
