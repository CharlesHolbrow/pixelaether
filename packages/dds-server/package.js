Package.describe({
  summary: 'Distributed Data Store on the server'
});

Package.onUse(function(api){
  api.use(['mongo', 'urlz', 'random', 'check', 'polyfills'], 'server');
  api.export('DDS', 'server');
  api.addFiles(['dds.js'], 'server');
});
