/*------------------------------------------------------------
Rift manages the connections we have made with DDP servers.

There is always one open connection.

Because Meteor doesn't let you call "new Mongo.Collection()"
more than once with the same argument (per DDP connection)
Rift is a Psuedo-Singleton.

Don't call "new Rift". Just use "Rift.open()" etc.
------------------------------------------------------------*/
var _portalDep = new Tracker.Dependency;
var _portal = new Portal;  // current portal
var _portals = {};
_portals[_portal.url] = _portal;

var _methods = {};
Rift = {};

// like Rift.add, but return the portal
var getPortal = function(url){
  url = urlz.clean(url || (_portal && _portal.url) || Meteor.absoluteUrl());
  var portal = _portals[url];
  if (!portal){
    portal = new Portal(url);
    _portals[url] = portal;
  }
  return portal;
}

/*------------------------------------------------------------
add
collection
connection
list
login
logoutAll
open
url
------------------------------------------------------------*/

// ensure portal exists, don't set main connection
Rift.add = function(url){
  url = urlz.clean(url);
  if (_portals[url]) return;
  _portals[url] = new Portal(url);
};

// get collection by name
Rift.collection = function(name, url){
  url || _portalDep.depend(); // we should only depend iff no url is provided
  var portal = getPortal(url);
  return portal.getCollection(name);
};

// Return the current connection. (reactive)
// Or return connection via url
Rift.connection = function(url){
  if (!url) {
    _portalDep.depend();
    return _portal.connection;
  }
  portal = getPortal(url)
  return portal.connection;
};

Rift.userId = function(url){
  var portal = getPortal(url);
  return portal.connection.userId();
};

Rift.list = function(){
  return Object.keys(_portals);
};

// set the open rift
// if wait is true, wait to open it until we are connected
var computation = {stop:function(){}};
Rift.open = function(url, wait){
  url = urlz.clean(url);

  // if already connecting/connected
  if (url === _portal.url) return;

  // if first time connecting
  if (!_portals[url]) Rift.add(url);

  // We might be waiting to connect to an open rift form a
  // previous call to Rift.open(..., true)
  // If we are, stop trying
  computation.stop()

  if (!wait) {
    _portal = _portals[url];
    _portalDep.changed();
    return;
  }

  // wait until we are connected before changing the _portalDep
  computation = Tracker.autorun(function(computation){
    connection = _portals[url].connection
    if (connection.status().connected){
      _portal = _portals[url];
      _portalDep.changed();
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
  _portalDep.depend();
  return _portal.url;
};

// Make these methods available on every rift connection
Rift.methods = function(methods){
  if (typeof methods !== 'object'){
    throw new Error('Rift.methods requires an object as an argument')
    return;
  }

  for (key in methods){
    if (_methods[key]){
      throw new Error('Rift Method already exists:', key);
      return;
    }
    var item = methods[key];
    if (typeof item === 'function' ){
      _methods[key] = item;
    }
  }

};

Rift.call = function(methodName){
  _portal.setMethod(methodName, _methods[methodName]);
  _portal.connection.call.apply(_portal.connection, arguments);
};
