# In development mode, We want to generate pixel.json to pass
# to meteor --settings. This json file will contain a pixel
# aether server ID, which will uniquely identify this server.
#
# If we are on the master server, then we overload the serverId.
# The master server always starts with the word 'MASTER'
#
# The ID will derive from our Meteor project id which we
# retrieve from the .meteor/.id file. To find this file,
# we search up from the current working directory, which
# looks something like this:
#
# /users/you/MyProject/.meteor/local/build/server
#
# We get the last .meteor in the path, and:
# 1. Assume that .meteor/.id exists
# 2. Assume we can write 'pixel.json' one level up from .meteor
#
# In "meteor test" and "meteor test --full-app" neither
# __meteor_runtime_config__ or the normal .meteor/.id is
# available. For testing, we must first run the app in dev mode
# so that pixel.json will be generated. Then we test with
# --settings pixel.json
if Meteor.isDevelopment and not (Meteor.isTest or Meteor.isAppTest)

  # First Try to get the app id from __meteor_runtime_config__
  # __meteor_runtime_config__ is not available during testing mode
  id = __meteor_runtime_config__?.appId

  # If necessary, try reading appId from the .meteor/.id file
  if !id
    path = Npm.require 'path'
    fs = Npm.require 'fs'

    cwd = process.cwd()
    meteorPath = cwd.match(/.*\.meteor/)?[0] # dot star is greedy
    unless meteorPath
      throw new Meteor.Error 'Cannot find .meteor in: ' + cwd
    idPath = path.join meteorPath, '.id'
    try
      file = fs.readFileSync idPath, 'utf8'
    catch err
      throw new Meteor.Error 'Failed to open: ' + idPath
    # get the id and trim any whitespace
    id = file.match(/^([^#\s]{10,})[\s]*$/m)?[1]

  # throw if all our attempts to get the appId failed
  unless id
    throw new Meteor.Error 'Failed to extract the meteor appId'

  serverName = Meteor.settings?.public?.SERVER_NAME
  isMasterServer = Meteor.isServer and serverName == 'master'
  # We want server IDs to depend on the app ID. But we do not
  # need app IDs to be publicly visible, so we take 6 characters
  # from the app id (which is 19 characters long) and 10
  # characters from the hash of the id
  #
  # Ids are 17 characters long. We will make this id 16
  # characters long, because we will append 'D' or 'P' in the
  # GameServers package, indicating if this is a master server
  # or a game server.
  firstSixChars = if isMasterServer then 'MASTER' else id[...6]
  id = firstSixChars + SHA256(id)[-10...]

  outFileDir = path.join meteorPath, '..'
  settingsFileName = path.join outFileDir, 'pixel.json'
  newSettings = {
    public:
      MASTER_SERVER_URL: 'http://www.PixelAether.com',
      APP_ID:id
      SERVER_NAME: ''
    EMAIL:'',
    PASSWORD:''
  }

  if fs.existsSync settingsFileName
    try oldJSON = fs.readFileSync settingsFileName, 'utf8'
    if oldJSON then try oldSettings = JSON.parse oldJSON
    if oldSettings then newSettings = _.defaults oldSettings, newSettings

  # Discourage editing the server ID
  newSettings.public.APP_ID = id
  # Update server.js if needed
  newJSON = JSON.stringify newSettings, null, 2
  if newJSON != oldJSON
    console.warn 'Updating pixel.json! (Remember $ meteor --settings pixel.json)'
    fs.writeFileSync settingsFileName, newJSON


# If we are missing --settings pixel.json, or failed to get
# login credentials from pixel.json, we can throw this error
#
# Note that game-servers loads after game-server-shared, so we
# must not throw this error this package is loading
throwMissingSettingsError = (message)->

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

  # when you test a dev server
  $ meteor test --driver-package practicalmeteor:mocha --settings pixel.json -p 3100

  # When you deploy to production:
  $ meteor deploy YourAddress.com --settings pixel.json
  """

  throw new Error message or """
  --- ERROR ---
  You must run and deploy meteor with --settings pixel.json
  You must specify email, password, and server name in pixel.json
  --- ERROR ---
  """


# If we are starting our server, and we don't have our ID, 
# Notify the client that it's missing.
throwMissingSettingsError() if not Meteor.settings?.public?.APP_ID
