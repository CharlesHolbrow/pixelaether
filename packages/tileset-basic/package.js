Package.describe({
  name: 'tileset-basic',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use(['ecmascript', 'es5-shim', 'game-server-tilesets'], 'server');
  api.addAssets('img/characters5x1.png', ['client', 'server']);
  api.addAssets('img/elements9x3.png', ['client', 'server']);
  api.mainModule('tileset-basic.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('tileset-basic');
  api.mainModule('tileset-basic-tests.js');
});
