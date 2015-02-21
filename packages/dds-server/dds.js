// DDS
var instances = {};
var namePattern = /^[a-zA-Z][\w-]*$/;
var rawData = {};
var absoluteUrl = Meteor.absoluteUrl();


Meteor.methods({
  'dds-get-array': function(type){
    check(type, String)
    if (!instances.hasOwnProperty(type)){
      var error = new Meteor.Error(404, 'client requests non existent dds type: ' + type );
      throw error;
    }
    return instances[type].all
  },
  'dds-get-dict': function(type){
    check(type, String)
    if (!instances.hasOwnProperty(type)){
      var error = new Meteor.Error(404, 'client requests non existent dds type: ' + type );
      throw error;
    }
    return instances[type].content
  },
  'dds-get-all': function(){
    return rawData;
  }
});


DDS = function(name, psuedoClass){
  var self = this;

  if (!namePattern.test(name)){
    throw new Error('DDS name must begin with a letter, and contain only letters, numbers, - _')
    return;
  }
  if (typeof psuedoClass !== 'function'){
    throw new Error('DDS requires a class constructor');
    return;
  }

  // Keep track of all Data Stores on this server
  if (instances[name]) return instances[name];
  instances[name] = this;

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
  var content = ddsInstance.content;
  if (!content.hasOwnProperty(name))
    return undefined;
  return content[name];
}

DDS.prototype.add = function(object){
  if (!object.name){
    throw new Error('DDS objects must have a .name');
    return
  }
  if (object.hasOwnProperty('incomplete')){
    throw new Error('.incomplete is an illegal key for DDS objects');
    return;
  }
  if (typeof this.content[object.name] !== 'undefined'){
    throw new Error(this.name + ' DDS object already exists named:' + object.name);
    return;
  }

  // we modify the objects before caching them
  for (key in object){
    // check if object has a relativeUrl
    if (
      key.endsWith('Url') &&
      typeof object[key] === 'string' &&
      urlz.isRelative(object[key])
    ){
      object[key] = urlz.clean(absoluteUrl + '/' + object[key]);
    }
  }

  if (!object.hasOwnProperty('_id'))
    object._id = Random.id();

  // Add it to our local content
  this.content[object.name] = object;
  // empty the 'all' array, and fill it again
  this.all = [];
  for (key in this.content)
    this.all.push(this.content[key]);

  var newObj = new this._class(absoluteUrl, object.name);
  newObj.init(object);

  for (key in newObj){
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
