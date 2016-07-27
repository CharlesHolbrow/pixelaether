const async = Npm.require('async');

// minimum properties for new maps
const mapSpec = {
  name: 'string',
  tilesetName: 'string',
  chunkWidth: 'number',
  chunkHeight: 'number',
};

MapClass.prototype.customize = function() {
  // create collections
  const chunksName  = `${this.name}_map_chunks`;
  const charsName   = `${this.name}_map_characters`;
  this.chunks       = new Mongo.Collection(chunksName, { idGeneration: 'STRING' });
  this.characters   = new Mongo.Collection(charsName, { idGeneration: 'STRING' });

  // Big efficiency improvement, _ensureIndex may be removed in future Meteor release
  this.chunks._ensureIndex({ cx: 1, cy: 1 }, { unique: true });
  this.characters._ensureIndex({ cx: 1, xy: 1 });
  this.characters._ensureIndex({ name: 1 });
  // Useful for modifying characters in Meteor methods
  this.charactersUpsertSync = Meteor.wrapAsync(this.characters.upsert, this.characters);
  this.charactersInsertSync = Meteor.wrapAsync(this.characters.insert, this.characters);

  // Store functions registered by .onNewChunk
  this.onNewChunkFunctions = [];

  // On the server we can use this shortcut for accessing Maps
  Maps[this.name] = this;
};

MapClass.prototype.init = function(obj) {

  for (key in mapSpec)
    if (typeof obj[key] !== mapSpec[key])
      throw new Error(`New map missing: ${key} - of type: ${mapSpec[key]}`);

  this.chunkSize = obj.chunkWidth * obj.chunkHeight;
};

// func(err, chunk){} // callback bound to map object
MapClass.prototype.onNewChunk = function(func) {
  this.onNewChunkFunctions.push(Meteor.bindEnvironment(func, null, this));
};

MapClass.prototype.createNewChunk = function(cx, cy) {
  const self = this;

  let chunk = this.chunks.findOne({ cx, cy });
  if (chunk) {
    console.warn(this.name, 'chunk already exists, not creating:', cx, ',', cy);
    return null;
  }

  chunk = {
    cx, cy,
    mapName: this.name,
    width: this.chunkWidth,
    height: this.chunkHeight,
  };

  // setup an array of functions to waterfall over
  const funcs = [Meteor.bindEnvironment((cb) => { cb(null, chunk); }, null, this)].concat(this.onNewChunkFunctions);

  // call each of our user defined functions
  async.waterfall(funcs, (err, chunk) => {
    // if we still don't have any layers, add a dummy layer
    for (let i = 0; i < self.chunkSize; i++) {
      if (!chunk.hasOwnProperty(i) || ! _.isArray(chunk[i])) {
        throw new Error(`new chunks is missing array at index ${i}`);
      }
    }

    chunk._id = `${chunk.cx.toString(36)}_${chunk.cy.toString(36)}`;

    //  On completion, insert
    self.chunks.upsert({ cx: chunk.cx, cy: chunk.cy, mapName: chunk.mapName }, chunk, (err) => {
      if (err) console.warn('When creating chunk:', chunk, 'an error occured:', err);
      else console.log('Added new chunk at', chunk.cx, ',', chunk.cy);
    });
  });
};
