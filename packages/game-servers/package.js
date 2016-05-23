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

  // isomorphic
  api.use(['es5-shim', 'coffeescript', 'check', 'mongo', 'random', 'urlz', 'underscore', 'ddp', 'accounts-base', 'ecmascript']);

  // server
  api.use('sha', 'server');
  api.addFiles('server/generate-settings.coffee', 'server');

  // isomorphic
  api.export(['serverSelectorPattern', 'GameServers'], ['server', 'client']);
  api.addFiles('game-servers-isomorphic.coffee');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('game-servers-isomorphic');
  api.addFiles('game-servers-isomorphic-tests.js');
});
