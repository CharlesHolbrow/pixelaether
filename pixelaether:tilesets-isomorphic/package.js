Package.describe({
  name: 'pixelaether:tilesets-isomorphic',
  summary: 'Core functionality for tilesets on the server AND client',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  version: '0.0.1',
});

Package.onUse(function(api){
  api.use(['ecmascript', 'es5-shim']);
  api.export(['TilesetClass']);
  api.addFiles('TilesetClass.js');
});
