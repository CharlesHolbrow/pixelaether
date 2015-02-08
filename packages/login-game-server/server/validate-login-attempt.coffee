Accounts.validateLoginAttempt (attemptInfo)->
  if attemptInfo.allowed then return true
  # We generate this custom error, to tell the client to call
  # the createAccount method
  throw new Meteor.Error 'CALL CREATE ACCOUNT'
