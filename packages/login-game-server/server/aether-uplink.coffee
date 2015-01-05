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
class AetherUplink
  constructor: (masterServerUrl)->
    @url = urlz.clean(masterServerUrl)
    @connection = DDP.connect(@url)

  login: (email, password)->
    @connection.call 'login',
      password: password
      user: {email: email}
      (err, res)->
        if err then console.log 'Master Server Login Error:', err
        else console.log 'Master Server Login Result:', res


