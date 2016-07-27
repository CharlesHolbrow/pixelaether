Package.describe({
  name: 'pixelaether:game-server-players',
  version: '0.0.1',
  summary: 'Publish certain user fields by default',
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.1');
  api.use('ecmascript');
  api.use('coffeescript');
  api.mainModule('game-server-players.coffee', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('game-server-players');
  api.mainModule('game-server-players-tests.js');
});
