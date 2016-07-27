Package.describe({
  name: 'pixelaether:map-main',
  version: '0.0.1',
  summary: 'A default map',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('ecmascript');

  // We have to imply the tileset dependency so that the tileset
  // image will be accessible via url.
  api.imply('pixelaether:tileset-elements', ['server', 'client']);

  api.use('pixelaether:tileset-elements', 'server');
  api.use('pixelaether:game-server-maps', 'server');

  api.mainModule('map-main.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('pixelaether:map-main');
  api.mainModule('map-main-tests.js');
});
