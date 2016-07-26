Package.describe({
  name: 'game-servers',
  version: '0.0.1',
  summary: 'Available on client and server for both game-servers and game-servers-master',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {

  // testOnly package replaces Meteor.settings/pixel.json
  api.use('game-servers-test-data');

  // isomorphic
  api.use(['es5-shim', 'coffeescript', 'check', 'mongo', 'random', 'urlz', 'underscore', 'ddp', 'accounts-base', 'ecmascript', 'tracker']);

  // server
  api.use('sha', 'server');
  api.addFiles('server/generate-settings.coffee', 'server');

  // isomorphic
  api.export(['serverSelectorPattern', 'GameServers'], ['server', 'client']);
  api.addFiles('game-servers-isomorphic.coffee');
  api.addFiles('game-servers-isomorphic.js');

});

Package.onTest(function(api) {
  api.use('practicalmeteor:mocha');
  api.use('hwillson:stub-collections');
  api.use('ecmascript');
  api.use('es5-shim');

  // Testing game-servers on the server not currently supported.
  // server/generate-settings.coffee causes complications when
  // running in test mode. For now, we only test on the client.
  api.use('game-servers', 'client');
  api.mainModule('./tests/game-servers.tests.js', 'client');
});