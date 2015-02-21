/*------------------------------------------------------------
Wraps a server connection, and collections from that server
------------------------------------------------------------*/
absoluteUrl = Meteor.absoluteUrl();

Portal = function(url){
  var self = this;

  this.url = url = urlz.clean(url || absoluteUrl);
  this.collections = {};
  this.methods = {};
  if (!url || url === absoluteUrl) {
    this.connection = Meteor.connection;
    if (Package['accounts-base']) this.collections['users'] = Meteor.users;
  } else {
    this.connection = DDP.connect(url);
  }
}

Portal.prototype = {

  call: function(methodName){
    if (!this.methods[methodName]) return;
    this.connection.apply(this.connection, arguments);
  },

  getCollection: function(name){
    if (!this.collections[name])
      this.collections[name] = new Mongo.Collection(name, {connection: this.connection});
    return this.collections[name]
  },

  setMethod: function(name, func){
    if (this.methods[name] === func) return;
    this.methods[name] = func;
    var methods = {};
    methods[name] = func;
    this.connection.methods(methods)
  },

}; // Portal.prototype
