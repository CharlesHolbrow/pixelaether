/*------------------------------------------------------------
Rift manages the connections we have made with DDP servers.

There is always one open connection.

Because Meteor doesn't let you call "new Mongo.Collection()"
more than once with the same argument (per DDP connection)
Rift is a Psuedo-Singleton.

Don't call "new Rift". Just use "Rift.open()" etc.
------------------------------------------------------------*/
portals = {};
methods = {};

masterServerUrl   = GameServers.masterServerUrl();
localServerUrl    = GameServers.localUrl();
localServerId     = GameServers.localId();
localServerPortal = new Portal(localServerUrl, localServerId, Meteor.connection);
rOpenPortal       = new ReactiveVar(localServerPortal, function(p1, p2){return p1 === p2;});
openPortal        = localServerPortal;

// Initialize the portals collection
portals[localServerId] = openPortal;

// If we are on the MasterServer OR on the client we will have
// already created The local GameServers collection.
if (GameServers.isMasterServer() || Meteor.isClient)
  localServerPortal.collections.game_servers = GameServers;
// No matter where we are, the local Users collection has
// already been created. If we are missing the accounts-base
// package, Meteor.users will be undefined, but that is okay.
localServerPortal.collections.users = Meteor.users;
// Creating a collection a second time (per ddp connection)
// throws an error. If we are on the MasterServer (or on a
// client), game_servers and users collections have been added
// to the local portal, and we are safe from accidentall trying
// to create them a second time when we call
// Rift.collection('users') or Rift.collection('game_servers').
//
// Caution: If we are on a game server, these collections have
// have already been created, and we must avoid creating them
// again:
//
// 1. Master Server users Collection
// 2. Master Server game_servers Collection


// setOpenPortal and getOpenPortal are reactive. To get the open
// portal non-reactively, just access the openPortal variable.
setOpenPortal = function(portal){
  openPortal = portal;
  rOpenPortal.set(portal);
};
getOpenPortal = function(portal){
  return rOpenPortal.get();
};

var getPortal = function(url){
  if (!url) return getOpenPortal();

  url = urlz.clean(url);

  // GameServers.urlToId does not check the game_servers mongo
  // collection if url is the localUrl.
  var serverId = GameServers.urlToId(url);

  if (!serverId){
    console.warn(`Cannot get serverId for ${url}`);
    return undefined;
  }

  if (portals[serverId]) return portals[serverId];

  // The Portal does not exists, and we must create it. On a
  // GameServer, the connection to the Master Server has already
  // been created. Don't try to create an additional one.
  if (GameServers.masterServerConnection && url === masterServerUrl){
    connection = GameServers.masterServerConnection;
  }

  var newPortal = new Portal(url, serverId, connection);

  if (GameServers.isGameServer() && url === masterServerUrl){
    newPortal.collections.game_servers  = GameServers;
    newPortal.collections.users         = GameServers.masterUsersCollection;
  }
  portals[serverId] = newPortal;
  return newPortal;
};


Rift = {};
/*------------------------------------------------------------
add(url)
call(methodName)
collection(name, url)
connection(url)
list()
methods(methods)
open(url, wait)
status(url)
url()
userId(url)
------------------------------------------------------------*/

// ensure portal exists, don't set main connection
Rift.add = function(url){
  url = urlz.clean(url);
  if (url === masterServerUrl)
    return; // masterServerPoral is setup by default

  // GameServers.urlToId handles localServer without waiting
  // for GameServers.gameServersSubscription.ready()
  var serverId = GameServers.urlToId(url);
  if (!serverId)
    throw new Error('Cannot get serverId for ' + url);

  // Have we aleady added this portal
  if (portals[serverId])
    return;

  portals[serverId] = new Portal(url);
};

Rift.call = function(methodName){
  var args = Array.prototype.slice.call(arguments);
  var portal = getOpenPortal();
  portal.setMethod(methodName, methods[methodName]);
  portal.connection.call.apply(portal.connection, args);
};

// get collection by name
Rift.collection = function(name, url){
  return getPortal(url).getCollection(name); // only reactive if no url is provided
};

// Return the current connection. (reactive)
// Or return connection via url
Rift.connection = function(url){
  var portal = getPortal(url);
  return portal.connection;
};

Rift.list = function(){
  var urls = [masterServerUrl];
  for (let serverId in portals)
    urls.push(portals[serverId].url);
  return urls;
};

// Make these methods available on every rift connection
Rift.methods = function(methodsByName){
  if (typeof methodsByName !== 'object'){
    throw new Error('Rift.methods requires an object as an argument');
  }

  for (let key in methodsByName){
    if (methods[key]){
      throw new Error('Rift Method already exists:', key);
    }
    var item = methodsByName[key];
    if (typeof item === 'function' ){
      methods[key] = item;
    }
  }
};

// set the open rift
// if wait is true, wait to open it until we are connected
var computation = {stop:function(){}};
Rift.open = function(url, wait){
  // We might be waiting to connect to an open rift form a
  // previous call to Rift.open(..., true)
  // If we are, stop trying
  computation.stop();

  var portalToOpen = getPortal(url);

  // if already connecting/connected
  if (portalToOpen === openPortal) return;

  // ensure portal has been created 
  Rift.add(url);

  if (!wait) {
    setOpenPortal(portalToOpen);
    return;
  }

  // wait until we are connected before changing the portal
  computation = Tracker.autorun(function(computation){
    connection = portalToOpen.connection;
    if (connection.status().connected){
      setOpenPortal(portalToOpen);
      computation.stop();
    }
  });
};

Rift.status = function(url){
  var portal = getPortal(url);
  return portal.connection.status();
};

// url of the current portal (caution, this is reactive)
Rift.url = function(){
  return getOpenPortal().url;
};

Rift.userId = function(url){
  var portal = getPortal(url);
  return portal.connection.userId();
};


