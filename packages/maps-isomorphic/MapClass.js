/*------------------------------------------------------------
DDS ORM Model for our maps

IMPORTANT: These are NOT safe to be called by untrusted code

These methods are responsible for verifying valid inputs, BUT

Server side Meteor methods are responsible for verifying a
user is allowed to call these
------------------------------------------------------------*/

import { Addr } from 'meteor/addr';

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

MapClass.prototype.moveCharacter = function(selector, direction) {
  if (this.incomplete)
    this.throw('Cannot moveCharacter on an incomplete map.');
  if (typeof direction !== 'string')
    this.throw('Cannot moveCharacter - direction must ba a string');
  var currentPosition = this.characters.findOne(selector);

  var targetAddr = new Addr(currentPosition);
  direction = direction.toLowerCase();

  if (direction === 'n'){
    targetAddr.ty += 1;
  } else if (direction === 'e'){
    targetAddr.tx += 1;
  } else if (direction === 's'){
    targetAddr.ty -= 1;
  } else if (direction === 'w'){
    targetAddr.tx -= 1;
  } else {
    this.throw('Cannot moveCharacter - invalid direction');
  }

  targetAddr.resolve(this);
  var setSelector = {};
  if (targetAddr.tx !== currentPosition.tx) setSelector.tx = targetAddr.tx;
  if (targetAddr.ty !== currentPosition.ty) setSelector.ty = targetAddr.ty;
  if (targetAddr.cx !== currentPosition.cx) setSelector.cx = targetAddr.cx;
  if (targetAddr.ty !== currentPosition.ty) setSelector.ty = targetAddr.ty;

  this.characters.update(selector, {$set:setSelector});
};

MapClass.prototype.moveCharacterTo = function(selector, ctxy){
  this.checkCtxy(ctxy);
  this.characters.update(selector, {$set:{cx:ctxy.cx, cy:ctxy.cy, tx:ctxy.tx, ty:ctxy.ty}});
};

MapClass.prototype.query = function(ctxy){
  // should map methods take an addr?
  // doing so would allow us to ._resolve them,
  // but doing so would create a circular dependency
  // i.e. ._resolve would add this map to the addr
  results = [];
  if (this.incomplete) return results;
  this.checkCtxy(ctxy);

  var chunk = this.chunks.findOne({cx: ctxy.cx, cy:ctxy.cy});
  var index = ctxy.ty * this.chunkWidth + ctxy.tx;

  // get the tiles from the map
  if (!chunk) return results;
  for (var i = 0; i < chunk.layerNames.length; i++){
    var value = chunk[chunk.layerNames[i]][index];
    if (typeof value !== 'undefined')
      results.push(value);
  }

  // and get all the characters
  var chars = this.characters.find(
    {cx:ctxy.cx, cy:ctxy.cy, tx:ctxy.tx, ty:ctxy.ty}
  ).fetch();
  for (var j = 0; j < chars.length; j++){
    results.push(chars[j]);
  }

  return results;
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

var ctxyPattern = Match.Where(function(input){
  var ctxy = _.pick(input, 'cx', 'cy', 'tx', 'ty');
  return Match.test(ctxy, {
    cx: Match.Integer,
    cy: Match.Integer,
    tx: Match.Integer,
    ty: Match.Integer
  });
});