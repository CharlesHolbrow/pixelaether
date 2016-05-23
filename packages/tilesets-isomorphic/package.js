Package.describe({
  summary: 'Core functionality for tilesets on the server AND client'
});

Package.onUse(function(api){
  api.export(['TilesetClass']);
  api.addFiles('TilesetClass.js');
});
