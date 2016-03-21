# After a character is asked to move to a new server, we wait
# for confirmation that the new server received our character.
SERVER_CHANGE_TIMEOUT_MS = 10 * 1000

timeoutAsync = (ms, cb)-> Meteor.setTimeout cb, ms
timeoutSync = Meteor.wrapAsync timeoutAsync

# Check for orphaned characters when we launch the server
Meteor.startup ->
  cursor = Characters.find 'transaction.transactionStartTime':{$lt: new Date}
  count = cursor.count()
  console.log 'Found ' + count + ' orphaned character' + if count is 1 then '.' else 's.'
  return unless count
  console.log 'Un-orphaning -> Attempt to resolve map changes. Cancel server changes.'
  cursor.forEach (char)->
    console.log 'Character:', char
    if char.transaction.targetAddr
      try
        Characters.resolveTransaction char._id, char.transaction.id
      catch
        Characters.cancelTransaction char._id, char.transaction.id
    else if char.transaction.targetServerId
      Characters.update char._id, $set:{transaction:null}


Characters = new Mongo.Collection 'characters'
Characters._ensureIndex {ownerId:1}

# Publish all the characters that a user owns
Meteor.publish null, ->
  return @ready() unless @userId
  Characters.find {ownerId: @userId}

# Allow user to subscribe to characters by ._id
# We probably want to think about some rate-limiting
Meteor.publish 'character', (id)->
  return unless id
  check id, String
  return Characters.find {_id:id}
Meteor.publish 'map-character', (mapName, id)->
  check id, String
  check mapName, String
  characters = Maps.getCharacters(mapName)
  return characters.find {_id:id}


# Meteor "check" patterns
#
# ObjectIncluding with Match.Optional means
tilesetSelectorPattern =
  name: String
  url: Match.Optional String
  index: Match.Optional Match.Integer

#   Example: IF the object has a 'cx' key, the 'cx' value MUST be an integer
characterAddPattern = Match.ObjectIncluding({
  _id: Match.Optional String
  mapName: Match.Optional String
  tilesetSelector: Match.Optional tilesetSelectorPattern
  name: Match.Optional String
  cx: Match.Optional Match.Integer
  cy: Match.Optional Match.Integer
  tx: Match.Optional Match.Integer
  ty: Match.Optional Match.Integer
  ownerId: Match.Optional String
})

addrPattern = Match.OneOf(
  Match.ObjectIncluding({
    cx: Match.Integer
    cy: Match.Integer
    tx: Match.Integer
    ty: Match.Integer
    mapName: Match.OneOf(String, undefined)
    serverName: Match.Optional String
    serverId: String
  }),
  Match.ObjectIncluding({
    serverId: String
    cx: Match.Optional Match.Integer
    cy: Match.Optional Match.Integer
    tx: Match.Optional Match.Integer
    ty: Match.Optional Match.Integer
  }),
  Match.ObjectIncluding({
    # If mapName null, we don't need ctxy
    serverId: String
    serverName: Match.Optional String
    mapName: null
  })
)

defaultTS =
  name: 'characters',
  url: Meteor.absoluteUrl()


# Create A Character.
# Make sure to keep docs/characters.md up-to-date
#
# If conf includes an _id, this method assumes that we have
# already verified the _id - i.e. the user that is creating
# this character owns the character on the specified server
Characters.add = (conf)->
  # verify the configuration spec
  check conf, characterAddPattern

  # add default values
  # If no _id is provided, assume the character is originating on this server
  conf._id ?= GameServers.newId()
  conf.tilesetSelector ?= defaultTS
  conf.tilesetSelector.name ?= defaultTS.name
  conf.tilesetSelector.url ?= defaultTS.url
  conf.tilesetSelector.index ?= 1

  # Create and insert in master characters collection
  mainChar = 
    serverId: GameServers.localId() # Where is char currently?
    ownerId: conf.ownerId # Might be undefined
    mapName: null
    _id: conf._id
    tilesetSelector: conf.tilesetSelector
    transaction: null

  return Characters.insert mainChar # insert returns _id


