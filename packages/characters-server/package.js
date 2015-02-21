Package.describe({
  summary: 'Serve PixelAether characters'
});

Package.onUse(function(api){
  api.use(
    [
      'check',
      'underscore',
      'tracker',
      'coffeescript',
      'mongo',
      'random',
      'maps-server',
      'game-servers',
      'rift'
    ],
    'server'
  );
  api.imply(['characters-shared'], 'server');
  api.export(['Characters'], 'server');
  api.addFiles(
    [
      'Characters.coffee',
      'publication.js',
      'methods.js',
      'methods.coffee'
    ],
    'server'
  );
});

Package.onTest(function(api){
  api.use(['coffeescript', 'tinytest', 'maps', 'tilesets', 'characters-server']);
  api.export('Maps', 'client');
  api.addFiles(['test/test-characters-server.coffee'], 'server');
});
