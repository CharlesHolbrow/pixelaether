Meteor.methods({
  setTile: function(mapName, ctxy, i, level) {
    if (!this.userId) {
      throw new Meteor.Error('not logged in');
    }

    if (level >= 5) {
      throw new Meteor.Error('user can only tiles on levels 0-4');
    }

    const map = Maps.getMap(mapName);
    if (!map) throw new Meteor.Error(`Map does not exist: ${mapName}`);
    map.setTile(ctxy, i, level);
  },
});
