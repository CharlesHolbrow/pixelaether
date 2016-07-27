Package.describe({
  name: 'pixelaether:game-server',
  summary: 'Serve a PixelAether universe',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  version: '0.0.1',
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

  api.imply('pixelaether:base', 'server');
  api.imply('pixelaether:map-main', ['client', 'server']);

  api.mainModule('./server/launch.coffee', 'server');
});
