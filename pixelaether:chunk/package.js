Package.describe({
  name: 'pixelaether:chunk',
  version: '0.0.1',
  summary: 'Chunk helper methods',
  documentation: null,
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.use('ecmascript');
  api.mainModule('chunk.js');
});
