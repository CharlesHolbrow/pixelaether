Meteor.methods({
  setTile: function(mapName, ctxy, i, layerName){
    var map = Maps.getMap(mapName);
    if (!map) throw new Meteor.Error("Map does not exist: " + mapName);
    map.setTile(ctxy, i, layerName);
  }
});