/*------------------------------------------------------------
A Tileset stores the metadata for a tilemap

Tile indexes start at 1 in the upper leftmost tile:
|1|2|3|
|4|5|6|
|7|8|9|

TilesetClass is designed to be a DDS objects, so it constrains
to certain limitations - EX:
- .init method populates properties

exampleData = {
  "name":"elements",
  "imageUrl": "elements9x3.png",
  "width": 9,
  "height": 3,
  "tileWidth": 28,
  "tileHeight": 35,
  "cellWidth": 30,
  "cellHeight": 37
}
------------------------------------------------------------*/

TilesetClass = function(serverId, name){
  // generic, for all objects
  this.serverId = serverId;
  this.name = name;

  // unique to this DDS Type
  this.imageUrl = '';
  this.width  = 0;
  this.height = 0;
  this.tileWidth = 0;
  this.tileHeight = 0;
  this.cellWidth = 0;
  this.cellHeight = 0;
  this.tileProperties = {};
  this.tileNames = {};
};

TilesetClass.prototype = {
  getUpperLeftX: function(i) {
    return (((i-1) % this.width) * this.cellWidth) + 1;
  },

  getUpperLeftY: function(i) {
    return (Math.floor((i-1) / this.width) * this.cellHeight) + 1;
  },

  init: function(obj){
    // Copy over the properties from tileNames. This will run on
    // the server, and update the name property, causing the
    // this.tileProperty.name array to be sent to the client
    // with the initila payload. Notice that we use null for
    // nameless values, and not undefined. Note that there is an
    // edge-case with JSON.stringify.
    //
    // If we JSON.stringify([undefined]) we get '[null]'. The
    // result of this is that if we send an array with
    // undefined to the client it unserializes to 'null'.
    //
    // In the current implementation we the name property is run
    // inside the init method on the server, and then it is sent
    // to the client. When the init method runs on the client,
    // the init method does not need to overwrite name property.

    if (this.tileProperties.name) return;
    if (typeof this.tileNames === 'object'){
      let names = new Array(this.height * this.width);
      // For so
      names.fill(null);

      for (let name in this.tileNames){
        let numOrArray = this.tileNames[name];
        if (typeof numOrArray === 'number')
          names[numOrArray-1] = name;
        else {
          // assume array
          numOrArray.forEach((num)=>{names[num-1] = name;}, this);
        }
      }

      // Array.fill(undefined) doesn't work
      this.tileProperties.name = names;
    }
  },

  indicesToNames: function(indices){
    return indices.map(this.indexToName, this);
  },

  // Note that this method passes anything that is not a number
  // unmodified. This lets us pass arrays to indicesToNames that
  // contain objects. One use case is passing in results from
  // MapClass.prototype.isObstructed(ctxy)
  indexToName: function(index){
    if (typeof index !== 'number') return index;
    const name = this.prop(index, 'name');
    return (name) ? name : index;
  },

  // we can use a tile index OR a tilename for i
  prop: function(indexOrName, propertyName){
    var i;
    if (this.incomplete) return undefined;

    var properties = this.tileProperties[propertyName];
    if (!properties) return undefined;

    if (typeof indexOrName === 'string'){

      i = this.tileNames[indexOrName];
      if (i === undefined)
        throw new Error('No tile named ' + indexOrName);

      // if the result is not a number, assume array
      if (typeof i !== 'number')
        i = i[0];

    } else {
      // assume index
      i = indexOrName;
    }

    // notice that the indecies of the arrays must be offset by
    // -1 because the tileset is indexed from 1 while the arrays
    // are indexed from 0.
    return properties[i-1];
  }

};
