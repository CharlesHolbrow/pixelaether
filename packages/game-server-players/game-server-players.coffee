exports.Players = Players =

  # defaultUserFields will be added all new user documents
  defaultUserFields: {}

  # defaultPublishedUserFields will be added to all new user
  # documents AND they will be published to clients
  defaultPublishedUserFields: {}

  # publishUserFields will be published, but not added by
  # default. Useful for fields with a unique, sparse index.
  publishedUserFields: {}


# Publish everything that we put in defaultPublishedUserFields
Meteor.startup -> # Meteor.startup may not be necessary
  Meteor.publish null, ->
    return @ready() unless @userId
    fields = {}
    for own key of Players.defaultPublishedUserFields
      fields[key] = 1
    for own key of Players.publishedUserFields
      fields[key] = 1
    return Meteor.users.find @userId, fields:fields
