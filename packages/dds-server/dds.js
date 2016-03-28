// DDS
var instances = {};
var namePattern = /^[a-zA-Z]*$/;
var rawData = {};
var absoluteUrl = Meteor.absoluteUrl();


Meteor.methods({
  'dds-get-array': function(type){
    check(type, String);
    if (!instances.hasOwnProperty(type)){
      var error = new Meteor.Error(404, 'client requests non existent dds type: ' + type );
      throw error;
    }
    return instances[type].all;
  },
  'dds-get-dict': function(type){
    check(type, String);
    if (!instances.hasOwnProperty(type)){
      var error = new Meteor.Error(404, 'client requests non existent dds type: ' + type );
      throw error;
    }
    return instances[type].content;
  },
  'dds-get-all': function(){
    return rawData;
  }
});


DDS = function(name, psuedoClass){
  var self = this;

  if (!namePattern.test(name)){
    throw new Error('DDS name must begin with a letter, and contain only letters, numbers, - _');
  }
  if (typeof psuedoClass !== 'function'){
    throw new Error('DDS requires a class constructor');
  }

  // Keep track of all Data Stores on this server
  if (instances[name]) return instances[name];
  instances[name] = this;

  // We set the .incomplete flag here. This may not be needed
  // on the server, because the data is instantly available.
  // For now, I'll leave this in, because it mimics the behavior
  // of the client dds elements.
  psuedoClass.prototype.incomplete = true;

  // when we .add an object, return a instance of this class
  self._class = psuedoClass;

  // Construct
  self.name = name;
  self.content = {}; // each element is a js object to be de-serialized ("objectified") by our clients
  self.all = [];
  self.objects = {}; // each element is an instance of psuedoClass

  // Store Raw Data
  rawData[name] = self.content;
};

DDS.getObject = function(typeName, name){
  var ddsInstance = instances[typeName];
  if (!ddsInstance)
    return undefined;
  var objects = ddsInstance.objects;
  if (!objects.hasOwnProperty(name))
    return undefined;
  return objects[name];
};

DDS.prototype.add = function(object){
  if (!object.name){
    throw new Error('DDS objects must have a .name');
  }
  if (object.hasOwnProperty('incomplete')){
    throw new Error('.incomplete is an illegal key for DDS objects');
  }
  if (typeof this.content[object.name] !== 'undefined'){
    throw new Error(this.name + ' DDS object already exists named:' + object.name);
  }

  // we modify the objects before caching them
  for (let key in object){
    // check if object has a relativeUrl
    if (
      key.endsWith('Url') &&
      typeof object[key] === 'string' &&
      urlz.isRelative(object[key])
    ){
      object[key] = urlz.clean(absoluteUrl + '/' + object[key]);
    }
  }

  object._id = GameServers.newId(object.name);

  // Add it to our local content
  this.content[object.name] = object;
  // Empty the 'all' array, and fill it again
  this.all = [];
  for (let key in this.content)
    this.all.push(this.content[key]);

  var newObj = new this._class(absoluteUrl, object.name);

  // Copy over properties from the object passed to the add
  // method (including the _id)
  for (let key in object){ newObj[key] = object[key]; }

  // Note that when calling init on the server side, we do not
  // wrap the call in try/catch. On the server, we provide our
  // own data, so we can trust it
  if (typeof newObj.init === 'function'){
    newObj.init(object);
  }

  // Link objects.  
  for (let key in newObj){
    if (!key.endsWith('Name')) continue;
    var typeName = key.slice(0, key.length - 4);
    if (typeof newObj[key] !== 'string') continue;
    var otherObject = DDS.getObject(typeName, newObj[key]);
    if (!otherObject)
      throw new Error('Failed to Link DDS Object: ' + JSON.stringify(newObj));
    newObj[typeName] = otherObject;
  }
  newObj.incomplete = false;

  this.objects[object.name] = newObj;
  return newObj;
};

DDS.prototype.get = function(name){
  return this.objects[name];
};
