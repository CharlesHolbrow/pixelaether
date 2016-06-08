// DDS
const instances = {};
const namePattern = /^[a-zA-Z]*$/;
const rawData = {};
const absoluteUrl = Meteor.absoluteUrl();


Meteor.methods({

  'dds-get-array'(type) {
    check(type, String);
    if (!instances.hasOwnProperty(type)) {
      const error = new Meteor.Error(404, `client requests non existent dds type:  ${type}`);
      throw error;
    }
    return instances[type].all;
  },

  'dds-get-dict'(type) {
    check(type, String);
    if (!instances.hasOwnProperty(type)) {
      const error = new Meteor.Error(404, `client requests non existent dds type: ${type}`);
      throw error;
    }
    return instances[type].content;
  },

  'dds-get-all'() {
    return rawData;
  },
});


DDS = function(name, psuedoClass) {

  if (!namePattern.test(name))
    throw new Error('DDS name must contain only letters');

  if (typeof psuedoClass !== 'function')
    throw new Error('DDS requires a class constructor');

  if (instances[name])
    throw new Error(`DDS name already exists: ${name}`);


  // Keep track of all Data Stores on this server
  if (instances[name]) return instances[name];
  instances[name] = this;

  // We set the .incomplete flag here. This may not be needed
  // on the server, because the data is instantly available.
  // For now, I'll leave this in, because it mimics the behavior
  // of the client dds elements.
  psuedoClass.prototype.incomplete = true;

  // when we .add an object, return a instance of this class
  this._class = psuedoClass;

  // Construct
  this.name     = name;

  // each element is a js object to be de-serialized (a.k.a.
  // objectified) by our clients
  this.content  = {};

  // each element is an instance of psuedoClass
  this.objects  = {};
  this.all      = [];

  // Store Raw Data
  rawData[name] = this.content;
};

DDS.getObject = function(typeName, name) {
  const ddsInstance = instances[typeName];
  if (!ddsInstance)
    return undefined;
  const objects = ddsInstance.objects;
  if (!objects.hasOwnProperty(name))
    return undefined;
  return objects[name];
};

DDS.prototype.add = function(object) {

  if (!object.name)
    throw new Error('DDS objects must have a .name');

  if (object.hasOwnProperty('incomplete'))
    throw new Error('.incomplete is an illegal key for DDS objects');

  if (typeof this.content[object.name] !== 'undefined')
    throw new Error(`${this.name} DDS object already exists named: ${object.name}`);


  // we modify the objects before caching them
  Object.keys(object).forEach((key) => {
    // check if object has a relativeUrl
    if (
      key.endsWith('Url') &&
      typeof object[key] === 'string' &&
      urlz.isRelative(object[key])
    ) {
      object[key] = urlz.clean(`${absoluteUrl}/${object[key]}`);
    }
  });

  object._id = GameServers.newId(object.name);

  // Add it to our local content
  this.content[object.name] = object;
  // Empty the 'all' array, and fill it again
  this.all = [];
  for (const key of Object.keys(this.content))
    this.all.push(this.content[key]);

  const newObj = new this._class(absoluteUrl, object.name);

  // Copy over properties from the object passed to the add
  // method (including the _id)
  Object.assign(newObj, object);

  // Note that when calling init on the server side, we do not
  // wrap the call in try/catch. On the server, we provide our
  // own data, so we can trust it
  if (typeof newObj.init === 'function') {
    newObj.init(object);
  }

  // Link objects.
  for (const key of Object.keys(newObj)) {
    if (!newObj.hasOwnProperty(key)) continue;
    if (!key.endsWith('Name')) continue;
    const typeName = key.slice(0, key.length - 4);
    if (typeof newObj[key] !== 'string') continue;
    const otherObject = DDS.getObject(typeName, newObj[key]);
    if (!otherObject)
      throw new Error(`Failed to Link DDS Object: ${JSON.stringify(newObj)}`);
    newObj[typeName] = otherObject;
  }
  newObj.incomplete = false;

  this.objects[object.name] = newObj;
  return newObj;
};

DDS.prototype.get = function(name) {
  return this.objects[name];
};
