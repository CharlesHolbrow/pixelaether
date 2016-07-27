Package.describe({
  summary: 'Metadata for a Tileset hosted on a server',
  name: 'pixelaether:game-server-tileset-dds',
  version: '0.0.1',
});

Package.onUse(function(api){
  api.imply('pixelaether:tilesets-isomorphic');

  api.use('ecmascript', 'server');
  api.use('pixelaether:tilesets-isomorphic', 'server');
  api.use('pixelaether:dds-server', 'server');

  api.export('TilesetDDS', 'server');
  api.addFiles('TilesetDDS.js', 'server');
});
