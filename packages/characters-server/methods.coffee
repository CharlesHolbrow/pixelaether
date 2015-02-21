Meteor.methods
  
  addCharacter: (characterId)->
    check characterId, String

    unless @userId
      throw new Meteor.Error 'logged-out', 'Anonymous user tried to call acceptCharacter'

    mainChar = Characters.findOne characterId
    # If the character already exists in our collection, our
    # job done.
    if mainChar
      if mainChar.ownerId is @userId
        return mainChar
      else
        throw new Meteor.Error 'not allowed', 'You do not own that character'

    serverId = GameServers.extractServerId characterId
    unless serverId
      throw new Meteor.Error 'bad id', 'That characterId does not include an origin stamp'

    # If the character's serverId indicates that the character
    # originated on this server, and we didn't find it locally,
    # The character does not exist.
    if serverId is GameServers.localId()
      throw new Meteor.Error 'not found', 'That character does not exist'

    # The character does not exist in our local collection. Try
    # to get it from its owners collection.
    serverInfo = GameServers.findOneForUser serverId, @userId

    unless serverInfo
      throw new Meteor.Error 'not found', 'The server that owns that character could not be found'

    connection = Rift.connection serverInfo.url
    mainChar = connection.call 'getCharacterInfo', characterId

    unless mainChar
      throw new Meteor.Error 'not found', 'That character could not be found'

    if mainChar.ownerId isnt @userId
      throw new Meteor.Error 'not allowed', 'You do not own that character'

    # At this point:
    # - The character does not exist in our local collection
    # - The characterId indicates the character originated on a
    #   foreign server
    # - We manged to retrieve the character document from the
    #   server that owns the character
    # - The server that owns this character also reported that
    #   The character is owned by the same user that called
    #   this method
    #
    # It should be safe to add the character to our local
    # collection.

    # For now, we are just going to add the character to a
    # static location.
    mainChar.mapName = 'main'
    mainChar.tx = 0
    mainChar.ty = 0
    mainChar.cx = 0
    mainChar.cy = 0
    Characters.add mainChar
    return Characters.findOne characterId

  # This may only be called by the user who owns the serverId,
  # or the user who owns charId. At least one must confirm that
  confirmTransaction: (charId, transactionId)->
    unless @userId
      throw new Meteor.Error 'logged-out', 'You must be logged in to confirmServerChange'

    char = Characters.findOne {_id:charId, 'transaction.id':transactionId, ownerId:@userId}
    unless char
      throw new Meteor.Error 'not allowed', 'You do not own a character with that transactionId'

    Characters.confirmTransaction charId, transactionId

  getCharacterInfo: (selector)->
    unless @userId
      throw new Meteor.Error 'logged-out', 'You must be logged in to getCharacterInfo'

    mainChar = Characters.findOne selector
    if mainChar.mapName
      mapChar = Maps.getCharacters(mainChar.mapName)?.findOne mainChar._id
      mapChar and _(mainChar).defaults mapChar

    return mainChar

  toAddr: (charId, addr)->
    unless @userId
      throw new Meteor.Error 'not allowed', 'You must be logged in to move a Character'
    unless Characters.findOne {_id:charId, ownerId:@userId}
      throw new Meteor.Error 'not allowed', 'You do not own that character'
    Characters.toAddr charId, addr
