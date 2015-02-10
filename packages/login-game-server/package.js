Package.describe({
  name: 'login-game-server',
  summary: 'coordinate logins with master server',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.use(['accounts-password', 'coffeescript'], ['client', 'server']);
  api.use(['underscore', 'ddp', 'urlz', 'check', 'mongo', 'random', 'game-servers'], 'server');
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
