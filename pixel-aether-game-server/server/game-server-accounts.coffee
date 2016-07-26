# require 'meteor/ongoworks:ddp-login@0.2.1'

{ Accounts }      = require 'meteor/accounts-base' # accounts-base in 'implied' by api.use('accounts-password')
{ Random }        = require 'meteor/random'
{ check }         = require 'meteor/check'
{ _ }             = require 'meteor/underscore'
{ GameServers }   = require 'meteor/game-servers'
{ DDP }           = require 'meteor/ddp'
{ AetherUplink }  = require './aether-uplink.coffee'


Meteor.methods

  # The Client calls this method when she wants to login, but
  # does not have a working token. Ask the master server to
  # send us that user's token a token for our server. That
  # Password will be pushed to the user, if she doesn't already
  # have it.
  createAccount: (remoteUserId)->
    check remoteUserId, String
    # get user info from the master server
    userLoginInfo = AetherUplink.connection.call(
      'getUserLoginInfo', GameServers.localId(), remoteUserId)

    if not userLoginInfo
      throw new Meteor.Error 'failed to get token from master server for userId: ' + remoteUserId

    if remoteUserId != userLoginInfo._id # hopefully this is superfluous
      throw new Meteor.Error 'Master server returned the wrong user'

    username = userLoginInfo.username
    id = userLoginInfo._id

    Accounts.ensureUserName id, username
    user = Meteor.users.findOne id
    if not user
      console.log 'Creating new user:', username, remoteUserId
      Accounts.createUser {id:id, username:username}

    # Finally, ensure that the user has the resume token
    # provided by the server
    Accounts.ensureLoginToken(remoteUserId, userLoginInfo.token)


  # Helper method. Only used for testing
  isLoggedIn: ->
    !!@userId


# If the user has the token already, do nothing.
# Else, add the token to the user
Accounts.ensureLoginToken = (userId, token)->
  user = Meteor.users.findOne(userId)
  if not user
    throw new Meteor.Error 'That user does not exist'

  stampedToken = {token: token, when: (new Date)}
  hashedStampedToken = Accounts._hashStampedToken stampedToken
  hash = hashedStampedToken.hashedToken

  # Make sure a different user doesn't already have this token
  otherUser = Meteor.users.findOne
    _id: {$ne: userId}
    'services.resume.loginTokens.hashedToken': hash
  if otherUser
    throw 'Illegal Token'

  # Make sure the user doesn't already have this token
  userWithToken = Meteor.users.findOne
    _id:userId,
    'services.resume.loginTokens.hashedToken': hash
  if userWithToken
    return

  Accounts._insertHashedLoginToken userId, hashedStampedToken
  return


# Make sure that a username is available for a user account
#
# Usernames are a unique field in the database. We want
# our master server to have priority when naming users. If
# We can find a user that has the specified username,
# rename her, so we can give this user the name proscribed by
# the master server.
#
# If the user with userId exists, update their username field.
Accounts.ensureUserName = (userId, username)->
  check userId, String
  check username, String
  newName = username + '_' + Random.id()
  numberChanged = Meteor.users.update(
    {_id:{$ne:userId}, username:username},
    {$set:{username:newName}})
  if numberChanged
    console.log 'Renamed old user to:', newName
  Meteor.users.update userId, {$set:{username:username}}


# Assuming token is an un-hashed string
# Look token up in the users collection, and make sure that it
# is still valid (it hasn't expired)
isTokenValid = (token)->
  hash = Accounts._hashLoginToken token
  user = Meteor.users.findOne(
    {'services.resume.loginTokens.hashedToken': hash})
  return false unless user

  return not _(user.services.resume.loginTokens).find (val)->
    expiration = Accounts._tokenExpiration val.when
    val.hashedToken == hash and new Date() >= expiration


# We will create all our accounts on the server
# We don't want users on the client to be able to choose their
# own ID
Accounts.config {forbidClientAccountCreation: true}

# options argument comes from Accounts.createUser method
Accounts.onCreateUser (options, user)->
  if options.profile
    user.profile = options.profile
  if options.id and typeof options.id == 'string'
    user._id = options.id
  return user

Accounts.validateLoginAttempt (attemptInfo)->
  if attemptInfo.allowed then return true
  # We generate this custom error, to tell the client to call
  # the createAccount method
  throw new Meteor.Error 'CALL CREATE ACCOUNT'
