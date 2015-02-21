Meteor.methods({

focusOnCharacter: function(charId) {
  if (!this.userId)
    throw new Meteor.Error('Anonymous user tried to focus');

  check(charId, Match.OneOf(String, null, undefined));

  // use null for all falsy values
  charId = charId || null;

  Meteor.users.update(this.userId, {$set:{focusCharacterId:charId}});
},

});
