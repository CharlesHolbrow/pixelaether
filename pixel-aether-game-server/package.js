Package.describe({
  summary: 'Serve a PixelAether universe',
});

Package.onUse(function(api) {
  api.use(['coffeescript',
    'pixelaether:urlz',
    'pixelaether:game-servers',
    'pixelaether:rift',
    'ongoworks:ddp-login@0.2.1',
    'tracker',
    'underscore',
    'meteor',
    'es5-shim',
    'ecmascript',
    'accounts-password',
    'ddp']);

  api.imply([
    'pixelaether:base',
    'pixelaether:map-main',
  ], 'server');

  api.mainModule('./server/launch.coffee', 'server');
});
