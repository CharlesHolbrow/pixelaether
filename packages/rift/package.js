/*------------------------------------------------------------
------------------------------------------------------------*/
Package.describe({
  summary: 'Manage Connections to Multiple DDP Servers',
  internal: false
});

Package.on_use(function(api){
  api.use('meteor');
  api.use(['deps', 'urlz', 'underscore', 'mongo', 'polyfills', 'ddp']);
  api.export('Rift');
  api.addFiles(['Portal.js', 'Rift.js']);
});

