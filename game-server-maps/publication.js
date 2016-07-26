// allow subscription to a range of chunks
Meteor.publish('map', function(xMin, xMax, yMin, yMax, mapName) {
  xMin = (typeof xMin === 'number') ? xMin : -1;
  xMax = (typeof xMax === 'number') ? xMax : 1;
  yMin = (typeof yMin === 'number') ? yMin : -1;
  yMax = (typeof yMax === 'number') ? yMax : 1;
  mapName = mapName || 'main';

  var map = Maps[mapName];
  var chunks = map.chunks;
  var characters = map.characters;

  var selector = {
    cx:{$gte:xMin, $lte:xMax},
    cy:{$gte:yMin, $lte:yMax},
  }

  var cursor = chunks.find(selector);

  // Create the requested chunks if necessary
  var size = (xMax - xMin + 1) * (yMax - yMin + 1);
  if (cursor.count() !== size) {
    for (var x = xMin; x <= xMax; x++) {
      for (var y = yMin; y <= yMax; y++) {
        var selector = {cx:x, cy:y};
        if (!chunks.findOne(selector)) {
          console.log('Create New Chunk:', selector);
          map.createNewChunk(x, y);
        }
      }
    }
  }
  return cursor;
});
