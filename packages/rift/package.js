/*------------------------------------------------------------
------------------------------------------------------------*/
Package.describe({
  summary: 'Manage Connections to Multiple DDP Servers',
  internal: false
});

Package.on_use(function(api){
  api.use('accounts-base', ['client', 'server'], {weak:true})
  api.use(['ecmascript', 'es5-shim', 'meteor', 'reactive-var', 'tracker', 'urlz', 'underscore', 'mongo', 'polyfills', 'ddp']);
  api.export(['Rift', 'AetherRift']);
  api.addFiles(['Portal.js', 'Rift.js', 'AetherRift.js']);
});

