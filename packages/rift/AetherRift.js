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

// getPortalFromServerId is a reactive data source. It will
// probably return undefined until the GameServer's subscription
// OR the Logged In user's document is ready.
getPortalFromServerId = function(serverId){

  if (!serverId) return getOpenPortal();
  if (portals[serverId]) return portals[serverId];

  server = GameServers.findOneForUser(serverId);
  if (!server) return undefined;

  if (server._url === masterServerUrl)
    connection = masterServerConnection;

  portal = new Portal(server.url, connection, server._id);
  portals[serverId] = portal;
  return portal;
};

AetherRift = {};

AetherRift.add = function(serverId){
  getPortalFromServerId(serverId);
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
AetherRift.getCurrentServerId = function(){
  var portal = getPortalFromServerId();
  return GameServers.urlToId(portal.url);
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
    }
    var item = methodsByName[key];
    if (typeof item === 'function' ){
      methods[key] = item;
    } else {
      throw new Error(`Method not a function: ${key}`);
    }
  }
};


// Make a request to open a rift. By default most AetherRift
// methods can be called without a serverId. If they are called
// without a server Id, they generally act on the open rift.
// calls to servers other than the open rift are not gauranteed
// to be delivered -- if (for example) the serverId is invalid,
// the request will not be deliverd.
//
// The second argument is an optional callback that will be
// called with (err, serverId), where serverId is the id of the
// rift that was sucessfully opened.
//
// Return true if the rift could be opened immediately, false if
// not (reactive). Not that this is not the perfect reactive
// source, because it may invalidate multiple times, returning
// false more than once.
var rReady      = new ReactiveVar(false);
var computation = {stop:()=>{}};
var onChange    = ()=>{};
AetherRift.open = function(serverId, cb){
  computation.stop();
  onChange(new Error('AetherRift.open request interrupted!'));

  // If the user passed in a callback, make sure it only gets
  // called once. If no callback is passed, the onChange
  // function will just stay unchanged from the last time it was
  // needed. Of course, we don't need to worry about it being
  // called more than once.
  if (typeof cb === 'function') onChange = _.once(cb);

  // If it's easy to get the portal, we're laughing. 
  var portalToOpen = getPortalFromServerId(serverId);
  if (portalToOpen && portalToOpen.connection.status().connected){
    rReady.set(true);
    setOpenPortal(portalToOpen);
    onChange(null, serverId);
    return true;
  }

  // We either don't have the portal, OR we are waiting to
  // connect. We're going to have to wait to open the portal. The
  // GameServers collection OR the user document might need to
  // resolve with the server before the open request can
  // complete.
  rReady.set(false);
  computation = Tracker.autorun((computation)=>{
    var portalToOpen = getPortalFromServerId(serverId);
    if (!portalToOpen) return;
    if (!portalToOpen.connection.status().connected) return;
    // at this point, we know that we are connected;
    computation.stop();
    rReady.set(true);
    setOpenPortal(portalToOpen);
    onChange(null, serverId);
  });

  // We failed to return the portal immediately.
  return false;
};

AetherRift.ready = function(){
  return rReady.get();
};

AetherRift.status = function(serverId){
  var portal = getPortalFromServerId(serverId);
  return portal.connection.status();
};

AetherRift.url = function(){
  var portal = getPortalFromServerId();
  return portal.url;
};

AetherRift.userId = function(serverId){
  var portal = getPortalFromServerId(serverId);
  return portal && portal.connection.userId();
};
