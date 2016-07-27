Package.describe({
  summary: 'Metadata for a Tileset hosted on a server',
});

Package.onUse(function(api){
  api.imply('pixelaether:tilesets-isomorphic');

  api.use('ecmascript', 'server');
  api.use('pixelaether:tilesets-isomorphic', 'server');
  api.use('pixelaether:dds-server', 'server');

  api.export('TilesetDDS', 'server');
  api.addFiles('TilesetDDS.js', 'server');
});
