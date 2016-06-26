Package.describe({
  summary: 'Serve a PixelAether universe'
});

Package.onUse(function(api){
  api.use(['coffeescript',
    'urlz',
    'tracker',
    'underscore',
    'meteor',
    'ongoworks:ddp-login@0.2.1',
    'es5-shim',
    'ecmascript',
    'game-servers',
    'rift',
    'accounts-password',
    'ddp']);

  api.imply([
    'accounts-password',
    'game-server-maps',
    'game-server-characters',
    'game-server-tilesets',
    'rift',
    'coord',
  ], 'server');

  api.mainModule('./server/launch.coffee', 'server');
});
