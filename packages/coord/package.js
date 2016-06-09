Package.describe({
  summary: 'Describe a coordinate position on an arbitrary Pixel Aether map',
});

Package.onUse(function(api){
  api.export('Coord');
  api.use('es5-shim');
  api.use('ecmascript');
  api.mainModule('Coord.js');
});
