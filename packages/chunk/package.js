Package.describe({
  name: 'chunk',
  version: '0.0.1',
  summary: 'Chunk helper methods',
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.1');
  api.use('ecmascript');
  api.mainModule('chunk.js');
});
