Package.describe({
  name: 'pixelaether:tileset-elements',
  version: '0.0.1',
  summary: 'A simple pixelaether map tileset',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  documentation: 'README.md',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.addAssets('img/elements9x3.png', ['client', 'server']);
  api.use(['ecmascript', 'pixelaether:game-server-tileset-dds'], 'server');
  api.mainModule('tileset-elements.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('tileset-elements');
  api.mainModule('tileset-elements-tests.js');
});
