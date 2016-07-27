Package.describe({
  summary: 'Create and serve PixelAether maps',
  name: 'pixelaether:game-server-maps',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  version: '0.0.1',
});

Package.onUse(function(api) {
  api.use('pixelaether:dds-server', 'server');
  api.use('pixelaether:maps-isomorphic', 'server');
  api.use('pixelaether:urlz', 'server');
  api.use('pixelaether:game-server-tileset-dds', 'server');
  api.use('deps', 'server');
  api.use('underscore', 'server');
  api.use('mongo', 'server');
  api.use('check', 'server');
  api.use('ecmascript', 'server');

  api.export(['MapDDS', 'Maps'], 'server');
  api.addFiles(['MapClass.js', 'MapDDS.js', 'publication.js', 'methods.js'], 'server');
});

Npm.depends({
  async: '0.9.0',
});
