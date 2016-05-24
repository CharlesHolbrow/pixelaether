Package.describe({
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
  api.use('ecmascript');

  // We have to use the tileset dependency so that we gaurantee
  // that we call TilesetDDS.add() before calling MapDDS.add()
  api.use(['tileset-basic', 'game-server-maps'], 'server');

  // we have to imply the tileset dependency so that the tileset
  // image will be accessible via url.
  api.imply('tileset-basic', ['server', 'client']); 
  api.mainModule('map-forest.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('map-forest');
  api.mainModule('map-forest-tests.js');
});
