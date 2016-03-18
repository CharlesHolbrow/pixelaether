# In development mode, We want to generate pixel.json to pass
# to meteor --settings. This json file will contain a pixel
# aether server ID, which will uniquely identify this server.
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
if process.env.NODE_ENV is 'development'
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
  unless id
    throw new Meteor.Error 'Failed to extract id value from .id'

  # We want server IDs to depend on the app ID. But we do not
  # need app IDs to be publicly visible, so we take 6 characters
  # from the app id (which is 19 characters long) and 10
  # characters from the hash of the id
  id = id[...6] + SHA256(id)[-10...]

  outFileDir = path.join meteorPath, '..'
  settingsFileName = path.join outFileDir, 'pixel.json'
  newSettings = {
    MASTER_SERVER_URL: 'http://www.PixelAether.com',
    public:
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


# If we are starting our server, and we don't have our ID, 
# Notify the client that it's missing.
throwMissingSettingsError() if not Meteor.settings?.public?.APP_ID
