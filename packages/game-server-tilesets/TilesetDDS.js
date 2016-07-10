TilesetClass.prototype.setIndividual = function(tileIndex, propertyName, value) {

  if (!this.hasOwnProperty('tileProperties'))
    this.tileProperties = {};

  if (!this.tileProperties.hasOwnProperty(propertyName))
    this.tileProperties[propertyName] = new Array(this.height * this.width);

  this.tileProperties[propertyName][tileIndex - 1] = value;
};


// First argument must be one of the following:
//
// 1. tileIndex  (remember tiles are indexed at 1, not 0)
// 2. tileName in the form of a string
// 3. an array of tileNames and tileIndexes

TilesetClass.prototype.set = function(tileNameNumberOrArray, propertyName, value) {

  if (typeof tileNameNumberOrArray === 'number')
    return this.setIndividual(tileNameNumberOrArray, propertyName, value);

  if (typeof tileNameNumberOrArray === 'string')
    return this.set(this.tileNames[tileNameNumberOrArray], propertyName, value);

  // assume array
  for (let i = 0; i < tileNameNumberOrArray.length; i++) {
    const key = tileNameNumberOrArray[i];
    this.set(key, propertyName, value);
  }
};

TilesetDDS = new DDS('tileset', TilesetClass);
