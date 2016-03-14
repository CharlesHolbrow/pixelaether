Package.describe({
  name: 'game-servers',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use(['underscore', 'coffeescript', 'check', 'game-servers-shared'], 'server');

  // This package exports the object originally created by the
  // game-servers-shared package.
  api.export('GameServers', 'server');
  api.addFiles([
    'server/generate-settings.coffee',
    ], 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('game-servers');
  api.addFiles('game-servers-tests.js');
});
