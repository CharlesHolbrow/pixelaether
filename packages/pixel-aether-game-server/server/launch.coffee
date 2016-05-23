{ AetherUplink } = require './aether-uplink.coffee'
require './game-server-accounts.coffee'


masterUrl = Meteor.settings?.public?.MASTER_SERVER_URL
email = Meteor.settings?.EMAIL
password = Meteor.settings?.PASSWORD

unless email and password
  throw new Meteor.Error """
  Specify a username and password in pixel.json
  when launching meteor, make sure to run it with --settings pixel.json
  $ meteor --settings pixel.json
  """
unless masterUrl
  throw new Meteor.Error "Missing MASTER_SERVER_URL"

AetherUplink.connect urlz.clean(masterUrl)
AetherUplink.connection.onReconnect = ->
  AetherUplink.login email, password

try
  AetherUplink.createGameServer();
catch err
  console.error 'Error creating game server:', err

Tracker.autorun ->
  console.log 'AetherUplink status:', AetherUplink.connection.status().status
