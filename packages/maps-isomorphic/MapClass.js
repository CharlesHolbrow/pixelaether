import { Coord } from 'meteor/coord';
/*------------------------------------------------------------
DDS ORM Model for our maps

IMPORTANT: These are NOT safe to be called by untrusted code

These methods are responsible for verifying valid inputs, BUT

Server side Meteor methods are responsible for verifying a
user is allowed to call these
------------------------------------------------------------*/


MapClass = function(serverId, name) {
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
const ctxyPattern = Match.Where((input) => {
  const ctxy = _.pick(input, 'cx', 'cy', 'tx', 'ty');
  return Match.test(ctxy, {
    cx: Match.Integer,
    cy: Match.Integer,
    tx: Match.Integer,
    ty: Match.Integer,
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
MapClass.prototype.checkCharacter = function(selector) {
  // make sure that the character exists on map named mapName
  const character = this.characters.findOne(selector);
  if (typeof character !== 'object')
    this.throw(`Character not valid or not found: ${JSON.stringify(selector)}`);
  return character;
};

// Verify ctxy has all four values and they are in range
// ctxy MAY have additional keys beyond ctxy
MapClass.prototype.checkCtxy = function(ctxy) {
  check(ctxy, ctxyPattern);
  if (this.incomplete)
    this.throw('map incomplete');
  if (ctxy.tx >= this.chunkWidth || ctxy.tx < 0)
    this.throw('x out of bounds');
  if (ctxy.ty >= this.chunkHeight || ctxy.ty < 0)
    this.throw('y out of bounds');
  return ctxy;
};

MapClass.prototype.isObstructed = function(ctxy) {
  if (this.incomplete) return undefined; // consider console.warn?
  this.checkCtxy(ctxy);

  const tiles = this._queryChunks(ctxy).filter((val) => {
    return this.tileset.prop(val, 'obstructed');
  }, this);

  const characters = this._queryCharacters(ctxy);
  const obstacles = tiles.concat(characters);

  return (obstacles.length) ? obstacles : false;
};

MapClass.prototype.moveCharacterTo = function(selector, ctxy) {
  this.checkCtxy(ctxy);
  this.characters.update(selector, { $set:
    { cx: ctxy.cx, cy: ctxy.cy, tx: ctxy.tx, ty: ctxy.ty },
  });
};

MapClass.prototype.query = function(ctxy) {
  // should map methods take a Coord?
  if (this.incomplete) return [];
  this.checkCtxy(ctxy);

  const results = this._queryChunks(ctxy);

  // and get all the characters
  const chars = this._queryCharacters(ctxy);

  return results.concat(chars);
};

// protected by an underscore, because input is not checked
MapClass.prototype._queryCharacters = function(ctxy) {
  return this.characters.find(
    { cx: ctxy.cx, cy: ctxy.cy, tx: ctxy.tx, ty: ctxy.ty }
  ).fetch();
};

// protected by an underscore, because input is not checked
// for now I'm not going to include any zeros. in the results
MapClass.prototype._queryChunks = function(ctxy) {
  const results = [];
  const chunk = this.chunks.findOne({ cx: ctxy.cx, cy: ctxy.cy });
  const index = ctxy.ty * this.chunkWidth + ctxy.tx;

  if (!chunk) return results;

  // get the layer names
  for (let i = 0; i < chunk.layerNames.length; i++) {
    const val = chunk[chunk.layerNames[i]][index];
    if (val) results.push(val); // don't push zeros
  }
  return results;
};

// protected by an underscore, because input is not checked
MapClass.prototype._isOpaque = function(ctxy) {
  const results = this._queryChunks(ctxy);
  for (index of results) {
    if (this.tileset.prop(index, 'opaque')) return true;
  }
  return false;
};

MapClass.prototype.queryNames = function(ctxy) {
  const results = this.query(ctxy);
  return this.tileset.indicesToNames(results);
};

MapClass.prototype.setTile = function(ctxy, i, layerName) {
  layerName = layerName || 'ground';

  check(i, Match.Integer);
  check(layerName, String);
  this.checkCtxy(ctxy);

  const tileIndex = ctxy.ty * this.chunkWidth + ctxy.tx; // convert xy to index
  const options = { $set: {} };
  options.$set[`${layerName}.${tileIndex}`] = i;

  // layerNames key in the selector is very important.
  // prevent users from inserting arbitrary layers into our chunks
  this.chunks.update({ cx: ctxy.cx, cy: ctxy.cy, layerNames: layerName }, options);
};

MapClass.prototype.throw = function(reason) {
  reason = reason || 'Unknown Error';
  throw new Meteor.Error(`${this.name} Map Error: ${reason}`);
};

// Generator returns all addresses in order that we must check
// given a starting point and a direction.
//
// For example if radius = 2, direction = 'n', our generator
// will return the addresses of the positions in the quadrant
// north of the player in the order shown below.
//
// 4 5 6 7 8
//   1 2 3
//     @
//
const losKey = {
  n: {
    // When checking the north direction, each new line that we
    // check moves this much from the previous new line.
    line: { tx: -1, ty: 1 },
    // When checking the north direction each step on the line
    // moves by this much.
    step: { tx: 1 },
  },
  e: {
    line: { tx: 1, ty: 1 },
    step: { ty: -1 },
  },
  s: {
    line: { tx: 1, ty: -1 },
    step: { tx: -1 },
  },
  w: {
    line: { tx: -1, ty: -1 },
    step: { ty: 1 },
  },
};
MapClass.prototype.losCoordGenerator = function*(startCtxy, direction, radius = 3) {
  const line  = losKey[direction].line;
  const step  = losKey[direction].step;

  const newLineCoord = new Coord(startCtxy);
  const stepCoord    = new Coord();
  for (let r = 1; r <= radius; r++) {
    const width = Math.abs(r * 2 + 1);
    newLineCoord.move(line);
    stepCoord.set(newLineCoord);
    let w = 0;
    while (true) {
      stepCoord.resolveMap(this);
      yield stepCoord;

      if (++w >= width) break;
      stepCoord.move(step);
    }
  }
};

// chunkCatalog is an object where keys are deflated cxy
// strings, and values are chunks retrived from the chunks
// collection.
//
MapClass.prototype.createLightMap = function(startCtxy, radius, chunkCatalog) {

  const LIGHT_LEVEL = 180;
  const lightMap = {};

  const setLightLevel = (coord, level) => {
    if (!lightMap.hasOwnProperty(coord.cx)) lightMap[coord.cx] = {};
    const cxObj = lightMap[coord.cx];
    if (!cxObj.hasOwnProperty(coord.cy)) cxObj[coord.cy] = {};

    const index = (coord.ty * this.chunkWidth) + coord.tx;
    cxObj[coord.cy][index] = level;
  };

  // TODO: don't let this throw on a bad chunk
  const isOpaque = (coord) => {
    // Try to get the chunk from chunkCatalog
    const cxObj = chunkCatalog[coord.cx];
    if (!cxObj) return null;
    const chunk = cxObj[coord.cy];
    if (!chunk) return null;

    // Cheack Each Layer
    for (const layerName of chunk.layerNames) {
      const index = chunk[layerName][coord.ty * chunk.width + coord.tx];
      if (this.tileset.prop(index, 'opaque')) return true;
    }
    return false;
  };

  setLightLevel(new Coord(startCtxy), LIGHT_LEVEL);

  for (const dir of ['n', 's', 'e', 'w']) {

    const obstructedAngles = [];
    let obstructedAnglesSize = 0;

    const gen = this.losCoordGenerator(startCtxy, dir, radius);

    // iterate over each row
    for (let r = 1; r <= radius; r++) {

      // how many tiles are there on this row?
      const width = Math.abs(r * 2 + 1);
      // Every tile has two divisions (NOT width * 2 + 1).
      const divs = width * 2;
      const div = 1 / divs;

      let w = 0;

      let numObstaclesOnThisRow = 0;
      let lastTileInRowIsOpaque = false;

      while (true) {

        // Find the three angles for this tile. In Chrome, using
        // multiplication (not repeated addition) yields more
        // accurate floating point angles.
        // .2 + .2 + .2 + .2 === 0.8000000000000001
        // .2 * 4            === 0.8

        const a1 = w * 2 * div;
        const a2 = (w * 2 + 1) * div;
        // The last time through the loop, we may get a floating
        // point arithmatic error. (.99999999 instead of 1)
        // If this is the last tile on the row, set final angle
        // to 1.
        const a3 = (w === width - 1) ? 1 : (w * 2 + 2) * div;

        // Check if this tile is obstructed by previous rows

        let tileIsVisible = true;
        let a1Visible = true;
        let a2Visible = true;
        let a3Visible = true;

        // This is ugly, and I foolishly optimized for speed
        // However, it has two advantages:
        //
        // 1. Checking if all three angles are blocked by any
        //    combination of obstacles
        // 2. Performs minimum number of checks possible
        for (let i = 0; i < obstructedAnglesSize; i++) {
          const [obA1, obA2] = obstructedAngles[i];

          // check if first Angle is blocked
          if  (a1Visible && a1 >= obA1 && a1 <= obA2) {
            a1Visible = false;
            if (!a2Visible && !a3Visible) { tileIsVisible = false; break; }
          }
          // check if center is blocked
          if  (a2Visible && a2 >= obA1 && a2 <= obA2) {
            a2Visible = false;
            if (!a1Visible && !a3Visible) { tileIsVisible = false; break; }
          }
          //  check if last Angle is blocked
          if  (a3Visible && a3 >= obA1 && a3 <= obA2) {
            a3Visible = false;
            if (!a1Visible && !a2Visible) { tileIsVisible = false; break; }
          }
        }

        // We now know if the tile is obstructed (or not). Even
        // if it is obstructed, we still need to check if it is
        // obstructing other tiles.

        const coord = gen.next().value; // we must make sure this gets called every step of the way

        // mark the tile as visible in our results
        if (tileIsVisible) {
          setLightLevel(coord, LIGHT_LEVEL);
        }

        if (isOpaque(coord)) {
          // If the last tile in the row was opaque, we do not
          // need to create another entry in the array of
          // obstructed angles. We can just increase the size
          // of the last entry.
          if (lastTileInRowIsOpaque) {
            obstructedAngles[obstructedAngles.length - 1][1] = a3;
          } else {
            obstructedAngles.push([a1, a3]);
            numObstaclesOnThisRow++;
          }
          lastTileInRowIsOpaque = true;
        } else {
          lastTileInRowIsOpaque = false;
        }

        if (++w >= width) {
          // start a new row
          obstructedAnglesSize += numObstaclesOnThisRow;
          numObstaclesOnThisRow = 0;
          break;
        }
      }
    }
  }
  return lightMap;
};
