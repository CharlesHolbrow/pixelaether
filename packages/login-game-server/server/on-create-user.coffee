# We will create all our accounts on the server
# We don't want users on the client to be able to choose their
# own ID
Accounts.config {forbidClientAccountCreation: true}

# options argument comes from Accounts.createUser method
Accounts.onCreateUser (options, user)->
  console.log 'create user options:', options
  console.log 'create user user:   ', user

  if options.profile
    user.profile = options.profile
  if options.id and typeof options.id == 'string'
    user._id = options.id

  return user

