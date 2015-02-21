Package.describe({
  summary: 'Describes a location in the Pixel Aether',
});

Package.onUse(function(api){
  api.export('Addr', ['client']);
  api.addFiles('client/Addr.js', 'client');
});
