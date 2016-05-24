import { MapDDS } from 'meteor/game-server-maps';

MapDDS.add({
  "name": "forest",
  "tilesetName": "elements",
  "chunkWidth": 16,
  "chunkHeight": 16
});

MapDDS.get('forest').onNewChunk(function(chunk, callback){
  chunk.layerNames.push('ground');
  chunk.layerNames.push('plants');
  chunk.ground = [];
  chunk.plants = [];
  for (var i = 0; i < this.chunkSize; i++){
    chunk.ground[i] = 10;
    if (!Math.floor(Math.random() * 2 )) // one in two
      chunk.plants[i] = 1;
    else
      chunk.plants[i] = 0;
  }
  callback(null, chunk);
});
