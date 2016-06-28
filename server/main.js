// Static Maps
MapDDS.add({
  name: 'main',
  tilesetName: 'elements',
  chunkWidth: 16,
  chunkHeight: 16,
});
MapDDS.add({
  name: 'second',
  tilesetName: 'elements',
  chunkWidth: 16,
  chunkHeight: 8,
});
MapDDS.add({
  name: 'third',
  tilesetName: 'elements',
  chunkWidth: 4,
  chunkHeight: 5,
});

MapDDS.get('main').onNewChunk(function(chunk, callback) {
  chunk.layerNames.push('ground');
  chunk.layerNames.push('plants');
  chunk.ground = [];
  chunk.plants = [];
  for (let i = 0; i < this.chunkSize; i++) {
    chunk.ground[i] = 10;
    if (!Math.floor(Math.random() * 5)) // one in five
      chunk.plants[i] = 1;
    else
      chunk.plants[i] = 0;
    chunk[i] = [chunk.ground[i], chunk.plants[i]];
  }
  callback(null, chunk);
});

MapDDS.get('third').onNewChunk(function(chunk, callback) {
  chunk.layerNames.push('ground');
  chunk.ground = [];
  for (let i = 0; i < this.chunkSize; i++) {
    chunk.ground[i] = 10;
    chunk[i] = chunk.ground[i];
  }
  callback(null, chunk);
});
