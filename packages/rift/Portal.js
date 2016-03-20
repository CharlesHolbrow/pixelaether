/*------------------------------------------------------------
Wraps a server connection, and collections from that server
------------------------------------------------------------*/
absoluteUrl = Meteor.absoluteUrl();

Portal = function(url){
  var self = this;

  if (!url || typeof url !== 'string')
    throw new Error('Portal constructor requires a url');

  this.url          = url;
  this.collections  = {};
  this.methods      = {};
  this.isLoopback   = false; // Could we use Meteor.call?

  if (url === absoluteUrl) {
    this.isLoopback = true;

    // If we are on a server, and this is the loopback,
    // connection, this.connection will be undefined. Note that
    // we do not want to set this.connection to the Meteor
    // object, because we do not want to pass Meteor like this:
    // new Mongo.Collection(name, {connection: Meteor})
    this.connection = Meteor.connection;
    if (Package['accounts-base']) this.collections['users'] = Meteor.users;

  } else {
    this.connection = DDP.connect(url);
  }
}

Portal.prototype = {

  call: function(methodName){
    if (!this.methods[methodName]) return;
    var con = (Meteor.isServer && this.isLoopback) ? Meteor : this.connection;
    con.apply(con, arguments);
  },

  getCollection: function(name){
    if (!this.collections[name]){
      // On the server, this.connection is undefined, so this
      // will create a normal server side mongo collection
      this.collections[name] = new Mongo.Collection(name, {connection: this.connection});
    }
    return this.collections[name]
  },

  setMethod: function(name, func){
    if (this.methods[name] === func) return;
    this.methods[name] = func;
    var methods = {};
    methods[name] = func;
    var con = (Meteor.isServer && this.isLoopback) ? Meteor : this.connection;
    con.methods(methods);
  },

}; // Portal.prototype
