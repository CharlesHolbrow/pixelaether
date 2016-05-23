Package.describe({
  summary: 'Core functionality for Map functionality shared by server AND client',
});

Package.onUse(function(api){
  api.use('check');
  api.export('MapClass');
  api.addFiles(['MapClass.js']);
});
