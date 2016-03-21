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

masterServerUrl     = GameServers.masterServerUrl();
masterServerPortal  = new Portal(masterServerUrl, GameServers.masterServerConnection);
rOpenPortal         = new ReactiveVar(masterServerPortal, function(p1, p2){return p1 === p2});
openPortal          = masterServerPortal;

// setOpenPortal and getOpenPortal are reactive. To get the open
// portal non-reactively, just access the openPortal variable.
setOpenPortal = function(portal){
  openPortal = portal;
  rOpenPortal.set(portal);
}
getOpenPortal = function(portal){
  return rOpenPortal.get()
}


// These collections have already been created on the master
// server.
masterServerPortal.collections.game_servers = GameServers;
masterServerPortal.collections.users        = GameServers.masterUsersCollection;

// At this point, we have the masterServerPortal, but we do not
// have the masterServerId. We want to store all our portals in
// the portal = {} object, using the serverId as a key. 

// The getPortal method checks if we are trying to get the
// masterServerPortal, and returns directly without needing to
// use the serverId key to lookup the object.
var getPortal = function(url){
  if (!url)
    return getOpenPortal();

  url = urlz.clean(url);

  if (url === masterServerUrl)
    return masterServerPortal;

  // GameServers.urlToId does not check the game_servers mongo
  // collection if url is the localUrl.
  var serverId = GameServers.urlToId(url);

  if (!serverId){
    console.warn('Cannot get serverId for ${url}')
    return undefined;
  }

  if (portals[serverId])
    return portals[serverId];

  portals[serverId] = new Portal(url);
  return portals[serverId]
}


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
  var serverId = GameServers.urlToId(url)
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
  var portal = getPortal(url)
  return portal.connection;
};

Rift.list = function(){
  var urls = [masterServerUrl];
  for (serverId in portals)
    urls.push(portals[serverId].url);
  return urls;
};

// Make these methods available on every rift connection
Rift.methods = function(methodsByName){
  if (typeof methodsByName !== 'object'){
    throw new Error('Rift.methods requires an object as an argument')
    return;
  }

  for (key in methodsByName){
    if (methods[key]){
      throw new Error('Rift Method already exists:', key);
      return;
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
  computation.stop()

  var portalToOpen = getPortal(url)

  // if already connecting/connected
  if (portalToOpen === openPortal) return;

  // ensure portal has been created 
  Rift.add(url);

  if (!wait) {
    setOpenPortal(portalToOpen)
    return;
  }

  // wait until we are connected before changing the portal
  computation = Tracker.autorun(function(computation){
    connection = portalToOpen.connection;
    if (connection.status().connected){
      setOpenPortal(portalToOpen)
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
  return getOpenPortal().url
};

Rift.userId = function(url){
  var portal = getPortal(url);
  return portal.connection.userId();
};


