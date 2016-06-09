// Note that this may return null. I would like it to always
// return null if the results were not found, but I do know know
// exactly how all paths resolve.
GameServers.promiseOneForUser = function(selector, userId) {
  return new Promise((resolve, reject) => {

    if (typeof selector !== 'string' && typeof selector !== 'object')
      reject(Error('GameServers.promiseOneForUser: selector argument must be a string or object'));

    // First try to get the server
    let server = GameServers.findOne(selector);
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

      if (typeof selector === 'string')
        server = user.devGameServersById[selector];
      else
        server = _.findWhere(user.devGameServersById, selector);

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
      let server = GameServers.findOne(selector);
      if (server) {
        comp.stop();
        return resolve(server);
      }

      const user = users.findOne(userId, { fields: { devGameServersById: 1 } });

      if (user && user.devGameServersById) {

        // Try to find the server info on the user document.
        // Remember we don't know if the selector is a
        // string or an object selector.
        if (typeof selector === 'string')
          server = user.devGameServersById[selector];
        else
          server = _(user.devGameServersById).findWhere(selector);

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
