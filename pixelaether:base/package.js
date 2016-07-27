Package.describe({
  name: 'pixelaether:base',
  version: '0.0.1',
  summary: 'Aggregates pixel-aether exports',
  git: '',
  documentation: 'README.md',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('ecmascript');

  api.imply('accounts-password', 'server');

  api.imply('pixelaether:chunk');
  api.imply('pixelaether:coord');
  api.imply('pixelaether:urlz');
  api.imply('pixelaether:game-servers');
  api.imply('pixelaether:dds-server');
  api.imply('pixelaether:time-of-day');
  api.imply('pixelaether:rift');
  api.imply('pixelaether:game-server-characters');
  api.imply('pixelaether:game-server-maps');
  api.imply('pixelaether:maps-isomorphic');
  api.imply('pixelaether:tilesets-isomorphic');
  api.imply('pixelaether:game-server-tileset-dds');
  api.imply('pixelaether:game-server-players');
});









