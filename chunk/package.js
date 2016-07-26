Package.describe({
  name: 'pixelaether:chunk',
  version: '0.0.1',
  summary: 'Chunk helper methods',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('ecmascript');
  api.mainModule('chunk.js');
});
