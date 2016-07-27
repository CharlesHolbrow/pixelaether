Package.describe({
  summary: 'Distributed Data Store on the server',
  name: 'pixelaether:dds-server',
  git: 'https://github.com/CharlesHolbrow/pixelaether/',
  version: '0.0.1',
});

Package.onUse(function(api){
  api.use(['pixelaether:urlz', 'random', 'check', 'ecmascript', 'es5-shim', 'pixelaether:game-servers'], 'server');
  api.export('DDS', 'server');
  api.addFiles(['dds.js'], 'server');
});
