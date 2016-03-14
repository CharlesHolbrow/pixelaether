Package.describe({
  name: 'aether-rift',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: "Rift for accessing multiple game servers by serverId. Runs on master server, game servers, and master's client.",
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use(['rift', 'game-servers', 'coffeescript'], ['client', 'server']);
  api.addFiles('aether-rift.coffee');
  api.export()
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('aether-rift');
  api.addFiles('aether-rift-tests.js');
});
