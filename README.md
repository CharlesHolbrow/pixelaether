# Pixel Aether Game Server

First, create a [pixelaether.com][] account. You will need your email and password to proceed.

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

- When you run meteor for the first time, it will autogenerate pixel.json in the root of your project dir
- Open up pixel.json, and add your login credentials using your pixelaether.com account
- Choose a name for your game server, and add it to `pixel.json`. Server names must be
  - All lower case
  - Begin with a letter
  - Contain only letters, numbers, underscore, dash, and space characters
  - Less then 65 characters long

## View Other servers and Maps

Log in to [pixelaether.com][]. In your browser's **JavaScript Console**:
```js
// To choose a new map, by name
Maps.chooseMap('main')

// To view maps on a different server:
Rift.open('localhost:3000')
```

## Deploy to meteor.com
```sh
$ meteor deploy yourname.meteor.com --settings pixel.json
```


[pixelaether.com]: http://www.pixelaether.com
