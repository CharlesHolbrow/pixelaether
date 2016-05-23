Package.describe({
  summary: 'Metadata for a Tileset hosted on a server',
});

Package.onUse(function(api){
  api.imply(['tilesets-shared']);
  api.use(['tilesets-shared', 'dds-server'],'server');
  api.export('TilesetDDS', 'server');
  api.addFiles('TilesetDDS.js', 'server');
});
