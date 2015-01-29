Accounts.onCreateUser (options, user)->
  console.log 'create user options:', options
  console.log 'create user user:   ', user

  if options.profile
    user.profile = options.profile
  # AWESOME User comes with an ID, but we can create our own here.
  # user._id = ???
  return user

