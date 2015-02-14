###
There are two types of user accounts we need to think about:

1. Local accounts
2. Accounts on the master server

Every account on the master server may create a game server 
using the createGameServer method.

To connect to the master server, we need to login to the 
master server, and call createGameServer with the url of our 
game server (likely Meteor.absoluteUrl)

When we start this Game Server, we instantiate a Login object 
with our url

###

serverNamePattern = /^[a-z][a-z0-9\-_ ]{1,62}[a-z0-9](DEV)?$/
serverNameDescription = """
  Invalid SERVER_NAME in pixel.json

  SERVER_NAME must begin and end with a letter, be 64
  characters or less, and contain only lower case letters,
  numbers, dash, space, and underscore characters.
  """

class Uplink
  constructor: (url)->
    @url = null
    @connection = null
    @name = null
    @localUrl = urlz.clean Meteor.absoluteUrl()
    url and @connect url

    servername = GameServers.localName()
    unless servername and serverNamePattern.test(servername)
      throw new Meteor.Error serverNameDescription + ': ' + servername
    @name = servername

  connect: (url)->
    if @connection then @connection.disconnect()
    @url = urlz.clean(url)
    @connection = DDP.connect(@url)


  login: (email, password)->
    @connection.call 'login',
      password: password
      user: {email: email}
      (err, res)->
        if err
          console.log 'Uplink Login Error:', err
          throw err

  createGameServer: ->
    # Ensure that we are registered with the master server
    serverInfo = @connection.call 'updateGameServer',
      GameServers.localId(),
      @name,
      Meteor.absoluteUrl()
    # Ensure our server exists in the local db
    GameServers.remove {name:@name, _id:{$ne:serverInfo._id}}
    GameServers.upsert serverInfo._id,  serverInfo

# This will be our connection to the main server
# The game server must .connect to www.pixelaether.com
AetherUplink = new Uplink
