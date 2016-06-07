var ctpxyPattern = {
  cx: Match.Integer,
  cy: Match.Integer,
  tx: Match.Integer,
  ty: Match.Integer,
  px: Match.Optional(Match.Integer),
  py: Match.Optional(Match.Integer),
  mapName: Match.Optional(String)
};

// Mongo.ObjectId unsupported in match
// https://github.com/meteor/meteor/issues/1834
var characterPattern = Match.ObjectIncluding({_id:Match.Any});

Meteor.methods({

moveCharacterTo: function(mapChar, ctpxy) {
  check(mapChar, characterPattern);
  check(ctpxy, ctpxyPattern); // see additional check inside map.moveCharacterTo

  // verify user is logged in
  if (!this.userId)
    throw new Meteor.Error('Anonymous user tried to call moveCharacterTo method');

  // verify the user owns the character
  var mainChar = Characters.findOne({ownerId:this.userId, _id:mapChar._id});
  if (!mainChar)
    throw new Meteor.Error('User tried to move character she does not own');

  if (!ctpxy.mapName || ctpxy.mapName === mainChar.mapName) {
    // We can stay on the current map
    var map = Maps.getMap(mainChar.mapName);

    var obstacles = map.isObstructed(ctpxy);
    if (obstacles)
      throw new Meteor.Error('Position obstructed');

    map.moveCharacterTo(mainChar._id, ctpxy);
  }
  else
    // We are switching to a different map
    Characters.toAddr(mainChar._id, ctpxy);
}

}); // Meteor.methods
