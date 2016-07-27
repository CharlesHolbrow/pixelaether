Tinytest.add 'characters-server - ingredients exist', (test)->
  test.isTrue Characters, 'Characters collection must exist'
  test.isTrue Maps, 'Maps object required for testing'
  test.isTrue MapDDS, 'We need MapDDS to create a dummy map for testing with'
  test.isTrue typeof Characters.toAddr == 'function', 'Characters.toAddr must be a function'
  test.isTrue typeof Characters.add == 'function', 'Characters.add must be a function'


TilesetDDS.add
  name:"elements"
  imageUrl: "elements9x3.png"
  width: 9
  height: 3
  tileWidth: 28
  tileHeight: 35
  cellWidth: 30
  cellHeight: 37

MapDDS.add
  name: "map1"
  tilesetName: "elements"
  chunkWidth: 16
  chunkHeight: 16

MapDDS.add
  name: 'map2'
  tilesetName: 'elements'
  chunkWidth: 12
  chunkHeight: 8

# Hack: just publish all the characters
map1 = Maps.getMap 'map1'
map2 = Maps.getMap 'map2'
Meteor.publish null, ->
  return [map1.characters.find(), map2.characters.find()]

# if there are no characters, add some test data
map1Char = Characters.findOne {mapName:'map1'}
map2Char = Characters.findOne {mapName:'map2'}
if map1Char then map1CharId = map1Char._id
else map1CharId = Characters.add {mapName:'map1'}

if map2Char then map2CharId = map2Char._id
else map2CharId = Characters.add {mapName: 'map2'}

Characters.toAddr map1CharId, {mapName:'map1', cx:0, cy:0, tx:0, ty:0}
Characters.toAddr map2CharId, {mapName:'map2', cx:0, cy:0, tx:0, ty:0}

Tinytest.add 'characters-server - Characters.add add a char to both map and main character collection', (test)->
  map1Chars = map1.characters.find().fetch()
  map2Chars = map2.characters.find().fetch()
  mainChars = Characters.find().fetch()
  test.equal map1Chars.length + map2Chars.length, mainChars.length, 'main character collection has same number of documents as all map collections'
  console.log 'found', mainChars.length, 'characters'

Tinytest.add 'characters-server - we have ids for our two test characters', (test)->
  test.equal typeof map2CharId, 'string', 'have map2CharId'
  test.equal typeof map1CharId, 'string', 'have map1CharId'

Tinytest.add 'characters-server - junk input to Characters.toAddr throws an error', (test)->
  test.throws ->
    Characters.toAddr map1CharId, {mapName: {x:'not a string'}, cx:0, cy:0, tx:0, ty:0}
  test.throws ->
    Characters.toAddr map1CharId, {mapName: 'notAnActualMapName', cx:0, cy:0, tx:0, ty:0}
  test.throws ->
    Characters.toAddr map1CharId, {mapName: 'map2', cx:0, cy:0, tx:0} # missing .ty
  test.throws ->
    Characters.toAddr map1CharId # no second argument
  test.throws ->
    Characters.toAddr 'notArealId', {mapName: 'map1', cx:0, cy:0, tx:0, ty:0}
  test.throws ->
    Characters.toAddr undefined, {mapName: 'map1', cx:0, cy:0, tx:0, ty:0}

Tinytest.add 'characters-server - Characters.toAddr move a char to another map', (test)->
  oldChar = Characters.findOne map1CharId
  Characters.toAddr map1CharId, {mapName:'map2', cx:0, cy:0, tx:0, ty:0}
  newChar = Characters.findOne map1CharId
  console.log 'Old main character:', oldChar
  console.log 'New main character:', newChar
  test.equal newChar.mapName, 'map2', 'toAddr should update mapName'

Tinytest.add 'characters-server - the new map character is identical to the old character', (test)->
  map2MapChar = map2.characters.findOne()
  mainMap2Char = Characters.findOne map2MapChar._id
  test.equal mainMap2Char.mapName, 'map2', 'this better be true'
  # now we have a character that we are sure is on map2
  # let's bring it over to map 1, and make sure it's still the same
  test.equal {a:'a'}, {a:'a'}, 'verify that we can use test.equal with different JSON objects'
  # move to same position on a different map
  Characters.toAddr(mainMap2Char._id, {
    mapName:'map1',
    cx:map2MapChar.cx,
    cy:map2MapChar.cy,
    tx:map2MapChar.tx,
    ty:map2MapChar.ty
  })
  mainChar = Characters.findOne mainMap2Char._id
  movedMapChar = map1.characters.findOne mainMap2Char._id
  test.equal movedMapChar, map2MapChar, 'moved map character should be identical to original'
