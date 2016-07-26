Package.describe({
  summary: 'Create and serve PixelAether maps',
});

Package.onUse(function(api) {
  api.use(['mongo', 'pixelaether:dds-server', 'game-server-tilesets', 'pixelaether:urlz', 'deps', 'underscore', 'maps-isomorphic', 'mongo', 'check', 'ecmascript'], 'server');
  api.export(['MapDDS', 'Maps'], 'server');
  api.addFiles(['MapClass.js', 'MapDDS.js', 'publication.js', 'methods.js'], 'server');
});

Npm.depends({
  async: '0.9.0',
});
