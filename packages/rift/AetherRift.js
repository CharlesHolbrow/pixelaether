/*--------------------------------------------------------------
AetherRift is similar to Rift, except it uses serverId instead
of urls. This lets us choose which interface we want to use.

If you want to use the url interface, use Rift.<method>.

This package written as part of a refactor moving toward using
serverIds to identify servers instead of URLs.

Like Rift, AetherRift is a pseudo-singleton. Don't call
new AetherRift. Instead just use AetherRift.add() etc

add(serverId)
call(methodName)
collection(name, serverId)
connection(serverId)
list()
methods(methods)
open(serverId, wait)
status(serverId)
url()
userId(serverId)
--------------------------------------------------------------*/

getPortalFromServerId = function(serverId){

  if (!serverId) return getOpenPortal();
  if (portals[serverId]) return portals[serverId];

  // GameServers.idToUrl handles the case when we don't yet have
  // the results of the initial gameServerSubscription, but it
  // is still possible to identify the serverUrl.
  var serverUrl = GameServers.idToUrl(serverId);
  if (!serverUrl){
    console.warn('URL for serverId not available: ${serverId}')
    return undefined;
  }

  // If serverId refers to the master server, get the portal
  // directly.
  if (serverUrl === masterServerUrl)
    return masterServerPortal;

  // The master server should not be stored in the portals
  // object. We are now sure that serverId is not the master.
  portal = new Portal(serverUrl)
  portals[serverId]
  return portal;
};

AetherRift = {};

AetherRift.add = function(serverId){
  getPortalFromServerId(serverId)
};

AetherRift.call = function(methodName){
  var args    = Array.prototype.slice.call(arguments);
  var portal  = getOpenPortal();
  portal.setMethod(methodName, methods[methodName]);
  portal.connection.call.apply(portal.connection, args);
};
AetherRift.collection = function(serverId, name){
  var portal = getPortalFromServerId(serverId);
  return portal && portal.getCollection(name);
};
AetherRift.connection = function(serverId){
  var portal = getPortalFromServerId(serverId);
  return portal && portal.connection;
};
// Array of all ServerIds (except the master server)
AetherRift.listGameServerIds = function(){
  return Object.keys(portals);
};
AetherRift.methods = function(methodByName){
  if (typeof methodsByName !== 'object'){
    throw new Error('Rift.methods requires an object as an argument');
  }

  for (let key in methodsByName){
    if (methods[key]){
      throw new Error('Rift Method already exists:', key);
      return;
    }
    var item = methodsByName[key];
    if (typeof item === 'function' ){
      methods[key] = item;
    } else {
      throw new Error('Method not a function: {key}');
    }
  }
};

// set the open rift
// if wait is true, wait to open it until we are connected
var computation = {stop:function(){}};
AetherRift.open = function(serverId, wait){
  computation.stop();
  var portalToOpen = getPortalFromServerId(serverId);

  if (portalToOpen === openPortal) return;
  AetherRift.add(serverId);

  if (!wait) {
    setOpenPortal(portalToOpen);
    return;
  }

  computation = Tracker.autorun(function(computation){
    connection = portalToOpen.connection;
    if (connection.status().connected){
      setOpenPortal(portalToOpen);
      computation.stop();
    }
  });
};

AetherRift.status = function(serverId){
  var portal = getPortalFromServerId(serverId);
  return portal.connection.status();
};

AetherRift.url = function(){
  var portal = getPortalFromServerId()
  return portal.url;
};

AetherRift.userId = function(serverId){
  var portal = getPortalFromServerId(serverId);
  return portal && portal.connection.userId();
};
