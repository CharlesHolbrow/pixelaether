Meteor.methods

  # username refers to our client's account on the Master Server
  createAccount: (emailAddr)->
    token = AetherUplink.connection.call 'requestToken', AetherUplink.name, emailAddr
    if not token
      throw new Meteor.Error 'failed to get token from master server for user: ' + emailAddr

    console.log 'received token from', AetherUplink.url
    user = Meteor.users.findOne({'emails.address': emailAddr})
    if not user
      console.log 'creating new user:', emailAddr
      Accounts.createUser
        email: emailAddr
        password: token
    else
      # undocumented: http://goo.gl/fdVGRk
      console.log 'user exists already:', emailAddr
      Accounts.setPassword(user._id, token)

    return
