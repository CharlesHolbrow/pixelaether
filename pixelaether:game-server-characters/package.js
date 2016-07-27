Package.describe({
  summary: 'Serve PixelAether characters',
});

Package.onUse(function(api) {
  // the default character tilesetSelector uses the
  // tileset-characters tileset which is named 'characters'.
  api.imply('pixelaether:tileset-characters');
  api.use('ecmascript');
  api.use(
    [
      'check',
      'underscore',
      'tracker',
      'coffeescript',
      'mongo',
      'random',
      'pixelaether:game-server-maps',
      'pixelaether:game-servers',
      'pixelaether:rift',
    ],
    'server'
  );
  api.export(['Characters'], 'server');
  api.addFiles(
    [
      'Characters.coffee',
      'publication.js',
      'methods.js',
      'methods.coffee',
    ],
    'server'
  );

  api.addFiles('methods-isomorphic.js');
});

Package.onTest(function(api) {
  api.use(['coffeescript', 'tinytest', 'maps', 'tilesets', 'characters-server']);
  api.export('Maps', 'client');
  api.addFiles(['test/test-characters-server.coffee'], 'server');
});
