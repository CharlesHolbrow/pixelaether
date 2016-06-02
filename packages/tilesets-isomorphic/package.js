Package.describe({
  summary: 'Core functionality for tilesets on the server AND client'
});

Package.onUse(function(api){
  api.use(['ecmascript', 'es5-shim']);
  api.export(['TilesetClass']);
  api.addFiles('TilesetClass.js');
});
