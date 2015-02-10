Meteor.methods
  # The Client calls this method when she wants to login, but does not have a password
  # Ask the master server to send us that user's password a password for that user. That
  # Password will be pushed to the user, if she doesn't already have it.
  createAccount: (remoteUserId)->
    check remoteUserId, String
    # get user info from the master server
    userLoginInfo = AetherUplink.connection.call 'getUserLoginInfo', AetherUplink.name, remoteUserId
    if not userLoginInfo
      throw new Meteor.Error 'failed to get token from master server for userId: ' + remoteUserId

    if remoteUserId != userLoginInfo._id # hopefully this is superfluous
      throw new Meteor.Error 'Master server returned the wrong user'

    console.log 'Received user info for:', userLoginInfo.username, 'from:', AetherUplink.url
    user = Meteor.users.findOne remoteUserId
    if not user
      console.log 'Creating new user:', userLoginInfo.username, remoteUserId
      createLocalUser remoteUserId
    # finally, ensure that the user has the resume token provided by the server
    Accounts.ensureLoginToken(remoteUserId, userLoginInfo.password)
    # We haven't yet done anything with the username.


  isLoggedIn: ->
    !!@userId

# Assuming token is an un-hashed string
# Look token up in the users collection, and make sure that it
# is still valid (it hasn't expired)
Accounts.isTokenValid = (token)->
  hash = Accounts._hashLoginToken token
  user = Meteor.users.findOne(
    {'services.resume.loginTokens.hashedToken': hash})

  return false unless user

  return not _(user.services.resume.loginTokens).find (val)->
    expiration = Accounts._tokenExpiration val.when
    val.hashedToken == hash and new Date() >= expiration

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

createLocalUser = (userId)->
  Accounts.createUser
    id:userId
    username: Random.id()


# We will create all our accounts on the server
# We don't want users on the client to be able to choose their
# own ID
Accounts.config {forbidClientAccountCreation: true}

# options argument comes from Accounts.createUser method
Accounts.onCreateUser (options, user)->
  console.log 'create user options:', options
  console.log 'create user:        ', user

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
