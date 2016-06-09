/*------------------------------------------------------------
DDS ORM Model for our maps

IMPORTANT: These are NOT safe to be called by untrusted code

These methods are responsible for verifying valid inputs, BUT

Server side Meteor methods are responsible for verifying a
user is allowed to call these
------------------------------------------------------------*/


MapClass = function(serverId, name){
  // all dds types must do this
  this.name = name;
  this.serverId = serverId;
  this.incomplete = true;

  // unique to this dds type
  this.chunkWidth = 0;
  this.chunkHeight = 0;
  this.chunkSize = 0;
  this.tilesetName = '';
  this.tileset = null;

  // The .customize method is defined in two places
  //  1. maps-server/MapClass.js
  //  2. maps-client/MapClass.js
  // Used to implement behavior unique to the server/client
  // For Example
  // - On the client, we get our collections from Rift
  // - On the server, we just create our collections
  this.customize();
};


// Match an object where any of cx, cy, tx, ty are either not
// present, or are integers.
var ctxyPattern = Match.Where(function(input){
  var ctxy = _.pick(input, 'cx', 'cy', 'tx', 'ty');
  return Match.test(ctxy, {
    cx: Match.Integer,
    cy: Match.Integer,
    tx: Match.Integer,
    ty: Match.Integer
  });
});


/*------------------------------------------------------------
checkCharacter
checkCtxy
moveCharacter
moveCharacterTo
query
setTile
throw
------------------------------------------------------------*/
// return a character document or throw an error
MapClass.prototype.checkCharacter = function(selector){
  // make sure that the character exists on map named mapName
  character = this.characters.findOne(selector);
  if (typeof characterOrId !== 'object')
    this.throw('moveCharacterTo character not valid or not found: ' + characterOrId);
  return character;
};

// Verify ctxy has all four values and they are in range
// ctxy MAY have additional keys beyond ctxy
MapClass.prototype.checkCtxy = function(ctxy){
  check(ctxy, ctxyPattern);
  if (this.incomplete)
    this.throw('map incomplete');
  if (ctxy.tx >= this.chunkWidth || ctxy.tx < 0)
    this.throw('x out of bounds');
  if (ctxy.ty >= this.chunkHeight || ctxy.ty < 0)
    this.throw('y out of bounds');
  return ctxy;
};

// this is a very hacky way to check if there is an obstruction
MapClass.prototype.isObstructed = function(ctxy){
  if (this.incomplete) return undefined; // consider console.warn?
  this.checkCtxy(ctxy);

  const tiles = this._queryChunks(ctxy).filter((val)=>{
    return this.tileset.prop(val, 'obstructed');
  }, this);

  const characters = this._queryCharacters(ctxy);
  const obstacles = tiles.concat(characters);

  return (obstacles.length) ? obstacles : false;
};

MapClass.prototype.moveCharacterTo = function(selector, ctxy){
  this.checkCtxy(ctxy);
  this.characters.update(selector, {$set:{cx:ctxy.cx, cy:ctxy.cy, tx:ctxy.tx, ty:ctxy.ty}});
};

MapClass.prototype.query = function(ctxy){
  // should map methods take Coords?
  if (this.incomplete) return [];
  this.checkCtxy(ctxy);

  const results = this._queryChunks(ctxy);

  // and get all the characters
  var chars = this._queryCharacters(ctxy);

  return results.concat(chars);
};

// protected by an underscore, because input is not checked
MapClass.prototype._queryCharacters = function(ctxy){
  return this.characters.find(
    {cx:ctxy.cx, cy:ctxy.cy, tx:ctxy.tx, ty:ctxy.ty}
  ).fetch();
};

// protected by an underscore, because input is not checked
// for now I'm not going to include any zeros. in the results
MapClass.prototype._queryChunks = function(ctxy){
  const results = [];
  const chunk = this.chunks.findOne({cx: ctxy.cx, cy:ctxy.cy});
  const index = ctxy.ty * this.chunkWidth + ctxy.tx;

  if (!chunk) return results;

  // get the layer names
  for (let i = 0; i < chunk.layerNames.length; i++){
    let val = chunk[chunk.layerNames[i]][index];
    if (val) results.push(val); // don't push zeros
  }
  return results;
};

MapClass.prototype.queryNames = function(ctxy){
  const results = this.query(ctxy);
  return this.tileset.indicesToNames(results);
};

MapClass.prototype.setTile = function (ctxy, i, layerName) {
  layerName = layerName || 'ground';

  check(i, Match.Integer);
  check(layerName, String);
  this.checkCtxy(ctxy);

  var tileIndex = ctxy.ty * this.chunkWidth + ctxy.tx; // convert xy to index
  var options = {$set:{}};
  options.$set[layerName + '.' + tileIndex] = i;

  // layerNames key in the selector is very important.
  // prevent users from inserting arbitrary layers into our chunks
  this.chunks.update({cx:ctxy.cx, cy:ctxy.cy, layerNames:layerName}, options);
};

MapClass.prototype.throw = function(reason){
  throw new Meteor.Error(this.name + ' Map Error: ' + (reason || 'Unknown Error'));
};
