import { AetherRift } from 'meteor/rift';

console.log('here');

AetherRift.methods({

  possessCharacter: function(charId) {
    if (!this.userId)
      throw new Meteor.Error('Anonymous user tried to activate character');

    check(charId, Match.OneOf(String, null, undefined));

    // use null for all falsy values
    charId = charId || null;

    // carefull: we cannot call this method from the client unless the rift is open
    const users = AetherRift.collection('users');
    users.update(this.userId, { $set: { activeCharacterId: charId } });
  },

});
