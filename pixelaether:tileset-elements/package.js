Package.describe({
  name: 'pixelaether:tileset-elements',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
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
