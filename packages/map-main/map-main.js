import { MapDDS } from 'meteor/game-server-maps';

MapDDS.add({
  name: 'main',
  tilesetName: 'elements',
  chunkWidth: 10,
  chunkHeight: 10,
});

MapDDS.get('main').onNewChunk(function(chunk, callback) {
  const chunkSize = chunk.width * chunk.height;
  for (let i = 0; i < chunkSize; i++) {
    chunk[i] = [10];
    // place a tree @ one in four
    if (!Math.floor(Math.random() * 4)) chunk[i].push(1);
  }
  callback(null, chunk);
});
