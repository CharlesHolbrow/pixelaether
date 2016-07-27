Package.describe({
  summary: 'Core functionality for Map functionality shared by server AND client',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  name: 'pixelaether:maps-isomorphic',
  version: '0.0.1',
});

Package.onUse(function(api){
  api.use(['check', 'ecmascript', 'es5-shim', 'pixelaether:coord']);
  api.export('MapClass');
  api.addFiles(['MapClass.js']);
});
