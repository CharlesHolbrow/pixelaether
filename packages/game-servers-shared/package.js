Package.describe({
  name: 'game-servers-shared',
  version: '0.0.1',
  summary: 'Available on client and server for both game-servers and game-servers-master',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use(['es5-shim', 'coffeescript', 'check', 'mongo', 'random', 'urlz', 'underscore', 'ddp', 'accounts-base']);
  api.export(['serverSelectorPattern', 'GameServers'], ['server', 'client']);
  api.export('throwMissingSettingsError', 'server');
  api.addFiles('game-servers-shared.coffee');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('game-servers-shared');
  api.addFiles('game-servers-shared-tests.js');
});
