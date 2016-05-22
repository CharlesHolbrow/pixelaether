Package.describe({
  name: 'login-game-server',
  summary: 'coordinate logins with master server',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.imply('game-servers', 'server');
  api.use(['accounts-password', 'coffeescript'], ['client', 'server']);
  api.use(
    [
      'underscore',
      'ddp',
      'urlz',
      'check',
      'mongo',
      'random',
      'game-servers',
      'rift',
      'ongoworks:ddp-login@0.2.1'
    ],
    'server'
  );
  api.export(['AetherUplink', 'GameServers'], 'server');
  api.addFiles([
    'server/aether-uplink.coffee',
    'server/game-server-accounts.coffee',
    ], 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('login-game-server');
  api.addFiles('login-game-server-tests.js');
});
