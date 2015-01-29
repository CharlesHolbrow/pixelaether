Meteor.methods
  # Danger! this method should not pass errors from the master server back to the client.
  # Instead, errors should be logged here, and sent back to the client as generic errors
  createAccount: (remoteUserId)->
    check remoteUserId, String
    userLoginInfo = AetherUplink.connection.call 'getUserLoginInfo', AetherUplink.name, remoteUserId
    if not userLoginInfo
      throw new Meteor.Error 'failed to get token from master server for userId: ' + remoteUserId

    if remoteUserId != userLoginInfo._id # hopefully this is superfluous
      throw new Meteor.Error 'Master server returned the wrong user'

    console.log 'received user info For:', userLoginInfo.username, 'From:', AetherUplink.url
    user = Meteor.users.findOne remoteUserId
    if not user
      console.log 'creating new user:', userLoginInfo.username, remoteUserId
      Accounts.createUser
        id: remoteUserId
        username: userLoginInfo.username
        password: userLoginInfo.password
    else
      console.log 'user exists already:', userLoginInfo.username
      if user.username != userLoginInfo.username
        # the username on the master server has changed. update local
        Meteor.users.update user._id, {username: userLoginInfo.username}
      # server side .setPassword is undocumented: http://goo.gl/fdVGRk
      Accounts.setPassword(user._id, userLoginInfo.password)

    return
