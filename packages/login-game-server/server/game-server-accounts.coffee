Meteor.methods
  # The Client calls this method when she wants to login, but does not have a password
  # for this server. Tell the master server to create a password for that user, and push
  # that password to the user.
  createAccount: (remoteUserId)->
    check remoteUserId, String
    # get user info from the master server
    userLoginInfo = AetherUplink.connection.call 'getUserLoginInfo', AetherUplink.name, remoteUserId
    if not userLoginInfo
      throw new Meteor.Error 'failed to get token from master server for userId: ' + remoteUserId

    if remoteUserId != userLoginInfo._id # hopefully this is superfluous
      throw new Meteor.Error 'Master server returned the wrong user'

    console.log 'Received user info for:', userLoginInfo.username, 'from:', AetherUplink.url
    user = Meteor.users.findOne remoteUserId
    if not user
      console.log 'Creating new user:', userLoginInfo.username, remoteUserId
      Accounts.createUser
        id: remoteUserId
        username: userLoginInfo.username
        password: userLoginInfo.password
    else
      console.log 'User exists already:', userLoginInfo.username
      if user.username != userLoginInfo.username
        # the username on the master server has changed. update local
        Meteor.users.update user._id, {username: userLoginInfo.username}
      # server side .setPassword is undocumented: http://goo.gl/fdVGRk
      Accounts.setPassword(user._id, userLoginInfo.password)

    return

  isLoggedIn: ->
    !!@userId
