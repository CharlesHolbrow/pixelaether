# Pixel Aether Game Server

You need a [pixelaether.com](http://www.pixelaether.com) account to run your own pixel server.

- When you run meteor for the first time, it will autogenerate pixel.json in the root of your project dir
- Open up pixel.json, and add your login credentials using your pixelaether.com account
- Choose a name for your game server, and add it to `pixel.json`. Server names must be
  - All lower case
  - Begin with a letter
  - Contain only letters, numbers, underscore, dash, and space characters
  - Less then 65 characters long

```sh
# With meteor installed:
$ git clone git@github.com:CharlesHolbrow/PixelAetherGameServer.git
$ cd PixelAetherGameServer
$ meteor --settings pixel.json
# pixel.json will be auto-generated. You will see an warning message

# To proceed:
# 1. Add your pixelaether.com login credentials to pixel.json
# 2. Choose a name for your server, and add it to pixel.json
```


## Deploy to meteor.com
```sh
$ meteor deploy yourname.meteor.com --settings pixel.json
```
