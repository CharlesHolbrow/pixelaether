Package.describe({
  summary: 'Serve a PixelAether universe',
});

Package.onUse(function(api) {
  api.use(['coffeescript',
    'pixelaether:urlz',
    'tracker',
    'underscore',
    'meteor',
    'ongoworks:ddp-login@0.2.1',
    'es5-shim',
    'ecmascript',
    'pixelaether:game-servers',
    'rift',
    'accounts-password',
    'ddp']);

  api.imply([
    'accounts-password',
    'game-server-maps',
    'game-server-characters',
    'game-server-tilesets',
    'game-server-players',
    'rift',
    'map-main',
    'coord',
    'time-of-day',
  ], 'server');

  api.mainModule('./server/launch.coffee', 'server');
});
