var ctxyPattern = {
  cx: Match.Optional(Match.Integer),
  cy: Match.Optional(Match.Integer),
  tx: Match.Optional(Match.Integer),
  ty: Match.Optional(Match.Integer),
  mapName: Match.Optional(String)
};

// Mongo.ObjectId unsupported in match
// https://github.com/meteor/meteor/issues/1834
var characterPattern = Match.ObjectIncluding({_id:Match.Any});

Meteor.methods({

moveCharacterTo: function(mapChar, ctxy) {
  check(mapChar, characterPattern);
  check(ctxy, ctxyPattern); // also checked inside map.moveCharacterTo

  // verify user is logged in
  if (!this.userId)
    throw new Meteor.Error('Anonymous user tried to call moveCharacterTo method')

  // verify the user owns the character
  var mainChar = Characters.findOne({ownerId:this.userId, _id:mapChar._id})
  if (!mainChar)
    throw new Meteor.Error('User tried to move character she does not own');

  if (!ctxy.mapName || ctxy.mapName === mainChar.mapName) {
    // We can stay on the current map
    var map = Maps.getMap(mainChar.mapName);
    map.moveCharacterTo(mainChar._id, ctxy);
  }
  else
    // We are switching to a different map
    Characters.toAddr(mainChar._id, ctxy);
}

}); // Meteor.methods
