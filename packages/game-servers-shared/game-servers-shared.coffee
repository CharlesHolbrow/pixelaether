# This code needs to run in three different places
# - Master Server (client and server)
# - Game Servers (server only)
#
# This file is responsible for initializing the 'GameServers'
# collection, and adding the .localName and .localId methods.
#
# This file also currently actually generates the localId and
# localName values. These values are derived from
# 1. NODE_ENV environment var ('production' or 'development')
# 2. APP_ID, which is automatically inserted into pixel.json
# 3. SERVER_NAME, which must be manually added to pixel.json


# Master Server should set MASTER_SERVER_URL to an empty string
isMasterServer = Meteor.isServer and not Meteor.settings.MASTER_SERVER_URL?.length
isGameServer = Meteor.isServer and not isMasterServer

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

else if isGameServer
  masterServerUrl = Meteor.settings.MASTER_SERVER_URL
  GameServers = Rift.collection 'game_servers', masterServerUrl
  Rift.connection(masterServerUrl).subscribe 'game-servers'

else if Meteor.isClient
  GameServers = new Mongo.Collection 'game_servers'


if Meteor.isServer
  GameServers.localId = -> return localId
  GameServers.localName = -> return localName

if Meteor.isClient or isMasterServer
  GameServers.masterId = -> return localId
  GameServers.masterName = -> return localName


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
# If we request the localServer, then idToUrl returns
# immediately with the correct url. If we request another
# server from the client, then the result is reactive, but may
# initially return undefined while we wait for the GameServers
# collection to sync with the server.
GameServers.idToUrl = (serverId, userId)=>
  serverId = GameServers.isSimpleId(serverId) or GameServers.extractServerId(serverId)
  return undefined unless serverId
  return localUrl if serverId == localId
  return GameServers.findOneForUser(serverId, userId)?.url


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
# userId defaults to the logged in user. We may want be using
# findOneForUser over a connection other than
# Meteor.absoluteUrl(). If we are, we can't use Meteor.users
# to lookup our development servers. We have to use the
# unofficial Collection._connection._stream.endpoint to find
# the url, so we can lookup the users collection. This is a bit
# dangerous, as Collection.connection._stream is unofficial, and
# might break in the future.
#
# Note that the call is reactive. On the client, it may
# initially return undefined while we wait for the GameServers
# collection to resolve with the server.
url = GameServers._connection?._stream?.endpoint or Meteor.absoluteUrl()
users = GameServers._users = Rift.collection 'users', url
GameServers.findOneForUser = (selector, userId)->
  server = GameServers.findOne(selector)
  return server if server
  userId ?= GameServers._connection.userId()
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
# login credentials from pixel.json. we can throw this error
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
