# Pixel Aether Game Server

You need a [pixelaether.com](http://www.pixelaether.com) run your own pixel server

- When you run meteor for the first time, it will autogenerate pixel.json in the root of your project dir
- Open up pixel.json, and add your login credentials using your pixelaether.com account
- Choose a name for your game server, and add it to `pixel.json`. Server names must be
  - all lower case
  - begin with a letter
  - contain only letters, numbers, underscore, dash, and space characters
  - be less then 65 characters long

```sh
# With meteor installed:
$ git clone git@github.com:CharlesHolbrow/PixelAetherGameServer.git
$ cd PixelAetherGameServer
$ meteor --settings pixel.json

# 1. add your login info 
# 2. choose a name for your server, and add it t

# and when you are ready to deploy your server
$ meteor deploy yourname.meteor.com --settings pixel.json
```
