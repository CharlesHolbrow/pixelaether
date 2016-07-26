/*------------------------------------------------------------
------------------------------------------------------------*/
Package.describe({
  summary: 'Manage Connections to Multiple DDP Servers',
});

Package.on_use(function(api){
  api.use('accounts-base', ['client', 'server'], {weak:true});
  api.use([
    'ecmascript',
    'es5-shim',
    'meteor',
    'reactive-var',
    'tracker',
    'pixelaether:urlz',
    'underscore',
    'mongo',
    'ddp',
    'game-servers'
  ]);
  api.export(['Rift', 'AetherRift']);
  api.addFiles(['Portal.js', 'Rift.js', 'AetherRift.js']);
});

