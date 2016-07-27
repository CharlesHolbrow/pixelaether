/*------------------------------------------------------------
Server interface for Maps exports:
- MapsDDS.add(options)

Once a map has been added, it is accessible from:
- Maps[name]
- Maps.getMap(name) // isomorphic

Interface for individual maps:
- Maps[name].chunks
- Maps[name].onNewChunk(function(chunk, callback){
    chunk.layerNames.push('ground');
    chunk.ground = [0, 1, 2, 3... ];
    callback(null, chunk);
  });
------------------------------------------------------------*/
Maps = {};

Maps.getMap = function(mapName){
  var map = Maps[mapName];
  if (map && map.chunks && map.characters)
    return map;
  throw new Meteor.Error('Maps.getMap fail: No map named ' + mapName);
};

Maps.getChunks = function(mapName){
  var map = Maps.getMap(mapName);
  return map.chunks;
};

Maps.getCharacters = function(mapName){
  var map = Maps.getMap(mapName);
  return map.characters;
};

MapDDS = new DDS('map', MapClass);
