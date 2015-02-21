Meteor.publish('map-characters', function(xMin, xMax, yMin, yMax, mapName){
  var map = Maps[mapName];
  if (!map) return;
  var characters = map.characters;
  var selector = {
    cx:{$gte:xMin, $lte:xMax},
    cy:{$gte:yMin, $lte:yMax},
  }
  return characters.find(selector);
});
