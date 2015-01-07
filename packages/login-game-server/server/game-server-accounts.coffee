Meteor.methods

  # userId is the id of the user account on the Master server
  createAccount: (remoteUserId)->
    check remoteUserId, String
    token = AetherUplink.connection.call 'getPassword', AetherUplink.name, remoteUserId
    if not token
      throw new Meteor.Error 'failed to get token from master server for userId: ' + remoteUserId

    console.log 'received token from', AetherUplink.url
    user = Meteor.users.findOne {remoteUserId: remoteUserId}
    if not user
      console.log 'creating new user:', remoteUserId
      localUserId = Accounts.createUser
        username: remoteUserId
        password: token
      Meteor.users.update localUserId, $set:{remoteUserId:remoteUserId}
    else
      # undocumented: http://goo.gl/fdVGRk
      console.log 'user exists already:', remoteUserId
      Accounts.setPassword(user._id, token)

    return
