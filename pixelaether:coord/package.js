Package.describe({
  name: 'pixelaether:coord',
  summary: 'Describe a coordinate position on an arbitrary Pixel Aether map',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.export('Coord');
  api.export('ReactiveCoord');
  api.use('es5-shim');
  api.use('ecmascript');
  api.mainModule('./index.js');
});
