// Note that unlike findOneForUser, this function accepts only a
// serverId as the first argument, NOT a mogodbSelector
//
// Note that this may return null. I would like it to always
// return null if the results were not found, but I do know know
// exactly how all paths resolve.
GameServers.promiseOneForUser = function(serverId, userId) {
  return new Promise((resolve, reject) => {

    if (typeof serverId !== 'string')
      reject(Error('GameServers.promiseOneForUser: serverId must be a string'));

    // First try to get the server
    let server = GameServers.findOne(serverId);
    if (server)
      return resolve(server);

    // The master Server cannot be logged in to itself, so if we
    // are on the masterServer, and we failed to get the info from
    // the GameServers collection, AND no userId was specified,
    // just assume the gameServer cannot be found
    //
    // Notice that we could reject here, but instead, we return
    // null. This behavior may be different than findOneForUser
    if (GameServers.isMasterServer() && !userId)
      return resolve(null);

    userId = userId || GameServers.masterServerConnection.userId();
    // If we still do not have a userId then our search failed
    if (!userId)
      return resolve(null);

    const users = GameServers.masterUsersCollection;
    const user  = users.findOne(userId, { fields: { devGameServersById: 1 } });

    if (user && user.devGameServersById) {
      server = user.devGameServersById[serverId];
      if (server)
        return resolve(server);
    }

    // We do not have the data immediately available. If we are
    // on the masterServer, assume the data does not exist.
    if (GameServers.isMasterServer())
      return resolve(null);

    // However, if we are not on the master server Keep trying
    // inside a reactive computation.
    const computation = Tracker.autorun((comp) => {
      let server = GameServers.findOne(serverId);
      if (server) {
        comp.stop();
        return resolve(server);
      }

      const user = users.findOne(userId, { fields: { devGameServersById: 1 } });

      if (user && user.devGameServersById) {
        server = user.devGameServersById[serverId];
        if (server) {
          comp.stop();
          return resolve(server);
        }
      }
    });

    // Give up after the timeout
    Meteor.setTimeout(() => {
      computation.stop();
      resolve(null);
    }, 5000);
  });
};
