staticServerContent = function(){

  // Static Tilesets
  TilesetDDS.add({
    "name":"elements",
    "imageUrl": "elements9x3.png",
    "width": 9,
    "height": 3,
    "tileWidth": 28,
    "tileHeight": 35,
    "cellWidth": 30,
    "cellHeight": 37
  });
  TilesetDDS.add({
    "name":"characters",
    "imageUrl": "characters5x1.png",
    "width": 5,
    "height": 1,
    "tileWidth": 28,
    "tileHeight": 35,
    "cellWidth": 30,
    "cellHeight": 37
  });

  // Static Maps
  MapDDS.add({
    "name": "main",
    "tilesetName": "elements",
    "chunkWidth": 16,
    "chunkHeight": 16
  });
  MapDDS.add({
    "name": "second",
    "tilesetName": "elements",
    "chunkWidth": 16,
    "chunkHeight": 8
  });
  MapDDS.add({
    "name": "third",
    "tilesetName": "elements",
    "chunkWidth": 4,
    "chunkHeight": 5
  });

  MapDDS.get('main').onNewChunk(function(chunk, callback){
    chunk.layerNames.push('ground');
    chunk.layerNames.push('plants');
    chunk.ground = [];
    chunk.plants = [];
    for (var i = 0; i < this.chunkSize; i++){
      chunk.ground[i] = 10;
      if (!Math.floor(Math.random() * 5 )) // one in five
        chunk.plants[i] = 1;
      else
        chunk.plants[i] = 0;
    }
    callback(null, chunk);
  });

  MapDDS.get('third').onNewChunk(function(chunk, callback){
    chunk.layerNames.push('ground');
    chunk.ground = [];
    for (var i = 0; i < this.chunkSize; i++)
      chunk.ground[i] = 10;
    callback(null, chunk);
  });

};
