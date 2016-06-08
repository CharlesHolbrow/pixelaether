Package.describe({
  summary: 'Describes a location in the Pixel Aether',
});

Package.onUse(function(api){
  api.export('Addr');
  api.use('es5-shim');
  api.use('ecmascript');
  api.mainModule('Addr.js');
});
