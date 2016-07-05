exports.Players = Players =

  # defaultUserFields will be added all new user documents
  defaultUserFields:{}

  # defaultPublishedUserFields will be added to all new user
  # documents AND they will be published to clients
  defaultPublishedUserFields:{}


# Players may "activate" on a character by calling the
# possessCharacter method. User documents store the ._id for
# the active character in this field
Players.defaultPublishedUserFields.activeCharacterId = null


# Publish everything that we put in defaultPublishedUserFields
Meteor.startup -> # Meteor.startup may not be necessary
  Meteor.publish null, ->
    return @ready() unless @userId
    fields = {}
    for own key of Players.defaultPublishedUserFields
      fields[key] = 1
    return Meteor.users.find @userId, fields:fields
