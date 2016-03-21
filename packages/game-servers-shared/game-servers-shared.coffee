# This code needs to run in three different places
# - Master Server (client and server)
# - Game Servers (server only)
#
# This file is also responsible for initializing:
# - GameServers                         (mongo collection)
# - GameServers.masterUsersCollection   (mongo collection)
# - GameServers.masterServerConnection  (server connection)
# - GameServers.localName()             (method)
# - GameServers.localId()               (method)
# - master game-servers subscription    (subscription)
#
# This file also currently actually generates the localId and
# localName values. These values are derived from
# 1. The is-dev-mode package
# 2. APP_ID, which is automatically inserted into pixel.json
# 3. SERVER_NAME, which must be manually added to pixel.json

# Master Server should set MASTER_SERVER_URL to an empty string
masterServerUrl = urlz.clean(Meteor.settings?.public?.MASTER_SERVER_URL or Meteor.absoluteUrl())
isMasterServer  = Meteor.isServer and not Meteor.settings?.public?.MASTER_SERVER_URL?.length
isGameServer    = Meteor.isServer and not isMasterServer

# Slightly hacky way to check if we are in Dev mode on the
# client and server without making a call to the server
isDevMode = !!Package['is-dev-mode']

# On the server, "local" refers to the server where the code is
# executing. On the clinet "local" refers to the master server.
# these values are exposed via the GameServers localId() and
# localName() methods.
localUrl = Meteor.absoluteUrl()

# Get the augmented id (with 'D' or 'P') and the app name from
# pixel.json
localId = Meteor.settings.public.APP_ID
if not localId then throwMissingSettingsError 'Missing public.APP_ID in pixel.json'
localId = (if isDevMode then 'D' else 'P') + localId
localName = Meteor.settings.public.SERVER_NAME
if not localName then throwMissingSettingsError '\
    You must specify public.SERVER_NAME in pixel.json. \
    You choose your own server, but it must be all lower case \
    letters, numbers. underscore and dash characters also \
    permitted'

if isMasterServer
  GameServers = new Mongo.Collection 'game_servers'
  GameServers._ensureIndex {name:1}, {unique: true}
  GameServers._ensureIndex {url:1}, {unique: true}
  GameServers.masterServerConnection  = Meteor.connection
  GameServers.masterUsersCollection   = Meteor.users

else if isGameServer
  masterServerConnection              = DDP.connect masterServerUrl
  GameServers                         = new Mongo.Collection 'game_servers', {connection: masterServerConnection}
  GameServers.masterUsersCollection   = new Mongo.Collection 'users', {connection: masterServerConnection}
  GameServers.gameServersSubscription = masterServerConnection.subscribe 'game-servers'
  GameServers.masterServerConnection  = masterServerConnection

else if Meteor.isClient
  GameServers = new Mongo.Collection 'game_servers'
  GameServers.masterServerConnection  = Meteor.connection
  GameServers.masterUsersCollection   = Meteor.users
  GameServers.gameServersSubscription = Meteor.subscribe 'game-servers'

if Meteor.isServer
  GameServers.localId       = -> return localId
  GameServers.localName     = -> return localName

if Meteor.isClient or isMasterServer
  GameServers.masterId      = -> return localId
  GameServers.masterName    = -> return localName

GameServers.isMasterServer  = -> return isMasterServer
GameServers.isGameServer    = -> return isGameServer
GameServers.masterServerUrl = -> return masterServerUrl

# Generate an ID indicating the object originated on this server
GameServers.newId = (firstPart, serverId)->
  if Meteor.isClient and not serverId
    throw new Meteor.Error 'Cannot generate a client side id without specifying a serverId'
  serverExt = '_' + (serverId or GameServers.localId())
  # If no string is provided, Generate a random id for the first part
  if typeof firstPart is 'undefined'
    return Random.id() + serverExt

  # A string was provided. If it's not valid, throw
  else if not GameServers.isSimpleId(firstPart)
    throw new Meteor.Error 'bad-id', 'Not a valid id part: ' + firstPart

  # The provided string was valid
  return firstPart + serverExt


# If the string is a simple ID return it. Else return false
GameServers.isSimpleId = (str)=>
  return false if typeof str is not 'string'
  if /^[A-Za-z0-9]{2,32}$/.test(str) then str else false

# return the serverID if the string is a long_id
GameServers.extractServerId = (str)=>
  return false unless typeof str is 'string'
  parts = str.split('_')
  return false unless parts.length is 2
  p0 = GameServers.isSimpleId parts[0]
  p1 = GameServers.isSimpleId parts[1]
  if p0 and p1 then p1 else false

# Return a url for the id, or undefined if not found
# id can be a long style id or a short style id.
#
# If serverId string starts with the word 'MASTER', optionally
# preceeded by 'D' or 'P', instantly return the master server
# url.
#
# If we request the localServer, then idToUrl returns
# immediately with the correct url. If we request another
# server from the client, then the result is reactive, but may
# initially return undefined while we wait for the GameServers
# and Users collections to sync with the server.
GameServers.idToUrl = (serverId, userId)=>
  return masterServerUrl if /^[DP]?MASTER/.test(serverId)
  serverId = GameServers.isSimpleId(serverId) or GameServers.extractServerId(serverId)
  return undefined unless serverId
  return localUrl if serverId == localId
  return GameServers.findOneForUser(serverId, userId)?.url

GameServers.urlToId = (url, userId)->
  if typeof url != 'string' then throw new Meteor.Error 'bad-url', 'url must be a string'
  url = urlz.clean url
  return localId if url == localUrl
  return GameServers.findOneForUser({url}, userId)?._id

# There are two places where Game Servers are stored.
# 1. Production servers are stored in the GameServers
#    collection
# 2. Development servers are stored on user's
#    devGameServersById sub-document
#
# This method searches both places for a given user, provided
# selector is an string ID, or an object containing any
# combination of 'url', 'name', and 'key' fields.
#
# Meteor.userId() defaults to the logged in user. We may want
# be using findOneForUser over a connection other than
# Meteor.absoluteUrl(). If we are, we can't use Meteor.users
# to lookup our development servers.
#
# Note that the call is reactive.
GameServers.findOneForUser = (selector, userId)->
  users = GameServers.masterUsersCollection
  server = GameServers.findOne(selector)
  return server if server
  userId ?= GameServers.masterServerConnection.userId()
  return unless userId
  user = users.findOne userId, fields:{devGameServersById:1}
  if typeof selector is 'string'
    return user.devGameServersById[selector]
  else
    return _(user.devGameServersById).findWhere selector

# Pattern also used by game-servers and game-servers-master
serverSelectorPattern = Match.OneOf String, {
  name: Match.Optional(String),
  url: Match.Optional(String),
  _id: Match.Optional(String),
}

# If we are missing --settings pixel.json, or failed to get
# login credentials from pixel.json, we can throw this error
#
# Note that game-servers loads after game-server-shared, so we
# must not throw this error this package is loading
if Meteor.isServer then throwMissingSettingsError = (message)->

  console.error message if message

  console.error """
  Always Run Pixel Aether servers with --settings pixel.json

  pixel.json will be generated automatically the first time you
  run your project in development mode.

  You must specify an email and password in pixel.json. These
  are the same credentials that you created you account on
  www.pixelaether.com

  # When you run a dev server:
  $ meteor --settings pixel.json

  # When you deploy to production:
  $ meteor deploy YourAddress.com --settings pixel.json
  """

  throw new Error message or """
  --- ERROR ---
  You must run and deploy meteor with --settings pixel.json
  You must specify email, password, and server name in pixel.json
  --- ERROR ---
  """
