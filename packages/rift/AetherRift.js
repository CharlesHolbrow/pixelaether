/*--------------------------------------------------------------
AetherRift is similar to Rift, except it uses serverIds instead
of urls. This lets us choose which interface we want to use.

If you want to use the url interface, use Rift.<method>.

This package written as part of a refactor moving toward using
serverIds to identify servers instead of URLs.

Like Rift, AetherRift is a pseudo-singleton. Don't call
new AetherRift. Instead just use AetherRift.add() etc

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
var RIFT_TIMEOUT = 15 * 1000;

// getPortalAndReturn is a reactive data source. It will
// return undefined unless the pre-requisite document is
// available. This document could be a GameServer document.
// If the server we are requesting is a development server,
// the document will probably be from the the users collection.
getPortalAndReturn = function(serverId){

  if (!serverId) return getOpenPortal();
  if (portals[serverId]) return portals[serverId];

  server = GameServers.findOneForUser(serverId);
  if (!server) return undefined;
  if (serverId !== server._id)
    throw new Error(`WTF GameServers.findOneForUser is broken for $(serverId)`);

  if (server.url === masterServerUrl && !GameServers.isMasterServer())
    portal = masterServerPortal;
  else
    portal = new Portal(server.url, undefined, serverId);

  portals[serverId] = portal;
  return portal;
};

getPortalAndCb = function(serverId, cb){
  if (typeof cb === 'function') cb = _.once(cb);

  // check if we are able to get the portal immediately
  //
  // IMPORTANT: This call to getPortalAndReturn registers
  // dependencies. The depencendy registered by the call to
  // getPortalAndReturn that is inside the Tracker.autorun block
  // below will be canceled by when the computation is stopped.
  // We depend on the first getPortalAndReturn call to make
  // AetherRift methods consistently reactive.
  var portal = getPortalAndReturn(serverId);
  if (portal) {
    if (typeof cb === 'function') cb(null, portal);
    return portal;
  }

  if (typeof cb !== 'function') return undefined;

  // We failed to get the portal immediately. However, a
  // callback was provided, so we keep trying until the request
  // times out.
  var timeout = Meteor.setTimeout(()=>{
    if (!computation) return;
    if (computation.stopped) return;
    // The computation is still running, and the timeout has
    // elapsed. Stop the computation, and cb with an error.
    computation.stop();
    cb(new Meteor.Error('time-out'));
  }, RIFT_TIMEOUT);

  var computation = Tracker.autorun((computation)=>{
    var portal = getPortalAndReturn(serverId);
    if (!portal) return;
    // We got the portal, call the callback, stop trying.
    Meteor.clearTimeout(timeout);
    computation.stop();
    cb(null, portal);
  });

  return undefined;
};

AetherRift = {};

AetherRift.call = function(methodName){
  var args    = Array.prototype.slice.call(arguments);
  var portal  = getOpenPortal();
  portal.setMethod(methodName, methods[methodName]);
  portal.connection.call.apply(portal.connection, args);
};

AetherRift.collection = function(name, serverId, cb){
  if (typeof cb === 'function'){ outerCb = (err, portal)=>{
    var collection = portal && portal.getCollection(name);
    cb(err, collection);
  };}
  let portal = getPortalAndCb(serverId, outerCb);
  return portal && portal.getCollection(name);
};

AetherRift.connection = function(serverId, cb){
  if (typeof cb === 'function'){ outerCb = (err, portal)=>{
    var connection = portal && portal.connection;
    cb(err, connection);
  };}
  let portal = getPortalAndCb(serverId, outerCb);
  return portal && portal.connection;
};

AetherRift.getCurrentServerId = function(){
  var portal = getOpenPortal();
  return portal.id || GameServers.urlToId(portal.url);
};

// Array of all ServerIds
AetherRift.listGameServerIds = function(){
  return Object.keys(portals);
};

AetherRift.methods = function(methodsByName){
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
  var portalToOpen = getPortalAndReturn(serverId);
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
    var portalToOpen = getPortalAndReturn(serverId);
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

AetherRift.status = function(serverId, cb){
  if (typeof cb === 'function'){ outerCb = (err, portal)=>{
    let status = portal && portal.connection.status();
    cb(err, status);
  };}
  let portal = getPortalAndCb(serverId, outerCb);
  return  portal && portal.connection.status();
};

AetherRift.url = function(){
  var portal = getOpenPortal();
  return portal.url;
};

// userId() Returns undefined if portal is not available.
// userId() Returns null if we are not logged in.
AetherRift.userId = function(serverId, cb){
  if (typeof cb === 'function'){ outerCb = (err, portal)=>{
    var userId = portal && portal.connection.userId();
    cb(err, userId);
  };}
  let portal = getPortalAndCb(serverId, outerCb);
  return portal && portal.connection.userId();
};