# Send a character to an address
Characters.toAddr = (charId, addr)->
  check charId, String
  try
    check addr, addrPattern
  catch error
    throw new Meteor.Error error.message, 'illegal target', 'Target location must include .mapName .cx .cy .tx .ty, OR specify a serverId'

  mainChar = Characters.findOne charId
  if not mainChar
    throw new Meteor.Error 'not found', 'Character not found:' + charId

  localId = GameServers.localId()
  localName = GameServers.localName()

  transaction =
    id: Random.id()
    transactionStartTime: new Date
    attemptCount: 0
    targetAddr: {}

  # If a serverId (1) is different than the character's current
  # serverId, and (2) is not this server, then we need to wait
  # for a confirmation before attempting to resolve
  sId = addr.serverId
  if sId and sId != mainChar.serverId and sId != localId
    transaction.requireConfirmation = true

  # Do we need to update the character's serverId
  if sId and sId != mainChar.serverId
    transaction.targetServerId = addr.serverId
    transaction.currentServerId = mainChar.serverId

  # Are we arriving/staying on this server?
  if sId == localId
    # ensure map exists, else throw.
    targetMap = Maps.getMap addr.mapName
    targetCtxy =
      cx: addr.cx
      cy: addr.cy
      tx: addr.tx
      ty: addr.ty

    # If the character is already on the correct map, we can
    # just update her.
    if addr.mapName == mainChar.mapName
      targetMap.characters.update charId, $set: targetCtxy
      return

    transaction.targetAddr = targetCtxy
    transaction.targetAddr.mapName = addr.mapName

    # is the character in question currently on a map
    if mainChar.mapName
      currentMapChars = Maps.getCharacters mainChar.mapName
      transaction.currentAddr = currentMapChars.findOne charId, fields:{cx:1, cy:1, tx:1, ty:1}
      transaction.currentAddr.mapName = mainChar.mapName # if this throws we couldn't find our local map character

  # If we staying on a different server, do nothing
  if sId == mainChar.serverId and sId != localId
    return

  # You must resolve server names before calling toAddr. If a
  # serverName is specified (and no serverId is specified), the
  # serverName must be localName
  if not addr.serverId and addr.serverName and addr.serverName != localName
    throw new Meteor.Error 'invalid addr', "To move to another server, specify a serverId, not a serverName"

  # We are ready to save our transaction
  unless Characters.update {_id:charId, transaction:null}, {$set: {transaction:transaction}}
    throw new Meteor.Error 'map change fail', 'That character is currently locked'

  if transaction.targetServerId and not transaction.currentServerId
    throw new Error 'Transaction specified targetServerId but not currentServerId'

  # Do we need to wait for confirmation before continuing?
  if transaction.requireConfirmation
    timeoutAsync SERVER_CHANGE_TIMEOUT_MS, ->
      if Characters.update {_id:charId, 'transaction.id':transaction.id}, {$set: {transaction:null}}
        console.warn 'Failed to transfer character to addr.serverId', charId
    return transaction.id
  else
    Characters.confirmTransaction charId, transaction.id


Characters.confirmTransaction = (charId, transactionId)->
  try
    Characters.resolveTransaction charId, transactionId
  catch error
    Characters.cancelTransaction charId, transactionId
    throw error


# Lookup a character by id. That character must also have a
# .transaction and .transaction.id sub-documents with the
# following spec:
# {
#    id: transactionId
#    transactionStartTime: /* JavaScript Date object */
#    // if a transaction has targetServerId, it must have currentServerId
#    targetServerId: 
#    currentServerId:
#    // if a transaction targetAddr it must also have currentAddr
#    targetAddr: {
#      cx:, cy:, tx:, ty:, mapName:
#    },
#    currentAddr: {
#      cx:, cy:, tx:, ty:, mapName:
#    },
#    attemptCount: 0
# }
# Increment attempt count, and finish the transaction, or
# throw an error
#
Characters.resolveTransaction = (charId, transactionId)->
  Characters.update {_id:charId, 'transaction.id':transactionId},
    $inc:{'transaction.attemptCount':1}

  mainChar = Characters.findOne {_id:charId, 'transaction.id':transactionId}
  unless mainChar?.transaction
    throw new Meteor.Error 'map change fail', 'That characterId and transactionId combination does not exist'

  transaction = mainChar.transaction

  currentMapName = mainChar.mapName
  if currentMapName and currentMapName != transaction.targetAddr.mapName
    Maps.getCharacters(currentMapName).remove charId

  targetMapName = transaction.targetAddr.mapName
  if targetMapName
    targetMap = Maps.getMap targetMapName
    addr = transaction.targetAddr
    newMapChar =
      tilesetSelector: mainChar.tilesetSelector
      _id: charId
      cx: addr.cx
      cy: addr.cy
      tx: addr.tx
      ty: addr.ty
    # Verify that ctxy are in range
    targetMap.checkCtxy newMapChar
    # Now insert the new char into the new map
    targetMap.characters.upsert charId, newMapChar

  # Update the main character, and we should be complete
  update = $set:
    transaction: null
    mapName: targetMapName or null

  if transaction.targetServerId
    update.$set.serverId = transaction.targetServerId

  unless Characters.update {_id:charId, 'transaction.id':transactionId}, update
    throw new Meteor.Error 'map change fail', 'Failed to update Characters collection with new character location'


Characters.cancelTransaction = (charId, transactionId)->
  mainChar = Characters.findOne {_id:charId, 'transaction.id':transactionId}
  unless mainChar?.transaction
    throw new Meteor.Error 'cancel map change fail', 'That characterId and transactionId combination does not exist'
  targetMapName = mainChar.transaction.targetAddr.mapName
  currentMapName = mainChar.transaction.currentAddr?.mapName
  targetServerId = mainChar.transaction.targetServerId
  # Clear the character from the target map (if the target map exists)
  if targetMapName and targetMapName isnt currentMapName
    Maps.getCharacters(targetMapName).remove charId
  # If the character somehow got removed, from the current map, update it
  if currentMapName
    Maps.getCharacters(currentMapName).upsert charId, $setOnInsert:
      cx: mainChar.transaction.currentAddr.cx
      cy: mainChar.transaction.currentAddr.cy
      tx: mainChar.transaction.currentAddr.tx
      ty: mainChar.transaction.currentAddr.ty
      tilesetSelector: mainChar.tilesetSelector

  update = $set:
    mapName: currentMapName or null
    transaction: null
  if targetServerId
    update.$set.serverId = mainChar.transaction.currentServerId
  Characters.update charId, update
