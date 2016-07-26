Package.describe({
  name: 'pixel-aether',
  version: '0.0.1',
  summary: 'Aggregates pixel-aether exports',
  git: '',
  documentation: 'README.md',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('ecmascript');
  api.use('chunk');
  api.use('coord');
  api.use('dds-server');
  api.use('game-server-characters');
  api.use('game-server-maps');
  api.use('game-server-maps');
  api.use('game-server-players');
  api.use('game-server-tilesets');
  api.use('game-servers');
  api.use('rift');
  api.use('rift');
  api.use('time-of-day');
  api.mainModule('server.js', 'server');
  api.mainModule('client.js', 'client');
});









