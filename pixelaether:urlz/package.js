/*------------------------------------------------------------
------------------------------------------------------------*/
Package.describe({
  name: 'pixelaether:urlz',
  summary: 'Manipulate URLs',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  version: '0.0.1',
});

Package.onUse(function(api){
  api.use('underscore', ['client', 'server']);
  api.export(['urlz'], ['client', 'server']);
  api.add_files('urlz.js', ['client', 'server']);
});

Package.onTest(function(api){
  api.use(['urlz', 'tinytest', 'test-helpers', 'underscore']);
  api.add_files('test-urlz.js', ['client', 'server']);
});
