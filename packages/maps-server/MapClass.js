var async = Npm.require('async');

MapClass.prototype.customize = function(){
  // create collections
  this.chunks      = new Mongo.Collection(this.name + '_map_chunks', {idGeneration: 'STRING'});
  this.characters  = new Mongo.Collection(this.name + '_map_characters', {idGeneration: 'STRING'});

  // Big efficiency improvement, _ensureIndex may be removed in future Meteor release
  this.chunks._ensureIndex({cx:1, cy:1}, {unique: true});
  this.characters._ensureIndex({cx:1, xy:1});
  this.characters._ensureIndex({name: 1});
  // Useful for modifying characters in Meteor methods
  this.charactersUpsertSync = Meteor.wrapAsync(this.characters.upsert, this.characters);
  this.charactersInsertSync = Meteor.wrapAsync(this.characters.insert, this.characters);

  // Store functions registered by .onNewChunk
  this.onNewChunkFunctions = [];

  // On the server we can use this shortcut for accessing Maps
  Maps[this.name] = this;
};

MapClass.prototype.init = function(obj){

 for (key in mapSpec)
    if (typeof obj[key] !== mapSpec[key])
      throw new Error('New map missing: ' + key + ' - of type: ' + mapSpec[key]);

  this.chunkSize = obj.chunkWidth * obj.chunkHeight;
};

// func(err, chunk){} // callback bound to map object
MapClass.prototype.onNewChunk = function(func){
  this.onNewChunkFunctions.push(Meteor.bindEnvironment(func, null, this));
};

MapClass.prototype.createNewChunk = function(cx, cy){
  var self = this;
  var chunk = this.chunks.findOne({cx:cx, cy:cy});
  if (chunk){
    console.warn(this.name, 'chunk already exists, not creating:', cx, ',', cy);
    return null;
  }

  chunk = {
    mapName:    this.name,
    cx:         cx,
    cy:         cy,
    width:      this.chunkWidth,
    height:     this.chunkHeight,
    layerNames: []
  };

  // setup an array of functions to waterfall over
  var funcs = [Meteor.bindEnvironment(function(cb){cb(null, chunk)}, null, this)].concat(this.onNewChunkFunctions);

  // call each of our user defined functions
  async.waterfall(funcs, function(err, chunk){
    // if we still don't have any layers, add a dummy layer
    if (!chunk.layerNames.length){
      chunk.layerNames.push('ground');
      chunk.ground = [];
      var size = chunk.width * chunk.height;
      for (var i = 0; i < size; i++) chunk.ground[i] = 1; // 1 is tree in elements9x3.png, 10 is grass
    }
    //  On completion, insert
    self.chunks.upsert({cx: chunk.cx, cy:chunk.cy, mapName: chunk.mapName}, chunk, function(err, numberChanged){
      if (err) console.warn('When creating chunk:', chunk, 'an error occured:', err);
      else console.log('Added new chunk at', chunk.cx, ',', chunk.cy);
    });
  });
};

// minimum properties for new maps
var mapSpec = {
  name: 'string',
  tilesetName: 'string',
  chunkWidth: 'number',
  chunkHeight: 'number'
};